-- Sigorta Uzmanı - Panel bildirim merkezi şeması
-- Supabase SQL Editor'de veya psql ile çalıştırın.
--
-- Panel kullanıcısı yeni kayıtları menülere tek tek girmeden görsün diye
-- talepler / iptal talepleri / iletişim / satın almalar tabloları realtime
-- yayınına alınıyor. Okundu ve erteleme durumu panel kullanıcısı başına
-- saklanıyor: aynı kaydı bir yönetici okuduğunda diğerinin bildirimi düşmez.

-- ============================================================
-- Bildirim durumları
-- ============================================================

create table if not exists public.admin_bildirim_durumlari (
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Kaynak tablonun takma adı; admin/lib/bildirim/kaynaklar.ts ile aynı olmalı.
  kaynak text not null check (kaynak in (
    'talep',
    'iptal_talep',
    'iletisim',
    'police'
  )),
  kayit_id uuid not null,
  durum text not null default 'okundu'
    check (durum in ('okundu', 'ertelendi')),
  -- Yalnızca durum 'ertelendi' iken dolu. Bildirim bu ana kadar listede
  -- görünmez, sonrasında yeniden okunmamış sayılır.
  hatirlat_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, kaynak, kayit_id)
);

-- Panel açılışında tek sorguyla "bu kullanıcının bastırdığı kayıtlar" çekiliyor.
create index if not exists admin_bildirim_durumlari_user_idx
  on public.admin_bildirim_durumlari (user_id);

alter table public.admin_bildirim_durumlari enable row level security;

-- Her panel kullanıcısı yalnızca kendi bildirim durumunu görür ve yazar.
drop policy if exists "users manage own bildirim durumu"
  on public.admin_bildirim_durumlari;
create policy "users manage own bildirim durumu"
  on public.admin_bildirim_durumlari for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create or replace function public.set_admin_bildirim_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists admin_bildirim_durumlari_set_updated_at
  on public.admin_bildirim_durumlari;
create trigger admin_bildirim_durumlari_set_updated_at
  before update on public.admin_bildirim_durumlari
  for each row
  execute function public.set_admin_bildirim_updated_at();

-- ============================================================
-- Realtime yayını
-- ============================================================
-- Panel yeni kayıtları postgres_changes ile dinliyor. "alter publication ...
-- add table" zaten yayında olan bir tablo için hata verdiğinden, eksik olanlar
-- tek tek ekleniyor; böylece dosya tekrar tekrar çalıştırılabiliyor.
--
-- Yayın yalnızca insert olaylarını taşır, satır içeriği RLS'e tabidir:
-- authenticated rolünün select yetkisi olmayan bir tabloya abone olunamaz.

do $$
declare
  tablo text;
begin
  if not exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    create publication supabase_realtime;
  end if;

  foreach tablo in array array[
    'talepler',
    'iptal_talepleri',
    'iletisim_talepleri',
    'satin_almalar'
  ]
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = tablo
    ) then
      execute format(
        'alter publication supabase_realtime add table public.%I',
        tablo
      );
    end if;
  end loop;
end;
$$;
