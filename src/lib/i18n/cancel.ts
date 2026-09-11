import type { IptalBrans, IptalStatus } from "../iptal-types";
import type { Locale } from "./locales";

export interface CancelMessages {
  h1: string;
  apply: string;
  track: string;
  applyTitle: string;
  trackTitle: string;
  breadcrumb: string;
  sideNav: string;
  intro: string;
  trackLead: string;
  trackNo: string;
  query: string;
  querying: string;
  status: string;
  trackNoShort: string;
  subject: string;
  fullName: string;
  namePlaceholder: string;
  phone: string;
  plate: string;
  appliedAt: string;
  notice: string;
  idHidden: string;
  received: string;
  receivedLead: string;
  yourTrackNo: string;
  copy: string;
  copied: string;
  copyAria: string;
  copiedAria: string;
  follow: string;
  newApply: string;
  basics: string;
  deed: string;
  stepOf: string;
  policyType: string;
  policyPlaceholder: string;
  ownerId: string;
  ownerIdPlaceholder: string;
  plateNo: string;
  cityCode: string;
  letters: string;
  digits: string;
  continue: string;
  back: string;
  deedLead: string;
  upload: string;
  uploadHint: string;
  replaceFile: string;
  submit: string;
  submitting: string;
  kvkkBody: string;
  kvkkMore: string;
  kvkkLink: string;
  kvkkAfter: string;
  errPolicy: string;
  errName: string;
  errPhone: string;
  errTckn: string;
  errVkn: string;
  errId: string;
  errPlate: string;
  errFile: string;
  errConn: string;
  errFileType: string;
  errFileSize: string;
  errUpload: string;
  errSave: string;
  errCode: string;
  errQuery: string;
  errNotFound: string;
  brans: Record<IptalBrans, string>;
  statuses: Record<IptalStatus, string>;
}

const TR: CancelMessages = {
  h1: "Poliçe İptal İşlemleri",
  apply: "Başvuru",
  track: "Takip",
  applyTitle: "Poliçe İptal Başvuru",
  trackTitle: "Poliçe İptal Takip",
  breadcrumb: "Sayfa konumu",
  sideNav: "İptal işlemleri",
  intro:
    "Web sitemiz üzerinden yalnızca araç satışı nedeniyle poliçe iptal talebi alınmaktadır. Diğer iptal nedenleri için {phone} numaralı danışma hattımızı arayabilirsiniz. Daha önce oluşturduğunuz talebin durumunu “{track}” bölümünden görüntüleyebilirsiniz.",
  trackLead:
    "Başvuru sonunda aldığınız iptal takip numarasını girerek talebinizin güncel durumunu görüntüleyin.",
  trackNo: "İptal Takip Numarası",
  query: "Sorgula",
  querying: "Sorgulanıyor…",
  status: "Durum",
  trackNoShort: "Takip No",
  subject: "İptal Konusu",
  fullName: "Ad Soyad",
  namePlaceholder: "Ruhsat sahibi ad soyad",
  phone: "Cep Telefonu",
  plate: "Plaka",
  appliedAt: "Başvuru Tarihi",
  notice: "Bilgilendirme",
  idHidden: "Kimlik numarası güvenlik nedeniyle gösterilmez.",
  received: "Başvurunuz alındı",
  receivedLead:
    "Poliçe iptal talebiniz işleme alındı. Takip numaranızı not edin; süreç tamamlandığında sizinle iletişime geçilecektir.",
  yourTrackNo: "İptal Takip Numaranız",
  copy: "Kopyala",
  copied: "Kopyalandı",
  copyAria: "İptal takip numarasını kopyala",
  copiedAria: "İptal takip numarası kopyalandı",
  follow: "Talebi Takip Et",
  newApply: "Yeni Başvuru",
  basics: "Temel Bilgiler",
  deed: "Noter Satış Sözleşmesi",
  stepOf: "Adım {step}/2",
  policyType: "İptal etmek istediğiniz poliçe türü",
  policyPlaceholder: "Poliçe türü seçin",
  ownerId: "Ruhsat sahibinin T.C. kimlik / vergi kimlik numarası",
  ownerIdPlaceholder: "11 veya 10 haneli numara",
  plateNo: "Araç Plaka No",
  cityCode: "İl kodu",
  letters: "Harfler",
  digits: "Rakamlar",
  continue: "Devam",
  back: "Geri",
  deedLead:
    "Bu aşamada noter satış belgesini sisteme yüklemeniz gerekiyor. Dosya yükle diyerek bilgisayarınızdan veya telefonunuzdan fotoğraf / PDF seçebilirsiniz.",
  upload: "Dosya Yükle",
  uploadHint: "PDF, JPG veya PNG · en fazla 10 MB",
  replaceFile: "{size} MB — değiştirmek için tıklayın",
  submit: "Başvuruyu Gönder",
  submitting: "Gönderiliyor…",
  kvkkBody:
    "Paylaştığınız ad-soyad, telefon, T.C. kimlik veya vergi kimlik numarası, plaka, poliçe bilgileri ve yükleyeceğiniz noter satış belgesi; iptal talebinizi doğrulamak, ilgili sigorta şirketine iletmek, sonucu size bildirmek ve işlem kaydını saklamak amacıyla işlenir. Yalnızca iptal işlemi için gerekli belgeyi yükleyin.",
  kvkkMore: "Ayrıntılı bilgi için",
  kvkkLink: "KVKK Aydınlatma Metni",
  kvkkAfter: "’ni inceleyebilirsiniz.",
  errPolicy: "Poliçe türü seçin.",
  errName: "Ad soyad girin.",
  errPhone: "Geçerli bir cep telefonu girin.",
  errTckn: "Geçerli bir T.C. kimlik no girin.",
  errVkn: "Geçerli bir vergi kimlik no girin.",
  errId:
    "T.C. kimlik numarası (11 hane) veya vergi kimlik numarası (10 hane) girin.",
  errPlate: "Geçerli bir plaka girin.",
  errFile: "Noter satış sözleşmesini yükleyin.",
  errConn: "Bağlantı kurulamadı. Lütfen tekrar deneyin.",
  errFileType: "Yalnızca PDF, JPG veya PNG yükleyebilirsiniz.",
  errFileSize: "Dosya boyutu en fazla 10 MB olabilir.",
  errUpload: "Belge yüklenemedi. Lütfen tekrar deneyin.",
  errSave: "Talep kaydedilemedi. Lütfen tekrar deneyin.",
  errCode: "Geçerli bir iptal takip numarası girin.",
  errQuery: "Sorgulama yapılamadı. Lütfen tekrar deneyin.",
  errNotFound: "Bu takip numarasına ait başvuru bulunamadı.",
  brans: {
    kasko: "Kasko Poliçesi",
    trafik: "Trafik Poliçesi",
    imm: "İMM Poliçesi",
    kisa_sureli_trafik: "Kısa Süreli Trafik Poliçesi",
  },
  statuses: {
    islemde: "İşlemde",
    belge_eksik: "Belge Eksik",
    tamamlandi: "Tamamlandı",
  },
};

const EN: CancelMessages = {
  h1: "Policy cancellation",
  apply: "Apply",
  track: "Track",
  applyTitle: "Cancellation request",
  trackTitle: "Track a cancellation",
  breadcrumb: "Breadcrumb",
  sideNav: "Cancellation",
  intro:
    "This website only accepts policy cancellation requests due to a vehicle sale. For other cancellation reasons please call our advice line on {phone}. You can check a request you already created in the “{track}” section.",
  trackLead:
    "Enter the cancellation tracking number you received at the end of the application to see the current status.",
  trackNo: "Cancellation tracking number",
  query: "Look up",
  querying: "Looking up…",
  status: "Status",
  trackNoShort: "Tracking no.",
  subject: "Cancellation subject",
  fullName: "Full name",
  namePlaceholder: "Registered keeper’s full name",
  phone: "Mobile phone",
  plate: "Plate",
  appliedAt: "Application date",
  notice: "Notice",
  idHidden: "The ID number is not shown for security reasons.",
  received: "Your application was received",
  receivedLead:
    "Your policy cancellation request is being processed. Note your tracking number; we will contact you when the process is complete.",
  yourTrackNo: "Your cancellation tracking number",
  copy: "Copy",
  copied: "Copied",
  copyAria: "Copy cancellation tracking number",
  copiedAria: "Cancellation tracking number copied",
  follow: "Track this request",
  newApply: "New application",
  basics: "Basic details",
  deed: "Notary sale contract",
  stepOf: "Step {step}/2",
  policyType: "Policy type you want to cancel",
  policyPlaceholder: "Select a policy type",
  ownerId: "Registered keeper’s Turkish ID / tax ID number",
  ownerIdPlaceholder: "11- or 10-digit number",
  plateNo: "Vehicle plate number",
  cityCode: "City code",
  letters: "Letters",
  digits: "Numbers",
  continue: "Continue",
  back: "Back",
  deedLead:
    "At this step you need to upload the notary sale document. Choose a photo or PDF from your computer or phone.",
  upload: "Upload file",
  uploadHint: "PDF, JPG or PNG · max 10 MB",
  replaceFile: "{size} MB — click to replace",
  submit: "Submit application",
  submitting: "Sending…",
  kvkkBody:
    "The name, phone, Turkish ID or tax ID, plate, policy details and notary sale document you share are processed to verify your cancellation request, send it to the relevant insurer, notify you of the result and keep a record of the process. Upload only the document needed for the cancellation.",
  kvkkMore: "For details, see the",
  kvkkLink: "KVKK information notice",
  kvkkAfter: ".",
  errPolicy: "Select a policy type.",
  errName: "Enter a full name.",
  errPhone: "Enter a valid mobile number.",
  errTckn: "Enter a valid Turkish ID number.",
  errVkn: "Enter a valid tax ID number.",
  errId: "Enter a Turkish ID number (11 digits) or a tax ID number (10 digits).",
  errPlate: "Enter a valid plate number.",
  errFile: "Upload the notary sale contract.",
  errConn: "Could not connect. Please try again.",
  errFileType: "You can only upload PDF, JPG or PNG.",
  errFileSize: "The file can be at most 10 MB.",
  errUpload: "The document could not be uploaded. Please try again.",
  errSave: "The request could not be saved. Please try again.",
  errCode: "Enter a valid cancellation tracking number.",
  errQuery: "The lookup failed. Please try again.",
  errNotFound: "No application was found for this tracking number.",
  brans: {
    kasko: "Casco policy",
    trafik: "MTPL policy",
    imm: "Excess liability policy",
    kisa_sureli_trafik: "Short-term MTPL policy",
  },
  statuses: {
    islemde: "In progress",
    belge_eksik: "Document missing",
    tamamlandi: "Completed",
  },
};

const AR: CancelMessages = {
  h1: "إلغاء الوثيقة",
  apply: "تقديم طلب",
  track: "تتبع",
  applyTitle: "طلب إلغاء الوثيقة",
  trackTitle: "تتبع إلغاء الوثيقة",
  breadcrumb: "مسار الصفحة",
  sideNav: "إجراءات الإلغاء",
  intro:
    "يُقبل عبر موقعنا طلب إلغاء الوثيقة بسبب بيع المركبة فقط. لأسباب الإلغاء الأخرى يمكنكم الاتصال بخط الاستشارة {phone}. يمكنكم عرض حالة طلب أنشأتموه سابقاً من قسم «{track}».",
  trackLead:
    "أدخلوا رقم تتبع الإلغاء الذي حصلتم عليه في نهاية الطلب لعرض الحالة الحالية.",
  trackNo: "رقم تتبع الإلغاء",
  query: "استعلام",
  querying: "جارٍ الاستعلام…",
  status: "الحالة",
  trackNoShort: "رقم التتبع",
  subject: "موضوع الإلغاء",
  fullName: "الاسم الكامل",
  namePlaceholder: "اسم مالك الرخصة الكامل",
  phone: "الهاتف المحمول",
  plate: "اللوحة",
  appliedAt: "تاريخ الطلب",
  notice: "إشعار",
  idHidden: "لا يُعرض رقم الهوية لأسباب أمنية.",
  received: "تم استلام طلبكم",
  receivedLead:
    "بدأ معالجة طلب إلغاء الوثيقة. دوّنوا رقم التتبع؛ سنتواصل معكم عند اكتمال الإجراء.",
  yourTrackNo: "رقم تتبع الإلغاء لديكم",
  copy: "نسخ",
  copied: "تم النسخ",
  copyAria: "نسخ رقم تتبع الإلغاء",
  copiedAria: "تم نسخ رقم تتبع الإلغاء",
  follow: "تتبع الطلب",
  newApply: "طلب جديد",
  basics: "البيانات الأساسية",
  deed: "عقد البيع لدى الكاتب العدل",
  stepOf: "الخطوة {step}/2",
  policyType: "نوع الوثيقة التي تريدون إلغاءها",
  policyPlaceholder: "اختاروا نوع الوثيقة",
  ownerId: "رقم الهوية التركية / الرقم الضريبي لمالك الرخصة",
  ownerIdPlaceholder: "رقم من 11 أو 10 خانات",
  plateNo: "رقم لوحة المركبة",
  cityCode: "رمز الولاية",
  letters: "الحروف",
  digits: "الأرقام",
  continue: "التالي",
  back: "رجوع",
  deedLead:
    "في هذه الخطوة يجب رفع مستند البيع لدى الكاتب العدل. يمكنكم اختيار صورة أو PDF من الحاسوب أو الهاتف.",
  upload: "رفع ملف",
  uploadHint: "PDF أو JPG أو PNG · حتى 10 ميغابايت",
  replaceFile: "{size} ميغابايت — انقروا للاستبدال",
  submit: "إرسال الطلب",
  submitting: "جارٍ الإرسال…",
  kvkkBody:
    "يُعالَج الاسم والهاتف ورقم الهوية التركية أو الرقم الضريبي واللوحة وبيانات الوثيقة ومستند البيع الذي ترفعونه للتحقق من طلب الإلغاء وإرساله إلى شركة التأمين المعنية وإبلاغكم بالنتيجة وحفظ سجل العملية. ارفعوا فقط المستند اللازم للإلغاء.",
  kvkkMore: "للتفاصيل راجعوا",
  kvkkLink: "نص التوعية وفق KVKK",
  kvkkAfter: ".",
  errPolicy: "اختاروا نوع الوثيقة.",
  errName: "أدخلوا الاسم الكامل.",
  errPhone: "أدخلوا رقم هاتف محمولاً صالحاً.",
  errTckn: "أدخلوا رقم هوية تركيا صالحاً.",
  errVkn: "أدخلوا رقماً ضريبياً صالحاً.",
  errId: "أدخلوا رقم الهوية التركية (11 خانة) أو الرقم الضريبي (10 خانات).",
  errPlate: "أدخلوا رقم لوحة صالحاً.",
  errFile: "ارفعوا عقد البيع لدى الكاتب العدل.",
  errConn: "تعذر الاتصال. يرجى المحاولة مرة أخرى.",
  errFileType: "يمكن رفع PDF أو JPG أو PNG فقط.",
  errFileSize: "حجم الملف حتى 10 ميغابايت كحد أقصى.",
  errUpload: "تعذر رفع المستند. يرجى المحاولة مرة أخرى.",
  errSave: "تعذر حفظ الطلب. يرجى المحاولة مرة أخرى.",
  errCode: "أدخلوا رقم تتبع إلغاء صالحاً.",
  errQuery: "فشل الاستعلام. يرجى المحاولة مرة أخرى.",
  errNotFound: "لم يُعثر على طلب بهذا الرقم.",
  brans: {
    kasko: "وثيقة الكاسكو",
    trafik: "وثيقة تأمين المرور",
    imm: "وثيقة المسؤولية الاختيارية",
    kisa_sureli_trafik: "وثيقة تأمين مرور قصيرة الأجل",
  },
  statuses: {
    islemde: "قيد المعالجة",
    belge_eksik: "مستند ناقص",
    tamamlandi: "مكتمل",
  },
};

const FA: CancelMessages = {
  h1: "لغو بیمه‌نامه",
  apply: "درخواست",
  track: "پیگیری",
  applyTitle: "درخواست لغو بیمه‌نامه",
  trackTitle: "پیگیری لغو بیمه‌نامه",
  breadcrumb: "مسیر صفحه",
  sideNav: "اقدامات لغو",
  intro:
    "از وب‌سایت فقط درخواست لغو بیمه‌نامه به‌دلیل فروش خودرو پذیرفته می‌شود. برای سایر دلایل لغو با خط مشاوره {phone} تماس بگیرید. وضعیت درخواست قبلی را از بخش «{track}» ببینید.",
  trackLead:
    "شماره پیگیری لغو را که در پایان درخواست گرفتید وارد کنید تا وضعیت فعلی را ببینید.",
  trackNo: "شماره پیگیری لغو",
  query: "استعلام",
  querying: "در حال استعلام…",
  status: "وضعیت",
  trackNoShort: "شماره پیگیری",
  subject: "موضوع لغو",
  fullName: "نام و نام خانوادگی",
  namePlaceholder: "نام مالک سند",
  phone: "تلفن همراه",
  plate: "پلاک",
  appliedAt: "تاریخ درخواست",
  notice: "اطلاع‌رسانی",
  idHidden: "شماره هویت به‌دلیل امنیت نمایش داده نمی‌شود.",
  received: "درخواست شما دریافت شد",
  receivedLead:
    "درخواست لغو بیمه‌نامه در جریان است. شماره پیگیری را یادداشت کنید؛ پس از تکمیل با شما تماس گرفته می‌شود.",
  yourTrackNo: "شماره پیگیری لغو شما",
  copy: "کپی",
  copied: "کپی شد",
  copyAria: "کپی شماره پیگیری لغو",
  copiedAria: "شماره پیگیری لغو کپی شد",
  follow: "پیگیری درخواست",
  newApply: "درخواست جدید",
  basics: "اطلاعات پایه",
  deed: "قرارداد فروش دفتر اسناد",
  stepOf: "گام {step}/2",
  policyType: "نوع بیمه‌نامه‌ای که می‌خواهید لغو کنید",
  policyPlaceholder: "نوع بیمه‌نامه را انتخاب کنید",
  ownerId: "شماره هویت ترکیه / شماره مالیاتی مالک سند",
  ownerIdPlaceholder: "شماره ۱۱ یا ۱۰ رقمی",
  plateNo: "شماره پلاک خودرو",
  cityCode: "کد استان",
  letters: "حروف",
  digits: "اعداد",
  continue: "ادامه",
  back: "بازگشت",
  deedLead:
    "در این مرحله باید سند فروش دفتر اسناد را بارگذاری کنید. از رایانه یا گوشی عکس یا PDF انتخاب کنید.",
  upload: "بارگذاری فایل",
  uploadHint: "PDF، JPG یا PNG · حداکثر ۱۰ مگابایت",
  replaceFile: "{size} مگابایت — برای جایگزینی کلیک کنید",
  submit: "ارسال درخواست",
  submitting: "در حال ارسال…",
  kvkkBody:
    "نام، تلفن، شماره هویت ترکیه یا شماره مالیاتی، پلاک، اطلاعات بیمه‌نامه و سند فروش دفتر اسنادی که به اشتراک می‌گذارید برای تأیید درخواست لغو، ارسال به شرکت بیمه مربوط، اعلام نتیجه و نگهداری سابقه پردازش می‌شود. فقط سند لازم برای لغو را بارگذاری کنید.",
  kvkkMore: "برای جزئیات",
  kvkkLink: "متن اطلاع‌رسانی KVKK",
  kvkkAfter: " را ببینید.",
  errPolicy: "نوع بیمه‌نامه را انتخاب کنید.",
  errName: "نام و نام خانوادگی را وارد کنید.",
  errPhone: "یک شماره همراه معتبر وارد کنید.",
  errTckn: "یک شماره هویت ترکیه معتبر وارد کنید.",
  errVkn: "یک شماره مالیاتی معتبر وارد کنید.",
  errId: "شماره هویت ترکیه (۱۱ رقم) یا شماره مالیاتی (۱۰ رقم) وارد کنید.",
  errPlate: "یک پلاک معتبر وارد کنید.",
  errFile: "قرارداد فروش دفتر اسناد را بارگذاری کنید.",
  errConn: "اتصال برقرار نشد. لطفاً دوباره تلاش کنید.",
  errFileType: "فقط PDF، JPG یا PNG می‌توانید بارگذاری کنید.",
  errFileSize: "حجم فایل حداکثر ۱۰ مگابایت است.",
  errUpload: "سند بارگذاری نشد. لطفاً دوباره تلاش کنید.",
  errSave: "درخواست ذخیره نشد. لطفاً دوباره تلاش کنید.",
  errCode: "یک شماره پیگیری لغو معتبر وارد کنید.",
  errQuery: "استعلام انجام نشد. لطفاً دوباره تلاش کنید.",
  errNotFound: "برای این شماره پیگیری درخواستی پیدا نشد.",
  brans: {
    kasko: "بیمه‌نامه بدنه",
    trafik: "بیمه‌نامه شخص ثالث",
    imm: "بیمه‌نامه مسئولیت اختیاری",
    kisa_sureli_trafik: "بیمه‌نامه شخص ثالث کوتاه‌مدت",
  },
  statuses: {
    islemde: "در جریان",
    belge_eksik: "سند ناقص",
    tamamlandi: "تکمیل شد",
  },
};

export const CANCEL: Record<Locale, CancelMessages> = {
  tr: TR,
  en: EN,
  ar: AR,
  fa: FA,
};

const IPTAL_ERROR_KEYS: Record<string, keyof CancelMessages> = {
  "Bağlantı kurulamadı. Lütfen tekrar deneyin.": "errConn",
  "Yalnızca PDF, JPG veya PNG yükleyebilirsiniz.": "errFileType",
  "Dosya boyutu en fazla 10 MB olabilir.": "errFileSize",
  "Belge yüklenemedi. Lütfen tekrar deneyin.": "errUpload",
  "Talep kaydedilemedi. Lütfen tekrar deneyin.": "errSave",
  "Geçerli bir iptal takip numarası girin.": "errCode",
  "Sorgulama yapılamadı. Lütfen tekrar deneyin.": "errQuery",
  "Bu takip numarasına ait başvuru bulunamadı.": "errNotFound",
};

export function localizeIptalError(
  error: string,
  messages: CancelMessages,
): string {
  const key = IPTAL_ERROR_KEYS[error];
  if (!key) return error;
  const value = messages[key];
  return typeof value === "string" ? value : error;
}
