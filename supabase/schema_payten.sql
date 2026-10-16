-- ============================================================
-- Payten 3D doğrulamaları
-- ============================================================
-- Satın almadan önce kart sahibinin Payten üzerinden 3D ile doğrulandığı
-- kayıt. Kart numarası ve CVV hiçbir koşulda buraya yazılmaz; yalnızca
-- satın almadaki kartla eşleştirmek için BIN (ilk 6) ve son 4 hane tutulur.
--
-- Durumlar:
--   bekliyor    oturum açıldı, banka dönüşü bekleniyor
--   isleniyor   dönüş geldi, ön provizyon yapılıyor (çift dönüşe kilit)
--   dogrulandi  3D + ön provizyon onaylandı, provizyon iptal edildi
--   basarisiz   3D ya da ön provizyon reddedildi
--   kullanildi  bir satın alma bu doğrulamayı tüketti (tek seferlik)

create table if not exists public.payten_dogrulamalar (
  id uuid primary key default gen_random_uuid(),
  merchant_payment_id text not null unique,
  session_token text not null unique,
  oturum_id uuid not null
    references public.teklif_oturumlari (id) on delete restrict,
  session_id text not null,
  brans_no integer not null,
  teklif_id integer not null,
  sirket_kodu text not null,
  tutar numeric(12, 2) not null,
  status text not null default 'bekliyor'
    check (status in ('bekliyor', 'isleniyor', 'dogrulandi', 'basarisiz', 'kullanildi')),
  md_status text,
  kart_bin text check (kart_bin is null or kart_bin ~ '^[0-9]{6,8}$'),
  kart_son4 text check (kart_son4 is null or kart_son4 ~ '^[0-9]{4}$'),
  pg_tran_id text,
  -- Provizyon iptal edilemezse ekip panelden elle iptal etmeli.
  iptal_edildi boolean,
  hata_mesaji text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payten_dogrulamalar_oturum_idx
  on public.payten_dogrulamalar (oturum_id);
create index if not exists payten_dogrulamalar_created_at_idx
  on public.payten_dogrulamalar (created_at desc);

alter table public.payten_dogrulamalar enable row level security;

grant select, insert, update on public.payten_dogrulamalar to service_role;

drop policy if exists "authenticated can select payten" on public.payten_dogrulamalar;
create policy "authenticated can select payten"
  on public.payten_dogrulamalar for select
  to authenticated
  using (true);

create or replace function public.set_payten_dogrulama_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists payten_dogrulamalar_set_updated_at on public.payten_dogrulamalar;
create trigger payten_dogrulamalar_set_updated_at
  before update on public.payten_dogrulamalar
  for each row
  execute function public.set_payten_dogrulama_updated_at();
