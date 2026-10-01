/**
 * Talep (lead) kaydı: POST /api/talep.
 *
 * Kayıt önceden tarayıcıdan anon rolüyle doğrudan `talepler` tablosuna
 * yazılıyordu. SMS doğrulaması gereken ürünlerde (`smsDogrulamaGerekli`)
 * doğrulanmamış numarayla talep düşmesin diye insert sunucuya taşındı;
 * `schema_sms.sql` anon insert politikasını kaldırıyor, yani bu uç tek yol.
 *
 * Alanlar listeyle süzülüyor: gövde istemciden geldiği için `status`,
 * `contact_pref` gibi panelin yönettiği kolonlar dışarıdan yazılamamalı.
 */

import { smsDogrulamaGerekli } from "../src/data/smsDogrulama";
import { jsonResponse } from "./_shared/io";
import { dbInsert, rateCheck } from "./_shared/iolog";
import { clientIp, hashIp, resolveSession, withCookie } from "./_shared/session";
import { DOGRULANMAMIS_TELEFON, telefonDogrulandi } from "./_shared/sms";

export const config = { runtime: "edge" };

/** Talep formu teklif ucundan ucuz ama yine de kayıt yazıyor. */
const MAX_TALEP_PER_HOUR = 200;

const METIN_ALANLARI = [
  "talep_no",
  "product_slug",
  "product_title",
  "insured_for",
  "tckn",
  "vergi_no",
  "phone",
  "birth_date",
  "plate",
  "document_serial",
  "motor_no",
  "sasi_no",
  "sirket_adi",
  "kvkk_surum",
  "kvkk_gosterildi_at",
  "locale",
] as const;

const MAX_ALAN_UZUNLUK = 300;

function talepSatiri(body: Record<string, unknown>): Record<string, unknown> {
  const satir: Record<string, unknown> = {};
  for (const alan of METIN_ALANLARI) {
    const deger = body[alan];
    if (typeof deger === "string" && deger.trim()) {
      satir[alan] = deger.trim().slice(0, MAX_ALAN_UZUNLUK);
    }
  }
  satir.entity_type = body.entity_type === "sirket" ? "sirket" : "sahis";
  if (typeof body.gosterilen_prim === "number" && Number.isFinite(body.gosterilen_prim)) {
    satir.gosterilen_prim = body.gosterilen_prim;
  }
  if (typeof body.saglik_acik_riza === "boolean") {
    satir.saglik_acik_riza = body.saglik_acik_riza;
  }
  return satir;
}

function sutunYok(code: string | null, message: string): boolean {
  return code === "PGRST204" || /Could not find the '.+' column/i.test(message);
}

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

  const satir = talepSatiri(body);
  if (!satir.talep_no || !satir.product_slug || !satir.product_title) {
    return yanit({ error: "Eksik talep bilgisi." }, 400);
  }

  const ipHash = await hashIp(clientIp(request));
  if (!(await rateCheck(ipHash, "talep", MAX_TALEP_PER_HOUR, 3600))) {
    return yanit(
      { error: "Kısa sürede çok fazla talep gönderildi. Lütfen bizi arayın." },
      429,
    );
  }

  if (
    smsDogrulamaGerekli(String(satir.product_slug)) &&
    !(await telefonDogrulandi(session.id, satir.phone))
  ) {
    return yanit({ error: DOGRULANMAMIS_TELEFON, telefonDogrulama: true }, 403);
  }

  let sonuc = await dbInsert("talepler", satir);
  if (!sonuc.ok && satir.locale && /locale/i.test(sonuc.message)) {
    const { locale: _locale, ...yerelsiz } = satir;
    sonuc = await dbInsert("talepler", yerelsiz);
  }
  if (!sonuc.ok && sutunYok(sonuc.code, sonuc.message)) {
    // Uyum kolonları feda edilemez: açık rıza ya da KVKK sürümü düşerse kayıt
    // rıza hiç sorulmamış, aydınlatma hiç gösterilmemiş gibi görünürdü.
    if (typeof satir.saglik_acik_riza === "boolean" || satir.kvkk_surum) {
      console.error("[talep] uyum kolonları eksik:", sonuc.message);
      return yanit({ error: "Talep kaydedilemedi. Lütfen bizimle iletişime geçin." }, 500);
    }
    const { sirket_adi, gosterilen_prim: _prim, ...temel } = satir;
    sonuc = await dbInsert("talepler", {
      ...temel,
      product_title: sirket_adi
        ? `${String(temel.product_title)} · ${String(sirket_adi)}`
        : temel.product_title,
    });
  }

  if (!sonuc.ok) {
    console.error("[talep] kaydedilemedi:", sonuc.message);
    return yanit({ error: "Talep kaydedilemedi. Lütfen tekrar deneyin." }, 500);
  }
  return yanit({ ok: true });
}
