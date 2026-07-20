-- Sigorta Uzmanı - Talepler şeması
-- Supabase SQL Editor'de veya psql ile çalıştırın.

create table if not exists public.talepler (
  id uuid primary key default gen_random_uuid(),
  talep_no text not null unique,
  product_slug text not null,
  product_title text not null,
  insured_for text,
  entity_type text not null default 'sahis'
    check (entity_type in ('sahis', 'sirket')),
  tckn text,
  vergi_no text,
  phone text,
  birth_date date,
  plate text,
  document_serial text,
  motor_no text,
  sasi_no text,
  contact_pref text not null default 'hemen'
    check (contact_pref in ('hemen', 'tarihli')),
  contact_date date,
  contact_time text,
  status text not null default 'yeni'
    check (status in ('yeni', 'arandi', 'teklif_verildi', 'tamamlandi', 'iptal')),
  created_at timestamptz not null default now()
);

-- Mevcut (daha önce oluşturulmuş) tabloya yeni kolonları eklemek için:
alter table public.talepler
  add column if not exists entity_type text not null default 'sahis',
  add column if not exists vergi_no text,
  add column if not exists motor_no text,
  add column if not exists sasi_no text;

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

-- ============================================================
-- Poliçe İptal Talepleri
-- ============================================================

create table if not exists public.iptal_talepleri (
  id uuid primary key default gen_random_uuid(),
  iptal_no text not null unique,
  brans text not null
    check (brans in (
      'kasko',
      'trafik',
      'imm',
      'kisa_sureli_trafik'
    )),
  ad_soyad text not null,
  phone text not null,
  tckn text,
  vergi_no text,
  plate text not null,
  belge_path text not null,
  status text not null default 'islemde'
    check (status in ('islemde', 'belge_eksik', 'tamamlandi')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint iptal_talepleri_kimlik_check check (
    (tckn is not null and tckn <> '')
    or (vergi_no is not null and vergi_no <> '')
  )
);

create index if not exists iptal_talepleri_created_at_idx
  on public.iptal_talepleri (created_at desc);
create index if not exists iptal_talepleri_status_idx
  on public.iptal_talepleri (status);
create index if not exists iptal_talepleri_iptal_no_idx
  on public.iptal_talepleri (iptal_no);

alter table public.iptal_talepleri enable row level security;

drop policy if exists "anon can insert iptal talep" on public.iptal_talepleri;
create policy "anon can insert iptal talep"
  on public.iptal_talepleri for insert
  to anon
  with check (true);

drop policy if exists "authenticated can select iptal talep" on public.iptal_talepleri;
create policy "authenticated can select iptal talep"
  on public.iptal_talepleri for select
  to authenticated
  using (true);

drop policy if exists "authenticated can update iptal talep" on public.iptal_talepleri;
create policy "authenticated can update iptal talep"
  on public.iptal_talepleri for update
  to authenticated
  using (true)
  with check (true);

create or replace function public.set_iptal_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists iptal_talepleri_set_updated_at on public.iptal_talepleri;
create trigger iptal_talepleri_set_updated_at
  before update on public.iptal_talepleri
  for each row
  execute function public.set_iptal_updated_at();

-- Storage: noter satış belgesi (private bucket)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'iptal-belgeleri',
  'iptal-belgeleri',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "anon can upload iptal belge" on storage.objects;
create policy "anon can upload iptal belge"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'iptal-belgeleri');

drop policy if exists "authenticated can read iptal belge" on storage.objects;
create policy "authenticated can read iptal belge"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'iptal-belgeleri');

drop policy if exists "authenticated can delete iptal belge" on storage.objects;
create policy "authenticated can delete iptal belge"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'iptal-belgeleri');

-- Public takip: iptal_no ile sınırlı, maskeli veri (TC/VKN dönmez)
create or replace function public.mask_person_name(full_name text)
returns text
language plpgsql
immutable
as $$
declare
  parts text[];
  i int;
  result text := '';
  part text;
  star_count int;
begin
  if full_name is null or length(trim(full_name)) = 0 then
    return null;
  end if;
  parts := regexp_split_to_array(trim(full_name), '\s+');
  for i in 1..coalesce(array_length(parts, 1), 0) loop
    part := parts[i];
    if length(part) > 0 then
      if result <> '' then
        result := result || ' ';
      end if;
      star_count := greatest(length(part) - 1, 3);
      result := result || left(part, 1) || repeat('*', star_count);
    end if;
  end loop;
  return result;
end;
$$;

create or replace function public.get_iptal_takip(p_iptal_no text)
returns table (
  iptal_no text,
  brans text,
  ad_soyad_masked text,
  phone_masked text,
  plate_masked text,
  status text,
  aciklama text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.iptal_talepleri%rowtype;
  digits text;
  plate_raw text;
begin
  if p_iptal_no is null or length(trim(p_iptal_no)) < 8 then
    return;
  end if;

  select * into r
  from public.iptal_talepleri t
  where t.iptal_no = upper(trim(p_iptal_no));

  if not found then
    return;
  end if;

  digits := regexp_replace(coalesce(r.phone, ''), '\D', '', 'g');
  plate_raw := upper(regexp_replace(coalesce(r.plate, ''), '\s', '', 'g'));

  iptal_no := r.iptal_no;
  brans := r.brans;
  ad_soyad_masked := public.mask_person_name(r.ad_soyad);
  phone_masked := case
    when length(digits) >= 10 then
      left(digits, 2) || repeat('*', greatest(length(digits) - 4, 4)) || right(digits, 2)
    else '****'
  end;
  plate_masked := case
    when length(plate_raw) >= 5 then
      left(plate_raw, 2) || repeat('*', greatest(length(plate_raw) - 4, 2)) || right(plate_raw, 2)
    else '****'
  end;
  status := r.status;
  aciklama := case
    when r.status = 'belge_eksik' then r.admin_note
    else null
  end;
  created_at := r.created_at;
  return next;
end;
$$;

grant execute on function public.get_iptal_takip(text) to anon;
grant execute on function public.get_iptal_takip(text) to authenticated;

