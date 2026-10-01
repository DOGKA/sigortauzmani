import type { Locale } from "./locales";

/** Telefon doğrulama modalı. Sunucu hata metinleri yalnızca Türkçe geliyor. */
export interface SmsMessages {
  title: string;
  /** `{phone}` maskeli numara. */
  lead: string;
  codeLabel: string;
  verify: string;
  verifying: string;
  resend: string;
  /** `{s}` kalan saniye. */
  resendIn: string;
  sending: string;
  changeNumber: string;
  /** `{s}` kalan saniye. */
  expiresIn: string;
  expired: string;
  codeLength: string;
  failed: string;
}

const TR: SmsMessages = {
  title: "Telefon doğrulama",
  lead: "{phone} numarasına gönderilen 6 haneli doğrulama kodunu girin.",
  codeLabel: "Doğrulama kodu",
  verify: "Doğrula",
  verifying: "Doğrulanıyor…",
  resend: "Kodu tekrar gönder",
  resendIn: "Tekrar gönder ({s} sn)",
  sending: "Kod gönderiliyor…",
  changeNumber: "Numarayı değiştir",
  expiresIn: "Kod {s} saniye daha geçerli.",
  expired: "Kodun süresi doldu. Yeni kod isteyin.",
  codeLength: "6 haneli kodu girin.",
  failed: "Doğrulama yapılamadı. Lütfen tekrar deneyin.",
};

const EN: SmsMessages = {
  title: "Phone verification",
  lead: "Enter the 6-digit verification code sent to {phone}.",
  codeLabel: "Verification code",
  verify: "Verify",
  verifying: "Verifying…",
  resend: "Resend code",
  resendIn: "Resend ({s} s)",
  sending: "Sending code…",
  changeNumber: "Change number",
  expiresIn: "The code is valid for {s} more seconds.",
  expired: "The code has expired. Request a new one.",
  codeLength: "Enter the 6-digit code.",
  failed: "Verification failed. Please try again.",
};

const AR: SmsMessages = {
  title: "التحقق من الهاتف",
  lead: "أدخلوا رمز التحقق المكوّن من 6 أرقام المرسل إلى {phone}.",
  codeLabel: "رمز التحقق",
  verify: "تحقق",
  verifying: "جارٍ التحقق…",
  resend: "إعادة إرسال الرمز",
  resendIn: "إعادة الإرسال ({s} ث)",
  sending: "جارٍ إرسال الرمز…",
  changeNumber: "تغيير الرقم",
  expiresIn: "الرمز صالح لمدة {s} ثانية أخرى.",
  expired: "انتهت صلاحية الرمز. اطلبوا رمزاً جديداً.",
  codeLength: "أدخلوا الرمز المكوّن من 6 أرقام.",
  failed: "تعذّر التحقق. يرجى المحاولة مرة أخرى.",
};

const FA: SmsMessages = {
  title: "تأیید تلفن",
  lead: "کد تأیید ۶ رقمی ارسال‌شده به {phone} را وارد کنید.",
  codeLabel: "کد تأیید",
  verify: "تأیید",
  verifying: "در حال تأیید…",
  resend: "ارسال دوباره کد",
  resendIn: "ارسال دوباره ({s} ثانیه)",
  sending: "در حال ارسال کد…",
  changeNumber: "تغییر شماره",
  expiresIn: "کد تا {s} ثانیه دیگر معتبر است.",
  expired: "کد منقضی شد. کد جدید درخواست کنید.",
  codeLength: "کد ۶ رقمی را وارد کنید.",
  failed: "تأیید انجام نشد. لطفاً دوباره تلاش کنید.",
};

export const SMS: Record<Locale, SmsMessages> = {
  tr: TR,
  en: EN,
  ar: AR,
  fa: FA,
};
