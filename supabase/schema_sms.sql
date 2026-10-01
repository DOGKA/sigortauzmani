-- Sigorta Uzmanı - Telefon SMS doğrulaması
-- psql ile çalıştırın: sudo -u postgres psql -d sigortauzmani -f supabase/schema_sms.sql
--
-- Yazma ve okuma yalnızca sunucudan (service role). Kodun kendisi tutulmaz;
-- SESSION_SECRET ile HMAC'lenmiş hâli saklanır (api/_shared/sms.ts).

create table if not exists public.sms_dogrulamalari (
  id uuid primary key default gen_random_uuid(),
  -- Ziyaretçinin imzalı çerezindeki oturum kimliği; doğrulama bu oturuma bağlı.
  session_id text not null,
  -- 5XXXXXXXXX biçiminde.
  phone text not null check (phone ~ '^5[0-9]{9}$'),
  kod_hash text not null,
  deneme integer not null default 0,
  expires_at timestamptz not null,
  verified_at timestamptz,
  ip_hash text,
  -- Verimor kampanya kimliği ya da hata metni.
  saglayici_yanit text,
  created_at timestamptz not null default now()
);

create index if not exists sms_dogrulamalari_oturum_idx
  on public.sms_dogrulamalari (session_id, phone, created_at desc);
create index if not exists sms_dogrulamalari_created_at_idx
  on public.sms_dogrulamalari (created_at desc);

alter table public.sms_dogrulamalari enable row level security;

revoke all on public.sms_dogrulamalari from anon, authenticated;
grant select, insert, update on public.sms_dogrulamalari to service_role;

-- ============================================================
-- Talep kaydı artık yalnızca sunucudan (/api/talep)
-- ============================================================
-- Tarayıcı anon rolüyle doğrudan insert yapabildiği sürece SMS doğrulaması
-- atlanabilir. Bu blok, yeni arayüz canlıya alındıktan SONRA çalıştırılmalı;
-- önce çalıştırılırsa eski arayüzü açık olan ziyaretçilerin talepleri düşer.
drop policy if exists "anon can insert talep" on public.talepler;
grant insert on public.talepler to service_role;
