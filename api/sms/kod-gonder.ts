/**
 * Telefon doğrulama kodu gönderir: POST /api/sms/kod-gonder { phone }.
 *
 * Numara bu oturumda zaten doğrulandıysa (ya da doğrulama kapalıysa) SMS
 * atılmadan `dogrulandi: true` döner; arayüz modalı hiç açmaz.
 *
 * Her SMS kredi yediği için sayaçlar opsiyonel değil: numara başına saatlik
 * tavan bir kişinin telefonunun bombalanmasını, IP tavanı botu, genel tavan
 * da kredinin bir anda tükenmesini engelliyor. IP tavanı yüksek çünkü ofis
 * tek bağlantıdan çok müşteriye teklif çalışıyor.
 */

import {
  SMS_KOD_SURESI_SN,
  SMS_TEKRAR_SURESI_SN,
} from "../../src/data/smsDogrulama";
import { jsonResponse } from "../_shared/io";
import { globalRateCheck, rateCheck } from "../_shared/iolog";
import {
  kodGuncelle,
  kodKaydet,
  kodOzeti,
  kodUret,
  maskeliTelefon,
  normalizeTelefon,
  smsDogrulamaAcik,
  smsGonder,
  sonKod,
  telefonDogrulandi,
} from "../_shared/sms";
import {
  clientIp,
  gizliOzet,
  hashIp,
  resolveSession,
  withCookie,
} from "../_shared/session";

export const config = { runtime: "edge" };

const MAX_SMS_PER_TELEFON = 5;
const MAX_SMS_PER_IP = 100;
const MAX_SMS_GLOBAL = 500;

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Yöntem desteklenmiyor." }, 405);
  }

  const session = await resolveSession(request);
  const yanit = (body: unknown, status = 200) =>
    withCookie(jsonResponse(body, status), session);

  if (!smsDogrulamaAcik()) return yanit({ dogrulandi: true });

  let body: { phone?: unknown };
  try {
    body = (await request.json()) as { phone?: unknown };
  } catch {
    return yanit({ error: "Geçersiz istek." }, 400);
  }

  const telefon = normalizeTelefon(body.phone);
  if (!telefon) {
    return yanit({ error: "Geçerli bir cep telefonu girin (05XX XXX XX XX)." }, 400);
  }

  if (await telefonDogrulandi(session.id, telefon)) {
    return yanit({ dogrulandi: true });
  }

  const onceki = await sonKod(session.id, telefon);
  if (onceki) {
    const gecen = (Date.now() - Date.parse(onceki.created_at)) / 1000;
    if (gecen < SMS_TEKRAR_SURESI_SN) {
      const bekle = Math.ceil(SMS_TEKRAR_SURESI_SN - gecen);
      return yanit(
        { error: `Yeni kod için ${bekle} saniye bekleyin.`, bekleSaniye: bekle },
        429,
      );
    }
  }

  const ipHash = await hashIp(clientIp(request));
  const telefonAnahtari = (await gizliOzet(`sms-tel:${telefon}`))?.slice(0, 32);
  const izinli =
    (telefonAnahtari
      ? await rateCheck(telefonAnahtari, "sms_telefon", MAX_SMS_PER_TELEFON, 3600)
      : true) &&
    (await rateCheck(ipHash, "sms_ip", MAX_SMS_PER_IP, 3600)) &&
    (await globalRateCheck("sms", MAX_SMS_GLOBAL, 3600));
  if (!izinli) {
    return yanit(
      {
        error:
          "Bu numaraya kısa sürede çok fazla kod gönderildi. Lütfen bir süre sonra tekrar deneyin ya da bizi arayın.",
      },
      429,
    );
  }

  const kod = kodUret();
  const kodHash = await kodOzeti(session.id, telefon, kod);
  const kayitId = kodHash
    ? await kodKaydet({
        session_id: session.id,
        phone: telefon,
        kod_hash: kodHash,
        ip_hash: ipHash,
      })
    : null;
  if (!kayitId) {
    return yanit({ error: "Doğrulama kodu oluşturulamadı. Lütfen tekrar deneyin." }, 500);
  }

  const gonderim = await smsGonder(telefon, kod);
  if (!gonderim.ok) {
    console.error("[sms] gönderilemedi:", gonderim.mesaj);
    await kodGuncelle(kayitId, {
      expires_at: new Date().toISOString(),
      saglayici_yanit: gonderim.mesaj.slice(0, 200),
    });
    return yanit(
      { error: "SMS gönderilemedi. Lütfen birkaç dakika sonra tekrar deneyin." },
      502,
    );
  }
  await kodGuncelle(kayitId, { saglayici_yanit: gonderim.kampanyaId.slice(0, 200) });

  return yanit({
    gonderildi: true,
    telefon: maskeliTelefon(telefon),
    sureSaniye: SMS_KOD_SURESI_SN,
    tekrarSaniye: SMS_TEKRAR_SURESI_SN,
  });
}
