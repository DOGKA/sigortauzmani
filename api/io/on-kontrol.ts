/**
 * Ödeme öncesi kontrol: POST /api/io/on-kontrol.
 *
 * "Satın al"a basıldığında, kart ekranı açılmadan önce çağrılır. Teklif
 * satırı şirkette yenilenir (`api/_shared/yenile.ts`) ve sonuca göre
 * arayüz ya kart ekranına geçer, ya yeni tutarı onaylatır, ya da kart
 * ekranı yerine ayrı bir uyarıyla "Teklif iste" yolunu gösterir.
 *
 * Ödemenin kendisi aynı yenilemeyi yeniden yapıyor; buradaki sonuç
 * yalnızca arayüzü yönlendirir, `satinal` buna güvenmez.
 */

import { jsonResponse } from "../_shared/io";
import {
  findOturum,
  oturumTeklifIdleri,
  rateCheck,
  updateOturum,
} from "../_shared/iolog";
import { clientIp, hashIp, resolveSession, withCookie } from "../_shared/session";
import {
  YENILEME_DOGRULANAMADI,
  teklifiYenile,
  type YenilenecekTeklif,
} from "../_shared/yenile";
import { satinAlinabilirSirket } from "../../src/lib/io/satinAlFiltre";
import {
  normalizeSirketKodu,
  sirketAdi,
  sirketGizli,
} from "../../src/lib/io/sirketler";

export const config = { runtime: "edge" };

const MAX_KONTROL_PER_OTURUM = 20;
const OTURUM_WINDOW_SECONDS = 15 * 60;
const MAX_KONTROL_PER_HOUR = 120;

interface RequestBody {
  oturumId?: string;
  bransNo?: number;
  teklifId?: number;
  teklif?: YenilenecekTeklif & { SirketKodu?: string | number };
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Yöntem desteklenmiyor." }, 405);
  }

  const session = await resolveSession(request);
  const ipHash = await hashIp(clientIp(request));

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return withCookie(jsonResponse({ error: "Geçersiz istek." }, 400), session);
  }

  const { oturumId, teklif } = body;
  const bransNo = Number(body.bransNo);
  const teklifId = Number(body.teklifId);

  if (!oturumId || !teklif || !Number.isFinite(bransNo) || !Number.isFinite(teklifId)) {
    return withCookie(jsonResponse({ error: "Eksik teklif bilgisi." }, 400), session);
  }

  const oturum = await findOturum(oturumId, session.id);
  if (!oturum) {
    return withCookie(
      jsonResponse({ error: "Teklif oturumu bulunamadı. Lütfen yeniden teklif alın." }, 404),
      session,
    );
  }

  const teklifIdleri = await oturumTeklifIdleri(oturumId, session.id);
  if (!teklifIdleri.includes(teklifId)) {
    return withCookie(
      jsonResponse({ error: "Bu teklif bu oturuma ait değil." }, 403),
      session,
    );
  }

  const oturumAllowed = await rateCheck(
    `on-kontrol:${session.id}:${oturum.id}`,
    "on_kontrol_oturum",
    MAX_KONTROL_PER_OTURUM,
    OTURUM_WINDOW_SECONDS,
  );
  const allowed =
    oturumAllowed &&
    (await rateCheck(ipHash, "on_kontrol", MAX_KONTROL_PER_HOUR, 3600));
  if (!allowed) {
    return withCookie(
      jsonResponse(
        { error: "Kısa sürede çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin." },
        429,
      ),
      session,
    );
  }

  const sirketKodu = normalizeSirketKodu(teklif.SirketKodu);
  const kisaSureli = oturum.product_slug === "kisa-sureli-trafik";
  if (sirketGizli(sirketKodu) || !satinAlinabilirSirket(bransNo, sirketKodu, kisaSureli)) {
    return withCookie(
      jsonResponse({
        durum: "kapali",
        mesaj: "Bu teklif anında satın alınamıyor. Ekibimiz sizinle iletişime geçecek.",
      }),
      session,
    );
  }

  const yenilenen = await teklifiYenile(bransNo, teklifId, teklif, sirketKodu);

  if (yenilenen.durum !== "acik") {
    const mesaj =
      yenilenen.durum === "kapali"
        ? yenilenen.mesaj
        : yenilenen.ozet.mesaj ?? YENILEME_DOGRULANAMADI;
    await updateOturum(oturum.id, {
      hata_mesaji: `Ödeme ön kontrolü (${sirketAdi(sirketKodu)}): ${mesaj} ${JSON.stringify(yenilenen.ozet)}`.slice(0, 1000),
    });
    return withCookie(jsonResponse({ durum: "kapali", mesaj }), session);
  }

  const gosterilen = Number(teklif.Prim);
  if (Number.isFinite(gosterilen) && Math.abs(yenilenen.prim - gosterilen) > 0.01) {
    return withCookie(
      jsonResponse({ durum: "primDegisti", eskiPrim: gosterilen, yeniPrim: yenilenen.prim }),
      session,
    );
  }

  return withCookie(jsonResponse({ durum: "acik", prim: yenilenen.prim }), session);
}
