-- Sigorta Uzmanı - IO API self servis teklif şeması
-- Supabase SQL Editor'de veya psql ile çalıştırın.
--
-- Bu tablolara yazma yalnızca Vercel serverless katmanından, service role
-- anahtarıyla yapılır. Teklif verisi sigorta şirketi fiyatı ve kimlik bilgisi
-- içerdiği için anon rolüne hiçbir yetki verilmez; mevcut talepler/iptal
-- tablolarındaki "anon can insert" deseni burada bilinçli olarak kullanılmaz.

-- ============================================================
-- Teklif Oturumları
-- ============================================================

create table if not exists public.teklif_oturumlari (
  id uuid primary key default gen_random_uuid(),
  oturum_no text not null unique,
  -- Ziyaretçinin imzalı çerezindeki oturum kimliği. Polling ve satın alma
  -- isteklerinin aynı yolculuğa bağlanmasını sağlar.
  session_id text not null,
  -- IP ham hâlde tutulmaz; SESSION_SECRET ile tuzlanmış hash saklanır.
  ip_hash text,
  product_slug text not null,
  brans_no integer not null,
  entity_type text not null default 'sahis'
    check (entity_type in ('sahis', 'yabanci', 'sirket')),
  -- Gerçek kişinin kimlik numarası: entity_type 'sahis' ise T.C. Kimlik No,
  -- 'yabanci' ise Yabancı Kimlik No. Ayrımı entity_type taşıyor.
  tckn text,
  vergi_no text,
  ad_soyad text,
  phone text,
  birth_date date,
  plate text,
  adres_kodu text,
  -- Kullanıcının girdiği tüm adım verisi. Ürün başına alan şeması
  -- farklı olduğu için kolona açmak yerine jsonb tutulur.
  form_data jsonb not null default '{}'::jsonb,
  io_teklif_id bigint,
  status text not null default 'baslatildi'
    check (status in (
      'baslatildi',
      'sorgu_tamam',
      'teklif_calisti',
      'secildi',
      'satin_alindi',
      'hata'
    )),
  hata_mesaji text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists teklif_oturumlari_created_at_idx
  on public.teklif_oturumlari (created_at desc);
create index if not exists teklif_oturumlari_status_idx
  on public.teklif_oturumlari (status);
create index if not exists teklif_oturumlari_session_idx
  on public.teklif_oturumlari (session_id);
create index if not exists teklif_oturumlari_io_teklif_idx
  on public.teklif_oturumlari (io_teklif_id);

alter table public.teklif_oturumlari enable row level security;

drop policy if exists "authenticated can select teklif oturum" on public.teklif_oturumlari;
create policy "authenticated can select teklif oturum"
  on public.teklif_oturumlari for select
  to authenticated
  using (true);

drop policy if exists "authenticated can update teklif oturum" on public.teklif_oturumlari;
create policy "authenticated can update teklif oturum"
  on public.teklif_oturumlari for update
  to authenticated
  using (true)
  with check (true);

-- ============================================================
-- Teklif Fiyatları (şirket şirket gelen primler)
-- ============================================================

create table if not exists public.teklif_fiyatlari (
  id uuid primary key default gen_random_uuid(),
  oturum_id uuid not null
    references public.teklif_oturumlari (id) on delete cascade,
  -- Trafik akışında aynı oturumda Kasko da çalıştırılabildiği için
  -- branş satır bazında tutulur.
  brans_no integer not null,
  sirket_kodu text not null,
  sirket_adi text,
  io_teklif_satir_id bigint,
  teklif_no text,
  prim numeric(12, 2),
  taksit text,
  taksit_kodu text,
  raw jsonb,
  created_at timestamptz not null default now()
);

create index if not exists teklif_fiyatlari_oturum_idx
  on public.teklif_fiyatlari (oturum_id);

-- Primler polling'i aynı şirketi birden çok kez döndürüyor; upsert
-- yapabilmek için tekilleştirme anahtarı. Tablo seviyesindeki UNIQUE
-- ifade kabul etmediği için ayrı index olarak tanımlanır.
create unique index if not exists teklif_fiyatlari_tekil_idx
  on public.teklif_fiyatlari (
    oturum_id, brans_no, sirket_kodu, coalesce(teklif_no, '')
  );

alter table public.teklif_fiyatlari enable row level security;

drop policy if exists "authenticated can select teklif fiyat" on public.teklif_fiyatlari;
create policy "authenticated can select teklif fiyat"
  on public.teklif_fiyatlari for select
  to authenticated
  using (true);

-- ============================================================
-- Satın Almalar
-- ============================================================
-- Kart numarası ve CVV hiçbir koşulda buraya yazılmaz; yalnızca son 4 hane
-- mutabakat için saklanır. io_response yazılmadan önce kart alanlarından
-- arındırılır (api/_shared/iolog.ts).

create table if not exists public.satin_almalar (
  id uuid primary key default gen_random_uuid(),
  oturum_id uuid not null
    references public.teklif_oturumlari (id) on delete restrict,
  brans_no integer not null,
  sirket_kodu text not null,
  sirket_adi text,
  teklif_no text,
  police_no text,
  prim numeric(12, 2),
  taksit text,
  taksit_kodu text,
  kart_sahibi text,
  kart_son4 text check (kart_son4 is null or kart_son4 ~ '^[0-9]{4}$'),
  uc_d_secure boolean not null default false,
  police_pdf_url text,
  makbuz_pdf_url text,
  io_response jsonb,
  status text not null default 'basarili'
    check (status in ('basarili', 'basarisiz')),
  hata_mesaji text,
  created_at timestamptz not null default now()
);

create index if not exists satin_almalar_created_at_idx
  on public.satin_almalar (created_at desc);
create index if not exists satin_almalar_oturum_idx
  on public.satin_almalar (oturum_id);
create index if not exists satin_almalar_police_no_idx
  on public.satin_almalar (police_no);

alter table public.satin_almalar enable row level security;

drop policy if exists "authenticated can select satin alma" on public.satin_almalar;
create policy "authenticated can select satin alma"
  on public.satin_almalar for select
  to authenticated
  using (true);

-- ============================================================
-- updated_at tetikleyicisi
-- ============================================================

create or replace function public.set_teklif_oturum_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists teklif_oturumlari_set_updated_at on public.teklif_oturumlari;
create trigger teklif_oturumlari_set_updated_at
  before update on public.teklif_oturumlari
  for each row
  execute function public.set_teklif_oturum_updated_at();

-- ============================================================
-- Rate limit
-- ============================================================
-- Her teklif çalıştırma sigorta şirketlerinde gerçek maliyet doğuruyor, bu
-- yüzden IP başına sayaç opsiyonel değil. Sayaç serverless bellekte
-- tutulamaz (her istek ayrı instance'a düşebilir), o yüzden veritabanında.

create table if not exists public.io_rate_limits (
  ip_hash text not null,
  action text not null,
  window_start timestamptz not null,
  hit_count integer not null default 0,
  primary key (ip_hash, action, window_start)
);

create index if not exists io_rate_limits_window_idx
  on public.io_rate_limits (window_start);

alter table public.io_rate_limits enable row level security;

/*
 * Sayacı atomik olarak artırır ve limit aşıldıysa false döner.
 *
 * Pencere başlangıcı p_window_seconds'a hizalanır (sabit pencere); kayan
 * pencere kadar hassas değil ama tek satır upsert'le hallolduğu için
 * serverless'ta ek round trip getirmiyor.
 */
create or replace function public.io_rate_check(
  p_ip_hash text,
  p_action text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window timestamptz;
  v_count integer;
begin
  if p_ip_hash is null or p_ip_hash = '' then
    return true;
  end if;

  v_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.io_rate_limits as l (ip_hash, action, window_start, hit_count)
  values (p_ip_hash, p_action, v_window, 1)
  on conflict (ip_hash, action, window_start)
    do update set hit_count = l.hit_count + 1
  returning l.hit_count into v_count;

  -- Eski pencereleri fırsat buldukça temizle; ayrı cron gerektirmesin.
  if random() < 0.01 then
    delete from public.io_rate_limits
    where window_start < now() - interval '1 day';
  end if;

  return v_count <= p_limit;
end;
$$;

-- Fonksiyon security definer olduğu için RLS'i baypas ediyor ve Postgres yeni
-- fonksiyonlara varsayılan olarak PUBLIC execute yetkisi veriyor. Bu hâliyle
-- anon rolü RPC ile çağırıp istediği ip_hash'in sayacını şişirebilir, yani
-- başka bir ziyaretçinin teklif kotasını tüketebilirdi. Yetki yalnızca
-- serverless katmanının kullandığı service_role'a bırakılıyor.
revoke all on function public.io_rate_check(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.io_rate_check(text, text, integer, integer)
  to service_role;
