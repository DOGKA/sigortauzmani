/**
 * Payten 3D doğrulamasını başlatır: POST /api/io/payten-baslat.
 *
 * Kart bilgisi bu uca hiç gelmez. Uç yalnızca Payten'de ödeme oturumu açar
 * ve kaydı yazar; tarayıcı kartı dönen adrese doğrudan gönderir.
 * Akışın tamamı `api/_shared/payten.ts` başında anlatılıyor.
 *
 * Payten kapalıyken `{ kapali: true }` döner; istemci eski akışla
 * (doğrudan IO satın alma) devam eder.
 */

import { jsonResponse } from "../_shared/io";
import { dbInsert, dbRequest, findOturum, oturumTeklifIdleri, rateCheck } from "../_shared/iolog";
import {
  paytenAuth3dAdresi,
  paytenDogrulamaTutari,
  paytenDonusAdresi,
  paytenEnabled,
  paytenOturumAc,
  yeniOdemeKimligi,
} from "../_shared/payten";
import { clientIp, hashIp, resolveSession, withCookie } from "../_shared/session";
import { satinAlinabilirSirket } from "../../src/lib/io/satinAlFiltre";
import { normalizeSirketKodu, sirketGizli } from "../../src/lib/io/sirketler";

export const config = { runtime: "edge" };

/** Her denemede yeniden 3D yapılıyor; satın almadaki sayaçla aynı tavan. */
const MAX_BASLAT_PER_OTURUM = 10;
const OTURUM_WINDOW_SECONDS = 15 * 60;
const MAX_BASLAT_PER_HOUR = 100;

interface RequestBody {
  oturumId?: string;
  bransNo?: number;
  teklifId?: number;
  teklif?: { Id?: number; SirketKodu?: string | number; Prim?: number };
  onaylananPrim?: number;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Yöntem desteklenmiyor." }, 405);
  }

  const session = await resolveSession(request);
  const yanit = (body: unknown, status = 200) =>
    withCookie(jsonResponse(body, status), session);

  if (!paytenEnabled()) return yanit({ kapali: true });

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return yanit({ error: "Geçersiz istek." }, 400);
  }

  const bransNo = Number(body.bransNo);
  const teklifId = Number(body.teklifId);
  if (!body.oturumId || !body.teklif || !Number.isFinite(bransNo) || !Number.isFinite(teklifId)) {
    return yanit({ error: "Eksik ödeme bilgisi." }, 400);
  }

  const oturum = await findOturum(body.oturumId, session.id);
  if (!oturum) {
    return yanit({ error: "Teklif oturumu bulunamadı. Lütfen yeniden teklif alın." }, 404);
  }
  const teklifIdleri = await oturumTeklifIdleri(body.oturumId, session.id);
  if (!teklifIdleri.includes(teklifId)) {
    return yanit({ error: "Bu teklif bu oturuma ait değil." }, 403);
  }

  const oturumAllowed = await rateCheck(
    `payten:${session.id}:${oturum.id}`,
    "payten_oturum",
    MAX_BASLAT_PER_OTURUM,
    OTURUM_WINDOW_SECONDS,
  );
  const ipAllowed =
    oturumAllowed &&
    (await rateCheck(await hashIp(clientIp(request)), "payten_baslat", MAX_BASLAT_PER_HOUR, 3600));
  if (!oturumAllowed || !ipAllowed) {
    return yanit(
      {
        error:
          "Bu teklif için kısa sürede çok fazla ödeme denemesi yapıldı. Lütfen birkaç dakika sonra tekrar deneyin ya da bizi arayın.",
      },
      429,
    );
  }

  const sirketKodu = normalizeSirketKodu(body.teklif.SirketKodu);
  const kisaSureli = oturum.product_slug === "kisa-sureli-trafik";
  if (sirketGizli(sirketKodu) || !satinAlinabilirSirket(bransNo, sirketKodu, kisaSureli)) {
    return yanit(
      { error: "Bu teklif anında satın alınamıyor. Ekibimiz sizinle iletişime geçecek." },
      403,
    );
  }

  // Tutar istemciden geliyor; satın alma doğrulanan tutarı şirketin güncel
  // primiyle karşılaştırdığı için burada yanlış tutar kart çekimine yol açmaz.
  const onaylanan = Number(body.onaylananPrim);
  const prim = Number.isFinite(onaylanan) && onaylanan > 0 ? onaylanan : Number(body.teklif.Prim);
  if (!Number.isFinite(prim) || prim <= 0) {
    return yanit({ error: "Ödenecek tutar okunamadı." }, 400);
  }
  const tutar = paytenDogrulamaTutari(prim);

  const [kisi] =
    (await dbRequest<{ ad_soyad: string | null; phone: string | null }[]>(
      `teklif_oturumlari?id=eq.${encodeURIComponent(oturum.id)}&select=ad_soyad,phone&limit=1`,
      { method: "GET" },
    )) ?? [];

  const merchantPaymentId = yeniOdemeKimligi();
  const acilis = await paytenOturumAc({
    merchantPaymentId,
    tutar,
    musteriKimligi: oturum.id,
    musteriAdi: kisi?.ad_soyad?.trim() || "Sigorta Uzmani Musterisi",
    musteriTelefonu: kisi?.phone?.replace(/\D/g, "") || null,
    musteriIp: clientIp(request),
    donusAdresi: paytenDonusAdresi(request),
  });
  const sessionToken = acilis.ok ? acilis.data.sessionToken : undefined;
  if (!acilis.ok || !sessionToken) {
    return yanit(
      { error: acilis.ok ? "Ödeme oturumu açılamadı." : acilis.mesaj },
      502,
    );
  }

  const kayit = await dbInsert("payten_dogrulamalar", {
    merchant_payment_id: merchantPaymentId,
    session_token: sessionToken,
    oturum_id: oturum.id,
    session_id: session.id,
    brans_no: bransNo,
    teklif_id: teklifId,
    sirket_kodu: sirketKodu,
    tutar,
  });
  if (!kayit.ok) {
    return yanit({ error: "Ödeme doğrulaması başlatılamadı. Lütfen tekrar deneyin." }, 500);
  }

  return yanit({
    dogrulamaId: merchantPaymentId,
    formAdresi: paytenAuth3dAdresi(sessionToken),
    donusAdresi: paytenDonusAdresi(request),
    tutar,
  });
}
