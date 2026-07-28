/**
 * Yasal metinler. İletişim bilgileri SEO config ile aynı kaynaktan gelir.
 */

import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  SITE_NAME,
  SITE_URL,
} from "../lib/seo/config";
import { ROUTES } from "../lib/seo/routes";

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  items?: string[];
}

export interface LegalDocument {
  path: string;
  title: string;
  description: string;
  h1: string;
  updatedAt: string;
  eyebrow: string;
  intro: string[];
  sections: LegalSection[];
  summary: string;
}

const LAST_UPDATED = "28 Temmuz 2026";

export const legalDocuments: LegalDocument[] = [
  {
    path: ROUTES.kvkk,
    title: "KVKK Aydınlatma Metni",
    description:
      "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında Sigorta Uzmanı kişisel veri aydınlatma metni. Veri sorumlusu, işlenen veriler, amaçlar ve haklarınız.",
    h1: "KVKK Aydınlatma Metni",
    updatedAt: LAST_UPDATED,
    eyebrow: "Kişisel verilerin korunması",
    intro: [
      "6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca kişisel verilerinizin işlenmesine ilişkin sizi bilgilendirmek isteriz.",
      `Bu metin; ${SITE_URL} üzerinden sunulan teklif, iletişim, poliçe iptal ve bilgilendirme hizmetleri kapsamında geçerlidir.`,
    ],
    sections: [
      {
        heading: "1. İşlenen kişisel veriler",
        paragraphs: [
          "Hizmetin niteliğine göre aşağıdaki veri kategorileri işlenebilir:",
        ],
        items: [
          "Kimlik: ad, soyad, T.C. kimlik numarası, vergi kimlik numarası, doğum tarihi",
          "İletişim: cep telefonu, e-posta adresi",
          "Sigorta / araç / konut: plaka, şasi no, ruhsat seri no, teminat tercihi, branş bilgisi",
          "İşlem güvenliği: IP adresi, tarayıcı bilgisi, form gönderim zamanı",
          "Başvuru içeriği: mesaj metni, yüklenen belgeler (PDF/görsel), referans / takip numarası",
        ],
      },
      {
        heading: "2. İşleme amaçları",
        items: [
          "Sigorta teklifi hazırlamak ve sigorta şirketlerinden fiyat/teminat seçenekleri almak",
          "Poliçe düzenleme, yenileme ve poliçe iptal süreçlerini yürütmek",
          "İletişim taleplerini yanıtlamak ve müşteri desteği sağlamak",
          "Yasal yükümlülükleri yerine getirmek ve uyuşmazlık durumunda delil oluşturmak",
          "Hizmet kalitesini artırmak ve güvenlik (kötüye kullanım / spam önleme) sağlamak",
        ],
      },
      {
        heading: "3. Hukuki sebepler",
        paragraphs: [
          "Kişisel verileriniz; KVKK m.5/2 kapsamında sözleşmenin kurulması veya ifası, hukuki yükümlülüğün yerine getirilmesi, meşru menfaatimiz ve açık rızanız (gerektiğinde) hukuki sebeplerine dayanılarak işlenir.",
        ],
      },
      {
        heading: "4. Aktarım",
        paragraphs: [
          "Teklif ve poliçe süreçlerinin yürütülebilmesi için verileriniz, yalnızca gerekli ölçüde ve ilgili mevzuata uygun olarak şu taraflarla paylaşılabilir:",
        ],
        items: [
          "Teklif / poliçe ilişkisinin kurulduğu sigorta şirketleri ve yetkili acentelik kanalları",
          "Teknik altyapı sağlayıcıları (barındırma, e-posta bildirimi, form güvenliği)",
          "Yetkili kamu kurum ve kuruluşları (yasal zorunluluk halinde)",
        ],
      },
      {
        heading: "5. Saklama süresi",
        paragraphs: [
          "Verileriniz, işleme amacının gerektirdiği süre ve ilgili mevzuatta öngörülen zamanaşımı / saklama süreleri boyunca muhafaza edilir. Süre sonunda silinir, yok edilir veya anonim hâle getirilir.",
        ],
      },
      {
        heading: "6. Haklarınız",
        paragraphs: [
          "KVKK m.11 uyarınca; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içi/yurt dışı aktarıldığı üçüncü kişileri bilme, düzeltilmesini veya silinmesini isteme, otomatik sistemler vasıtasıyla analiz edilmesine itiraz etme ve kanuna aykırı işleme nedeniyle zararın giderilmesini talep etme haklarına sahipsiniz.",
          `Başvurularınızı ${CONTACT_EMAIL} adresine iletebilir veya sitedeki İletişim formunu kullanabilirsiniz. Talepleriniz en kısa sürede ve en geç 30 gün içinde yanıtlanır.`,
        ],
      },
      {
        heading: "7. Güncelleme",
        paragraphs: [
          `Bu aydınlatma metni ${LAST_UPDATED} tarihinde güncellenmiştir. Önemli değişikliklerde sayfa üzerinde yeni sürüm yayımlanır.`,
        ],
      },
    ],
    summary:
      "KVKK aydınlatma metni: işlenen veri kategorileri, amaçlar, aktarım ve başvuru hakları.",
  },
  {
    path: ROUTES.privacy,
    title: "Gizlilik Politikası",
    description:
      "Sigorta Uzmanı gizlilik politikası. Hangi verileri nasıl topladığımız, nasıl koruduğumuz ve üçüncü taraflarla ne zaman paylaştığımız.",
    h1: "Gizlilik Politikası",
    updatedAt: LAST_UPDATED,
    eyebrow: "Gizlilik",
    intro: [
      `${SITE_NAME} olarak gizliliğinize saygı duyuyoruz. Bu politika; ${SITE_URL} üzerinde hangi bilgileri topladığımızı, nasıl kullandığımızı ve nasıl koruduğumuzu açıklar.`,
    ],
    sections: [
      {
        heading: "1. Kimiz?",
        paragraphs: [
          `${SITE_NAME} bir sigorta şirketidir.`,
          `İletişim: ${CONTACT_EMAIL} · ${CONTACT_PHONE_DISPLAY}`,
        ],
      },
      {
        heading: "2. Topladığımız bilgiler",
        items: [
          "Doğrudan verdiğiniz bilgiler: teklif ve iletişim formlarındaki kimlik, iletişim ve sigorta bilgileri",
          "Yüklediğiniz belgeler: poliçe iptal veya destek taleplerinde eklenen dosyalar",
          "Otomatik toplanan teknik veriler: IP, cihaz/tarayıcı bilgisi, sayfa kullanımına ilişkin sınırlı günlük kayıtlar",
          "Çerezler ve benzeri teknolojiler: ayrıntılar için Çerez Politikası",
        ],
      },
      {
        heading: "3. Bilgileri nasıl kullanıyoruz?",
        items: [
          "Teklif oluşturmak ve sigorta seçeneklerini size sunmak",
          "Sorularınıza yanıt vermek ve poliçe / iptal süreçlerini yürütmek",
          "Hizmeti güvenli tutmak, kötüye kullanımı engellemek",
          "Yasal yükümlülüklerimizi yerine getirmek",
        ],
      },
      {
        heading: "4. Paylaşım",
        paragraphs: [
          "Kişisel verilerinizi pazarlama amacıyla satmayız. Paylaşım yalnızca teklif/poliçe sürecinin gerektirdiği sigorta şirketleri, teknik hizmet sağlayıcıları ve yasal zorunluluk hâllerinde yetkili mercilerle sınırlıdır.",
        ],
      },
      {
        heading: "5. Güvenlik",
        paragraphs: [
          "Veri iletiminde SSL/TLS şifreleme kullanılır. Erişim, işi gerektiren kişilerle sınırlandırılır. Yine de internet üzerinden hiçbir iletimin %100 güvenli olduğu garanti edilemez.",
        ],
      },
      {
        heading: "6. Çocukların gizliliği",
        paragraphs: [
          "Hizmetlerimiz 18 yaş altı kişilere yönelik değildir. Bilerek 18 yaş altı kişilerden veri toplamayız.",
        ],
      },
      {
        heading: "7. Haklarınız ve iletişim",
        paragraphs: [
          "KVKK kapsamındaki haklarınız için KVKK Aydınlatma Metni sayfasına bakınız.",
          `Gizlilik sorularınız için: ${CONTACT_EMAIL}`,
        ],
      },
      {
        heading: "8. Değişiklikler",
        paragraphs: [
          `Bu politika ${LAST_UPDATED} tarihinde güncellenmiştir. Güncel sürüm her zaman bu sayfada yayımlanır.`,
        ],
      },
    ],
    summary:
      "Gizlilik politikası: toplanan veriler, kullanım amaçları, paylaşım, güvenlik ve iletişim.",
  },
  {
    path: ROUTES.cookies,
    title: "Çerez Politikası",
    description:
      "Sigorta Uzmanı çerez politikası. Sitede kullanılan çerez türleri, amaçları ve tarayıcı üzerinden yönetme seçenekleri.",
    h1: "Çerez Politikası",
    updatedAt: LAST_UPDATED,
    eyebrow: "Çerezler",
    intro: [
      `Bu Çerez Politikası, ${SITE_URL} adresinde kullanılan çerezler ve benzeri teknolojiler hakkında bilgilendirme amaçlıdır.`,
      "Çerez; ziyaret ettiğiniz site tarafından tarayıcınıza yerleştirilen küçük bir metin dosyasıdır. Siteyi düzgün çalıştırmak, güvenliği sağlamak ve (izin verdiğiniz ölçüde) deneyimi iyileştirmek için kullanılır.",
    ],
    sections: [
      {
        heading: "1. Kullandığımız çerez türleri",
        items: [
          "Zorunlu çerezler: oturum, güvenlik, form koruması ve temel site işlevleri için gereklidir. Bunlar olmadan hizmet doğru çalışmayabilir.",
          "İşlevsel / tercih çerezleri: dil veya arayüz tercihlerinizi hatırlamak için kullanılabilir.",
          "Analitik çerezler: (kullanılırsa) trafik ve performans ölçümü için anonimleştirilmiş istatistikler sağlar. Bu çerezler yalnızca gerekli yasal zemine / onayınıza uygun şekilde çalıştırılır.",
        ],
      },
      {
        heading: "2. Üçüncü taraf teknolojileri",
        paragraphs: [
          "Altyapı ve performans için barındırma (ör. Vercel) ve gerektiğinde analitik / güvenlik araçları çerez veya benzeri tanımlayıcılar kullanabilir. Bu sağlayıcıların kendi gizlilik politikaları ayrıca geçerlidir.",
        ],
      },
      {
        heading: "3. Çerezleri nasıl yönetebilirsiniz?",
        paragraphs: [
          "Tarayıcı ayarlarından çerezleri silebilir, engelleyebilir veya bildirim alacak şekilde yapılandırabilirsiniz. Zorunlu çerezleri kapatırsanız sitenin bazı bölümleri çalışmayabilir.",
        ],
        items: [
          "Chrome, Safari, Firefox ve Edge tarayıcılarının gizlilik / çerez ayarları menüsünden yönetebilirsiniz",
          "Mobil cihazlarda uygulama veya sistem gizlilik ayarlarını kontrol edin",
        ],
      },
      {
        heading: "4. Daha fazla bilgi",
        paragraphs: [
          "Kişisel verilerin işlenmesi hakkında ayrıntılar için KVKK Aydınlatma Metni ve Gizlilik Politikası sayfalarına bakınız.",
          `Sorularınız için: ${CONTACT_EMAIL} · ${CONTACT_PHONE_DISPLAY}`,
          `Bu politika ${LAST_UPDATED} tarihinde güncellenmiştir.`,
        ],
      },
    ],
    summary:
      "Çerez politikası: zorunlu ve isteğe bağlı çerezler, üçüncü taraf teknolojileri ve yönetim seçenekleri.",
  },
];

export function getLegalDocument(path: string): LegalDocument | undefined {
  return legalDocuments.find((doc) => doc.path === path);
}
