export type ComparisonCategory =
  | "arac"
  | "saglik"
  | "ev"
  | "seyahat"
  | "bireysel"
  | "is"
  | "elektrikli";

export const CATEGORY_LABELS: Record<ComparisonCategory, string> = {
  arac: "Araç Sigortaları",
  saglik: "Sağlık Sigortaları",
  ev: "Ev Sigortaları",
  seyahat: "Seyahat",
  bireysel: "Bireysel",
  is: "İş Dünyası",
  elektrikli: "Elektrikli Araçlar",
};

export interface ComparisonSide {
  name: string;
  /** Links to existing product quote page when available */
  productSlug?: string;
}

export interface ComparisonRow {
  label: string;
  left: string;
  right: string;
}

export interface ComparisonFaq {
  q: string;
  a: string;
}

export interface Comparison {
  slug: string;
  category: ComparisonCategory;
  left: ComparisonSide;
  right: ComparisonSide;
  /** Short label for hub cards */
  shortTitle: string;
  seoTitle: string;
  seoDescription: string;
  summary: string;
  /** Detay sayfası hero H1'i — SEO odaklı, ürün adlarını içeren başlık */
  heroTitle: string;
  /** Hero altındaki açıklayıcı paragraflar; ilki öne çıkan giriş cümlesidir */
  heroIntro: string[];
  popular?: boolean;
  badge?: string;
  rows: ComparisonRow[];
  advantages: { left: string[]; right: string[] };
  disadvantages: { left: string[]; right: string[] };
  whoFor: { left: string; right: string };
  verdict: string;
  recommendation: "left" | "right" | "depends";
  recommendationText: string;
  faqs: ComparisonFaq[];
  /** Default quote CTA product slug */
  ctaSlug?: string;
  relatedSlugs?: string[];
  /** Same-thing explainer (e.g. DASK = Zorunlu Deprem) */
  sameThingNote?: string;
  /** Calculator for TSS vs private exam fees */
  calculator?: {
    examFeeHint: number;
    visitsBreakEvenHint: number;
  };
}

export const comparisons: Comparison[] = [
  // ─── Araç ───────────────────────────────────────────────
  {
    slug: "trafik-sigortasi-vs-kasko",
    category: "arac",
    left: { name: "Trafik Sigortası", productSlug: "trafik-sigortasi" },
    right: { name: "Kasko", productSlug: "kasko" },
    shortTitle: "Trafik Sigortası vs Kasko",
    seoTitle: "Trafik Sigortası vs Kasko Farkları 2026 | Karşılaştırma",
    seoDescription:
      "Trafik sigortası ile kasko arasındaki farklar: teminatlar, fiyat, cam, sel, dolu, hırsızlık ve kimler yaptırmalı. 2026 güncel karşılaştırma.",
    summary: "En popüler karşılaştırma. Zorunlu trafik sigortası karşı tarafı; kasko kendi aracınızı güvenceye alır.",
    heroTitle: "Trafik Sigortası ile Kasko Arasındaki Farklar Nelerdir?",
    heroIntro: [
      "Zorunlu trafik sigortası, Karayolları Trafik Kanunu uyarınca her motorlu araç sahibinin yaptırmak zorunda olduğu ve kazada karşı tarafa verilen bedeni ve maddi zararları poliçe limitleri dahilinde karşılayan bir sorumluluk sigortasıdır. Kasko ise çarpma, çarpılma, yangın, hırsızlık ve doğal afet gibi risklere karşı aracınızın kendisini güvence altına alan isteğe bağlı bir mal sigortasıdır.",
      "Bu rehberde iki ürünün teminat kapsamını madde madde karşılaştırıyor; cam, sel, dolu ve hırsızlık gibi kritik başlıklarda hangi poliçenin devreye girdiğini, prim farklarını ve hangi sürücü profiline hangi kombinasyonun uygun olduğunu teknik bir çerçevede açıklıyoruz.",
    ],
    popular: true,
    badge: "En popüler",
    rows: [
      { label: "Zorunlu / İsteğe bağlı", left: "Zorunlu", right: "İsteğe bağlı" },
      { label: "Karşı tarafı karşılar mı?", left: "Evet", right: "Hayır (kendi aracınız)" },
      { label: "Kendi aracını karşılar mı?", left: "Hayır", right: "Evet" },
      { label: "Cam kırılması", left: "Kapsam dışı", right: "Genelde dahil / ek teminat" },
      { label: "Sel", left: "Kapsam dışı", right: "Pakete göre dahil" },
      { label: "Dolu", left: "Kapsam dışı", right: "Pakete göre dahil" },
      { label: "Yangın", left: "Kapsam dışı", right: "Genelde dahil" },
      { label: "Hırsızlık", left: "Kapsam dışı", right: "Genelde dahil" },
      { label: "Terör", left: "Kapsam dışı", right: "Pakete göre dahil" },
      { label: "Mini onarım", left: "Yok", right: "Ek hizmet olarak sunulabilir" },
      { label: "İkame araç", left: "Yok", right: "Ek teminat olarak sunulabilir" },
      { label: "Ortalama fiyat", left: "Daha düşük (zorunlu prim)", right: "Araç değerine göre daha yüksek" },
      {
        label: "Kimler yaptırmalı?",
        left: "Tüm motorlu araç sahipleri (yasal zorunluluk)",
        right: "Aracının değerini korumak isteyen herkes",
      },
    ],
    advantages: {
      left: [
        "Yasal zorunluluk; trafik cezası ve ruhsat işlemlerinde şart",
        "Prim genellikle kaskoya göre daha düşük",
        "Karşı tarafa verilen bedeni ve maddi zararları karşılar",
      ],
      right: [
        "Kendi aracınızdaki hasarı güvence altına alır",
        "Doğal afet, hırsızlık, yangın gibi riskleri kapsayabilir",
        "Mini onarım, ikame araç gibi ek hizmetler eklenebilir",
      ],
    },
    disadvantages: {
      left: [
        "Kendi aracınızdaki hasarı karşılamaz",
        "Cam, sel, dolu, hırsızlık teminatı yoktur",
      ],
      right: [
        "Zorunlu değildir; prim maliyeti daha yüksektir",
        "Muafiyet ve teminat limitleri poliçeye göre değişir",
      ],
    },
    whoFor: {
      left: "Tüm araç sahipleri — yaptırmamak yasal risk oluşturur.",
      right: "Özellikle yeni, kredili veya yüksek değerli araç sahipleri.",
    },
    verdict:
      "Trafik sigortası zorunludur ve karşı tarafı korur; kasko ise kendi aracınızı korur. Birbirinin alternatifi değil, tamamlayıcısıdır.",
    recommendation: "depends",
    recommendationText:
      "Önce zorunlu trafik sigortanızı yaptırın; ardından aracınızın değerine uygun bir kasko paketi ekleyin.",
    faqs: [
      {
        q: "Sadece trafik sigortası yeterli mi?",
        a: "Yasal olarak zorunlu olan budur. Ancak kendi aracınızdaki hasarlar için kasko gerekir.",
      },
      {
        q: "Kasko trafik sigortasının yerini tutar mı?",
        a: "Hayır. Kasko kendi aracınızı; trafik sigortası karşı tarafı kapsar. İkisi ayrı poliçelerdir.",
      },
      {
        q: "Hangisi daha pahalı?",
        a: "Kasko genellikle daha pahalıdır çünkü araç değeri, model yılı ve teminat genişliğine göre hesaplanır.",
      },
    ],
    ctaSlug: "kasko",
    relatedSlugs: [
      "kasko-vs-genisletilmis-kasko",
      "imm-vs-yuksek-teminatli-imm",
    ],
  },
  {
    slug: "kasko-vs-genisletilmis-kasko",
    category: "arac",
    left: { name: "Kasko", productSlug: "kasko" },
    right: { name: "Genişletilmiş Kasko", productSlug: "kasko" },
    shortTitle: "Kasko vs Genişletilmiş Kasko",
    seoTitle: "Kasko vs Genişletilmiş Kasko Farkları 2026",
    seoDescription:
      "Standart kasko ile genişletilmiş kasko teminat farkları, ek hizmetler, fiyat farkı ve kimlere uygun olduğu.",
    summary: "Teminat farkları, ek hizmetler ve fiyat farkıyla hangi paketin size uygun olduğunu görün.",
    heroTitle: "Kasko ile Genişletilmiş Kasko Arasındaki Farklar",
    heroIntro: [
      "Standart kasko; çarpma, çarpılma, yangın ve hırsızlık gibi temel riskleri teminat altına alırken, genişletilmiş kasko bu kapsamı sel, dolu, terör, cam kırılması ve anahtar kaybı gibi ek teminatlarla, mini onarım ve ikame araç gibi ek hizmetlerle güçlendirir.",
      "Aşağıdaki karşılaştırmada iki paket arasındaki teminat ve prim farklarını, bulunduğunuz ilin risk profiline göre hangi seçeneğin daha verimli olduğunu ve satın alma öncesinde poliçe özel şartlarında kontrol etmeniz gereken maddeleri bulabilirsiniz.",
    ],
    rows: [
      { label: "Teminat kapsamı", left: "Temel riskler (çarışma, yangın, hırsızlık vb.)", right: "Temel + ek riskler (sel, dolu, terör vb.)" },
      { label: "Ek hizmetler", left: "Sınırlı", right: "Mini onarım, ikame araç, cam vb. daha geniş" },
      { label: "Fiyat farkı", left: "Daha uygun", right: "Daha yüksek prim" },
      { label: "Kimlere uygun?", left: "Bütçe odaklı, düşük risk bölgesi", right: "Kapsamlı koruma isteyenler" },
    ],
    advantages: {
      left: ["Daha düşük prim", "Temel risklerde yeterli koruma"],
      right: ["Daha geniş teminat", "Doğal afet ve ek hizmetlerde avantaj"],
    },
    disadvantages: {
      left: ["Sel, dolu, terör gibi riskler eksik kalabilir"],
      right: ["Yıllık prim maliyeti daha yüksek"],
    },
    whoFor: {
      left: "Prim maliyetini düşük tutmak isteyen sürücüler.",
      right: "Sel/dolu riski yüksek illerde veya tam güvence arayanlar.",
    },
    verdict:
      "Genişletilmiş kasko, standart kaskoya ek riskleri ekler. Risk haritanıza ve bütçenize göre seçim yapın.",
    recommendation: "depends",
    recommendationText:
      "İl riskiniz yüksekse (sel, dolu) genişletilmiş paketi; düşük risk ve bütçe önceliğiyse standart kaskoyu tercih edin.",
    faqs: [
      {
        q: "Genişletilmiş kaskoda neler ekstra olur?",
        a: "Şirkete göre değişmekle birlikte sel, dolu, terör, cam, anahtar kaybı gibi ek teminatlar sıkça eklenir.",
      },
    ],
    ctaSlug: "kasko",
    relatedSlugs: ["trafik-sigortasi-vs-kasko"],
  },
  {
    slug: "imm-vs-yuksek-teminatli-imm",
    category: "arac",
    left: { name: "İMM", productSlug: "imm" },
    right: { name: "Yüksek Teminatlı İMM", productSlug: "imm" },
    shortTitle: "İMM vs Yüksek Teminatlı İMM",
    seoTitle: "İMM vs Yüksek Teminatlı İMM 2026 Limitleri",
    seoDescription:
      "İMM neden gerekli, 2026 teminat limitleri ve yüksek teminatlı İMM kimler için önemli?",
    summary: "Neden gerekli, 2026 limitleri ve kimler için kritik olduğunu karşılaştırın.",
    heroTitle: "İMM ile Yüksek Teminatlı İMM Karşılaştırması: 2026 Limitleri",
    heroIntro: [
      "İhtiyari Mali Mesuliyet (İMM) sigortası, zorunlu trafik sigortası limitlerinin aşıldığı kazalarda devreye girerek aradaki tazminat farkını karşılayan ek bir sorumluluk teminatıdır. Yüksek teminatlı İMM ise bu güvenceyi çok daha yüksek, bazı ürünlerde limitsize yakın tutarlara taşır.",
      "Bu sayfada 2026 teminat limitlerini, standart ve yüksek teminatlı seçenekler arasındaki prim farkını ve ağır bedeni ya da maddi hasarlı kazalarda kişisel malvarlığınızı korumak için hangi limitin tercih edilmesi gerektiğini değerlendiriyoruz.",
    ],
    rows: [
      { label: "Neden gerekli?", left: "Trafik limiti aşan zararlar için", right: "Ağır bedeni/maddi zarar riskine karşı" },
      { label: "2026 limitleri", left: "Standart / seçilebilir limitler", right: "Yüksek veya sınırsıza yakın limitler" },
      { label: "Kimler için önemli?", left: "Tüm sürücüler", right: "Yoğun trafik, ticari kullanım, yüksek risk" },
    ],
    advantages: {
      left: ["Trafik sigortasını tamamlar", "Makul primle ek güvence"],
      right: ["Büyük hasarlarda mali güvence", "Kişisel varlıkları korumaya yardımcı olur"],
    },
    disadvantages: {
      left: ["Düşük limit ağır kazada yetmeyebilir"],
      right: ["Daha yüksek prim"],
    },
    whoFor: {
      left: "Temel ek sorumluluk koruması isteyen her sürücü.",
      right: "Şehir içi yoğun kullanım, büyük araç veya yüksek malvarlığı olanlar.",
    },
    verdict:
      "Trafik sigortası limitleri büyük kazalarda yetmeyebilir. İMM, kişisel mali riskinizi düşüren kritik bir ek teminattır.",
    recommendation: "right",
    recommendationText:
      "Mümkünse yüksek teminatlı İMM tercih edin; prim farkı genellikle sınırlı, koruma farkı büyüktür.",
    faqs: [
      {
        q: "İMM kaskonun içinde mi?",
        a: "Bazı kasko paketlerine eklenebilir; ancak ayrı İMM poliçesi de alınabilir.",
      },
    ],
    ctaSlug: "imm",
    relatedSlugs: ["trafik-sigortasi-vs-kasko"],
  },

  // ─── Sağlık ─────────────────────────────────────────────
  {
    slug: "tamamlayici-saglik-vs-ozel-saglik",
    category: "saglik",
    left: { name: "Tamamlayıcı Sağlık", productSlug: "tamamlayici-saglik" },
    right: { name: "Özel Sağlık", productSlug: "ozel-saglik" },
    shortTitle: "Tamamlayıcı Sağlık vs Özel Sağlık",
    seoTitle: "Tamamlayıcı Sağlık vs Özel Sağlık Farkları 2026",
    seoDescription:
      "TSS ile OSS karşılaştırması: SGK şartı, hastane ağı, yurt dışı, ilaç, doğum, check-up, diş, bekleme süresi ve prim.",
    summary: "En çok aranan sağlık karşılaştırması. SGK, hastane ağı, teminatlar ve prim farkları.",
    heroTitle: "Tamamlayıcı Sağlık Sigortası ile Özel Sağlık Sigortası Farkları",
    heroIntro: [
      "Tamamlayıcı sağlık sigortası (TSS), aktif SGK'lı bireylerin anlaşmalı özel hastanelerde ödediği fark ücretlerini karşılayan, primi görece uygun bir üründür. Özel sağlık sigortası (ÖSS) ise SGK şartı aramadan, şirketin anlaşmalı kurum ağında yatarak ve ayakta tedavi giderlerini pakete göre çok daha geniş bir çerçevede teminat altına alır.",
      "Karşılaştırmada hastane ağı, yurt dışı geçerliliği, ilaç, doğum, check-up ve diş teminatlarını, bekleme sürelerini ve prim farklarını yan yana inceleyerek hangi profil için hangi ürünün teknik olarak daha doğru olduğunu açıklıyoruz.",
    ],
    popular: true,
    badge: "En çok aranan",
    rows: [
      { label: "SGK gerekir mi?", left: "Evet", right: "Hayır" },
      { label: "Hastane ağı", left: "SGK anlaşmalı özel hastaneler", right: "Şirketin özel anlaşmalı ağı" },
      { label: "Yurt dışı", left: "Genelde sınırlı / yok", right: "Pakete göre dahil olabilir" },
      { label: "İlaç", left: "Sınırlı / pakete göre", right: "Pakete göre daha geniş" },
      { label: "Doğum", left: "Ek teminat / bekleme süresi", right: "Pakete göre, bekleme süresi olabilir" },
      { label: "Check-up", left: "Sınırlı veya ek", right: "Pakette daha sık yer alır" },
      { label: "Diş", left: "Genelde ek / yok", right: "Ek paket olarak sunulabilir" },
      { label: "Bekleme süreleri", left: "Bazı teminatlarda var", right: "Bazı teminatlarda var" },
      { label: "Prim", left: "Genellikle daha uygun", right: "Daha yüksek" },
    ],
    advantages: {
      left: ["Uygun prim", "SGK fark ücretlerini karşılar", "Geniş özel hastane erişimi"],
      right: ["SGK şartı yok", "Daha esnek teminat tasarımı", "Yurt dışı seçenekleri"],
    },
    disadvantages: {
      left: ["Aktif SGK zorunlu", "Kapsam poliçe ve ağa bağlı"],
      right: ["Prim maliyeti daha yüksek", "Sağlık beyanı / risk kabulü daha sıkı olabilir"],
    },
    whoFor: {
      left: "SGK’lı olup özel hastane farkını ödemek istemeyenler.",
      right: "SGK’sız veya daha geniş / yurt dışı teminat isteyenler.",
    },
    verdict:
      "SGK’nız varsa tamamlayıcı sağlık çoğu kişi için en verimli başlangıçtır. Daha geniş özgürlük istiyorsanız özel sağlık öne çıkar.",
    recommendation: "depends",
    recommendationText:
      "SGK’lıysanız önce TSS teklifi alın; ihtiyaçlarınız aşarsa OSS ile karşılaştırın.",
    faqs: [
      {
        q: "TSS ile OSS aynı anda olur mu?",
        a: "Teknik olarak mümkün olsa da çoğu kişi ihtiyacına göre birini tercih eder. Danışmanınızla netleştirin.",
      },
      {
        q: "Hangisi daha ucuz?",
        a: "Tamamlayıcı sağlık genellikle daha uygun primlidir çünkü SGK temel ödemeyi üstlenir.",
      },
    ],
    ctaSlug: "tamamlayici-saglik",
    relatedSlugs: [
      "tamamlayici-saglik-vs-ozel-muayene-ucreti",
      "ozel-saglik-vs-seyahat-saglik",
    ],
  },
  {
    slug: "tamamlayici-saglik-vs-ozel-muayene-ucreti",
    category: "saglik",
    left: { name: "Tamamlayıcı Sağlık", productSlug: "tamamlayici-saglik" },
    right: { name: "Özel Muayene Ücreti (ödeme)" },
    shortTitle: "TSS vs Özel Muayene Ücreti",
    seoTitle: "Tamamlayıcı Sağlık mı Özel Muayene mi? Hesaplama 2026",
    seoDescription:
      "Yılda kaç kez doktora giderseniz tamamlayıcı sağlık sigortası kâra geçer? TSS ile cebinden ödeme karşılaştırması.",
    summary: "Yılda kaç kez doktora giderseniz kâra geçersiniz? Hesaplamalı karşılaştırma.",
    heroTitle: "Tamamlayıcı Sağlık Sigortası mı, Muayene Ücreti Ödemek mi?",
    heroIntro: [
      "Özel hastane kullanan bir SGK'lının önünde iki seçenek vardır: her muayenede fark ücretini cebinden ödemek ya da yıllık primle tamamlayıcı sağlık sigortası yaptırmak. Doğru karar; yıllık muayene sıklığınıza, kurumların fark tarifelerine ve yatarak tedavi riskinize bağlıdır.",
      "Aşağıdaki hesaplayıcıya kendi rakamlarınızı girerek başabaş noktanızı görebilir; ameliyat ve yatarak tedavi gibi yüksek maliyetli senaryolarda sigortanın sağladığı risk transferinin neden tek başına muayene hesabından daha belirleyici olduğunu inceleyebilirsiniz.",
    ],
    popular: true,
    rows: [
      { label: "Ödeme şekli", left: "Yıllık prim", right: "Her muayenede nakit / kart" },
      { label: "Büyük ameliyat riski", left: "Poliçe kapsamında güvence", right: "Tamamen sizin üzerinizde" },
      { label: "Planlanabilirlik", left: "Yıllık sabit maliyet", right: "Değişken ve öngörülemez" },
      { label: "Ağ avantajı", left: "Anlaşmalı kurumlarda fark ödemesi", right: "Kurum tarifesine bağlı" },
    ],
    advantages: {
      left: ["Büyük sağlık harcamalarına karşı koruma", "Sık kullanımda maliyet avantajı"],
      right: ["Prim ödemezsiniz", "Nadir kullanımda kısa vadede ucuz görünebilir"],
    },
    disadvantages: {
      left: ["Kullanmasanız da prim ödersiniz"],
      right: ["Bir ameliyat veya yoğun tedavi bütçeyi bozabilir"],
    },
    whoFor: {
      left: "Yılda birkaç kez özel hastaneye giden veya risk almak istemeyenler.",
      right: "Çok nadir muayene olan ve büyük riski göze alanlar.",
    },
    verdict:
      "Sadece “kaç muayene” hesabı yetmez; asıl değer büyük tedavi riskini transfer etmektir. Yine de sık kullananlar için TSS hızlıca kâra geçer.",
    recommendation: "left",
    recommendationText:
      "Özel hastane kullanıyorsanız tamamlayıcı sağlık çoğu senaryoda daha akıllıca bir tercihtir.",
    faqs: [
      {
        q: "Yılda kaç muayenede kâra geçerim?",
        a: "Prim ve kurum fark ücretine göre değişir. Aşağıdaki hesaplayıcıyla kendi rakamlarınızı deneyin.",
      },
    ],
    ctaSlug: "tamamlayici-saglik",
    calculator: {
      examFeeHint: 2500,
      visitsBreakEvenHint: 4,
    },
    relatedSlugs: ["tamamlayici-saglik-vs-ozel-saglik"],
  },
  {
    slug: "ozel-saglik-vs-seyahat-saglik",
    category: "saglik",
    left: { name: "Özel Sağlık", productSlug: "ozel-saglik" },
    right: { name: "Seyahat Sağlık", productSlug: "seyahat-saglik" },
    shortTitle: "Özel Sağlık vs Seyahat Sağlık",
    seoTitle: "Özel Sağlık vs Seyahat Sağlık Sigortası Farkları",
    seoDescription:
      "Süre, teminat, yurt dışı, acil durum ve kimlere uygunluk açısından özel sağlık ile seyahat sağlık karşılaştırması.",
    summary: "Süre, teminat, yurt dışı kapsamı ve acil durum farkları.",
    heroTitle: "Özel Sağlık Sigortası ile Seyahat Sağlık Sigortası Farkları",
    heroIntro: [
      "Özel sağlık sigortası, yıl boyunca planlı ve acil tüm tedavi ihtiyaçlarınızı kapsayan uzun dönemli bir üründür; seyahat sağlık sigortası ise yalnızca seyahat süresiyle sınırlı olarak yurt dışında karşılaşılan acil sağlık durumlarını teminat altına alır.",
      "Bu içerikte süre, teminat kapsamı, yurt dışı geçerliliği ve acil durum organizasyonu başlıklarını karşılaştırıyor; vize başvuruları ve uzun süreli yurt dışı konaklamalarda hangi poliçenin gerekli olduğunu teknik detaylarıyla ele alıyoruz.",
    ],
    rows: [
      { label: "Süre", left: "Yıllık / uzun dönem", right: "Seyahat süresi kadar" },
      { label: "Teminat", left: "Geniş tedavi paketi", right: "Acil / beklenmedik durumlar" },
      { label: "Yurt dışı", left: "Pakete göre", right: "Temel amaç yurt dışı acil sağlık" },
      { label: "Acil durum", left: "Yurt içi odaklı (pakete göre)", right: "Seyahat sırasında acil tedavi" },
      { label: "Kimlere uygun?", left: "Sürekli sağlık güvencesi", right: "Tatil / iş seyahati / vize" },
    ],
    advantages: {
      left: ["Yıl boyu koruma", "Planlı tedaviler için uygun"],
      right: ["Kısa süreli uygun prim", "Vize süreçlerinde sıkça istenir"],
    },
    disadvantages: {
      left: ["Seyahat acilleri için özel yurt dışı eki gerekebilir"],
      right: ["Kronik / planlı tedavi genelde kapsam dışı"],
    },
    whoFor: {
      left: "Günlük sağlık ihtiyaçları için güvence arayanlar.",
      right: "Yurt dışına çıkan veya Schengen vizesi alanlar.",
    },
    verdict: "Birbirinin yerine geçmez. Yerel sağlık için OSS/TSS; yurt dışı seyahat için seyahat sağlık gerekir.",
    recommendation: "depends",
    recommendationText:
      "Seyahat ediyorsanız seyahat sağlık; yıl boyu koruma için özel veya tamamlayıcı sağlık alın.",
    faqs: [
      {
        q: "Özel sağlık yurt dışında geçerli mi?",
        a: "Poliçeye bağlıdır. Birçok poliçe sınırlıdır; seyahat için ayrı seyahat sağlık önerilir.",
      },
    ],
    ctaSlug: "seyahat-saglik",
    relatedSlugs: [
      "tamamlayici-saglik-vs-ozel-saglik",
      "yesil-kart-vs-seyahat-saglik",
      "seyahat-saglik-vs-vize-sigortasi",
    ],
  },

  // ─── Ev ─────────────────────────────────────────────────
  {
    slug: "dask-vs-konut-sigortasi",
    category: "ev",
    left: { name: "DASK", productSlug: "dask" },
    right: { name: "Konut Sigortası" },
    shortTitle: "DASK vs Konut Sigortası",
    seoTitle: "DASK vs Konut Sigortası Farkları 2026",
    seoDescription:
      "DASK ve konut sigortası karşılaştırması: deprem, yangın, sel, cam, eşya, elektronik, kombi, su baskını ve alternatif konaklama.",
    summary: "Muhtemelen en çok trafik çeken ev karşılaştırması. DASK zorunlu; konut kapsamı daha geniştir.",
    heroTitle: "DASK ile Konut Sigortası Arasındaki Farklar",
    heroIntro: [
      "DASK (Zorunlu Deprem Sigortası), tüm konutlar için yasal zorunluluk olan ve yalnızca deprem ile deprem kaynaklı yangın, infilak ve yer kayması gibi bina hasarlarını karşılayan bir güvence sistemidir. Konut sigortası ise yangın, sel, hırsızlık, cam kırılması ve eşya hasarı gibi çok daha geniş riskleri isteğe bağlı olarak teminat altına alır.",
      "Aşağıda iki ürünün teminat tablosunu bina ve eşya ayrımıyla karşılaştırıyor; tapu ve kredi işlemlerindeki DASK zorunluluğunu, konut paketlerinin kapsam farklarını ve iki poliçenin birlikte nasıl konumlanması gerektiğini açıklıyoruz.",
    ],
    popular: true,
    badge: "Çok aranan",
    rows: [
      { label: "Deprem", left: "Evet (bina)", right: "Ek teminat / paket ile" },
      { label: "Yangın", left: "Deprem kaynaklı yangın", right: "Evet" },
      { label: "Sel", left: "Hayır", right: "Pakete göre evet" },
      { label: "Cam kırılması", left: "Hayır", right: "Pakete göre evet" },
      { label: "Eşya", left: "Hayır", right: "Evet (eşya teminatı)" },
      { label: "Elektronik cihaz", left: "Hayır", right: "Pakete göre evet" },
      { label: "Kombi", left: "Hayır", right: "Pakete göre evet" },
      { label: "Su baskını", left: "Hayır", right: "Pakete göre evet" },
      { label: "Kiracı sorumluluğu", left: "Hayır", right: "Pakete göre evet" },
      { label: "Alternatif konaklama", left: "Hayır", right: "Pakete göre evet" },
    ],
    advantages: {
      left: ["Zorunlu ve uygun primli", "Deprem bina hasarında temel güvence", "Tapu/kredi süreçlerinde şart"],
      right: ["Eşya ve geniş riskler", "Yangın, sel, hırsızlık gibi riskler", "Yaşam devamlılığı teminatları"],
    },
    disadvantages: {
      left: ["Sadece deprem ve deprem kaynaklı bina hasarı", "Eşyayı kapsamaz"],
      right: ["DASK’ın yerini tutmaz", "Prim daha yüksek olabilir"],
    },
    whoFor: {
      left: "Tüm konut sahipleri (zorunlu).",
      right: "Eşyasını ve geniş riskleri güvenceye almak isteyen ev sahibi / kiracı.",
    },
    verdict:
      "DASK zorunludur ve depreme özeldir. Konut sigortası ise yangın, sel, eşya gibi riskleri tamamlar. İkisi birlikte düşünülmelidir.",
    recommendation: "depends",
    recommendationText:
      "Önce DASK’ınızı yaptırın; ardından eşya ve geniş riskler için konut sigortası ekleyin.",
    faqs: [
      {
        q: "Konut sigortası DASK yerine geçer mi?",
        a: "Hayır. DASK ayrı ve zorunludur; konut sigortası onu tamamlar.",
      },
    ],
    ctaSlug: "dask",
    relatedSlugs: ["ev-sahibi-vs-kiraci-sigortasi"],
  },
  {
    slug: "ev-sahibi-vs-kiraci-sigortasi",
    category: "ev",
    left: { name: "Ev Sahibi Sigortası" },
    right: { name: "Kiracı Sigortası" },
    shortTitle: "Ev Sahibi vs Kiracı Sigortası",
    seoTitle: "Ev Sahibi vs Kiracı Sigortası: Kim Ne Yaptırmalı?",
    seoDescription:
      "Ev sahibi ve kiracı için hangi teminatlar gerekli? Eşya teminatı, bina teminatı ve sorumluluk farkları.",
    summary: "Kim ne yaptırmalı? Eşya ve bina teminatı ayrımı.",
    heroTitle: "Ev Sahibi ve Kiracı İçin Konut Sigortası: Kim Neyi Yaptırmalı?",
    heroIntro: [
      "Konutta mülkiyet ve kullanım ayrımı, sigorta sorumluluklarını da ikiye böler: bina teminatı ve DASK yükümlülüğü malike aitken, kiracının önceliği kendi eşyasını ve üçüncü kişilere karşı sorumluluğunu güvence altına almaktır.",
      "Bu rehberde bina, eşya ve sorumluluk teminatlarının hangi tarafta olması gerektiğini; kira kaybı, komşulara karşı sorumluluk ve taşınma senaryolarını da içerecek şekilde madde madde karşılaştırıyoruz.",
    ],
    rows: [
      { label: "Kim ne yaptırmalı?", left: "Bina + isteğe bağlı eşya / sorumluluk", right: "Kendi eşyası + sorumluluk" },
      { label: "Eşya teminatı", left: "Kendi eşyası için", right: "Kiracının eşyası için kritik" },
      { label: "Bina teminatı", left: "Ev sahibi sorumluluğu (+ DASK)", right: "Genelde ev sahibine ait" },
    ],
    advantages: {
      left: ["Bina değerini korur", "Kira kaybı / sorumluluk eklenebilir"],
      right: ["Uygun primle eşya koruması", "Komşuya / eve zarar sorumluluğu"],
    },
    disadvantages: {
      left: ["Kiracının eşyasını kapsamaz"],
      right: ["Binayı kapsamaz; DASK ev sahibine aittir"],
    },
    whoFor: {
      left: "Konut sahibi olanlar.",
      right: "Kiralık evde oturanlar.",
    },
    verdict:
      "Ev sahibi binayı, kiracı kendi eşyasını güvenceye almalıdır. DASK her durumda bina için zorunludur.",
    recommendation: "depends",
    recommendationText:
      "Kiracıysanız eşya odaklı konut/kiracı paketini; ev sahibiyseniz DASK + konut paketini değerlendirin.",
    faqs: [
      {
        q: "Kiracı DASK yaptırır mı?",
        a: "DASK yasal olarak malike aittir. Kiracı kendi eşyası için ayrı poliçe düşünebilir.",
      },
    ],
    ctaSlug: "dask",
    relatedSlugs: ["dask-vs-konut-sigortasi"],
  },

  // ─── Seyahat ────────────────────────────────────────────
  {
    slug: "yesil-kart-vs-seyahat-saglik",
    category: "seyahat",
    left: { name: "Yeşil Kart", productSlug: "yesil-kart" },
    right: { name: "Seyahat Sağlık", productSlug: "seyahat-saglik" },
    shortTitle: "Yeşil Kart vs Seyahat Sağlık",
    seoTitle: "Yeşil Kart vs Seyahat Sağlık Sigortası Farkları",
    seoDescription:
      "Yeşil kart araç için, seyahat sağlık kişi için midir? Avrupa geçerliliği, hastane, kaza ve sınır kapısı farkları.",
    summary: "Çok karıştırılıyor. Biri araç, diğeri kişi içindir.",
    heroTitle: "Yeşil Kart ile Seyahat Sağlık Sigortası Farkları",
    heroIntro: [
      "Sık karıştırılan bu iki ürün tamamen farklı riskleri kapsar: Yeşil Kart, aracınızla yurt dışına çıktığınızda üye ülkelerde geçerli olan uluslararası motorlu taşıt sorumluluk belgesidir; seyahat sağlık sigortası ise yolculuk sırasında sizin başınıza gelebilecek acil sağlık giderlerini karşılar.",
      "İçerikte Avrupa geçerliliği, hastane masrafları, kaza sorumluluğu ve sınır kapısı uygulamaları başlıklarında iki ürünü karşılaştırıyor; araçla veya uçakla seyahat senaryolarına göre hangi belgelerin gerekli olduğunu netleştiriyoruz.",
    ],
    popular: true,
    badge: "Sık karıştırılan",
    rows: [
      { label: "Araç için mi?", left: "Evet", right: "Hayır" },
      { label: "Kişi için mi?", left: "Hayır", right: "Evet" },
      { label: "Avrupa geçerliliği", left: "Sisteme üye ülkelerde araç sorumluluğu", right: "Poliçede belirtilen ülkeler" },
      { label: "Hastane", left: "Kapsam dışı (sağlık değil)", right: "Acil tedavi / hastane" },
      { label: "Kaza", left: "Üçüncü şahıs araç sorumluluğu", right: "Kişi sağlık / acil durum" },
      { label: "Sınır kapısı", left: "Araçla çıkışta istenebilir", right: "Vize / seyahat şartı olabilir" },
    ],
    advantages: {
      left: ["Yurt dışı araç sorumluluğu", "Sınır geçişlerinde kritik"],
      right: ["Yurt dışı sağlık giderleri", "Vize başvurularında sıkça gerekli"],
    },
    disadvantages: {
      left: ["Sürücünün sağlık masraflarını karşılamaz"],
      right: ["Araçla ilgili sorumluluğu karşılamaz"],
    },
    whoFor: {
      left: "Aracıyla yurt dışına çıkanlar.",
      right: "Yurt dışına giden herkes (özellikle vize gereken ülkeler).",
    },
    verdict:
      "Yeşil kart araç trafik sorumluluğu; seyahat sağlık kişisel acil sağlık güvencesidir. Araçla Avrupa’ya gidiyorsanız ikisi de gerekebilir.",
    recommendation: "depends",
    recommendationText:
      "Araçla çıkıyorsanız Yeşil Kart + Seyahat Sağlık; uçakla gidiyorsanız Seyahat Sağlık yeterli olabilir.",
    faqs: [
      {
        q: "Sadece yeşil kartla seyahat olur mu?",
        a: "Araç sorumluluğu için evet; sizin hastane masraflarınız için hayır.",
      },
    ],
    ctaSlug: "yesil-kart",
    relatedSlugs: ["seyahat-saglik-vs-vize-sigortasi", "ozel-saglik-vs-seyahat-saglik"],
  },
  {
    slug: "seyahat-saglik-vs-vize-sigortasi",
    category: "seyahat",
    left: { name: "Seyahat Sağlık", productSlug: "seyahat-saglik" },
    right: { name: "Vize Sigortası", productSlug: "seyahat-saglik" },
    shortTitle: "Seyahat Sağlık vs Vize Sigortası",
    seoTitle: "Seyahat Sağlık ile Vize Sigortası Aynı mı?",
    seoDescription:
      "Schengen vize sigortası ile seyahat sağlık aynı mı? Teminat limitleri ve hangi ülkelerde zorunlu?",
    summary: "Aynı mı? Schengen, teminat limitleri ve zorunluluklar.",
    heroTitle: "Seyahat Sağlık Sigortası ile Vize Sigortası Aynı Ürün mü?",
    heroIntro: [
      "Piyasada \"vize sigortası\" adıyla satılan ürün, teknik olarak konsolosluk şartlarına — özellikle Schengen bölgesi için asgari 30.000 Euro acil sağlık teminatına — uygun düzenlenmiş bir seyahat sağlık poliçesidir; ayrı bir sigorta branşı değildir.",
      "Bu sayfada Schengen vize başvurularında aranan teminat limitlerini, poliçe süresi ve bölge kapsamı şartlarını ve standart seyahat sağlık paketleriyle aradaki farkları karşılaştırmalı olarak inceliyoruz.",
    ],
    rows: [
      { label: "Aynı mı?", left: "Genel ürün adı", right: "Vize şartına uygun seyahat sağlık" },
      { label: "Schengen", left: "Uygun poliçe ile evet", right: "Schengen için özel limit şartları" },
      { label: "Teminat limitleri", left: "Pakete göre değişir", right: "Genelde min. 30.000 EUR acil sağlık" },
      { label: "Hangi ülkelerde zorunlu?", left: "Ülkeye / vizeye göre", right: "Schengen ve bazı vize türlerinde" },
    ],
    advantages: {
      left: ["Daha geniş paket seçenekleri"],
      right: ["Konsolosluk şartlarına net uyum"],
    },
    disadvantages: {
      left: ["Vize için limit/şart kontrolü gerekir"],
      right: ["Sadece vize min. şartını karşılayan dar paket olabilir"],
    },
    whoFor: {
      left: "Tatil / iş seyahati yapan herkes.",
      right: "Schengen veya vize başvurusu yapanlar.",
    },
    verdict:
      "Vize sigortası genellikle Schengen şartlarını karşılayan bir seyahat sağlık poliçesidir; ayrı bir ürün sınıfı değildir.",
    recommendation: "left",
    recommendationText:
      "Vize başvurusu yapıyorsanız Schengen uyumlu seyahat sağlık teklifi alın.",
    faqs: [
      {
        q: "Schengen için minimum ne gerekir?",
        a: "Genellikle en az 30.000 Euro teminatlı, tüm Schengen bölgesini kapsayan acil sağlık sigortası istenir.",
      },
    ],
    ctaSlug: "seyahat-saglik",
    relatedSlugs: ["yesil-kart-vs-seyahat-saglik", "ozel-saglik-vs-seyahat-saglik"],
  },

  // ─── Bireysel ───────────────────────────────────────────
  {
    slug: "ferdi-kaza-vs-hayat-sigortasi",
    category: "bireysel",
    left: { name: "Ferdi Kaza" },
    right: { name: "Hayat Sigortası" },
    shortTitle: "Ferdi Kaza vs Hayat Sigortası",
    seoTitle: "Ferdi Kaza vs Hayat Sigortası Farkları",
    seoDescription:
      "Ölüm, sakatlık, hastalık ve kaza teminatları açısından ferdi kaza ile hayat sigortası karşılaştırması.",
    summary: "Ölüm, sakatlık, hastalık ve kaza teminatlarının ayrımı.",
    heroTitle: "Ferdi Kaza Sigortası ile Hayat Sigortası Farkları",
    heroIntro: [
      "Ferdi kaza sigortası; kaza sonucu vefat ve sürekli sakatlık risklerine odaklanan, primi görece düşük bir üründür. Hayat sigortası ise hastalık dahil vefat riskini teminat altına alarak geride kalanlara uzun vadeli mali güvence sağlar.",
      "Karşılaştırmada vefat, sakatlık, hastalık ve kaza teminatlarının iki üründe nasıl konumlandığını; prim, sağlık beyanı ve risk kabul süreçlerindeki farkları ve hangi risk profili için hangi ürünün teknik olarak doğru olduğunu ele alıyoruz.",
    ],
    rows: [
      { label: "Ölüm", left: "Kaza sonucu", right: "Hastalık veya kaza (pakete göre)" },
      { label: "Sakatlık", left: "Kaza kaynaklı sakatlık odaklı", right: "Pakete göre sınırlı / ek" },
      { label: "Hastalık", left: "Genelde kapsam dışı", right: "Temel kapsama alanı" },
      { label: "Kaza", left: "Ana odak", right: "Kapsama dahil olabilir" },
    ],
    advantages: {
      left: ["Uygun prim", "Kaza riskine odaklı net koruma"],
      right: ["Aileye gelir güvencesi", "Hastalık kaynaklı vefatta da koruma"],
    },
    disadvantages: {
      left: ["Hastalık sonucu vefatı kapsamaz"],
      right: ["Prim ve sağlık beyanı daha kapsamlı olabilir"],
    },
    whoFor: {
      left: "Aktif yaşam / kaza riski yüksek meslekler.",
      right: "Ailesine uzun vadeli gelir bırakmak isteyenler.",
    },
    verdict:
      "Ferdi kaza kazaya; hayat sigortası genellikle hayata dair mali güvenceye odaklanır. İhtiyaç farklıdır.",
    recommendation: "depends",
    recommendationText:
      "Aile geçimini güvenceye almak istiyorsanız hayat; kaza odaklı ek koruma için ferdi kaza değerlendirin.",
    faqs: [
      {
        q: "İkisini birden almak gerekir mi?",
        a: "Zorunlu değil. Risk profilinize göre biri veya ikisi birlikte tercih edilebilir.",
      },
    ],
  },

  // ─── İş ─────────────────────────────────────────────────
  {
    slug: "is-yeri-sigortasi-vs-konut-sigortasi",
    category: "is",
    left: { name: "İş Yeri Sigortası" },
    right: { name: "Konut Sigortası" },
    shortTitle: "İş Yeri vs Konut Sigortası",
    seoTitle: "İş Yeri Sigortası vs Konut Sigortası Farkları",
    seoDescription:
      "İş yeri ile konut sigortası teminat ve kullanım farkları. Evden çalışanlar için dikkat edilecekler.",
    summary: "Ticari riskler ile konut riskleri aynı poliçede karşılanmaz.",
    heroTitle: "İş Yeri Sigortası ile Konut Sigortası Farkları",
    heroIntro: [
      "Sigortacılıkta kullanım amacı poliçenin temelidir: konut sigortası yaşam alanınızı ve ev eşyanızı, iş yeri sigortası ise ticari faaliyetin yürütüldüğü mekânı, demirbaşı, stoku ve işletme sorumluluğunu teminat altına alır. Yanlış ürün seçimi, hasar anında tazminatın reddedilmesine yol açabilir.",
      "Bu içerikte stok ve demirbaş teminatı, iş durması ve üçüncü şahıs sorumluluğu gibi ticari teminatları konut paketleriyle karşılaştırıyor; evden çalışanların ve ev-ofis kullanıcılarının dikkat etmesi gereken beyan yükümlülüklerini açıklıyoruz.",
    ],
    rows: [
      { label: "Kullanım amacı", left: "Ticari faaliyet", right: "Konut / yaşam alanı" },
      { label: "Stok / demirbaş", left: "Kapsama alınabilir", right: "Genelde yok" },
      { label: "İş durması", left: "Ek teminat olarak sunulabilir", right: "Yok" },
      { label: "Sorumluluk", left: "İşyeri / 3. şahıs odaklı", right: "Konut sorumluluğu" },
    ],
    advantages: {
      left: ["Ticari varlıklara uygun", "İş kesintisi seçenekleri"],
      right: ["Konut ve eşya için uygun fiyatlı"],
    },
    disadvantages: {
      left: ["Konut için fazla / uyumsuz olabilir"],
      right: ["İşyerini veya stoku kapsamaz"],
    },
    whoFor: {
      left: "Dükkan, ofis, depo işletenler.",
      right: "Ev sahipleri ve kiracılar.",
    },
    verdict: "Ev poliçesi işyerini; işyeri poliçesi evi kapsamaz. Faaliyet adresine doğru ürün seçilmelidir.",
    recommendation: "depends",
    recommendationText:
      "Ticari adresiniz varsa iş yeri sigortası; konut için ayrı konut/DASK çözümüne bakın.",
    faqs: [
      {
        q: "Evden çalışıyorum, konut yeterli mi?",
        a: "Sadece ev eşyası için kısmen. Ticari ekipman ve sorumluluk için poliçe şartlarını kontrol edin.",
      },
    ],
    relatedSlugs: ["dask-vs-konut-sigortasi"],
  },
  {
    slug: "mesleki-sorumluluk-vs-ucuncu-sahis",
    category: "is",
    left: { name: "Mesleki Sorumluluk" },
    right: { name: "Üçüncü Şahıs Mali Sorumluluk" },
    shortTitle: "Mesleki vs 3. Şahıs Sorumluluk",
    seoTitle: "Mesleki Sorumluluk vs Üçüncü Şahıs Mali Sorumluluk",
    seoDescription:
      "Mesleki hata ile üçüncü şahısa verilen zarar teminatları arasındaki farklar.",
    summary: "Hizmet hatası mı, yoksa fiziksel zarar / genel sorumluluk mu?",
    heroTitle: "Mesleki Sorumluluk ile Üçüncü Şahıs Mali Sorumluluk Farkları",
    heroIntro: [
      "Mesleki sorumluluk sigortası; avukat, mühendis, hekim ve mali müşavir gibi profesyonellerin hatalı hizmet veya ihmalden doğan tazminat taleplerini karşılar. Üçüncü şahıs mali sorumluluk ise işletme faaliyeti sırasında ziyaretçilere veya çevreye verilen bedeni ve maddi zararları teminat altına alır.",
      "Aşağıda iki teminatın odak alanlarını, örnek hasar senaryolarını ve hangi meslek ya da işletme türünde hangisinin öncelikli olduğunu karşılaştırıyor; tek poliçede birleştirme seçeneklerinde kontrol edilmesi gereken özel şartlara değiniyoruz.",
    ],
    rows: [
      { label: "Odak", left: "Mesleki hata / ihmal", right: "3. kişilere verilen zarar" },
      { label: "Örnek risk", left: "Yanlış danışmanlık, meslek hatası", right: "Müşteri yaralanması, mal hasarı" },
      { label: "Kimler için?", left: "Serbest meslek / profesyoneller", right: "İşyeri işletenler genel" },
    ],
    advantages: {
      left: ["Meslek riskine özel koruma"],
      right: ["Genel işletme sorumluluğu"],
    },
    disadvantages: {
      left: ["Fiziksel işyeri kazalarını tek başına kapsamaz"],
      right: ["Mesleki hata iddialarını kapsamayabilir"],
    },
    whoFor: {
      left: "Avukat, muhasebeci, mühendis, danışman vb.",
      right: "Mağaza, restoran, ofis gibi ziyaretçi alanları.",
    },
    verdict: "Farklı risk türleridir; birçok işletme için ikisi de ayrı ayrı değerlendirilmelidir.",
    recommendation: "depends",
    recommendationText:
      "Hizmet veriyorsanız mesleki; fiziksel mekânınız varsa üçüncü şahıs sorumluluğunu önceliklendirin.",
    faqs: [
      {
        q: "Bir poliçe ikisini de kapsar mı?",
        a: "Bazı paketlerde bir arada sunulabilir; teminat metnini mutlaka kontrol edin.",
      },
    ],
    relatedSlugs: ["is-yeri-sigortasi-vs-konut-sigortasi"],
  },

  // ─── Elektrikli ─────────────────────────────────────────
  {
    slug: "wallbox-sigortasi-vs-konut-sigortasi",
    category: "elektrikli",
    left: { name: "Wallbox Sigortası" },
    right: { name: "Konut Sigortası" },
    shortTitle: "Wallbox vs Konut Sigortası",
    seoTitle: "Wallbox Sigortası vs Konut Sigortası",
    seoDescription:
      "Ev tipi şarj ünitesi (wallbox) konut sigortasında kapsanır mı, ayrı teminat gerekir mi?",
    summary: "Ev tipi şarj ünitesi konut poliçesinde otomatik kapsanmayabilir.",
    heroTitle: "Wallbox (Ev Tipi Şarj Ünitesi) Sigortası ile Konut Sigortası",
    heroIntro: [
      "Elektrikli araç sahiplerinin evine kurduğu wallbox şarj üniteleri, konut poliçelerinde her zaman otomatik teminat kapsamında değildir; cihazın sabit kıymet olarak beyan edilmesi veya özel teminatla güvenceye alınması gerekir.",
      "Bu rehberde wallbox hasarı, montaj ve elektrik kaynaklı riskler ile hırsızlık senaryolarında iki yaklaşımın nasıl çalıştığını karşılaştırıyor; mevcut konut poliçenize ek beyan yaptırırken sormanız gereken teknik soruları listeliyoruz.",
    ],
    rows: [
      { label: "Wallbox hasarı", left: "Doğrudan odaklı teminat", right: "Ek / sabit kıymet olarak eklenebilir" },
      { label: "Montaj / elektrik riski", left: "Pakete göre daha net", right: "Poliçe şartına bağlı" },
      { label: "Prim etkisi", left: "Cihaza özel", right: "Konut paketinin parçası" },
    ],
    advantages: {
      left: ["Cihaza özel netlik"],
      right: ["Tek poliçede toplama imkânı"],
    },
    disadvantages: {
      left: ["Ayrı ürün bulmak zor olabilir"],
      right: ["Otomatik kapsamaz; beyan gerekir"],
    },
    whoFor: {
      left: "Pahalı wallbox sahibi EV kullanıcıları",
      right: "Konut poliçesini genişletmek isteyenler",
    },
    verdict:
      "Wallbox’u konut poliçesine sabit kıymet / ek teminat olarak işletmek çoğu zaman en pratik yoldur; kapsamı yazılı teyit edin.",
    recommendation: "depends",
    recommendationText:
      "Mevcut konut poliçenize wallbox beyanı ekleyin; yoksa EV kasko ek teminatlarını sorun.",
    faqs: [
      {
        q: "Wallbox çalınırsa ödenir mi?",
        a: "Poliçe ve montaj şekline (sabit / sökülebilir) göre değişir. Beyan şarttır.",
      },
    ],
    relatedSlugs: ["sarj-istasyonu-vs-is-yeri-sigortasi"],
  },
  {
    slug: "sarj-istasyonu-vs-is-yeri-sigortasi",
    category: "elektrikli",
    left: { name: "Şarj İstasyonu Sigortası" },
    right: { name: "İş Yeri Sigortası" },
    shortTitle: "Şarj İstasyonu vs İş Yeri",
    seoTitle: "Şarj İstasyonu Sigortası vs İş Yeri Sigortası",
    seoDescription:
      "Ticari şarj istasyonu riskleri ile klasik iş yeri teminatlarının karşılaştırması.",
    summary: "Ticari şarj altyapısı için özel riskler iş yeri paketinde netleştirilmelidir.",
    heroTitle: "Şarj İstasyonu Sigortası ile İş Yeri Sigortası Farkları",
    heroIntro: [
      "Ticari şarj istasyonları; yüksek güçlü elektrik altyapısı, 7/24 açık alan kullanımı ve yoğun üçüncü kişi trafiği nedeniyle klasik iş yeri risklerinden ayrışan bir profil taşır. Standart iş yeri poliçesi bu ekipmanı ancak açıkça beyan edildiğinde kapsar.",
      "İçerikte şarj ünitesi ve altyapı teminatı, işletme sorumluluğu ile yangın ve elektriksel arıza risklerini iki ürün açısından karşılaştırıyor; istasyon işletmecilerinin poliçelerine ekletmesi gereken kalemleri teknik başlıklar halinde sunuyoruz.",
    ],
    rows: [
      { label: "Şarj ünitesi / altyapı", left: "Odak teminat", right: "Demirbaş olarak eklenebilir" },
      { label: "İşletme sorumluluğu", left: "İstasyona özel", right: "Genel işyeri sorumluluğu" },
      { label: "Yangın / elektrik riski", left: "Yüksek kritik", right: "Standart yangın teminatı" },
    ],
    advantages: {
      left: ["İstasyon risklerine özel tasarım"],
      right: ["Mevcut işletme poliçesine entegre edilebilir"],
    },
    disadvantages: {
      left: ["Niş ürün, şirket seçenekleri sınırlı olabilir"],
      right: ["Şarj ekipmanı ayrıca beyan edilmezse açık kalır"],
    },
    whoFor: {
      left: "Şarj ağı / istasyon işletenler",
      right: "Otoparkında şarj ünitesi olan işletmeler",
    },
    verdict:
      "İş yeri sigortası temeldir; şarj ünitelerini demirbaş ve sorumluluk açısından ayrıca tanımlatın.",
    recommendation: "depends",
    recommendationText:
      "Ticari şarj yatırımı varsa iş yeri poliçenize istasyon ekipmanını açıkça ekletin.",
    faqs: [
      {
        q: "Sadece yangın teminatı yeter mi?",
        a: "Genelde hayır. Elektriksel arıza, vandalizm ve sorumluluk da değerlendirilmelidir.",
      },
    ],
    relatedSlugs: ["wallbox-sigortasi-vs-konut-sigortasi"],
  },
];

export function getComparison(slug: string): Comparison | undefined {
  return comparisons.find((c) => c.slug === slug);
}

export function getComparisonsByCategory(
  category: ComparisonCategory,
): Comparison[] {
  return comparisons.filter((c) => c.category === category);
}

export function getPopularComparisons(): Comparison[] {
  return comparisons.filter((c) => c.popular);
}

export function findComparisonBySides(
  leftName: string,
  rightName: string,
): Comparison | undefined {
  const norm = (s: string) => s.toLocaleLowerCase("tr-TR").trim();
  const a = norm(leftName);
  const b = norm(rightName);
  return comparisons.find((c) => {
    const l = norm(c.left.name);
    const r = norm(c.right.name);
    return (l === a && r === b) || (l === b && r === a);
  });
}

function normalizeSide(value: string): string {
  return value.toLocaleLowerCase("tr-TR").trim();
}

/** Products that can be compared with the given side (from real comparison pages). */
export function getComparisonPartners(sideName: string): string[] {
  const target = normalizeSide(sideName);
  const partners = new Set<string>();
  for (const c of comparisons) {
    if (normalizeSide(c.left.name) === target) partners.add(c.right.name);
    if (normalizeSide(c.right.name) === target) partners.add(c.left.name);
  }
  return Array.from(partners).sort((a, b) =>
    a.localeCompare(b, "tr", { sensitivity: "base" }),
  );
}

/** Unique side names for interactive dropdowns */
export function getAllComparisonSides(): string[] {
  const set = new Set<string>();
  for (const c of comparisons) {
    set.add(c.left.name);
    set.add(c.right.name);
  }
  return Array.from(set).sort((a, b) =>
    a.localeCompare(b, "tr", { sensitivity: "base" }),
  );
}

export const CATEGORY_ORDER: ComparisonCategory[] = [
  "arac",
  "saglik",
  "ev",
  "seyahat",
  "bireysel",
  "is",
  "elektrikli",
];
