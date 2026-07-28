/**
 * Statik rotaların SEO kaydı.
 *
 * Üç tüketicisi var ve hepsi buradan okur:
 *  1. React sayfaları — başlık, açıklama, breadcrumb, şema
 *  2. api/prerender  — JavaScript çalıştırmayan botlara sunulan HTML gövdesi
 *  3. scripts/generate-seo-files.mjs — sitemap.xml ve llms.txt
 *
 * `h1` ve `intro` alanları sayfada görünen metinle birebir aynıdır; prerender
 * çıktısının gerçek sayfayla içerik eşitliğini koruması buna bağlıdır.
 */

import type { BreadcrumbItem } from "./schema";
import { SITE_DESCRIPTION } from "./config";
import { legalDocuments } from "../../data/legal";

export interface SeoSection {
  heading: string;
  paragraphs?: string[];
  items?: string[];
}

export type ChangeFreq = "daily" | "weekly" | "monthly" | "yearly";

export interface StaticPageSeo {
  path: string;
  /** <title> içeriği; markayı içermiyorsa sonek otomatik eklenir. */
  title: string;
  description: string;
  /** Sayfadaki gerçek H1 metni (düz metin hâli). */
  h1: string;
  /** H1 altındaki giriş paragrafları. */
  intro: string[];
  sections?: SeoSection[];
  /** WebPage yerine kullanılacak schema.org tipi. */
  schemaType?: string;
  breadcrumb: BreadcrumbItem[];
  priority: number;
  changefreq: ChangeFreq;
  /** llms.txt için tek cümlelik özet. */
  summary: string;
}

const HOME_CRUMB: BreadcrumbItem = { name: "Ana Sayfa", path: "/" };

const legalStaticPages: StaticPageSeo[] = legalDocuments.map((doc) => ({
  path: doc.path,
  title: doc.title,
  description: doc.description,
  h1: doc.h1,
  intro: doc.intro,
  sections: doc.sections.map((section) => ({
    heading: section.heading,
    paragraphs: section.paragraphs,
    items: section.items,
  })),
  schemaType: "WebPage",
  breadcrumb: [HOME_CRUMB, { name: doc.h1 }],
  priority: 0.3,
  changefreq: "yearly" as const,
  summary: doc.summary,
}));

export const staticPages: StaticPageSeo[] = [
  {
    path: "/",
    title: "Sigorta Uzmanı | Trafik, Kasko, DASK ve Sağlık Sigortası Teklifi",
    description: SITE_DESCRIPTION,
    h1: "Teklif Al · Karşılaştır · Güvende Kal",
    intro: [
      "Doğru sigorta. Uygun fiyat. Hızlı destek.",
      "Sigorta Uzmanı, 30'a yakın sigorta şirketinden teklifleri karşılaştırır ve ihtiyacınıza uygun teminat ile fiyat seçeneklerini sunar. Karşılaştırma, danışmanlık ve poliçe sonrası destek ücretsizdir.",
    ],
    sections: [
      {
        heading: "Teklif alabileceğiniz sigorta ürünleri",
        items: [
          "Zorunlu Trafik Sigortası",
          "Kasko",
          "İhtiyari Mali Mesuliyet (İMM)",
          "Yeşil Kart Sigortası",
          "Tamamlayıcı Sağlık Sigortası",
          "Özel Sağlık Sigortası",
          "Seyahat Sağlık Sigortası",
          "Konut Sigortası",
          "Zorunlu Deprem Sigortası (DASK)",
        ],
      },
    ],
    schemaType: "WebPage",
    breadcrumb: [HOME_CRUMB],
    priority: 1,
    changefreq: "weekly",
    summary:
      "Ana sayfa: dokuz sigorta branşında teklif başlangıcı, kurum bilgisi ve sıkça sorulan sorular.",
  },
  {
    path: "/karsilastirma",
    title: "Sigorta Karşılaştırma Merkezi 2026",
    description:
      "Trafik vs Kasko, TSS vs Özel Sağlık, DASK vs Konut ve daha fazlası. Sigorta ürünlerini teminat, fiyat ve kimler için uygun olduğu açısından yan yana karşılaştırın.",
    h1: "Sigorta Karşılaştırma Merkezi",
    intro: [
      "Hangi sigorta sizin için doğru? Kategori seçin, merak ettiğiniz karşılaştırmayı açın; teminatları yan yana görüp teklif alın.",
    ],
    schemaType: "CollectionPage",
    breadcrumb: [HOME_CRUMB, { name: "Karşılaştırma Merkezi" }],
    priority: 0.9,
    changefreq: "monthly",
    summary:
      "15 ürün karşılaştırması: teminat tabloları, avantaj/dezavantaj listeleri, kimler için uygun olduğu ve soru-cevaplar.",
  },
  {
    path: "/sigorta-sozlugu",
    title: "Sigorta Sözlüğü: Sigorta Terimleri ve Anlamları",
    description:
      "Muafiyet, İMM, pert, sovtaj, rayiç bedel, zeyilname ve daha fazlası. Poliçelerde geçen sigorta terimlerini sade Türkçe açıklamalarla öğrenin.",
    h1: "Sigorta Sözlüğü",
    intro: [
      "Sigorta poliçelerinde geçen terimleri sade ve anlaşılır Türkçe ile açıklıyoruz. Teklif alırken veya hasar sürecinde karşınıza çıkan kavramları buradan hızlıca öğrenin.",
    ],
    schemaType: "CollectionPage",
    breadcrumb: [HOME_CRUMB, { name: "Sigorta Sözlüğü" }],
    priority: 0.8,
    changefreq: "monthly",
    summary:
      "Sigorta terimleri sözlüğü: her terim için kısa tanım, ayrıntılı açıklama ve ilgili kavramlar.",
  },
  {
    path: "/blog",
    title: "Sigorta Blogu: Teminat, Poliçe ve Hasar Rehberi",
    description:
      "Trafik, kasko, sağlık ve konut sigortalarında doğru kararı vermenizi sağlayacak uygulamaya dönük yazılar. Teminatlar, poliçe süreçleri ve hasar adımları.",
    h1: "Sigorta, teminat ve poliçe rehberi",
    intro: [
      "Trafik, kasko, sağlık ve konut sigortalarında doğru kararı vermenizi sağlayacak uygulamaya dönük yazılar.",
    ],
    schemaType: "Blog",
    breadcrumb: [HOME_CRUMB, { name: "Blog" }],
    priority: 0.9,
    changefreq: "daily",
    summary:
      "Blog dizini: sigorta branşlarına göre kategorize edilmiş rehber yazılar, kategori ve arama filtreleri.",
  },
  {
    path: "/risk-haritasi",
    title: "Sigorta Risk Haritası: İllere Göre Deprem, Sel ve Hırsızlık Riski",
    description:
      "Türkiye'nin 81 ili için deprem, sel, dolu ve araç hırsızlığı risk skorlarını haritada inceleyin. Hangi teminatlara ihtiyacınız olduğunu ilinize göre görün.",
    h1: "İllere göre teminat risk görünümü",
    intro: [
      "Bir risk türü seçin, illerin üzerine gelerek detaylı skoru inceleyin. Deprem skorları AFAD DD-2 il merkezi tehlike özetine; sel, dolu ve araç hırsızlığı skorları yayınlanmış afet / Emniyet yoğunluk verilerine dayanır. Mahalle bazlı resmi değerler için AFAD ve DSİ haritaları esas alınmalıdır.",
    ],
    sections: [
      {
        heading: "Haritadaki risk türleri",
        items: [
          "Deprem riski — DASK ve konut sigortası teminat kararını etkiler.",
          "Sel ve su basması riski — konut sigortası ek teminatlarında belirleyicidir.",
          "Dolu riski — kasko ek teminatlarında dikkate alınır.",
          "Araç hırsızlığı riski — kasko primini ve teminat tercihini etkiler.",
        ],
      },
    ],
    breadcrumb: [HOME_CRUMB, { name: "Risk Haritası" }],
    priority: 0.7,
    changefreq: "yearly",
    summary:
      "81 il için deprem, sel, dolu ve araç hırsızlığı risk skorlarını gösteren etkileşimli harita.",
  },
  {
    path: "/police-iptal",
    title: "Poliçe İptal İşlemleri: Başvuru ve Talep Takibi",
    description:
      "Araç satışı veya diğer nedenlerle poliçe iptal başvurusu yapın, belgenizi yükleyin ve iptal talebinizi takip kodunuzla anlık olarak takip edin.",
    h1: "Poliçe İptal İşlemleri",
    intro: [
      "Araç satışı nedeniyle poliçe iptal başvurusu yapın veya mevcut iptal talebinizi takip kodunuzla sorgulayın.",
    ],
    sections: [
      {
        heading: "Nasıl çalışır?",
        items: [
          "Branşı seçin ve iptal başvuru formunu doldurun.",
          "Araç satış belgenizi veya ilgili evrağı yükleyin.",
          "Başvuru sonunda verilen takip kodunu saklayın.",
          "Takip sekmesinden kodunuzla talebinizin durumunu görün.",
        ],
      },
    ],
    breadcrumb: [HOME_CRUMB, { name: "Poliçe İptal" }],
    priority: 0.7,
    changefreq: "yearly",
    summary:
      "Poliçe iptal başvuru formu ve takip kodu ile talep durumu sorgulama ekranı.",
  },
  {
    path: "/hakkimizda",
    title: "Hakkımızda",
    description:
      "Sigorta Uzmanı; 30'a yakın sigorta şirketinin tekliflerini tek noktada karşılaştırmanızı sağlayan bir sigorta acentesidir. Teklif, poliçe, yenileme ve hasar süreçlerinde yanınızdayız.",
    h1: "Sigortayı daha anlaşılır, hızlı ve güvenilir hale getiriyoruz.",
    intro: [
      "sigortauzmani.net, farklı sigorta şirketlerinin tekliflerini tek noktada değerlendirmenize ve ihtiyacınıza uygun poliçeyi kolayca seçmenize yardımcı olur.",
      "Uzman ekibimiz; teklif aşamasından poliçe düzenlenmesine, yenileme işlemlerinden hasar sürecine kadar yanınızda olur. Amacımız yalnızca poliçe sunmak değil; doğru seçenekleri anlaşılır biçimde paylaşarak güvenle karar vermenizi sağlamaktır.",
    ],
    sections: [
      {
        heading: "Hizmet verdiğimiz branşlar",
        items: ["Trafik", "Kasko", "Sağlık", "DASK", "Konut", "Seyahat", "İş Yeri"],
      },
      {
        heading: "Neden sigortauzmani.net?",
        items: [
          "Kolay karşılaştırma — Farklı şirketlerin seçeneklerini tek noktada değerlendirin.",
          "Uzman destek — İhtiyacınıza uygun sigortayı danışman desteğiyle seçin.",
          "Hızlı süreç — Talebinizi iletin, teklifinizi kısa sürede alın.",
          "Poliçe sonrası — Yenileme ve hasar süreçlerinde destek almaya devam edin.",
        ],
      },
    ],
    schemaType: "AboutPage",
    breadcrumb: [HOME_CRUMB, { name: "Hakkımızda" }],
    priority: 0.6,
    changefreq: "yearly",
    summary:
      "Kurumsal tanıtım: acentenin çalışma biçimi, hizmet verilen branşlar ve poliçe sonrası destek kapsamı.",
  },
  {
    path: "/iletisim",
    title: "İletişim",
    description:
      "Sigorta işlemlerinizle ilgili sorunuzu Sigorta Uzmanı ekibine iletin. Belge ekleyebilir, önceliğinizi belirtebilir ve referans numarasıyla takip edebilirsiniz.",
    h1: "Sorunuzu iletin, uzmanlarımız yanıtlasın.",
    intro: [
      "Sigorta işlemlerinizle ilgili sorunuzu ve varsa belgenizi gönderin. Ekibimiz mesajınızı öncelik sırasına göre inceleyecektir.",
    ],
    schemaType: "ContactPage",
    breadcrumb: [HOME_CRUMB, { name: "İletişim" }],
    priority: 0.6,
    changefreq: "yearly",
    summary:
      "İletişim formu: konu, öncelik ve belge ekiyle talep gönderme; telefon ve e-posta kanalları.",
  },
  ...legalStaticPages,
];

export function getStaticPage(path: string): StaticPageSeo | undefined {
  return staticPages.find((page) => page.path === path);
}
