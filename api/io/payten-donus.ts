/**
 * Payten Auth3D dönüşü: POST /api/io/payten-donus.
 *
 * Banka ekranından sonra tarayıcı (ödeme penceresindeki iframe) buraya
 * gönderiliyor. İstek başka siteden geldiği için oturum çerezi taşımıyor;
 * kayıt yalnızca sunucunun açtığı ve tahmin edilemeyen `sessionToken` ile
 * bulunuyor.
 *
 * Dönüş imzasız: `mdStatus` ve `auth3DToken` tarayıcıda değiştirilebilir.
 * Bu yüzden doğrulama sayılması için sunucunun aynı token'la yaptığı
 * PREAUTH'un Payten tarafından onaylanması şart. Provizyon hemen iptal
 * ediliyor; prim daha sonra IO üzerinden çekiliyor.
 *
 * Yanıt, sonucu üst pencereye `postMessage` ile ileten küçük bir sayfa.
 */

import { dbRequest } from "../_shared/iolog";
import { paytenIptal, paytenOnProvizyon } from "../_shared/payten";

export const config = { runtime: "edge" };

interface DogrulamaKaydi {
  merchant_payment_id: string;
  session_token: string;
}

type Durum = "dogrulandi" | "basarisiz";

function alan(params: URLSearchParams, ad: string): string {
  const aranan = ad.toLowerCase();
  for (const [anahtar, deger] of params) {
    if (anahtar.toLowerCase() === aranan) return deger.trim();
  }
  return "";
}

function sayfa(dogrulamaId: string | null, durum: Durum, mesaj: string | null): Response {
  const veri = JSON.stringify({ kaynak: "payten", dogrulamaId, durum, mesaj }).replace(
    /</g,
    "\\u003c",
  );
  const metin =
    durum === "dogrulandi"
      ? "Kart doğrulandı, ödemeniz tamamlanıyor…"
      : "Kart doğrulanamadı. Ödeme ekranına dönüp tekrar deneyebilirsiniz.";
  const html = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kart doğrulama</title>
<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:90vh;margin:0;color:#1f2937;text-align:center;padding:16px}</style>
</head><body><p>${metin}</p>
<script>
(function () {
  var veri = ${veri};
  var hedef = window.parent !== window ? window.parent : window.opener;
  if (hedef) hedef.postMessage(veri, window.location.origin);
})();
</script></body></html>`;
  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "referrer-policy": "no-referrer",
    },
  });
}

async function guncelle(
  sessionToken: string,
  oncekiDurum: string,
  patch: Record<string, unknown>,
): Promise<DogrulamaKaydi | null> {
  const rows = await dbRequest<DogrulamaKaydi[]>(
    `payten_dogrulamalar?session_token=eq.${encodeURIComponent(sessionToken)}` +
      `&status=eq.${oncekiDurum}&select=merchant_payment_id,session_token`,
    { method: "PATCH", body: patch, prefer: "return=representation" },
  );
  return rows?.[0] ?? null;
}

export default async function handler(request: Request): Promise<Response> {
  let params: URLSearchParams;
  if (request.method === "POST") {
    params = new URLSearchParams(await request.text());
  } else if (request.method === "GET") {
    params = new URL(request.url).searchParams;
  } else {
    return new Response("Yöntem desteklenmiyor.", { status: 405 });
  }

  const sessionToken = alan(params, "sessionToken");
  if (!sessionToken) return sayfa(null, "basarisiz", "Doğrulama bilgisi eksik.");

  // Kilit: aynı dönüş iki kez gelirse ikinci istek kaydı bulamaz ve ikinci
  // bir provizyon alınmaz.
  const kayit = await guncelle(sessionToken, "bekliyor", { status: "isleniyor" });
  if (!kayit) return sayfa(null, "basarisiz", "Doğrulama kaydı bulunamadı ya da zaten işlendi.");
  const dogrulamaId = kayit.merchant_payment_id;

  const responseCode = alan(params, "responseCode");
  const mdStatus = alan(params, "mdStatus");
  const auth3dToken = alan(params, "auth3DToken");

  // Yalnızca tam doğrulama (mdStatus 1) kabul ediliyor; yarım doğrulamada
  // bankaya kayıtlı telefona şifre gitmemiş olabilir.
  if (responseCode !== "00" || mdStatus !== "1" || !auth3dToken) {
    const mesaj =
      alan(params, "mdErrorMsg") ||
      alan(params, "errorMsg") ||
      alan(params, "responseMsg") ||
      "3D doğrulama tamamlanmadı.";
    await guncelle(sessionToken, "isleniyor", {
      status: "basarisiz",
      md_status: mdStatus || null,
      hata_mesaji: mesaj.slice(0, 500),
    });
    return sayfa(dogrulamaId, "basarisiz", mesaj);
  }

  const provizyon = await paytenOnProvizyon({ sessionToken, auth3dToken });
  if (!provizyon.ok) {
    await guncelle(sessionToken, "isleniyor", {
      status: "basarisiz",
      md_status: mdStatus,
      hata_mesaji: provizyon.mesaj.slice(0, 500),
    });
    return sayfa(dogrulamaId, "basarisiz", provizyon.mesaj);
  }

  const pgTranId = String(provizyon.data.pgTranId ?? provizyon.data.pgTranid ?? "");
  const iptal = pgTranId ? await paytenIptal(pgTranId) : null;
  if (!iptal?.ok) {
    // Doğrulama geçerli; yalnızca provizyon kartta kalıyor. Ekip Payten
    // panelinden elle iptal etmeli, kayıtta `iptal_edildi = false` görünür.
    console.error("[payten] ön provizyon iptal edilemedi", dogrulamaId, iptal?.mesaj ?? "pgTranId yok");
  }

  const bin = String(provizyon.data.cardBin ?? "").replace(/\D/g, "");
  const son4 = String(provizyon.data.panLast4 ?? "").replace(/\D/g, "");
  await guncelle(sessionToken, "isleniyor", {
    status: "dogrulandi",
    md_status: mdStatus,
    kart_bin: /^\d{6,8}$/.test(bin) ? bin : null,
    kart_son4: /^\d{4}$/.test(son4) ? son4 : null,
    pg_tran_id: pgTranId || null,
    iptal_edildi: iptal?.ok === true,
  });

  return sayfa(dogrulamaId, "dogrulandi", null);
}
