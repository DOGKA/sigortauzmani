/**
 * Teklif yolculuğunun Supabase'e kaydı.
 *
 * Yazma service role anahtarıyla yapılır: bu tablolarda anon rolünün hiçbir
 * yetkisi yok, çünkü içlerinde kimlik bilgisi ve şirket primleri var. Anahtar
 * yalnızca sunucu tarafında okunur.
 *
 * Kayıt tutmak akışı bloke etmemeli. Bir insert başarısız olursa kullanıcı
 * teklifini almaya devam eder; bu yüzden fonksiyonlar hata fırlatmaz.
 */

import { readEnv } from "./supabase";

function serviceCredentials(): { url: string; key: string } | null {
  const url = readEnv("VITE_SUPABASE_URL") ?? readEnv("SUPABASE_URL");
  const key = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  return { url, key };
}

async function dbRequest<T>(
  path: string,
  init: { method: string; body?: unknown; prefer?: string },
): Promise<T | null> {
  const creds = serviceCredentials();
  if (!creds) return null;

  try {
    const response = await fetch(`${creds.url}/rest/v1/${path}`, {
      method: init.method,
      headers: {
        apikey: creds.key,
        Authorization: `Bearer ${creds.key}`,
        "Content-Type": "application/json",
        ...(init.prefer ? { Prefer: init.prefer } : {}),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    if (!response.ok) return null;
    const text = await response.text();
    return text ? (JSON.parse(text) as T) : null;
  } catch {
    return null;
  }
}

/**
 * IP başına sayaç. Veritabanına ulaşamazsak isteği geçiriyoruz: teklif
 * alamayan gerçek kullanıcı, sayaç tutamamaktan daha kötü.
 */
export async function rateCheck(
  ipHash: string,
  action: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const result = await dbRequest<boolean>("rpc/io_rate_check", {
    method: "POST",
    body: {
      p_ip_hash: ipHash,
      p_action: action,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    },
  });
  return result === null ? true : result === true;
}

/**
 * Tüm ziyaretçiler için ortak üst sınır.
 *
 * IP başına limit tek bir kötüye kullanımı durdurur ama toplamı sınırlamaz:
 * yüz ziyaretçi kendi limiti içinde kalarak IO'ya toplamda çok yüksek bir
 * hacim gönderebilir ve IO hepsini tek istemci gibi görür (giden isteklerin
 * kaynak IP'si bizim sunucumuz). Karşı taraf tek bir operatörün telefonla
 * çalışması için tasarlandığı için bu tavan opsiyonel değil.
 *
 * `io_rate_check` anahtarı parametre olarak aldığı için sabit bir anahtar
 * geçmek genel sayaç veriyor; ek tablo veya şema değişikliği gerekmiyor.
 * Sentinel değer hash'lenmiş IP biçimiyle (32 hane hex) çakışamaz.
 */
export async function globalRateCheck(
  action: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  return rateCheck("__global__", action, limit, windowSeconds);
}

export function generateOturumNo(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 5; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `TK-${yy}${mm}${dd}-${suffix}`;
}

export interface OturumRow {
  id: string;
  oturum_no: string;
}

export interface OturumInsert {
  session_id: string;
  ip_hash: string;
  product_slug: string;
  brans_no: number;
  entity_type?: "sahis" | "yabanci" | "sirket";
  tckn?: string | null;
  vergi_no?: string | null;
  ad_soyad?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  plate?: string | null;
  adres_kodu?: string | null;
  form_data?: unknown;
}

export async function createOturum(
  input: OturumInsert,
): Promise<OturumRow | null> {
  const rows = await dbRequest<OturumRow[]>("teklif_oturumlari", {
    method: "POST",
    prefer: "return=representation",
    body: { ...input, oturum_no: generateOturumNo() },
  });
  return rows?.[0] ?? null;
}

export async function updateOturum(
  oturumId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  await dbRequest(
    `teklif_oturumlari?id=eq.${encodeURIComponent(oturumId)}`,
    { method: "PATCH", body: patch, prefer: "return=minimal" },
  );
}

/** Oturumu çerez kimliğiyle doğrular; başka bir ziyaretçinin oturumuna
 * müdahale edilmesini engeller. */
interface OturumOzeti {
  id: string;
  product_slug: string;
  brans_no: number;
  io_teklif_id: number | null;
}

export async function findOturum(
  oturumId: string,
  sessionId: string,
): Promise<OturumOzeti | null> {
  const rows = await dbRequest<OturumOzeti[]>(
    `teklif_oturumlari?id=eq.${encodeURIComponent(oturumId)}` +
      `&session_id=eq.${encodeURIComponent(sessionId)}` +
      `&select=id,product_slug,brans_no,io_teklif_id&limit=1`,
    { method: "GET" },
  );
  return rows?.[0] ?? null;
}

/**
 * Bu teklif kimliğini ilk kez ne zaman gördük.
 *
 * IO aynı kişi ve aynı riziko için yeni teklif açmıyor, mevcut kaydı geri
 * veriyor; yanıtta da teklifin tarihi yok. Teklifin yaşını yalnızca kendi
 * kaydımızdan bilebiliyoruz — partner CRM'i de uyarısındaki tarihi kendi
 * veritabanından okuyor.
 *
 * Yaş önemli: aynı gün içinde tanzim tarihi değişmediği için teklif aynı
 * primlerle satın alınabiliyor. 24 saati geçtiğinde tanzim tarihi değişmek
 * zorunda ve şirketin verdiği fiyat da değişebiliyor; o teklif üzerinden
 * satın alma şirket tarafında reddediliyor.
 *
 * Kaydımız yoksa (teklif CRM'de açılmışsa) null dönüyor: yaş bilinmiyor,
 * akış engellenmiyor.
 */
export async function teklifIlkGorulme(
  teklifId: number,
  hariciOturumId: string | null,
): Promise<string | null> {
  const rows = await dbRequest<{ created_at: string }[]>(
    `teklif_oturumlari?io_teklif_id=eq.${teklifId}` +
      (hariciOturumId ? `&id=neq.${encodeURIComponent(hariciOturumId)}` : "") +
      `&select=created_at&order=created_at.asc&limit=1`,
    { method: "GET" },
  );
  return rows?.[0]?.created_at ?? null;
}

/**
 * Oturumun IO'da açtığı teklif kimlikleri.
 *
 * `io_teklif_id` yalnızca ilk branşı taşıyor; trafik akışında aynı oturumda
 * Kasko da çalıştırılabildiği için tamamı `form_data.teklifler` içinde. Belge
 * uçu istemciden gelen TeklifId'yi bu listeye karşı doğruluyor, aksi hâlde
 * başka bir ziyaretçinin teklifinin PDF'i istenebilirdi.
 */
export async function oturumTeklifIdleri(
  oturumId: string,
  sessionId: string,
): Promise<number[]> {
  const rows = await dbRequest<
    {
      io_teklif_id: number | null;
      form_data: { teklifler?: { teklifId?: unknown }[] } | null;
    }[]
  >(
    `teklif_oturumlari?id=eq.${encodeURIComponent(oturumId)}` +
      `&session_id=eq.${encodeURIComponent(sessionId)}` +
      `&select=io_teklif_id,form_data&limit=1`,
    { method: "GET" },
  );

  const row = rows?.[0];
  if (!row) return [];

  const idler = new Set<number>();
  if (Number.isFinite(row.io_teklif_id)) idler.add(Number(row.io_teklif_id));
  for (const teklif of row.form_data?.teklifler ?? []) {
    const id = Number(teklif?.teklifId);
    if (Number.isFinite(id) && id > 0) idler.add(id);
  }
  return [...idler];
}

export interface FiyatInput {
  brans_no: number;
  sirket_kodu: string;
  sirket_adi?: string | null;
  io_teklif_satir_id?: number | null;
  teklif_no?: string | null;
  prim?: number | null;
  taksit?: string | null;
  taksit_kodu?: string | null;
  raw?: unknown;
}

/**
 * Primler polling'i aynı şirketi tekrar tekrar döndürdüğü için upsert.
 * Çakışma anahtarı schema_io.sql'deki teklif_fiyatlari_tekil_idx.
 *
 * `teklif_no` null bırakılmıyor: upsert anahtarının parçası ve kolon
 * `not null default ''`. Null gönderilirse insert tümden düşer ve buradaki
 * hata yutulduğu için kimse fark etmez.
 */
export async function upsertFiyatlar(
  oturumId: string,
  fiyatlar: FiyatInput[],
): Promise<void> {
  if (!fiyatlar.length) return;
  await dbRequest(
    "teklif_fiyatlari?on_conflict=oturum_id,brans_no,sirket_kodu,teklif_no",
    {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=minimal",
      body: fiyatlar.map((fiyat) => ({
        ...fiyat,
        teklif_no: fiyat.teklif_no ?? "",
        oturum_id: oturumId,
      })),
    },
  );
}

const CARD_FIELDS = new Set([
  "kartno",
  "cvv2",
  "cvv",
  "sonkullanimay",
  "sonkullanimyil",
]);

/**
 * Kart alanlarını iç içe her seviyeden siler.
 * IO yanıtı gönderdiğimiz Police nesnesini geri yansıtabildiği için
 * loglamadan önce mutlaka buradan geçmeli.
 */
export function stripCardFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripCardFields);
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      if (CARD_FIELDS.has(key.toLowerCase())) continue;
      result[key] = stripCardFields(child);
    }
    return result;
  }
  return value;
}

export interface SatinAlmaInput {
  oturum_id: string;
  brans_no: number;
  sirket_kodu: string;
  sirket_adi?: string | null;
  teklif_no?: string | null;
  police_no?: string | null;
  prim?: number | null;
  taksit?: string | null;
  taksit_kodu?: string | null;
  kart_sahibi?: string | null;
  kart_son4?: string | null;
  uc_d_secure?: boolean;
  police_pdf_url?: string | null;
  makbuz_pdf_url?: string | null;
  io_response?: unknown;
  status: "basarili" | "basarisiz";
  hata_mesaji?: string | null;
}

export async function recordSatinAlma(
  input: SatinAlmaInput,
): Promise<void> {
  await dbRequest("satin_almalar", {
    method: "POST",
    prefer: "return=minimal",
    body: {
      ...input,
      io_response:
        input.io_response === undefined
          ? undefined
          : stripCardFields(input.io_response),
    },
  });
}
