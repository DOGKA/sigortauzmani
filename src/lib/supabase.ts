import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let supabase: SupabaseClient | null = null;

function getSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase ortam değişkenleri tanımlı değil.");
    return null;
  }
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
}

export interface TalepInsert {
  talep_no: string;
  product_slug: string;
  product_title: string;
  insured_for: string | null;
  entity_type: "sahis" | "sirket";
  tckn: string | null;
  vergi_no: string | null;
  phone: string | null;
  birth_date: string | null;
  plate: string | null;
  document_serial: string | null;
  motor_no: string | null;
  sasi_no: string | null;
}

export type IptalBrans =
  | "kasko"
  | "trafik"
  | "imm"
  | "kisa_sureli_trafik";

export type IptalStatus = "islemde" | "belge_eksik" | "tamamlandi";

export const IPTAL_BRANS_LABELS: Record<IptalBrans, string> = {
  kasko: "Kasko Poliçesi",
  trafik: "Trafik Poliçesi",
  imm: "IMM Poliçesi",
  kisa_sureli_trafik: "Kısa Süreli Trafik Poliçesi",
};

export const IPTAL_STATUS_LABELS: Record<IptalStatus, string> = {
  islemde: "İşlemde",
  belge_eksik: "Belge Eksik",
  tamamlandi: "Tamamlandı",
};

export interface IptalTakipResult {
  iptal_no: string;
  brans: IptalBrans;
  ad_soyad_masked: string;
  phone_masked: string;
  plate_masked: string;
  status: IptalStatus;
  aciklama: string | null;
  created_at: string;
}

export interface IptalTalepInsert {
  iptal_no: string;
  brans: IptalBrans;
  ad_soyad: string;
  phone: string;
  tckn: string | null;
  vergi_no: string | null;
  plate: string;
  belge_path: string;
}

export function generateTalepNo(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `SU-${yy}${mm}${dd}-${suffix}`;
}

export function generateIptalNo(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `IP-${yy}${mm}${dd}-${suffix}`;
}

export async function createTalep(talep: TalepInsert): Promise<void> {
  const client = getSupabase();
  if (!client) return;

  const { error } = await client.from("talepler").insert(talep);
  if (error) {
    console.error("Talep kaydedilemedi:", error.message);
    return;
  }
  void sendTalepNotificationEmail(talep);
}

async function sendTalepNotificationEmail(talep: TalepInsert) {
  const notifyUrl = import.meta.env.VITE_NOTIFY_API_URL as string | undefined;
  if (!notifyUrl) return;

  try {
    const response = await fetch(`${notifyUrl}/api/notify-talep`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(talep),
    });
    if (!response.ok) {
      console.error("Bildirim e-postası gönderilemedi:", await response.text());
    }
  } catch (err) {
    console.error("Bildirim e-postası isteği başarısız:", err);
  }
}

const IPTAL_BUCKET = "iptal-belgeleri";
const MAX_BELGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_BELGE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function uploadIptalBelge(
  iptalNo: string,
  file: File,
): Promise<{ path: string } | { error: string }> {
  const client = getSupabase();
  if (!client) return { error: "Bağlantı kurulamadı. Lütfen tekrar deneyin." };

  if (!ALLOWED_BELGE_TYPES.includes(file.type)) {
    return { error: "Yalnızca PDF, JPG veya PNG yükleyebilirsiniz." };
  }
  if (file.size > MAX_BELGE_BYTES) {
    return { error: "Dosya boyutu en fazla 10 MB olabilir." };
  }

  const ext =
    file.type === "application/pdf"
      ? "pdf"
      : file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
  const path = `${iptalNo}/${Date.now()}.${ext}`;

  const { error } = await client.storage.from(IPTAL_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    console.error("Belge yüklenemedi:", error.message);
    return { error: "Belge yüklenemedi. Lütfen tekrar deneyin." };
  }

  return { path };
}

export async function createIptalTalep(
  iptal: IptalTalepInsert,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = getSupabase();
  if (!client) {
    return { ok: false, error: "Bağlantı kurulamadı. Lütfen tekrar deneyin." };
  }

  const { error } = await client.from("iptal_talepleri").insert({
    ...iptal,
    status: "islemde",
  });

  if (error) {
    console.error("İptal talebi kaydedilemedi:", error.message);
    return { ok: false, error: "Talep kaydedilemedi. Lütfen tekrar deneyin." };
  }

  void sendIptalNotificationEmail(iptal);
  return { ok: true };
}

export async function lookupIptalTakip(
  iptalNo: string,
): Promise<
  | { ok: true; data: IptalTakipResult }
  | { ok: false; error: string; notFound?: boolean }
> {
  const client = getSupabase();
  if (!client) {
    return { ok: false, error: "Bağlantı kurulamadı. Lütfen tekrar deneyin." };
  }

  const code = iptalNo.trim().toUpperCase();
  if (code.length < 8) {
    return { ok: false, error: "Geçerli bir iptal takip numarası girin." };
  }

  const { data, error } = await client.rpc("get_iptal_takip", {
    p_iptal_no: code,
  });

  if (error) {
    console.error("İptal takip sorgusu başarısız:", error.message);
    return { ok: false, error: "Sorgulama yapılamadı. Lütfen tekrar deneyin." };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return {
      ok: false,
      notFound: true,
      error: "Bu takip numarasına ait başvuru bulunamadı.",
    };
  }

  return {
    ok: true,
    data: {
      iptal_no: row.iptal_no,
      brans: row.brans,
      ad_soyad_masked: row.ad_soyad_masked,
      phone_masked: row.phone_masked,
      plate_masked: row.plate_masked,
      status: row.status,
      aciklama: row.aciklama,
      created_at: row.created_at,
    },
  };
}

async function sendIptalNotificationEmail(iptal: IptalTalepInsert) {
  const notifyUrl = import.meta.env.VITE_NOTIFY_API_URL as string | undefined;
  if (!notifyUrl) return;

  try {
    const response = await fetch(`${notifyUrl}/api/notify-iptal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...iptal,
        brans_label: IPTAL_BRANS_LABELS[iptal.brans],
      }),
    });
    if (!response.ok) {
      console.error(
        "İptal bildirim e-postası gönderilemedi:",
        await response.text(),
      );
    }
  } catch (err) {
    console.error("İptal bildirim e-postası isteği başarısız:", err);
  }
}

export async function setContactPreference(
  talepNo: string,
  pref: "hemen" | "tarihli",
  date?: string,
  time?: string,
): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  const { error } = await client.rpc("set_contact_pref", {
    p_talep_no: talepNo,
    p_contact_pref: pref,
    p_contact_date: date ?? null,
    p_contact_time: time ?? null,
  });
  if (error) {
    console.error("İletişim tercihi kaydedilemedi:", error.message);
    return false;
  }
  return true;
}
