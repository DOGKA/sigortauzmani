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
    seoTitle: "Trafik Sigortası 2026 Fiyatları ve Teklifleri | Sigorta Uzmanı",
    metaDescription:
      "2026 trafik sigortası fiyatlarını 30'a yakın sigorta şirketi arasında karşılaştırın; plaka ve ruhsat bilgilerinizle anlık teklif alın.",
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
    seoTitle: "Kasko Sigortası 2026 Fiyatları ve Teklifleri | Sigorta Uzmanı",
    metaDescription:
      "2026 kasko tekliflerinde fiyat, teminat, muafiyet ve ek hizmetleri karşılaştırın; uygun seçeneklerde çevrim içi satın alma adımına geçin.",
    serviceType: "Kasko Sigortası",
    seoBullets: [
      "2026 kasko fiyatlarını ve farklı şirketlerin teminat seçeneklerini karşılaştırın.",
      "Kasko primi; araç değeri, model yılı, kullanım ili ve hasar geçmişine göre belirlenir.",
      "Çarpma, çalınma, doğal afet ve ek teminat seçenekleriyle aracınızı güvenceye alın.",
      "Dar kasko, genişletilmiş kasko ve tam kasko tekliflerini tek form üzerinden inceleyin.",
    ],
  },
  {
    slug: "kisa-sureli-trafik",
    title: "Kısa Süreli Trafik",
    badge: "Yeni",
    seoTitle: "Kısa Süreli Trafik Sigortası 2026 Fiyatları | Sigorta Uzmanı",
    metaDescription:
      "2026 kısa süreli trafik sigortası fiyatlarını karşılaştırın; plaka ve ruhsat bilgilerinizle teklif alın.",
    serviceType: "Kısa Süreli Zorunlu Trafik Sigortası",
    seoBullets: [
      "Kısa süreli trafik sigortası fiyatlarını farklı sigorta şirketleri arasında karşılaştırın.",
      "Noter satışı, devir ve geçici kullanım gibi bir yıldan kısa süreli ihtiyaçlar için düzenlenir.",
      "Teminat kapsamı yıllık zorunlu trafik sigortasıyla aynıdır; yalnızca poliçe süresi kısadır.",
      "Plaka ve ruhsat bilgilerinizle size özel kısa süreli trafik sigortası teklifinizi alın.",
    ],
  },
  {
    slug: "tamamlayici-saglik",
    title: "Tamamlayıcı Sağlık",
    seoTitle: "Tamamlayıcı Sağlık Sigortası 2026 Fiyatları | Sigorta Uzmanı",
    metaDescription:
      "SGK ile anlaşmalı özel hastanelerde poliçe kapsamındaki fark ücretleri için 2026 tamamlayıcı sağlık sigortası tekliflerini ve hastane ağlarını karşılaştırın.",
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
    seoTitle: "Seyahat Sağlık Sigortası 2026 Fiyatları | Sigorta Uzmanı",
    metaDescription:
      "Gideceğiniz ülke ve seyahat süresine göre 2026 seyahat sağlık sigortası tekliflerini karşılaştırın; vize koşullarına uygun kapsamı kontrol edin.",
    serviceType: "Seyahat Sağlık Sigortası",
    seoBullets: [
      "2026 seyahat sağlık sigortası fiyatlarını gideceğiniz ülke ve seyahat süresine göre karşılaştırın.",
      "Yurt dışında acil tedavi, hastane, ambulans ve tıbbi nakil giderlerine karşı korunun.",
      "Vize başvurusu için poliçenin güncel konsolosluk koşullarını karşıladığını kontrol edin.",
      "Tek seyahat veya yıllık çoklu seyahat seçenekleri için hızlıca teklif alın.",
    ],
  },
  {
    slug: "imm",
    title: "İMM",
    seoTitle: "İMM Sigortası 2026 Fiyatları ve Teklifleri | Sigorta Uzmanı",
    metaDescription:
      "Trafik sigortası limitlerini aşan sorumluluklar için 2026 İMM tekliflerini ve teminat limitlerini karşılaştırın.",
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
    seoTitle: "Özel Sağlık Sigortası 2026 Fiyatları | Sigorta Uzmanı",
    metaDescription:
      "Yatarak ve ayakta tedavi seçenekleri ile anlaşmalı hastane ağlarını karşılaştırarak 2026 özel sağlık sigortası teklifi alın.",
    serviceType: "Özel Sağlık Sigortası",
    seoBullets: [
      "2026 özel sağlık sigortası fiyatlarını, hastane ağlarını ve poliçe kapsamlarını karşılaştırın.",
      "SGK şartı olmadan yatarak ve ayakta tedavi seçeneklerinden yararlanın.",
      "Primler; yaş, ikamet ili ve tercih edilen kurum ağına göre hesaplanır.",
      "İhtiyacınıza uygun limit, katılım payı ve yurt dışı teminatlarıyla teklif alın.",
    ],
  },
  {
    slug: "dask",
    title: "DASK",
    seoTitle: "DASK 2026 Fiyatları ve Teklifleri | Sigorta Uzmanı",
    metaDescription:
      "Adres, brüt metrekare ve yapı bilgilerinizi girerek 2026 Zorunlu Deprem Sigortası teklifinizi oluşturun veya poliçenizi yenileyin.",
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
    seoTitle: "Yeşil Kart Sigortası 2026 Fiyatları | Sigorta Uzmanı",
    metaDescription:
      "Aracınızla yurt dışına çıkmadan önce, seyahat sürenize uygun 2026 Yeşil Kart Sigortası tekliflerini karşılaştırın.",
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
    seoTitle: "Konut Sigortası 2026 Fiyatları ve Teklifleri | Sigorta Uzmanı",
    metaDescription:
      "Yangın, su baskını, hırsızlık ve poliçe kapsamındaki doğal afet teminatlarını karşılaştırarak 2026 konut sigortası teklifi alın.",
    serviceType: "Konut Sigortası",
    seoBullets: [
      "2026 konut sigortası fiyatlarını farklı sigorta şirketleri arasında karşılaştırın.",
      "Yangın, su basması, hırsızlık ve doğal afetlere karşı binanızı ve eşyalarınızı güvenceye alın.",
      "Prim; konutun adresi, brüt metrekaresi, yapı tarzı ve seçilen teminat limitlerine göre hesaplanır.",
      "Cam kırılması, izolasyon ve hukuksal koruma gibi ek teminatlarla poliçenizi ihtiyacınıza göre şekillendirin.",
    ],
  },
];

// Ana sayfadaki ikon grid'i dört sütunlu olduğu için sekiz üründe tutuluyor.
// Konut ve Yeşil Kart yalnızca menüde; grid'de yer kalmıyor.
const HERO_DISI = new Set(["konut", "yesil-kart"]);

export const heroProducts: Product[] = products.filter(
  (p) => !HERO_DISI.has(p.slug),
);

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
