-- Kurumsal bilgiler — veri sorumlusu ve sitede yayımlanan şirket kimliği.
-- Supabase SQL Editor'de çalıştırın. Tekrar çalıştırılabilir; mevcut kaydı günceller.
-- Açık posta adresi bilinçli olarak boş: tebligat KEP ve e-posta üzerinden yürür.

insert into public.site_settings (key, value, is_public)
values (
  'company',
  '{
    "legalName":"GROSS SİGORTA ARACILIK HİZMETLERİ LİMİTED ŞİRKETİ",
    "brandName":"Sigorta Uzmanı",
    "email":"sigorta@sigortauzmani.net",
    "phone":"+908503020032",
    "phoneDisplay":"0850 302 00 32",
    "address":"",
    "taxOffice":"Kartal",
    "taxNumber":"4110856889",
    "mersisNumber":"0411085688900001",
    "kep":"grosssigorta@hs03.kep.tr",
    "tobbNumber":"G08612-15EG",
    "tradeRegistryNumber":"6422-5"
  }'::jsonb,
  true
)
on conflict (key) do update
set value = excluded.value,
    is_public = excluded.is_public,
    updated_at = now();
