/**
 * Blog kategorilerini 18'den 5 sabit kategoriye indirger.
 * Hem canlı DB güncelleme scriptinde hem kaynak JSON dosyalarını
 * güncelleyen scriptte tek doğruluk kaynağı olarak kullanılır.
 */

export const FINAL_CATEGORIES = [
  "Araç Sigortaları",
  "Sağlık Sigortaları",
  "Konut ve DASK",
  "Seyahat Sigortaları",
  "Sigorta Rehberi",
];

/** slug -> yeni kategori (68 yazının tamamını kapsar) */
export const CATEGORY_MAP = {
  // Araç Sigortaları
  "trafik-sigortasi-neleri-karsilar": "Araç Sigortaları",
  "trafik-sigortasi-ile-kasko-arasindaki-fark": "Araç Sigortaları",
  "imm-sigortasi-nedir-neleri-kapsar": "Araç Sigortaları",
  "yesil-kart-sigortasi-nedir": "Araç Sigortaları",
  "kasko-sigortasi-neleri-karsilar": "Araç Sigortaları",
  "kasko-deger-listesi-nedir": "Araç Sigortaları",
  "hasarsizlik-indirimi-nedir": "Araç Sigortaları",
  "trafik-sigortasi-basamaklari": "Araç Sigortaları",
  "noterde-arac-alim-satim-islemleri-nasil-yapilir": "Araç Sigortaları",
  "arac-satisinda-guvenli-odeme-sistemi-nasil-kullanilir": "Araç Sigortaları",
  "arac-plakasi-kaybolursa-ne-yapilmali": "Araç Sigortaları",
  "aracim-pert-oldu-surec-nasil-isler": "Araç Sigortaları",
  "kaskodan-on-cam-degisimi-yapilabilir-mi": "Araç Sigortaları",
  "trafik-sigortasi-limiti-yetersiz-kalirsa-ne-olur": "Araç Sigortaları",
  "kaza-tespit-tutanagi-nasil-doldurulur": "Araç Sigortaları",
  "hangi-durumlarda-kaza-tespit-tutanagi-tutulmaz": "Araç Sigortaları",
  "trafik-kazasinda-kusur-oranina-nasil-itiraz-edilir": "Araç Sigortaları",
  "park-halindeki-aracima-carpip-kactilar-ne-yapmaliyim": "Araç Sigortaları",
  "trafik-sigortasi-olmayan-arac-carparsa-hasari-kim-karsilar": "Araç Sigortaları",
  "arac-deger-kaybi-basvurusu-nasil-yapilir": "Araç Sigortaları",
  "sigorta-sirketi-hasari-reddederse-ne-yapilmali": "Araç Sigortaları",
  "sigorta-tahkim-komisyonuna-nasil-basvurulur": "Araç Sigortaları",
  "kasko-ikame-arac-ne-zaman-verir-kac-gun": "Araç Sigortaları",
  "kasko-mini-onarim-neleri-kapsar": "Araç Sigortaları",
  "arac-calinirsa-kasko-sureci-nasil-isler": "Araç Sigortaları",
  "sel-su-baskini-hasarini-kasko-karsilar-mi": "Araç Sigortaları",
  "elektrikli-arac-kaskosu-bataryayi-karsilar-mi": "Araç Sigortaları",
  "sarj-kablosu-wallbox-kasko-kapsaminda-mi": "Araç Sigortaları",
  "elektrikli-araclarda-kasko-neden-daha-pahali": "Araç Sigortaları",
  "elektrikli-arac-sarjsiz-kalirsa-yol-yardim": "Araç Sigortaları",
  "arac-satilinca-trafik-sigortasi-kasko-ne-olur": "Araç Sigortaları",
  "kasko-hasarsizlik-indirimi-yeni-araca-aktarilir-mi": "Araç Sigortaları",
  "trafik-sigortasi-yenilemesi-gecikirse-ne-olur": "Araç Sigortaları",
  "muafiyetli-kasko-nedir-avantajli-mi": "Araç Sigortaları",

  // Sağlık Sigortaları
  "tamamlayici-saglik-sigortasi-neleri-kapsar": "Sağlık Sigortaları",
  "tamamlayici-saglik-sigortasi-fiyatlari-nasil-belirlenir": "Sağlık Sigortaları",
  "ozel-saglik-sigortasi-neleri-kapsar": "Sağlık Sigortaları",
  "ozel-saglik-sigortasi-ile-tamamlayici-saglik-sigortasi-farki": "Sağlık Sigortaları",
  "sgk-olmadan-tamamlayici-saglik-sigortasi-yapilabilir-mi": "Sağlık Sigortaları",
  "tamamlayici-saglik-sigortasinda-bekleme-suresi-nedir": "Sağlık Sigortaları",
  "tamamlayici-saglik-sigortasi-kronik-hastaliklari-karsilar-mi": "Sağlık Sigortaları",
  "omur-boyu-yenileme-garantisi-nedir": "Sağlık Sigortaları",
  "tamamlayici-saglik-sigortasi-dogumu-karsilar-mi": "Sağlık Sigortaları",
  "yeni-dogan-bebek-saglik-sigortasina-nasil-eklenir": "Sağlık Sigortaları",
  "saglik-sigortasinda-provizyon-reddedilirse-ne-yapilmali": "Sağlık Sigortaları",

  // Konut ve DASK
  "dask-neleri-karsilar": "Konut ve DASK",
  "dask-fiyatlari-nasil-hesaplanir": "Konut ve DASK",
  "dask-ile-konut-sigortasi-arasindaki-fark": "Konut ve DASK",
  "konut-sigortasi-neleri-kapsar": "Konut ve DASK",
  "konut-sigortasi-su-kacagini-karsilar-mi": "Konut ve DASK",
  "kiraci-konut-sigortasi-yaptirabilir-mi": "Konut ve DASK",
  "evden-komsuya-su-sizarsa-zarari-kim-karsilar": "Konut ve DASK",
  "dask-teminati-yetersiz-kalirsa-ne-olur": "Konut ve DASK",
  "deprem-sonrasi-dask-hasar-basvurusu": "Konut ve DASK",

  // Seyahat Sigortaları
  "seyahat-saglik-sigortasi-neleri-kapsar": "Seyahat Sigortaları",
  "seyahat-saglik-sigortasi-zorunlu-mu": "Seyahat Sigortaları",
  "schengen-vizesi-icin-seyahat-saglik-sigortasi": "Seyahat Sigortaları",
  "seyahat-saglik-sigortasi-fiyatlari": "Seyahat Sigortaları",
  "yurt-disinda-hastalanirsam-seyahat-saglik-sigortasi": "Seyahat Sigortaları",
  "vize-reddedilirse-seyahat-saglik-sigortasi-iptali": "Seyahat Sigortaları",
  "bagaj-kaybolur-gecikirse-seyahat-sigortasi-karsilar-mi": "Seyahat Sigortaları",
  "ucus-iptali-rotar-seyahat-sigortasi-kapsaminda-mi": "Seyahat Sigortaları",

  // Sigorta Rehberi (genel / mevzuat / vergi konuları)
  "sigorta-policesi-nedir-nasil-okunur": "Sigorta Rehberi",
  "sigorta-policesi-iptali-nasil-yapilir": "Sigorta Rehberi",
  "hasar-dosyasi-nasil-acilir-takip-edilir": "Sigorta Rehberi",
  "sigorta-eksperi-nedir-ne-yapar": "Sigorta Rehberi",
  "2026-sigortacilik-mevzuati-degisiklikleri": "Sigorta Rehberi",
  "hayat-sigortasinda-vergi-avantaji": "Sigorta Rehberi",
};
