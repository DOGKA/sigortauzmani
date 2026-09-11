/** Metin veya kategori yapısı değişince artırın; kayıtlı tercihler geçersiz sayılır. */
export const CONSENT_TEXT_VERSION = "2026-09-v2";

export const CONSENT_STORAGE_KEY = "su-cookie-consent";

export const BANNER = {
  title: "Çerez tercihleri",
  bodyBeforeLink:
    "Sitemizin çalışması ve güvenliği için zorunlu teknolojileri kullanıyoruz. Analiz, tercih ve pazarlama teknolojileri ise yalnızca seçiminizle çalıştırılır. Ayrıntıları ",
  bodyAfterLink:
    "’nda inceleyebilir ve tercihlerinizi dilediğiniz zaman değiştirebilirsiniz.",
  linkLabel: "Çerez Politikası",
  reject: "Zorunlu olmayanları reddet",
  manage: "Tercihleri yönet",
  accept: "Tümünü kabul et",
} as const;

export const PREFERENCE_LABELS = {
  analytics: {
    title: "Analiz",
    description:
      "Onayınızla Google Analytics 4 veya Google Tag Manager üzerinden sayfa ziyaretlerini ölçmek ve performansı iyileştirmek.",
  },
  preferences: {
    title: "Tercih",
    description:
      "Dil, görünüm veya benzeri tercihlerinizi hatırlamak için kullanılır.",
  },
  marketing: {
    title: "Pazarlama",
    description:
      "Kişiselleştirilmiş reklam veya yeniden hedefleme amacıyla kullanılır.",
  },
  necessary: {
    title: "Zorunlu",
    description:
      "Oturum, güvenlik ve form işlemleri için gereklidir; kapatılamaz.",
  },
} as const;
