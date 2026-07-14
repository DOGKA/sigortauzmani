import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface TalepInsert {
  talep_no: string;
  product_slug: string;
  product_title: string;
  insured_for: string | null;
  tckn: string | null;
  phone: string | null;
  birth_date: string | null;
  plate: string | null;
  document_serial: string | null;
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

export async function createTalep(talep: TalepInsert): Promise<void> {
  const { error } = await supabase.from("talepler").insert(talep);
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

export async function setContactPreference(
  talepNo: string,
  pref: "hemen" | "tarihli",
  date?: string,
  time?: string,
): Promise<boolean> {
  const { error } = await supabase.rpc("set_contact_pref", {
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
