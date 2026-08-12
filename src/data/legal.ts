/**
 * Yasal metinler. İletişim bilgileri SEO config ile aynı kaynaktan gelir.
 */

import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  SITE_URL,
} from "../lib/seo/config";
import { ROUTES } from "../lib/seo/routes";

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  items?: string[];
  /** Madde listesinden sonra gösterilecek paragraflar */
  closing?: string[];
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
      "sigortauzmani.net gizlilik politikası. Toplanan bilgiler, kullanım amaçları, paylaşım, WhatsApp, çerezler, saklama ve kullanıcı hakları.",
    h1: "Gizlilik Politikası",
    updatedAt: "29 Temmuz 2026",
    eyebrow: "Yasal metinler",
    intro: [],
    sections: [
      {
        heading: "01 Amaç ve kapsam",
        paragraphs: [
          "Bu Gizlilik Politikası; sigortauzmani.net internet sitesinin kullanılması, sigorta teklif talebi oluşturulması, poliçe işlemlerinin yürütülmesi, poliçe iptal başvurusu yapılması, iletişim formunun kullanılması ve destek hizmetlerinden yararlanılması sırasında paylaşılan bilgilerin nasıl toplandığını, kullanıldığını, saklandığını ve korunduğunu açıklamaktadır.",
          "Kişisel verilerin işlenmesine ilişkin ayrıntılı hukuki açıklamalar KVKK Aydınlatma Metni içerisinde yer almaktadır.",
        ],
      },
      {
        heading: "02 Toplanan bilgiler",
        paragraphs: [
          "Kullanılan hizmete ve seçilen sigorta ürününe göre aşağıdaki bilgiler işlenebilir:",
        ],
        items: [
          "Kimlik bilgileri: Ad, soyad, T.C. kimlik numarası, vergi kimlik numarası ve doğum tarihi.",
          "İletişim bilgileri: Cep telefonu numarası ve e-posta adresi.",
          "Sigorta ve işlem bilgileri: Talep edilen sigorta türü, teklif ve poliçe bilgileri, teminat tercihleri, talep ve takip numarası, yenileme, değişiklik, iptal ve hasar süreçlerine ilişkin bilgiler.",
          "Araç bilgileri: Plaka, ruhsat belge seri numarası, şasi numarası, motor numarası ve teklif hazırlanması için gerekli diğer araç bilgileri.",
          "Konut ve taşınmaz bilgileri: Adres, bina ve konut özellikleri ile DASK veya konut sigortası teklifinin hazırlanması için gerekli bilgiler.",
          "Başvuru ve iletişim bilgileri: İletişim konusu, mesaj içeriği, aciliyet tercihi, talep ve şikâyet kayıtları.",
          "Belge bilgileri: Noter satış sözleşmesi, poliçe belgesi ve kullanıcı tarafından iletişim veya poliçe iptal formlarına yüklenen diğer belgeler.",
          "İşlem güvenliği bilgileri: IP adresi, tarayıcı ve cihaz bilgileri, erişim zamanı, form gönderim zamanı ve sistem güvenliği kayıtları.",
          "Başka kişilere ait bilgiler: Eş, çocuk veya sigortalanması talep edilen diğer kişilere ilişkin, teklif ve poliçe sürecinin gerektirdiği bilgiler.",
        ],
      },
      {
        heading: "03 Bilgilerin toplanma yöntemleri",
        paragraphs: [
          "Bilgiler aşağıdaki kanallar aracılığıyla elde edilebilir:",
        ],
        items: [
          "İnternet sitesindeki teklif, iletişim ve poliçe iptal formları.",
          "Telefon ve e-posta görüşmeleri.",
          "WhatsApp Business üzerinden gerçekleştirilen yazışmalar.",
          "Kullanıcı tarafından yüklenen belgeler.",
          "Talep ve poliçe süreçlerinde kullanılan admin paneli ve müşteri takip sistemleri.",
          "İlgili sigorta şirketleri ve yetkili sigorta kanalları.",
          "İnternet sitesi erişim kayıtları, zorunlu çerezler ve güvenlik sistemleri.",
        ],
        closing: [
          "Teklif ve başvuru bilgileri, talebin takip edilebilmesi ve yetkili temsilciler tarafından işleme alınabilmesi amacıyla admin paneli veya müşteri takip sistemlerinde kaydedilebilir.",
        ],
      },
      {
        heading: "04 Bilgilerin kullanım amaçları",
        paragraphs: [
          "Toplanan bilgiler aşağıdaki amaçlarla kullanılabilir:",
        ],
        items: [
          "Sigorta teklif talebinin oluşturulması.",
          "İlgili sigorta şirketlerinden fiyat, teminat ve kapsam seçeneklerinin araştırılması.",
          "Tekliflerin değerlendirilmesi ve kullanıcıya sunulması.",
          "Kullanıcıyla telefon, e-posta veya WhatsApp üzerinden iletişim kurulması.",
          "Poliçe düzenleme, yenileme, değişiklik ve iptal işlemlerinin yürütülmesi.",
          "Hasar ve poliçe sonrası destek taleplerinin değerlendirilmesi.",
          "Başvuruların talep veya takip numarası üzerinden yönetilmesi.",
          "İletişim formu mesajlarının ve yüklenen belgelerin incelenmesi.",
          "Kullanıcı talep, şikâyet ve sorularının cevaplandırılması.",
          "Sistem güvenliğinin sağlanması ve kötüye kullanımın önlenmesi.",
          "Hizmet kalitesinin geliştirilmesi.",
          "Yasal yükümlülüklerin yerine getirilmesi.",
          "Olası uyuşmazlıklarda hakların korunması ve işlemlerin kayıt altına alınması.",
        ],
        closing: [
          "Reklam, kampanya ve tanıtım amaçlı elektronik ileti gönderimleri yalnızca gerekli izinlerin alınmış olması hâlinde gerçekleştirilir. Kullanıcılar verdikleri ticari ileti izinlerini ilgili iletişim kanalları veya İleti Yönetim Sistemi üzerinden geri alabilir.",
        ],
      },
      {
        heading: "05 Bilgilerin paylaşılması",
        paragraphs: [
          "Bilgiler, hizmetin yürütülmesi için gerekli olduğu ölçüde aşağıdaki taraflarla paylaşılabilir:",
        ],
        items: [
          "Teklif alınan veya poliçe ilişkisinin kurulduğu sigorta şirketleri.",
          "Teklif, poliçeleştirme, yenileme, değişiklik, iptal ve hasar süreçlerinde görev alan yetkili sigorta kanalları.",
          "Barındırma, veri tabanı, e-posta gönderimi, dosya saklama, iletişim, güvenlik ve teknik destek hizmeti sağlayan kuruluşlar.",
          "Talebi değerlendiren yetkili çalışanlar ve temsilciler.",
          "Hukuk, mali müşavirlik, denetim ve danışmanlık hizmeti alınan yetkili kişiler.",
          "Yasal zorunluluk bulunması hâlinde yetkili kamu kurumları, düzenleyici kuruluşlar, mahkemeler, icra müdürlükleri ve diğer yetkili merciler.",
        ],
        closing: [
          "Kişisel bilgiler reklam veya pazarlama amacıyla üçüncü kişilere satılmaz, kiralanmaz ya da ticari veri listesi olarak sunulmaz.",
        ],
      },
      {
        heading: "06 Yurt dışına veri aktarımı",
        paragraphs: [
          "İnternet sitesinde kullanılan barındırma, e-posta, iletişim, güvenlik, dosya saklama ve benzeri teknik hizmetlerin altyapılarının yurt dışında bulunması hâlinde bazı kişisel veriler yurt dışına aktarılabilir veya yurt dışında işlenebilir.",
          "Yurt dışına veri aktarımları; 6698 sayılı Kişisel Verilerin Korunması Kanunu’nun 9. maddesi, ilgili yönetmelikler ve Kişisel Verileri Koruma Kurulu tarafından belirlenen yeterlilik kararları, uygun güvenceler, standart sözleşmeler veya kanunda düzenlenen diğer aktarım şartları çerçevesinde gerçekleştirilir.",
          "Yurt dışı aktarım süreçlerine ilişkin ayrıntılar KVKK Aydınlatma Metni içerisinde açıklanmaktadır.",
        ],
      },
      {
        heading: "07 WhatsApp ve harici hizmetler",
        paragraphs: [
          "Teklif talebi tamamlandıktan sonra sürecin WhatsApp Business üzerinden devam ettirilmesi kullanıcıya sunulabilir.",
          "WhatsApp yönlendirme bağlantısına T.C. kimlik numarası, telefon numarası, plaka veya diğer hassas form bilgileri eklenmez. Bağlantı üzerinden yalnızca talebin bulunmasını sağlayan talep veya takip numarası aktarılabilir.",
          "Kullanıcının WhatsApp üzerinden kendisinin gönderdiği mesaj ve belgeler WhatsApp’ın kendi gizlilik ve veri işleme kurallarına da tabi olabilir. WhatsApp yazışmalarında işlem için gerekli olmayan kişisel veya hassas bilgilerin gönderilmemesi önerilir.",
          "İnternet sitesinde üçüncü kişilere ait internet sitelerine veya harici hizmetlere yönlendiren bağlantılar bulunabilir. Bu hizmetlerin gizlilik uygulamalarından ve içeriklerinden ilgili hizmet sağlayıcılar sorumludur.",
        ],
      },
      {
        heading: "08 Çerezler ve teknik kayıtlar",
        paragraphs: [
          "İnternet sitesinin güvenli, hızlı ve doğru biçimde çalışabilmesi için zorunlu çerezler ve sınırlı teknik kayıtlar kullanılabilir.",
          "Zorunlu olmayan analiz, performans, kişiselleştirme veya pazarlama çerezleri kullanıcı tercihleri doğrultusunda çalıştırılır ve gerekli durumlarda önceden izin alınır.",
          "Kullanılan çerez türleri, kullanım amaçları, saklama süreleri ve tercih yönetimi hakkında ayrıntılı bilgi Çerez Politikası içerisinde yer almaktadır.",
        ],
      },
      {
        heading: "09 Başka kişilere ait bilgilerin paylaşılması",
        paragraphs: [
          "Eş, çocuk veya başka bir kişi adına teklif talebi oluşturulurken yalnızca teklif ve poliçe süreci için gerekli bilgiler paylaşılmalıdır.",
          "Başvuru sahibi, başka bir yetişkine ait bilgileri paylaşmadan önce bu bilgileri paylaşmaya yetkili olduğundan emin olmalıdır. Başka kişilere ait kişisel verilerin yetkisiz veya ilgisiz amaçlarla paylaşılmaması gerekir.",
          "Çocuklara ait bilgiler yalnızca ebeveyn, veli veya yetkili yasal temsilci tarafından ve sigorta teklifinin hazırlanması için gerekli olduğu ölçüde paylaşılmalıdır. İnternet sitesi doğrudan çocukların kullanımına yönelik değildir.",
          "Başka kişiler aracılığıyla elde edilen kişisel veriler bakımından gerekli bilgilendirmeler KVKK Aydınlatma Metni ve ilgili veri işleme süreçleri kapsamında gerçekleştirilir.",
        ],
      },
      {
        heading: "10 Yüklenen belgeler ve hassas bilgiler",
        paragraphs: [
          "İletişim ve poliçe iptal formlarına yalnızca başvurunun değerlendirilmesi için gerekli belgeler yüklenmelidir.",
          "Sağlık bilgileri, banka ve ödeme bilgileri, hesap şifreleri, biyometrik bilgiler, ceza mahkûmiyeti bilgileri ve başvuruyla ilgisi bulunmayan üçüncü kişilere ait belgeler açıkça istenmediği sürece gönderilmemelidir.",
          "İşlem için gerekli olmayan bilgilerin bulunduğu belgeler değerlendirme dışında bırakılabilir, maskelenebilir veya ilgili saklama ve imha kuralları çerçevesinde sistemlerden kaldırılabilir.",
          "Özel nitelikli kişisel veriler yalnızca ilgili mevzuatta belirtilen işleme şartlarından birinin bulunması ve gerekli güvenlik tedbirlerinin alınması hâlinde işlenir.",
        ],
      },
      {
        heading: "11 Bilgilerin saklanması ve silinmesi",
        paragraphs: [
          "Bilgiler; teklifin hazırlanması, başvurunun sonuçlandırılması, poliçe işlemlerinin yürütülmesi, müşteri desteğinin sağlanması ve yasal yükümlülüklerin yerine getirilmesi için gerekli olan süre boyunca saklanır.",
          "Saklama süreleri belirlenirken aşağıdaki hususlar dikkate alınır:",
        ],
        items: [
          "İşlemin tamamlanma durumu",
          "Poliçe ilişkisinin devam edip etmediği",
          "İlgili mevzuatta öngörülen saklama süreleri",
          "Olası uyuşmazlık ve zamanaşımı süreleri",
          "Sistem güvenliği ve kötüye kullanımın önlenmesi gereklilikleri",
        ],
        closing: [
          "Saklama amacı sona eren ve işlenmesini gerektiren başka bir hukuki sebep bulunmayan bilgiler, kişisel veri saklama ve imha politikaları doğrultusunda silinir, yok edilir veya anonim hâle getirilir.",
        ],
      },
      {
        heading: "12 Bilgi güvenliği",
        paragraphs: [
          "Kişisel bilgilerin yetkisiz erişime, kayba, kötüye kullanıma, izinsiz açıklanmaya ve değiştirilmeye karşı korunması amacıyla uygun teknik ve idari güvenlik tedbirleri uygulanır.",
          "Bu kapsamda veri iletiminde SSL/TLS tabanlı güvenli bağlantı teknolojilerinden, erişim yetkilendirmelerinden, sistem kayıtlarından, güvenlik kontrollerinden ve gerekli diğer koruma yöntemlerinden yararlanılır.",
          "Admin paneli ve müşteri takip sistemlerindeki bilgilere erişim, görevleri gereği bu bilgilere ulaşması gereken yetkili kişilerle sınırlandırılır.",
          "Bununla birlikte internet üzerinden gerçekleştirilen hiçbir veri aktarımının veya elektronik saklama yönteminin tamamen risksiz olduğu garanti edilemez. Kullanıcıların da cihaz, hesap ve iletişim güvenliğine dikkat etmesi gerekir.",
        ],
      },
      {
        heading: "13 Kullanıcı hakları ve başvuru",
        paragraphs: [
          "Kullanıcılar, kişisel verileriyle ilgili olarak aşağıdaki haklara sahiptir:",
        ],
        items: [
          "Kişisel verilerinin işlenip işlenmediğini öğrenme",
          "İşlenmişse buna ilişkin bilgi talep etme",
          "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme",
          "Verilerin aktarıldığı taraflar hakkında bilgi isteme",
          "Eksik veya yanlış işlenen verilerin düzeltilmesini isteme",
          "Kanundaki şartların oluşması hâlinde verilerin silinmesini veya yok edilmesini isteme",
          "Düzeltme, silme ve yok etme işlemlerinin verilerin aktarıldığı taraflara bildirilmesini isteme",
          "Otomatik sistemler sonucunda aleyhe bir durum ortaya çıkmasına itiraz etme",
          "Kanuna aykırı veri işleme nedeniyle zarara uğraması hâlinde zararın giderilmesini isteme",
        ],
        closing: [
          "Kişisel verilere ilişkin resmî başvuru yöntemleri ve iletişim bilgileri KVKK Aydınlatma Metni içerisinde açıklanmaktadır.",
          "Gizlilik uygulamalarıyla ilgili genel sorular için aşağıdaki iletişim kanalları kullanılabilir:",
          `E-posta: ${CONTACT_EMAIL}`,
          `Telefon: ${CONTACT_PHONE_DISPLAY}`,
        ],
      },
      {
        heading: "14 Politika değişiklikleri",
        paragraphs: [
          "Bu Gizlilik Politikası; internet sitesindeki hizmetlerin, kullanılan teknik altyapının, iş süreçlerinin veya ilgili mevzuatın değişmesi hâlinde güncellenebilir.",
          "Önemli değişiklikler güncel tarih bilgisiyle birlikte bu sayfada yayımlanır. Politikanın güncel sürümü yayımlandığı tarihten itibaren geçerli olur.",
        ],
      },
    ],
    summary:
      "Gizlilik politikası: toplanan bilgiler, kullanım amaçları, paylaşım, WhatsApp, çerezler, saklama ve kullanıcı hakları.",
  },
  {
    path: ROUTES.cookies,
    title: "Çerez Politikası",
    description:
      "sigortauzmani.net çerez politikası. Çerez türleri, saklama süreleri, hukuki sebepler, tercih yönetimi ve üçüncü taraf hizmetler.",
    h1: "Çerez Politikası",
    updatedAt: "29 Temmuz 2026",
    eyebrow: "Yasal metinler",
    intro: [],
    sections: [
      {
        heading: "01 Amaç ve kapsam",
        paragraphs: [
          "Bu Çerez Politikası, sigortauzmani.net internet sitesi (“Site”) ziyaret edildiğinde kullanılan çerezler ve benzer teknolojiler hakkında bilgi vermek amacıyla hazırlanmıştır.",
          "Politika; kullanılan teknolojilerin amaçlarını, türlerini, saklama sürelerini, hukuki sebeplerini ve kullanıcıların çerez tercihlerini nasıl yönetebileceğini açıklamaktadır.",
          "Kişisel verilerin işlenmesine ilişkin ayrıntılı bilgiler KVKK Aydınlatma Metni ve Gizlilik Politikası içerisinde yer almaktadır.",
        ],
      },
      {
        heading: "02 Çerez nedir?",
        paragraphs: [
          "Çerezler, bir internet sitesi ziyaret edildiğinde tarayıcı aracılığıyla kullanıcının cihazına kaydedilebilen küçük metin dosyalarıdır.",
          "Çerezler; internet sitesinin güvenli ve düzgün çalışması, kullanıcı tercihlerinin hatırlanması, oturum işlemlerinin yürütülmesi, site performansının ölçülmesi, hizmetlerin geliştirilmesi ve kullanıcıya daha uygun içeriklerin sunulması gibi amaçlarla kullanılabilir.",
          "Çerezlere ek olarak tarayıcı yerel depolaması, oturum depolaması, piksel, etiket ve benzeri teknolojiler de kullanılabilir. Bu Politikada geçen “çerez” ifadesi, uygun olduğu ölçüde bu teknolojileri de kapsamaktadır.",
        ],
      },
      {
        heading: "03 Çerezlerin sınıflandırılması",
        paragraphs: [
          "Kullanım süresine göre:",
        ],
        items: [
          "Oturum çerezleri: Tarayıcı kapatıldığında veya oturum sona erdiğinde silinen geçici çerezlerdir.",
          "Kalıcı çerezler: Belirlenen saklama süresi boyunca veya kullanıcı tarafından silinene kadar cihazda kalan çerezlerdir.",
        ],
      },
      {
        heading: "03 Kaynağına göre",
        items: [
          "Birinci taraf çerezleri: Doğrudan sigortauzmani.net tarafından yerleştirilen çerezlerdir.",
          "Üçüncü taraf çerezleri: Site üzerinde kullanılan analiz, reklam, iletişim, güvenlik, video, harita veya sosyal medya hizmetleri tarafından yerleştirilebilen çerezlerdir.",
        ],
      },
      {
        heading: "03 Kullanım amacına göre",
        items: [
          "Zorunlu çerezler: Sitenin güvenli ve doğru biçimde çalışabilmesi, formların kullanılabilmesi, kullanıcı tercihlerinin hatırlanması ve güvenlik kontrollerinin gerçekleştirilmesi için gerekli olan çerezlerdir.",
          "İşlevsel çerezler: Dil, görünüm, bölge, iletişim veya benzeri kullanıcı tercihlerinin hatırlanmasını ve Site özelliklerinin kişiselleştirilmesini sağlayan çerezlerdir.",
          "Performans ve analiz çerezleri: Site kullanımının ölçülmesi, ziyaretçi hareketlerinin istatistiksel olarak değerlendirilmesi, hata ve performans sorunlarının tespit edilmesi ve hizmetlerin geliştirilmesi amacıyla kullanılan çerezlerdir.",
          "Reklam ve pazarlama çerezleri: Kullanıcının ilgi alanlarına göre içerik veya reklam sunulması, reklam kampanyalarının ölçülmesi, reklamların tekrar gösterim sıklığının sınırlandırılması ve pazarlama çalışmalarının değerlendirilmesi amacıyla kullanılan çerezlerdir.",
        ],
      },
      {
        heading: "04 Site üzerinde kullanılan çerezler",
        paragraphs: [
          "Site üzerinde zorunlu, işlevsel, performans ve analiz, reklam ve pazarlama çerezleri kullanılabilir.",
          "Zorunlu çerezler; Sitenin çalışması, formların güvenli biçimde gönderilmesi, oturum bütünlüğünün korunması, kullanıcının çerez tercihlerinin hatırlanması, zararlı trafik ve kötüye kullanım girişimlerinin önlenmesi amacıyla kullanılır.",
          "İşlevsel çerezler; kullanıcının Site üzerindeki tercihlerini hatırlamak, daha kişiselleştirilmiş bir kullanım deneyimi sunmak ve tercih edilen özelliklerin sonraki ziyaretlerde korunmasını sağlamak amacıyla kullanılır.",
          "Performans ve analiz çerezleri; ziyaret edilen sayfalar, Site üzerinde geçirilen süre, kullanılan cihaz ve tarayıcı türü, yönlendirme kaynağı, sayfa görüntüleme sayısı ve teknik hata kayıtları gibi bilgilerin istatistiksel olarak değerlendirilmesini sağlar.",
          "Reklam ve pazarlama çerezleri; Siteye yapılan ziyaretlerin reklam kampanyalarıyla ilişkilendirilmesi, reklamların etkinliğinin ölçülmesi, kullanıcıya daha uygun içeriklerin sunulması ve reklam gösterimlerinin yönetilmesi amacıyla kullanılabilir.",
          "Zorunlu olmayan çerezler, kullanıcı tarafından çerez tercih paneli üzerinden izin verilmeden çalıştırılmaz. Kullanıcı, istediği çerez kategorisine ayrı ayrı izin verebilir veya daha önce verdiği izni geri alabilir.",
        ],
      },
      {
        heading: "05 Çerezlerin kullanım ve saklama süreleri",
        paragraphs: [
          "Oturum çerezleri, kullanıcının Siteyi ziyaret ettiği süre boyunca kullanılır ve tarayıcı kapatıldığında silinir.",
          "Sitenin güvenliği, form işlemleri ve oturum bütünlüğü için kullanılan zorunlu çerezler, kullanım amaçlarının gerektirdiği süre boyunca saklanır.",
          "Kullanıcının çerez tercihlerini hatırlayan kayıtlar en fazla 6 ay süreyle saklanabilir. Bu sürenin sonunda kullanıcıdan çerez tercihlerini yeniden belirtmesi istenebilir.",
          "İşlevsel çerezler, ilgili kullanıcı tercihinin hatırlanması için gerekli olan süre boyunca ve en fazla 12 ay süreyle saklanabilir.",
          "Performans ve analiz çerezleri, istatistiksel değerlendirme ve hizmet geliştirme amaçlarıyla en fazla 12 ay süreyle saklanabilir.",
          "Reklam ve pazarlama çerezleri, kullanıcının verdiği izin ve ilgili hizmet sağlayıcının teknik ayarları doğrultusunda en fazla 12 ay süreyle saklanabilir.",
          "Kullanılan çerezlerin teknik isimleri, sağlayıcıları, amaçları ve güncel saklama süreleri Çerez Tercihleri paneli üzerinden görüntülenebilir.",
          "Çerezlerin içerisine T.C. kimlik numarası, telefon numarası, e-posta adresi, plaka, ruhsat bilgisi veya teklif formlarına girilen diğer sigorta bilgileri kaydedilmez.",
        ],
      },
      {
        heading: "06 Çerezlerin kullanım amaçları",
        paragraphs: [
          "Çerezler ve benzer teknolojiler aşağıdaki amaçlarla kullanılabilir:",
        ],
        items: [
          "Sitenin güvenli ve doğru biçimde çalışmasının sağlanması.",
          "Sayfalar ve formlar arasında işlem bütünlüğünün korunması.",
          "Çerez tercihlerinin hatırlanması.",
          "Zararlı trafik, otomatik istek, spam ve kötüye kullanım girişimlerinin önlenmesi.",
          "Teknik hata ve güvenlik sorunlarının tespit edilmesi.",
          "Site performansının ve ziyaretçi kullanımının ölçülmesi.",
          "Kullanıcı deneyiminin geliştirilmesi.",
          "Kullanıcı tercihlerine uygun içeriklerin sunulması.",
          "Reklam ve tanıtım çalışmalarının ölçülmesi.",
          "Reklamların etkinliğinin ve yönlendirme kaynaklarının değerlendirilmesi.",
          "Site altyapısının ve hizmet sürekliliğinin korunması.",
        ],
      },
      {
        heading: "07 Çerezlerin hukuki sebepleri",
        paragraphs: [
          "Sitenin çalışması ve güvenliği için gerekli olan zorunlu çerezler; hizmetin kullanıcı tarafından açıkça talep edilmesi, sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması ve veri sorumlusunun meşru menfaatleri kapsamında kullanılabilir.",
          "Çerez tercihinin hatırlanmasını sağlayan kayıtlar, kullanıcının seçiminin korunması ve tercih panelinin her sayfada tekrar gösterilmemesi amacıyla kullanılmaktadır.",
          "İşlevsel, performans, analiz, reklam, pazarlama ve takip çerezleri kullanıcının açık rızasına dayanılarak kullanılır.",
          "Kullanıcının yalnızca Siteyi ziyaret etmesi veya Siteyi kullanmaya devam etmesi açık rıza olarak kabul edilmez. Açık rıza, kullanıcının çerez tercih paneli üzerinden aktif bir seçim yapmasıyla alınır.",
        ],
      },
      {
        heading: "08 Çerez tercihlerinin yönetilmesi",
        paragraphs: [
          "Kullanıcılar, Site altında yer alan “Çerez Tercihleri” bağlantısı üzerinden tercihlerini görüntüleyebilir ve değiştirebilir.",
          "Çerez tercih panelinde kullanıcılara aşağıdaki seçenekler sunulur:",
        ],
        items: [
          "Tüm çerezleri kabul etme.",
          "Zorunlu olmayan tüm çerezleri reddetme.",
          "Çerez kategorilerini ayrı ayrı yönetme.",
          "Daha önce verilen izinleri geri alma.",
        ],
        closing: [
          "Zorunlu olmayan çerezler varsayılan olarak kapalı tutulur ve kullanıcı tarafından aktif bir seçim yapılmadan çalıştırılmaz.",
          "Kullanıcılar ayrıca tarayıcı ayarları üzerinden çerezleri görüntüleyebilir, silebilir veya engelleyebilir. Zorunlu çerezlerin engellenmesi hâlinde Sitenin bazı bölümleri veya formları beklenen şekilde çalışmayabilir.",
          "Açık rızanın geri alınması, geri alma işleminden önce gerçekleştirilen veri işleme faaliyetlerinin hukuka uygunluğunu etkilemez.",
        ],
      },
      {
        heading: "09 Üçüncü taraf hizmetler ve bağlantılar",
        paragraphs: [
          "Site üzerinde analiz, reklam, güvenlik, iletişim, video, harita, sosyal medya ve benzeri hizmetler sunan üçüncü taraf araçları kullanılabilir.",
          "Bu hizmetler, kullanıcı izin verdiğinde kendi çerezlerini veya benzer teknolojilerini kullanabilir. Üçüncü taraf hizmet sağlayıcılar tarafından gerçekleştirilen veri işleme faaliyetleri, ilgili hizmet sağlayıcının gizlilik ve çerez kurallarına da tabi olabilir.",
          "Site üzerinde WhatsApp, sosyal medya platformları veya diğer internet sitelerine yönlendiren bağlantılar bulunabilir. Kullanıcı bu bağlantılara tıklayarak başka bir hizmete geçtiğinde ilgili hizmet sağlayıcının gizlilik ve çerez uygulamaları geçerli olabilir.",
          "Açık rıza gerektiren üçüncü taraf teknolojileri, kullanıcı izni alınmadan yüklenmez ve çalıştırılmaz.",
        ],
      },
      {
        heading: "10 Çerezler aracılığıyla işlenebilecek bilgiler",
        paragraphs: [
          "Kullanılan çerezin niteliğine göre aşağıdaki teknik bilgiler işlenebilir:",
        ],
        items: [
          "Çerez veya oturum tanımlayıcısı.",
          "Çerez tercih bilgisi.",
          "IP adresi.",
          "Tarayıcı ve cihaz bilgileri.",
          "İşletim sistemi bilgisi.",
          "Erişim tarihi ve saati.",
          "Görüntülenen sayfalar.",
          "Site üzerinde geçirilen süre.",
          "Tıklama ve yönlendirme bilgileri.",
          "Trafik ve yönlendirme kaynağı.",
          "Yaklaşık konum bilgisi.",
          "Reklam ve kampanya etkileşim bilgileri.",
          "Form güvenliği ve kötüye kullanım önleme kayıtları.",
        ],
        closing: [
          "Bu bilgiler yalnızca gerekli olduğu ölçüde ve ilgili kullanım amacıyla sınırlı olarak işlenir.",
        ],
      },
      {
        heading: "11 Bilgilerin paylaşılması",
        paragraphs: [
          "Çerezler ve benzer teknolojiler aracılığıyla elde edilen teknik bilgiler, kullanım amacının gerektirdiği ölçüde aşağıdaki taraflarla paylaşılabilir:",
        ],
        items: [
          "Barındırma ve sunucu hizmeti sağlayıcıları.",
          "Analiz ve performans hizmeti sağlayıcıları.",
          "Reklam ve pazarlama hizmeti sağlayıcıları.",
          "Güvenlik, trafik yönetimi ve kötüye kullanım önleme hizmeti sağlayıcıları.",
          "İletişim ve sosyal medya hizmeti sağlayıcıları.",
          "Teknik bakım ve destek hizmeti sağlayan yetkili kuruluşlar.",
          "Yasal zorunluluk bulunması hâlinde yetkili kamu kurumları ve adli merciler.",
        ],
        closing: [
          "Çerez verileri üçüncü kişilere ticari veri listesi olarak satılmaz veya kiralanmaz.",
        ],
      },
      {
        heading: "12 Yurt dışına veri aktarımı",
        paragraphs: [
          "Sitenin barındırma, analiz, reklam, iletişim, güvenlik veya teknik altyapısında yurt dışında bulunan hizmet sağlayıcılardan yararlanılması hâlinde bazı teknik bilgiler yurt dışında işlenebilir veya bu bilgilere yurt dışından erişilebilir.",
          "Bu işlemler, 6698 sayılı Kişisel Verilerin Korunması Kanunu’nun 9. maddesinde belirtilen yurt dışına aktarım şartları ve gerekli güvenceler çerçevesinde gerçekleştirilir.",
          "Açık rızaya dayanan üçüncü taraf çerezler kapsamında yurt dışına veri aktarımı yapılması hâlinde kullanıcıya gerekli bilgilendirme sunulur ve ilgili tercih çerez paneli üzerinden alınır.",
        ],
      },
      {
        heading: "13 Bilgilerin güvenliği",
        paragraphs: [
          "Çerezler ve benzer teknolojiler aracılığıyla elde edilen bilgilerin yetkisiz erişime, kayba, kötüye kullanıma, izinsiz açıklanmaya veya değiştirilmeye karşı korunması amacıyla uygun teknik ve idari güvenlik tedbirleri uygulanır.",
          "Üçüncü taraf hizmet sağlayıcıların seçiminde veri güvenliği, erişim yetkileri, saklama süreleri ve kişisel verilerin korunmasına ilişkin yükümlülükler dikkate alınır.",
        ],
      },
      {
        heading: "14 Kullanıcı hakları",
        paragraphs: [
          "Kullanıcılar, çerezler aracılığıyla işlenen kişisel verileriyle ilgili haklarını KVKK Aydınlatma Metni içerisinde belirtilen yöntemlerle kullanabilir.",
          "Çerez ve gizlilik uygulamalarıyla ilgili genel sorular aşağıdaki iletişim kanalları üzerinden iletilebilir:",
          `E-posta: ${CONTACT_EMAIL}`,
          `Telefon: ${CONTACT_PHONE_DISPLAY}`,
        ],
      },
      {
        heading: "15 Politikanın güncellenmesi",
        paragraphs: [
          "Bu Çerez Politikası; Sitede kullanılan teknolojilerin, hizmet sağlayıcıların, çerezlerin, iş süreçlerinin veya ilgili mevzuatın değişmesi hâlinde güncellenebilir.",
          "Politikanın güncel sürümü, son güncelleme tarihiyle birlikte bu sayfada yayımlanır.",
        ],
      },
    ],
    summary:
      "Çerez politikası: çerez türleri, saklama süreleri, hukuki sebepler, tercih yönetimi ve üçüncü taraf hizmetler.",
  },
];

export function getLegalDocument(path: string): LegalDocument | undefined {
  return legalDocuments.find((doc) => doc.path === path);
}
