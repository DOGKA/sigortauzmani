import {
  DEFAULT_SITE_SETTINGS,
  mergePublicSettings,
} from "../shared/site-settings";
import { readEnv } from "./_shared/supabase";

export const config = { runtime: "edge" };

export default async function handler(): Promise<Response> {
  const url = readEnv("VITE_SUPABASE_URL") ?? readEnv("SUPABASE_URL");
  const key = readEnv("VITE_SUPABASE_ANON_KEY") ?? readEnv("SUPABASE_ANON_KEY");
  let source: unknown = DEFAULT_SITE_SETTINGS;

  if (url && key) {
    try {
      const response = await fetch(
        `${url}/rest/v1/rpc/get_public_site_settings`,
        {
          method: "POST",
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            "content-type": "application/json",
          },
          body: "{}",
        },
      );
      if (response.ok) source = await response.json();
    } catch {
      // Public app bundled defaults ile çalışmaya devam eder.
    }
  }

  return Response.json(mergePublicSettings(source), {
    headers: {
      "cache-control":
        "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
      "content-type": "application/json; charset=utf-8",
    },
  });
}
