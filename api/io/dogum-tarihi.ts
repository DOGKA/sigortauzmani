/**
 * Kimlik adımında doğum tarihinin otomatik alınıp alınamayacağını söyler:
 * POST /api/io/dogum-tarihi.
 *
 * Tarihin kendisi bilinçli olarak dönmüyor; yanıt yalnızca `{ bulundu }`.
 * Tarih TRAMER ve teklif isteklerinde sunucuda yeniden okunup gövdeye
 * ekleniyor (bkz. `_shared/dogumTarihi.ts`). Bulunamazsa arayüz doğum
 * tarihi alanını açıyor.
 *
 * Sorgu yalnızca telefonu bu oturumda SMS koduyla doğrulanmış ziyaretçiye
 * açık; doğrulamasız ürünlerde hiç çalışmıyor.
 */

import { jsonResponse } from "../_shared/io";
import { rateCheck } from "../_shared/iolog";
import { clientIp, hashIp, resolveSession, withCookie } from "../_shared/session";
import { DOGRULANMAMIS_TELEFON, telefonDogrulandi } from "../_shared/sms";
import { dogumTarihiSorgula, sorgulanabilirKimlik } from "../_shared/dogumTarihi";
import { smsDogrulamaGerekli } from "../../src/data/smsDogrulama";

export const config = { runtime: "edge" };

/** mernis / tramer / teklif IP tavanıyla aynı. */
const MAX_SORGU_PER_HOUR = 200;

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Yöntem desteklenmiyor." }, 405);
  }

  const session = await resolveSession(request);
  const yanit = (body: unknown, status = 200) =>
    withCookie(jsonResponse(body, status), session);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return yanit({ error: "Geçersiz istek." }, 400);
  }

  const productSlug = typeof body.productSlug === "string" ? body.productSlug : "";
  const kimlikNo = sorgulanabilirKimlik(body.kimlikNo);
  if (!kimlikNo || !smsDogrulamaGerekli(productSlug)) {
    return yanit({ bulundu: false });
  }

  if (!(await telefonDogrulandi(session.id, body.phone))) {
    return yanit({ error: DOGRULANMAMIS_TELEFON, telefonDogrulama: true }, 403);
  }

  const ipHash = await hashIp(clientIp(request));
  if (!(await rateCheck(ipHash, "dogumtarihi", MAX_SORGU_PER_HOUR, 3600))) {
    return yanit(
      { error: "Çok fazla deneme yaptınız. Lütfen biraz sonra tekrar deneyin." },
      429,
    );
  }

  const tarih = await dogumTarihiSorgula(session.id, kimlikNo);
  return yanit({ bulundu: tarih !== null });
}
