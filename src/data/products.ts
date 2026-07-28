/**
 * Ürün kataloğu. Varlık (asset) import'u içermez; ikonlar için
 * `productIcons.ts` kullanılır. Böylece bu modül Edge fonksiyonlarından
 * (api/prerender) da import edilebilir.
 */

export interface Product {
  slug: string;
  title: string;
  badge?: string;
  seoTitle: string;
  /** Arama sonucu açıklaması — 150-160 karakter hedefli. */
  metaDescription: string;
  /** schema.org Service.serviceType değeri. */
  serviceType: string;
  seoBullets: string[];
}

export const products: Product[] = [
  {
    slug: "trafik-sigortasi",
    title: "Trafik Sigortası",
    seoTitle: "Trafik Sigortası Fiyatları 2026 için Teklif Al",
    metaDescription:
      "2026 zorunlu trafik sigortası fiyatlarını 30'a yakın şirket arasında karşılaştırın. Plaka ve ruhsat bilgisiyle dakikalar içinde ücretsiz teklif alın.",
    serviceType: "Zorunlu Trafik Sigortası",
    seoBullets: [
      "2026 trafik sigortası fiyatlarını farklı sigorta şirketleri arasında karşılaştırın.",
      "Prim; aracın türü, kayıtlı olduğu il ve hasarsızlık basamağına göre hesaplanır.",
      "Zorunlu trafik sigortası, kazada karşı tarafa verilen maddi ve bedeni zararları kapsar.",
      "Plaka ve ruhsat bilgilerinizle size özel güncel trafik sigortası teklifinizi alın.",
    ],
  },
  {
    slug: "kasko",
    title: "Kasko",
    seoTitle: "Kasko Fiyatları 2026 için Teklif Al",
    metaDescription:
      "2026 kasko fiyatlarını ve teminat kapsamlarını karşılaştırın. Dar, genişletilmiş ve tam kasko tekliflerini tek formla ücretsiz alın.",
    serviceType: "Kasko Sigortası",
    seoBullets: [
      "2026 kasko fiyatlarını ve farklı şirketlerin teminat seçeneklerini karşılaştırın.",
      "Kasko primi; araç değeri, model yılı, kullanım ili ve hasar geçmişine göre belirlenir.",
      "Çarpma, çalınma, doğal afet ve ek teminat seçenekleriyle aracınızı güvenceye alın.",
      "Dar kasko, genişletilmiş kasko ve tam kasko tekliflerini tek form üzerinden inceleyin.",
    ],
  },
  {
    slug: "tamamlayici-saglik",
    title: "Tamamlayıcı Sağlık",
    seoTitle: "Tamamlayıcı Sağlık Sigortası Fiyatları 2026 için Teklif Al",
    metaDescription:
      "2026 tamamlayıcı sağlık sigortası (TSS) fiyatlarını ve anlaşmalı hastane ağlarını karşılaştırın. SGK fark ücretlerine karşı ücretsiz teklif alın.",
    serviceType: "Tamamlayıcı Sağlık Sigortası",
    seoBullets: [
      "2026 tamamlayıcı sağlık sigortası fiyatlarını ve anlaşmalı hastane ağlarını karşılaştırın.",
      "SGK ile anlaşmalı özel hastanelerde oluşan fark ücretlerine karşı güvence sağlayın.",
      "Yatarak tedavi, ayakta tedavi ve ek sağlık hizmetleri içeren paketleri inceleyin.",
      "Yaş, ikamet ili ve seçilen teminat kapsamına göre kişiye özel TSS teklifi alın.",
    ],
  },
  {
    slug: "seyahat-saglik",
    title: "Seyahat Sağlık",
    seoTitle: "Seyahat Sağlık Sigortası Fiyatları 2026 için Teklif Al",
    metaDescription:
      "2026 seyahat sağlık sigortası fiyatlarını ülke ve süreye göre karşılaştırın. Schengen vizesine uygun teminatlı poliçeler için ücretsiz teklif alın.",
    serviceType: "Seyahat Sağlık Sigortası",
    seoBullets: [
      "2026 seyahat sağlık sigortası fiyatlarını gideceğiniz ülke ve seyahat süresine göre karşılaştırın.",
      "Yurt dışında acil tedavi, hastane, ambulans ve tıbbi nakil giderlerine karşı korunun.",
      "Schengen vizesine uygun teminat limitlerine sahip seyahat poliçelerini inceleyin.",
      "Tek seyahat veya yıllık çoklu seyahat seçenekleri için hızlıca teklif alın.",
    ],
  },
  {
    slug: "imm",
    title: "İMM",
    seoTitle: "İMM Sigortası Fiyatları 2026 için Teklif Al",
    metaDescription:
      "2026 İMM (İhtiyari Mali Mesuliyet) sigortası fiyatlarını karşılaştırın. Trafik sigortası limitini aşan zararlar için ücretsiz teklif alın.",
    serviceType: "İhtiyari Mali Mesuliyet Sigortası",
    seoBullets: [
      "2026 İMM sigortası fiyatlarını ve yüksek teminat limitlerini karşılaştırın.",
      "Trafik sigortası limitini aşan maddi ve bedeni zararlar için ek güvence sağlayın.",
      "Araç türünüze ve risk profilinize uygun limitli veya sınırsız İMM seçeneklerini inceleyin.",
      "Kaskodan bağımsız İhtiyari Mali Mesuliyet Sigortası için size özel teklif alın.",
    ],
  },
  {
    slug: "ozel-saglik",
    title: "Özel Sağlık",
    seoTitle: "Özel Sağlık Sigortası Fiyatları 2026 için Teklif Al",
    metaDescription:
      "2026 özel sağlık sigortası fiyatlarını, hastane ağlarını ve poliçe kapsamlarını karşılaştırın. Yatarak ve ayakta tedavi için ücretsiz teklif alın.",
    serviceType: "Özel Sağlık Sigortası",
    seoBullets: [
      "2026 özel sağlık sigortası fiyatlarını, hastane ağlarını ve poliçe kapsamlarını karşılaştırın.",
      "SGK şartı olmadan yatarak ve ayakta tedavi seçeneklerinden yararlanın.",
      "Primler; yaş, sağlık beyanı, ikamet ili ve tercih edilen kurum ağına göre hesaplanır.",
      "İhtiyacınıza uygun limit, katılım payı ve yurt dışı teminatlarıyla teklif alın.",
    ],
  },
  {
    slug: "dask",
    title: "DASK",
    seoTitle: "DASK Fiyatları 2026 için Teklif Al",
    metaDescription:
      "2026 DASK fiyatını adres, brüt metrekare ve yapı tarzına göre hesaplatın. Zorunlu Deprem Sigortası poliçenizi ücretsiz teklifle oluşturun veya yenileyin.",
    serviceType: "Zorunlu Deprem Sigortası (DASK)",
    seoBullets: [
      "2026 DASK fiyatını adres, brüt metrekare, yapı tarzı ve deprem riskine göre hesaplatın.",
      "Zorunlu Deprem Sigortası ile deprem ve deprem kaynaklı bina hasarlarını güvenceye alın.",
      "Konutunuzun güncel yapı bilgileriyle DASK poliçenizi kolayca oluşturun veya yenileyin.",
      "Güncel DASK teminatı ve prim tutarı için birkaç adımda size özel teklif alın.",
    ],
  },
  {
    slug: "yesil-kart",
    title: "Yeşil Kart",
    badge: "Yeni",
    seoTitle: "Yeşil Kart Sigortası Fiyatları 2026 için Teklif Al",
    metaDescription:
      "2026 Yeşil Kart Sigortası fiyatlarını araç türü ve süreye göre öğrenin. Aracınızla yurt dışına çıkmadan önce 15 gün-1 yıl arası poliçe teklifi alın.",
    serviceType: "Yeşil Kart Sigortası",
    seoBullets: [
      "2026 Yeşil Kart Sigortası fiyatlarını araç türü ve poliçe süresine göre öğrenin.",
      "Aracınızla yurt dışına çıkarken geçerli uluslararası trafik sigortanızı hazırlayın.",
      "Yurt dışında üçüncü kişilere verebileceğiniz maddi ve bedeni zararlara karşı korunun.",
      "15 günden 1 yıla kadar süre seçenekleriyle seyahatinize uygun teklif alın.",
    ],
  },
  {
    slug: "konut",
    title: "Konut Sigortası",
    seoTitle: "Konut Sigortası Fiyatları 2026 için Teklif Al",
    metaDescription:
      "2026 konut sigortası fiyatlarını karşılaştırın. Yangın, su basması, hırsızlık ve doğal afet teminatlarıyla eviniz için ücretsiz teklif alın.",
    serviceType: "Konut Sigortası",
    seoBullets: [
      "2026 konut sigortası fiyatlarını farklı sigorta şirketleri arasında karşılaştırın.",
      "Yangın, su basması, hırsızlık ve doğal afetlere karşı binanızı ve eşyalarınızı güvenceye alın.",
      "Prim; konutun adresi, brüt metrekaresi, yapı tarzı ve seçilen teminat limitlerine göre hesaplanır.",
      "Cam kırılması, izolasyon ve hukuksal koruma gibi ek teminatlarla poliçenizi ihtiyacınıza göre şekillendirin.",
    ],
  },
];

// Ana sayfadaki ikon grid'i dört sütunlu olduğu için sekiz üründe tutuluyor
export const heroProducts: Product[] = products.filter(
  (p) => p.slug !== "konut",
);

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
