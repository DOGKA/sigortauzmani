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
    viewQuote: string;
    campaignPrice: string;
    priceAdvantage: string;
    campaignLast: string;
    campaignExpired: string;
    quoteTime: string;
    buy: string;
    request: string;
    sending: string;
    checking: string;
    warnTitle: string;
    warnNote: string;
    disclaimer: string;
    cash: string;
    installments: string;
    /** Bu teklifte fiyat veren şirket sayısı; `{n}` ile. */
    fromCompanies: string;
    /** Tüm fiyatlar gelince açılan öne çıkanlar modalı. */
    featuredTitle: string;
    /** `{n}` ile şirket sayısı. */
    featuredLead: string;
    bestNote: string;
    recommended: string;
    recommendedNote: string;
    popular: string;
    popularNote: string;
    showAll: string;
    showFeatured: string;
  };
  /** Veritabanı sayıları ve sistem öncesi başlangıç değerinden oluşan güven şeridi. */
  stats: {
    label: string;
    atBrand: string;
    quotes: string;
    policies: string;
    reviews: string;
    reviewCount: string;
    registeredSub: string;
    authorizedSub: string;
    freeSub: string;
    authorizedValue: string;
    authorizedLabel: string;
    freeValue: string;
    freeLabel: string;
    noFeeValue: string;
    noFeeLabel: string;
    viewingNow: string;
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
    securePayment: string;
    sslEncryption: string;
    secure3D: string;
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
    /** Ön kontrolde şirket primi güncellediğinde onay ekranındaki not. */
    priceChanged: string;
    errName: string;
    errCard: string;
    errExpiry: string;
    errCvv: string;
    errFail: string;
    msgs: [string, string, string];
    /** 3D Secure banka doğrulama ekranı. */
    ucdTitle: string;
    ucdLead: string;
    ucdNewTab: string;
    ucdWaiting: string;
    ucdCheck: string;
    ucdNotYet: string;
    ucdTimeout: string;
    /** Payten ile ödeme öncesi kart doğrulaması. */
    paytenTitle: string;
    paytenLead: string;
    paytenFail: string;
    paytenBack: string;
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
    "İşlem tamamlanana kadar lütfen sayfayı kapatmayın veya yenilemeyin.",
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
    viewQuote: "Teklifi Görüntüle",
    campaignPrice: "Kampanyalı fiyat",
    priceAdvantage: "{n} kazanç",
    campaignLast: "Kampanyalı Fiyat İçin Son",
    campaignExpired: "Kampanya süresi doldu",
    quoteTime: "Teklif zamanı",
    buy: "Satın al",
    request: "Teklif iste",
    sending: "Gönderiliyor…",
    checking: "Kontrol ediliyor…",
    warnTitle: "Bu teklif şu an satın alınamıyor",
    warnNote:
      "Kartınızdan herhangi bir çekim yapılmadı. Teklif isterseniz ekibimiz poliçenizi sizin için düzenler.",
    disclaimer:
      "Listelenen tutarlar sigorta şirketlerinden gelen tekliflerdir ve poliçe değildir. Sigorta şirketi, poliçeleştirme sırasında yaptığı son kontrole göre teklifi güncelleyebilir veya kabul etmeyebilir.",
    cash: "Peşin",
    installments: "{n} Taksit",
    fromCompanies: "{n} sigorta şirketinden fiyat alındı.",
    featuredTitle: "Sizin için öne çıkan teklifler",
    featuredLead: "{n} sigorta şirketinden gelen fiyatlar arasından seçildi.",
    bestNote: "Gelen teklifler arasında en düşük fiyat",
    recommended: "Önerilen",
    recommendedNote: "Sigorta Uzmanı'nın önerdiği şirket",
    popular: "En popüler",
    popularNote: "Son 3 ayda sitemizde en çok tercih edilen şirket",
    showAll: "Tüm teklifleri gör",
    showFeatured: "Öne çıkanları göster",
  },
  stats: {
    label: "Bugüne kadar Sigorta Uzmanı",
    atBrand: "Sigorta Uzmanı'nda",
    quotes: "{n} teklif hazırladı",
    policies: "{n} poliçe düzenledi",
    reviews: "{n} (1.251 İnceleme)",
    reviewCount: "1.251 inceleme",
    registeredSub: "Levha No: {n}",
    authorizedSub: "Poliçeyi sigorta şirketi düzenler",
    freeSub: "Ek ücret alınmaz",
    authorizedValue: "Yetkili",
    authorizedLabel: "Sigorta Acentesi",
    freeValue: "Ücretsiz",
    freeLabel: "Teklif",
    noFeeValue: "Ek Ücret",
    noFeeLabel: "Alınmaz",
    viewingNow: "Şu anda bu ürünü {n} kişi inceliyor",
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
    securePayment: "Güvenli Ödeme",
    sslEncryption: "256 Bit SSL",
    secure3D: "3D Secure",
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
    priceChanged:
      "Sigorta şirketi bu teklifin primini güncelledi. Ödeyeceğiniz güncel tutar yukarıda yazıyor.",
    errName: "Kart sahibinin adını girin.",
    errCard: "Kart numarasını eksiksiz girin.",
    errExpiry: "Son kullanma tarihini seçin.",
    errCvv: "Güvenlik kodunu girin.",
    errFail: "Ödeme tamamlanamadı. Lütfen tekrar deneyin.",
    ucdTitle: "Banka doğrulaması",
    ucdLead:
      "Bankanızın 3D Secure ekranında telefonunuza gelen şifreyi girin. Poliçeniz doğrulama tamamlanınca kesilir.",
    ucdNewTab: "Banka ekranı görünmüyorsa yeni sekmede açın",
    ucdWaiting: "Poliçeniz kontrol ediliyor…",
    ucdCheck: "Ödemeyi tamamladım",
    ucdNotYet:
      "Poliçe henüz kesilmedi. Banka ekranındaki işlemi tamamladıysanız birkaç saniye sonra tekrar deneyin.",
    ucdTimeout:
      "Poliçe kontrolü zaman aşımına uğradı. Ödemeniz tamamlandıysa poliçeniz ekibimiz tarafından size iletilecek; lütfen tekrar ödeme yapmadan bizi arayın.",
    paytenTitle: "Kart doğrulama",
    paytenLead:
      "Bankanızın 3D Secure ekranında telefonunuza gelen şifreyi girin. Doğrulama tamamlanınca prim sigorta şirketi tarafından kartınızdan tahsil edilir.",
    paytenFail: "Kartınız doğrulanamadı. Bilgilerinizi kontrol edip tekrar deneyin.",
    paytenBack: "Kart bilgilerine dön",
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
    "Please do not close or refresh the page until the process is complete.",
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
    viewQuote: "View Quote",
    campaignPrice: "Campaign price",
    priceAdvantage: "{n} savings",
    campaignLast: "Campaign Price Ends In",
    campaignExpired: "Campaign expired",
    quoteTime: "Quote time",
    buy: "Buy",
    request: "Request quote",
    sending: "Sending…",
    checking: "Checking…",
    warnTitle: "This quote cannot be purchased right now",
    warnNote:
      "No charge was made to your card. Request a quote and our team will arrange the policy for you.",
    disclaimer:
      "Listed amounts are quotes from insurers, not policies. The insurer may update or decline the quote after its final check at issuance.",
    cash: "In full",
    installments: "{n} instalments",
    fromCompanies: "Prices received from {n} insurers.",
    featuredTitle: "Featured quotes for you",
    featuredLead: "Selected from prices received from {n} insurers.",
    bestNote: "Lowest price among the quotes received",
    recommended: "Recommended",
    recommendedNote: "Insurer recommended by Sigorta Uzmanı",
    popular: "Most popular",
    popularNote: "Most chosen insurer on our site in the last 3 months",
    showAll: "See all quotes",
    showFeatured: "Show featured",
  },
  stats: {
    label: "Sigorta Uzmanı to date",
    atBrand: "At Sigorta Uzmanı",
    quotes: "{n} quotes prepared",
    policies: "{n} policies issued",
    reviews: "{n} (1,251 reviews)",
    reviewCount: "1,251 reviews",
    registeredSub: "Registry No: {n}",
    authorizedSub: "Policies are issued by the insurer",
    freeSub: "No extra fees",
    authorizedValue: "Licensed",
    authorizedLabel: "Insurance Agency",
    freeValue: "Free",
    freeLabel: "Quote",
    noFeeValue: "No Extra",
    noFeeLabel: "Fees",
    viewingNow: "{n} people are viewing this product now",
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
    securePayment: "Secure Payment",
    sslEncryption: "256-bit SSL",
    secure3D: "3D Secure",
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
    priceChanged:
      "The insurer updated the premium for this quote. The current amount you will pay is shown above.",
    errName: "Enter the cardholder’s name.",
    errCard: "Enter the full card number.",
    errExpiry: "Select the expiry date.",
    errCvv: "Enter the security code.",
    errFail: "Payment could not be completed. Please try again.",
    ucdTitle: "Bank verification",
    ucdLead:
      "Enter the code sent to your phone on your bank's 3D Secure screen. Your policy is issued once verification is complete.",
    ucdNewTab: "Open the bank screen in a new tab if it does not appear",
    ucdWaiting: "Checking your policy…",
    ucdCheck: "I have completed the payment",
    ucdNotYet:
      "The policy has not been issued yet. If you completed the bank step, try again in a few seconds.",
    ucdTimeout:
      "Policy check timed out. If your payment went through, our team will send your policy; please call us instead of paying again.",
    paytenTitle: "Card verification",
    paytenLead:
      "Enter the code your bank sent to your phone on the 3D Secure screen. Once verified, the insurer collects the premium from your card.",
    paytenFail: "Your card could not be verified. Please check your details and try again.",
    paytenBack: "Back to card details",
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
    "يرجى عدم إغلاق الصفحة أو تحديثها حتى تكتمل العملية.",
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
    viewQuote: "عرض العرض",
    campaignPrice: "سعر الحملة",
    priceAdvantage: "توفير {n}",
    campaignLast: "الوقت المتبقي لسعر الحملة",
    campaignExpired: "انتهت الحملة",
    quoteTime: "وقت العرض",
    buy: "اشتروا",
    request: "اطلبوا عرضاً",
    sending: "جارٍ الإرسال…",
    checking: "جارٍ التحقق…",
    warnTitle: "لا يمكن شراء هذا العرض الآن",
    warnNote:
      "لم يتم خصم أي مبلغ من بطاقتكم. اطلبوا عرضاً وسيقوم فريقنا بإعداد الوثيقة لكم.",
    disclaimer:
      "المبالغ المدرجة عروض من شركات التأمين وليست وثائق. قد تحدّث الشركة العرض أو ترفضه بعد الفحص النهائي عند الإصدار.",
    cash: "نقداً",
    installments: "{n} أقساط",
    fromCompanies: "تم استلام الأسعار من {n} شركات تأمين.",
    featuredTitle: "العروض المميزة لك",
    featuredLead: "تم اختيارها من بين الأسعار الواردة من {n} شركات تأمين.",
    bestNote: "أقل سعر بين العروض الواردة",
    recommended: "موصى به",
    recommendedNote: "الشركة التي توصي بها Sigorta Uzmanı",
    popular: "الأكثر شعبية",
    popularNote: "الشركة الأكثر اختيارًا على موقعنا خلال آخر 3 أشهر",
    showAll: "عرض جميع العروض",
    showFeatured: "عرض العروض المميزة",
  },
  stats: {
    label: "Sigorta Uzmanı حتى اليوم",
    atBrand: "في Sigorta Uzmanı",
    quotes: "تم إعداد {n} عرض",
    policies: "تم إصدار {n} وثيقة",
    reviews: "{n} (1,251 مراجعة)",
    reviewCount: "1,251 مراجعة",
    registeredSub: "رقم السجل: {n}",
    authorizedSub: "تصدر شركة التأمين الوثيقة",
    freeSub: "بدون رسوم إضافية",
    authorizedValue: "مرخّصة",
    authorizedLabel: "وكالة تأمين",
    freeValue: "مجاني",
    freeLabel: "عرض السعر",
    noFeeValue: "بدون رسوم",
    noFeeLabel: "إضافية",
    viewingNow: "{n} أشخاص يشاهدون هذا المنتج الآن",
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
    securePayment: "دفع آمن",
    sslEncryption: "تشفير SSL ‏256 بت",
    secure3D: "دفع آمن ثلاثي الأبعاد",
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
    priceChanged:
      "حدّثت شركة التأمين قسط هذا العرض. المبلغ الحالي الذي ستدفعونه مبيّن أعلاه.",
    errName: "أدخلوا اسم حامل البطاقة.",
    errCard: "أدخلوا رقم البطاقة كاملاً.",
    errExpiry: "اختاروا تاريخ الانتهاء.",
    errCvv: "أدخلوا رمز الأمان.",
    errFail: "تعذر إكمال الدفع. حاولوا مرة أخرى.",
    ucdTitle: "التحقق البنكي",
    ucdLead:
      "أدخلوا الرمز المرسل إلى هاتفكم في شاشة 3D Secure الخاصة بالبنك. تصدر وثيقتكم بعد اكتمال التحقق.",
    ucdNewTab: "افتحوا شاشة البنك في علامة تبويب جديدة إذا لم تظهر",
    ucdWaiting: "جارٍ التحقق من وثيقتكم…",
    ucdCheck: "أكملت الدفع",
    ucdNotYet:
      "لم تصدر الوثيقة بعد. إذا أكملتم خطوة البنك فحاولوا مرة أخرى بعد بضع ثوانٍ.",
    ucdTimeout:
      "انتهت مهلة التحقق من الوثيقة. إذا تم الدفع فسيرسل فريقنا وثيقتكم؛ يرجى الاتصال بنا بدلاً من الدفع مرة أخرى.",
    paytenTitle: "التحقق من البطاقة",
    paytenLead:
      "أدخلوا الرمز الذي أرسله البنك إلى هاتفكم في شاشة 3D Secure. بعد التحقق تحصّل شركة التأمين القسط من بطاقتكم.",
    paytenFail: "تعذر التحقق من بطاقتكم. تحققوا من البيانات وحاولوا مرة أخرى.",
    paytenBack: "العودة إلى بيانات البطاقة",
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
    "لطفاً تا پایان فرایند صفحه را نبندید یا تازه‌سازی نکنید.",
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
    viewQuote: "مشاهده پیشنهاد",
    campaignPrice: "قیمت کمپین",
    priceAdvantage: "{n} صرفه‌جویی",
    campaignLast: "زمان باقی‌مانده قیمت کمپین",
    campaignExpired: "کمپین به پایان رسید",
    quoteTime: "زمان پیشنهاد",
    buy: "خرید",
    request: "درخواست پیشنهاد",
    sending: "در حال ارسال…",
    checking: "در حال بررسی…",
    warnTitle: "این پیشنهاد در حال حاضر قابل خرید نیست",
    warnNote:
      "هیچ مبلغی از کارت شما کسر نشد. درخواست پیشنهاد دهید تا تیم ما بیمه‌نامه را برایتان تنظیم کند.",
    disclaimer:
      "مبالغ فهرست‌شده پیشنهاد شرکت‌های بیمه است نه بیمه‌نامه. شرکت ممکن است پس از کنترل نهایی در صدور، پیشنهاد را به‌روز یا رد کند.",
    cash: "نقدی",
    installments: "{n} قسط",
    fromCompanies: "قیمت از {n} شرکت بیمه دریافت شد.",
    featuredTitle: "پیشنهادهای برجسته برای شما",
    featuredLead: "از میان قیمت‌های دریافتی از {n} شرکت بیمه انتخاب شد.",
    bestNote: "کمترین قیمت در میان پیشنهادهای دریافتی",
    recommended: "پیشنهادی",
    recommendedNote: "شرکتی که Sigorta Uzmanı پیشنهاد می‌کند",
    popular: "محبوب‌ترین",
    popularNote: "پرانتخاب‌ترین شرکت در سایت ما در ۳ ماه گذشته",
    showAll: "مشاهده همه پیشنهادها",
    showFeatured: "نمایش پیشنهادهای برجسته",
  },
  stats: {
    label: "Sigorta Uzmanı تا امروز",
    atBrand: "در Sigorta Uzmanı",
    quotes: "{n} پیشنهاد آماده شد",
    policies: "{n} بیمه‌نامه صادر شد",
    reviews: "{n} (۱٬۲۵۱ نظر)",
    reviewCount: "۱٬۲۵۱ نظر",
    registeredSub: "شماره ثبت: {n}",
    authorizedSub: "بیمه‌نامه را شرکت بیمه صادر می‌کند",
    freeSub: "بدون هزینه اضافی",
    authorizedValue: "مجاز",
    authorizedLabel: "نمایندگی بیمه",
    freeValue: "رایگان",
    freeLabel: "پیشنهاد",
    noFeeValue: "بدون هزینه",
    noFeeLabel: "اضافی",
    viewingNow: "اکنون {n} نفر این محصول را مشاهده می‌کنند",
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
    securePayment: "پرداخت امن",
    sslEncryption: "رمزنگاری SSL‏ ۲۵۶ بیتی",
    secure3D: "پرداخت امن سه‌بعدی",
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
    priceChanged:
      "شرکت بیمه حق بیمه این پیشنهاد را به‌روز کرد. مبلغ فعلی قابل پرداخت در بالا نوشته شده است.",
    errName: "نام دارنده کارت را وارد کنید.",
    errCard: "شماره کارت را کامل وارد کنید.",
    errExpiry: "تاریخ انقضا را انتخاب کنید.",
    errCvv: "کد امنیتی را وارد کنید.",
    errFail: "پرداخت کامل نشد. لطفاً دوباره تلاش کنید.",
    ucdTitle: "تأیید بانکی",
    ucdLead:
      "کدی را که به تلفن شما ارسال شده در صفحه 3D Secure بانک وارد کنید. بیمه‌نامه پس از تکمیل تأیید صادر می‌شود.",
    ucdNewTab: "اگر صفحه بانک نمایش داده نشد، آن را در برگه جدید باز کنید",
    ucdWaiting: "در حال بررسی بیمه‌نامه شما…",
    ucdCheck: "پرداخت را تکمیل کردم",
    ucdNotYet:
      "بیمه‌نامه هنوز صادر نشده است. اگر مرحله بانک را تکمیل کرده‌اید، چند ثانیه دیگر دوباره تلاش کنید.",
    ucdTimeout:
      "زمان بررسی بیمه‌نامه به پایان رسید. اگر پرداخت انجام شده باشد تیم ما بیمه‌نامه را ارسال می‌کند؛ لطفاً به جای پرداخت مجدد با ما تماس بگیرید.",
    paytenTitle: "تأیید کارت",
    paytenLead:
      "رمزی را که بانک به تلفن شما فرستاده در صفحه 3D Secure وارد کنید. پس از تأیید، شرکت بیمه حق بیمه را از کارت شما دریافت می‌کند.",
    paytenFail: "کارت شما تأیید نشد. اطلاعات را بررسی کرده و دوباره تلاش کنید.",
    paytenBack: "بازگشت به اطلاعات کارت",
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
