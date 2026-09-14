import { CANCEL, type CancelMessages } from "./cancel";
import { COMPARE, type CompareMessages } from "./compare";
import { FLOW, type FlowMessages } from "./flow";
import { GLOSSARY, type GlossaryMessages } from "./glossary";
import type { Locale } from "./locales";
import { SUCCESS, type SuccessMessages } from "./success";

export interface UiMessages {
  nav: {
    about: string;
    products: string;
    cancel: string;
    compare: string;
    blog: string;
    menu: string;
    help: string;
    turkish: string;
    quote: string;
    explore: string;
    popular: string;
    closeMenu: string;
    siteMenu: string;
    groups: { vehicle: string; health: string; home: string };
    loading: string;
  };
  lang: { label: string; choose: string };
  footer: {
    blurb: string;
    products: string;
    knowledge: string;
    quick: string;
    legal: string;
    faq: string;
    glossary: string;
    comparison: string;
    riskMap: string;
    getQuote: string;
    cookiePrefs: string;
    copyright: string;
  };
  cookies: {
    title: string;
    bodyBefore: string;
    bodyAfter: string;
    link: string;
    reject: string;
    manage: string;
    accept: string;
    close: string;
    lead: string;
    alwaysOn: string;
    save: string;
    policyLead: string;
    policyAfter: string;
    necessaryTitle: string;
    necessaryDesc: string;
    analyticsTitle: string;
    analyticsDesc: string;
    preferencesTitle: string;
    preferencesDesc: string;
    marketingTitle: string;
    marketingDesc: string;
  };
  hero: {
    titleBefore: string;
    compare: string;
    staySafe: string;
    subtitle: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    lead: string;
    items: { question: string; answer: string }[];
  };
  partners: { eyebrow: string; title: string; lead: string };
  slider: {
    eyebrow: string;
    title: string;
    lead: string;
    prev: string;
    next: string;
  };
  about: {
    crumb: string;
    home: string;
    h1Before: string;
    h1Words: [string, string, string];
    h1After: string;
    lead: string;
    lead2: string;
    branches: string[];
    motto: [string, string, string];
    whyTitle: string;
    reasons: { title: string; text: string }[];
    ctaTitle: string;
    ctaLead: string;
    cta: string;
  };
  contact: {
    h1: string;
    lead: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    send: string;
    reachUs: string;
    kvkkBody: string;
  };
  cancel: CancelMessages;
  legal: {
    home: string;
    updated: string;
    contactTitle: string;
    contactLead: string;
    contactForm: string;
    other: string;
    disclaimer: string;
  };
  quote: {
    identity: string;
    identityStep: string;
    details: string;
    detailsStep: string;
    offers: string;
    policy: string;
    continue: string;
    continueEt: string;
    back: string;
    phone: string;
    birthDate: string;
    unavailableTitle: string;
    unavailableMessage: string;
    home: string;
    homeBack: string;
    breadcrumb: string;
    notFound: string;
    identityLead: string;
    kimlikLabel: string;
    kimlikHint: string;
    kvkkBody: string;
    kvkkMore: string;
    kvkkLink: string;
    kvkkAfter: string;
    saglikKvkkBody: string;
    listen: string;
    mute: string;
    advisorIntro: string;
    advisorNext: string;
    retry: string;
    continueAnyway: string;
    loading: string;
    phoneError: string;
    birthError: string;
    tcknError: string;
    vknError: string;
    yknError: string;
    notFoundRecord: string;
    verifyFailed: string;
    stillContinue: string;
    consentTitle: string;
    consentBody: string;
    consentYes: string;
    consentNo: string;
    consentError: string;
    consentDeclineNote: string;
    seeQuotes: string;
    companyNoBirth: string;
    insuredPeople: string;
    insuredSelf: string;
    insuredSpouse: string;
    insuredChild: string;
    hasPlate: string;
    noPlate: string;
    plateStatus: string;
    vehicleInfo: string;
    plate: string;
    documentSerial: string;
    engineNo: string;
    chassisNo: string;
    findSerial: string;
    findEngineChassis: string;
    serialHelpTitle: string;
    serialHelpAlt: string;
    serialHelpAria: string;
    vehicleNoHelpAria: string;
    vehicleNoHelpTitle: string;
    vehicleNoHelpP1: string;
    vehicleNoHelpP2: string;
    close: string;
    plateError: string;
    serialError: string;
    chassisError: string;
    enginePlaceholder: string;
    chassisPlaceholder: string;
  };
  success: SuccessMessages;
  flow: FlowMessages;
  compare: CompareMessages;
  glossaryPage: GlossaryMessages;
  unavailable: { contact: string };
  notfound: {
    title: string;
    text: string;
    home: string;
  };
  notice: { turkishSection: string };
  slides: Record<
    string,
    { eyebrow: string; line1: string; line2: string; subtitle: string; cta: string }
  >;
}

const TR: UiMessages = {
  nav: {
    about: "Hakkımızda",
    products: "Ürünlerimiz",
    cancel: "Poliçe İptal İşlemleri",
    compare: "Sigorta Türlerini Karşılaştır",
    blog: "Blog",
    menu: "Menü",
    help: "Yardıma mı ihtiyacınız var?",
    turkish: "Türkçe",
    quote: "Teklif Al",
    explore: "Keşfet",
    popular: "Popüler",
    closeMenu: "Menüyü kapat",
    siteMenu: "Site menüsü",
    groups: {
      vehicle: "Araç Sigortaları",
      health: "Sağlık Sigortaları",
      home: "Konut Sigortaları",
    },
    loading: "Sayfa yükleniyor",
  },
  lang: { label: "Dil", choose: "Dil seçin" },
  footer: {
    blurb:
      "30'a yakın sigorta şirketinden gelen fiyat ve teminat seçeneklerini karşılaştırmanızı kolaylaştırıyor, poliçe öncesinde ve sonrasında destek sunuyoruz.",
    products: "Ürünlerimiz",
    knowledge: "Bilgi Merkezi",
    quick: "Hızlı Bağlantılar",
    legal: "Yasal",
    faq: "Sıkça Sorulan Sorular",
    glossary: "Sigorta Sözlüğü",
    comparison: "Karşılaştırma Merkezi",
    riskMap: "Risk Haritası",
    getQuote: "Teklif Al",
    cookiePrefs: "Çerez Tercihleri",
    copyright: "© 2026 Sigorta Uzmanı.",
  },
  cookies: {
    title: "Çerez tercihleri",
    bodyBefore:
      "Sitemizin çalışması ve güvenliği için zorunlu teknolojileri kullanıyoruz. Analiz, tercih ve pazarlama teknolojileri ise yalnızca seçiminizle çalıştırılır. Ayrıntıları ",
    bodyAfter:
      "’nda inceleyebilir ve tercihlerinizi dilediğiniz zaman değiştirebilirsiniz.",
    link: "Çerez Politikası",
    reject: "Zorunlu olmayanları reddet",
    manage: "Tercihleri yönet",
    accept: "Tümünü kabul et",
    close: "Kapat",
    lead: "Zorunlu teknolojiler site güvenliği ve temel işlevler için her zaman etkindir. Aşağıdaki kategorileri açıp kapatabilirsiniz.",
    alwaysOn: "Her zaman açık",
    save: "Seçimi kaydet",
    policyLead: "Ayrıntılar için ",
    policyAfter: "’nı inceleyebilirsiniz.",
    necessaryTitle: "Zorunlu",
    necessaryDesc: "Oturum, güvenlik ve form işlemleri için gereklidir; kapatılamaz.",
    analyticsTitle: "Analiz",
    analyticsDesc:
      "Onayınızla Google Analytics 4 veya Google Tag Manager üzerinden sayfa ziyaretlerini ölçmek ve performansı iyileştirmek.",
    preferencesTitle: "Tercih",
    preferencesDesc: "Dil, görünüm veya benzeri tercihlerinizi hatırlamak için kullanılır.",
    marketingTitle: "Pazarlama",
    marketingDesc: "Kişiselleştirilmiş reklam veya yeniden hedefleme amacıyla kullanılır.",
  },
  hero: {
    titleBefore: "Teklif Al",
    compare: "Karşılaştır",
    staySafe: "Güvende Kal",
    subtitle: "Doğru sigorta. Uygun fiyat. Hızlı destek",
  },
  faq: {
    eyebrow: "Sıkça sorulan sorular",
    title: "Sigorta Uzmanı Hakkında Merak Ettikleriniz",
    lead: "Yanıtını bulamadığınız sorular için danışma hattımızdan bize ulaşabilirsiniz.",
    items: [
      {
        question: "Teklif alma süreci nasıl ilerliyor?",
        answer:
          "Bilgilerinizi ürün formuna girin. Entegrasyon bulunan sigorta şirketlerinden gelen anlık fiyat ve teminat seçeneklerini karşılaştırın. Seçtiğiniz şirkette çevrim içi satın alma destekleniyorsa doğrudan sigorta şirketinin ödeme ekranına yönlendirilirsiniz. Desteklenmiyorsa işleminiz, talep numaranız üzerinden WhatsApp temsilcimizle devam eder.",
      },
      {
        question: "Sigorta Uzmanı'nı neden tercih etmeliyim?",
        answer:
          "sigortauzmani.net, farklı sigorta şirketlerinin ürün ve tekliflerine ulaşmayı kolaylaştıran dijital bir sigorta platformudur. Entegre şirketlerden gelen fiyat ve teminat seçeneklerini tek ekranda görmenize yardımcı olur; poliçe, yenileme, değişiklik ve hasar süreçlerinde destek sunar.",
      },
      {
        question: "Teklif almak için ek ücret öder miyim?",
        answer:
          "Teklifleri görüntülemek ve karşılaştırmak için sizden ayrıca hizmet bedeli talep edilmez. Poliçe primi ve ödeme koşulları seçtiğiniz sigorta şirketinin teklifine göre belirlenir. Çevrim içi satın almada ödeme, sigorta şirketinin kendi ödeme ekranında yapılır; kart bilgileriniz Sigorta Uzmanı tarafından görülmez veya saklanmaz.",
      },
      {
        question: "Sigorta tekliflerini karşılaştırırken nelere dikkat etmeliyim?",
        answer:
          "Fiyatın yanı sıra teminat limitleri, muafiyetler, istisnalar, ek hizmetler ve ödeme koşulları birlikte değerlendirilmelidir. Ekibimiz, seçenekler arasındaki farkları açıklayarak ihtiyacınıza uygun poliçeyi seçmenize yardımcı olur.",
      },
      {
        question: "Kişisel verilerim nasıl kullanılıyor ve korunuyor?",
        answer:
          "Paylaştığınız kişisel veriler; tekliflerin oluşturulması, ilgili sigorta şirketlerinden fiyat alınması, seçtiğiniz satın alma veya temsilci destek sürecinin yürütülmesi amacıyla KVKK ve ilgili mevzuat kapsamında işlenir. Çevrim içi ödemede kart bilgileriniz sigorta şirketinin ekranına girilir; Sigorta Uzmanı tarafından görülmez veya saklanmaz. Ayrıntılı bilgi için KVKK Aydınlatma Metni'ni inceleyebilirsiniz.",
      },
    ],
  },
  partners: {
    eyebrow: "Güçlü iş ortaklıkları",
    title: "30'a Yakın Sigorta Şirketinden Teklif Al",
    lead: "Entegrasyon bulunan sigorta şirketlerinden gelen fiyat ve teminat seçeneklerini tek ekranda karşılaştırın; ihtiyacınıza uygun teklifi seçin.",
  },
  slider: {
    eyebrow: "Sizin için seçtik",
    title: "Hayatın Her Anında Yanınızdayız",
    lead: "Entegre sigorta şirketlerinden gelen anlık fiyat ve teminat seçeneklerini karşılaştırın; seçiminize göre çevrim içi satın alma adımına veya WhatsApp temsilcimize geçin.",
    prev: "Önceki sigorta seçeneği",
    next: "Sonraki sigorta seçeneği",
  },
  about: {
    crumb: "Hakkımızda",
    home: "Ana Sayfa",
    h1Before: "Sigortayı daha ",
    h1Words: ["anlaşılır", "hızlı", "güvenilir"],
    h1After: " hâle getiriyoruz.",
    lead: "sigortauzmani.net, farklı sigorta şirketlerinin tekliflerini tek noktada değerlendirmenize ve ihtiyacınıza uygun poliçeyi kolayca seçmenize yardımcı olur.",
    lead2:
      "Uzman ekibimiz; teklif aşamasından poliçe düzenlenmesine, yenileme işlemlerinden hasar sürecine kadar yanınızda olur. Amacımız yalnızca poliçe sunmak değil; doğru seçenekleri anlaşılır biçimde paylaşarak güvenle karar vermenizi sağlamaktır.",
    branches: ["Trafik", "Kasko", "Sağlık", "DASK", "Konut", "Seyahat"],
    motto: ["Doğru sigorta.", "Uygun fiyat.", "Hızlı destek."],
    whyTitle: "Neden sigortauzmani.net?",
    reasons: [
      { title: "Kolay karşılaştırma", text: "Farklı şirketlerin seçeneklerini tek noktada değerlendirin." },
      { title: "Uzman destek", text: "İhtiyacınıza uygun sigortayı danışman desteğiyle seçin." },
      { title: "Hızlı süreç", text: "Bilgilerinizi girin, entegre şirketlerden gelen anlık teklifleri karşılaştırın." },
      { title: "Poliçe sonrası", text: "Yenileme ve hasar süreçlerinde destek almaya devam edin." },
    ],
    ctaTitle: "Size uygun poliçeyi birlikte bulalım",
    ctaLead: "Formu doldurun; entegre şirketlerden gelen anlık teklifleri karşılaştırın. Gerekirse WhatsApp temsilcimizden destek alın.",
    cta: "Hemen Teklif Al",
  },
  contact: {
    h1: "Sorunuzu iletin, uzmanlarımız yanıtlasın.",
    lead: "Sigorta işlemlerinizle ilgili sorunuzu ve varsa belgenizi gönderin.",
    name: "Ad soyad",
    email: "E-posta",
    subject: "Konu",
    message: "Mesaj",
    send: "Gönder",
    reachUs: "Bize ulaşın",
    kvkkBody:
      "Ad, soyad, e-posta, konu, mesaj ve isteğe bağlı olarak yüklediğiniz dosya; talebinizi incelemek, size yanıt vermek ve gerektiğinde haklarımızı korumak amacıyla işlenir. İşlemle ilgisi olmayan kişisel bilgileri ve özel nitelikli verileri mesaj veya dosya içinde paylaşmayın.",
  },
  cancel: CANCEL.tr,
  legal: {
    home: "Ana Sayfa",
    updated: "Son güncelleme",
    contactTitle: "İletişim",
    contactLead: "Başvuru ve sorularınız için bizimle iletişime geçebilirsiniz.",
    contactForm: "İletişim formu",
    other: "Diğer yasal metinler",
    disclaimer:
      "Bu metin bilgilendirme amaçlıdır. Uyuşmazlıkta Türkçe metin esas alınır.",
  },
  quote: {
    identity: "Kimlik bilgileri",
    identityStep: "Kimlik",
    details: "Teklif detayları",
    detailsStep: "Detaylar",
    offers: "Teklifler",
    policy: "Poliçe",
    continue: "Devam",
    continueEt: "Devam et",
    back: "Geri",
    phone: "Cep telefonu",
    birthDate: "Doğum tarihi",
    unavailableTitle: "Bu ürün şu anda kullanılamıyor",
    unavailableMessage:
      "Bu ürün için yeni talep alımına kısa süreliğine ara verdik. Destek ekibimiz alternatifler konusunda yardımcı olabilir.",
    home: "Ana Sayfa",
    homeBack: "Ana Sayfaya dön",
    breadcrumb: "Sayfa yolu",
    notFound: "Ürün bulunamadı",
    identityLead:
      "Bilgileriniz, entegrasyon bulunan sigorta şirketlerinden anlık teklif almak için kullanılır.",
    kimlikLabel: "T.C. kimlik / vergi kimlik numarası",
    kimlikHint: "Şirket adına teklif alıyorsanız vergi kimlik numarasını girin.",
    kvkkBody:
      "Paylaştığınız kişisel veriler, talep ettiğiniz sigorta teklifinin oluşturulması ve ilgili sigorta şirketlerinden fiyat alınması amacıyla işlenir.",
    kvkkMore: "Ayrıntılı bilgi için",
    kvkkLink: "KVKK Aydınlatma Metni",
    kvkkAfter: "’ni inceleyebilirsiniz.",
    saglikKvkkBody:
      "Sağlık sigortası teklifi için paylaşacağınız sağlık beyanı ve sağlığınıza ilişkin diğer bilgiler özel nitelikli kişisel veridir. Bu bilgiler, kişiselleştirilmiş teklif alınması ve seçiminiz hâlinde poliçe sürecinin yürütülmesi amacıyla yalnızca gerekli olduğu ölçüde işlenebilir ve ilgili sağlık sigortası şirketlerine iletilebilir.",
    listen: "Sesli dinle",
    mute: "Sesi kapat",
    advisorIntro:
      "Merhaba, ben Sigorta Uzmanı dijital teklif asistanıyım. Bilgilerinizi birkaç kısa adımda paylaşarak entegrasyon bulunan sigorta şirketlerinden gelen anlık fiyat ve teminat seçeneklerini karşılaştırabilirsiniz. Çevrim içi satın alma desteklenen ürünlerde doğrudan sigorta şirketinin ödeme ekranına yönlendirilirsiniz; diğerlerinde süreciniz WhatsApp temsilcimizle devam eder. Hazırsanız başlayalım.",
    advisorNext:
      "Teşekkür ederim. Son adıma geçiyoruz. Lütfen kalan iki bilgiyi de paylaşın. Ardından sizin için en uygun sigorta tekliflerini hazırlayacağım.",
    retry: "Tekrar dene",
    continueAnyway: "Yine de devam et",
    loading: "Bilgiler getiriliyor…",
    phoneError: "Geçerli bir cep telefonu girin (05XX XXX XX XX).",
    birthError: "Doğum tarihinizi girin.",
    tcknError: "T.C. Kimlik Numarası 11 hane, Vergi Kimlik Numarası 10 hane olmalı.",
    vknError: "Geçerli bir Vergi Kimlik Numarası girin (10 hane).",
    yknError: "Yabancı Kimlik Numarası 99 ile başlayan 11 hane olmalı.",
    notFoundRecord:
      "Kaydınız bulunamadı. Kimlik numaranızı kontrol edin veya bilgilerinizi kendiniz girerek devam edin.",
    verifyFailed: "Kimlik bilgileri doğrulanamadı.",
    stillContinue: "Yine de devam edebilirsiniz.",
    consentTitle: "Açık rıza",
    consentBody:
      "Sağlık sigortası teklifinin hazırlanması ve seçmem hâlinde poliçe sürecinin yürütülmesi amacıyla; formda paylaştığım sağlık bilgilerimin {company} tarafından işlenmesine ve teklif alınması amacıyla seçilen anlaşmalı sağlık sigortası şirketlerine aktarılmasına açık rıza veriyorum.",
    consentYes: "Açık rıza veriyorum",
    consentNo: "Açık rıza vermiyorum",
    consentError:
      "Devam etmek için açık rıza seçeneklerinden birini işaretleyin.",
    consentDeclineNote:
      "Açık rıza vermeden de devam edebilirsiniz. Bu durumda sağlık bilgileriniz işlenmez; teklif yalnızca formda paylaştığınız kimlik ve iletişim bilgileriyle hazırlanır.",
    seeQuotes: "Teklifleri Gör",
    companyNoBirth:
      "Şirket adına açılan talepte doğum tarihi istenmiyor. Teklifinizi oluşturmak için devam edebilirsiniz.",
    insuredPeople: "Sigortalanacak Kişi/Kişiler",
    insuredSelf: "Kendim",
    insuredSpouse: "Eşim",
    insuredChild: "Çocuğum",
    hasPlate: "Plaka Var",
    noPlate: "Plaka Yok",
    plateStatus: "Plaka durumu",
    vehicleInfo: "Araç Bilgileri",
    plate: "Plaka",
    documentSerial: "Belge seri numarası",
    engineNo: "Motor numarası",
    chassisNo: "Şasi numarası",
    findSerial: "Ruhsat seri numaramı bulamıyorum",
    findEngineChassis: "Motor ve Şasi numaramı bulamıyorum",
    serialHelpTitle: "Ruhsat seri numaranızı nerede bulabilirsiniz?",
    serialHelpAlt: "Araç ruhsatında seri numarasının yeri",
    serialHelpAria: "Ruhsat seri numarası nerede?",
    vehicleNoHelpAria: "Motor ve şasi numarası nerede?",
    vehicleNoHelpTitle: "Motor ve Şasi numaranızı nerede bulabilirsiniz?",
    vehicleNoHelpP1:
      "Bu bilgileri, aracınızı satın alırken bayinin düzenlediği proforma faturada bulabilirsiniz.",
    vehicleNoHelpP2: "Proforma faturanızı bayinizden talep edebilirsiniz.",
    close: "Kapat",
    plateError: "Geçerli bir plaka girin (örn. 06 TC 001).",
    serialError: "Belge seri no 2 harf ve 6 rakam olmalı (örn. AA999999).",
    chassisError: "Geçerli bir şasi numarası girin (17 karakter).",
    enginePlaceholder: "Motor No",
    chassisPlaceholder: "Şasi No (17 karakter)",
  },
  success: SUCCESS.tr,
  flow: FLOW.tr,
  compare: COMPARE.tr,
  glossaryPage: GLOSSARY.tr,
  unavailable: { contact: "Bize ulaşın" },
  notfound: {
    title: "Bu sayfayı bulamadık",
    text: "Aradığınız adres taşınmış, adı değişmiş veya hiç var olmamış olabilir.",
    home: "Ana sayfaya dön",
  },
  notice: { turkishSection: "Bu bölüm Türkçe’dir." },
  slides: {
    "trafik-sigortasi": {
      eyebrow: "Trafik Sigortası",
      line1: "Yola çıkarken.",
      line2: "Güvenceniz hazır.",
      subtitle: "Zorunlu trafik sigortası tekliflerini kolayca değerlendirin.",
      cta: "Trafik Sigortası Teklifi Al",
    },
    kasko: {
      eyebrow: "Kasko",
      line1: "Beklenmeyene karşı.",
      line2: "Aracınız güvende.",
      subtitle: "Aracınızı farklı risklere karşı kapsamlı güvenceyle koruyun.",
      cta: "Kasko Teklifi Al",
    },
    "tamamlayici-saglik": {
      eyebrow: "Tamamlayıcı Sağlık Sigortası",
      line1: "Sağlığınız için.",
      line2: "Bütçenizi yormadan.",
      subtitle:
        "SGK ile anlaşmalı özel hastanelerde, poliçe kapsamındaki fark ücretlerine karşı güvence seçeneklerini değerlendirin.",
      cta: "Tamamlayıcı Sağlık Teklifi Al",
    },
    "ozel-saglik": {
      eyebrow: "Özel Sağlık Sigortası",
      line1: "Sağlığınız için.",
      line2: "Daha geniş güvence.",
      subtitle: "İhtiyacınıza uygun kapsam ve sağlık ağı seçeneklerini değerlendirin.",
      cta: "Özel Sağlık Teklifi Al",
    },
    imm: {
      eyebrow: "İhtiyari Mali Mesuliyet (İMM)",
      line1: "Limitler yetmediğinde.",
      line2: "Ek güvence yanınızda.",
      subtitle: "Trafik sigortası limitlerini aşan sorumluluklara karşı korunun.",
      cta: "İMM Teklifi Al",
    },
    dask: {
      eyebrow: "DASK",
      line1: "Deprem beklenmez.",
      line2: "Eviniz güvende.",
      subtitle: "Zorunlu deprem sigortanızı kolayca oluşturun.",
      cta: "DASK Teklifi Al",
    },
    konut: {
      eyebrow: "Konut Sigortası",
      line1: "Eviniz değerli.",
      line2: "Güvencesi hazır.",
      subtitle: "Evinizi ve eşyalarınızı beklenmedik risklere karşı koruyun.",
      cta: "Konut Sigortası Teklifi Al",
    },
    "seyahat-saglik": {
      eyebrow: "Seyahat Sağlık Sigortası",
      line1: "Yola çıkmadan.",
      line2: "Güvenceniz hazır.",
      subtitle: "Seyahatiniz boyunca sağlık risklerine karşı koruma sağlayın.",
      cta: "Seyahat Sağlık Teklifi Al",
    },
    "yesil-kart": {
      eyebrow: "Yeşil Kart Sigortası",
      line1: "Sınırlar değişir.",
      line2: "Güvenceniz sürer.",
      subtitle: "Aracınızı yurt dışında kullanırken gerekli olan sigorta için teklif alın.",
      cta: "Yeşil Kart Teklifi Al",
    },
  },
};

const EN: UiMessages = {
  nav: {
    about: "About",
    products: "Products",
    cancel: "Policy Cancellation",
    compare: "Compare Insurance Types",
    blog: "Blog",
    menu: "Menu",
    help: "Need help?",
    turkish: "Türkçe",
    quote: "Get a quote",
    explore: "Explore",
    popular: "Popular",
    closeMenu: "Close menu",
    siteMenu: "Site menu",
    groups: { vehicle: "Motor insurance", health: "Health insurance", home: "Home insurance" },
    loading: "Loading page",
  },
  lang: { label: "Language", choose: "Choose language" },
  footer: {
    blurb:
      "We make it easier to compare prices and covers from nearly 30 insurers, and we support you before and after the policy.",
    products: "Products",
    knowledge: "Knowledge centre",
    quick: "Quick links",
    legal: "Legal",
    faq: "Frequently asked questions",
    glossary: "Insurance glossary",
    comparison: "Comparison centre",
    riskMap: "Risk map",
    getQuote: "Get a quote",
    cookiePrefs: "Cookie preferences",
    copyright: "© 2026 Sigorta Uzmanı.",
  },
  cookies: {
    title: "Cookie preferences",
    bodyBefore:
      "We use essential technologies for the site to work securely. Analytics, preference and marketing technologies run only with your choice. You can read the details in the ",
    bodyAfter: " and change your preferences at any time.",
    link: "Cookie Policy",
    reject: "Reject non-essential",
    manage: "Manage preferences",
    accept: "Accept all",
    close: "Close",
    lead: "Essential technologies stay on for security and core functions. You can turn the categories below on or off.",
    alwaysOn: "Always on",
    save: "Save selection",
    policyLead: "See the ",
    policyAfter: " for details.",
    necessaryTitle: "Essential",
    necessaryDesc: "Required for session, security and forms; cannot be turned off.",
    analyticsTitle: "Analytics",
    analyticsDesc: "Measure visits and improve performance via GA4 or Google Tag Manager after your consent.",
    preferencesTitle: "Preferences",
    preferencesDesc: "Remember language, display or similar choices.",
    marketingTitle: "Marketing",
    marketingDesc: "Used for personalised advertising or retargeting.",
  },
  hero: {
    titleBefore: "Get a quote",
    compare: "Compare",
    staySafe: "Stay covered",
    subtitle: "The right cover. A fair price. Fast support",
  },
  faq: {
    eyebrow: "Frequently asked questions",
    title: "What people ask about Sigorta Uzmanı",
    lead: "If you cannot find an answer, call our advisory line.",
    items: [
      {
        question: "How does getting a quote work?",
        answer:
          "Enter your details in the product form. Compare live prices and covers from integrated insurers. If the selected company supports online purchase you are sent to that insurer’s payment screen. Otherwise we continue on WhatsApp with your request number.",
      },
      {
        question: "Why choose Sigorta Uzmanı?",
        answer:
          "sigortauzmani.net is a digital insurance platform that makes it easier to reach products and quotes from different insurers. You see prices and covers on one screen and we support policy, renewal, change and claims processes.",
      },
      {
        question: "Do I pay extra to get a quote?",
        answer:
          "Viewing and comparing quotes does not include a separate service fee. The premium and payment terms follow the insurer’s quote. Online payment is made on the insurer’s own screen; Sigorta Uzmanı does not see or store card details.",
      },
      {
        question: "What should I check when comparing quotes?",
        answer:
          "Look at cover limits, deductibles, exclusions, extra services and payment terms together with price. Our team explains the differences so you can choose the right policy.",
      },
      {
        question: "How are my personal data used and protected?",
        answer:
          "Your data is processed under KVKK to create quotes, obtain prices from insurers and run purchase or advisor support. Card details for online payment are entered on the insurer’s screen and are not seen or stored by Sigorta Uzmanı. See the KVKK notice for details.",
      },
    ],
  },
  partners: {
    eyebrow: "Strong partnerships",
    title: "Quotes from nearly 30 insurers",
    lead: "Compare live prices and covers from integrated insurers on one screen and pick the offer that fits.",
  },
  slider: {
    eyebrow: "Picked for you",
    title: "With you at every moment",
    lead: "Compare live prices and covers from integrated insurers, then continue to online purchase or our WhatsApp advisor.",
    prev: "Previous insurance option",
    next: "Next insurance option",
  },
  about: {
    crumb: "About",
    home: "Home",
    h1Before: "We make insurance more ",
    h1Words: ["clear", "fast", "reliable"],
    h1After: ".",
    lead: "sigortauzmani.net helps you review quotes from different insurers in one place and choose the policy that fits.",
    lead2:
      "Our team stays with you from quote to policy issuance, renewals and claims. We do not only sell a policy; we explain the options so you can decide with confidence.",
    branches: ["MTPL", "Casco", "Health", "DASK", "Home", "Travel"],
    motto: ["The right cover.", "A fair price.", "Fast support."],
    whyTitle: "Why sigortauzmani.net?",
    reasons: [
      { title: "Easy comparison", text: "Review options from different companies in one place." },
      { title: "Expert support", text: "Choose the right cover with an advisor." },
      { title: "Fast process", text: "Enter your details and compare live quotes from integrated insurers." },
      { title: "After the policy", text: "Keep getting support for renewals and claims." },
    ],
    ctaTitle: "Let’s find the right policy together",
    ctaLead: "Fill in the form, compare live quotes, and get WhatsApp support if you need it.",
    cta: "Get a quote now",
  },
  contact: {
    h1: "Send your question. Our team will reply.",
    lead: "Send your insurance question and any supporting document.",
    name: "Full name",
    email: "Email",
    subject: "Subject",
    message: "Message",
    send: "Send",
    reachUs: "Contact us",
    kvkkBody:
      "Your name, email, subject, message and any optional file you upload are processed to review your request, reply to you and protect our rights where needed. Do not share unrelated personal data or special-category data in the message or file.",
  },
  cancel: CANCEL.en,
  legal: {
    home: "Home",
    updated: "Last updated",
    contactTitle: "Contact",
    contactLead: "You can reach us for applications and questions.",
    contactForm: "Contact form",
    other: "Other legal texts",
    disclaimer:
      "This translation is for information only. In a dispute the Turkish text prevails.",
  },
  quote: {
    identity: "Identity details",
    identityStep: "Identity",
    details: "Quote details",
    detailsStep: "Details",
    offers: "Quotes",
    policy: "Policy",
    continue: "Continue",
    continueEt: "Continue",
    back: "Back",
    phone: "Mobile phone",
    birthDate: "Date of birth",
    unavailableTitle: "This product is unavailable",
    unavailableMessage:
      "We have paused new requests for this product for a short time. Our support team can help with alternatives.",
    home: "Home",
    homeBack: "Back to home",
    breadcrumb: "Breadcrumb",
    notFound: "Product not found",
    identityLead:
      "Your details are used to get live quotes from integrated insurance companies.",
    kimlikLabel: "Turkish ID / tax ID number",
    kimlikHint: "If you are requesting a quote for a company, enter the tax ID number.",
    kvkkBody:
      "The personal data you share is processed to create the insurance quote you requested and to obtain prices from the relevant insurers.",
    kvkkMore: "For details, see the",
    kvkkLink: "KVKK information notice",
    kvkkAfter: ".",
    saglikKvkkBody:
      "The health declaration and other health information you share for a health insurance quote are special-category personal data. They may be processed only as far as needed to obtain a personalised quote and, if you choose, to run the policy process, and may be sent to the relevant health insurers.",
    listen: "Listen with sound",
    mute: "Mute",
    advisorIntro:
      "Hello, I am Sigorta Uzmanı’s digital quote assistant. Share your details in a few short steps to compare live prices and covers from integrated insurers. On products that support online purchase you are sent to the insurer’s payment screen; otherwise your process continues with our WhatsApp advisor. Let’s get started when you are ready.",
    advisorNext:
      "Thank you. We are moving to the last step. Please share the remaining two details. I will then prepare the most suitable insurance quotes for you.",
    retry: "Try again",
    continueAnyway: "Continue anyway",
    loading: "Fetching details…",
    phoneError: "Enter a valid mobile number (05XX XXX XX XX).",
    birthError: "Enter your date of birth.",
    tcknError: "Turkish ID must be 11 digits and tax ID must be 10 digits.",
    vknError: "Enter a valid tax ID number (10 digits).",
    yknError: "Foreign ID number must be 11 digits starting with 99.",
    notFoundRecord:
      "Your record was not found. Check your ID number or continue by entering the details yourself.",
    verifyFailed: "Identity details could not be verified.",
    stillContinue: "You can still continue.",
    consentTitle: "Explicit consent",
    consentBody:
      "I give explicit consent for {company} to process the health information I share in this form and to transfer it to the selected partner health insurers in order to prepare a health insurance quote and, if I choose, to run the policy process.",
    consentYes: "I give explicit consent",
    consentNo: "I do not give explicit consent",
    consentError: "Select one of the explicit-consent options to continue.",
    consentDeclineNote:
      "You can continue without giving explicit consent. In that case your health information is not processed; the quote is prepared only with the identity and contact details you share in the form.",
    seeQuotes: "See quotes",
    companyNoBirth:
      "A date of birth is not required for a company quote. You can continue to create your quote.",
    insuredPeople: "Person(s) to be insured",
    insuredSelf: "Myself",
    insuredSpouse: "My spouse",
    insuredChild: "My child",
    hasPlate: "I have a plate",
    noPlate: "No plate",
    plateStatus: "Plate status",
    vehicleInfo: "Vehicle details",
    plate: "Plate",
    documentSerial: "Document serial number",
    engineNo: "Engine number",
    chassisNo: "Chassis number",
    findSerial: "I cannot find my registration serial number",
    findEngineChassis: "I cannot find my engine and chassis numbers",
    serialHelpTitle: "Where can you find your registration serial number?",
    serialHelpAlt: "Where the serial number is on the vehicle registration",
    serialHelpAria: "Where is the registration serial number?",
    vehicleNoHelpAria: "Where are the engine and chassis numbers?",
    vehicleNoHelpTitle: "Where can you find your engine and chassis numbers?",
    vehicleNoHelpP1:
      "You can find these details on the proforma invoice issued by the dealer when you bought the vehicle.",
    vehicleNoHelpP2: "You can request the proforma invoice from your dealer.",
    close: "Close",
    plateError: "Enter a valid plate (e.g. 06 TC 001).",
    serialError: "Document serial must be 2 letters and 6 digits (e.g. AA999999).",
    chassisError: "Enter a valid chassis number (17 characters).",
    enginePlaceholder: "Engine no.",
    chassisPlaceholder: "Chassis no. (17 characters)",
  },
  success: SUCCESS.en,
  flow: FLOW.en,
  compare: COMPARE.en,
  glossaryPage: GLOSSARY.en,
  unavailable: { contact: "Contact us" },
  notfound: {
    title: "We could not find this page",
    text: "The address may have moved, changed name or never existed.",
    home: "Back to home",
  },
  notice: { turkishSection: "This section is in Turkish." },
  slides: {
    "trafik-sigortasi": {
      eyebrow: "Motor third party liability",
      line1: "Before you drive.",
      line2: "Cover is ready.",
      subtitle: "Review compulsory MTPL quotes quickly.",
      cta: "Get an MTPL quote",
    },
    kasko: {
      eyebrow: "Casco",
      line1: "Against the unexpected.",
      line2: "Your car is covered.",
      subtitle: "Protect your vehicle against a wider set of risks.",
      cta: "Get a casco quote",
    },
    "tamamlayici-saglik": {
      eyebrow: "Complementary health",
      line1: "For your health.",
      line2: "Without straining your budget.",
      subtitle: "Review cover for difference fees at private hospitals contracted with SGK.",
      cta: "Get a complementary health quote",
    },
    "ozel-saglik": {
      eyebrow: "Private health",
      line1: "For your health.",
      line2: "Wider cover.",
      subtitle: "Review scope and hospital network options that fit you.",
      cta: "Get a private health quote",
    },
    imm: {
      eyebrow: "Excess liability (IMM)",
      line1: "When limits are not enough.",
      line2: "Extra cover is there.",
      subtitle: "Protect against liability above MTPL limits.",
      cta: "Get an IMM quote",
    },
    dask: {
      eyebrow: "DASK",
      line1: "Earthquakes are not scheduled.",
      line2: "Your home can be covered.",
      subtitle: "Issue compulsory earthquake insurance easily.",
      cta: "Get a DASK quote",
    },
    konut: {
      eyebrow: "Home insurance",
      line1: "Your home matters.",
      line2: "Cover is ready.",
      subtitle: "Protect your home and contents against unexpected risks.",
      cta: "Get a home insurance quote",
    },
    "seyahat-saglik": {
      eyebrow: "Travel health",
      line1: "Before you go.",
      line2: "Cover is ready.",
      subtitle: "Stay covered against health risks throughout your trip.",
      cta: "Get a travel health quote",
    },
    "yesil-kart": {
      eyebrow: "Green Card",
      line1: "Borders change.",
      line2: "Cover continues.",
      subtitle: "Get a quote for the insurance required when you drive abroad.",
      cta: "Get a Green Card quote",
    },
  },
};

const AR: UiMessages = {
  nav: {
    about: "من نحن",
    products: "منتجاتنا",
    cancel: "إلغاء الوثيقة",
    compare: "قارن أنواع التأمين",
    blog: "المدونة",
    menu: "القائمة",
    help: "هل تحتاج مساعدة؟",
    turkish: "Türkçe",
    quote: "اطلب عرضاً",
    explore: "استكشف",
    popular: "شائع",
    closeMenu: "إغلاق القائمة",
    siteMenu: "قائمة الموقع",
    groups: { vehicle: "تأمين المركبات", health: "التأمين الصحي", home: "تأمين المنزل" },
    loading: "جاري تحميل الصفحة",
  },
  lang: { label: "اللغة", choose: "اختر اللغة" },
  footer: {
    blurb:
      "نسهّل مقارنة الأسعار والتغطيات من نحو 30 شركة تأمين، ونقدم الدعم قبل الوثيقة وبعدها.",
    products: "منتجاتنا",
    knowledge: "مركز المعلومات",
    quick: "روابط سريعة",
    legal: "قانوني",
    faq: "الأسئلة الشائعة",
    glossary: "قاموس التأمين",
    comparison: "مركز المقارنة",
    riskMap: "خريطة المخاطر",
    getQuote: "اطلب عرضاً",
    cookiePrefs: "تفضيلات ملفات الارتباط",
    copyright: "© 2026 Sigorta Uzmanı.",
  },
  cookies: {
    title: "تفضيلات ملفات الارتباط",
    bodyBefore:
      "نستخدم تقنيات ضرورية لعمل الموقع وأمنه. تقنيات التحليل والتفضيل والتسويق تعمل فقط باختيارك. يمكنك قراءة التفاصيل في ",
    bodyAfter: " وتغيير تفضيلاتك في أي وقت.",
    link: "سياسة ملفات الارتباط",
    reject: "رفض غير الضرورية",
    manage: "إدارة التفضيلات",
    accept: "قبول الكل",
    close: "إغلاق",
    lead: "التقنيات الضرورية تبقى مفعّلة للأمن والوظائف الأساسية. يمكنك تشغيل الفئات أدناه أو إيقافها.",
    alwaysOn: "مفعّل دائماً",
    save: "حفظ الاختيار",
    policyLead: "راجع ",
    policyAfter: " للتفاصيل.",
    necessaryTitle: "ضروري",
    necessaryDesc: "لازم للجلسة والأمن والنماذج ولا يمكن إيقافه.",
    analyticsTitle: "تحليل",
    analyticsDesc: "قياس الزيارات وتحسين الأداء عبر GA4 أو Google Tag Manager بعد موافقتك.",
    preferencesTitle: "تفضيلات",
    preferencesDesc: "لتذكّر اللغة أو العرض أو اختيارات مشابهة.",
    marketingTitle: "تسويق",
    marketingDesc: "للإعلانات المخصصة أو إعادة الاستهداف.",
  },
  hero: {
    titleBefore: "اطلب عرضاً",
    compare: "قارن",
    staySafe: "ابقَ محمياً",
    subtitle: "التغطية المناسبة. سعر عادل. دعم سريع",
  },
  faq: {
    eyebrow: "الأسئلة الشائعة",
    title: "ما يُسأل عن Sigorta Uzmanı",
    lead: "إذا لم تجد الإجابة فاتصل بخط الاستشارة.",
    items: [
      {
        question: "كيف تتم عملية طلب العرض؟",
        answer:
          "أدخل بياناتك في نموذج المنتج. قارن الأسعار والتغطيات الفورية من الشركات المتكاملة. إذا كان الشراء عبر الإنترنت مدعوماً تُوجَّه إلى شاشة دفع شركة التأمين. وإلا نتابع عبر واتساب برقم طلبك.",
      },
      {
        question: "لماذا أختار Sigorta Uzmanı؟",
        answer:
          "sigortauzmani.net منصة تأمين رقمية تسهّل الوصول إلى منتجات وعروض شركات مختلفة. ترى الأسعار والتغطيات في شاشة واحدة وندعم الوثيقة والتجديد والتعديل والمطالبات.",
      },
      {
        question: "هل أدفع رسماً إضافياً لطلب العرض؟",
        answer:
          "عرض العروض ومقارنتها لا يتضمن رسوم خدمة منفصلة. قسط الوثيقة وشروط الدفع تتبع عرض شركة التأمين. الدفع عبر الإنترنت يتم في شاشة الشركة؛ لا نرى بيانات البطاقة ولا نخزنها.",
      },
      {
        question: "على ماذا أركز عند مقارنة العروض؟",
        answer:
          "انظر إلى حدود التغطية والتحمل والاستثناءات والخدمات الإضافية وشروط الدفع مع السعر. يشرح فريقنا الفروقات لتختار الوثيقة المناسبة.",
      },
      {
        question: "كيف تُستخدم بياناتي الشخصية وتُحمى؟",
        answer:
          "تُعالَج بياناتك وفق قانون حماية البيانات لإنشاء العروض والحصول على الأسعار وتنفيذ الشراء أو دعم المستشار. بيانات البطاقة تُدخل في شاشة شركة التأمين ولا نراها ولا نخزنها. راجع إشعار KVKK للتفاصيل.",
      },
    ],
  },
  partners: {
    eyebrow: "شراكات قوية",
    title: "عروض من نحو 30 شركة تأمين",
    lead: "قارن الأسعار والتغطيات من الشركات المتكاملة في شاشة واحدة واختر العرض المناسب.",
  },
  slider: {
    eyebrow: "اخترنا لكم",
    title: "معكم في كل لحظة",
    lead: "قارنوا الأسعار والتغطيات الفورية من شركات التأمين المتكاملة، ثم انتقلوا إلى الشراء عبر الإنترنت أو إلى ممثل واتساب.",
    prev: "خيار التأمين السابق",
    next: "خيار التأمين التالي",
  },
  about: {
    crumb: "من نحن",
    home: "الرئيسية",
    h1Before: "نجعل التأمين أكثر ",
    h1Words: ["وضوحاً", "سرعة", "موثوقية"],
    h1After: ".",
    lead: "يساعدك sigortauzmani.net على تقييم عروض شركات التأمين في مكان واحد واختيار الوثيقة المناسبة.",
    lead2:
      "يبقى فريقنا معك من العرض إلى إصدار الوثيقة والتجديد والمطالبات. هدفنا ليس بيع وثيقة فحسب بل شرح الخيارات بوضوح.",
    branches: ["مرور", "كاسكو", "صحة", "داسك", "منزل", "سفر"],
    motto: ["التغطية المناسبة.", "سعر عادل.", "دعم سريع."],
    whyTitle: "لماذا sigortauzmani.net؟",
    reasons: [
      { title: "مقارنة سهلة", text: "قيّم خيارات الشركات المختلفة في مكان واحد." },
      { title: "دعم متخصص", text: "اختر التأمين المناسب مع مستشار." },
      { title: "عملية سريعة", text: "أدخل بياناتك وقارن العروض الفورية." },
      { title: "بعد الوثيقة", text: "استمر في الحصول على الدعم للتجديد والمطالبات." },
    ],
    ctaTitle: "لنجد الوثيقة المناسبة معاً",
    ctaLead: "املأ النموذج وقارن العروض الفورية واطلب الدعم عبر واتساب عند الحاجة.",
    cta: "اطلب عرضاً الآن",
  },
  contact: {
    h1: "أرسل سؤالك. يردّ خبراؤنا.",
    lead: "أرسل سؤالك حول معاملات التأمين وأي مستند داعم.",
    name: "الاسم الكامل",
    email: "البريد الإلكتروني",
    subject: "الموضوع",
    message: "الرسالة",
    send: "إرسال",
    reachUs: "تواصل معنا",
    kvkkBody:
      "يُعالَج الاسم والبريد والموضوع والرسالة وأي ملف اختياري ترفعونه لمراجعة طلبكم والرد عليكم وحماية حقوقنا عند الحاجة. لا تشاركوا بيانات شخصية غير ذات صلة أو بيانات ذات طبيعة خاصة في الرسالة أو الملف.",
  },
  cancel: CANCEL.ar,
  legal: {
    home: "الرئيسية",
    updated: "آخر تحديث",
    contactTitle: "اتصال",
    contactLead: "يمكنك التواصل معنا للطلبات والأسئلة.",
    contactForm: "نموذج الاتصال",
    other: "نصوص قانونية أخرى",
    disclaimer: "هذه الترجمة للعلم فقط. عند النزاع يُعتد بالنص التركي.",
  },
  quote: {
    identity: "بيانات الهوية",
    identityStep: "الهوية",
    details: "تفاصيل العرض",
    detailsStep: "التفاصيل",
    offers: "العروض",
    policy: "الوثيقة",
    continue: "التالي",
    continueEt: "التالي",
    back: "رجوع",
    phone: "الهاتف المحمول",
    birthDate: "تاريخ الميلاد",
    unavailableTitle: "هذا المنتج غير متاح حالياً",
    unavailableMessage:
      "أوقفنا استقبال الطلبات الجديدة لهذا المنتج لفترة قصيرة. يمكن لفريق الدعم المساعدة ببدائل.",
    home: "الرئيسية",
    homeBack: "العودة إلى الرئيسية",
    breadcrumb: "مسار الصفحة",
    notFound: "المنتج غير موجود",
    identityLead:
      "تُستخدم بياناتكم للحصول على عروض فورية من شركات التأمين المتكاملة.",
    kimlikLabel: "رقم الهوية التركية / الرقم الضريبي",
    kimlikHint: "إذا كنتم تطلبون العرض باسم شركة فأدخلوا الرقم الضريبي.",
    kvkkBody:
      "تُعالَج البيانات الشخصية التي تشاركونها لإنشاء عرض التأمين المطلوب والحصول على الأسعار من شركات التأمين المعنية.",
    kvkkMore: "للتفاصيل راجعوا",
    kvkkLink: "نص التوعية وفق KVKK",
    kvkkAfter: ".",
    saglikKvkkBody:
      "إقرار الصحة والمعلومات الصحية الأخرى التي تشاركونها لعرض التأمين الصحي بيانات شخصية ذات طبيعة خاصة. يجوز معالجتها بالقدر اللازم فقط للحصول على عرض مخصص وتسيير عملية الوثيقة إذا اخترتم ذلك، ويجوز إرسالها إلى شركات التأمين الصحي المعنية.",
    listen: "استمع بالصوت",
    mute: "كتم الصوت",
    advisorIntro:
      "مرحباً، أنا مساعد العروض الرقمي في Sigorta Uzmanı. شاركوا بياناتكم في بضع خطوات قصيرة لمقارنة الأسعار والتغطيات الفورية من الشركات المتكاملة. في المنتجات التي تدعم الشراء عبر الإنترنت تُوجَّهون إلى شاشة دفع شركة التأمين؛ وفي غيرها يستمر الإجراء مع ممثل واتساب. إن كنتم جاهزين فلنبدأ.",
    advisorNext:
      "شكراً لكم. ننتقل إلى الخطوة الأخيرة. يرجى مشاركة البيانين المتبقيين. بعدها أعدّ لكم أنسب عروض التأمين.",
    retry: "أعد المحاولة",
    continueAnyway: "تابع على أي حال",
    loading: "جارٍ جلب البيانات…",
    phoneError: "أدخلوا رقم هاتف محمولاً صالحاً (05XX XXX XX XX).",
    birthError: "أدخلوا تاريخ الميلاد.",
    tcknError: "رقم الهوية التركية 11 خانة والرقم الضريبي 10 خانات.",
    vknError: "أدخلوا رقماً ضريبياً صالحاً (10 خانات).",
    yknError: "رقم هوية الأجنبي يجب أن يكون 11 خانة ويبدأ بـ 99.",
    notFoundRecord:
      "لم يُعثر على سجلكم. تحققوا من رقم الهوية أو تابعوا بإدخال البيانات بأنفسكم.",
    verifyFailed: "تعذر التحقق من بيانات الهوية.",
    stillContinue: "يمكنكم المتابعة رغم ذلك.",
    consentTitle: "الموافقة الصريحة",
    consentBody:
      "أمنح موافقة صريحة لـ {company} بمعالجة معلوماتي الصحية التي أشاركها في هذا النموذج ونقلها إلى شركات التأمين الصحي الشريكة المختارة لإعداد عرض التأمين الصحي وتسيير عملية الوثيقة إذا اخترت ذلك.",
    consentYes: "أمنح الموافقة الصريحة",
    consentNo: "لا أمنح الموافقة الصريحة",
    consentError: "اختاروا أحد خياري الموافقة الصريحة للمتابعة.",
    consentDeclineNote:
      "يمكنكم المتابعة دون منح الموافقة الصريحة. في هذه الحالة لا تُعالَج معلوماتكم الصحية؛ ويُعدّ العرض فقط ببيانات الهوية والتواصل التي تشاركونها في النموذج.",
    seeQuotes: "شاهدوا العروض",
    companyNoBirth:
      "لا يُطلب تاريخ الميلاد لطلب باسم شركة. يمكنكم المتابعة لإنشاء العرض.",
    insuredPeople: "الشخص / الأشخاص المؤمَّن عليهم",
    insuredSelf: "أنا",
    insuredSpouse: "زوجي / زوجتي",
    insuredChild: "ابني / ابنتي",
    hasPlate: "لدي لوحة",
    noPlate: "بدون لوحة",
    plateStatus: "حالة اللوحة",
    vehicleInfo: "بيانات المركبة",
    plate: "اللوحة",
    documentSerial: "الرقم التسلسلي للرخصة",
    engineNo: "رقم المحرك",
    chassisNo: "رقم الهيكل",
    findSerial: "لا أجد الرقم التسلسلي للرخصة",
    findEngineChassis: "لا أجد رقم المحرك والهيكل",
    serialHelpTitle: "أين تجدون الرقم التسلسلي للرخصة؟",
    serialHelpAlt: "موضع الرقم التسلسلي في رخصة المركبة",
    serialHelpAria: "أين الرقم التسلسلي للرخصة؟",
    vehicleNoHelpAria: "أين رقم المحرك والهيكل؟",
    vehicleNoHelpTitle: "أين تجدون رقم المحرك والهيكل؟",
    vehicleNoHelpP1:
      "يمكنكم العثور على هذه البيانات في فاتورة البروفورما التي أصدرها الوكيل عند شراء المركبة.",
    vehicleNoHelpP2: "يمكنكم طلب فاتورة البروفورما من الوكيل.",
    close: "إغلاق",
    plateError: "أدخلوا لوحة صالحة (مثال: 06 TC 001).",
    serialError: "يجب أن يكون الرقم التسلسلي حرفين و6 أرقام (مثال: AA999999).",
    chassisError: "أدخلوا رقم هيكل صالحاً (17 خانة).",
    enginePlaceholder: "رقم المحرك",
    chassisPlaceholder: "رقم الهيكل (17 خانة)",
  },
  success: SUCCESS.ar,
  flow: FLOW.ar,
  compare: COMPARE.ar,
  glossaryPage: GLOSSARY.ar,
  unavailable: { contact: "تواصل معنا" },
  notfound: {
    title: "لم نعثر على هذه الصفحة",
    text: "ربما نُقل العنوان أو تغيّر اسمه أو لم يكن موجوداً.",
    home: "العودة إلى الرئيسية",
  },
  notice: { turkishSection: "هذا القسم باللغة التركية." },
  slides: {
    "trafik-sigortasi": {
      eyebrow: "تأمين المرور",
      line1: "قبل الانطلاق.",
      line2: "تغطيتك جاهزة.",
      subtitle: "قيّم عروض تأمين المرور الإلزامي بسهولة.",
      cta: "اطلب عرض تأمين المرور",
    },
    kasko: {
      eyebrow: "كاسكو",
      line1: "ضد غير المتوقع.",
      line2: "مركبتك محمية.",
      subtitle: "احمِ مركبتك ضد مجموعة أوسع من المخاطر.",
      cta: "اطلب عرض كاسكو",
    },
    "tamamlayici-saglik": {
      eyebrow: "التأمين الصحي التكميلي",
      line1: "من أجل صحتك.",
      line2: "دون إرهاق ميزانيتك.",
      subtitle: "قيّم تغطية فروق الأجور في المستشفيات الخاصة المتعاقدة مع SGK.",
      cta: "اطلب عرض التأمين التكميلي",
    },
    "ozel-saglik": {
      eyebrow: "التأمين الصحي الخاص",
      line1: "من أجل صحتك.",
      line2: "تغطية أوسع.",
      subtitle: "قيّم نطاق التغطية وشبكة المستشفيات المناسبة لك.",
      cta: "اطلب عرض التأمين الصحي الخاص",
    },
    imm: {
      eyebrow: "المسؤولية الاختيارية",
      line1: "عندما لا تكفي الحدود.",
      line2: "تغطية إضافية بجانبك.",
      subtitle: "احمِ نفسك من المسؤولية فوق حدود تأمين المرور.",
      cta: "اطلب عرض المسؤولية الاختيارية",
    },
    dask: {
      eyebrow: "داسك",
      line1: "الزلزال لا يُجدول.",
      line2: "منزلك يمكن أن يُغطى.",
      subtitle: "أصدر تأمين الزلازل الإلزامي بسهولة.",
      cta: "اطلب عرض داسك",
    },
    konut: {
      eyebrow: "تأمين المنزل",
      line1: "منزلك مهم.",
      line2: "التغطية جاهزة.",
      subtitle: "احمِ منزلك ومحتوياته ضد المخاطر غير المتوقعة.",
      cta: "اطلب عرض تأمين المنزل",
    },
    "seyahat-saglik": {
      eyebrow: "التأمين الصحي للسفر",
      line1: "قبل السفر.",
      line2: "تغطيتك جاهزة.",
      subtitle: "ابقَ محمياً من المخاطر الصحية طوال رحلتك.",
      cta: "اطلب عرض تأمين السفر",
    },
    "yesil-kart": {
      eyebrow: "البطاقة الخضراء",
      line1: "الحدود تتغير.",
      line2: "التغطية تستمر.",
      subtitle: "اطلب عرضاً للتأمين المطلوب عند القيادة في الخارج.",
      cta: "اطلب عرض البطاقة الخضراء",
    },
  },
};

const FA: UiMessages = {
  nav: {
    about: "درباره ما",
    products: "محصولات",
    cancel: "لغو بیمه‌نامه",
    compare: "مقایسه انواع بیمه",
    blog: "بلاگ",
    menu: "منو",
    help: "به کمک نیاز دارید؟",
    turkish: "Türkçe",
    quote: "دریافت پیشنهاد",
    explore: "کاوش",
    popular: "محبوب",
    closeMenu: "بستن منو",
    siteMenu: "منوی سایت",
    groups: { vehicle: "بیمه خودرو", health: "بیمه درمان", home: "بیمه مسکن" },
    loading: "در حال بارگذاری صفحه",
  },
  lang: { label: "زبان", choose: "زبان را انتخاب کنید" },
  footer: {
    blurb:
      "مقایسه قیمت و پوشش نزدیک به ۳۰ شرکت بیمه را آسان می‌کنیم و قبل و بعد از بیمه‌نامه در کنار شما هستیم.",
    products: "محصولات",
    knowledge: "مرکز اطلاعات",
    quick: "پیوندهای سریع",
    legal: "حقوقی",
    faq: "پرسش‌های پرتکرار",
    glossary: "واژه‌نامه بیمه",
    comparison: "مرکز مقایسه",
    riskMap: "نقشه ریسک",
    getQuote: "دریافت پیشنهاد",
    cookiePrefs: "ترجیحات کوکی",
    copyright: "© 2026 Sigorta Uzmanı.",
  },
  cookies: {
    title: "ترجیحات کوکی",
    bodyBefore:
      "برای کارکرد و امنیت سایت از فناوری‌های ضروری استفاده می‌کنیم. تحلیل، ترجیح و بازاریابی فقط با انتخاب شما اجرا می‌شود. جزئیات را در ",
    bodyAfter: " بخوانید و هر زمان تغییر دهید.",
    link: "سیاست کوکی",
    reject: "رد موارد غیرضروری",
    manage: "مدیریت ترجیحات",
    accept: "پذیرش همه",
    close: "بستن",
    lead: "فناوری‌های ضروری برای امنیت و کارکرد اصلی همیشه فعال‌اند. دسته‌های زیر را می‌توانید روشن یا خاموش کنید.",
    alwaysOn: "همیشه روشن",
    save: "ذخیره انتخاب",
    policyLead: "برای جزئیات ",
    policyAfter: " را ببینید.",
    necessaryTitle: "ضروری",
    necessaryDesc: "برای نشست، امنیت و فرم‌ها لازم است و خاموش نمی‌شود.",
    analyticsTitle: "تحلیل",
    analyticsDesc: "پس از رضایت شما بازدیدها با GA4 یا Google Tag Manager اندازه‌گیری می‌شود.",
    preferencesTitle: "ترجیحات",
    preferencesDesc: "برای به خاطر سپردن زبان، نمایش یا انتخاب‌های مشابه.",
    marketingTitle: "بازاریابی",
    marketingDesc: "برای تبلیغات شخصی یا هدف‌گیری مجدد.",
  },
  hero: {
    titleBefore: "پیشنهاد بگیرید",
    compare: "مقایسه کنید",
    staySafe: "تحت پوشش بمانید",
    subtitle: "پوشش درست. قیمت منصفانه. پشتیبانی سریع",
  },
  faq: {
    eyebrow: "پرسش‌های پرتکرار",
    title: "آنچه درباره Sigorta Uzmanı پرسیده می‌شود",
    lead: "اگر پاسخ را نیافتید با خط مشاوره تماس بگیرید.",
    items: [
      {
        question: "فرآیند دریافت پیشنهاد چگونه است؟",
        answer:
          "اطلاعات را در فرم محصول وارد کنید. قیمت و پوشش لحظه‌ای شرکت‌های یکپارچه را مقایسه کنید. اگر خرید آنلاین پشتیبانی شود به صفحه پرداخت همان شرکت می‌روید. در غیر این صورت با شماره درخواست در واتساپ ادامه می‌دهیم.",
      },
      {
        question: "چرا Sigorta Uzmanı؟",
        answer:
          "sigortauzmani.net پلتفرم بیمه دیجیتالی است که دسترسی به محصولات و پیشنهادهای شرکت‌های مختلف را آسان می‌کند. قیمت و پوشش را در یک صفحه می‌بینید و در صدور، تمدید، تغییر و خسارت همراهتان هستیم.",
      },
      {
        question: "برای پیشنهاد هزینه جدا می‌پردازم؟",
        answer:
          "دیدن و مقایسه پیشنهادها کارمزد جدا ندارد. حق بیمه و شرایط پرداخت تابع پیشنهاد شرکت بیمه است. پرداخت آنلاین در صفحه خود شرکت انجام می‌شود؛ ما اطلاعات کارت را نمی‌بینیم و ذخیره نمی‌کنیم.",
      },
      {
        question: "هنگام مقایسه به چه چیز توجه کنم؟",
        answer:
          "سقف پوشش، فرانشیز، استثناها، خدمات اضافی و شرایط پرداخت را همراه قیمت ببینید. تیم ما تفاوت‌ها را توضیح می‌دهد تا بیمه‌نامه مناسب را انتخاب کنید.",
      },
      {
        question: "داده‌های شخصی چگونه استفاده و محافظت می‌شود؟",
        answer:
          "داده‌های شما طبق KVKK برای صدور پیشنهاد، دریافت قیمت و اجرای خرید یا پشتیبانی مشاور پردازش می‌شود. اطلاعات کارت در صفحه شرکت بیمه وارد می‌شود و ما آن را نمی‌بینیم و ذخیره نمی‌کنیم. جزئیات در اطلاعیه KVKK است.",
      },
    ],
  },
  partners: {
    eyebrow: "همکاری‌های قوی",
    title: "پیشنهاد از نزدیک به ۳۰ شرکت بیمه",
    lead: "قیمت و پوشش شرکت‌های یکپارچه را در یک صفحه مقایسه کنید و پیشنهاد مناسب را انتخاب کنید.",
  },
  slider: {
    eyebrow: "برای شما انتخاب کردیم",
    title: "در هر لحظه کنار شماییم",
    lead: "قیمت و پوشش‌های لحظه‌ای شرکت‌های یکپارچه را مقایسه کنید؛ سپس به خرید آنلاین یا نماینده واتساپ بروید.",
    prev: "گزینه بیمه قبلی",
    next: "گزینه بیمه بعدی",
  },
  about: {
    crumb: "درباره ما",
    home: "خانه",
    h1Before: "بیمه را ",
    h1Words: ["روشن‌تر", "سریع‌تر", "قابل‌اعتمادتر"],
    h1After: " می‌کنیم.",
    lead: "sigortauzmani.net کمک می‌کند پیشنهادهای شرکت‌های مختلف را در یک جا ببینید و بیمه‌نامه مناسب را انتخاب کنید.",
    lead2:
      "تیم ما از پیشنهاد تا صدور، تمدید و خسارت همراه شماست. هدف فقط فروش بیمه‌نامه نیست؛ گزینه‌ها را روشن توضیح می‌دهیم تا با اطمینان تصمیم بگیرید.",
    branches: ["شخص ثالث", "بدنه", "درمان", "زلزله", "مسکن", "مسافرت"],
    motto: ["پوشش درست.", "قیمت منصفانه.", "پشتیبانی سریع."],
    whyTitle: "چرا sigortauzmani.net؟",
    reasons: [
      { title: "مقایسه آسان", text: "گزینه‌های شرکت‌های مختلف را در یک جا ببینید." },
      { title: "پشتیبانی متخصص", text: "با مشاور پوشش مناسب را انتخاب کنید." },
      { title: "فرآیند سریع", text: "اطلاعات را وارد کنید و پیشنهادهای لحظه‌ای را مقایسه کنید." },
      { title: "پس از بیمه‌نامه", text: "برای تمدید و خسارت همچنان پشتیبانی بگیرید." },
    ],
    ctaTitle: "بیمه‌نامه مناسب را با هم پیدا کنیم",
    ctaLead: "فرم را پر کنید، پیشنهادهای لحظه‌ای را مقایسه کنید و در صورت نیاز از واتساپ کمک بگیرید.",
    cta: "همین حالا پیشنهاد بگیرید",
  },
  contact: {
    h1: "سؤالتان را بفرستید. کارشناسان پاسخ می‌دهند.",
    lead: "سؤال بیمه و در صورت وجود مدرک پشتیبان را ارسال کنید.",
    name: "نام و نام خانوادگی",
    email: "ایمیل",
    subject: "موضوع",
    message: "پیام",
    send: "ارسال",
    reachUs: "با ما تماس بگیرید",
    kvkkBody:
      "نام، ایمیل، موضوع، پیام و فایل اختیاری که بارگذاری می‌کنید برای بررسی درخواست، پاسخ به شما و در صورت نیاز حفظ حقوق ما پردازش می‌شود. داده‌های شخصی نامرتبط یا داده‌های حساس را در پیام یا فایل به اشتراک نگذارید.",
  },
  cancel: CANCEL.fa,
  legal: {
    home: "خانه",
    updated: "آخرین به‌روزرسانی",
    contactTitle: "تماس",
    contactLead: "برای درخواست و پرسش می‌توانید با ما تماس بگیرید.",
    contactForm: "فرم تماس",
    other: "سایر متون حقوقی",
    disclaimer: "این ترجمه فقط برای اطلاع است. در اختلاف متن ترکی ملاک است.",
  },
  quote: {
    identity: "اطلاعات هویتی",
    identityStep: "هویت",
    details: "جزئیات پیشنهاد",
    detailsStep: "جزئیات",
    offers: "پیشنهادها",
    policy: "بیمه‌نامه",
    continue: "ادامه",
    continueEt: "ادامه",
    back: "بازگشت",
    phone: "تلفن همراه",
    birthDate: "تاریخ تولد",
    unavailableTitle: "این محصول فعلاً در دسترس نیست",
    unavailableMessage:
      "دریافت درخواست جدید برای این محصول موقتاً متوقف شده است. پشتیبانی می‌تواند جایگزین پیشنهاد دهد.",
    home: "خانه",
    homeBack: "بازگشت به خانه",
    breadcrumb: "مسیر صفحه",
    notFound: "محصول پیدا نشد",
    identityLead:
      "اطلاعات شما برای دریافت پیشنهاد لحظه‌ای از شرکت‌های بیمه یکپارچه استفاده می‌شود.",
    kimlikLabel: "شماره هویت ترکیه / شماره مالیاتی",
    kimlikHint: "اگر برای شرکت پیشنهاد می‌گیرید شماره مالیاتی را وارد کنید.",
    kvkkBody:
      "داده‌های شخصی که به اشتراک می‌گذارید برای تهیه پیشنهاد بیمه درخواستی و گرفتن قیمت از شرکت‌های بیمه مربوط پردازش می‌شود.",
    kvkkMore: "برای جزئیات",
    kvkkLink: "متن اطلاع‌رسانی KVKK",
    kvkkAfter: " را ببینید.",
    saglikKvkkBody:
      "اظهار سلامت و سایر اطلاعات مربوط به سلامتی که برای پیشنهاد بیمه درمان به اشتراک می‌گذارید داده شخصی حساس است. این اطلاعات فقط تا حد لازم برای گرفتن پیشنهاد شخصی و در صورت انتخاب شما اجرای فرآیند بیمه‌نامه پردازش می‌شود و ممکن است به شرکت‌های بیمه درمان مربوط ارسال شود.",
    listen: "با صدا گوش دهید",
    mute: "بی‌صدا",
    advisorIntro:
      "سلام، من دستیار دیجیتال پیشنهاد Sigorta Uzmanı هستم. اطلاعات را در چند گام کوتاه به اشتراک بگذارید تا قیمت و پوشش لحظه‌ای شرکت‌های یکپارچه را مقایسه کنید. در محصولاتی که خرید آنلاین دارند به صفحه پرداخت شرکت بیمه می‌روید؛ در بقیه مسیر با نماینده واتساپ ادامه می‌یابد. اگر آماده‌اید شروع کنیم.",
    advisorNext:
      "متشکرم. به گام آخر می‌رویم. لطفاً دو اطلاعات باقی‌مانده را هم به اشتراک بگذارید. سپس مناسب‌ترین پیشنهادهای بیمه را آماده می‌کنم.",
    retry: "دوباره تلاش کنید",
    continueAnyway: "باز هم ادامه دهید",
    loading: "در حال دریافت اطلاعات…",
    phoneError: "یک شماره همراه معتبر وارد کنید (05XX XXX XX XX).",
    birthError: "تاریخ تولد را وارد کنید.",
    tcknError: "شماره هویت ترکیه ۱۱ رقم و شماره مالیاتی ۱۰ رقم است.",
    vknError: "یک شماره مالیاتی معتبر وارد کنید (۱۰ رقم).",
    yknError: "شماره هویت خارجی باید ۱۱ رقم باشد و با ۹۹ شروع شود.",
    notFoundRecord:
      "رکورد شما پیدا نشد. شماره هویت را بررسی کنید یا با وارد کردن اطلاعات خود ادامه دهید.",
    verifyFailed: "اطلاعات هویتی تأیید نشد.",
    stillContinue: "با این حال می‌توانید ادامه دهید.",
    consentTitle: "رضایت صریح",
    consentBody:
      "رضایت صریح می‌دهم که {company} اطلاعات سلامت من در این فرم را برای تهیه پیشنهاد بیمه درمان و در صورت انتخاب من اجرای فرآیند بیمه‌نامه پردازش کند و به شرکت‌های بیمه درمان طرف قرارداد منتخب منتقل کند.",
    consentYes: "رضایت صریح می‌دهم",
    consentNo: "رضایت صریح نمی‌دهم",
    consentError: "برای ادامه یکی از گزینه‌های رضایت صریح را انتخاب کنید.",
    consentDeclineNote:
      "بدون دادن رضایت صریح هم می‌توانید ادامه دهید. در این صورت اطلاعات سلامت شما پردازش نمی‌شود؛ پیشنهاد فقط با هویت و اطلاعات تماس فرم آماده می‌شود.",
    seeQuotes: "دیدن پیشنهادها",
    companyNoBirth:
      "برای درخواست به نام شرکت تاریخ تولد لازم نیست. می‌توانید برای ساخت پیشنهاد ادامه دهید.",
    insuredPeople: "فرد / افراد بیمه‌شونده",
    insuredSelf: "خودم",
    insuredSpouse: "همسرم",
    insuredChild: "فرزندم",
    hasPlate: "پلاک دارم",
    noPlate: "بدون پلاک",
    plateStatus: "وضعیت پلاک",
    vehicleInfo: "اطلاعات خودرو",
    plate: "پلاک",
    documentSerial: "شماره سریال سند",
    engineNo: "شماره موتور",
    chassisNo: "شماره شاسی",
    findSerial: "شماره سریال سند را پیدا نمی‌کنم",
    findEngineChassis: "شماره موتور و شاسی را پیدا نمی‌کنم",
    serialHelpTitle: "شماره سریال سند را کجا پیدا می‌کنید؟",
    serialHelpAlt: "محل شماره سریال روی سند خودرو",
    serialHelpAria: "شماره سریال سند کجاست؟",
    vehicleNoHelpAria: "شماره موتور و شاسی کجاست؟",
    vehicleNoHelpTitle: "شماره موتور و شاسی را کجا پیدا می‌کنید؟",
    vehicleNoHelpP1:
      "این اطلاعات را روی فاکتور پروفرما که فروشنده هنگام خرید صادر کرده می‌توانید پیدا کنید.",
    vehicleNoHelpP2: "فاکتور پروفرما را می‌توانید از فروشنده بخواهید.",
    close: "بستن",
    plateError: "یک پلاک معتبر وارد کنید (مثلاً 06 TC 001).",
    serialError: "سریال سند باید ۲ حرف و ۶ رقم باشد (مثلاً AA999999).",
    chassisError: "یک شماره شاسی معتبر وارد کنید (۱۷ نویسه).",
    enginePlaceholder: "شماره موتور",
    chassisPlaceholder: "شماره شاسی (۱۷ نویسه)",
  },
  success: SUCCESS.fa,
  flow: FLOW.fa,
  compare: COMPARE.fa,
  glossaryPage: GLOSSARY.fa,
  unavailable: { contact: "با ما تماس بگیرید" },
  notfound: {
    title: "این صفحه را پیدا نکردیم",
    text: "نشانی ممکن است منتقل، تغییرنام یا هرگز وجود نداشته باشد.",
    home: "بازگشت به خانه",
  },
  notice: { turkishSection: "این بخش به زبان ترکی است." },
  slides: {
    "trafik-sigortasi": {
      eyebrow: "بیمه شخص ثالث",
      line1: "قبل از حرکت.",
      line2: "پوشش آماده است.",
      subtitle: "پیشنهاد بیمه شخص ثالث اجباری را به‌راحتی بررسی کنید.",
      cta: "پیشنهاد شخص ثالث بگیرید",
    },
    kasko: {
      eyebrow: "بیمه بدنه",
      line1: "در برابر غیرمنتظره.",
      line2: "خودرویتان پوشش دارد.",
      subtitle: "خودرو را در برابر ریسک‌های گسترده‌تر محافظت کنید.",
      cta: "پیشنهاد بدنه بگیرید",
    },
    "tamamlayici-saglik": {
      eyebrow: "بیمه درمان تکمیلی",
      line1: "برای سلامتی.",
      line2: "بدون فشار به بودجه.",
      subtitle: "پوشش مابه‌التفاوت بیمارستان‌های خصوصی طرف قرارداد SGK را بررسی کنید.",
      cta: "پیشنهاد درمان تکمیلی بگیرید",
    },
    "ozel-saglik": {
      eyebrow: "بیمه درمان خصوصی",
      line1: "برای سلامتی.",
      line2: "پوشش گسترده‌تر.",
      subtitle: "دامنه پوشش و شبکه بیمارستان مناسب را بررسی کنید.",
      cta: "پیشنهاد درمان خصوصی بگیرید",
    },
    imm: {
      eyebrow: "مسئولیت اختیاری",
      line1: "وقتی سقف کافی نیست.",
      line2: "پوشش اضافه کنار شماست.",
      subtitle: "در برابر مسئولیت بالاتر از سقف شخص ثالث محافظت شوید.",
      cta: "پیشنهاد مسئولیت اختیاری بگیرید",
    },
    dask: {
      eyebrow: "بیمه زلزله اجباری",
      line1: "زلزله زمان‌بندی ندارد.",
      line2: "خانه‌تان می‌تواند پوشش داشته باشد.",
      subtitle: "بیمه زلزله اجباری را به‌راحتی صادر کنید.",
      cta: "پیشنهاد DASK بگیرید",
    },
    konut: {
      eyebrow: "بیمه مسکن",
      line1: "خانه‌تان مهم است.",
      line2: "پوشش آماده است.",
      subtitle: "خانه و اسباب را در برابر ریسک‌های غیرمنتظره محافظت کنید.",
      cta: "پیشنهاد بیمه مسکن بگیرید",
    },
    "seyahat-saglik": {
      eyebrow: "بیمه درمان مسافرت",
      line1: "قبل از سفر.",
      line2: "پوشش آماده است.",
      subtitle: "در طول سفر در برابر ریسک‌های سلامت پوشش داشته باشید.",
      cta: "پیشنهاد بیمه مسافرت بگیرید",
    },
    "yesil-kart": {
      eyebrow: "کارت سبز",
      line1: "مرزها عوض می‌شود.",
      line2: "پوشش ادامه دارد.",
      subtitle: "برای بیمه لازم هنگام رانندگی در خارج پیشنهاد بگیرید.",
      cta: "پیشنهاد کارت سبز بگیرید",
    },
  },
};

export const MESSAGES: Record<Locale, UiMessages> = {
  tr: TR,
  en: EN,
  ar: AR,
  fa: FA,
};
