/**
 * Telefonu SMS koduyla doğrulanmadan ilerlenemeyen ürünler.
 *
 * Hem arayüz (modalın açılıp açılmayacağı) hem sunucu (`/api/io/teklif`,
 * `/api/talep`) aynı listeyi okuyor; ikisi ayrışırsa ya modal boşuna açılır
 * ya da doğrulanmamış talep sunucuda reddedilir.
 */
const SMS_DOGRULAMALI_URUNLER = new Set([
  "trafik-sigortasi",
  "kisa-sureli-trafik",
  "kasko",
  "imm",
  "seyahat-saglik",
  "dask",
  "tamamlayici-saglik",
  "ozel-saglik",
]);

export function smsDogrulamaGerekli(slug: string): boolean {
  return SMS_DOGRULAMALI_URUNLER.has(slug);
}

/** Kodun geçerlilik süresi. */
export const SMS_KOD_SURESI_SN = 120;

/** Aynı numaraya yeni kod istenebilmesi için beklenecek süre. */
export const SMS_TEKRAR_SURESI_SN = 30;

/** Bir kod için izin verilen yanlış deneme sayısı. */
export const SMS_MAX_DENEME = 5;

export const SMS_KOD_UZUNLUGU = 6;
