import {
  CATEGORY_LABELS,
  type GlossaryCategory,
  type GlossaryTerm,
  glossaryTerms,
} from "../../data/glossary";
import type { Locale } from "./locales";

export interface GlossaryMessages {
  seoTitle: string;
  seoDescription: string;
  breadcrumbAria: string;
  eyebrow: string;
  lead: string;
  popularTitle: string;
  popularLead: string;
  toolsAria: string;
  searchAria: string;
  searchPlaceholder: string;
  categoryAria: string;
  all: string;
  skipByLetter: string;
  allTerms: string;
  results: string;
  empty: string;
  clearFilters: string;
  related: string;
  ctaTitle: string;
  ctaLead: string;
  cta: string;
  categories: Record<GlossaryCategory, string>;
}

type TermCopy = Pick<GlossaryTerm, "term" | "shortDefinition" | "definition">;

const TR: GlossaryMessages = {
  seoTitle: "Sigorta Sözlüğü: Sigorta Terimleri ve Anlamları",
  seoDescription:
    "Muafiyet, İMM, pert, sovtaj, rayiç bedel, zeyilname ve daha fazlası. Poliçelerde geçen sigorta terimlerini sade Türkçe açıklamalarla öğrenin.",
  breadcrumbAria: "Sayfa konumu",
  eyebrow: "Bilgi merkezi",
  lead:
    "Sigorta poliçelerinde geçen terimleri sade ve anlaşılır Türkçe ile açıklıyoruz. Teklif alırken veya hasar sürecinde karşınıza çıkan kavramları buradan hızlıca öğrenin.",
  popularTitle: "Çok aranan kelimeler",
  popularLead: "Kullanıcıların en sık araştırdığı sigorta terimleri.",
  toolsAria: "Sözlük filtreleri",
  searchAria: "Terim ara",
  searchPlaceholder: "Terim veya açıklama ara…",
  categoryAria: "Kategori",
  all: "Tümü",
  skipByLetter: "Harfe göre atla",
  allTerms: "Tüm terimler",
  results: "{n} sonuç",
  empty: "Aramanızla eşleşen terim bulunamadı. Farklı bir kelime deneyin.",
  clearFilters: "Filtreleri temizle",
  related: "İlgili terimler:",
  ctaTitle: "Doğru teminatı seçmek ister misiniz?",
  ctaLead:
    "Terimleri öğrendiniz. Şimdi ihtiyacınıza uygun poliçeyi şirketler arasında karşılaştırın.",
  cta: "Teklif al",
  categories: CATEGORY_LABELS,
};

const EN: GlossaryMessages = {
  seoTitle: "Insurance glossary: terms and meanings",
  seoDescription:
    "Deductible, excess liability, total loss, salvage, market value, endorsement and more. Plain-language explanations of the terms you see on insurance policies.",
  breadcrumbAria: "Page location",
  eyebrow: "Knowledge centre",
  lead:
    "We explain the terms that appear on insurance policies in clear language. Use this glossary when you take a quote or go through a claim.",
  popularTitle: "Most searched terms",
  popularLead: "The insurance words people look up most often.",
  toolsAria: "Glossary filters",
  searchAria: "Search terms",
  searchPlaceholder: "Search a term or explanation…",
  categoryAria: "Category",
  all: "All",
  skipByLetter: "Skip by letter",
  allTerms: "All terms",
  results: "{n} results",
  empty: "No terms match your search. Try a different word.",
  clearFilters: "Clear filters",
  related: "Related terms:",
  ctaTitle: "Want the right cover?",
  ctaLead: "You know the terms. Now compare policies across insurers.",
  cta: "Get a quote",
  categories: {
    genel: "General concepts",
    arac: "Motor insurance",
    hasar: "Claims and repair",
    saglik: "Health insurance",
    konut: "Home and DASK",
    hukuki: "Legal terms",
  },
};

const AR: GlossaryMessages = {
  seoTitle: "قاموس التأمين: المصطلحات والمعاني",
  seoDescription:
    "التحمل والمسؤولية الاختيارية والخسارة الكلية وقيمة الحطام والقيمة السوقية وملحق الوثيقة وغيرها. شروح مبسطة لمصطلحات وثائق التأمين.",
  breadcrumbAria: "موقع الصفحة",
  eyebrow: "مركز المعرفة",
  lead:
    "نشرح المصطلحات الواردة في وثائق التأمين بلغة واضحة. استخدموا هذا القاموس عند طلب عرض أو متابعة مطالبة.",
  popularTitle: "المصطلحات الأكثر بحثاً",
  popularLead: "كلمات التأمين التي يبحث عنها المستخدمون أكثر من غيرها.",
  toolsAria: "مرشحات القاموس",
  searchAria: "البحث عن مصطلح",
  searchPlaceholder: "ابحثوا عن مصطلح أو شرح…",
  categoryAria: "الفئة",
  all: "الكل",
  skipByLetter: "الانتقال حسب الحرف",
  allTerms: "جميع المصطلحات",
  results: "{n} نتيجة",
  empty: "لا توجد مصطلحات مطابقة لبحثكم. جرّبوا كلمة أخرى.",
  clearFilters: "مسح المرشحات",
  related: "مصطلحات ذات صلة:",
  ctaTitle: "هل تريدون التغطية المناسبة؟",
  ctaLead: "تعرفتم على المصطلحات. قارنوا الآن الوثائق بين الشركات.",
  cta: "اطلبوا عرضاً",
  categories: {
    genel: "مفاهيم عامة",
    arac: "تأمين المركبات",
    hasar: "المطالبة والإصلاح",
    saglik: "التأمين الصحي",
    konut: "المنزل وداسك",
    hukuki: "مصطلحات قانونية",
  },
};

const FA: GlossaryMessages = {
  seoTitle: "واژه‌نامه بیمه: اصطلاحات و معانی",
  seoDescription:
    "فرانشیز، مسئولیت اختیاری، خسارت کلی، ارزش اسقاط، ارزش روز، الحاقیه و بیشتر. توضیح ساده اصطلاحات بیمه‌نامه.",
  breadcrumbAria: "موقعیت صفحه",
  eyebrow: "مرکز دانش",
  lead:
    "اصطلاحات بیمه‌نامه را به زبان ساده توضیح می‌دهیم. هنگام گرفتن پیشنهاد یا پیگیری خسارت از این واژه‌نامه استفاده کنید.",
  popularTitle: "پرجستجوترین واژه‌ها",
  popularLead: "اصطلاحات بیمه‌ای که بیشتر جستجو می‌شوند.",
  toolsAria: "فیلترهای واژه‌نامه",
  searchAria: "جستجوی اصطلاح",
  searchPlaceholder: "اصطلاح یا توضیح را جستجو کنید…",
  categoryAria: "دسته",
  all: "همه",
  skipByLetter: "پرش بر اساس حرف",
  allTerms: "همه اصطلاحات",
  results: "{n} نتیجه",
  empty: "اصطلاحی با جستجوی شما پیدا نشد. واژه دیگری امتحان کنید.",
  clearFilters: "پاک کردن فیلترها",
  related: "اصطلاحات مرتبط:",
  ctaTitle: "پوشش مناسب را می‌خواهید؟",
  ctaLead: "اصطلاحات را شناختید. حالا بیمه‌نامه را بین شرکت‌ها مقایسه کنید.",
  cta: "پیشنهاد بگیرید",
  categories: {
    genel: "مفاهیم کلی",
    arac: "بیمه خودرو",
    hasar: "خسارت و تعمیر",
    saglik: "بیمه درمان",
    konut: "مسکن و زلزله",
    hukuki: "اصطلاحات حقوقی",
  },
};

const EN_TERMS: Record<string, TermCopy> = {
  muafiyet: {
    term: "Deductible",
    shortDefinition:
      "The amount or share the insured pays out of pocket when a claim occurs.",
    definition:
      "A deductible is the part of a loss that the insurer will not pay, as set in the policy. It can be a fixed amount (for example 5,000 TL) or a percentage of the damage. Policies with a deductible usually have a lower premium, but the insured contributes more on small claims. When you compare quotes, weigh the deductible together with the cover.",
  },
  imm: {
    term: "Excess liability (IMM)",
    shortDefinition:
      "Optional extra liability cover that sits above compulsory motor third-party limits.",
    definition:
      "IMM (ihtiyari mali mesuliyet) is extra liability insurance for material and bodily damage that exceeds the legal limits of compulsory motor third-party cover. In a serious accident, compensation to the other party can go above those limits; IMM covers the difference. Limit options vary by insurer. A high IMM limit is especially important in dense city traffic.",
  },
  "mini-onarim": {
    term: "Mini repair",
    shortDefinition:
      "Repair of small scratches, dents and glass damage without using the no-claims discount.",
    definition:
      "Mini repair is a common casco extra for local jobs such as paintless dent repair, light scratch removal, and lamp or glass work. It usually does not affect the no-claims discount and is handled through a fast service network. Scope, visit limits and which parts are included vary by policy, so check the mini-repair terms when you take a quote.",
  },
  "ikame-arac": {
    term: "Courtesy car",
    shortDefinition:
      "A temporary replacement vehicle provided while yours is being repaired.",
    definition:
      "A courtesy (replacement) car is a temporary vehicle given under casco while the damaged car is in the workshop. Hire period, class and mileage limits depend on the policy. The cover is often an add-on or included in certain casco packs. It is especially useful for city drivers when repair times run long.",
  },
  "rayic-bedel": {
    term: "Market value",
    shortDefinition:
      "The current value of property under prevailing market conditions.",
    definition:
      "Market value is the price of the insured property (usually a vehicle or household contents) at the time of loss. Total-loss decisions, theft payments and some home claims are based on it. For cars, model year, mileage, equipment and demand all affect the figure. A gap between the sum insured and market value can create underinsurance or overinsurance.",
  },
  pert: {
    term: "Total loss",
    shortDefinition:
      "Severe damage where repairing the vehicle is no longer economical.",
    definition:
      "Total loss (pert) is when the repair cost is high relative to the vehicle’s market value, so repair is not considered economical. The insurer usually pays market value minus salvage. A total-loss record affects resale value and future insurability. Total loss and a write-off certificate can have different legal effects.",
  },
  sovtaj: {
    term: "Salvage",
    shortDefinition:
      "The remaining economic value of damaged property (scrap or parts).",
    definition:
      "Salvage is the leftover value of property that can no longer be used as before, or has reached the end of its economic life. On a total-loss car this is the scrap value; after a fire it may be usable parts. Settlement usually deducts salvage from the sum insured or market value. Who keeps the salvage depends on the policy and the claim agreement.",
  },
  zeyilname: {
    term: "Endorsement",
    shortDefinition:
      "An addendum that records changes made to an existing policy.",
    definition:
      "An endorsement (zeyilname) formalises changes to a live contract such as address, vehicle, cover limit, extra drivers or premium. Changes usually take effect from the endorsement date and may create a premium difference. Failing to update the policy can lead to cover disputes at claim time, so important changes should be endorsed promptly.",
  },
  rucu: {
    term: "Subrogation",
    shortDefinition:
      "The insurer’s right to recover the amount it paid from the party at fault.",
    definition:
      "Subrogation is when the insurer, after paying a claim, seeks that amount back from the third party who caused the loss. In traffic accidents this may be the at-fault driver’s insurer; in employer liability, the relevant party. If the insured breached policy terms (for example drink-driving), the company may also recover from the insured. Subrogation is the legal side of a claims file.",
  },
  "ferdi-kaza": {
    term: "Personal accident",
    shortDefinition:
      "Cover for death, disability and treatment costs after an accident.",
    definition:
      "Personal accident insurance covers death, permanent disability and, on some policies, treatment costs caused by a sudden external accident. Illness is usually excluded. It can be a standalone policy or an extra inside motor or travel packs. Cover limits and occupation class affect the premium directly.",
  },
  police: {
    term: "Policy",
    shortDefinition: "The official document that sets out the insurance contract.",
    definition:
      "The policy is the written contract between insurer and insured. Covers, deductibles, term, premium, exclusions and the parties’ duties appear in it. Start and end dates, payment terms and when cover begins are also stated. It is not enough that a policy was issued; check the inception date and payment conditions. Claim rights are assessed against the policy wording.",
  },
  prim: {
    term: "Premium",
    shortDefinition: "The price paid in return for insurance cover.",
    definition:
      "The premium is what the insured pays for the risk the insurer takes on. For motor it depends on age, make-model, city and no-claims history; for health on age and medical history; for home on building age and location. It can be paid in cash or instalments. Unpaid premium can suspend cover or cancel the policy.",
  },
  teminat: {
    term: "Cover",
    shortDefinition: "The protection the insurer undertakes if a loss occurs.",
    definition:
      "Cover is the insurer’s duty to pay or provide a service when a risk defined in the policy happens. It splits into main covers (for example collision in casco) and extras (courtesy car, glass, personal accident). Events outside cover are listed as exclusions. Choosing the right product starts with a cover pack that matches your need.",
  },
  "trafik-sigortasi": {
    term: "Motor third-party liability",
    shortDefinition:
      "Compulsory liability insurance that pays damage caused to other people.",
    definition:
      "Compulsory motor third-party liability covers, within legal limits, material and bodily damage the vehicle operator causes to others. Damage to your own car is usually excluded; that needs casco. Driving without this cover is illegal and can be fined. When limits are not enough, excess liability (IMM) is recommended on top.",
  },
  kasko: {
    term: "Casco",
    shortDefinition:
      "Optional insurance that covers damage to your own vehicle and certain other risks.",
    definition:
      "Casco is optional cover for your car against collision, theft, fire, natural events and glass breakage. Packs differ by insurer; limited casco and extended casco do not offer the same covers. No-claims discount, deductible and extras such as mini repair or a courtesy car affect both premium and satisfaction.",
  },
  hasarsizlik: {
    term: "No-claims discount",
    shortDefinition: "A premium discount earned for claim-free years.",
    definition:
      "A no-claims discount (or step system) is applied at the next renewal when no claim was used in the policy period. Motor liability and casco use different steps. A large claim can reduce the discount; mini repair often does not. Transfer of the discount right depends on insurer and product rules.",
  },
  "eksik-sigorta": {
    term: "Underinsurance",
    shortDefinition: "When the sum insured is lower than the property’s true value.",
    definition:
      "Underinsurance is when the amount written on the policy is below market value. Settlement is often proportional: you are paid in the ratio of sum insured to true value, not the full loss. Keeping vehicle and household sums up to date reduces this risk.",
  },
  "asiri-sigorta": {
    term: "Overinsurance",
    shortDefinition: "When the sum insured is higher than the property’s true value.",
    definition:
      "Overinsurance is when the sum insured exceeds market value. Payment cannot exceed the actual loss or market value; excess premium may be partly refunded. Writing a higher figure on purpose does not help. A correct sum balances both premium and indemnity.",
  },
  tazminat: {
    term: "Indemnity",
    shortDefinition: "The amount the insurer pays when a covered risk occurs.",
    definition:
      "Indemnity is compensation, under the policy, for loss suffered by the insured or a beneficiary after a covered event. It can be cash, repair, replacement or a service. Deductible, salvage and underinsurance all affect the final amount.",
  },
  istisna: {
    term: "Exclusion",
    shortDefinition: "Events the policy expressly leaves outside cover.",
    definition:
      "Exclusions define what the insurer will not pay. War, nuclear risk, drink-driving or undeclared use are typical examples. General and special conditions should be read together. Knowing the exclusion list at quote stage prevents unexpected declines.",
  },
  beyan: {
    term: "Duty of disclosure",
    shortDefinition:
      "The insured’s duty to give accurate and complete information about the risk.",
    definition:
      "The duty of disclosure requires facts that affect underwriting to be stated correctly at quote and contract stage. False or incomplete statements can reduce the indemnity or cancel the policy. Typical topics include how a vehicle is used, medical history and building features.",
  },
  dask: {
    term: "DASK",
    shortDefinition:
      "Compulsory earthquake insurance for homes against earthquake and related damage.",
    definition:
      "DASK (Natural Disaster Insurance Institution) is compulsory cover for dwellings against earthquake and earthquake-related fire, explosion, tsunami and landslide. The sum is based on reconstruction cost; contents are usually excluded. A DASK policy is required for title-deed and electricity-subscription processes. Optional home insurance tops up what DASK does not cover.",
  },
  "konut-sigortasi": {
    term: "Home insurance",
    shortDefinition:
      "Optional cover for the building and contents against fire, theft, flood and similar risks.",
    definition:
      "Home insurance packages risks DASK does not cover, such as fire, theft, glass, electronics, personal accident and liability. Building and contents sums can be set separately. Earthquake cover is often added on top of DASK or combined with it. A realistic contents sum helps avoid underinsurance.",
  },
  "tamamlayici-saglik": {
    term: "Complementary health (TSS)",
    shortDefinition:
      "Health cover that pays difference fees at private hospitals contracted with SGK.",
    definition:
      "Complementary health insurance pays, within policy limits, the difference fees that can arise at private hospitals contracted with the Social Security Institution. Inpatient and outpatient packs are available. Waiting periods, network and geographic limits vary. Premiums are usually lower than private health insurance.",
  },
  "ozel-saglik": {
    term: "Private health insurance",
    shortDefinition:
      "Broad treatment cover at private hospitals and clinics.",
    definition:
      "Private health insurance provides inpatient and outpatient treatment at contracted providers, with extras such as check-up, maternity and dental on some plans. Premium depends on age, sex, health declaration and the chosen plan. Pre-existing conditions may have a waiting period or exclusion. Network size directly affects service quality.",
  },
  "seyahat-saglik": {
    term: "Travel health insurance",
    shortDefinition:
      "A policy that pays sudden illness and accident costs on domestic or international trips.",
    definition:
      "Travel health insurance covers medical emergencies, hospital stays, medicines and, on some products, extras such as baggage or flight cancellation. Schengen visas require travel cover at set limits. The policy term must match travel dates; cover ends when the term expires.",
  },
  "yesil-kart": {
    term: "Green Card",
    shortDefinition:
      "International proof of third-party liability when you drive abroad.",
    definition:
      "The Green Card is the international document showing compulsory motor liability cover in foreign countries when leaving Turkey. Valid countries are printed on the card. It is linked to motor third-party cover, but not every policy automatically includes a Green Card; it usually has to be issued before travel abroad.",
  },
  "agir-kusur": {
    term: "Gross negligence",
    shortDefinition:
      "Serious negligence or rule-breaking that can affect the indemnity.",
    definition:
      "Gross negligence is conduct that is so far outside the rules that cover can be weakened. Typical examples are drink-driving, driving without a licence or deliberately taking a risk. The insurer may decline payment or recover after paying. The definitions in the policy’s general conditions are binding.",
  },
  "hasar-dosyasi": {
    term: "Claims file",
    shortDefinition:
      "The official record from claim notice through payment or decline.",
    definition:
      "A claims file covers notice, assessment, document collection, the repair or total-loss decision and indemnity. Missing papers slow the file. Photos, reports, licence, registration and invoices are commonly requested. A broker or agent can represent the insured and speed the process.",
  },
  ekspertiz: {
    term: "Loss assessment",
    shortDefinition:
      "Expert determination of the cause, scope and amount of a loss.",
    definition:
      "Loss assessment is the report by the insurer or an independent surveyor, on site or from the file. Repair method, parts, labour and salvage rest on this report. If there is a dispute, a second assessment or arbitration may follow. Timely, accurate assessment is essential for a fair indemnity.",
  },
  "anlasmali-servis": {
    term: "Network garage",
    shortDefinition:
      "A repair workshop that works with the insurer on agreed terms.",
    definition:
      "Network garages are authorised or independent workshops contracted by the insurer. They often offer deductible advantages, faster approval and original or equivalent parts. Using a non-network garage can take longer and raise the contribution. Workshop quality is an important criterion when choosing casco.",
  },
  yenileme: {
    term: "Renewal",
    shortDefinition:
      "Continuing the policy at expiry on the same or updated terms.",
    definition:
      "Renewal keeps cover going at the end of the policy term. The premium is recalculated from claims history, tariff and inflation. On health insurance, a guaranteed renewal right is critical. Comparing renewal quotes before the expiry date reduces the risk of a cover gap.",
  },
  iptal: {
    term: "Policy cancellation",
    shortDefinition:
      "Ending the contract before expiry, including premium-refund rules.",
    definition:
      "A policy can be cancelled at the insured’s request, for unpaid premium or for a breach of disclosure. The refund depends on days used, claims and product type. Compulsory motor cover has special cancellation cases such as plate transfer or scrap. Consider the risk of being uninsured before you cancel.",
  },
  lehtar: {
    term: "Beneficiary",
    shortDefinition:
      "The person or institution named to receive the insurance payment.",
    definition:
      "The beneficiary is the party named on the policy to receive the indemnity. Naming a beneficiary is common on life and personal accident products; on credit-linked policies a bank may be the beneficiary. A change is usually made by endorsement. A clear beneficiary reduces legal disputes at payment time.",
  },
  broker: {
    term: "Insurance broker",
    shortDefinition:
      "An authorised intermediary who represents the buyer and acts independently when choosing insurers.",
    definition:
      "An insurance broker represents the person who wants cover, acts independently and impartially in choosing insurers, and intermediates quotes and contracts. Working with more than one insurer does not by itself make an agent a broker.",
  },
  "sigorta-acentesi": {
    term: "Insurance agent",
    shortDefinition:
      "An intermediary who arranges contracts for an insurer, or issues policies within its authority.",
    definition:
      "An insurance agent promotes the products of the insurers it is appointed by, takes quotes and handles policy work within its authority. Agents may work with more than one insurer. GROSS SİGORTA ARACILIK HİZMETLERİ LİMİTED ŞİRKETİ is a licensed insurance agent; sigortauzmani.net is the digital insurance platform operated by that agent.",
  },
};

const AR_TERMS: Record<string, TermCopy> = {
  muafiyet: {
    term: "التحمل",
    shortDefinition: "المبلغ أو النسبة التي يدفعها المؤمَّن له من جيبه عند وقوع ضرر.",
    definition:
      "التحمل هو الجزء المحدد في الوثيقة والذي لا تدفعه شركة التأمين عند تحقق الضرر. قد يكون مبلغاً ثابتاً (مثلاً 5.000 ليرة) أو نسبة من الضرر. الوثائق ذات التحمل تكون أقساطها عادة أقل، لكن المؤمَّن له يساهم أكثر في الأضرار الصغيرة. عند مقارنة العروض قيّموا مبلغ التحمل مع نطاق التغطية.",
  },
  imm: {
    term: "المسؤولية الاختيارية (IMM)",
    shortDefinition:
      "تغطية مسؤولية إضافية تعلو حدود تأمين المرور الإلزامي.",
    definition:
      "المسؤولية الاختيارية تأمين إضافي يغطي الأضرار المادية والجسدية التي تتجاوز الحدود القانونية لتأمين المرور الإلزامي. في الحوادث الجسيمة قد يتجاوز التعويض للطرف الآخر تلك الحدود؛ وهذه التغطية تغطي الفرق. خيارات الحد تختلف حسب الشركة. الحد المرتفع مهم خصوصاً في الازدحام الحضري.",
  },
  "mini-onarim": {
    term: "الإصلاح السريع",
    shortDefinition:
      "إصلاح الخدوش والانبعاجات الصغيرة وأضرار الزجاج دون المساس بخصم عدم المطالبة.",
    definition:
      "الإصلاح السريع خدمة شائعة في وثائق الكاسكو تشمل إصلاح الانبعاج دون طلاء وإزالة الخدوش الصغيرة وإصلاح المصابيح والزجاج. لا يؤثر عادة على خصم عدم المطالبة ويُنفَّذ عبر شبكة خدمة سريعة. النطاق وعدد العمليات والأجزاء المشمولة تختلف حسب الوثيقة؛ راجعوا الشروط عند طلب العرض.",
  },
  "ikame-arac": {
    term: "سيارة بديلة",
    shortDefinition: "مركبة مؤقتة تُقدَّم للمؤمَّن له أثناء إصلاح سيارته.",
    definition:
      "السيارة البديلة مركبة مؤقتة ضمن الكاسكو طوال بقاء السيارة المتضررة في الورشة. مدة التأجير والفئة وحد الكيلومترات تتبع شروط الوثيقة. غالباً تُختار كإضافة أو تأتي ضمن باقات معينة. مفيدة جداً لسائقي المدن عندما تطول مدة الإصلاح.",
  },
  "rayic-bedel": {
    term: "القيمة السوقية",
    shortDefinition: "القيمة الحالية للمال وفق ظروف السوق.",
    definition:
      "القيمة السوقية هي سعر المال المؤمَّن (غالباً مركبة أو محتويات منزل) وقت الضرر. قرارات الخسارة الكلية وتعويض السرقة وبعض أضرار المنزل تُحسب عليها. في المركبة يؤثر سنة الموديل والكيلومترات والتجهيزات والطلب. الفرق بين مبلغ التأمين والقيمة السوقية قد يسبب تأميناً ناقصاً أو زائداً.",
  },
  pert: {
    term: "الخسارة الكلية",
    shortDefinition: "ضرر جسيم يصبح معه إصلاح المركبة غير اقتصادي.",
    definition:
      "الخسارة الكلية (بيرت) هي ارتفاع تكلفة الإصلاح نسبة إلى القيمة السوقية بحيث لا يُعد الإصلاح مجدياً. تدفع الشركة عادة القيمة السوقية بعد خصم قيمة الحطام. يسجَّل ذلك في سجل المركبة ويؤثر على قيمتها وإمكانية تأمينها لاحقاً. الخسارة الكلية وشهادة السحب قد تختلف آثارهما القانونية.",
  },
  sovtaj: {
    term: "قيمة الحطام",
    shortDefinition: "القيمة الاقتصادية المتبقية للمال بعد الضرر (خردة أو قطع).",
    definition:
      "قيمة الحطام هي ما تبقى من مال لم يعد صالحاً للاستخدام السابق أو انتهى عمره الاقتصادي. في المركبات ذات الخسارة الكلية هي قيمة الخردة؛ وبعد الحريق قد تكون قطعاً قابلة للاستخدام. يُخصم الحطام عادة من مبلغ التأمين أو القيمة السوقية. ملكية الحطام تتبع الوثيقة واتفاق المطالبة.",
  },
  zeyilname: {
    term: "ملحق الوثيقة",
    shortDefinition: "عقد إضافي يوثّق التعديلات على الوثيقة القائمة.",
    definition:
      "الملحق يوثّق تغييرات العقد الساري مثل العنوان أو المركبة أو حد التغطية أو سائق إضافي أو القسط. تسري التعديلات عادة من تاريخ الملحق وقد ينشأ فرق قسط. عدم تحديث الوثيقة قد يثير نزاعاً عند المطالبة؛ لذلك يجب إلحاق التغييرات المهمة في وقتها.",
  },
  rucu: {
    term: "الرجوع",
    shortDefinition: "مطالبة شركة التأمين باسترداد ما دفعته من المسؤول الأصلي.",
    definition:
      "الرجوع هو أن تطالب الشركة، بعد دفع التعويض، الطرف الثالث المتسبب بالضرر بالمبلغ. في حوادث المرور قد يكون مؤمِّن السائق المخطئ؛ وفي مسؤولية صاحب العمل الطرف المعني. عند مخالفة شروط الوثيقة (مثل القيادة تحت تأثير الكحول) قد ترجع الشركة أيضاً على المؤمَّن له. مسار الرجوع هو الجانب القانوني لملف المطالبة.",
  },
  "ferdi-kaza": {
    term: "تأمين الحوادث الشخصية",
    shortDefinition: "تغطية الوفاة والعجز ومصاريف العلاج الناتجة عن حادث.",
    definition:
      "يغطي تأمين الحوادث الشخصية الوفاة والعجز الدائم، وفي بعض الوثائق مصاريف العلاج، الناتجة عن حادث مفاجئ خارجي. الحالات المرضية عادة خارج النطاق. يمكن شراؤه منفرداً أو كإضافة ضمن باقات المركبة أو السفر. حدود التغطية وفئة المهنة تؤثران مباشرة على القسط.",
  },
  police: {
    term: "الوثيقة",
    shortDefinition: "المستند الرسمي الذي يتضمن شروط عقد التأمين.",
    definition:
      "الوثيقة هي العقد المكتوب بين المؤمِّن والمؤمَّن له. تتضمن التغطيات والتحمل والمدة والقسط والاستثناءات والتزامات الطرفين. تُذكر فيها أيضاً تواريخ البداية والنهاية وشروط سريان التغطية. لا يكفي صدور الوثيقة؛ راجعوا تاريخ السريان وشروط الدفع. تُقيَّم المطالبة وفق شروط الوثيقة.",
  },
  prim: {
    term: "القسط",
    shortDefinition: "المقابل المدفوع لقاء تغطية التأمين.",
    definition:
      "القسط هو ما يدفعه المؤمَّن له مقابل الخطر الذي تتحمله الشركة. في المركبة يؤثر العمر والموديل والمدينة وخصم عدم المطالبة؛ وفي الصحة العمر والتاريخ المرضي؛ وفي المنزل عمر المبنى والموقع. يمكن دفعه نقداً أو أقساطاً. عدم الدفع قد يعلّق التغطية أو يلغي الوثيقة.",
  },
  teminat: {
    term: "التغطية",
    shortDefinition: "نطاق الحماية التي تلتزم بها الشركة عند وقوع ضرر.",
    definition:
      "التغطية التزام الشركة بالدفع أو تقديم خدمة عند تحقق خطر مذكور في الوثيقة. تنقسم إلى تغطيات أساسية (مثل التصادم في الكاسكو) وإضافية (سيارة بديلة، زجاج، حوادث شخصية). ما يخرج عن النطاق يُذكر في الاستثناءات. اختيار المنتج الصحيح يبدأ باختيار باقة تغطية تناسب الحاجة.",
  },
  "trafik-sigortasi": {
    term: "تأمين المرور",
    shortDefinition: "تأمين مسؤولية إلزامي يغطي الأضرار اللاحقة بالغير.",
    definition:
      "تأمين المسؤولية المالية الإلزامي (المرور) يغطي ضمن الحدود القانونية الأضرار المادية والجسدية التي يلحقها مشغّل المركبة بالغير. ضرر سيارتكم عادة خارج النطاق ويحتاج كاسكو. القيادة بدونه مخالفة وعليها غرامات. عند عدم كفاية الحدود يُنصح بإكمالها بالمسؤولية الاختيارية.",
  },
  kasko: {
    term: "الكاسكو",
    shortDefinition: "تأمين اختياري يحمي مركبتكم من أضرارها وبعض المخاطر المحددة.",
    definition:
      "الكاسكو تأمين اختياري يحمي سيارتكم من التصادم والسرقة والحريق والكوارث الطبيعية وكسر الزجاج. محتوى الباقة يختلف بين الشركات؛ هناك فرق بين الكاسكو المحدود والموسّع. خصم عدم المطالبة والتحمل والخدمات الإضافية (إصلاح سريع، سيارة بديلة) تؤثر على القسط والرضا.",
  },
  hasarsizlik: {
    term: "خصم عدم المطالبة",
    shortDefinition: "خصم على القسط يُمنح مقابل السنوات الخالية من المطالبات.",
    definition:
      "خصم عدم المطالبة (أو نظام الدرجات) يُطبَّق عند التجديد التالي إن لم تُستخدم مطالبة خلال مدة الوثيقة. درجات المرور والكاسكو مختلفة. المطالبة الكبيرة قد تخفّض الخصم؛ أما الإصلاح السريع فغالباً لا يؤثر. نقل حق الخصم يتبع قواعد الشركة والمنتج.",
  },
  "eksik-sigorta": {
    term: "التأمين الناقص",
    shortDefinition: "أن يكون مبلغ التأمين أقل من القيمة الحقيقية للمال.",
    definition:
      "التأمين الناقص هو انخفاض المبلغ المكتوب في الوثيقة عن القيمة السوقية. غالباً يُدفع التعويض بنسبة مبلغ التأمين إلى القيمة الحقيقية لا كامل الضرر. تحديث مبلغ المركبة ومحتويات المنزل يقلل هذا الخطر.",
  },
  "asiri-sigorta": {
    term: "التأمين الزائد",
    shortDefinition: "أن يكون مبلغ التأمين أعلى من القيمة الحقيقية للمال.",
    definition:
      "التأمين الزائد هو تجاوز مبلغ التأمين للقيمة السوقية. لا يتجاوز الدفع الضرر الفعلي أو القيمة السوقية؛ وقد يُرد جزء من القسط الزائد. رفع المبلغ عمداً لا يمنح ميزة. التحديد الصحيح يحقق توازناً في القسط والتعويض.",
  },
  tazminat: {
    term: "التعويض",
    shortDefinition: "المقابل الذي تدفعه الشركة عند تحقق الخطر أو الضرر.",
    definition:
      "التعويض هو جبر الضرر الذي يلحق بالمؤمَّن له أو صاحب الحق وفق شروط الوثيقة بعد حدث مشمول. قد يكون نقداً أو إصلاحاً أو بديلاً أو خدمة. التحمل والحطام والتأمين الناقص تؤثر على المبلغ النهائي.",
  },
  istisna: {
    term: "الاستثناء",
    shortDefinition: "حالات تُستبعد صراحة من التغطية في الوثيقة.",
    definition:
      "الاستثناءات تحدد ما لن تدفعه الشركة. الحرب والمخاطر النووية والقيادة تحت تأثير الكحول أو الاستخدام غير المصرح به أمثلة شائعة. يجب قراءة الشروط العامة والخاصة معاً. معرفة قائمة الاستثناءات عند العرض تمنع الرفض المفاجئ.",
  },
  beyan: {
    term: "واجب الإفصاح",
    shortDefinition: "التزام المؤمَّن له بتقديم معلومات صحيحة وكاملة عن الخطر.",
    definition:
      "واجب الإفصاح يقتضي ذكر المعلومات المؤثرة في تقييم الخطر بدقة عند العرض والعقد. الإفصاح الخاطئ أو الناقص قد يخفض التعويض أو يلغي الوثيقة. من المواضيع الشائعة طريقة استخدام المركبة والتاريخ الصحي وخصائص المبنى.",
  },
  dask: {
    term: "داسك",
    shortDefinition: "تأمين الزلازل الإلزامي الذي يحمي المساكن من الزلزال وما يتبعه.",
    definition:
      "داسك (مؤسسة تأمين الكوارث الطبيعية) يغطي المساكن إلزامياً ضد الزلزال والحريق والانفجار والتسونامي والانزلاق الناجمة عنه. يُحسب المبلغ وفق تكلفة إعادة البناء؛ والمحتويات عادة خارج النطاق. تُطلب وثيقة داسك في معاملات الطابو واشتراك الكهرباء. تأمين المنزل الاختياري يكمّل ما فوق داسك.",
  },
  "konut-sigortasi": {
    term: "تأمين المنزل",
    shortDefinition:
      "تأمين اختياري يحمي المبنى والمحتويات من الحريق والسرقة والفيضان وما شابه.",
    definition:
      "تأمين المنزل يقدم في باقة مخاطر لا يغطيها داسك مثل الحريق والسرقة وكسر الزجاج والأجهزة والإصابة الشخصية والمسؤولية. يمكن تحديد مبلغي المبنى والمحتويات على حدة. تغطية الزلزال غالباً تُضاف فوق داسك أو تُدمج معه. مبلغ محتويات واقعي يمنع التأمين الناقص.",
  },
  "tamamlayici-saglik": {
    term: "التأمين الصحي التكميلي",
    shortDefinition:
      "تأمين صحي يغطي فروقات الأجور في المستشفيات الخاصة المتعاقدة مع الضمان الاجتماعي.",
    definition:
      "يغطي التأمين الصحي التكميلي ضمن حدود الوثيقة فروقات الأجور في المستشفيات الخاصة المتعاقدة مع مؤسسة الضمان الاجتماعي. تتوفر باقات علاج خارجي وداخلي. فترات الانتظار والشبكة والحدود الجغرافية تختلف. قسطه عادة أقل من التأمين الصحي الخاص.",
  },
  "ozel-saglik": {
    term: "التأمين الصحي الخاص",
    shortDefinition: "تغطية علاجية واسعة في المستشفيات والعيادات الخاصة.",
    definition:
      "يوفر التأمين الصحي الخاص علاجاً خارجياً وداخلياً في المؤسسات المتعاقدة، مع إضافات مثل الفحص الشامل والولادة والأسنان في بعض الخطط. يتغير القسط حسب العمر والجنس والإفصاح الصحي والخطة. قد تُطبَّق فترة انتظار أو استثناء على الأمراض السابقة. اتساع الشبكة يؤثر مباشرة على جودة الخدمة.",
  },
  "seyahat-saglik": {
    term: "التأمين الصحي للسفر",
    shortDefinition:
      "وثيقة تغطي مصاريف المرض والحادث المفاجئ في السفر الداخلي أو الخارجي.",
    definition:
      "يغطي التأمين الصحي للسفر الطوارئ الطبية والتنويم والأدوية، وفي بعض المنتجات إلغاء الرحلة أو الأمتعة. تأشيرة شنغن تتطلب تأميناً بحدود محددة. يجب أن تطابق مدة الوثيقة تواريخ السفر؛ وتنتهي التغطية بانتهاء المدة.",
  },
  "yesil-kart": {
    term: "البطاقة الخضراء",
    shortDefinition:
      "وثيقة دولية تثبت مسؤولية تجاه الغير عند قيادة المركبة خارج البلاد.",
    definition:
      "البطاقة الخضراء مستند دولي يبين تغطية المسؤولية الإلزامية في الدول الأجنبية عند مغادرة تركيا. الدول المشمولة مذكورة على البطاقة. ترتبط بتأمين المرور، لكن ليست كل وثيقة تمنح البطاقة تلقائياً؛ يجب إصدارها قبل السفر إلى الخارج.",
  },
  "agir-kusur": {
    term: "الخطأ الجسيم",
    shortDefinition: "إهمال أو مخالفة جسيمة قد تؤثر على التعويض.",
    definition:
      "الخطأ الجسيم سلوك يخالف القواعد بدرجة تضعف التغطية. أمثلة شائعة: القيادة تحت تأثير الكحول أو بلا رخصة أو تعريض النفس للخطر عمداً. قد ترفض الشركة الدفع أو ترجع بعد الدفع. تعريفات الخطأ في الشروط العامة للوثيقة ملزمة.",
  },
  "hasar-dosyasi": {
    term: "ملف المطالبة",
    shortDefinition: "السجل الرسمي من الإبلاغ حتى قرار الدفع أو الرفض.",
    definition:
      "يشمل ملف المطالبة الإبلاغ والمعاينة وجمع المستندات وقرار الإصلاح أو الخسارة الكلية والتعويض. نقص الأوراق يطيل الملف. الصور والمحضر والرخصة والاستمارة والفواتير من أكثر ما يُطلب. يمكن للوسيط أو الوكيل تمثيل المؤمَّن له وتسريع العملية.",
  },
  ekspertiz: {
    term: "تقدير الضرر",
    shortDefinition: "تحديد سبب الضرر ونطاقه ومبلغه من قبل خبير.",
    definition:
      "تقدير الضرر تقرير يعدّه خبير الشركة أو خبير مستقل في الموقع أو من الملف. طريقة الإصلاح وقطع الغيار والعمل والحطام تستند إليه. عند الخلاف قد يُطلب تقدير ثانٍ أو تحكيم. التقدير الصحيح في وقته أساسي لتعويض عادل.",
  },
  "anlasmali-servis": {
    term: "الورشة المتعاقدة",
    shortDefinition: "شبكة إصلاح تعمل مع شركة التأمين بشروط خاصة.",
    definition:
      "الورش المتعاقدة ورش معتمدة أو خاصة مرتبطة بالشركة. غالباً توفر ميزة في التحمل وموافقة أسرع وضمان قطع أصلية أو معادلة. الورشة غير المتعاقدة قد تطيل الإجراء وترفع مساهمة المؤمَّن له. جودة الشبكة معيار مهم عند اختيار الكاسكو.",
  },
  yenileme: {
    term: "التجديد",
    shortDefinition: "استمرار الوثيقة عند انتهائها بالشروط نفسها أو المحدّثة.",
    definition:
      "التجديد إبقاء التغطية بعد انتهاء مدة الوثيقة. يُعاد حساب القسط وفق سجل المطالبات والتعرفة والتضخم. في التأمين الصحي يعد حق التجديد المضمون حقاً حاسماً. مقارنة عروض التجديد قبل تاريخ الانتهاء تقلل خطر انقطاع التغطية.",
  },
  iptal: {
    term: "إلغاء الوثيقة",
    shortDefinition: "إنهاء العقد قبل حلول الأجل وقواعد رد القسط.",
    definition:
      "يمكن إلغاء الوثيقة بطلب المؤمَّن له أو لعدم دفع القسط أو لمخالفة الإفصاح. مبلغ الرد يتغير حسب الأيام المستخدمة والمطالبة ونوع المنتج. لتأمين المرور الإلزامي حالات إلغاء خاصة مثل نقل اللوحة أو الخردة. قيّموا خطر البقاء بلا تغطية قبل الإلغاء.",
  },
  lehtar: {
    term: "المستفيد",
    shortDefinition: "الشخص أو الجهة المعيَّنة لاستلام تعويض التأمين.",
    definition:
      "المستفيد هو الطرف المذكور في الوثيقة لاستلام التعويض. تعيين المستفيد شائع في وثائق الحياة والحوادث الشخصية؛ وفي الوثائق المرتبطة بقرض قد يكون البنك مستفيداً. يتم التغيير عادة بملحق. التحديد الواضح يقلل النزاعات القانونية عند الدفع.",
  },
  broker: {
    term: "وسيط التأمين",
    shortDefinition:
      "وسيط مرخّص يمثل طالب التأمين ويتصرف باستقلال وحياد عند اختيار الشركات.",
    definition:
      "وسيط التأمين يمثل من يريد التأمين، ويتصرف باستقلال وحياد في اختيار شركات التأمين، ويتوسط في العروض والعقود. عمل الوكيل مع أكثر من شركة لا يجعله وسيطاً.",
  },
  "sigorta-acentesi": {
    term: "وكيل التأمين",
    shortDefinition:
      "وسيط يرتّب العقود باسم شركة التأمين أو يصدر الوثائق ضمن صلاحياته.",
    definition:
      "وكيل التأمين يعرّف بمنتجات الشركات المتعاقد معها ويتلقى العروض وينفّذ معاملات الوثائق ضمن صلاحياته. يمكن للوكلاء العمل مع أكثر من شركة. شركة GROSS SİGORTA ARACILIK HİZMETLERİ LİMİTED ŞİRKETİ وكيل تأمين مرخّص؛ وsigortauzmani.net منصة التأمين الرقمية التي يديرها هذا الوكيل.",
  },
};

const FA_TERMS: Record<string, TermCopy> = {
  muafiyet: {
    term: "فرانشیز",
    shortDefinition: "مبلغ یا سهمی که بیمه‌گذار هنگام خسارت از جیب خود می‌پردازد.",
    definition:
      "فرانشیز بخشی است که در بیمه‌نامه تعیین می‌شود و شرکت بیمه هنگام وقوع خسارت آن را پرداخت نمی‌کند. می‌تواند مبلغ ثابت (مثلاً ۵٫۰۰۰ لیر) یا درصدی از خسارت باشد. در بیمه‌نامه‌های دارای فرانشیز معمولاً حق بیمه کمتر است؛ در عوض در خسارت‌های کوچک بیمه‌گذار سهم بیشتری می‌دهد. هنگام مقایسه پیشنهادها مبلغ فرانشیز را همراه با پوشش بسنجید.",
  },
  imm: {
    term: "مسئولیت اختیاری (IMM)",
    shortDefinition:
      "پوشش مسئولیت اضافی که بالای سقف بیمه شخص ثالث اجباری می‌نشیند.",
    definition:
      "مسئولیت اختیاری بیمه‌ای اضافی است برای زیان مالی و جانی که از سقف قانونی بیمه شخص ثالث فراتر می‌رود. در تصادف سنگین غرامت طرف مقابل ممکن است از آن سقف بگذرد؛ این پوشش مابه‌التفاوت را تضمین می‌کند. گزینه‌های سقف بسته به شرکت فرق دارد. سقف بالا به‌ویژه در ترافیک شهری مهم است.",
  },
  "mini-onarim": {
    term: "تعمیر جزئی",
    shortDefinition:
      "رفع خط‌وخش، فرورفتگی و آسیب شیشه بدون استفاده از تخفیف عدم خسارت.",
    definition:
      "تعمیر جزئی خدمت رایجی در بیمه بدنه است که کارهایی مانند صافکاری بدون رنگ، رفع خط‌وخش کوچک و تعمیر چراغ یا شیشه را پوشش می‌دهد. معمولاً تخفیف عدم خسارت را خراب نمی‌کند و از شبکه خدمات سریع انجام می‌شود. دامنه، سقف تعداد و قطعات مشمول در هر بیمه‌نامه فرق دارد؛ هنگام پیشنهاد شرایط را بررسی کنید.",
  },
  "ikame-arac": {
    term: "خودروی جایگزین",
    shortDefinition: "خودروی موقت که تا پایان تعمیر در اختیار بیمه‌گذار گذاشته می‌شود.",
    definition:
      "خودروی جایگزین در بیمه بدنه تا زمانی که خودروی آسیب‌دیده در تعمیرگاه است در اختیار بیمه‌گذار است. مدت اجاره، کلاس و سقف کیلومتر به شرایط بیمه‌نامه بستگی دارد. این پوشش اغلب به‌صورت الحاقی انتخاب می‌شود یا در بعضی بسته‌ها هست. وقتی تعمیر طول می‌کشد، برای رانندگان شهری ارزشمند است.",
  },
  "rayic-bedel": {
    term: "ارزش روز",
    shortDefinition: "ارزش فعلی مال بر اساس شرایط بازار.",
    definition:
      "ارزش روز قیمت مال بیمه‌شده (معمولاً خودرو یا اثاثیه خانه) در زمان خسارت است. تصمیم خسارت کلی، غرامت سرقت و برخی خسارت‌های مسکن بر اساس آن گرفته می‌شود. در خودرو سال مدل، کارکرد، امکانات و تقاضا اثر دارد. فاصله مبلغ بیمه‌شده و ارزش روز می‌تواند بیمه‌کم یا بیمه‌زیاد ایجاد کند.",
  },
  pert: {
    term: "خسارت کلی",
    shortDefinition: "آسیب سنگینی که تعمیر خودرو دیگر اقتصادی نیست.",
    definition:
      "خسارت کلی وقتی است که هزینه تعمیر نسبت به ارزش روز خودرو بالاست و تعمیر به‌صرفه نیست. شرکت معمولاً ارزش روز منهای ارزش اسقاط را می‌پردازد. سابقه خسارت کلی روی ارزش دست‌دوم و قابلیت بیمه بعدی اثر می‌گذارد. خسارت کلی و گواهی اسقاط ممکن است آثار حقوقی متفاوتی داشته باشند.",
  },
  sovtaj: {
    term: "ارزش اسقاط",
    shortDefinition: "ارزش اقتصادی باقی‌مانده مال پس از خسارت (اوراق یا قطعه).",
    definition:
      "ارزش اسقاط ارزش باقی‌مانده مالی است که دیگر قابل استفاده قبلی نیست یا عمر اقتصادی‌اش تمام شده. در خودروی خسارت کلی ارزش اوراق است؛ پس از آتش‌سوزی ممکن است قطعات قابل استفاده باشد. در تسویه معمولاً از مبلغ بیمه یا ارزش روز کسر می‌شود. تعلق اسقاط به بیمه‌نامه و توافق خسارت بستگی دارد.",
  },
  zeyilname: {
    term: "الحاقیه",
    shortDefinition: "قرارداد الحاقی که تغییرات بیمه‌نامه موجود را ثبت می‌کند.",
    definition:
      "الحاقیه تغییراتی مانند نشانی، خودرو، سقف پوشش، راننده اضافه یا حق بیمه را در قرارداد جاری رسمی می‌کند. تغییرات معمولاً از تاریخ الحاقیه اجرا می‌شوند و ممکن است مابه‌التفاوت حق بیمه ایجاد شود. به‌روزرسانی‌نکردن بیمه‌نامه می‌تواند هنگام خسارت محل بحث پوشش شود؛ تغییرات مهم را به‌موقع الحاقیه کنید.",
  },
  rucu: {
    term: "رجوع",
    shortDefinition: "حق شرکت بیمه برای پس‌گرفتن مبلغ پرداختی از مقصر اصلی.",
    definition:
      "رجوع یعنی شرکت پس از پرداخت غرامت، مبلغ را از شخص ثالث مسبب زیان مطالبه کند. در تصادف ممکن است بیمه‌گر راننده مقصر باشد؛ در مسئولیت کارفرما طرف مربوط. اگر بیمه‌گذار خلاف شرایط عمل کرده باشد (مثلاً رانندگی مست)، شرکت می‌تواند به خود او هم رجوع کند. رجوع بُعد حقوقی پرونده خسارت است.",
  },
  "ferdi-kaza": {
    term: "بیمه حوادث انفرادی",
    shortDefinition: "پوشش فوت، ازکارافتادگی و هزینه درمان ناشی از حادثه.",
    definition:
      "بیمه حوادث انفرادی فوت، ازکارافتادگی دائم و در برخی بیمه‌نامه‌ها هزینه درمان ناشی از حادثه ناگهانی و خارجی را پوشش می‌دهد. بیماری معمولاً خارج از پوشش است. می‌تواند جداگانه یا به‌صورت پوشش اضافه در بسته‌های خودرو یا مسافرت باشد. سقف پوشش و طبقه شغلی مستقیماً روی حق بیمه اثر دارد.",
  },
  police: {
    term: "بیمه‌نامه",
    shortDefinition: "سند رسمی که شرایط قرارداد بیمه را شامل می‌شود.",
    definition:
      "بیمه‌نامه قرارداد کتبی بین بیمه‌گر و بیمه‌گذار است. پوشش‌ها، فرانشیز، مدت، حق بیمه، استثناها و تعهدات طرفین در آن می‌آید. تاریخ شروع و پایان و شرایط لازم‌الاجرا شدن پوشش نیز ذکر می‌شود. صرف صدور بیمه‌نامه کافی نیست؛ تاریخ شروع و شرایط پرداخت را هم بررسی کنید. مطالبه خسارت بر اساس مفاد بیمه‌نامه ارزیابی می‌شود.",
  },
  prim: {
    term: "حق بیمه",
    shortDefinition: "مبلغی که در ازای پوشش بیمه پرداخت می‌شود.",
    definition:
      "حق بیمه بهایی است که بیمه‌گذار در برابر ریسک پذیرفته‌شده شرکت می‌پردازد. در خودرو سن، مدل، شهر و سابقه عدم خسارت؛ در درمان سن و سابقه بیماری؛ در مسکن عمر بنا و موقعیت روی محاسبه اثر دارد. نقد یا اقساطی قابل پرداخت است. نپرداختن می‌تواند پوشش را معلق یا بیمه‌نامه را باطل کند.",
  },
  teminat: {
    term: "پوشش",
    shortDefinition: "تعهد شرکت بیمه برای جبران هنگام وقوع خسارت.",
    definition:
      "پوشش تعهد پرداخت یا ارائه خدمت شرکت است وقتی ریسک تعریف‌شده در بیمه‌نامه رخ دهد. به پوشش اصلی (مثلاً تصادف در بدنه) و پوشش‌های اضافه (خودروی جایگزین، شیشه، حوادث انفرادی) تقسیم می‌شود. موارد خارج از پوشش در استثناها آمده است. انتخاب محصول درست با بسته پوششی متناسب با نیاز شروع می‌شود.",
  },
  "trafik-sigortasi": {
    term: "بیمه شخص ثالث",
    shortDefinition: "بیمه مسئولیت اجباری که زیان وارد به دیگران را جبران می‌کند.",
    definition:
      "بیمه مسئولیت مالی اجباری (شخص ثالث) زیان مالی و جانی واردشده به دیگران را در سقف قانونی پوشش می‌دهد. خسارت خودروی خودتان معمولاً خارج است و به بیمه بدنه نیاز دارد. رانندگی بدون آن خلاف قانون است و جریمه دارد. وقتی سقف کافی نباشد، تکمیل با مسئولیت اختیاری توصیه می‌شود.",
  },
  kasko: {
    term: "بیمه بدنه",
    shortDefinition:
      "بیمه اختیاری که خسارت خودروی خودتان و برخی ریسک‌ها را پوشش می‌دهد.",
    definition:
      "بیمه بدنه پوشش اختیاری در برابر تصادف، سرقت، آتش‌سوزی، حوادث طبیعی و شکستن شیشه است. محتوای بسته بین شرکت‌ها فرق دارد؛ بدنه محدود و گسترده پوشش یکسانی ندارند. تخفیف عدم خسارت، فرانشیز و خدمات اضافه مانند تعمیر جزئی یا خودروی جایگزین روی حق بیمه و رضایت اثر می‌گذارد.",
  },
  hasarsizlik: {
    term: "تخفیف عدم خسارت",
    shortDefinition: "تخفیف حق بیمه بابت سال‌های بدون خسارت.",
    definition:
      "تخفیف عدم خسارت (یا سیستم پله) در تمدید بعدی اعمال می‌شود اگر در دوره بیمه‌نامه خسارتی استفاده نشده باشد. پله‌های شخص ثالث و بدنه متفاوت است. خسارت بزرگ ممکن است تخفیف را کم کند؛ تعمیر جزئی معمولاً اثر ندارد. انتقال حق تخفیف به قواعد شرکت و محصول بستگی دارد.",
  },
  "eksik-sigorta": {
    term: "بیمه‌کم",
    shortDefinition: "کمتر بودن مبلغ بیمه‌شده از ارزش واقعی مال.",
    definition:
      "بیمه‌کم وقتی است که مبلغ نوشته‌شده در بیمه‌نامه از ارزش روز کمتر باشد. تسویه اغلب نسبی است: نه کل خسارت، بلکه به نسبت مبلغ بیمه به ارزش واقعی پرداخت می‌شود. به‌روز نگه داشتن مبلغ خودرو و اثاثیه این ریسک را کم می‌کند.",
  },
  "asiri-sigorta": {
    term: "بیمه‌زیاد",
    shortDefinition: "بالاتر بودن مبلغ بیمه‌شده از ارزش واقعی مال.",
    definition:
      "بیمه‌زیاد وقتی است که مبلغ بیمه از ارزش روز بیشتر باشد. پرداخت از زیان واقعی یا ارزش روز فراتر نمی‌رود؛ حق بیمه اضافه ممکن است بخشی بازگردد. نوشتن مبلغ بالاتر عمداً مزیتی نمی‌دهد. مبلغ درست تعادل حق بیمه و غرامت را حفظ می‌کند.",
  },
  tazminat: {
    term: "غرامت",
    shortDefinition: "مبلغی که شرکت هنگام وقوع ریسک یا خسارت می‌پردازد.",
    definition:
      "غرامت جبران زیان بیمه‌گذار یا ذی‌نفع طبق شرایط بیمه‌نامه پس از رویداد مشمول پوشش است. می‌تواند نقدی، تعمیر، کالای جایگزین یا خدمت باشد. فرانشیز، اسقاط و بیمه‌کم روی مبلغ نهایی اثر می‌گذارند.",
  },
  istisna: {
    term: "استثنا",
    shortDefinition: "مواردی که صریحاً از پوشش بیمه‌نامه خارج شده‌اند.",
    definition:
      "استثناها حالاتی را مشخص می‌کنند که شرکت پرداخت نمی‌کند. جنگ، ریسک هسته‌ای، رانندگی مست یا استفاده اظهارنشده نمونه‌های رایج‌اند. شرایط عمومی و خصوصی باید با هم خوانده شوند. دانستن فهرست استثنا هنگام پیشنهاد از رد غیرمنتظره جلوگیری می‌کند.",
  },
  beyan: {
    term: "تعهد اظهار",
    shortDefinition: "الزام بیمه‌گذار به دادن اطلاعات درست و کامل درباره ریسک.",
    definition:
      "تعهد اظهار ایجاب می‌کند اطلاعاتی که بر ارزیابی ریسک اثر دارد در مرحله پیشنهاد و قرارداد درست داده شود. اظهار نادرست یا ناقص می‌تواند غرامت را کم یا بیمه‌نامه را باطل کند. نحوه استفاده خودرو، سابقه درمان و ویژگی‌های بنا موضوعات رایج اظهارند.",
  },
  dask: {
    term: "بیمه زلزله اجباری",
    shortDefinition: "بیمه اجباری زلزله که مسکن را در برابر زلزله و خسارت وابسته پوشش می‌دهد.",
    definition:
      "DASK (نهاد بیمه حوادث طبیعی) مسکن را در برابر زلزله و آتش‌سوزی، انفجار، سونامی و رانش ناشی از آن اجباری پوشش می‌دهد. مبلغ بر اساس هزینه بازسازی محاسبه می‌شود؛ اثاثیه معمولاً خارج است. برای سند و اشتراک برق بیمه‌نامه DASK لازم است. بیمه مسکن اختیاری بالای DASK را تکمیل می‌کند.",
  },
  "konut-sigortasi": {
    term: "بیمه مسکن",
    shortDefinition:
      "بیمه اختیاری برای بنا و اثاثیه در برابر آتش‌سوزی، سرقت، سیل و ریسک‌های مشابه.",
    definition:
      "بیمه مسکن ریسک‌هایی را که DASK پوشش نمی‌دهد — آتش‌سوزی، سرقت، شیشه، لوازم الکترونیک، حوادث انفرادی و مسئولیت — به‌صورت بسته ارائه می‌کند. مبلغ بنا و اثاثیه جداگانه تعیین می‌شود. پوشش زلزله اغلب روی DASK یا به‌صورت یکپارچه تنظیم می‌شود. مبلغ واقع‌بینانه اثاثیه از بیمه‌کم جلوگیری می‌کند.",
  },
  "tamamlayici-saglik": {
    term: "بیمه درمان تکمیلی",
    shortDefinition:
      "بیمه درمانی که مابه‌التفاوت بیمارستان خصوصی طرف قرارداد تأمین اجتماعی را می‌پردازد.",
    definition:
      "بیمه درمان تکمیلی مابه‌التفاوت قابل پرداخت در بیمارستان‌های خصوصی طرف قرارداد سازمان تأمین اجتماعی را در سقف بیمه‌نامه پوشش می‌دهد. بسته‌های بستری و سرپایی وجود دارد. دوره انتظار، شبکه و محدوده جغرافیایی متفاوت است. حق بیمه معمولاً از درمان خصوصی کمتر است.",
  },
  "ozel-saglik": {
    term: "بیمه درمان خصوصی",
    shortDefinition: "پوشش درمانی گسترده در بیمارستان و کلینیک خصوصی.",
    definition:
      "بیمه درمان خصوصی درمان سرپایی و بستری در مراکز طرف قرارداد را، با پوشش‌های اضافه‌ای مانند چکاپ، زایمان و دندان در برخی طرح‌ها، فراهم می‌کند. حق بیمه به سن، جنسیت، اظهار سلامت و طرح انتخابی بستگی دارد. بیماری‌های ازپیش‌موجود ممکن است دوره انتظار یا استثنا داشته باشند. گستره شبکه مستقیماً روی کیفیت خدمت اثر دارد.",
  },
  "seyahat-saglik": {
    term: "بیمه درمان مسافرت",
    shortDefinition:
      "بیمه‌نامه‌ای که هزینه بیماری و حادثه ناگهانی در سفر داخلی یا خارجی را می‌پردازد.",
    definition:
      "بیمه درمان مسافرت فوریت پزشکی، بستری، دارو و در برخی محصولات لغو پرواز یا بار را پوشش می‌دهد. ویزای شنگن بیمه سفر با سقف مشخص می‌خواهد. مدت بیمه‌نامه باید با تاریخ سفر هم‌خوان باشد؛ با پایان مدت پوشش تمام می‌شود.",
  },
  "yesil-kart": {
    term: "کارت سبز",
    shortDefinition:
      "مدرک بین‌المللی مسئولیت شخص ثالث هنگام رانندگی در خارج از کشور.",
    definition:
      "کارت سبز سند بین‌المللی پوشش مسئولیت اجباری در کشورهای خارجی هنگام خروج از ترکیه است. کشورهای معتبر روی کارت نوشته شده. به بیمه شخص ثالث مرتبط است اما هر بیمه‌نامه خودکار کارت سبز نمی‌دهد؛ معمولاً باید پیش از سفر خارجی صادر شود.",
  },
  "agir-kusur": {
    term: "تقصیر سنگین",
    shortDefinition: "سهل‌انگاری یا تخلف جدی که می‌تواند غرامت را تحت تأثیر بگذارد.",
    definition:
      "تقصیر سنگین رفتاری است که آن‌قدر خلاف قواعد باشد که پوشش را تضعیف کند. رانندگی مست، بدون گواهینامه یا به‌خطر انداختن عمدی نمونه‌های رایج‌اند. شرکت ممکن است پرداخت را رد کند یا پس از پرداخت رجوع کند. تعریف تقصیر در شرایط عمومی بیمه‌نامه الزام‌آور است.",
  },
  "hasar-dosyasi": {
    term: "پرونده خسارت",
    shortDefinition: "سابقه رسمی از اعلام خسارت تا تصمیم پرداخت یا رد.",
    definition:
      "پرونده خسارت شامل اعلام، کارشناسی، جمع‌آوری مدارک، تصمیم تعمیر یا خسارت کلی و پرداخت غرامت است. کمبود مدرک پرونده را طولانی می‌کند. عکس، صورت‌جلسه، گواهینامه، سند خودرو و فاکتور از مدارک پرتقاضا هستند. کارگزار یا نماینده می‌تواند بیمه‌گذار را نمایندگی کند و روند را تسریع دهد.",
  },
  ekspertiz: {
    term: "کارشناسی خسارت",
    shortDefinition: "تعیین علت، دامنه و مبلغ خسارت توسط کارشناس.",
    definition:
      "کارشناسی گزارشی است که کارشناس شرکت یا کارشناس مستقل در محل یا از روی پرونده تهیه می‌کند. روش تعمیر، قطعه، اجرت و اسقاط بر آن استوار است. در اختلاف ممکن است کارشناسی دوم یا داوری مطرح شود. کارشناسی دقیق و به‌موقع برای غرامت عادلانه حیاتی است.",
  },
  "anlasmali-servis": {
    term: "تعمیرگاه طرف قرارداد",
    shortDefinition: "شبکه تعمیر که با شرایط ویژه با شرکت بیمه کار می‌کند.",
    definition:
      "تعمیرگاه‌های طرف قرارداد کارگاه‌های مجاز یا خصوصی وابسته به شرکت‌اند. معمولاً مزیت فرانشیز، تأیید سریع‌تر و ضمانت قطعه اصلی یا معادل می‌دهند. تعمیرگاه غیرطرف‌قرارداد ممکن است طولانی‌تر شود و سهم بیمه‌گذار بالا برود. کیفیت شبکه هنگام انتخاب بیمه بدنه معیار مهمی است.",
  },
  yenileme: {
    term: "تمدید",
    shortDefinition: "ادامه بیمه‌نامه در پایان مدت با شرایط قبلی یا به‌روزشده.",
    definition:
      "تمدید حفظ پوشش در پایان مدت بیمه‌نامه است. حق بیمه بر اساس سابقه خسارت، تعرفه و تورم دوباره محاسبه می‌شود. در بیمه درمان حق تمدید تضمینی حقی حیاتی است. مقایسه پیشنهاد تمدید پیش از سررسید خطر بدون پوشش ماندن را کم می‌کند.",
  },
  iptal: {
    term: "ابطال بیمه‌نامه",
    shortDefinition: "پایان قرارداد پیش از سررسید و قواعد استرداد حق بیمه.",
    definition:
      "ابطال ممکن است به درخواست بیمه‌گذار، به‌خاطر نپرداختن حق بیمه یا تخلف اظهار باشد. مبلغ استرداد به روزهای استفاده‌شده، خسارت و نوع محصول بستگی دارد. در شخص ثالث اجباری موارد خاصی مانند انتقال پلاک یا اوراق وجود دارد. پیش از ابطال ریسک بدون پوشش ماندن را بسنجید.",
  },
  lehtar: {
    term: "ذی‌نفع",
    shortDefinition: "شخص یا نهادی که برای دریافت غرامت بیمه معرفی شده است.",
    definition:
      "ذی‌نفع طرفی است که در بیمه‌نامه برای دریافت غرامت نام برده شده. تعیین ذی‌نفع در محصولات عمر و حوادث انفرادی رایج است؛ در بیمه‌های متصل به وام بانک می‌تواند ذی‌نفع باشد. تغییر معمولاً با الحاقیه انجام می‌شود. تعریف روشن ذی‌نفع اختلاف حقوقی هنگام پرداخت را کم می‌کند.",
  },
  broker: {
    term: "کارگزار بیمه",
    shortDefinition:
      "واسطه مجاز که خریدار را نمایندگی می‌کند و در انتخاب شرکت مستقل و بی‌طرف عمل می‌کند.",
    definition:
      "کارگزار بیمه کسی را که می‌خواهد بیمه بخرد نمایندگی می‌کند، در انتخاب شرکت‌های بیمه مستقل و بی‌طرف است و در پیشنهاد و قرارداد واسطه می‌شود. کار کردن نماینده با چند شرکت او را کارگزار نمی‌کند.",
  },
  "sigorta-acentesi": {
    term: "نماینده بیمه",
    shortDefinition:
      "واسطه‌ای که از طرف شرکت بیمه در انعقاد قرارداد میانجی می‌شود یا در حدود اختیار بیمه‌نامه صادر می‌کند.",
    definition:
      "نماینده بیمه محصولات شرکت‌های طرف قرارداد را معرفی می‌کند، پیشنهاد می‌گیرد و عملیات بیمه‌نامه را در حدود اختیار انجام می‌دهد. نمایندگان می‌توانند با چند شرکت کار کنند. GROSS SİGORTA ARACILIK HİZMETLERİ LİMİTED ŞİRKETİ نماینده رسمی بیمه است؛ sigortauzmani.net سکوی دیجیتال بیمه‌ای است که این نماینده اداره می‌کند.",
  },
};

const TERMS: Record<Exclude<Locale, "tr">, Record<string, TermCopy>> = {
  en: EN_TERMS,
  ar: AR_TERMS,
  fa: FA_TERMS,
};

export const GLOSSARY: Record<Locale, GlossaryMessages> = {
  tr: TR,
  en: EN,
  ar: AR,
  fa: FA,
};

export function localizedGlossaryTerms(locale: Locale): GlossaryTerm[] {
  if (locale === "tr") return glossaryTerms;
  const copy = TERMS[locale];
  return glossaryTerms.map((term) => {
    const translated = copy[term.slug];
    return translated ? { ...term, ...translated } : term;
  });
}

export function localizedCategoryLabels(
  locale: Locale,
): Record<GlossaryCategory, string> {
  return GLOSSARY[locale].categories;
}

export function localizedPopularTerms(locale: Locale): GlossaryTerm[] {
  return localizedGlossaryTerms(locale).filter((term) => term.popular);
}
