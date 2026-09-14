import type { Locale } from "./locales";

export interface FlowMessages {
  runQuote: string;
  running: string;
  preparing: string;
  preparingMsgs: [string, string, string, string];
  preparingNot: string;
  select: string;
  vehicleTitle: string;
  daskTitle: string;
  travelTitle: string;
  toManual: string;
  instantUnavailable: string;
  fallbackText: string;
  policyReady: string;
  paymentReceived: string;
  policyNo: string;
  txnNo: string;
  paidCard: string;
  downloadPolicy: string;
  downloadReceipt: string;
  editDetails: string;
  close: string;
  /**
   * Araç bilgileri girilirken acente defterinde aynı kişi ve araç için
   * teklif bulunduğunda çıkan bilgilendirme. Partner CRM'indeki "Teklif
   * Bilgi" diyalogunun karşılığı; ama eski teklifle devam seçeneği yok, tek
   * çıkış yeni teklif çalıştırmak.
   */
  reworkedDialog: {
    title: string;
    body: string;
    /** Teklif tarihi bilindiğinde kullanılan metin; `{date}` ile. */
    bodyDated: string;
    /** Tek düğme: yeni teklif çalıştır. */
    acknowledge: string;
  };
  brans: {
    trafik: string;
    kasko: string;
    dask: string;
    travel: string;
    imm: string;
  };
  travel: {
    region: string;
    country: string;
    city: string;
    plan: string;
    reason: string;
    depart: string;
    return: string;
    planNarrow: string;
    planWide: string;
    scopeSchengen: string;
    scopeWorld: string;
    scopeDomestic: string;
    reasonTourist: string;
    reasonEducation: string;
    reasonBusiness: string;
    errCountry: string;
    errCity: string;
    errDepart: string;
    errReturn: string;
    errReturnBefore: string;
    errDepartPast: string;
  };
  offers: {
    empty: string;
    authorization: string;
    none: string;
    best: string;
    pdf: string;
    quoteTime: string;
    buy: string;
    request: string;
    sending: string;
    disclaimer: string;
    cash: string;
    installments: string;
  };
  pay: {
    title: string;
    processing: string;
    processingNot: string;
    goPay: string;
    leadExternal: string;
    leadInternal: string;
    bullet1: string;
    bullet2: string;
    link: string;
    openPage: string;
    goToPay: string;
    popupBlocked: string;
    cardLead: string;
    cardholder: string;
    idNo: string;
    cardNo: string;
    month: string;
    year: string;
    cvv: string;
    complete: string;
    /** Şirket primi güncellediğinde onay düğmesi. */
    approveNew: string;
    errName: string;
    errCard: string;
    errExpiry: string;
    errCvv: string;
    errFail: string;
    msgs: [string, string, string];
  };
}

const TR: FlowMessages = {
  runQuote: "Teklif çalış",
  running: "Teklifler çalışıyor…",
  preparing: "Teklifleriniz hazırlanıyor",
  preparingMsgs: [
    "Bilgileriniz doğrulanıyor.",
    "Anlaşmalı sigorta şirketlerine teklif talebiniz iletiliyor.",
    "Şirketlerden gelen prim ve teminatlar karşılaştırılıyor.",
    "Size en uygun teklifler fiyat sırasıyla listeleniyor.",
  ],
  preparingNot:
    "Teklifler geldikçe aşağıdaki listeye eklenir. Bu işlem genellikle bir dakikadan kısa sürer; sayfada kalmanız yeterli.",
  select: "Seçin",
  vehicleTitle: "Araç bilgileri",
  daskTitle: "Bina bilgileri",
  travelTitle: "Seyahat bilgileri",
  toManual: "Teklif formuna geç",
  instantUnavailable: "Şu anda anında teklif alınamıyor",
  fallbackText:
    "Bilgilerinizi bırakırsanız uzmanlarımız sizin için teklifleri hazırlayıp en kısa sürede arar. Girdiğiniz bilgiler kaybolmadı, formda yeniden girmeniz gerekecek.",
  policyReady: "Poliçeniz hazır",
  paymentReceived: "Ödemeniz alındı ve poliçeniz düzenlendi.",
  policyNo: "Poliçe numarası",
  txnNo: "İşlem numarası",
  paidCard: "Ödenen kart",
  downloadPolicy: "Poliçeyi indir",
  downloadReceipt: "Ödeme makbuzunu indir",
  editDetails: "Bilgileri düzenle",
  close: "Kapat",
  reworkedDialog: {
    title: "Teklif bilgisi",
    body:
      "Bu bilgilerle daha önce teklif çalışılmış. Yeni teklifte tanzim tarihi değiştiği için sigorta şirketlerinin fiyatları da değişebilir; güncel fiyatlar yeniden alınacak. Yeni teklifin başlangıcı mevcut poliçenizin bitişine göre belirlenir.",
    bodyDated:
      "{date} tarihinde bu bilgilerle teklif çalışılmış. Yeni teklifte tanzim tarihi değiştiği için sigorta şirketlerinin fiyatları da değişebilir; güncel fiyatlar yeniden alınacak. Yeni teklifin başlangıcı mevcut poliçenizin bitişine göre belirlenir.",
    acknowledge: "Anladım, yeni teklif çalış",
  },
  brans: {
    trafik: "Trafik Sigortası",
    kasko: "Kasko",
    dask: "DASK",
    travel: "Seyahat Sağlık",
    imm: "İMM",
  },
  travel: {
    region: "Seyahat bölgesi",
    country: "Gidilecek ülke",
    city: "Gidilecek il",
    plan: "Plan",
    reason: "Seyahat sebebi",
    depart: "Gidiş tarihi",
    return: "Dönüş tarihi",
    planNarrow: "Dar paket",
    planWide: "Geniş paket",
    scopeSchengen: "Avrupa / Schengen",
    scopeWorld: "Tüm dünya",
    scopeDomestic: "Yurt içi",
    reasonTourist: "Turistik gezi",
    reasonEducation: "Eğitim",
    reasonBusiness: "İş seyahati",
    errCountry: "Gidilecek ülkeyi seçin.",
    errCity: "Gidilecek ili seçin.",
    errDepart: "Gidiş tarihini seçin.",
    errReturn: "Dönüş tarihini seçin.",
    errReturnBefore: "Dönüş tarihi gidiş tarihinden önce olamaz.",
    errDepartPast: "Gidiş tarihi bugünden önce olamaz.",
  },
  offers: {
    empty:
      "Şu anda bu bilgilerle anında satın alınabilir teklif çıkmadı. Ekibimiz sizin için manuel olarak çalışabilir.",
    authorization:
      "{n} şirket fiyatı için sigorta şirketinin ayrıca onayı gerekiyor, bu yüzden burada listelenmiyor. Bu teklifleri isterseniz ekibimiz sizin için takip edebilir.",
    none: "Bu üründe teklif gelmedi.",
    best: "En uygun",
    pdf: "Teklif PDF'i",
    quoteTime: "Teklif zamanı",
    buy: "Satın al",
    request: "Teklif iste",
    sending: "Gönderiliyor…",
    disclaimer:
      "Listelenen tutarlar sigorta şirketlerinden gelen tekliflerdir ve poliçe değildir. Sigorta şirketi, poliçeleştirme sırasında yaptığı son kontrole göre teklifi güncelleyebilir veya kabul etmeyebilir.",
    cash: "Peşin",
    installments: "{n} Taksit",
  },
  pay: {
    title: "Ödeme",
    processing: "Ödemeniz işleniyor",
    processingNot:
      "Lütfen bu ekranı kapatmayın. İşlem tamamlandığında poliçeniz ve makbuzunuz görüntülenecek.",
    goPay: "Ödemeye geçin",
    leadExternal: "{company} ödeme sayfası yeni sekmede açılacak.",
    leadInternal: "Ödemeyi {company} üzerinden tamamlayacaksınız.",
    bullet1: "Kart bilgilerinizi sonraki ekranda girersiniz.",
    bullet2: "Kart numaranız ve CVV burada saklanmaz.",
    link: "Bağlantı",
    openPage: "Ödeme sayfasını aç",
    goToPay: "Ödemeye geç",
    popupBlocked:
      "Ödeme ekranı açılamadı. Tarayıcınızın açılır pencere engelini kapatıp tekrar deneyin.",
    cardLead:
      "Kart bilgileriniz sigorta şirketinin sanal POS’una iletilir; burada saklanmaz.",
    cardholder: "Kart sahibi adı soyadı",
    idNo: "Kimlik numarası",
    cardNo: "Kredi kartı numarası",
    month: "Ay",
    year: "Yıl",
    cvv: "CVV",
    complete: "Ödemeyi tamamla",
    approveNew: "Yeni tutarı onayla ve öde",
    errName: "Kart sahibinin adını girin.",
    errCard: "Kart numarasını eksiksiz girin.",
    errExpiry: "Son kullanma tarihini seçin.",
    errCvv: "Güvenlik kodunu girin.",
    errFail: "Ödeme tamamlanamadı. Lütfen tekrar deneyin.",
    msgs: [
      "Ödeme talebiniz sigorta şirketine iletiliyor.",
      "Kart bilgileriniz sanal POS altyapısında doğrulanıyor.",
      "Poliçeniz düzenleniyor ve belgeleriniz hazırlanıyor.",
    ],
  },
};

const EN: FlowMessages = {
  runQuote: "Get quotes",
  running: "Fetching quotes…",
  preparing: "Your quotes are being prepared",
  preparingMsgs: [
    "Your details are being verified.",
    "Your request is being sent to partner insurers.",
    "Incoming premiums and covers are being compared.",
    "The best quotes are being listed by price.",
  ],
  preparingNot:
    "Quotes are added to the list below as they arrive. This usually takes under a minute; stay on the page.",
  select: "Select",
  vehicleTitle: "Vehicle details",
  daskTitle: "Building details",
  travelTitle: "Travel details",
  toManual: "Switch to quote form",
  instantUnavailable: "Instant quotes are not available right now",
  fallbackText:
    "If you leave your details, our team will prepare quotes and call you shortly. The details you entered were not lost, but you will need to enter them again on the form.",
  policyReady: "Your policy is ready",
  paymentReceived: "Your payment was received and the policy was issued.",
  policyNo: "Policy number",
  txnNo: "Transaction number",
  paidCard: "Card charged",
  downloadPolicy: "Download policy",
  downloadReceipt: "Download payment receipt",
  editDetails: "Edit details",
  close: "Close",
  reworkedDialog: {
    title: "Quote information",
    body:
      "A quote was already run with these details. The new quote has a new issue date, so insurer prices may differ; current prices will be fetched again. The new quote starts when your existing policy ends.",
    bodyDated:
      "A quote was already run with these details on {date}. The new quote has a new issue date, so insurer prices may differ; current prices will be fetched again. The new quote starts when your existing policy ends.",
    acknowledge: "Got it, run a new quote",
  },
  brans: {
    trafik: "Motor Third Party Liability",
    kasko: "Casco",
    dask: "DASK",
    travel: "Travel Health",
    imm: "Excess Liability",
  },
  travel: {
    region: "Travel region",
    country: "Destination country",
    city: "Destination city",
    plan: "Plan",
    reason: "Travel purpose",
    depart: "Departure date",
    return: "Return date",
    planNarrow: "Basic pack",
    planWide: "Wide pack",
    scopeSchengen: "Europe / Schengen",
    scopeWorld: "Worldwide",
    scopeDomestic: "Domestic",
    reasonTourist: "Tourism",
    reasonEducation: "Education",
    reasonBusiness: "Business trip",
    errCountry: "Select the destination country.",
    errCity: "Select the destination city.",
    errDepart: "Select the departure date.",
    errReturn: "Select the return date.",
    errReturnBefore: "Return date cannot be before departure.",
    errDepartPast: "Departure date cannot be before today.",
  },
  offers: {
    empty:
      "No instantly purchasable quote came back with these details. Our team can work on it manually for you.",
    authorization:
      "{n} insurer prices need extra company approval, so they are not listed here. Our team can follow those quotes if you want.",
    none: "No quote arrived for this product.",
    best: "Best value",
    pdf: "Quote PDF",
    quoteTime: "Quote time",
    buy: "Buy",
    request: "Request quote",
    sending: "Sending…",
    disclaimer:
      "Listed amounts are quotes from insurers, not policies. The insurer may update or decline the quote after its final check at issuance.",
    cash: "In full",
    installments: "{n} instalments",
  },
  pay: {
    title: "Payment",
    processing: "Your payment is being processed",
    processingNot:
      "Please do not close this screen. Your policy and receipt will appear when the process is complete.",
    goPay: "Continue to payment",
    leadExternal: "The {company} payment page will open in a new tab.",
    leadInternal: "You will complete payment through {company}.",
    bullet1: "You enter card details on the next screen.",
    bullet2: "Your card number and CVV are not stored here.",
    link: "Link",
    openPage: "Open payment page",
    goToPay: "Continue to payment",
    popupBlocked:
      "The payment screen could not be opened. Disable your browser’s pop-up blocker and try again.",
    cardLead:
      "Your card details are sent to the insurer’s virtual POS and are not stored here.",
    cardholder: "Cardholder name",
    idNo: "ID number",
    cardNo: "Card number",
    month: "Month",
    year: "Year",
    cvv: "CVV",
    complete: "Complete payment",
    approveNew: "Approve the new amount and pay",
    errName: "Enter the cardholder’s name.",
    errCard: "Enter the full card number.",
    errExpiry: "Select the expiry date.",
    errCvv: "Enter the security code.",
    errFail: "Payment could not be completed. Please try again.",
    msgs: [
      "Your payment request is being sent to the insurer.",
      "Your card details are being verified on the virtual POS.",
      "Your policy is being issued and your documents prepared.",
    ],
  },
};

const AR: FlowMessages = {
  runQuote: "اطلب العروض",
  running: "جارٍ جلب العروض…",
  preparing: "يتم إعداد عروضكم",
  preparingMsgs: [
    "يتم التحقق من بياناتكم.",
    "يُرسل طلبكم إلى شركات التأمين الشريكة.",
    "تتم مقارنة الأقساط والتغطيات الواردة.",
    "تُدرج أنسب العروض حسب السعر.",
  ],
  preparingNot:
    "تُضاف العروض إلى القائمة أدناه فور وصولها. يستغرق ذلك عادة أقل من دقيقة؛ ابقوا في الصفحة.",
  select: "اختروا",
  vehicleTitle: "بيانات المركبة",
  daskTitle: "بيانات المبنى",
  travelTitle: "بيانات السفر",
  toManual: "الانتقال إلى نموذج العرض",
  instantUnavailable: "العروض الفورية غير متاحة حالياً",
  fallbackText:
    "إذا تركتم بياناتكم يعدّ فريقنا العروض ويتصل بكم قريباً. البيانات التي أدخلتموها لم تُفقد لكنكم ستعيدون إدخالها في النموذج.",
  policyReady: "وثيقتكم جاهزة",
  paymentReceived: "تم استلام الدفع وإصدار الوثيقة.",
  policyNo: "رقم الوثيقة",
  txnNo: "رقم العملية",
  paidCard: "البطاقة المستخدمة",
  downloadPolicy: "تنزيل الوثيقة",
  downloadReceipt: "تنزيل إيصال الدفع",
  editDetails: "تعديل البيانات",
  close: "إغلاق",
  reworkedDialog: {
    title: "معلومات العرض",
    body:
      "سبق أن أُعدّ عرض بهذه البيانات. للعرض الجديد تاريخ إصدار جديد، لذلك قد تختلف أسعار شركات التأمين؛ وسنحصل على الأسعار الحالية من جديد. يبدأ العرض الجديد عند انتهاء بوليصتكم الحالية.",
    bodyDated:
      "سبق أن أُعدّ عرض بهذه البيانات في {date}. للعرض الجديد تاريخ إصدار جديد، لذلك قد تختلف أسعار شركات التأمين؛ وسنحصل على الأسعار الحالية من جديد. يبدأ العرض الجديد عند انتهاء بوليصتكم الحالية.",
    acknowledge: "فهمت، أعدّوا عرضاً جديداً",
  },
  brans: {
    trafik: "تأمين المرور",
    kasko: "كاسكو",
    dask: "داسك",
    travel: "تأمين السفر الصحي",
    imm: "المسؤولية الزائدة",
  },
  travel: {
    region: "منطقة السفر",
    country: "بلد الوجهة",
    city: "مدينة الوجهة",
    plan: "الخطة",
    reason: "سبب السفر",
    depart: "تاريخ المغادرة",
    return: "تاريخ العودة",
    planNarrow: "باقة أساسية",
    planWide: "باقة واسعة",
    scopeSchengen: "أوروبا / شنغن",
    scopeWorld: "جميع أنحاء العالم",
    scopeDomestic: "داخل البلاد",
    reasonTourist: "رحلة سياحية",
    reasonEducation: "تعليم",
    reasonBusiness: "رحلة عمل",
    errCountry: "اختاروا بلد الوجهة.",
    errCity: "اختاروا مدينة الوجهة.",
    errDepart: "اختاروا تاريخ المغادرة.",
    errReturn: "اختاروا تاريخ العودة.",
    errReturnBefore: "لا يمكن أن يكون تاريخ العودة قبل المغادرة.",
    errDepartPast: "لا يمكن أن يكون تاريخ المغادرة قبل اليوم.",
  },
  offers: {
    empty:
      "لم يصدر عرض قابل للشراء الفوري بهذه البيانات. يمكن لفريقنا العمل يدوياً من أجلكم.",
    authorization:
      "تحتاج أسعار {n} شركات إلى موافقة إضافية من شركة التأمين لذلك لا تُدرج هنا. يمكن لفريقنا متابعة تلك العروض إن رغبتم.",
    none: "لم يصل عرض لهذا المنتج.",
    best: "الأنسب",
    pdf: "ملف العرض PDF",
    quoteTime: "وقت العرض",
    buy: "اشتروا",
    request: "اطلبوا عرضاً",
    sending: "جارٍ الإرسال…",
    disclaimer:
      "المبالغ المدرجة عروض من شركات التأمين وليست وثائق. قد تحدّث الشركة العرض أو ترفضه بعد الفحص النهائي عند الإصدار.",
    cash: "نقداً",
    installments: "{n} أقساط",
  },
  pay: {
    title: "الدفع",
    processing: "جارٍ معالجة الدفع",
    processingNot:
      "يرجى عدم إغلاق هذه الشاشة. ستظهر الوثيقة والإيصال عند اكتمال العملية.",
    goPay: "انتقلوا إلى الدفع",
    leadExternal: "ستُفتح صفحة دفع {company} في تبويب جديد.",
    leadInternal: "ستكملون الدفع عبر {company}.",
    bullet1: "تُدخلون بيانات البطاقة في الشاشة التالية.",
    bullet2: "لا يُحفظ رقم البطاقة ورمز CVV هنا.",
    link: "الرابط",
    openPage: "افتحوا صفحة الدفع",
    goToPay: "انتقلوا إلى الدفع",
    popupBlocked:
      "تعذر فتح شاشة الدفع. عطّلوا مانع النوافذ المنبثقة وحاولوا مرة أخرى.",
    cardLead:
      "تُرسل بيانات البطاقة إلى نقطة البيع الافتراضية لشركة التأمين ولا تُحفظ هنا.",
    cardholder: "اسم حامل البطاقة",
    idNo: "رقم الهوية",
    cardNo: "رقم بطاقة الائتمان",
    month: "الشهر",
    year: "السنة",
    cvv: "CVV",
    complete: "أكملوا الدفع",
    approveNew: "وافقوا على المبلغ الجديد وادفعوا",
    errName: "أدخلوا اسم حامل البطاقة.",
    errCard: "أدخلوا رقم البطاقة كاملاً.",
    errExpiry: "اختاروا تاريخ الانتهاء.",
    errCvv: "أدخلوا رمز الأمان.",
    errFail: "تعذر إكمال الدفع. حاولوا مرة أخرى.",
    msgs: [
      "يُرسل طلب الدفع إلى شركة التأمين.",
      "يتم التحقق من بيانات البطاقة في نقطة البيع الافتراضية.",
      "تُصدر الوثيقة وتُعدّ مستنداتكم.",
    ],
  },
};

const FA: FlowMessages = {
  runQuote: "پیشنهاد بگیرید",
  running: "در حال دریافت پیشنهادها…",
  preparing: "پیشنهادهای شما آماده می‌شود",
  preparingMsgs: [
    "اطلاعات شما در حال تأیید است.",
    "درخواست به شرکت‌های بیمه شریک ارسال می‌شود.",
    "حق‌بیمه و پوشش‌های دریافتی مقایسه می‌شود.",
    "مناسب‌ترین پیشنهادها به ترتیب قیمت فهرست می‌شود.",
  ],
  preparingNot:
    "پیشنهادها به‌محض رسیدن به فهرست زیر اضافه می‌شوند. معمولاً کمتر از یک دقیقه طول می‌کشد؛ در صفحه بمانید.",
  select: "انتخاب کنید",
  vehicleTitle: "اطلاعات خودرو",
  daskTitle: "اطلاعات ساختمان",
  travelTitle: "اطلاعات سفر",
  toManual: "رفتن به فرم پیشنهاد",
  instantUnavailable: "پیشنهاد فوری فعلاً در دسترس نیست",
  fallbackText:
    "اگر اطلاعات را بگذارید تیم ما پیشنهادها را آماده می‌کند و به‌زودی تماس می‌گیرد. اطلاعات واردشده از بین نرفته اما باید دوباره در فرم وارد شود.",
  policyReady: "بیمه‌نامه شما آماده است",
  paymentReceived: "پرداخت دریافت و بیمه‌نامه صادر شد.",
  policyNo: "شماره بیمه‌نامه",
  txnNo: "شماره تراکنش",
  paidCard: "کارت پرداخت‌شده",
  downloadPolicy: "دانلود بیمه‌نامه",
  downloadReceipt: "دانلود رسید پرداخت",
  editDetails: "ویرایش اطلاعات",
  close: "بستن",
  reworkedDialog: {
    title: "اطلاعات پیشنهاد",
    body:
      "با این اطلاعات پیش‌تر پیشنهاد گرفته شده است. پیشنهاد جدید تاریخ صدور جدیدی دارد، بنابراین قیمت شرکت‌های بیمه می‌تواند تغییر کند؛ قیمت‌های به‌روز دوباره دریافت می‌شود. شروع پیشنهاد جدید با پایان بیمه‌نامه فعلی شما تعیین می‌گردد.",
    bodyDated:
      "در تاریخ {date} با این اطلاعات پیشنهاد گرفته شده است. پیشنهاد جدید تاریخ صدور جدیدی دارد، بنابراین قیمت شرکت‌های بیمه می‌تواند تغییر کند؛ قیمت‌های به‌روز دوباره دریافت می‌شود. شروع پیشنهاد جدید با پایان بیمه‌نامه فعلی شما تعیین می‌گردد.",
    acknowledge: "متوجه شدم، پیشنهاد جدید بگیرید",
  },
  brans: {
    trafik: "بیمه شخص ثالث",
    kasko: "بیمه بدنه",
    dask: "بیمه زلزله",
    travel: "بیمه درمان مسافرت",
    imm: "مسئولیت مازاد",
  },
  travel: {
    region: "منطقه سفر",
    country: "کشور مقصد",
    city: "شهر مقصد",
    plan: "طرح",
    reason: "دلیل سفر",
    depart: "تاریخ رفت",
    return: "تاریخ برگشت",
    planNarrow: "بسته محدود",
    planWide: "بسته گسترده",
    scopeSchengen: "اروپا / شنگن",
    scopeWorld: "سراسر جهان",
    scopeDomestic: "داخل کشور",
    reasonTourist: "سفر گردشگری",
    reasonEducation: "تحصیل",
    reasonBusiness: "سفر کاری",
    errCountry: "کشور مقصد را انتخاب کنید.",
    errCity: "شهر مقصد را انتخاب کنید.",
    errDepart: "تاریخ رفت را انتخاب کنید.",
    errReturn: "تاریخ برگشت را انتخاب کنید.",
    errReturnBefore: "تاریخ برگشت نمی‌تواند قبل از رفت باشد.",
    errDepartPast: "تاریخ رفت نمی‌تواند قبل از امروز باشد.",
  },
  offers: {
    empty:
      "با این اطلاعات پیشنهاد قابل خرید فوری نیامد. تیم ما می‌تواند به‌صورت دستی برایتان کار کند.",
    authorization:
      "قیمت {n} شرکت نیاز به تأیید جداگانه بیمه دارد و اینجا فهرست نشده است. در صورت تمایل تیم ما می‌تواند آن پیشنهادها را پیگیری کند.",
    none: "برای این محصول پیشنهادی نرسید.",
    best: "به‌صرفه‌ترین",
    pdf: "PDF پیشنهاد",
    quoteTime: "زمان پیشنهاد",
    buy: "خرید",
    request: "درخواست پیشنهاد",
    sending: "در حال ارسال…",
    disclaimer:
      "مبالغ فهرست‌شده پیشنهاد شرکت‌های بیمه است نه بیمه‌نامه. شرکت ممکن است پس از کنترل نهایی در صدور، پیشنهاد را به‌روز یا رد کند.",
    cash: "نقدی",
    installments: "{n} قسط",
  },
  pay: {
    title: "پرداخت",
    processing: "پرداخت شما در حال پردازش است",
    processingNot:
      "لطفاً این صفحه را نبندید. پس از اتمام، بیمه‌نامه و رسید نمایش داده می‌شود.",
    goPay: "ادامه به پرداخت",
    leadExternal: "صفحه پرداخت {company} در زبانه جدید باز می‌شود.",
    leadInternal: "پرداخت را از طریق {company} کامل می‌کنید.",
    bullet1: "اطلاعات کارت را در صفحه بعد وارد می‌کنید.",
    bullet2: "شماره کارت و CVV اینجا ذخیره نمی‌شود.",
    link: "پیوند",
    openPage: "باز کردن صفحه پرداخت",
    goToPay: "ادامه به پرداخت",
    popupBlocked:
      "صفحه پرداخت باز نشد. مسدودکننده پنجره pop-up مرورگر را ببندید و دوباره تلاش کنید.",
    cardLead:
      "اطلاعات کارت به POS مجازی شرکت بیمه ارسال می‌شود و اینجا ذخیره نمی‌شود.",
    cardholder: "نام دارنده کارت",
    idNo: "شماره هویت",
    cardNo: "شماره کارت اعتباری",
    month: "ماه",
    year: "سال",
    cvv: "CVV",
    complete: "تکمیل پرداخت",
    approveNew: "مبلغ جدید را تأیید و پرداخت کنید",
    errName: "نام دارنده کارت را وارد کنید.",
    errCard: "شماره کارت را کامل وارد کنید.",
    errExpiry: "تاریخ انقضا را انتخاب کنید.",
    errCvv: "کد امنیتی را وارد کنید.",
    errFail: "پرداخت کامل نشد. لطفاً دوباره تلاش کنید.",
    msgs: [
      "درخواست پرداخت به شرکت بیمه ارسال می‌شود.",
      "اطلاعات کارت در POS مجازی تأیید می‌شود.",
      "بیمه‌نامه صادر و مدارک شما آماده می‌شود.",
    ],
  },
};

export const FLOW: Record<Locale, FlowMessages> = {
  tr: TR,
  en: EN,
  ar: AR,
  fa: FA,
};
