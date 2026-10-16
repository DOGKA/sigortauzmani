/**
 * Payten (MerchantSafeUnipay) 3D doğrulama katmanı.
 *
 * Payten yalnızca kart sahibini doğruluyor; prim yine IO üzerinden sigorta
 * şirketinin sanal POS'undan çekiliyor ve poliçeyi IO kesiyor. IO API'de
 * dışarıda tahsil edilmiş ödemeyi bildiren bir alan yok, o yüzden Payten
 * para toplayamıyor.
 *
 * Akış:
 * 1. Sunucu ödeme oturumu açar (SESSIONTOKEN).
 * 2. Tarayıcı kartı doğrudan Payten'in Auth3D formuna gönderir; kart
 *    bilgisi bu adımda sunucumuzdan geçmez.
 * 3. Banka dönüşü tarayıcı üzerinden `api/io/payten-donus.ts`'ye gelir.
 *    Bu dönüş imzasız olduğu için tek başına güvenilmez: sunucu dönüşteki
 *    `auth3DToken` ile kendi API kullanıcısıyla PREAUTH yapar. Payten
 *    yalnızca o oturumda gerçekten doğrulanmış token'ı kabul ediyor.
 * 4. Ön provizyon hemen iptal edilir (VOID); kayıt "dogrulandi" olur.
 * 5. Satın alma kaydı tek seferlik tüketir ve IO'ya 3D'siz gider.
 *
 * Kullanıcı adı, şifre ve gizli anahtar yalnızca burada okunur ve hiçbir
 * yanıta ya da kayda yazılmaz.
 */

import { readEnv } from "./supabase";

const DEFAULT_BASE_URL = "https://merchantsafeunipay.com";
const TIMEOUT_MS = 45_000;

interface PaytenAyar {
  base: string;
  merchant: string;
  user: string;
  password: string;
}

function ayar(): PaytenAyar | null {
  const merchant = readEnv("PAYTEN_MERCHANT");
  const user = readEnv("PAYTEN_MERCHANT_USER");
  const password = readEnv("PAYTEN_MERCHANT_PASSWORD");
  if (!merchant || !user || !password) return null;
  const base = (readEnv("PAYTEN_BASE_URL") || DEFAULT_BASE_URL).replace(/\/+$/, "");
  return { base, merchant, user, password };
}

/** Bayrak açık ve kimlik bilgileri tamsa satın alma Payten doğrulaması ister. */
export function paytenEnabled(): boolean {
  return readEnv("PAYTEN_ENABLED") === "true" && ayar() !== null;
}

/**
 * Ön provizyon tutarı. Varsayılan primin tamamı: bankanın 3D ekranında ve
 * SMS'inde müşterinin ödeyeceği tutar yazsın diye. `1` verilirse 1 TL'lik
 * yoklama yapılır; dar limitli kartta asıl çekimin reddedilme riski kalkar.
 */
export function paytenDogrulamaTutari(prim: number): number {
  const deger = readEnv("PAYTEN_DOGRULAMA_TUTARI")?.trim();
  if (deger && deger !== "prim") {
    const sabit = Number(deger);
    if (Number.isFinite(sabit) && sabit > 0) return Math.round(sabit * 100) / 100;
  }
  return Math.round(prim * 100) / 100;
}

/**
 * Banka dönüşünün geleceği adres. Canlıda API nginx arkasında çalıştığı
 * için istek adresi `http://127.0.0.1` görünüyor; adres önce ortamdan,
 * yoksa proxy başlıklarından kuruluyor.
 */
export function paytenDonusAdresi(request: Request): string {
  const sabit = readEnv("PAYTEN_DONUS_URL")?.trim();
  if (sabit) return sabit;
  const url = new URL(request.url);
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || url.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || request.headers.get("host") || url.host;
  return `${proto}://${host}/api/io/payten-donus`;
}

/** Tarayıcının kart formunu göndereceği adres. */
export function paytenAuth3dAdresi(sessionToken: string): string | null {
  const a = ayar();
  if (!a) return null;
  return `${a.base}/msu/api/v2/post/auth3d/${encodeURIComponent(sessionToken)}`;
}

export interface PaytenYanit {
  responseCode?: string;
  responseMsg?: string;
  errorCode?: string;
  errorMsg?: string;
  sessionToken?: string;
  pgTranId?: string;
  merchantPaymentId?: string;
  cardBin?: string;
  panLast4?: string;
  amount?: string | number;
  [alan: string]: unknown;
}

export type PaytenSonuc =
  | { ok: true; data: PaytenYanit }
  | { ok: false; mesaj: string; data?: PaytenYanit };

async function paytenIstek(params: Record<string, string>): Promise<PaytenSonuc> {
  const a = ayar();
  if (!a) return { ok: false, mesaj: "Payten yapılandırması eksik." };

  const govde = new URLSearchParams({
    MERCHANT: a.merchant,
    MERCHANTUSER: a.user,
    MERCHANTPASSWORD: a.password,
    ...params,
  });

  const controller = new AbortController();
  const zamanlayici = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${a.base}/msu/api/v2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: govde.toString(),
      signal: controller.signal,
    });
    const metin = await response.text();
    let data: PaytenYanit;
    try {
      data = JSON.parse(metin) as PaytenYanit;
    } catch {
      return { ok: false, mesaj: "Ödeme altyapısından okunamayan bir yanıt alındı." };
    }
    if (data.responseCode !== "00") {
      return {
        ok: false,
        mesaj: data.errorMsg || data.responseMsg || "Ödeme altyapısı işlemi reddetti.",
        data,
      };
    }
    return { ok: true, data };
  } catch (error) {
    const zamanAsimi = error instanceof Error && error.name === "AbortError";
    return {
      ok: false,
      mesaj: zamanAsimi
        ? "Ödeme altyapısı zamanında yanıt vermedi."
        : "Ödeme altyapısına bağlanılamadı.",
    };
  } finally {
    clearTimeout(zamanlayici);
  }
}

/**
 * Banka tarafında MERCHANTPAYMENTID uzunluğu sınırlı (Raiffeisen 20
 * karakter); 20'yi aşmayan, tahmin edilemeyen bir kimlik.
 */
export function yeniOdemeKimligi(): string {
  const harfler = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const rastgele = crypto.getRandomValues(new Uint8Array(16));
  let kimlik = "SU";
  for (const bayt of rastgele) kimlik += harfler[bayt % harfler.length];
  return kimlik.slice(0, 18);
}

export function paytenOturumAc(input: {
  merchantPaymentId: string;
  tutar: number;
  musteriKimligi: string;
  musteriAdi: string;
  musteriTelefonu?: string | null;
  musteriIp?: string | null;
  donusAdresi: string;
}): Promise<PaytenSonuc> {
  return paytenIstek({
    ACTION: "SESSIONTOKEN",
    SESSIONTYPE: "PAYMENTSESSION",
    MERCHANTPAYMENTID: input.merchantPaymentId,
    AMOUNT: input.tutar.toFixed(2),
    CURRENCY: "TRY",
    CUSTOMER: input.musteriKimligi,
    CUSTOMERNAME: input.musteriAdi,
    ...(input.musteriTelefonu ? { CUSTOMERPHONE: input.musteriTelefonu } : {}),
    ...(input.musteriIp ? { CUSTOMERIP: input.musteriIp } : {}),
    RETURNURL: input.donusAdresi,
    SESSIONEXPIRY: "1h",
  });
}

export function paytenOnProvizyon(input: {
  sessionToken: string;
  auth3dToken: string;
}): Promise<PaytenSonuc> {
  return paytenIstek({
    ACTION: "PREAUTH",
    SESSIONTOKEN: input.sessionToken,
    AUTH3DTOKEN: input.auth3dToken,
  });
}

export function paytenIptal(pgTranId: string): Promise<PaytenSonuc> {
  return paytenIstek({ ACTION: "VOID", PGTRANID: pgTranId });
}
