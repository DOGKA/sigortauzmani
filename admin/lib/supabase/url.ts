/** Tarayıcı herkese açık adresi kullanır. Sunucu süreçleri yerel kapıya gider. */
export function supabaseServerUrl(): string | undefined {
  return process.env.SUPABASE_INTERNAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
}

/**
 * Oturum çerezi adı. Sunucu `127.0.0.1` üzerinden konuştuğu için adresi
 * tarayıcıdan farklı; çerez adı açıkça aynı tutulmazsa giriş çerezi okunmaz.
 */
export const ADMIN_AUTH_COOKIE = "sb-admin-auth-token";
