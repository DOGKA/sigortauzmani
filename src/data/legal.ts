/**
 * Yasal metinler. İletişim bilgileri SEO config ile aynı kaynaktan gelir.
 */

import { KVKK_SORUMLU, kvkkVeriSorumlusuLines } from "./company";
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

const KVKK_UPDATED = "1 Eylül 2026";

export const legalDocuments: LegalDocument[] = [
  {
    path: ROUTES.kvkk,
    title: "KVKK Aydınlatma Metni",
    description:
      "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel verilerin işlenmesine ilişkin aydınlatma metni. Veri sorumlusu, işlenen veriler, amaçlar, aktarım ve haklarınız.",
    h1: "Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni",
    updatedAt: KVKK_UPDATED,
    eyebrow: "Kişisel verilerin korunması",
    intro: [],
    sections: [
      {
        heading: "1. Veri sorumlusu",
        paragraphs: [
          `6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) kapsamında kişisel verileriniz, veri sorumlusu sıfatıyla ${KVKK_SORUMLU.unvan} (“Şirket”) tarafından işlenmektedir.`,
          ...kvkkVeriSorumlusuLines(),
        ],
      },
      {
        heading: "2. Hangi verileri işliyoruz?",
        paragraphs: [
          "Kullandığınız hizmete göre aşağıdaki kişisel veriler işlenebilir:",
        ],
        items: [
          "Ad, soyad, T.C. kimlik numarası, yabancı kimlik numarası veya vergi kimlik numarası gibi kimlik bilgileri",
          "Telefon numarası ve e-posta adresi gibi iletişim bilgileri",
          "Doğum tarihi ve sigorta teklifi için gerekli müşteri bilgileri",
          "Plaka, ruhsat, araç, kullanım şekli ve hasar bilgileri",
          "Adres, UAVT/adres kodu, bina ve taşınmaz bilgileri",
          "Talep edilen sigorta ürünü, mevcut poliçe, teklif, teminat ve işlem bilgileri",
          "API sorgusu, sigorta şirketi yanıtı, anlık teklif, teklif zamanı, sıralama ve poliçeleştirme bilgileri",
          "Sigorta şirketi tarafından API üzerinden iletilmesi hâlinde ödeme durumu, işlem referansı ve poliçe oluşturma sonucu",
          "Poliçe iptal talebinde paylaşılan noter satış belgesi ve diğer belgeler",
          "İletişim formunda yazılan mesaj ve isteğe bağlı olarak yüklenen dosyalar",
          "IP adresi, tarih-saat, hata, güvenlik ve işlem kayıtları",
        ],
        closing: [
          "Tamamlayıcı Sağlık ve Özel Sağlık teklif formlarında yalnızca anlık teklif alınması ve poliçe sürecinin başlatılması için gerekli kimlik ve iletişim bilgileri toplanır. Web formunda hastalık, teşhis, tedavi, ilaç veya ameliyat bilgisi istenmediği sürece sağlık verisi işlenmez.",
        ],
      },
      {
        heading: "3. Verileri hangi amaçlarla işliyoruz?",
        paragraphs: ["Kişisel verileriniz;"],
        items: [
          "Sigorta teklif talebinizi almak",
          "Talebiniz için bir başvuru veya talep numarası oluşturmak",
          "Kimlik, araç, adres ve sigorta bilgilerini entegre sigorta şirketlerinin API’lerine ve yetkili sigorta bilgi sistemlerine iletmek",
          "Entegre sigorta şirketlerinden anlık fiyat ve teklif sonucu almak",
          "Teklifleri fiyat, teminat, kapsam ve sigorta şirketi bilgileriyle karşılaştırarak size göstermek",
          "Entegrasyonun desteklediği sigorta şirketlerinde kullanıcıyı doğrudan sigorta şirketinin ödeme ekranına yönlendirmek ve poliçeleştirme sonucunu almak",
          "Çevrim içi satın alma entegrasyonu bulunmayan sigorta şirketlerinde işlemi talep numarasıyla WhatsApp temsilcisine aktarmak",
          "Sizinle telefon, e-posta veya WhatsApp üzerinden iletişim kurmak",
          "Seçiminiz hâlinde poliçe düzenleme, ödeme ve satış sonrası destek süreçlerini yürütmek",
          "Poliçe iptal talebinizi almak ve ilgili sigorta şirketine iletmek",
          "İletişim, destek, şikâyet ve KVKK başvurularınızı sonuçlandırmak",
          "Bilgi güvenliğini sağlamak, hataları ve kötüye kullanımı önlemek",
          "Yasal yükümlülükleri yerine getirmek ve gerektiğinde haklarımızı korumak",
        ],
        closing: ["amaçlarıyla işlenir."],
      },
      {
        heading: "4. Kişisel verilerin işlenmesinin hukuki sebepleri",
        paragraphs: ["Kişisel verileriniz, işleme faaliyetine göre;"],
        items: [
          "Bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması",
          "Veri sorumlusunun hukuki yükümlülüğünü yerine getirmesi",
          "Bir hakkın tesisi, kullanılması veya korunması",
          "Temel hak ve özgürlüklerinize zarar vermemek kaydıyla meşru menfaatlerimizin bulunması",
          "Kanunlarda açıkça öngörülmesi",
        ],
        closing: [
          "hukuki sebeplerine dayanılarak işlenir.",
          "Sağlık verisi gibi özel nitelikli kişisel veriler, yalnızca KVKK’nın 6. maddesinde belirtilen uygun işleme şartlarından biri bulunduğunda işlenir. Açık rıza gerektiren bir işlem varsa aydınlatma metninden ayrı ve isteğe bağlı bir açık rıza metni sunulur.",
          "Kampanya ve pazarlama iletileri için gereken izin, teklif ve poliçe işlemlerinden ayrı olarak alınır. Pazarlama izni vermemeniz sigorta hizmeti almanıza engel olmaz.",
        ],
      },
      {
        heading: "5. Verileri nasıl topluyoruz?",
        paragraphs: [
          "Kişisel verileriniz; sigortauzmani.net üzerindeki teklif, API sorgusu, çevrim içi satın alma, iletişim ve poliçe iptal akışları, yüklediğiniz belgeler, telefon, e-posta, WhatsApp görüşmeleri ve hizmetin yürütülmesi sırasında oluşan işlem kayıtları üzerinden otomatik veya kısmen otomatik yöntemlerle toplanır.",
        ],
      },
      {
        heading: "6. Veriler kimlere aktarılabilir?",
        paragraphs: [
          "Kişisel verileriniz, yalnızca ilgili işlem için gerekli olduğu ölçüde;",
        ],
        items: [
          "API üzerinden anlık teklif alınacak veya poliçe düzenleyecek anlaşmalı sigorta şirketlerine",
          "Sigorta mevzuatı kapsamında yetkilendirilmiş bilgi ve gözetim sistemlerine",
          "Web sitesi, barındırma, veri tabanı, dosya saklama, e-posta, SMS, WhatsApp, güvenlik ve müşteri iletişimi hizmeti sağlayan şirketlere",
          "Ödeme işlemi seçilirse kullanıcıyı doğrudan ilgili sigorta şirketinin ödeme ekranına yönlendirmek amacıyla ilgili sigorta şirketine",
          "Hukuk, denetim ve mali müşavirlik hizmeti sağlayan kişilere",
          "Kanunen yetkili kamu kurumlarına, mahkemelere ve denetim mercilerine",
        ],
        closing: [
          "aktarılabilir.",
          "Her veri bütün alıcı gruplarına aktarılmaz. Aktarım, talep ettiğiniz hizmet ve yürütülen işlemle sınırlıdır.",
        ],
      },
      {
        heading: "7. Anlık teklif ve otomatik işlemler",
        paragraphs: [
          "Teklif fiyatları, uygunluk sonuçları ve bazı teminat seçenekleri, entegre sigorta şirketlerinin kendi fiyatlama ve risk değerlendirme kuralları doğrultusunda otomatik olarak oluşturularak siteye iletilebilir. Sigorta Uzmanı bu sonuçları fiyat, teminat ve kapsam bilgileriyle karşılaştırmalı olarak gösterebilir.",
          "Poliçe satın alma kararı kullanıcıya aittir. Kullanıcının seçimi olmadan poliçe satın alınmaz veya ödeme işlemi başlatılmaz. Çevrim içi satın alma seçildiğinde kullanıcı doğrudan ilgili sigorta şirketinin ödeme ekranına yönlendirilir. Kart bilgileri Sigorta Uzmanı tarafından görülmez, işlenmez veya saklanmaz. Çevrim içi satın alma entegrasyonu bulunmayan sigorta şirketlerinde kullanıcı, talep numarasıyla WhatsApp temsilcisine yönlendirilir.",
        ],
      },
      {
        heading: "8. Yurt dışına aktarım",
        paragraphs: [
          "Web sitesi, barındırma, veri tabanı, dosya saklama, güvenlik veya iletişim hizmetlerinin yurt dışında bulunan bir hizmet sağlayıcı üzerinden sunulması hâlinde kişisel veriler, KVKK’nın 9. maddesinde belirtilen şartlar ve uygun güvenceler sağlanarak yurt dışına aktarılabilir.",
        ],
      },
      {
        heading: "9. Verilerin saklanması",
        paragraphs: [
          "Kişisel veriler, ilgili hizmetin yürütülmesi ve yasal yükümlülüklerin yerine getirilmesi için gerekli süre boyunca saklanır. Süre sona erdiğinde veriler, uygulanabilir mevzuat ve Şirketin saklama-imha prosedürüne uygun olarak silinir, yok edilir veya anonim hâle getirilir.",
        ],
      },
      {
        heading: "10. Haklarınız ve başvuru",
        paragraphs: ["KVKK’nın 11. maddesi kapsamında;"],
        items: [
          "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
          "İşlenmişse buna ilişkin bilgi talep etme",
          "İşleme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme",
          "Verilerin aktarıldığı üçüncü kişileri öğrenme",
          "Eksik veya yanlış işlenen verilerin düzeltilmesini isteme",
          "Şartları oluşmuşsa verilerin silinmesini veya yok edilmesini isteme",
          "Düzeltme, silme veya yok etme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme",
          "Münhasıran otomatik sistemlerle analiz sonucunda aleyhinize bir sonuç çıkmasına itiraz etme",
          "Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme",
        ],
        closing: [
          "haklarına sahipsiniz.",
          "Başvurularınızı aşağıdaki kanallardan iletebilirsiniz:",
          `KEP: ${KVKK_SORUMLU.kep}`,
          `Kayıtlı e-posta adresiniz üzerinden: ${KVKK_SORUMLU.eposta}`,
          `Güvenli elektronik imza veya mobil imza ile imzaladığınız başvurular: ${KVKK_SORUMLU.eposta}`,
          "Başvurunuz, talebin niteliğine göre en kısa sürede ve en geç otuz gün içinde sonuçlandırılır. Başvuru yöntemleri ve gerekli bilgiler için KVKK Başvuru Formu sayfasını kullanabilirsiniz.",
        ],
      },
    ],
    summary:
      "KVKK aydınlatma metni: veri sorumlusu, işlenen veriler, amaçlar, aktarım, otomatik işlemler ve başvuru hakları.",
  },
  {
    path: ROUTES.privacy,
    title: "Gizlilik Politikası",
    description:
      "sigortauzmani.net gizlilik politikası. Teklif süreci, form ve dosyalar, ödeme güvenliği, hizmet mesajları ve bilgi güvenliği.",
    h1: "Gizlilik Politikası",
    updatedAt: "1 Eylül 2026",
    eyebrow: "Yasal metinler",
    intro: [
      "Sigorta Uzmanı, sigortauzmani.net üzerinden paylaştığınız bilgilerin güvenliğine ve yalnızca belirtilen amaçlarla kullanılmasına önem verir.",
    ],
    sections: [
      {
        heading: "1. Teklif süreci",
        paragraphs: [
          "Teklif formunda paylaştığınız bilgiler; entegre sigorta şirketlerinin API’lerinden anlık fiyat almak, teklifleri fiyat, teminat ve kapsam bakımından karşılaştırmak ve sonuçları size göstermek için kullanılır.",
          "Seçtiğiniz sigorta şirketinde çevrim içi satın alma entegrasyonu bulunuyorsa doğrudan ilgili sigorta şirketinin ödeme ekranına yönlendirilirsiniz. Ödeme tamamlandıktan sonra poliçeleştirme sonucu entegrasyon üzerinden siteye iletilebilir. Bu entegrasyon bulunmuyorsa talebiniz bir talep numarasıyla WhatsApp temsilcisine aktarılır ve satın alma işlemi temsilci desteğiyle tamamlanır.",
          "Teklif fiyatları ve uygunluk sonuçları, sigorta şirketlerinin kendi fiyatlama ve risk değerlendirme kurallarına göre oluşturulur. Satın alma kararı kullanıcıya aittir; kullanıcı seçmeden poliçe satın alınmaz veya ödeme başlatılmaz.",
        ],
      },
      {
        heading: "2. Form ve dosyalar",
        paragraphs: [
          "İletişim ve poliçe iptal formlarında gönderdiğiniz bilgiler yalnızca talebinizi değerlendirmek ve ilgili işlemi yürütmek için kullanılır.",
          "Belge yüklerken yalnızca istenen belgeyi paylaşmanız ve işlemle ilgisi olmayan bilgileri mümkünse maskelemeniz önerilir. Yüklenen dosyalara erişim sınırlandırılır; dosya türü ve boyutu kontrol edilir ve güvenlik önlemleri uygulanır.",
        ],
      },
      {
        heading: "3. Başka kişilere ait bilgiler",
        paragraphs: [
          "Eşiniz, çocuğunuz, çalışanınız veya başka bir kişi adına bilgi giriyorsanız bu bilgileri paylaşmaya ve ilgili kişi adına işlem yapmaya yetkili olmanız gerekir. Çocuklar veya kısıtlı kişiler adına işlemler veli, vasi veya yetkili temsilci üzerinden yürütülmelidir.",
        ],
      },
      {
        heading: "4. Hizmet mesajları ve pazarlama",
        paragraphs: [
          "Talep numarası, teklif durumu, poliçe işlemi, ödeme sonucu, iptal süreci veya güvenlik bildirimi gibi mevcut işleminizle doğrudan ilgili hizmet mesajları gönderilebilir.",
          "Kampanya ve pazarlama mesajları ise yalnızca ayrıca izin vermeniz hâlinde seçtiğiniz iletişim kanallarından gönderilir. Pazarlama izni vermemeniz teklif veya poliçe işleminizi etkilemez.",
        ],
      },
      {
        heading: "5. Ödeme güvenliği",
        paragraphs: [
          "Çevrim içi satın alma sırasında kullanıcı doğrudan ilgili sigorta şirketinin ödeme ekranına yönlendirilir. Kart numarası, son kullanma tarihi ve CVV bilgisi sigorta şirketinin ödeme ekranına girilir. Sigorta Uzmanı bu bilgileri görmez, işlemez ve saklamaz. Sigorta şirketi tarafından entegrasyon üzerinden iletilmesi hâlinde yalnızca ödemenin başarılı veya başarısız olduğu bilgisi, işlem referansı, prim tutarı ve poliçeleştirme sonucu işlem kaydı kapsamında tutulabilir.",
        ],
      },
      {
        heading: "6. Bilgi güvenliği",
        paragraphs: [
          "Kişisel verilerin yetkisiz erişime, kayba, değişikliğe veya açıklanmaya karşı korunması için erişim kontrolü, şifreleme, güvenli bağlantı, kayıt izleme, yedekleme ve çalışan yetkilendirmesi gibi uygun teknik ve idari önlemler uygulanır.",
        ],
      },
      {
        heading: "7. Ayrıntılı bilgi",
        paragraphs: [
          "Kişisel verilerin hangi amaçlarla ve hangi hukuki sebeplerle işlendiğine ilişkin ayrıntılı bilgi için KVKK Aydınlatma Metni’ni inceleyebilirsiniz.",
        ],
      },
    ],
    summary:
      "Gizlilik politikası: teklif süreci, form ve dosyalar, ödeme güvenliği, hizmet mesajları ve bilgi güvenliği.",
  },
  {
    path: ROUTES.cookies,
    title: "Çerez ve Benzeri Teknolojiler Politikası",
    description:
      "sigortauzmani.net çerez ve benzeri teknolojiler politikası. Google analiz araçları, kullanılan veriler ve tercih yönetimi.",
    h1: "Çerez ve Benzeri Teknolojiler Politikası",
    updatedAt: "11 Eylül 2026",
    eyebrow: "Yasal metinler",
    intro: [],
    sections: [
      {
        heading: "1. Çerez nedir?",
        paragraphs: [
          "Çerezler, bir web sitesi ziyaret edildiğinde tarayıcıya kaydedilebilen küçük metin dosyalarıdır. Benzer amaçlarla localStorage ve sessionStorage gibi tarayıcı depolama yöntemleri de kullanılabilir. Bu politikada “çerez” ifadesi, aksi belirtilmedikçe bu benzeri teknolojileri de kapsar.",
        ],
      },
      {
        heading: "2. Mevcut kullanım",
        paragraphs: [
          "Sitenin güvenli şekilde çalışması, form adımlarının yürütülmesi ve kötüye kullanımın önlenmesi için kesinlikle gerekli teknik kayıtlar kullanılabilir. Bu kayıtlar pazarlama amacıyla kullanılmaz.",
          "Analiz, tercih ve pazarlama teknolojileri yalnızca çerez tercih banner’ında veya tercih merkezinde ilgili kategoriye onay vermeniz hâlinde çalıştırılır. Onay vermeden zorunlu olmayan araçlar yüklenmez.",
          "Tercihleriniz tarayıcınızda saklanır; footer’daki “Çerez Tercihleri” bağlantısından dilediğiniz zaman değiştirebilirsiniz.",
        ],
      },
      {
        heading: "3. Analiz hizmeti",
        paragraphs: [
          "Analiz kategorisine onay verirseniz, yönetim ayarlarında etkin olan tek sağlayıcı olarak Google Analytics 4 veya Google Tag Manager yüklenebilir. Bu araçlar ziyaret edilen sayfa yolu, ziyaret zamanı, yaklaşık konum, cihaz, tarayıcı ve etkileşim bilgileri gibi çevrim içi tanımlayıcılarla ilişkili kullanım verilerini Google’a iletebilir.",
          "Google Analytics 4 kullanıldığında _ga ve _ga_<ölçüm-kodu> gibi analiz çerezleri kullanılabilir; bu çerezlerin olağan saklama süresi en fazla iki yıldır. Google Tag Manager bir etiket yönetim aracıdır; kendi başına analiz çerezi yerleştirmese de yalnızca onay verdiğiniz analiz kategorisi kapsamında yapılandırılmış etiketleri çalıştırabilir.",
          "Google, verileri yurt dışındaki sunucularında işleyebilir. Aktarımlar uygulanabilir mevzuattaki şartlar ve uygun güvenceler çerçevesinde gerçekleştirilir. Ayrıntılar Google’ın gizlilik ve veri kullanımı açıklamalarında yer alır.",
          "Google Consent Mode v2 başlangıçta analiz ve reklam depolamasını reddedilmiş olarak ayarlar. Analiz onayı verdiğinizde yalnızca analiz depolaması etkinleştirilir; pazarlama onayı ayrı olsa dahi bu sürümde reklam etiketleri yüklenmez. Onayınızı geri çektiğinizde analiz depolaması yeniden reddedilir ve yeni analiz olayları gönderilmez.",
        ],
      },
      {
        heading: "4. Üçüncü taraf bağlantıları",
        paragraphs: [
          "Web sitesinde telefon, e-posta, WhatsApp veya başka bir üçüncü taraf hizmetine yönlendiren bağlantılar bulunabilir. Bu bağlantıyı seçmeniz hâlinde ilgili hizmet sağlayıcının kendi gizlilik ve çerez kuralları uygulanır.",
        ],
      },
      {
        heading: "5. Tercihlerin yönetilmesi",
        paragraphs: [
          "Tarayıcınızın ayarlarını kullanarak çerezleri görüntüleyebilir, silebilir veya engelleyebilirsiniz. Kesinlikle gerekli teknolojilerin engellenmesi hâlinde sitenin bazı temel işlevleri çalışmayabilir.",
          "Banner ve tercih merkezinde “Zorunlu olmayanları reddet”, “Tercihleri yönet” ve “Tümünü kabul et” seçenekleri sunulur. Analiz onayınızı geri çekmeniz, daha önce tarayıcınıza yazılmış çerezleri otomatik olarak silmeyebilir; bunları tarayıcı ayarlarınızdan silebilirsiniz.",
        ],
      },
      {
        heading: "6. İletişim",
        paragraphs: [
          `Çerez ve benzeri teknolojilerle ilgili sorularınızı ${KVKK_SORUMLU.eposta} adresine iletebilirsiniz.`,
        ],
      },
    ],
    summary:
      "Çerez ve benzeri teknolojiler politikası: Google analiz araçları, kullanılan veriler, yurt dışı aktarım ve tercih yönetimi.",
  },
  {
    path: ROUTES.kvkkBasvuru,
    title: "KVKK Başvuru Formu",
    description:
      "6698 sayılı KVKK kapsamında kişisel veri taleplerinizi iletebileceğiniz başvuru kanalları, gerekli bilgiler, talep konuları ve sonuçlandırma süresi.",
    h1: "KVKK Başvuru Formu",
    updatedAt: KVKK_UPDATED,
    eyebrow: "Kişisel verilerin korunması",
    intro: [
      `6698 sayılı Kişisel Verilerin Korunması Kanunu’nun 11. maddesi kapsamındaki taleplerinizi ${KVKK_SORUMLU.unvan}’na iletebilirsiniz.`,
    ],
    sections: [
      {
        heading: "Başvuru kanalları",
        paragraphs: [
          `KEP adresi: ${KVKK_SORUMLU.kep}`,
          `Şirket sisteminde kayıtlı e-posta adresiniz üzerinden: ${KVKK_SORUMLU.eposta}`,
          `Güvenli elektronik imza veya mobil imza ile imzaladığınız başvurular: ${KVKK_SORUMLU.eposta}`,
        ],
      },
      {
        heading: "Başvuruda bulunması gereken bilgiler",
        paragraphs: ["Başvurunuzda aşağıdaki bilgilere yer verin:"],
        items: [
          "Ad ve soyad",
          "T.C. kimlik numarası; yabancılar için uyruğu, pasaport numarası veya kimlik numarası",
          "Tebligata esas yerleşim yeri veya iş yeri adresi",
          "Varsa bildirime esas e-posta adresi ve telefon numarası",
          "Talebin konusu ve ayrıntılı açıklaması",
          "Talebi destekleyen bilgi ve belgeler",
          "Tercih ettiğiniz yanıt yöntemi",
        ],
      },
      {
        heading: "Talep konuları",
        paragraphs: [
          "Başvurunuzda aşağıdaki taleplerden birini veya birkaçını belirtebilirsiniz:",
        ],
        items: [
          "Kişisel verilerimin işlenip işlenmediğini öğrenmek",
          "İşlenen kişisel verilerim hakkında bilgi talep etmek",
          "İşleme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenmek",
          "Verilerimin aktarıldığı üçüncü kişileri öğrenmek",
          "Eksik veya yanlış işlenen verilerin düzeltilmesini istemek",
          "Şartları oluşmuşsa verilerin silinmesini veya yok edilmesini istemek",
          "Düzeltme, silme veya yok etme işlemlerinin üçüncü kişilere bildirilmesini istemek",
          "Münhasıran otomatik sistemlerle analiz sonucu aleyhime bir sonuca itiraz etmek",
          "Kanuna aykırı işleme nedeniyle zararımın giderilmesini istemek",
          "Açık rızamı geri çekmek",
        ],
      },
      {
        heading: "Sonuçlandırma süresi",
        paragraphs: [
          "Başvurular, talebin niteliğine göre en kısa sürede ve en geç otuz gün içinde sonuçlandırılır. Başvurunun ayrıca bir maliyet gerektirmesi hâlinde mevzuatta belirlenen ücretler talep edilebilir.",
          "Kimlik doğrulama için gerekli olmayan kimlik kartı fotokopisini göndermeyin. Kimlik belgesi istenmesi hâlinde fotoğraf, seri numarası ve işlemle ilgisi olmayan alanları maskeleyebilirsiniz.",
        ],
      },
    ],
    summary:
      "KVKK başvuru kanalları, başvuruda yer alması gereken bilgiler, talep konuları ve sonuçlandırma süresi.",
  },
];

export function getLegalDocument(path: string): LegalDocument | undefined {
  return legalDocuments.find((doc) => doc.path === path);
}
