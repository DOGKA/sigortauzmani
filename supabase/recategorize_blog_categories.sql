-- Otomatik üretildi: scripts/generate-recategorize-sql.mjs (kaynak: scripts/blog-category-map.mjs)
-- Blog kategorilerini 18'den 5 sabit kategoriye indirger.
-- Sadece "category" kolonunu değiştirir, başka hiçbir alana dokunmaz.
--
-- Kullanım: Bu dosyanın tamamını Supabase Dashboard > SQL Editor içine
-- yapıştırıp çalıştırın (owner/service_role yetkisi gerekir; anon anahtarla
-- RLS nedeniyle satırlar güncellenmez).

begin;

update public.blog_posts
set category = case slug
    when 'trafik-sigortasi-neleri-karsilar' then 'Araç Sigortaları'
    when 'trafik-sigortasi-ile-kasko-arasindaki-fark' then 'Araç Sigortaları'
    when 'imm-sigortasi-nedir-neleri-kapsar' then 'Araç Sigortaları'
    when 'yesil-kart-sigortasi-nedir' then 'Araç Sigortaları'
    when 'kasko-sigortasi-neleri-karsilar' then 'Araç Sigortaları'
    when 'kasko-deger-listesi-nedir' then 'Araç Sigortaları'
    when 'hasarsizlik-indirimi-nedir' then 'Araç Sigortaları'
    when 'trafik-sigortasi-basamaklari' then 'Araç Sigortaları'
    when 'noterde-arac-alim-satim-islemleri-nasil-yapilir' then 'Araç Sigortaları'
    when 'arac-satisinda-guvenli-odeme-sistemi-nasil-kullanilir' then 'Araç Sigortaları'
    when 'arac-plakasi-kaybolursa-ne-yapilmali' then 'Araç Sigortaları'
    when 'aracim-pert-oldu-surec-nasil-isler' then 'Araç Sigortaları'
    when 'kaskodan-on-cam-degisimi-yapilabilir-mi' then 'Araç Sigortaları'
    when 'trafik-sigortasi-limiti-yetersiz-kalirsa-ne-olur' then 'Araç Sigortaları'
    when 'kaza-tespit-tutanagi-nasil-doldurulur' then 'Araç Sigortaları'
    when 'hangi-durumlarda-kaza-tespit-tutanagi-tutulmaz' then 'Araç Sigortaları'
    when 'trafik-kazasinda-kusur-oranina-nasil-itiraz-edilir' then 'Araç Sigortaları'
    when 'park-halindeki-aracima-carpip-kactilar-ne-yapmaliyim' then 'Araç Sigortaları'
    when 'trafik-sigortasi-olmayan-arac-carparsa-hasari-kim-karsilar' then 'Araç Sigortaları'
    when 'arac-deger-kaybi-basvurusu-nasil-yapilir' then 'Araç Sigortaları'
    when 'sigorta-sirketi-hasari-reddederse-ne-yapilmali' then 'Araç Sigortaları'
    when 'sigorta-tahkim-komisyonuna-nasil-basvurulur' then 'Araç Sigortaları'
    when 'kasko-ikame-arac-ne-zaman-verir-kac-gun' then 'Araç Sigortaları'
    when 'kasko-mini-onarim-neleri-kapsar' then 'Araç Sigortaları'
    when 'arac-calinirsa-kasko-sureci-nasil-isler' then 'Araç Sigortaları'
    when 'sel-su-baskini-hasarini-kasko-karsilar-mi' then 'Araç Sigortaları'
    when 'elektrikli-arac-kaskosu-bataryayi-karsilar-mi' then 'Araç Sigortaları'
    when 'sarj-kablosu-wallbox-kasko-kapsaminda-mi' then 'Araç Sigortaları'
    when 'elektrikli-araclarda-kasko-neden-daha-pahali' then 'Araç Sigortaları'
    when 'elektrikli-arac-sarjsiz-kalirsa-yol-yardim' then 'Araç Sigortaları'
    when 'arac-satilinca-trafik-sigortasi-kasko-ne-olur' then 'Araç Sigortaları'
    when 'kasko-hasarsizlik-indirimi-yeni-araca-aktarilir-mi' then 'Araç Sigortaları'
    when 'trafik-sigortasi-yenilemesi-gecikirse-ne-olur' then 'Araç Sigortaları'
    when 'muafiyetli-kasko-nedir-avantajli-mi' then 'Araç Sigortaları'
    when 'tamamlayici-saglik-sigortasi-neleri-kapsar' then 'Sağlık Sigortaları'
    when 'tamamlayici-saglik-sigortasi-fiyatlari-nasil-belirlenir' then 'Sağlık Sigortaları'
    when 'ozel-saglik-sigortasi-neleri-kapsar' then 'Sağlık Sigortaları'
    when 'ozel-saglik-sigortasi-ile-tamamlayici-saglik-sigortasi-farki' then 'Sağlık Sigortaları'
    when 'sgk-olmadan-tamamlayici-saglik-sigortasi-yapilabilir-mi' then 'Sağlık Sigortaları'
    when 'tamamlayici-saglik-sigortasinda-bekleme-suresi-nedir' then 'Sağlık Sigortaları'
    when 'tamamlayici-saglik-sigortasi-kronik-hastaliklari-karsilar-mi' then 'Sağlık Sigortaları'
    when 'omur-boyu-yenileme-garantisi-nedir' then 'Sağlık Sigortaları'
    when 'tamamlayici-saglik-sigortasi-dogumu-karsilar-mi' then 'Sağlık Sigortaları'
    when 'yeni-dogan-bebek-saglik-sigortasina-nasil-eklenir' then 'Sağlık Sigortaları'
    when 'saglik-sigortasinda-provizyon-reddedilirse-ne-yapilmali' then 'Sağlık Sigortaları'
    when 'dask-neleri-karsilar' then 'Konut ve DASK'
    when 'dask-fiyatlari-nasil-hesaplanir' then 'Konut ve DASK'
    when 'dask-ile-konut-sigortasi-arasindaki-fark' then 'Konut ve DASK'
    when 'konut-sigortasi-neleri-kapsar' then 'Konut ve DASK'
    when 'konut-sigortasi-su-kacagini-karsilar-mi' then 'Konut ve DASK'
    when 'kiraci-konut-sigortasi-yaptirabilir-mi' then 'Konut ve DASK'
    when 'evden-komsuya-su-sizarsa-zarari-kim-karsilar' then 'Konut ve DASK'
    when 'dask-teminati-yetersiz-kalirsa-ne-olur' then 'Konut ve DASK'
    when 'deprem-sonrasi-dask-hasar-basvurusu' then 'Konut ve DASK'
    when 'seyahat-saglik-sigortasi-neleri-kapsar' then 'Seyahat Sigortaları'
    when 'seyahat-saglik-sigortasi-zorunlu-mu' then 'Seyahat Sigortaları'
    when 'schengen-vizesi-icin-seyahat-saglik-sigortasi' then 'Seyahat Sigortaları'
    when 'seyahat-saglik-sigortasi-fiyatlari' then 'Seyahat Sigortaları'
    when 'yurt-disinda-hastalanirsam-seyahat-saglik-sigortasi' then 'Seyahat Sigortaları'
    when 'vize-reddedilirse-seyahat-saglik-sigortasi-iptali' then 'Seyahat Sigortaları'
    when 'bagaj-kaybolur-gecikirse-seyahat-sigortasi-karsilar-mi' then 'Seyahat Sigortaları'
    when 'ucus-iptali-rotar-seyahat-sigortasi-kapsaminda-mi' then 'Seyahat Sigortaları'
    when 'sigorta-policesi-nedir-nasil-okunur' then 'Sigorta Rehberi'
    when 'sigorta-policesi-iptali-nasil-yapilir' then 'Sigorta Rehberi'
    when 'hasar-dosyasi-nasil-acilir-takip-edilir' then 'Sigorta Rehberi'
    when 'sigorta-eksperi-nedir-ne-yapar' then 'Sigorta Rehberi'
    when '2026-sigortacilik-mevzuati-degisiklikleri' then 'Sigorta Rehberi'
    when 'hayat-sigortasinda-vergi-avantaji' then 'Sigorta Rehberi'
    else category
  end,
  updated_at = now()
where slug in ('trafik-sigortasi-neleri-karsilar', 'trafik-sigortasi-ile-kasko-arasindaki-fark', 'imm-sigortasi-nedir-neleri-kapsar', 'yesil-kart-sigortasi-nedir', 'kasko-sigortasi-neleri-karsilar', 'kasko-deger-listesi-nedir', 'hasarsizlik-indirimi-nedir', 'trafik-sigortasi-basamaklari', 'noterde-arac-alim-satim-islemleri-nasil-yapilir', 'arac-satisinda-guvenli-odeme-sistemi-nasil-kullanilir', 'arac-plakasi-kaybolursa-ne-yapilmali', 'aracim-pert-oldu-surec-nasil-isler', 'kaskodan-on-cam-degisimi-yapilabilir-mi', 'trafik-sigortasi-limiti-yetersiz-kalirsa-ne-olur', 'kaza-tespit-tutanagi-nasil-doldurulur', 'hangi-durumlarda-kaza-tespit-tutanagi-tutulmaz', 'trafik-kazasinda-kusur-oranina-nasil-itiraz-edilir', 'park-halindeki-aracima-carpip-kactilar-ne-yapmaliyim', 'trafik-sigortasi-olmayan-arac-carparsa-hasari-kim-karsilar', 'arac-deger-kaybi-basvurusu-nasil-yapilir', 'sigorta-sirketi-hasari-reddederse-ne-yapilmali', 'sigorta-tahkim-komisyonuna-nasil-basvurulur', 'kasko-ikame-arac-ne-zaman-verir-kac-gun', 'kasko-mini-onarim-neleri-kapsar', 'arac-calinirsa-kasko-sureci-nasil-isler', 'sel-su-baskini-hasarini-kasko-karsilar-mi', 'elektrikli-arac-kaskosu-bataryayi-karsilar-mi', 'sarj-kablosu-wallbox-kasko-kapsaminda-mi', 'elektrikli-araclarda-kasko-neden-daha-pahali', 'elektrikli-arac-sarjsiz-kalirsa-yol-yardim', 'arac-satilinca-trafik-sigortasi-kasko-ne-olur', 'kasko-hasarsizlik-indirimi-yeni-araca-aktarilir-mi', 'trafik-sigortasi-yenilemesi-gecikirse-ne-olur', 'muafiyetli-kasko-nedir-avantajli-mi', 'tamamlayici-saglik-sigortasi-neleri-kapsar', 'tamamlayici-saglik-sigortasi-fiyatlari-nasil-belirlenir', 'ozel-saglik-sigortasi-neleri-kapsar', 'ozel-saglik-sigortasi-ile-tamamlayici-saglik-sigortasi-farki', 'sgk-olmadan-tamamlayici-saglik-sigortasi-yapilabilir-mi', 'tamamlayici-saglik-sigortasinda-bekleme-suresi-nedir', 'tamamlayici-saglik-sigortasi-kronik-hastaliklari-karsilar-mi', 'omur-boyu-yenileme-garantisi-nedir', 'tamamlayici-saglik-sigortasi-dogumu-karsilar-mi', 'yeni-dogan-bebek-saglik-sigortasina-nasil-eklenir', 'saglik-sigortasinda-provizyon-reddedilirse-ne-yapilmali', 'dask-neleri-karsilar', 'dask-fiyatlari-nasil-hesaplanir', 'dask-ile-konut-sigortasi-arasindaki-fark', 'konut-sigortasi-neleri-kapsar', 'konut-sigortasi-su-kacagini-karsilar-mi', 'kiraci-konut-sigortasi-yaptirabilir-mi', 'evden-komsuya-su-sizarsa-zarari-kim-karsilar', 'dask-teminati-yetersiz-kalirsa-ne-olur', 'deprem-sonrasi-dask-hasar-basvurusu', 'seyahat-saglik-sigortasi-neleri-kapsar', 'seyahat-saglik-sigortasi-zorunlu-mu', 'schengen-vizesi-icin-seyahat-saglik-sigortasi', 'seyahat-saglik-sigortasi-fiyatlari', 'yurt-disinda-hastalanirsam-seyahat-saglik-sigortasi', 'vize-reddedilirse-seyahat-saglik-sigortasi-iptali', 'bagaj-kaybolur-gecikirse-seyahat-sigortasi-karsilar-mi', 'ucus-iptali-rotar-seyahat-sigortasi-kapsaminda-mi', 'sigorta-policesi-nedir-nasil-okunur', 'sigorta-policesi-iptali-nasil-yapilir', 'hasar-dosyasi-nasil-acilir-takip-edilir', 'sigorta-eksperi-nedir-ne-yapar', '2026-sigortacilik-mevzuati-degisiklikleri', 'hayat-sigortasinda-vergi-avantaji');

commit;
