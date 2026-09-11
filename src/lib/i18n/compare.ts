import type { ComparisonCategory } from "../../data/comparisons";
import type { Locale } from "./locales";

export interface CompareMessages {
  hubEyebrow: string;
  hubTitle: string;
  hubLead: string;
  catalog: string;
  all: string;
  categoryFilter: string;
  vs: string;
  whichFits: string;
  seeDiffs: string;
  covers: string;
  coversLead: string;
  swipeHint: string;
  feature: string;
  proscons: string;
  who: string;
  verdict: string;
  faqs: string;
  related: string;
  relatedLead: string;
  prev: string;
  next: string;
  important: string;
  getQuote: string;
  ogType: string;
  calcTitle: string;
  calcLead: string;
  calcPremium: string;
  calcFee: string;
  calcNeedValues: string;
  calcFirstVisit: string;
  calcAmortize: string;
  calcNote: string;
  calcVisits: string;
  calcOutOfPocket: string;
  calcWithTss: string;
  calcDiff: string;
  calcTimes: string;
  categories: Record<ComparisonCategory, string>;
}

const TR: CompareMessages = {
  hubEyebrow: "Bilgi merkezi",
  hubTitle: "Sigorta Karşılaştırma Merkezi",
  hubLead:
    "Hangi sigorta sizin için doğru? Kategori seçin, merak ettiğiniz karşılaştırmayı açın; teminatları yan yana görüp teklif alın.",
  catalog: "Karşılaştırmalar",
  all: "Tümü",
  categoryFilter: "Kategori filtresi",
  vs: "ile",
  whichFits: "Hangisi size uygun?",
  seeDiffs: "Farkları gör",
  covers: "Teminatlar",
  coversLead: "Yan yana temel farklar.",
  swipeHint: "Tabloyu yana kaydırarak tüm farkları inceleyin",
  feature: "Özellik",
  proscons: "Avantajlar & dezavantajlar",
  who: "Kimler için?",
  verdict: "Tavsiyemiz",
  faqs: "Sık sorulan sorular",
  related: "İlgili karşılaştırmalar",
  relatedLead: "{category} kategorisindeki diğer içerikler.",
  prev: "Önceki karşılaştırmalar",
  next: "Sonraki karşılaştırmalar",
  important: "Önemli",
  getQuote: "Teklif Al",
  ogType: "Karşılaştırma",
  calcTitle: "Ne zaman kâra geçersiniz?",
  calcLead:
    "Yıllık TSS primi ile özel muayene fark ücretinizi girin; yaklaşık kaç ziyarette dengeye geldiğinizi görün.",
  calcPremium: "Yıllık TSS primi (₺)",
  calcFee: "Ortalama özel muayene farkı (₺)",
  calcNeedValues: "Hesaplamak için yıllık prim ve muayene farkı girin.",
  calcFirstVisit: "Yıllık priminiz tek bir muayene farkından bile düşük; daha ilk muayenede kâra geçersiniz.",
  calcAmortize: "Yılda yaklaşık {n} kez özel muayeneye giderseniz priminizi amorti edersiniz.",
  calcNote:
    "Bu hesap yalnızca ayakta muayene farkını baz alır. Ameliyat ve yatarak tedavi riski TSS’nin asıl değeridir.",
  calcVisits: "Yıllık ziyaret",
  calcOutOfPocket: "Cebinden ödeme",
  calcWithTss: "TSS ile (prim)",
  calcDiff: "Fark",
  calcTimes: "{n} kez",
  categories: {
    arac: "Araç Sigortaları",
    saglik: "Sağlık Sigortaları",
    ev: "Ev Sigortaları",
    seyahat: "Seyahat",
    bireysel: "Bireysel",
    is: "İş Dünyası",
    elektrikli: "Elektrikli Araçlar",
  },
};

const EN: CompareMessages = {
  hubEyebrow: "Knowledge centre",
  hubTitle: "Insurance comparison centre",
  hubLead:
    "Which cover is right for you? Pick a category, open a comparison, review covers side by side and get a quote.",
  catalog: "Comparisons",
  all: "All",
  categoryFilter: "Category filter",
  vs: "vs",
  whichFits: "Which one fits you?",
  seeDiffs: "See the differences",
  covers: "Covers",
  coversLead: "The key differences side by side.",
  swipeHint: "Swipe the table sideways to see every difference",
  feature: "Feature",
  proscons: "Pros and cons",
  who: "Who is it for?",
  verdict: "Our advice",
  faqs: "Frequently asked questions",
  related: "Related comparisons",
  relatedLead: "Other pages in the {category} category.",
  prev: "Previous comparisons",
  next: "Next comparisons",
  important: "Important",
  getQuote: "Get a quote",
  ogType: "Comparison",
  calcTitle: "When do you break even?",
  calcLead:
    "Enter the annual complementary health premium and your private exam difference fee to see roughly how many visits it takes to break even.",
  calcPremium: "Annual complementary health premium (₺)",
  calcFee: "Average private exam difference (₺)",
  calcNeedValues: "Enter the annual premium and exam difference to calculate.",
  calcFirstVisit:
    "Your annual premium is lower than a single exam difference; you break even on the first visit.",
  calcAmortize:
    "If you go to a private exam about {n} times a year, you recoup the premium.",
  calcNote:
    "This calculation only uses outpatient exam differences. Surgery and inpatient risk is the real value of complementary health.",
  calcVisits: "Annual visits",
  calcOutOfPocket: "Out of pocket",
  calcWithTss: "With complementary health (premium)",
  calcDiff: "Difference",
  calcTimes: "{n} times",
  categories: {
    arac: "Motor insurance",
    saglik: "Health insurance",
    ev: "Home insurance",
    seyahat: "Travel",
    bireysel: "Personal",
    is: "Business",
    elektrikli: "Electric vehicles",
  },
};

const AR: CompareMessages = {
  hubEyebrow: "مركز المعرفة",
  hubTitle: "مركز مقارنة التأمين",
  hubLead:
    "أي تغطية تناسبكم؟ اختاروا فئة وافتحوا مقارنة وراجعوا التغطيات جنباً إلى جنب ثم اطلبوا عرضاً.",
  catalog: "المقارنات",
  all: "الكل",
  categoryFilter: "تصفية الفئة",
  vs: "مقابل",
  whichFits: "أيّهما يناسبكم؟",
  seeDiffs: "شاهدوا الفروق",
  covers: "التغطيات",
  coversLead: "الفروق الأساسية جنباً إلى جنب.",
  swipeHint: "مرّروا الجدول جانباً لرؤية كل الفروق",
  feature: "الخاصية",
  proscons: "المزايا والعيوب",
  who: "لمن؟",
  verdict: "نصيحتنا",
  faqs: "الأسئلة الشائعة",
  related: "مقارنات ذات صلة",
  relatedLead: "صفحات أخرى في فئة {category}.",
  prev: "المقارنات السابقة",
  next: "المقارنات التالية",
  important: "مهم",
  getQuote: "اطلبوا عرضاً",
  ogType: "مقارنة",
  calcTitle: "متى تصلون إلى نقطة التعادل؟",
  calcLead:
    "أدخلوا قسط التأمين الصحي التكميلي السنوي وفرق المعاينة الخاصة لتعرفوا تقريباً بعد كم زيارة يتعادل الحساب.",
  calcPremium: "قسط التأمين التكميلي السنوي (₺)",
  calcFee: "متوسط فرق المعاينة الخاصة (₺)",
  calcNeedValues: "أدخلوا القسط السنوي وفرق المعاينة للحساب.",
  calcFirstVisit:
    "قسطكم السنوي أقل من فرق معاينة واحدة؛ تتعادلون من الزيارة الأولى.",
  calcAmortize: "إذا ذهبتم إلى المعاينة الخاصة نحو {n} مرات في السنة تستردون القسط.",
  calcNote:
    "هذا الحساب يعتمد فقط على فرق المعاينة الخارجية. قيمة التأمين التكميلي الحقيقية في الجراحة والعلاج الداخلي.",
  calcVisits: "الزيارات السنوية",
  calcOutOfPocket: "الدفع من الجيب",
  calcWithTss: "مع التأمين التكميلي (القسط)",
  calcDiff: "الفرق",
  calcTimes: "{n} مرات",
  categories: {
    arac: "تأمين المركبات",
    saglik: "التأمين الصحي",
    ev: "تأمين المنزل",
    seyahat: "السفر",
    bireysel: "فردي",
    is: "الأعمال",
    elektrikli: "المركبات الكهربائية",
  },
};

const FA: CompareMessages = {
  hubEyebrow: "مرکز دانش",
  hubTitle: "مرکز مقایسه بیمه",
  hubLead:
    "کدام پوشش برای شما مناسب است؟ دسته را انتخاب کنید، یک مقایسه باز کنید، پوشش‌ها را کنار هم ببینید و پیشنهاد بگیرید.",
  catalog: "مقایسه‌ها",
  all: "همه",
  categoryFilter: "فیلتر دسته",
  vs: "در برابر",
  whichFits: "کدام برای شما مناسب است؟",
  seeDiffs: "تفاوت‌ها را ببینید",
  covers: "پوشش‌ها",
  coversLead: "تفاوت‌های اصلی در کنار هم.",
  swipeHint: "جدول را به پهلو بکشید تا همه تفاوت‌ها را ببینید",
  feature: "ویژگی",
  proscons: "مزایا و معایب",
  who: "برای چه کسانی؟",
  verdict: "پیشنهاد ما",
  faqs: "پرسش‌های پرتکرار",
  related: "مقایسه‌های مرتبط",
  relatedLead: "سایر صفحات در دسته {category}.",
  prev: "مقایسه‌های قبلی",
  next: "مقایسه‌های بعدی",
  important: "مهم",
  getQuote: "پیشنهاد بگیرید",
  ogType: "مقایسه",
  calcTitle: "چه زمانی سربه‌سر می‌شوید؟",
  calcLead:
    "حق‌بیمه سالانه درمان تکمیلی و مابه‌التفاوت ویزیت خصوصی را وارد کنید تا ببینید تقریباً پس از چند مراجعه سربه‌سر می‌شوید.",
  calcPremium: "حق‌بیمه سالانه درمان تکمیلی (₺)",
  calcFee: "میانگین مابه‌التفاوت ویزیت خصوصی (₺)",
  calcNeedValues: "برای محاسبه حق‌بیمه سالانه و مابه‌التفاوت ویزیت را وارد کنید.",
  calcFirstVisit:
    "حق‌بیمه سالانه حتی از یک مابه‌التفاوت ویزیت کمتر است؛ از همان ویزیت اول سربه‌سر می‌شوید.",
  calcAmortize:
    "اگر حدود {n} بار در سال به ویزیت خصوصی بروید حق‌بیمه را جبران می‌کنید.",
  calcNote:
    "این محاسبه فقط مابه‌التفاوت ویزیت سرپایی را در نظر می‌گیرد. ارزش اصلی درمان تکمیلی در جراحی و بستری است.",
  calcVisits: "مراجعه سالانه",
  calcOutOfPocket: "پرداخت از جیب",
  calcWithTss: "با درمان تکمیلی (حق‌بیمه)",
  calcDiff: "تفاوت",
  calcTimes: "{n} بار",
  categories: {
    arac: "بیمه خودرو",
    saglik: "بیمه درمان",
    ev: "بیمه مسکن",
    seyahat: "مسافرت",
    bireysel: "فردی",
    is: "کسب‌وکار",
    elektrikli: "خودروهای برقی",
  },
};

export const COMPARE: Record<Locale, CompareMessages> = {
  tr: TR,
  en: EN,
  ar: AR,
  fa: FA,
};
