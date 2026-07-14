-- Sigorta Uzmanı - Talepler şeması
-- Supabase SQL Editor'de veya psql ile çalıştırın.

create table if not exists public.talepler (
  id uuid primary key default gen_random_uuid(),
  talep_no text not null unique,
  product_slug text not null,
  product_title text not null,
  insured_for text,
  tckn text,
  phone text,
  birth_date date,
  plate text,
  document_serial text,
  contact_pref text not null default 'hemen'
    check (contact_pref in ('hemen', 'tarihli')),
  contact_date date,
  contact_time text,
  status text not null default 'yeni'
    check (status in ('yeni', 'arandi', 'teklif_verildi', 'tamamlandi', 'iptal')),
  created_at timestamptz not null default now()
);

create index if not exists talepler_created_at_idx on public.talepler (created_at desc);
create index if not exists talepler_status_idx on public.talepler (status);

alter table public.talepler enable row level security;

-- Site (anon) sadece talep oluşturabilir, okuyamaz.
drop policy if exists "anon can insert talep" on public.talepler;
create policy "anon can insert talep"
  on public.talepler for insert
  to anon
  with check (true);

-- Admin (authenticated) her şeyi görebilir ve güncelleyebilir.
drop policy if exists "authenticated can select talep" on public.talepler;
create policy "authenticated can select talep"
  on public.talepler for select
  to authenticated
  using (true);

drop policy if exists "authenticated can update talep" on public.talepler;
create policy "authenticated can update talep"
  on public.talepler for update
  to authenticated
  using (true)
  with check (true);

-- Site tarafı iletişim tercihini talep_no üzerinden günceller.
-- Anon'a genel UPDATE izni vermemek için security definer fonksiyon kullanılır;
-- talep_no rastgele üretildiği için tahmin edilmesi zordur.
create or replace function public.set_contact_pref(
  p_talep_no text,
  p_contact_pref text,
  p_contact_date date default null,
  p_contact_time text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_contact_pref not in ('hemen', 'tarihli') then
    raise exception 'Geçersiz iletişim tercihi';
  end if;

  update public.talepler
  set contact_pref = p_contact_pref,
      contact_date = p_contact_date,
      contact_time = p_contact_time
  where talep_no = p_talep_no;
end;
$$;

grant execute on function public.set_contact_pref(text, text, date, text) to anon;
