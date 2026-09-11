import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_SITE_SETTINGS,
  SETTING_KEYS,
  type SettingKey,
  type SiteSettings,
} from "../../../shared/site-settings";

/**
 * Beklenmeyen hatada Next.js gövdesiz 500 döndürür; panel yanıtı JSON olarak
 * okumaya çalıştığı için çöker ve ekran yükleme iskeletinde kalır. Ayar uçları
 * yanıtlarını bu sarmalayıcıdan geçirerek her durumda okunabilir hata verir.
 */
export async function jsonHandler(
  handler: () => Promise<NextResponse>,
  fallbackMessage: string,
  errorStatus = 500,
) {
  try {
    return await handler();
  } catch (error) {
    const message = error instanceof Error ? error.message : fallbackMessage;
    return NextResponse.json({ error: message }, { status: errorStatus });
  }
}

export async function requireUser() {
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  return user;
}

export function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase sunucu yapılandırması eksik.");
  return createServiceClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function readSettings(): Promise<SiteSettings> {
  const service = serviceClient();
  const { data, error } = await service
    .from("site_settings")
    .select("key,value");
  if (error) throw error;

  const settings = structuredClone(DEFAULT_SITE_SETTINGS);
  for (const row of data ?? []) {
    if (!SETTING_KEYS.includes(row.key as SettingKey)) continue;
    const key = row.key as SettingKey;
    Object.assign(settings[key], row.value);
  }
  return settings;
}
