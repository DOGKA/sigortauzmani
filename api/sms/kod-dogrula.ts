/**
 * Telefon doğrulama kodunu kontrol eder: POST /api/sms/kod-dogrula
 * { phone, kod }.
 *
 * Yalnızca bu oturumun bu numara için aldığı son kod geçerli. Yanlış
 * denemeler kayıtta sayılıyor; tavan dolunca kod kullanılamaz hâle geliyor
 * ve yeni kod istenmesi gerekiyor. Altı haneli kodda beş deneme tahmin
 * şansını 1/200.000'e indiriyor.
 */

import { SMS_KOD_UZUNLUGU, SMS_MAX_DENEME } from "../../src/data/smsDogrulama";
import { jsonResponse } from "../_shared/io";
import {
  kodGuncelle,
  kodOzeti,
  normalizeTelefon,
  smsDogrulamaAcik,
  sonKod,
} from "../_shared/sms";
import { resolveSession, safeEqual, withCookie } from "../_shared/session";

export const config = { runtime: "edge" };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Yöntem desteklenmiyor." }, 405);
  }

  const session = await resolveSession(request);
  const yanit = (body: unknown, status = 200) =>
    withCookie(jsonResponse(body, status), session);

  if (!smsDogrulamaAcik()) return yanit({ dogrulandi: true });

  let body: { phone?: unknown; kod?: unknown };
  try {
    body = (await request.json()) as { phone?: unknown; kod?: unknown };
  } catch {
    return yanit({ error: "Geçersiz istek." }, 400);
  }

  const telefon = normalizeTelefon(body.phone);
  const kod = String(body.kod ?? "").replace(/\D/g, "");
  if (!telefon || kod.length !== SMS_KOD_UZUNLUGU) {
    return yanit({ error: `${SMS_KOD_UZUNLUGU} haneli kodu girin.` }, 400);
  }

  const kayit = await sonKod(session.id, telefon);
  if (!kayit || Date.parse(kayit.expires_at) <= Date.now()) {
    return yanit(
      { error: "Kodun süresi doldu. Lütfen yeni kod isteyin.", yeniKodGerekli: true },
      410,
    );
  }
  if (kayit.deneme >= SMS_MAX_DENEME) {
    return yanit(
      { error: "Çok fazla hatalı deneme yapıldı. Lütfen yeni kod isteyin.", yeniKodGerekli: true },
      429,
    );
  }

  const ozet = await kodOzeti(session.id, telefon, kod);
  if (!ozet || !safeEqual(ozet, kayit.kod_hash)) {
    const deneme = kayit.deneme + 1;
    await kodGuncelle(kayit.id, { deneme });
    const kalan = SMS_MAX_DENEME - deneme;
    return yanit(
      kalan > 0
        ? { error: `Kod hatalı. ${kalan} deneme hakkınız kaldı.`, kalanDeneme: kalan }
        : {
            error: "Çok fazla hatalı deneme yapıldı. Lütfen yeni kod isteyin.",
            yeniKodGerekli: true,
          },
      400,
    );
  }

  await kodGuncelle(kayit.id, { verified_at: new Date().toISOString() });
  return yanit({ dogrulandi: true });
}
