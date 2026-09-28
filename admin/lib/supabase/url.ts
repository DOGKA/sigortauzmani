/** Tarayıcı herkese açık adresi kullanır. Sunucu süreçleri yerel kapıya gider. */
export function supabaseServerUrl(): string | undefined {
  return process.env.SUPABASE_INTERNAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
}
