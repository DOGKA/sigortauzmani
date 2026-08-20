/**
 * IO API (Sigorta Gross) sunucu tarafı istemcisi.
 *
 * Partner token yalnızca burada okunur ve hiçbir koşulda yanıta yazılmaz.
 * Bu yüzden proxy uçları istemciden serbest path kabul etmez; izin verilen
 * çağrılar `api/io/[action].ts` içindeki sabit haritada tanımlıdır.
 *
 * Yanıt şekli uca göre değişiyor: liste uçları çıplak dizi döner
 * (`/api/iller`, `/api/bb`), teklif/sorgu uçları ise `HataKodu` taşıyan bir
 * nesne. İkisi de tek yerde normalize edilir.
 */

import { readEnv } from "./supabase";

const DEFAULT_TIMEOUT_MS = 30_000;

export interface IoError {
  /** İstemciye dönecek HTTP durumu. */
  status: number;
  /** IO tarafının HataKodu değeri; taşımayan yanıtlarda null. */
  code: number | null;
  message: string;
  /**
   * Kullanıcının girdisiyle düzeltilemeyecek hata mı (token bitti, servis
   * kapalı, kapasite doldu). True ise arayüz self servisi bırakıp mevcut
   * lead formuna yönlendirir; aksi hâlde kullanıcı bilgilerini düzeltip
   * tekrar dener.
   */
  fallback?: boolean;
}

export type IoResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: IoError };

export function ioBaseUrl(): string | null {
  const value = readEnv("IO_API_BASE_URL");
  if (!value) return null;
  return value.replace(/\/+$/, "");
}

function ioToken(): string | null {
  return readEnv("IO_API_TOKEN") ?? null;
}

/**
 * Satış kanalı ("Kanal"), tüm uçlarda aynı değer.
 *
 * Dokümantasyon alanı yalnızca "Satış kanalı" olarak tanımlıyor ve geçerli
 * değerleri hiçbir yerde listelemiyor; örneklerinde de tutarsız biçimde 1, 2
 * ve 3 geçiyor. Gerçek değer partnerin üretimde kullandığı CRM'in isteği
 * incelenerek bulundu: her uçta 0 gönderiliyor. Doküman örnekleri temsili
 * değil, o yüzden onlara değil bu bulguya uyuluyor.
 *
 * Sıfır geçerli bir değer olduğu için kontrol `>= 0`; `> 0` yazılırsa 0
 * sessizce yok sayılır ve varsayılana düşerdi.
 */
export function ioKanal(): number {
  const parsed = Number(readEnv("IO_KANAL"));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

/**
 * 3D Secure. Sigorta Gross tarafında bozuk olduğu için varsayılan kapalı;
 * düzeltildiğinde tek env değişikliğiyle açılabilsin diye bayrak bırakıldı.
 */
export function io3dsEnabled(): boolean {
  return readEnv("IO_3DS_ENABLED") === "true";
}

/**
 * MERNİS sorgusu varsayılan olarak kapalı.
 *
 * Sorgu, sorgulanan kişinin telefonuna "Kayıt İşlemi Onay kodunuz" SMS'i
 * yolluyor ve bu istemciden kapatılamıyor: `KodGonder: false` göndermek
 * (kökte ve sigortalı bloğunda), `Cep` alanını hiç göndermemek — hiçbiri
 * engellemiyor, numara IO'nun kendi kaydından çözülüyor. Canlıda her deneme
 * müşteriye kod gönderdiği için sorgu devre dışı.
 *
 * Sorgunun tek kazancı maskeli ad soyad doğrulaması ve DASK için UAVT adres
 * kodunun hazır gelmesiydi; teklif oluşturma buna bağlı değil. Sigorta Gross
 * partner token'ımız için onay kodunu kapattığında bu değişken `true`
 * yapılarak sorgu geri açılabilir.
 */
export function ioMernisEnabled(): boolean {
  return readEnv("IO_MERNIS_ENABLED") === "true";
}

interface IoFetchInit {
  method?: "GET" | "POST";
  body?: unknown;
  timeoutMs?: number;
}

/**
 * IO'nun SMS onay kodu yolunu her istekte kapatır.
 *
 * `KodGonder` gönderilmediğinde sunucu varsayılan olarak kod gönderme moduna
 * geçiyor: müşterinin telefonuna "Kayıt İşlemi Onay kodunuz" SMS'i düşüyor ve
 * sorgu kaydı hiç döndürmüyor. Canlıda bu şekilde onlarca kod gitti.
 *
 * Bizim akışımızda kod doğrulama adımı yok; kimliği sigorta şirketi kendi
 * tarafında doğruluyor. Onay kodu yalnızca partnerin Sigorta Gross paneline
 * girişinde olmalı, bizim sistemimizden hiç kod gitmemeli. Bu yüzden bayrak
 * tek tek uçlarda değil tüm IO çağrılarının geçtiği bu noktada kapatılıyor —
 * ileride yeni bir uç eklendiğinde gözden kaçmasın.
 */
function kodGondermeyiKapat(body: unknown): unknown {
  if (!body || typeof body !== "object" || Array.isArray(body)) return body;

  const govde: Record<string, unknown> = {
    ...(body as Record<string, unknown>),
    KodGonder: false,
  };

  // Alan hem kökte hem sigortalı bloğunda okunabiliyor.
  const sigortali = govde.Sigortali;
  if (sigortali && typeof sigortali === "object" && !Array.isArray(sigortali)) {
    govde.Sigortali = {
      ...(sigortali as Record<string, unknown>),
      KodGonder: false,
    };
  }
  return govde;
}

/**
 * `HataKodu` taşıyan yanıtlarda hata mesajını çıkarır.
 * Alan adı yanıtlar arasında `Mesaj` / `Message` / `Hata` olarak değişebiliyor.
 */
function readErrorMessage(payload: Record<string, unknown>): string {
  for (const key of ["Mesaj", "Message", "Hata", "HataMesaji"]) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "Sigorta servisinden beklenmeyen bir yanıt alındı.";
}

export async function ioFetch<T>(
  path: string,
  init: IoFetchInit = {},
): Promise<IoResult<T>> {
  const base = ioBaseUrl();
  const token = ioToken();
  if (!base || !token) {
    return {
      ok: false,
      error: {
        status: 500,
        code: null,
        message: "IO API yapılandırması eksik.",
        fallback: true,
      },
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    init.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  try {
    const response = await fetch(`${base}${path}`, {
      method: init.method ?? "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body:
        init.body === undefined
          ? undefined
          : JSON.stringify(kodGondermeyiKapat(init.body)),
      signal: controller.signal,
    });

    const text = await response.text();

    if (!response.ok) {
      // Token süresi dolduğunda IO 401 döner. Bu, kullanıcı hatası değil
      // yapılandırma sorunu olduğu için ayrı mesajla işaretlenir.
      const yetkiSorunu = response.status === 401 || response.status === 403;
      return {
        ok: false,
        error: {
          status: response.status,
          code: null,
          message: yetkiSorunu
            ? "Sigorta servisi yetkilendirmesi geçersiz."
            : "Sigorta servisine şu anda ulaşılamıyor.",
          // Kullanıcı bunu düzeltemez; token yenilenene ya da servis
          // ayağa kalkana kadar self servis çalışmaz.
          fallback: true,
        },
      };
    }

    let payload: unknown;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      return {
        ok: false,
        error: {
          status: 502,
          code: null,
          message: "Sigorta servisinden okunamayan bir yanıt alındı.",
        },
      };
    }

    if (payload && !Array.isArray(payload) && typeof payload === "object") {
      const record = payload as Record<string, unknown>;
      const hataKodu = Number(record.HataKodu);
      if (Number.isFinite(hataKodu) && hataKodu !== 0) {
        return {
          ok: false,
          error: {
            status: 422,
            code: hataKodu,
            message: readErrorMessage(record),
          },
        };
      }
    }

    return { ok: true, data: payload as T };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    return {
      ok: false,
      error: {
        status: aborted ? 504 : 502,
        code: null,
        message: aborted
          ? "Sigorta servisi zamanında yanıt vermedi."
          : "Sigorta servisine bağlanılamadı.",
        fallback: true,
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Teklif verisi kişiye özel; hiçbir katmanda önbelleğe alınmamalı.
      "cache-control": "no-store",
    },
  });
}

export function errorResponse(error: IoError): Response {
  return jsonResponse(
    { error: error.message, code: error.code, fallback: error.fallback ?? false },
    error.status,
  );
}
