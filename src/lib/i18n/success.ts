import type { Locale } from "./locales";

export interface SuccessMessages {
  title: string;
  sub: string;
  requestNo: string;
  copy: string;
  copied: string;
  copyAria: string;
  copiedAria: string;
  callTitle: string;
  callSub: string;
  now: string;
  pickDate: string;
  dateAria: string;
  timeAria: string;
  timePlaceholder: string;
  savePref: string;
  saving: string;
  savedNow: string;
  savedLater: string;
  waTitle: string;
  waSub: string;
  waCta: string;
  waNote: string;
  waMessage: string;
  waMessagePlain: string;
  more: string;
  newQuote: string;
  browse: string;
}

const TR: SuccessMessages = {
  title: "Talebiniz oluşturuldu",
  sub: "Seçtiğiniz teklif için işleminize WhatsApp temsilcimizle devam edebilirsiniz. Yönlendirme bağlantısına yalnızca talep numaranız eklenir; formda paylaştığınız kişisel bilgiler WhatsApp bağlantısına yazılmaz.",
  requestNo: "Talep Numaranız",
  copy: "Kopyala",
  copied: "Kopyalandı",
  copyAria: "Talep numarasını kopyala",
  copiedAria: "Talep numarası kopyalandı",
  callTitle: "Sizi Arayalım",
  callSub: "Ne zaman aranmak istersiniz?",
  now: "Hemen",
  pickDate: "Tarih Seç",
  dateAria: "Aranmak istediğiniz tarih",
  timeAria: "Aranmak istediğiniz saat aralığı",
  timePlaceholder: "Saat aralığı seçin",
  savePref: "Tercihi Kaydet",
  saving: "Kaydediliyor...",
  savedNow: "Tercihiniz kaydedildi. Uzmanımız en kısa sürede sizi arayacak.",
  savedLater:
    "Tercihiniz kaydedildi. {date} tarihinde {time} saatleri arasında aranacaksınız.",
  waTitle: "Beklemeden Bağlanın",
  waSub: "Süreci WhatsApp üzerinden hemen sürdürün.",
  waCta: "WhatsApp ile Devam Et",
  waNote:
    "+90 850 302 00 32 numaralı hattımıza yönlendirileceksiniz. Hazır mesaj yalnızca talep numaranızı içerir; yalnızca göndermeniz yeterli.",
  waMessage:
    "Merhaba, {no} numaralı sigorta teklifim için işlemlere devam etmek istiyorum.",
  waMessagePlain: "Merhaba, sigorta teklifim için işlemlere devam etmek istiyorum.",
  more: "Başka bir ihtiyacınız mı var?",
  newQuote: "Yeni teklif oluştur",
  browse: "Tüm ürünleri incele",
};

const EN: SuccessMessages = {
  title: "Your request has been created",
  sub: "You can continue this quote with our WhatsApp advisor. Only your request number is added to the link; personal details from the form are not written into the WhatsApp URL.",
  requestNo: "Your request number",
  copy: "Copy",
  copied: "Copied",
  copyAria: "Copy request number",
  copiedAria: "Request number copied",
  callTitle: "We’ll call you",
  callSub: "When would you like to be called?",
  now: "Now",
  pickDate: "Pick a date",
  dateAria: "Date you would like to be called",
  timeAria: "Time slot you would like to be called",
  timePlaceholder: "Select a time slot",
  savePref: "Save preference",
  saving: "Saving…",
  savedNow: "Your preference was saved. An advisor will call you shortly.",
  savedLater: "Your preference was saved. You will be called on {date} between {time}.",
  waTitle: "Connect without waiting",
  waSub: "Continue the process on WhatsApp now.",
  waCta: "Continue on WhatsApp",
  waNote:
    "You will be sent to our +90 850 302 00 32 line. The prepared message contains only your request number; you just need to send it.",
  waMessage:
    "Hello, I would like to continue with my insurance quote {no}.",
  waMessagePlain: "Hello, I would like to continue with my insurance quote.",
  more: "Need something else?",
  newQuote: "Create a new quote",
  browse: "Browse all products",
};

const AR: SuccessMessages = {
  title: "تم إنشاء طلبكم",
  sub: "يمكنكم متابعة هذا العرض مع ممثل واتساب. يُضاف إلى الرابط رقم الطلب فقط؛ ولا تُكتب البيانات الشخصية من النموذج في رابط واتساب.",
  requestNo: "رقم طلبكم",
  copy: "نسخ",
  copied: "تم النسخ",
  copyAria: "نسخ رقم الطلب",
  copiedAria: "تم نسخ رقم الطلب",
  callTitle: "سنتصل بكم",
  callSub: "متى تودّون أن نتصل بكم؟",
  now: "الآن",
  pickDate: "اختيار تاريخ",
  dateAria: "التاريخ الذي تودون الاتصال فيه",
  timeAria: "الفترة الزمنية التي تودون الاتصال فيها",
  timePlaceholder: "اختاروا فترة زمنية",
  savePref: "حفظ التفضيل",
  saving: "جارٍ الحفظ…",
  savedNow: "حُفظ تفضيلكم. سيتصل بكم مستشار في أقرب وقت.",
  savedLater: "حُفظ تفضيلكم. سنتصل بكم في {date} بين الساعة {time}.",
  waTitle: "تواصلوا دون انتظار",
  waSub: "تابعوا الإجراء عبر واتساب فوراً.",
  waCta: "المتابعة عبر واتساب",
  waNote:
    "ستُوجَّهون إلى خطنا +90 850 302 00 32. الرسالة الجاهزة تتضمن رقم الطلب فقط؛ يكفي إرسالها.",
  waMessage: "مرحباً، أود متابعة عرض التأمين رقم {no}.",
  waMessagePlain: "مرحباً، أود متابعة عرض التأمين.",
  more: "هل تحتاجون شيئاً آخر؟",
  newQuote: "إنشاء عرض جديد",
  browse: "تصفح جميع المنتجات",
};

const FA: SuccessMessages = {
  title: "درخواست شما ثبت شد",
  sub: "می‌توانید این پیشنهاد را با نماینده واتساپ ادامه دهید. فقط شماره درخواست به پیوند اضافه می‌شود؛ اطلاعات شخصی فرم در نشانی واتساپ نوشته نمی‌شود.",
  requestNo: "شماره درخواست شما",
  copy: "کپی",
  copied: "کپی شد",
  copyAria: "کپی شماره درخواست",
  copiedAria: "شماره درخواست کپی شد",
  callTitle: "با شما تماس می‌گیریم",
  callSub: "چه زمانی تماس گرفته شود؟",
  now: "همین حالا",
  pickDate: "انتخاب تاریخ",
  dateAria: "تاریخی که می‌خواهید تماس گرفته شود",
  timeAria: "بازه ساعتی که می‌خواهید تماس گرفته شود",
  timePlaceholder: "بازه ساعت را انتخاب کنید",
  savePref: "ذخیره ترجیح",
  saving: "در حال ذخیره…",
  savedNow: "ترجیح شما ذخیره شد. مشاور به‌زودی تماس می‌گیرد.",
  savedLater: "ترجیح شما ذخیره شد. در {date} بین ساعت {time} تماس گرفته می‌شود.",
  waTitle: "بدون انتظار وصل شوید",
  waSub: "فرآیند را همین حالا در واتساپ ادامه دهید.",
  waCta: "ادامه در واتساپ",
  waNote:
    "به خط +90 850 302 00 32 هدایت می‌شوید. پیام آماده فقط شماره درخواست را دارد؛ کافی است بفرستید.",
  waMessage: "سلام، می‌خواهم پیشنهاد بیمه شماره {no} را ادامه دهم.",
  waMessagePlain: "سلام، می‌خواهم پیشنهاد بیمه را ادامه دهم.",
  more: "نیاز دیگری دارید؟",
  newQuote: "پیشنهاد جدید بسازید",
  browse: "همه محصولات را ببینید",
};

export const SUCCESS: Record<Locale, SuccessMessages> = {
  tr: TR,
  en: EN,
  ar: AR,
  fa: FA,
};
