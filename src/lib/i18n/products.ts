import type { Product } from "../../data/products";
import { products } from "../../data/products";
import type { Locale } from "./locales";
import type { ProductSlug } from "./paths";

export interface ProductCopy {
  title: string;
  badge?: string;
  seoTitle: string;
  metaDescription: string;
  serviceType: string;
  seoBullets: string[];
}

const TR_COPY: Record<ProductSlug, ProductCopy> = Object.fromEntries(
  products.map((product) => [
    product.slug,
    {
      title: product.title,
      badge: product.badge,
      seoTitle: product.seoTitle,
      metaDescription: product.metaDescription,
      serviceType: product.serviceType,
      seoBullets: product.seoBullets,
    },
  ]),
) as Record<ProductSlug, ProductCopy>;

const EN_COPY: Record<ProductSlug, ProductCopy> = {
  "trafik-sigortasi": {
    title: "Motor Third Party Liability",
    seoTitle: "2026 MTPL Insurance Quotes | Sigorta Uzmanı",
    metaDescription:
      "Compare 2026 compulsory motor third-party liability quotes from nearly 30 insurers and get an instant offer with plate and registration details.",
    serviceType: "Compulsory Motor Third Party Liability Insurance",
    seoBullets: [
      "Compare 2026 MTPL prices across different insurance companies.",
      "Premiums depend on vehicle type, registered city and no-claims step.",
      "Compulsory MTPL covers material and bodily damage you cause to others.",
      "Get a personalised quote with your plate and registration details.",
    ],
  },
  kasko: {
    title: "Casco",
    seoTitle: "2026 Casco Insurance Quotes | Sigorta Uzmanı",
    metaDescription:
      "Compare 2026 casco prices, covers, deductibles and extra services; continue to online purchase on eligible products.",
    serviceType: "Motor Own Damage (Casco) Insurance",
    seoBullets: [
      "Compare 2026 casco prices and cover options from different insurers.",
      "Premiums depend on vehicle value, model year, usage city and claims history.",
      "Protect your car against collision, theft, natural events and optional extras.",
      "Review limited, extended and comprehensive casco quotes in one form.",
    ],
  },
  "kisa-sureli-trafik": {
    title: "Short-Term MTPL",
    badge: "New",
    seoTitle: "2026 Short-Term MTPL Quotes | Sigorta Uzmanı",
    metaDescription:
      "Compare 2026 short-term motor liability quotes and get an offer with plate and registration details.",
    serviceType: "Short-Term Compulsory Motor Third Party Liability Insurance",
    seoBullets: [
      "Compare short-term MTPL prices across insurers.",
      "Issued for notary sale, transfer and temporary use shorter than one year.",
      "Cover matches annual MTPL; only the policy term is shorter.",
      "Get a personalised short-term MTPL quote with plate and registration details.",
    ],
  },
  "tamamlayici-saglik": {
    title: "Complementary Health",
    seoTitle: "2026 Complementary Health Quotes | Sigorta Uzmanı",
    metaDescription:
      "Compare 2026 complementary health quotes and hospital networks for difference fees at private hospitals contracted with SGK.",
    serviceType: "Complementary Health Insurance",
    seoBullets: [
      "Compare 2026 complementary health prices and contracted hospital networks.",
      "Cover difference fees at private hospitals contracted with SGK.",
      "Review inpatient, outpatient and extra health service packages.",
      "Get a personalised TSS quote by age, city and chosen cover.",
    ],
  },
  "seyahat-saglik": {
    title: "Travel Health",
    seoTitle: "2026 Travel Health Insurance Quotes | Sigorta Uzmanı",
    metaDescription:
      "Compare 2026 travel health quotes by destination and trip length, and check cover that meets visa requirements.",
    serviceType: "Travel Health Insurance",
    seoBullets: [
      "Compare 2026 travel health prices by destination and trip duration.",
      "Cover emergency treatment, hospital, ambulance and medical repatriation abroad.",
      "Check that the policy meets current consulate visa conditions.",
      "Get a quote for single-trip or annual multi-trip cover.",
    ],
  },
  imm: {
    title: "Excess Liability",
    seoTitle: "2026 Excess Liability (IMM) Quotes | Sigorta Uzmanı",
    metaDescription:
      "Compare 2026 IMM quotes and limits for liability above compulsory MTPL caps.",
    serviceType: "Voluntary Third Party Liability Insurance",
    seoBullets: [
      "Compare 2026 IMM prices and high limit options.",
      "Add cover for material and bodily damage above MTPL limits.",
      "Review limited or unlimited IMM options for your vehicle and risk profile.",
      "Get a personalised excess liability quote independent of casco.",
    ],
  },
  "ozel-saglik": {
    title: "Private Health",
    seoTitle: "2026 Private Health Insurance Quotes | Sigorta Uzmanı",
    metaDescription:
      "Compare 2026 private health quotes, inpatient and outpatient options, and contracted hospital networks.",
    serviceType: "Private Health Insurance",
    seoBullets: [
      "Compare 2026 private health prices, networks and policy scope.",
      "Use inpatient and outpatient options without an SGK requirement.",
      "Premiums depend on age, city of residence and chosen hospital network.",
      "Get a quote with limits, co-pay and overseas cover that fit your needs.",
    ],
  },
  dask: {
    title: "DASK",
    seoTitle: "2026 DASK Earthquake Insurance Quotes | Sigorta Uzmanı",
    metaDescription:
      "Create or renew your 2026 compulsory earthquake insurance quote with address, floor area and building details.",
    serviceType: "Compulsory Earthquake Insurance (DASK)",
    seoBullets: [
      "Calculate 2026 DASK premium by address, floor area, building type and seismic risk.",
      "Cover earthquake and earthquake-related building damage.",
      "Issue or renew your DASK policy with current building details.",
      "Get a personalised DASK quote in a few steps.",
    ],
  },
  "yesil-kart": {
    title: "Green Card",
    seoTitle: "2026 Green Card Insurance Quotes | Sigorta Uzmanı",
    metaDescription:
      "Compare 2026 Green Card quotes for the period you will drive abroad.",
    serviceType: "Green Card Insurance",
    seoBullets: [
      "See 2026 Green Card prices by vehicle type and policy term.",
      "Prepare international motor liability before you leave Turkey.",
      "Cover material and bodily damage you may cause to third parties abroad.",
      "Get a quote for terms from 15 days to 1 year.",
    ],
  },
  konut: {
    title: "Home Insurance",
    seoTitle: "2026 Home Insurance Quotes | Sigorta Uzmanı",
    metaDescription:
      "Compare 2026 home insurance quotes covering fire, flood, theft and selected natural events.",
    serviceType: "Home Insurance",
    seoBullets: [
      "Compare 2026 home insurance prices across insurers.",
      "Protect building and contents against fire, water damage, theft and natural events.",
      "Premiums depend on address, floor area, building type and chosen limits.",
      "Shape the policy with extras such as glass, insulation and legal protection.",
    ],
  },
};

const AR_COPY: Record<ProductSlug, ProductCopy> = {
  "trafik-sigortasi": {
    title: "تأمين المرور",
    seoTitle: "عروض تأمين المرور الإلزامي 2026 | Sigorta Uzmanı",
    metaDescription:
      "قارن أسعار تأمين المرور الإلزامي لعام 2026 من نحو 30 شركة واحصل على عرض فوري ببيانات اللوحة والرخصة.",
    serviceType: "تأمين المرور الإلزامي",
    seoBullets: [
      "قارن أسعار تأمين المرور لعام 2026 بين شركات التأمين.",
      "يُحسب القسط حسب نوع المركبة والولاية ودرجة انعدام الحوادث.",
      "يغطي التأمين الأضرار المادية والجسدية للطرف الثالث.",
      "احصل على عرض مخصص ببيانات اللوحة والرخصة.",
    ],
  },
  kasko: {
    title: "كاسكو",
    seoTitle: "عروض تأمين الكاسكو 2026 | Sigorta Uzmanı",
    metaDescription:
      "قارن أسعار الكاسكو والتغطيات والتحمل والخدمات الإضافية لعام 2026، وتابع الشراء عبر الإنترنت عند توفره.",
    serviceType: "تأمين الكاسكو",
    seoBullets: [
      "قارن أسعار الكاسكو وخيارات التغطية لعام 2026.",
      "يعتمد القسط على قيمة المركبة وسنة الموديل ومدينة الاستخدام وسجل الحوادث.",
      "احمِ مركبتك من التصادم والسرقة والكوارث الطبيعية والتغطيات الإضافية.",
      "راجع عروض الكاسكو المحدود والموسع والشامل في نموذج واحد.",
    ],
  },
  "kisa-sureli-trafik": {
    title: "تأمين مرور قصير الأجل",
    badge: "جديد",
    seoTitle: "عروض تأمين المرور قصير الأجل 2026 | Sigorta Uzmanı",
    metaDescription:
      "قارن أسعار تأمين المرور قصير الأجل لعام 2026 واحصل على عرض ببيانات اللوحة والرخصة.",
    serviceType: "تأمين المرور الإلزامي قصير الأجل",
    seoBullets: [
      "قارن أسعار تأمين المرور قصير الأجل بين الشركات.",
      "يُصدر للبيع لدى الكاتب العدل والنقل والاستخدام المؤقت لأقل من سنة.",
      "نطاق التغطية مطابق للتأمين السنوي؛ المدة فقط أقصر.",
      "احصل على عرض مخصص ببيانات اللوحة والرخصة.",
    ],
  },
  "tamamlayici-saglik": {
    title: "التأمين الصحي التكميلي",
    seoTitle: "عروض التأمين الصحي التكميلي 2026 | Sigorta Uzmanı",
    metaDescription:
      "قارن عروض التأمين الصحي التكميلي وشبكات المستشفيات لعام 2026 لفروق الأجور في المستشفيات الخاصة المتعاقدة مع SGK.",
    serviceType: "التأمين الصحي التكميلي",
    seoBullets: [
      "قارن الأسعار وشبكات المستشفيات لعام 2026.",
      "غطِّ فروق الأجور في المستشفيات الخاصة المتعاقدة مع SGK.",
      "راجع باقات العلاج الداخلي والخارجي والخدمات الإضافية.",
      "احصل على عرض حسب العمر ومدينة الإقامة ونطاق التغطية.",
    ],
  },
  "seyahat-saglik": {
    title: "التأمين الصحي للسفر",
    seoTitle: "عروض التأمين الصحي للسفر 2026 | Sigorta Uzmanı",
    metaDescription:
      "قارن عروض التأمين الصحي للسفر لعام 2026 حسب الدولة ومدة الرحلة، وتحقق من التغطية المناسبة لتأشيرة السفر.",
    serviceType: "التأمين الصحي للسفر",
    seoBullets: [
      "قارن الأسعار حسب الدولة ومدة السفر.",
      "غطِّ العلاج الطارئ والمستشفى والإسعاف والنقل الطبي في الخارج.",
      "تحقق من استيفاء الوثيقة لشروط القنصلية الحالية.",
      "احصل على عرض لرحلة واحدة أو لتغطية سنوية متعددة الرحلات.",
    ],
  },
  imm: {
    title: "المسؤولية الاختيارية",
    seoTitle: "عروض تأمين المسؤولية الاختيارية 2026 | Sigorta Uzmanı",
    metaDescription:
      "قارن عروض وحدود تأمين المسؤولية الاختيارية لعام 2026 لما يتجاوز حدود تأمين المرور.",
    serviceType: "تأمين المسؤولية المالية الاختيارية",
    seoBullets: [
      "قارن الأسعار وحدود التغطية المرتفعة لعام 2026.",
      "أضف حماية للأضرار المادية والجسدية فوق حدود تأمين المرور.",
      "راجع خيارات محدودة أو غير محدودة حسب نوع المركبة ومستوى المخاطر.",
      "احصل على عرض مستقل عن وثيقة الكاسكو.",
    ],
  },
  "ozel-saglik": {
    title: "التأمين الصحي الخاص",
    seoTitle: "عروض التأمين الصحي الخاص 2026 | Sigorta Uzmanı",
    metaDescription:
      "قارن عروض التأمين الصحي الخاص لعام 2026 مع خيارات العلاج الداخلي والخارجي وشبكات المستشفيات.",
    serviceType: "التأمين الصحي الخاص",
    seoBullets: [
      "قارن الأسعار والشبكات ونطاق الوثيقة لعام 2026.",
      "استخدم العلاج الداخلي والخارجي دون شرط SGK.",
      "يُحسب القسط حسب العمر ومدينة الإقامة وشبكة المؤسسات المختارة.",
      "احصل على عرض بحدود ومساهمة وتغطية خارجية تناسبك.",
    ],
  },
  dask: {
    title: "داسك",
    seoTitle: "عروض تأمين الزلازل الإلزامي 2026 | Sigorta Uzmanı",
    metaDescription:
      "أنشئ أو جدد عرض تأمين الزلازل الإلزامي لعام 2026 ببيانات العنوان والمساحة ونوع البناء.",
    serviceType: "تأمين الزلازل الإلزامي (داسك)",
    seoBullets: [
      "احسب قسط 2026 حسب العنوان والمساحة ونوع البناء وخطر الزلزال.",
      "غطِّ أضرار المبنى الناتجة عن الزلزال وتوابعه.",
      "أصدر أو جدد وثيقة داسك ببيانات البناء الحالية.",
      "احصل على عرض مخصص في خطوات قليلة.",
    ],
  },
  "yesil-kart": {
    title: "البطاقة الخضراء",
    seoTitle: "عروض تأمين البطاقة الخضراء 2026 | Sigorta Uzmanı",
    metaDescription:
      "قارن عروض تأمين البطاقة الخضراء لعام 2026 للفترة التي ستقود فيها خارج تركيا.",
    serviceType: "تأمين البطاقة الخضراء",
    seoBullets: [
      "اطلع على الأسعار حسب نوع المركبة ومدة الوثيقة.",
      "جهّز تأمين المرور الدولي قبل مغادرة تركيا.",
      "غطِّ الأضرار المادية والجسدية للغير في الخارج.",
      "احصل على عرض لمدد من 15 يوماً إلى سنة.",
    ],
  },
  konut: {
    title: "تأمين المنزل",
    seoTitle: "عروض تأمين المنزل 2026 | Sigorta Uzmanı",
    metaDescription:
      "قارن عروض تأمين المنزل لعام 2026 التي تغطي الحريق والفيضان والسرقة والكوارث المختارة.",
    serviceType: "تأمين المنزل",
    seoBullets: [
      "قارن أسعار تأمين المنزل لعام 2026 بين الشركات.",
      "احمِ المبنى والمحتويات من الحريق والمياه والسرقة والكوارث الطبيعية.",
      "يعتمد القسط على العنوان والمساحة ونوع البناء وحدود التغطية.",
      "شكّل الوثيقة بإضافات مثل الزجاج والعزل والحماية القانونية.",
    ],
  },
};

const FA_COPY: Record<ProductSlug, ProductCopy> = {
  "trafik-sigortasi": {
    title: "بیمه شخص ثالث",
    seoTitle: "استعلام بیمه شخص ثالث ۱۴۰۵ | Sigorta Uzmanı",
    metaDescription:
      "قیمت بیمه شخص ثالث اجباری ۲۰۲۶ را از نزدیک به ۳۰ شرکت مقایسه کنید و با پلاک و اطلاعات سند پیشنهاد فوری بگیرید.",
    serviceType: "بیمه اجباری مسئولیت مدنی دارندگان وسایل نقلیه",
    seoBullets: [
      "قیمت بیمه شخص ثالث ۲۰۲۶ را بین شرکت‌ها مقایسه کنید.",
      "حق بیمه بر اساس نوع خودرو، استان ثبت و پله عدم خسارت محاسبه می‌شود.",
      "خسارت مالی و جانی واردشده به شخص ثالث را پوشش می‌دهد.",
      "با پلاک و اطلاعات سند پیشنهاد اختصاصی بگیرید.",
    ],
  },
  kasko: {
    title: "بیمه بدنه",
    seoTitle: "استعلام بیمه بدنه ۲۰۲۶ | Sigorta Uzmanı",
    metaDescription:
      "قیمت، پوشش، فرانشیز و خدمات اضافی بیمه بدنه ۲۰۲۶ را مقایسه کنید؛ در محصولات واجد شرایط خرید آنلاین ادامه دهید.",
    serviceType: "بیمه بدنه خودرو",
    seoBullets: [
      "قیمت و گزینه‌های پوشش بیمه بدنه ۲۰۲۶ را مقایسه کنید.",
      "حق بیمه به ارزش خودرو، سال ساخت، شهر استفاده و سابقه خسارت بستگی دارد.",
      "خودرو را در برابر تصادف، سرقت، حوادث طبیعی و پوشش‌های اضافی محافظت کنید.",
      "پیشنهاد بدنه محدود، گسترده و کامل را در یک فرم ببینید.",
    ],
  },
  "kisa-sureli-trafik": {
    title: "بیمه شخص ثالث کوتاه‌مدت",
    badge: "جدید",
    seoTitle: "استعلام بیمه شخص ثالث کوتاه‌مدت ۲۰۲۶ | Sigorta Uzmanı",
    metaDescription:
      "قیمت بیمه شخص ثالث کوتاه‌مدت ۲۰۲۶ را مقایسه کنید و با پلاک و سند پیشنهاد بگیرید.",
    serviceType: "بیمه اجباری شخص ثالث کوتاه‌مدت",
    seoBullets: [
      "قیمت بیمه کوتاه‌مدت را بین شرکت‌ها مقایسه کنید.",
      "برای فروش محضری، انتقال و استفاده موقت کمتر از یک سال صادر می‌شود.",
      "پوشش مانند بیمه سالانه است؛ فقط مدت بیمه‌نامه کوتاه‌تر است.",
      "با پلاک و سند پیشنهاد اختصاصی بگیرید.",
    ],
  },
  "tamamlayici-saglik": {
    title: "بیمه درمان تکمیلی",
    seoTitle: "استعلام بیمه درمان تکمیلی ۲۰۲۶ | Sigorta Uzmanı",
    metaDescription:
      "پیشنهاد بیمه درمان تکمیلی و شبکه بیمارستان‌های ۲۰۲۶ را برای مابه‌التفاوت بیمارستان‌های خصوصی طرف قرارداد SGK مقایسه کنید.",
    serviceType: "بیمه درمان تکمیلی",
    seoBullets: [
      "قیمت و شبکه بیمارستان‌های ۲۰۲۶ را مقایسه کنید.",
      "مابه‌التفاوت بیمارستان‌های خصوصی طرف قرارداد SGK را پوشش دهید.",
      "بسته‌های بستری، سرپایی و خدمات اضافی را بررسی کنید.",
      "بر اساس سن، شهر و پوشش انتخابی پیشنهاد بگیرید.",
    ],
  },
  "seyahat-saglik": {
    title: "بیمه مسافرتی",
    seoTitle: "استعلام بیمه درمان مسافرت ۲۰۲۶ | Sigorta Uzmanı",
    metaDescription:
      "پیشنهاد بیمه درمان مسافرت ۲۰۲۶ را بر اساس کشور و مدت سفر مقایسه کنید و پوشش مناسب ویزا را بررسی کنید.",
    serviceType: "بیمه درمان مسافرت",
    seoBullets: [
      "قیمت را بر اساس کشور و مدت سفر مقایسه کنید.",
      "درمان اورژانس، بیمارستان، آمبولانس و انتقال پزشکی در خارج را پوشش دهید.",
      "مطابقت بیمه‌نامه با شرایط فعلی کنسولگری را بررسی کنید.",
      "برای یک سفر یا پوشش سالانه چندسفره پیشنهاد بگیرید.",
    ],
  },
  imm: {
    title: "مسئولیت اختیاری",
    seoTitle: "استعلام بیمه مسئولیت اختیاری ۲۰۲۶ | Sigorta Uzmanı",
    metaDescription:
      "پیشنهاد و سقف بیمه مسئولیت اختیاری ۲۰۲۶ را برای خسارت بالاتر از سقف بیمه شخص ثالث مقایسه کنید.",
    serviceType: "بیمه مسئولیت مالی اختیاری",
    seoBullets: [
      "قیمت و سقف‌های بالای پوشش ۲۰۲۶ را مقایسه کنید.",
      "برای خسارت مالی و جانی بالاتر از سقف شخص ثالث پوشش اضافه کنید.",
      "گزینه‌های محدود یا نامحدود را بر اساس نوع خودرو و ریسک ببینید.",
      "مستقل از بیمه بدنه پیشنهاد بگیرید.",
    ],
  },
  "ozel-saglik": {
    title: "بیمه درمان خصوصی",
    seoTitle: "استعلام بیمه درمان خصوصی ۲۰۲۶ | Sigorta Uzmanı",
    metaDescription:
      "پیشنهاد بیمه درمان خصوصی ۲۰۲۶ را با گزینه‌های بستری و سرپایی و شبکه بیمارستان‌ها مقایسه کنید.",
    serviceType: "بیمه درمان خصوصی",
    seoBullets: [
      "قیمت، شبکه و دامنه بیمه‌نامه ۲۰۲۶ را مقایسه کنید.",
      "بدون شرط SGK از پوشش بستری و سرپایی استفاده کنید.",
      "حق بیمه بر اساس سن، شهر و شبکه انتخابی محاسبه می‌شود.",
      "با سقف، فرانشیز و پوشش خارج از کشور متناسب پیشنهاد بگیرید.",
    ],
  },
  dask: {
    title: "بیمه زلزله اجباری",
    seoTitle: "استعلام بیمه زلزله اجباری ۲۰۲۶ | Sigorta Uzmanı",
    metaDescription:
      "پیشنهاد بیمه زلزله اجباری ۲۰۲۶ را با نشانی، متراژ و مشخصات بنا ایجاد یا تمدید کنید.",
    serviceType: "بیمه اجباری زلزله (DASK)",
    seoBullets: [
      "حق بیمه ۲۰۲۶ را بر اساس نشانی، متراژ، نوع بنا و خطر زلزله محاسبه کنید.",
      "خسارت ساختمان ناشی از زلزله و پیامدهای آن را پوشش دهید.",
      "بیمه‌نامه را با مشخصات به‌روز بنا صادر یا تمدید کنید.",
      "در چند گام پیشنهاد اختصاصی بگیرید.",
    ],
  },
  "yesil-kart": {
    title: "کارت سبز",
    seoTitle: "استعلام بیمه کارت سبز ۲۰۲۶ | Sigorta Uzmanı",
    metaDescription:
      "پیشنهاد بیمه کارت سبز ۲۰۲۶ را برای مدتی که در خارج رانندگی می‌کنید مقایسه کنید.",
    serviceType: "بیمه کارت سبز",
    seoBullets: [
      "قیمت را بر اساس نوع خودرو و مدت بیمه‌نامه ببینید.",
      "قبل از خروج از ترکیه بیمه مسئولیت بین‌المللی را آماده کنید.",
      "خسارت مالی و جانی واردشده به اشخاص ثالث در خارج را پوشش دهید.",
      "برای مدت ۱۵ روز تا یک سال پیشنهاد بگیرید.",
    ],
  },
  konut: {
    title: "بیمه مسکن",
    seoTitle: "استعلام بیمه مسکن ۲۰۲۶ | Sigorta Uzmanı",
    metaDescription:
      "پیشنهاد بیمه مسکن ۲۰۲۶ را با پوشش آتش‌سوزی، سیل، سرقت و حوادث طبیعی منتخب مقایسه کنید.",
    serviceType: "بیمه مسکن",
    seoBullets: [
      "قیمت بیمه مسکن ۲۰۲۶ را بین شرکت‌ها مقایسه کنید.",
      "بنا و اسباب را در برابر آتش، آب، سرقت و حوادث طبیعی محافظت کنید.",
      "حق بیمه به نشانی، متراژ، نوع بنا و سقف پوشش بستگی دارد.",
      "با الحاقی‌هایی مانند شیشه، عایق و حمایت حقوقی بیمه‌نامه را شکل دهید.",
    ],
  },
};

const COPY: Record<Locale, Record<ProductSlug, ProductCopy>> = {
  tr: TR_COPY,
  en: EN_COPY,
  ar: AR_COPY,
  fa: FA_COPY,
};

export function productCopy(
  slug: string,
  locale: Locale,
): ProductCopy | undefined {
  const tr = TR_COPY[slug as ProductSlug];
  if (!tr) return undefined;
  return COPY[locale][slug as ProductSlug] ?? tr;
}

export function localizedProduct(
  product: Product,
  locale: Locale,
): Product & ProductCopy {
  const copy = productCopy(product.slug, locale);
  return copy ? { ...product, ...copy } : product;
}

export function localizedProducts(locale: Locale): Array<Product & ProductCopy> {
  return products.map((product) => localizedProduct(product, locale));
}
