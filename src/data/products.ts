import trafikIcon from "../assets/icons/trafik-yeni.svg";
import kaskoIcon from "../assets/icons/trafik.svg";
import tamamlayiciIcon from "../assets/icons/tamamlayici-saglik.svg";
import seyahatIcon from "../assets/icons/seyahat-saglik.svg";
import immIcon from "../assets/icons/imm.svg";
import ozelSaglikIcon from "../assets/icons/ozel-saglik.svg";
import daskIcon from "../assets/icons/dask.svg";
import yesilKartIcon from "../assets/icons/yesil-kart.svg";

export interface Product {
  slug: string;
  title: string;
  icon: string;
  badge?: string;
  seoTitle: string;
  seoBullets: string[];
}

export const products: Product[] = [
  {
    slug: "trafik-sigortasi",
    title: "Trafik Sigortası",
    icon: trafikIcon,
    seoTitle: "Trafik Sigortası Fiyatları 2026 için Teklif Al",
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
    icon: kaskoIcon,
    seoTitle: "Kasko Fiyatları 2026 için Teklif Al",
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
    icon: tamamlayiciIcon,
    seoTitle: "Tamamlayıcı Sağlık Sigortası Fiyatları 2026 için Teklif Al",
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
    icon: seyahatIcon,
    seoTitle: "Seyahat Sağlık Sigortası Fiyatları 2026 için Teklif Al",
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
    icon: immIcon,
    seoTitle: "İMM Sigortası Fiyatları 2026 için Teklif Al",
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
    icon: ozelSaglikIcon,
    seoTitle: "Özel Sağlık Sigortası Fiyatları 2026 için Teklif Al",
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
    icon: daskIcon,
    seoTitle: "DASK Fiyatları 2026 için Teklif Al",
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
    icon: yesilKartIcon,
    badge: "Yeni",
    seoTitle: "Yeşil Kart Sigortası Fiyatları 2026 için Teklif Al",
    seoBullets: [
      "2026 Yeşil Kart Sigortası fiyatlarını araç türü ve poliçe süresine göre öğrenin.",
      "Aracınızla yurt dışına çıkarken geçerli uluslararası trafik sigortanızı hazırlayın.",
      "Yurt dışında üçüncü kişilere verebileceğiniz maddi ve bedeni zararlara karşı korunun.",
      "15 günden 1 yıla kadar süre seçenekleriyle seyahatinize uygun teklif alın.",
    ],
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
