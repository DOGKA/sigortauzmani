-- Sigorta Uzmanı - site ayarları, yasal belgeler ve e-posta gönderim günlüğü
-- Supabase SQL Editor'de veya psql ile çalıştırın. Tekrar çalıştırılabilir.

create extension if not exists pgcrypto;

create table if not exists public.site_settings (
  key text primary key check (key in (
    'company', 'analytics', 'products', 'maintenance', 'notifications'
  )),
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create table if not exists public.legal_documents (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  locale text not null check (locale in ('tr', 'en', 'ar', 'fa')),
  title text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, locale)
);

create table if not exists public.legal_document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.legal_documents (id) on delete cascade,
  version integer not null check (version > 0),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'unpublished')),
  content jsonb not null default '{"intro":[],"sections":[]}'::jsonb,
  effective_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  unique (document_id, version)
);

create unique index if not exists legal_versions_one_published_idx
  on public.legal_document_versions (document_id)
  where status = 'published';

create index if not exists legal_versions_document_idx
  on public.legal_document_versions (document_id, version desc);

create table if not exists public.notification_send_log (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('talep', 'iptal', 'iletisim', 'test')),
  reference text,
  recipients text[] not null default '{}',
  status text not null check (status in ('sent', 'skipped', 'error')),
  provider_id text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists notification_send_log_created_idx
  on public.notification_send_log (created_at desc);

alter table public.site_settings enable row level security;
alter table public.legal_documents enable row level security;
alter table public.legal_document_versions enable row level security;
alter table public.notification_send_log enable row level security;

-- Tablolar doğrudan istemciye açılmaz. Yönetim API'si service_role kullanır;
-- yayımlanmış kamusal veri yalnızca aşağıdaki sabit alanlı RPC ile okunur.
revoke all on public.site_settings from anon, authenticated;
revoke all on public.legal_documents from anon, authenticated;
revoke all on public.legal_document_versions from anon, authenticated;
revoke all on public.notification_send_log from anon, authenticated;

create or replace function public.set_settings_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_settings_updated_at();

drop trigger if exists legal_documents_set_updated_at on public.legal_documents;
create trigger legal_documents_set_updated_at
  before update on public.legal_documents
  for each row execute function public.set_settings_updated_at();

drop trigger if exists legal_versions_set_updated_at
  on public.legal_document_versions;
create trigger legal_versions_set_updated_at
  before update on public.legal_document_versions
  for each row execute function public.set_settings_updated_at();

create or replace function public.get_public_site_settings()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    jsonb_object_agg(key, value),
    '{}'::jsonb
  )
  from public.site_settings
  where is_public
    and key in ('company', 'analytics', 'products', 'maintenance');
$$;

alter table public.talepler add column if not exists locale text;
alter table public.teklif_oturumlari add column if not exists locale text;

grant execute on function public.get_public_site_settings() to anon, authenticated;

insert into public.site_settings (key, value, is_public)
values
  ('company', '{
    "legalName":"GROSS SİGORTA ARACILIK HİZMETLERİ LİMİTED ŞİRKETİ",
    "brandName":"Sigorta Uzmanı",
    "email":"sigorta@sigortauzmani.net","phone":"+908503020032",
    "phoneDisplay":"0850 302 00 32","address":"",
    "taxOffice":"Kartal","taxNumber":"4110856889",
    "mersisNumber":"0411085688900001","kep":"grosssigorta@hs03.kep.tr",
    "tobbNumber":"G08612-15EG","tradeRegistryNumber":"6422-5"
  }'::jsonb, true),
  ('analytics', '{
    "provider":"none","ga4MeasurementId":"","gtmContainerId":""
  }'::jsonb, true),
  ('products', '{
    "enabledSlugs":["trafik-sigortasi","kasko","kisa-sureli-trafik",
    "tamamlayici-saglik","seyahat-saglik","imm","ozel-saglik","dask",
    "yesil-kart","konut"]
  }'::jsonb, true),
  ('maintenance', '{
    "enabled":false,"title":"Kısa bir bakımdayız",
    "message":"Hizmetimizi iyileştiriyoruz. Lütfen kısa bir süre sonra yeniden deneyin."
  }'::jsonb, true),
  ('notifications', '{
    "enabled":true,"recipients":["sigorta@sigortauzmani.net"],
    "talepEnabled":true,"iptalEnabled":true,"iletisimEnabled":true
  }'::jsonb, false)
on conflict (key) do nothing;

-- Mevcut dört Türkçe yasal metnin ilk yayımlanmış sürümü. Uygulama içindeki
-- ayrıntılı metinler taşınırken yönetim panelinden yeni sürüm açılabilir.
insert into public.legal_documents (slug, locale, title, description)
values
  ('kvkk', 'tr', 'Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni',
   '6698 sayılı KVKK kapsamındaki aydınlatma metni.'),
  ('gizlilik-politikasi', 'tr', 'Gizlilik Politikası',
   'Teklif, form, ödeme ve bilgi güvenliği süreçleri.'),
  ('cerez-politikasi', 'tr', 'Çerez ve Benzeri Teknolojiler Politikası',
   'Çerez kullanımı ve tercih yönetimi.'),
  ('kvkk-basvuru', 'tr', 'KVKK Başvuru Formu',
   'KVKK kapsamındaki başvuru kanalları ve gerekli bilgiler.')
on conflict (slug, locale) do nothing;

insert into public.legal_document_versions
  (document_id, version, status, content, effective_at, published_at)
select
  d.id,
  1,
  'published',
  jsonb_build_object(
    'intro', jsonb_build_array(d.description),
    'sections', case d.slug
      when 'kvkk' then jsonb_build_array(
        jsonb_build_object('heading','Veri sorumlusu ve kapsam',
          'paragraphs',jsonb_build_array(
            'Kişisel verileriniz 6698 sayılı Kanun kapsamında, sigorta teklifi ve hizmet süreçlerinin yürütülmesi, iletişim, güvenlik ve yasal yükümlülüklerin yerine getirilmesi amaçlarıyla işlenir.')),
        jsonb_build_object('heading','Haklarınız',
          'paragraphs',jsonb_build_array(
            'KVKK’nın 11. maddesindeki haklarınıza ilişkin taleplerinizi şirketin ilan edilen iletişim kanallarından iletebilirsiniz.')))
      when 'gizlilik-politikasi' then jsonb_build_array(
        jsonb_build_object('heading','Bilgilerin kullanımı',
          'paragraphs',jsonb_build_array(
            'Teklif ve iletişim formlarında paylaşılan bilgiler yalnızca talep edilen hizmetin yürütülmesi, güvenlik ve yasal yükümlülükler için kullanılır.')),
        jsonb_build_object('heading','Ödeme güvenliği',
          'paragraphs',jsonb_build_array(
            'Kart bilgileri Sigorta Uzmanı tarafından görülmez, işlenmez veya saklanmaz.')))
      when 'cerez-politikasi' then jsonb_build_array(
        jsonb_build_object('heading','Çerez tercihleri',
          'paragraphs',jsonb_build_array(
            'Zorunlu olmayan analiz ve pazarlama teknolojileri yalnızca tercihiniz doğrultusunda çalıştırılır. Tercihlerinizi dilediğiniz zaman değiştirebilirsiniz.')))
      else jsonb_build_array(
        jsonb_build_object('heading','Başvuru',
          'paragraphs',jsonb_build_array(
            'Başvurunuzda kimlik ve iletişim bilgileriniz, talebinizin konusu ve varsa destekleyici belgeler bulunmalıdır. Başvurular en geç otuz gün içinde sonuçlandırılır.')))
    end
  ),
  '2026-09-01 00:00:00+03'::timestamptz,
  '2026-09-01 00:00:00+03'::timestamptz
from public.legal_documents d
where d.locale = 'tr'
  and d.slug in ('kvkk','gizlilik-politikasi','cerez-politikasi','kvkk-basvuru')
on conflict (document_id, version) do nothing;
