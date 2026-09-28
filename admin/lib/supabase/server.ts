import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ADMIN_AUTH_COOKIE, supabaseServerUrl } from "@/lib/supabase/url";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    supabaseServerUrl()!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: ADMIN_AUTH_COOKIE },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component'ten çağrıldığında yazma yapılamaz; middleware halleder.
          }
        },
      },
    },
  );
}
