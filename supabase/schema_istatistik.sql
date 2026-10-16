-- ============================================================
-- Herkese açık teklif istatistikleri
-- ============================================================
-- Teklif akışındaki güven şeridi (`/api/istatistik`) buradan beslenir.
-- Sayılar teklif_oturumlari / teklif_fiyatlari / satin_almalar / talepler
-- tablolarından ve sistem öncesi döneme ait belgelenmiş başlangıç
-- değerlerinden hesaplanır.
--
-- Fonksiyon security definer: tablolarda anon'a yetki yok ve olmamalı.
-- Dışarı yalnızca toplu sayılar çıkar; kimlik, plaka, prim satırı çıkmaz.
--
-- Eşiğin altındaki metrikler null döner ve arayüzde hiç gösterilmez.

-- ============================================================
-- Sistem öncesi başlangıç değerleri
-- ============================================================
-- Online sistemden önce acentenin kestiği poliçeler ve verdiği teklifler.
--
-- sayim_tarihi: başlangıç değerinin kapsadığı son gün. Sistem kayıtları bu
-- tarihten sonrası için sayılır, böylece aynı poliçe iki kez sayılmaz.
--
-- Doldurmak için (tek satır):
--   insert into public.istatistik_baslangic
--     (police_sayisi, teklif_sayisi, sayim_tarihi)
--   values (18250, 41000, '2026-09-30')
--   on conflict (id) do update set
--     police_sayisi = excluded.police_sayisi,
--     teklif_sayisi = excluded.teklif_sayisi,
--     sayim_tarihi = excluded.sayim_tarihi,
--     updated_at = now();

create table if not exists public.istatistik_baslangic (
  id boolean primary key default true check (id),
  police_sayisi integer not null default 0 check (police_sayisi >= 0),
  teklif_sayisi integer not null default 0 check (teklif_sayisi >= 0),
  sayim_tarihi date not null,
  updated_at timestamptz not null default now()
);

alter table public.istatistik_baslangic enable row level security;
revoke all on public.istatistik_baslangic from anon, authenticated;

create index if not exists teklif_fiyatlari_created_at_idx
  on public.teklif_fiyatlari (created_at desc);

create index if not exists satin_almalar_basarili_created_at_idx
  on public.satin_almalar (created_at desc)
  where status = 'basarili';

create index if not exists talepler_created_at_idx
  on public.talepler (created_at desc);

drop function if exists public.get_public_teklif_istatistik();

create or replace function public.get_public_teklif_istatistik()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with
  baslangic as (
    select
      coalesce(max(b.police_sayisi), 0) as police,
      coalesce(max(b.teklif_sayisi), 0) as teklif,
      -- Başlangıç değeri yoksa sistem kayıtlarının tamamı sayılır.
      coalesce(
        (max(b.sayim_tarihi) + 1)::timestamp at time zone 'Europe/Istanbul',
        '-infinity'::timestamptz
      ) as kesim
    from istatistik_baslangic b
  ),
  oturumlar as (
    select count(*)::int as n
    from teklif_oturumlari, baslangic
    where created_at >= baslangic.kesim
      and status in ('teklif_calisti', 'secildi', 'satin_alindi')
  ),
  -- Fiyat listesinden açılan talepte gösterilen prim dolu; o kullanıcı
  -- zaten teklif oturumu olarak sayıldı. Burada yalnızca formdan gelenler.
  form_talepleri as (
    select count(*)::int as n
    from talepler, baslangic
    where created_at >= baslangic.kesim
      and gosterilen_prim is null
      and status <> 'iptal'
  ),
  policeler as (
    select count(*)::int as n
    from satin_almalar, baslangic
    where created_at >= baslangic.kesim
      and status = 'basarili'
  ),
  -- Son 90 günde müşteriye listelenebilir fiyat veren şirketler.
  sirketler as (
    select count(distinct sirket_kodu)::int as n
    from teklif_fiyatlari
    where created_at >= now() - interval '90 days'
      and prim > 0
      and coalesce(raw ->> 'SatinAl', '') <> 'false'
      and coalesce(btrim(raw ->> 'Hata'), '') = ''
  ),
  toplamlar as (
    select
      b.teklif + o.n + t.n as teklif,
      b.police + p.n as police
    from baslangic b, oturumlar o, form_talepleri t, policeler p
  ),
  -- "En popüler" etiketi: branşta son 90 günde sitede en çok satın alınan
  -- şirket. En az 3 satış şartı var; zirvede eşitlik varsa etiket verilmez.
  satislar as (
    select brans_no, sirket_kodu, count(*)::int as n
    from satin_almalar
    where created_at >= now() - interval '90 days'
      and status = 'basarili'
    group by brans_no, sirket_kodu
  ),
  zirve as (
    select brans_no, max(n) as n
    from satislar
    group by brans_no
  ),
  populer as (
    select s.brans_no, min(s.sirket_kodu) as sirket_kodu
    from satislar s
    join zirve z on z.brans_no = s.brans_no and z.n = s.n
    where z.n >= 3
    group by s.brans_no
    having count(*) = 1
  )
  select jsonb_build_object(
    'teklif_toplam', case when tp.teklif >= 50 then tp.teklif end,
    'police_toplam', case when tp.police >= 10 then tp.police end,
    'sirket_sayisi', case when s.n >= 3 then s.n end,
    'populer', coalesce(
      (select jsonb_object_agg(brans_no::text, sirket_kodu) from populer),
      '{}'::jsonb
    )
  )
  from toplamlar tp, sirketler s;
$$;

revoke all on function public.get_public_teklif_istatistik() from public;
grant execute on function public.get_public_teklif_istatistik()
  to anon, authenticated, service_role;

drop function if exists public.get_public_aktif_teklif(text);
drop index if exists public.teklif_oturumlari_urun_created_idx;

-- ============================================================
-- Ürün sayfasındaki anlık ziyaretçi göstergesi
-- ============================================================
-- Her görünür tarayıcı sekmesi 15 saniyede bir son_gorulme değerini yeniler.
-- Kapanış isteği ulaşmazsa kayıt 75 saniye sonra kendiliğinden geçersizdir.
-- Gösterilen sayı, veritabanında 10 dakikada bir üretilen 10–25 arası taban
-- değere o anda aktif olan gerçek oturumların eklenmesiyle hesaplanır.

create table if not exists public.urun_aktif_ziyaretciler (
  urun_slug text not null,
  oturum_id uuid not null,
  son_gorulme timestamptz not null default now(),
  primary key (urun_slug, oturum_id)
);

create index if not exists urun_aktif_ziyaretciler_son_gorulme_idx
  on public.urun_aktif_ziyaretciler (son_gorulme);

create table if not exists public.urun_ziyaretci_taban (
  urun_slug text primary key,
  taban smallint not null check (taban between 10 and 25),
  yenileme_zamani timestamptz not null
);

alter table public.urun_aktif_ziyaretciler enable row level security;
alter table public.urun_ziyaretci_taban enable row level security;
revoke all on public.urun_aktif_ziyaretciler from anon, authenticated;
revoke all on public.urun_ziyaretci_taban from anon, authenticated;

drop function if exists public.urun_ziyaretci_guncelle(text, uuid, boolean);

create or replace function public.urun_ziyaretci_guncelle(
  p_urun_slug text,
  p_oturum_id uuid,
  p_aktif boolean default true
)
returns integer
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_taban integer;
  v_aktif integer;
begin
  if p_urun_slug is null
    or p_urun_slug !~ '^[a-z0-9-]{1,80}$'
    or p_oturum_id is null
  then
    raise exception 'Gecersiz urun veya oturum';
  end if;

  delete from public.urun_aktif_ziyaretciler
  where son_gorulme < now() - interval '75 seconds';

  if p_aktif then
    insert into public.urun_aktif_ziyaretciler
      (urun_slug, oturum_id, son_gorulme)
    values
      (p_urun_slug, p_oturum_id, now())
    on conflict (urun_slug, oturum_id) do update
      set son_gorulme = excluded.son_gorulme;
  else
    delete from public.urun_aktif_ziyaretciler
    where urun_slug = p_urun_slug
      and oturum_id = p_oturum_id;
  end if;

  insert into public.urun_ziyaretci_taban
    (urun_slug, taban, yenileme_zamani)
  values
    (
      p_urun_slug,
      10 + floor(random() * 16)::integer,
      now() + interval '10 minutes'
    )
  on conflict (urun_slug) do update set
    taban = case
      when urun_ziyaretci_taban.yenileme_zamani <= now()
        then excluded.taban
      else urun_ziyaretci_taban.taban
    end,
    yenileme_zamani = case
      when urun_ziyaretci_taban.yenileme_zamani <= now()
        then excluded.yenileme_zamani
      else urun_ziyaretci_taban.yenileme_zamani
    end
  returning taban into v_taban;

  select count(*)::integer
  into v_aktif
  from public.urun_aktif_ziyaretciler
  where urun_slug = p_urun_slug
    and son_gorulme >= now() - interval '75 seconds';

  return v_taban + v_aktif;
end;
$$;

revoke all on function public.urun_ziyaretci_guncelle(text, uuid, boolean)
  from public;
grant execute on function public.urun_ziyaretci_guncelle(text, uuid, boolean)
  to anon, authenticated, service_role;
