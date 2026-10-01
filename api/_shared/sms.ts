/**
 * Telefon doğrulama: kod üretimi, Verimor ile gönderim ve doğrulama kaydı.
 *
 * Kod sunucuda üretiliyor ve `sms_dogrulamalari` tablosuna yalnızca
 * SESSION_SECRET ile HMAC'lenmiş hâli yazılıyor; tabloyu okuyan biri kodu
 * göremez. Doğrulama çerez oturumuna bağlı: başka bir ziyaretçinin
 * doğruladığı numara bu oturumda geçerli sayılmaz.
 *
 * Verimor gönderen sunucunun IP'sini OİM > SMS Ayarlarım'da izinli listede
 * istiyor; yoksa her gönderim `401 Hesabınızda izinli IP ayarları
 * yapılmamış` döner.
 */

import {
  SMS_KOD_SURESI_SN,
  SMS_KOD_UZUNLUGU,
} from "../../src/data/smsDogrulama";
import { dbRequest } from "./iolog";
import { gizliOzet } from "./session";
import { readEnv } from "./supabase";

const VERIMOR_URL = "https://sms.verimor.com.tr/v2/send.json";
const VERIMOR_TIMEOUT_MS = 15_000;

/**
 * Doğrulanmış numaranın oturumda geçerli kaldığı süre; çerezin ömrüyle
 * (`SESSION_MAX_AGE_SECONDS`) aynı.
 */
const DOGRULAMA_GECERLILIK_MS = 6 * 60 * 60 * 1000;

/**
 * Kapalıyken kod istenmiyor ve sunucu doğrulama aramıyor. Verimor'da IP
 * izni ve başlık onayı tamamlanmadan açılırsa hiçbir ziyaretçi teklif
 * alamaz; bu yüzden varsayılan kapalı.
 */
export function smsDogrulamaAcik(): boolean {
  return readEnv("SMS_DOGRULAMA_ENABLED") === "true";
}

/** 5XXXXXXXXX biçimi; geçersizse null. */
export function normalizeTelefon(value: unknown): string | null {
  let digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("90")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^5\d{9}$/.test(digits) ? digits : null;
}

export function maskeliTelefon(telefon: string): string {
  return `0${telefon.slice(0, 3)} *** ** ${telefon.slice(-2)}`;
}

/** Modulo sapması olmasın diye reddetmeli örnekleme. */
export function kodUret(): string {
  const ust = 10 ** SMS_KOD_UZUNLUGU;
  const sinir = Math.floor(0x1_0000_0000 / ust) * ust;
  const kutu = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(kutu);
    if (kutu[0] < sinir) return String(kutu[0] % ust).padStart(SMS_KOD_UZUNLUGU, "0");
  }
}

export function kodOzeti(sessionId: string, telefon: string, kod: string): Promise<string | null> {
  return gizliOzet(`sms:${sessionId}:${telefon}:${kod}`);
}

/** Kod mesajın başında: telefonların SMS'ten otomatik doldurması ilk sayıyı alıyor. */
function mesajMetni(kod: string): string {
  return (
    `${kod} Gross Sigorta, sigortauzmani.net üzerinden gerçekleştirdiğiniz ` +
    "KVKK Aydınlatma Metni, Açık Rıza Metni ve Gizlilik Sözleşmesi onaylarını " +
    "doğrulamak için doğrulama kodunuzdur. Doğrulama kodunuzu kimseyle " +
    "paylaşmayınız. Detaylı metinlere web sitemizden ulaşabilirsiniz. " +
    "MERSİS: 0411085688900001"
  );
}

export type SmsGonderimSonucu =
  | { ok: true; kampanyaId: string }
  | { ok: false; mesaj: string };

export async function smsGonder(telefon: string, kod: string): Promise<SmsGonderimSonucu> {
  const username = readEnv("VERIMOR_USERNAME");
  const password = readEnv("VERIMOR_PASSWORD");
  if (!username || !password) {
    return { ok: false, mesaj: "SMS yapılandırması eksik." };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), VERIMOR_TIMEOUT_MS);
  try {
    const response = await fetch(VERIMOR_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "*/*" },
      body: JSON.stringify({
        username,
        password,
        source_addr: readEnv("VERIMOR_SOURCE_ADDR") ?? "",
        valid_for: `00:${String(Math.ceil(SMS_KOD_SURESI_SN / 60)).padStart(2, "0")}`,
        messages: [{ msg: mesajMetni(kod), dest: `90${telefon}` }],
      }),
      signal: controller.signal,
    });
    // Başarıda gövde kampanya kimliği, hatada hata kodu (düz metin).
    const metin = (await response.text()).trim();
    if (!response.ok) return { ok: false, mesaj: metin || `HTTP ${response.status}` };
    return { ok: true, kampanyaId: metin };
  } catch (error) {
    return {
      ok: false,
      mesaj: error instanceof Error ? error.message : "SMS servisine ulaşılamadı.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export interface DogrulamaKaydi {
  id: string;
  kod_hash: string;
  deneme: number;
  expires_at: string;
  created_at: string;
}

/** Oturum + numara için doğrulanmamış son kod. */
export async function sonKod(sessionId: string, telefon: string): Promise<DogrulamaKaydi | null> {
  const rows = await dbRequest<DogrulamaKaydi[]>(
    `sms_dogrulamalari?session_id=eq.${encodeURIComponent(sessionId)}` +
      `&phone=eq.${telefon}&verified_at=is.null` +
      `&select=id,kod_hash,deneme,expires_at,created_at&order=created_at.desc&limit=1`,
    { method: "GET" },
  );
  return rows?.[0] ?? null;
}

export async function kodKaydet(input: {
  session_id: string;
  phone: string;
  kod_hash: string;
  ip_hash: string;
}): Promise<string | null> {
  const rows = await dbRequest<{ id: string }[]>("sms_dogrulamalari", {
    method: "POST",
    prefer: "return=representation",
    body: {
      ...input,
      expires_at: new Date(Date.now() + SMS_KOD_SURESI_SN * 1000).toISOString(),
    },
  });
  return rows?.[0]?.id ?? null;
}

export async function kodGuncelle(id: string, patch: Record<string, unknown>): Promise<void> {
  await dbRequest(`sms_dogrulamalari?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: patch,
    prefer: "return=minimal",
  });
}

/**
 * Numara bu oturumda doğrulandı mı.
 *
 * Doğrulama kapalıysa her zaman true. Veritabanına ulaşılamazsa false:
 * rate limit'in aksine burada geçirmek doğrulamayı tümden anlamsız kılar.
 */
export async function telefonDogrulandi(sessionId: string, value: unknown): Promise<boolean> {
  if (!smsDogrulamaAcik()) return true;
  const telefon = normalizeTelefon(value);
  if (!telefon) return false;
  const sonrasi = new Date(Date.now() - DOGRULAMA_GECERLILIK_MS).toISOString();
  const rows = await dbRequest<{ id: string }[]>(
    `sms_dogrulamalari?session_id=eq.${encodeURIComponent(sessionId)}` +
      `&phone=eq.${telefon}&verified_at=gte.${encodeURIComponent(sonrasi)}` +
      `&select=id&limit=1`,
    { method: "GET" },
  );
  return Boolean(rows?.length);
}

export const DOGRULANMAMIS_TELEFON =
  "Telefon numaranız doğrulanmadı. Lütfen size gönderilen SMS kodunu girin.";
