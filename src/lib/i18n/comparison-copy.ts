import type { Comparison } from "../../data/comparisons";
import { getProduct } from "../../data/products";
import type { Locale } from "./locales";
import { productCopy } from "./products";

type ArticleCopy = Pick<
  Comparison,
  | "shortTitle"
  | "seoTitle"
  | "seoDescription"
  | "summary"
  | "heroTitle"
  | "heroIntro"
  | "badge"
  | "rows"
  | "advantages"
  | "disadvantages"
  | "whoFor"
  | "verdict"
  | "recommendationText"
  | "faqs"
>;

const EN_ARTICLES: Record<string, ArticleCopy> = {
  "trafik-sigortasi-vs-kasko": {
    shortTitle: "MTPL vs Casco",
    seoTitle: "MTPL vs Casco Differences 2026 | Comparison",
    seoDescription:
      "Differences between compulsory MTPL and casco: covers, price, glass, flood, hail, theft and who should buy which. 2026 comparison.",
    summary:
      "Compulsory MTPL covers, within legal limits, damage you cause to third parties in proportion to your fault; casco covers your own vehicle within the policy covers.",
    heroTitle: "What is the difference between MTPL and casco?",
    heroIntro: [
      "Compulsory motor third-party liability is the cover every motor vehicle owner in Turkey must buy under the Highway Traffic Law. It pays bodily and material damage to the other party within policy limits. Casco is optional property cover for your own vehicle against collision, fire, theft and natural events.",
      "This guide compares the two products point by point, explains which policy responds for glass, flood, hail and theft, and which driver profile needs which combination.",
    ],
    badge: "Most popular",
    rows: [
      { label: "Compulsory / optional", left: "Compulsory", right: "Optional" },
      { label: "Covers the other party?", left: "Yes", right: "No (your own vehicle)" },
      { label: "Covers your own vehicle?", left: "No", right: "Yes" },
      { label: "Glass breakage", left: "Not covered", right: "Usually included / extra cover" },
      { label: "Flood", left: "Not covered", right: "Included depending on pack" },
      { label: "Hail", left: "Not covered", right: "Included depending on pack" },
      { label: "Fire", left: "Not covered", right: "Usually included" },
      { label: "Theft", left: "Not covered", right: "Usually included" },
      { label: "Terror", left: "Not covered", right: "Included depending on pack" },
      { label: "Mini repair", left: "No", right: "May be offered as an extra" },
      { label: "Courtesy car", left: "No", right: "May be offered as extra cover" },
      { label: "Typical price", left: "Lower (compulsory premium)", right: "Higher, based on vehicle value" },
      {
        label: "Who should buy it?",
        left: "All motor vehicle owners (legal duty)",
        right: "Anyone who wants to protect the value of their car",
      },
    ],
    advantages: {
      left: [
        "Legal duty; required for traffic fines and registration processes",
        "Premium is usually lower than casco",
        "Covers bodily and material damage caused to the other party",
      ],
      right: [
        "Covers damage to your own vehicle",
        "Can cover natural events, theft and fire",
        "Extras such as mini repair and a courtesy car can be added",
      ],
    },
    disadvantages: {
      left: [
        "Does not cover damage to your own vehicle",
        "No glass, flood, hail or theft cover",
      ],
      right: [
        "Not compulsory; the premium is higher",
        "Deductibles and limits vary by policy",
      ],
    },
    whoFor: {
      left: "All vehicle owners — not buying it creates a legal risk.",
      right: "Especially owners of new, financed or higher-value cars.",
    },
    verdict:
      "MTPL is compulsory and protects the other party; casco protects your own car. They are complements, not alternatives.",
    recommendationText:
      "Buy compulsory MTPL first, then add a casco pack that matches your vehicle’s value.",
    faqs: [
      {
        q: "Is MTPL enough on its own?",
        a: "It is the legal minimum. Casco is needed for damage to your own vehicle.",
      },
      {
        q: "Does casco replace MTPL?",
        a: "No. Casco covers your car; MTPL covers the other party. They are separate policies.",
      },
      {
        q: "Which is more expensive?",
        a: "Casco is usually more expensive because it is calculated from vehicle value, model year and cover width.",
      },
    ],
  },
  "kasko-vs-genisletilmis-kasko": {
    shortTitle: "Casco vs Extended Casco",
    seoTitle: "Casco vs Extended Casco Differences 2026",
    seoDescription:
      "Cover, extra services, price difference and who should choose standard casco vs extended casco.",
    summary:
      "See which pack fits you from cover width, extra services and the premium difference.",
    heroTitle: "Differences between casco and extended casco",
    heroIntro: [
      "Standard casco covers core risks such as collision, fire and theft. Extended casco widens that with extras such as flood, hail, terror, glass breakage and key loss, plus services such as mini repair and a courtesy car.",
      "The comparison below shows cover and premium differences, which option is more efficient for your city’s risk profile, and which special conditions to check before you buy.",
    ],
    rows: [
      { label: "Cover scope", left: "Core risks (collision, fire, theft etc.)", right: "Core + extra risks (flood, hail, terror etc.)" },
      { label: "Extra services", left: "Limited", right: "Wider: mini repair, courtesy car, glass etc." },
      { label: "Price difference", left: "Lower premium", right: "Higher premium" },
      { label: "Who is it for?", left: "Budget-focused, lower-risk area", right: "Anyone who wants broader protection" },
    ],
    advantages: {
      left: ["Lower premium", "Enough cover for core risks"],
      right: ["Wider cover", "Advantage for natural events and extra services"],
    },
    disadvantages: {
      left: ["Flood, hail and terror can be missing"],
      right: ["Annual premium cost is higher"],
    },
    whoFor: {
      left: "Drivers who want to keep the premium low.",
      right: "Those in high flood/hail cities or who want full protection.",
    },
    verdict:
      "Extended casco adds extra risks on top of standard casco. Choose by your risk map and budget.",
    recommendationText:
      "If your city’s flood/hail risk is high, pick the extended pack; if risk is low and budget comes first, pick standard casco.",
    faqs: [
      {
        q: "What is extra in extended casco?",
        a: "It varies by insurer, but flood, hail, terror, glass and key loss covers are often added.",
      },
    ],
  },
  "imm-vs-yuksek-teminatli-imm": {
    shortTitle: "Excess liability vs high-limit excess liability",
    seoTitle: "Excess liability vs high-limit excess liability 2026",
    seoDescription:
      "Why excess liability is needed, 2026 cover limits, and who should buy a high-limit pack.",
    summary:
      "Compare why excess liability is needed, 2026 cover limits, and who needs a higher limit.",
    heroTitle: "Excess liability vs high-limit excess liability: 2026 limits",
    heroIntro: [
      "Optional excess liability (İMM) steps in when compulsory MTPL limits are exceeded and pays the remaining compensation. A high-limit pack takes that cover to much higher, sometimes near-unlimited, amounts.",
      "This page reviews 2026 limits, the premium gap between standard and high-limit options, and which limit better protects your personal assets in a severe accident.",
    ],
    rows: [
      { label: "Why is it needed?", left: "For losses above the MTPL limit", right: "Against severe bodily/material loss" },
      { label: "2026 limits", left: "Standard / selectable limits", right: "High or near-unlimited limits" },
      { label: "Who is it important for?", left: "All drivers", right: "Heavy traffic, commercial use, higher risk" },
    ],
    advantages: {
      left: ["Completes compulsory MTPL", "Extra cover at a reasonable premium"],
      right: ["Financial cover in large losses", "Helps protect personal assets"],
    },
    disadvantages: {
      left: ["A low limit may not be enough in a severe accident"],
      right: ["Higher premium"],
    },
    whoFor: {
      left: "Every driver who wants basic extra liability cover.",
      right: "Heavy city use, large vehicles or higher personal assets.",
    },
    verdict:
      "MTPL limits may not be enough in a large accident. Excess liability is a critical extra that lowers your personal financial risk.",
    recommendationText:
      "Prefer a high-limit pack if you can; the premium gap is usually small and the cover gap is large.",
    faqs: [
      {
        q: "Is excess liability inside casco?",
        a: "Some casco packs can include it, but a separate excess-liability policy can also be bought.",
      },
    ],
  },
};

const AR_ARTICLES: Record<string, ArticleCopy> = {
  "trafik-sigortasi-vs-kasko": {
    shortTitle: "تأمين المرور مقابل الكاسكو",
    seoTitle: "فروق تأمين المرور والكاسكو 2026 | مقارنة",
    seoDescription:
      "الفروق بين تأمين المرور الإلزامي والكاسكو: التغطيات والسعر والزجاج والفيضان والبَرَد والسرقة ومن يجب أن يشتري أيهما.",
    summary:
      "يغطي تأمين المرور الإلزامي، ضمن الحدود القانونية، الضرر الذي تلحقونه بالغير بنسبة خطئكم؛ أما الكاسكو فيغطي مركبتكم ضمن تغطيات الوثيقة.",
    heroTitle: "ما الفرق بين تأمين المرور والكاسكو؟",
    heroIntro: [
      "تأمين المسؤولية تجاه الغير إلزامي لكل مالك مركبة آلية في تركيا بموجب قانون المرور. يدفع الضرر البدني والمادي للطرف الآخر ضمن حدود الوثيقة. الكاسكو تغطية اختيارية لممتلكاتكم ضد التصادم والحريق والسرقة والكوارث الطبيعية.",
      "يقارن هذا الدليل المنتجين بنداً بنداً ويوضح أي وثيقة تستجيب للزجاج والفيضان والبَرَد والسرقة وأي ملف سائق يحتاج أي مزيج.",
    ],
    badge: "الأكثر رواجاً",
    rows: [
      { label: "إلزامي / اختياري", left: "إلزامي", right: "اختياري" },
      { label: "هل يغطي الطرف الآخر؟", left: "نعم", right: "لا (مركبتكم)" },
      { label: "هل يغطي مركبتكم؟", left: "لا", right: "نعم" },
      { label: "كسر الزجاج", left: "خارج التغطية", right: "غالباً مشمول / تغطية إضافية" },
      { label: "فيضان", left: "خارج التغطية", right: "مشمول حسب الباقة" },
      { label: "بَرَد", left: "خارج التغطية", right: "مشمول حسب الباقة" },
      { label: "حريق", left: "خارج التغطية", right: "غالباً مشمول" },
      { label: "سرقة", left: "خارج التغطية", right: "غالباً مشمول" },
      { label: "إرهاب", left: "خارج التغطية", right: "مشمول حسب الباقة" },
      { label: "إصلاح صغير", left: "لا", right: "قد يُقدَّم كخدمة إضافية" },
      { label: "سيارة بديلة", left: "لا", right: "قد تُقدَّم كتغطية إضافية" },
      { label: "السعر التقريبي", left: "أقل (قسط إلزامي)", right: "أعلى حسب قيمة المركبة" },
      {
        label: "من يجب أن يشتريه؟",
        left: "جميع مالكي المركبات الآلية (واجب قانوني)",
        right: "كل من يريد حماية قيمة سيارته",
      },
    ],
    advantages: {
      left: [
        "واجب قانوني؛ مطلوب في المخالفات ومعاملات الرخصة",
        "القسط عادة أقل من الكاسكو",
        "يغطي الضرر البدني والمادي للطرف الآخر",
      ],
      right: [
        "يغطي الضرر في مركبتكم",
        "يمكن أن يشمل الكوارث والسرقة والحريق",
        "يمكن إضافة خدمات مثل الإصلاح الصغير والسيارة البديلة",
      ],
    },
    disadvantages: {
      left: [
        "لا يغطي الضرر في مركبتكم",
        "لا تغطية للزجاج أو الفيضان أو البَرَد أو السرقة",
      ],
      right: [
        "ليس إلزامياً؛ القسط أعلى",
        "التحمل والحدود تختلف حسب الوثيقة",
      ],
    },
    whoFor: {
      left: "جميع مالكي المركبات — عدم شرائه مخاطرة قانونية.",
      right: "خصوصاً أصحاب السيارات الجديدة أو الممولة أو الأعلى قيمة.",
    },
    verdict:
      "تأمين المرور إلزامي ويحمي الطرف الآخر؛ الكاسكو يحمي سيارتكم. ليسا بديلين بل مكملين.",
    recommendationText:
      "اشتروا تأمين المرور الإلزامي أولاً ثم أضيفوا باقة كاسكو تناسب قيمة المركبة.",
    faqs: [
      {
        q: "هل يكفي تأمين المرور وحده؟",
        a: "هو الحد القانوني الأدنى. تحتاجون الكاسكو لضرر مركبتكم.",
      },
      {
        q: "هل يغني الكاسكو عن تأمين المرور؟",
        a: "لا. الكاسكو يغطي سيارتكم وتأمين المرور يغطي الطرف الآخر. وثيقتان منفصلتان.",
      },
      {
        q: "أيهما أغلى؟",
        a: "الكاسكو عادة أغلى لأنه يُحسب حسب قيمة المركبة وسنة الصنع واتساع التغطية.",
      },
    ],
  },
  "kasko-vs-genisletilmis-kasko": {
    shortTitle: "كاسكو مقابل الكاسكو الموسّع",
    seoTitle: "فروق الكاسكو والكاسكو الموسّع 2026",
    seoDescription:
      "فروق التغطية والخدمات الإضافية والسعر ومن يناسبه الكاسكو العادي مقابل الموسّع.",
    summary:
      "قارنوا اتساع التغطية والخدمات الإضافية وفرق القسط لاختيار الباقة المناسبة.",
    heroTitle: "الفروق بين الكاسكو والكاسكو الموسّع",
    heroIntro: [
      "يغطي الكاسكو العادي المخاطر الأساسية مثل التصادم والحريق والسرقة. أما الكاسكو الموسّع فيوسّع ذلك بفيضان وبَرَد وإرهاب وكسر زجاج وفقدان مفتاح، إضافة إلى خدمات مثل الإصلاح الصغير والسيارة البديلة.",
      "في المقارنة أدناه تجدون فروق التغطية والقسط، وأي خيار أنسب حسب مخاطر مدينتكم، والبنود التي ينبغي التحقق منها في الشروط الخاصة قبل الشراء.",
    ],
    rows: [
      { label: "نطاق التغطية", left: "مخاطر أساسية (تصادم، حريق، سرقة…)", right: "أساسية + إضافية (فيضان، بَرَد، إرهاب…)" },
      { label: "خدمات إضافية", left: "محدودة", right: "أوسع: إصلاح صغير، سيارة بديلة، زجاج…" },
      { label: "فرق السعر", left: "قسط أدنى", right: "قسط أعلى" },
      { label: "لمن؟", left: "من يركز على الميزانية ومناطق أقل خطراً", right: "من يريد حماية أشمل" },
    ],
    advantages: {
      left: ["قسط أدنى", "حماية كافية في المخاطر الأساسية"],
      right: ["تغطية أوسع", "ميزة في الكوارث الطبيعية والخدمات الإضافية"],
    },
    disadvantages: {
      left: ["قد ينقص الفيضان والبَرَد والإرهاب"],
      right: ["تكلفة القسط السنوي أعلى"],
    },
    whoFor: {
      left: "السائقون الذين يريدون إبقاء القسط منخفضاً.",
      right: "من يسكن في ولايات عالية خطر الفيضان/البَرَد أو يريد ضماناً كاملاً.",
    },
    verdict:
      "يضيف الكاسكو الموسّع مخاطر إضافية فوق الكاسكو العادي. اختاروا وفق خريطة المخاطر وميزانيتكم.",
    recommendationText:
      "إذا كان خطر الفيضان/البَرَد في مدينتكم مرتفعاً فاختاروا الباقة الموسّعة؛ وإذا كان الخطر منخفضاً والميزانية أولاً فاختاروا الكاسكو العادي.",
    faqs: [
      {
        q: "ما الذي يُضاف في الكاسكو الموسّع؟",
        a: "يختلف حسب الشركة، وغالباً تُضاف تغطيات الفيضان والبَرَد والإرهاب والزجاج وفقدان المفتاح.",
      },
    ],
  },
  "imm-vs-yuksek-teminatli-imm": {
    shortTitle: "المسؤولية الاختيارية مقابل الحد المرتفع",
    seoTitle: "المسؤولية الاختيارية مقابل الحد المرتفع 2026",
    seoDescription:
      "لماذا تلزم المسؤولية الاختيارية، حدود 2026، ومن يحتاج حداً أعلى.",
    summary:
      "قارنوا سبب الحاجة إلى المسؤولية الاختيارية وحدود 2026 ومن يحتاج حداً أعلى.",
    heroTitle: "مقارنة المسؤولية الاختيارية والحد المرتفع: حدود 2026",
    heroIntro: [
      "تدخل المسؤولية الاختيارية (İMM) عندما تتجاوز الخسارة حدود تأمين المرور الإلزامي وتغطي فرق التعويض. الباقة ذات الحد المرتفع ترفع هذه الحماية إلى مبالغ أعلى بكثير، وأحياناً شبه غير محدودة.",
      "تراجع هذه الصفحة حدود 2026 وفرق القسط بين الخيارين، وأي حد يحمي أصولكم الشخصية أفضل في حادث جسيم.",
    ],
    rows: [
      { label: "لماذا تلزم؟", left: "للخسائر فوق حد تأمين المرور", right: "ضد ضرر بدني/مادي جسيم" },
      { label: "حدود 2026", left: "حدود قياسية / قابلة للاختيار", right: "حدود مرتفعة أو شبه غير محدودة" },
      { label: "لمن مهم؟", left: "كل السائقين", right: "ازدحام كثيف، استخدام تجاري، خطر أعلى" },
    ],
    advantages: {
      left: ["يكمل تأمين المرور", "حماية إضافية بقسط معقول"],
      right: ["غطاء مالي في الخسائر الكبيرة", "يساعد في حماية الأصول الشخصية"],
    },
    disadvantages: {
      left: ["الحد المنخفض قد لا يكفي في حادث جسيم"],
      right: ["قسط أعلى"],
    },
    whoFor: {
      left: "كل سائق يريد حماية مسؤولية إضافية أساسية.",
      right: "الاستخدام الكثيف في المدينة أو المركبات الكبيرة أو الأصول الأعلى.",
    },
    verdict:
      "قد لا تكفي حدود تأمين المرور في حادث كبير. المسؤولية الاختيارية حماية إضافية حاسمة تخفض خطركم المالي الشخصي.",
    recommendationText:
      "فضّلوا الحد المرتفع إن أمكن؛ فرق القسط عادة محدود وفرق الحماية كبير.",
    faqs: [
      {
        q: "هل المسؤولية الاختيارية داخل الكاسكو؟",
        a: "قد تُضاف إلى بعض باقات الكاسكو، ويمكن أيضاً شراء وثيقة مسؤولية اختيارية منفصلة.",
      },
    ],
  },
};

const FA_ARTICLES: Record<string, ArticleCopy> = {
  "trafik-sigortasi-vs-kasko": {
    shortTitle: "شخص ثالث در برابر بدنه",
    seoTitle: "تفاوت بیمه شخص ثالث و بدنه ۲۰۲۶ | مقایسه",
    seoDescription:
      "تفاوت بیمه شخص ثالث اجباری و بدنه: پوشش‌ها، قیمت، شیشه، سیل، تگرگ، سرقت و اینکه چه کسی کدام را باید بخرد.",
    summary:
      "بیمه شخص ثالث اجباری در حد قانونی خسارت واردشده به اشخاص ثالث را به نسبت تقصیر شما پوشش می‌دهد؛ بیمه بدنه خودروی خودتان را در چارچوب پوشش‌های بیمه‌نامه محافظت می‌کند.",
    heroTitle: "تفاوت بیمه شخص ثالث و بدنه چیست؟",
    heroIntro: [
      "بیمه مسئولیت شخص ثالث طبق قانون راهنمایی و رانندگی برای هر مالک وسیله نقلیه موتوری در ترکیه اجباری است و خسارت جانی و مالی طرف مقابل را تا سقف بیمه‌نامه می‌پردازد. بیمه بدنه پوشش اختیاری اموال برای خودروی شما در برابر تصادف، آتش‌سوزی، سرقت و حوادث طبیعی است.",
      "این راهنما دو محصول را بندبه‌بند مقایسه می‌کند و توضیح می‌دهد کدام بیمه‌نامه برای شیشه، سیل، تگرگ و سرقت وارد عمل می‌شود و کدام ترکیب برای کدام راننده مناسب است.",
    ],
    badge: "محبوب‌ترین",
    rows: [
      { label: "اجباری / اختیاری", left: "اجباری", right: "اختیاری" },
      { label: "طرف مقابل را پوشش می‌دهد؟", left: "بله", right: "خیر (خودروی خودتان)" },
      { label: "خودروی خودتان را پوشش می‌دهد؟", left: "خیر", right: "بله" },
      { label: "شکست شیشه", left: "خارج از پوشش", right: "معمولاً مشمول / پوشش اضافه" },
      { label: "سیل", left: "خارج از پوشش", right: "بسته به پکیج مشمول" },
      { label: "تگرگ", left: "خارج از پوشش", right: "بسته به پکیج مشمول" },
      { label: "آتش‌سوزی", left: "خارج از پوشش", right: "معمولاً مشمول" },
      { label: "سرقت", left: "خارج از پوشش", right: "معمولاً مشمول" },
      { label: "ترور", left: "خارج از پوشش", right: "بسته به پکیج مشمول" },
      { label: "تعمیر جزئی", left: "ندارد", right: "ممکن است به‌عنوان خدمت اضافه ارائه شود" },
      { label: "خودروی جایگزین", left: "ندارد", right: "ممکن است به‌عنوان پوشش اضافه ارائه شود" },
      { label: "قیمت تقریبی", left: "پایین‌تر (حق‌بیمه اجباری)", right: "بالاتر، بر اساس ارزش خودرو" },
      {
        label: "چه کسانی باید بخرند؟",
        left: "همه مالکان وسیله نقلیه موتوری (الزام قانونی)",
        right: "هر کسی که می‌خواهد ارزش خودرو را حفظ کند",
      },
    ],
    advantages: {
      left: [
        "الزام قانونی؛ برای جریمه و امور پلاک لازم است",
        "حق‌بیمه معمولاً از بدنه کمتر است",
        "خسارت جانی و مالی واردشده به طرف مقابل را پوشش می‌دهد",
      ],
      right: [
        "خسارت خودروی خودتان را پوشش می‌دهد",
        "می‌تواند حوادث طبیعی، سرقت و آتش‌سوزی را شامل شود",
        "خدماتی مثل تعمیر جزئی و خودروی جایگزین قابل افزودن است",
      ],
    },
    disadvantages: {
      left: [
        "خسارت خودروی خودتان را پوشش نمی‌دهد",
        "پوشش شیشه، سیل، تگرگ یا سرقت ندارد",
      ],
      right: [
        "اجباری نیست؛ حق‌بیمه بالاتر است",
        "فرانشیز و سقف‌ها بسته به بیمه‌نامه فرق می‌کند",
      ],
    },
    whoFor: {
      left: "همه مالکان خودرو — نخریدن آن ریسک قانونی می‌سازد.",
      right: "به‌ویژه مالکان خودروهای نو، وام‌دار یا گران‌قیمت.",
    },
    verdict:
      "شخص ثالث اجباری است و طرف مقابل را محافظت می‌کند؛ بدنه خودروی شما را. جایگزین هم نیستند، مکمل‌اند.",
    recommendationText:
      "ابتدا بیمه شخص ثالث اجباری را بخرید، سپس بسته بدنه متناسب با ارزش خودرو را اضافه کنید.",
    faqs: [
      {
        q: "آیا فقط شخص ثالث کافی است؟",
        a: "حداقل قانونی همین است. برای خسارت خودروی خودتان بدنه لازم است.",
      },
      {
        q: "آیا بدنه جای شخص ثالث را می‌گیرد؟",
        a: "خیر. بدنه خودروی شما را و شخص ثالث طرف مقابل را پوشش می‌دهد. دو بیمه‌نامه جدا هستند.",
      },
      {
        q: "کدام گران‌تر است؟",
        a: "بدنه معمولاً گران‌تر است چون بر اساس ارزش خودرو، سال مدل و وسعت پوشش محاسبه می‌شود.",
      },
    ],
  },
  "kasko-vs-genisletilmis-kasko": {
    shortTitle: "بدنه در برابر بدنه گسترده",
    seoTitle: "تفاوت بدنه و بدنه گسترده ۲۰۲۶",
    seoDescription:
      "تفاوت پوشش، خدمات اضافه، قیمت و اینکه چه کسی بدنه معمولی یا گسترده را انتخاب کند.",
    summary:
      "با وسعت پوشش، خدمات اضافه و تفاوت حق‌بیمه ببینید کدام بسته مناسب شماست.",
    heroTitle: "تفاوت بدنه و بدنه گسترده",
    heroIntro: [
      "بدنه معمولی ریسک‌های اصلی مثل تصادف، آتش‌سوزی و سرقت را پوشش می‌دهد. بدنه گسترده آن را با سیل، تگرگ، ترور، شکست شیشه و گم‌شدن کلید و خدماتی مثل تعمیر جزئی و خودروی جایگزین گسترش می‌دهد.",
      "در مقایسه زیر تفاوت پوشش و حق‌بیمه، گزینه مناسب‌تر بر اساس ریسک شهرتان و بندهایی که قبل از خرید باید در شرایط خاص ببینید آمده است.",
    ],
    rows: [
      { label: "دامنه پوشش", left: "ریسک‌های اصلی (تصادف، آتش، سرقت و …)", right: "اصلی + ریسک اضافه (سیل، تگرگ، ترور و …)" },
      { label: "خدمات اضافه", left: "محدود", right: "گسترده‌تر: تعمیر جزئی، خودروی جایگزین، شیشه و …" },
      { label: "تفاوت قیمت", left: "حق‌بیمه پایین‌تر", right: "حق‌بیمه بالاتر" },
      { label: "برای چه کسانی؟", left: "اولویت بودجه، منطقه کم‌ریسک", right: "کسانی که پوشش کامل می‌خواهند" },
    ],
    advantages: {
      left: ["حق‌بیمه پایین‌تر", "پوشش کافی در ریسک‌های اصلی"],
      right: ["پوشش گسترده‌تر", "مزیت در حوادث طبیعی و خدمات اضافه"],
    },
    disadvantages: {
      left: ["سیل، تگرگ و ترور ممکن است ناقص بماند"],
      right: ["هزینه حق‌بیمه سالانه بالاتر است"],
    },
    whoFor: {
      left: "رانندگانی که می‌خواهند حق‌بیمه را پایین نگه دارند.",
      right: "شهرهای با ریسک سیل/تگرگ بالا یا کسانی که پوشش کامل می‌خواهند.",
    },
    verdict:
      "بدنه گسترده ریسک‌های اضافه را روی بدنه معمولی می‌گذارد. بر اساس نقشه ریسک و بودجه انتخاب کنید.",
    recommendationText:
      "اگر ریسک سیل/تگرگ شهرتان بالاست بسته گسترده را؛ اگر ریسک پایین و بودجه اول است بدنه معمولی را انتخاب کنید.",
    faqs: [
      {
        q: "در بدنه گسترده چه چیز اضافه است؟",
        a: "بسته به شرکت فرق می‌کند، اما پوشش سیل، تگرگ، ترور، شیشه و گم‌شدن کلید اغلب اضافه می‌شود.",
      },
    ],
  },
  "imm-vs-yuksek-teminatli-imm": {
    shortTitle: "مسئولیت اختیاری در برابر سقف بالا",
    seoTitle: "مسئولیت اختیاری در برابر سقف بالا ۲۰۲۶",
    seoDescription:
      "چرا مسئولیت اختیاری لازم است، سقف‌های ۲۰۲۶ و چه کسانی باید سقف بالاتر بخرند.",
    summary:
      "دلیل نیاز به مسئولیت اختیاری، سقف‌های ۲۰۲۶ و اینکه چه کسانی سقف بالاتر لازم دارند را مقایسه کنید.",
    heroTitle: "مقایسه مسئولیت اختیاری و سقف بالا: سقف‌های ۲۰۲۶",
    heroIntro: [
      "مسئولیت اختیاری (İMM) وقتی حد شخص ثالث اجباری تمام می‌شود وارد عمل می‌شود و مابه‌التفاوت خسارت را می‌پردازد. بسته با سقف بالا این پوشش را به مبالغ خیلی بالاتر، گاهی نزدیک به نامحدود، می‌برد.",
      "این صفحه سقف‌های ۲۰۲۶، فاصله حق‌بیمه بین گزینه استاندارد و سقف بالا و اینکه کدام حد دارایی شخصی را در حادثه سنگین بهتر حفظ می‌کند بررسی می‌کند.",
    ],
    rows: [
      { label: "چرا لازم است؟", left: "برای خسارت بالاتر از حد شخص ثالث", right: "در برابر خسارت جانی/مالی سنگین" },
      { label: "سقف‌های ۲۰۲۶", left: "سقف استاندارد / قابل انتخاب", right: "سقف بالا یا نزدیک به نامحدود" },
      { label: "برای چه کسانی مهم است؟", left: "همه رانندگان", right: "ترافیک سنگین، استفاده تجاری، ریسک بالاتر" },
    ],
    advantages: {
      left: ["شخص ثالث را کامل می‌کند", "پوشش اضافه با حق‌بیمه معقول"],
      right: ["پوشش مالی در خسارت بزرگ", "به حفظ دارایی شخصی کمک می‌کند"],
    },
    disadvantages: {
      left: ["سقف پایین در حادثه سنگین کافی نباشد"],
      right: ["حق‌بیمه بالاتر"],
    },
    whoFor: {
      left: "هر راننده‌ای که پوشش مسئولیت اضافه پایه می‌خواهد.",
      right: "استفاده شهری سنگین، خودروی بزرگ یا دارایی بالاتر.",
    },
    verdict:
      "سقف شخص ثالث در حادثه بزرگ ممکن است کافی نباشد. مسئولیت اختیاری پوشش اضافه‌ای است که ریسک مالی شخصی را کم می‌کند.",
    recommendationText:
      "در صورت امکان سقف بالا را ترجیح دهید؛ فاصله حق‌بیمه معمولاً محدود و فاصله پوشش زیاد است.",
    faqs: [
      {
        q: "آیا مسئولیت اختیاری داخل بدنه است؟",
        a: "در برخی بسته‌های بدنه قابل افزودن است؛ بیمه‌نامه مسئولیت اختیاری جدا هم می‌توان خرید.",
      },
    ],
  },
};

const ARTICLES: Record<Exclude<Locale, "tr">, Record<string, ArticleCopy>> = {
  en: EN_ARTICLES,
  ar: AR_ARTICLES,
  fa: FA_ARTICLES,
};

const SIDE_NAMES: Record<string, Record<Exclude<Locale, "tr">, string>> = {
  "Trafik Sigortası": { en: "Motor Third Party Liability", ar: "تأمين المرور", fa: "بیمه شخص ثالث" },
  Kasko: { en: "Casco", ar: "كاسكو", fa: "بیمه بدنه" },
  "Genişletilmiş Kasko": { en: "Extended Casco", ar: "الكاسكو الموسّع", fa: "بدنه گسترده" },
  İMM: { en: "Excess Liability", ar: "المسؤولية الاختيارية", fa: "مسئولیت اختیاری" },
  "Yüksek Teminatlı İMM": {
    en: "High-limit excess liability",
    ar: "المسؤولية الاختيارية بحد مرتفع",
    fa: "مسئولیت اختیاری با سقف بالا",
  },
  "Tamamlayıcı Sağlık": { en: "Complementary Health", ar: "التأمين الصحي التكميلي", fa: "بیمه درمان تکمیلی" },
  "Özel Sağlık": { en: "Private Health", ar: "التأمين الصحي الخاص", fa: "بیمه درمان خصوصی" },
  "Özel Muayene Ücreti (ödeme)": {
    en: "Private exam fee (self-pay)",
    ar: "أجر المعاينة الخاصة (دفع مباشر)",
    fa: "هزینه ویزیت خصوصی (پرداخت نقدی)",
  },
  "Seyahat Sağlık": { en: "Travel Health", ar: "التأمين الصحي للسفر", fa: "بیمه مسافرتی" },
  DASK: { en: "DASK", ar: "داسك", fa: "بیمه زلزله اجباری" },
  "Konut Sigortası": { en: "Home Insurance", ar: "تأمين المنزل", fa: "بیمه مسکن" },
  "Ev Sahibi Sigortası": { en: "Landlord insurance", ar: "تأمين مالك المنزل", fa: "بیمه صاحب‌خانه" },
  "Kiracı Sigortası": { en: "Tenant insurance", ar: "تأمين المستأجر", fa: "بیمه مستأجر" },
  "Yeşil Kart": { en: "Green Card", ar: "البطاقة الخضراء", fa: "کارت سبز" },
  "Vize Sigortası": { en: "Visa insurance", ar: "تأمين التأشيرة", fa: "بیمه ویزا" },
  "Ferdi Kaza": { en: "Personal accident", ar: "تأمين الحوادث الشخصية", fa: "بیمه حوادث انفرادی" },
  "Hayat Sigortası": { en: "Life insurance", ar: "التأمين على الحياة", fa: "بیمه عمر" },
  "İş Yeri Sigortası": { en: "Business premises insurance", ar: "تأمين مكان العمل", fa: "بیمه محل کار" },
  "Mesleki Sorumluluk": { en: "Professional indemnity", ar: "المسؤولية المهنية", fa: "مسئولیت حرفه‌ای" },
  "Üçüncü Şahıs Mali Sorumluluk": {
    en: "Third-party liability",
    ar: "المسؤولية المالية تجاه الغير",
    fa: "مسئولیت مدنی شخص ثالث",
  },
  "Wallbox Sigortası": { en: "Wallbox insurance", ar: "تأمين وحدة الشحن المنزلية", fa: "بیمه وال‌باکس" },
  "Şarj İstasyonu Sigortası": {
    en: "Charging station insurance",
    ar: "تأمين محطة الشحن",
    fa: "بیمه ایستگاه شارژ",
  },
};

function sideName(name: string, productSlug: string | undefined, locale: Locale): string {
  if (locale === "tr") return name;
  const mapped = SIDE_NAMES[name]?.[locale];
  if (mapped) return mapped;
  if (!productSlug) return name;
  const product = getProduct(productSlug);
  if (!product || name !== product.title) return name;
  return productCopy(product.slug, locale)?.title ?? name;
}

export function localizedComparison(comparison: Comparison, locale: Locale): Comparison {
  const named: Comparison = {
    ...comparison,
    left: {
      ...comparison.left,
      name: sideName(comparison.left.name, comparison.left.productSlug, locale),
    },
    right: {
      ...comparison.right,
      name: sideName(comparison.right.name, comparison.right.productSlug, locale),
    },
  };
  if (locale === "tr") return named;
  const article = ARTICLES[locale][comparison.slug];
  if (!article) return named;
  return { ...named, ...article };
}
