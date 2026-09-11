import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_SITE_SETTINGS,
  SETTING_KEYS,
  type SettingKey,
  type SiteSettings,
} from "../../../shared/site-settings";

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
