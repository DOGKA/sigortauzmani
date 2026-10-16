/**
 * Teklif sayfalarının altındaki rehber metinleri.
 *
 * Aynı veri sayfadaki bölümü, botlara sunulan HTML'i (api/prerender.ts),
 * FAQPage şemasını ve llms-full.txt'yi besler; kullanıcı ile botun gördüğü
 * metin birebir aynı kalmalı. Yalnızca Türkçe.
 *
 * Mevzuat rakamları SEDDK kaynaklıdır; her yıl başında `guncelleme` ile
 * birlikte gözden geçirilmeli.
 */

export interface GuideTable {
  caption: string;
  head: string[];
  rows: string[][];
}

export interface GuideSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  table?: GuideTable;
  note?: string;
}

export interface GuideFaq {
  question: string;
  answer: string;
}

export interface GuideLink {
  label: string;
  path: string;
}

export interface ProductGuide {
  heading: string;
  /** Soruya doğrudan yanıt veren ilk paragraf; yanıt motorları buradan alıntılar. */
  summary: string;
  sections: GuideSection[];
  faqHeading: string;
  faq: GuideFaq[];
  related: GuideLink[];
  /** ISO tarih; sayfada "Son güncelleme" olarak gösterilir. */
  guncelleme: string;
  kaynak: GuideLink;
}

const GUIDES: Record<string, ProductGuide> = {
  "trafik-sigortasi": {
    heading: "Trafik sigortası rehberi 2026",
    summary:
      "Zorunlu trafik sigortası, aracınızla bir kazaya karıştığınızda karşı tarafa verdiğiniz maddi ve bedeni zararları poliçe limitleri dahilinde karşılayan, 2918 sayılı Karayolları Trafik Kanunu gereği her motorlu araç için yaptırılması zorunlu olan sigortadır. 2026 yılında araç başına maddi zarar limiti 400.000 TL, kişi başına bedeni zarar limiti 3.600.000 TL'dir. Kendi aracınızdaki hasarı karşılamaz; bunun için kasko gerekir.",
    sections: [
      {
        heading: "2026 trafik sigortası teminat limitleri",
        paragraphs: [
          "Teminat limitleri, sigorta şirketinin bir kazada ödeyebileceği en yüksek tutardır ve her yıl SEDDK tarafından belirlenir. 1 Ocak 2026'dan itibaren limitler yaklaşık %33 artırıldı; yeni tutarlar yürürlükteki tüm poliçelere ek prim alınmadan uygulanır.",
          "Maddi zarar ve kişi başı bedeni zarar limitleri tüm araç gruplarında aynıdır. Araç grubuna göre değişen tek kalem, bir kazada ödenebilecek toplam bedeni zarar tutarıdır. Sağlık gideri ile sakatlanma ve ölüm teminatları ayrı ayrı işler.",
        ],
        table: {
          caption: "01.01.2026 – 31.12.2026 dönemi zorunlu trafik sigortası teminat limitleri",
          head: [
            "Araç grubu",
            "Maddi (araç başına)",
            "Maddi (kaza başına)",
            "Bedeni (kişi başına)",
            "Bedeni (kaza başına)",
          ],
          rows: [
            ["Otomobil, taksi ve insan taşıyan araçlar", "400.000 TL", "800.000 TL", "3.600.000 TL", "18.000.000 TL"],
            ["Kamyonet, kamyon, römork ve iş makineleri", "400.000 TL", "800.000 TL", "3.600.000 TL", "36.000.000 TL"],
            ["Traktör ve özel amaçlı araçlar", "400.000 TL", "800.000 TL", "3.600.000 TL", "18.000.000 TL"],
            ["Motosiklet ve yük motosikleti", "400.000 TL", "800.000 TL", "3.600.000 TL", "10.800.000 TL"],
          ],
        },
        note: "Bedeni teminat; sağlık gideri ile sakatlanma ve ölüm (destekten yoksun kalma) teminatları için ayrı ayrı uygulanır.",
      },
      {
        heading: "Trafik sigortası neleri karşılar?",
        paragraphs: [
          "Trafik sigortası sizi değil, kazada zarar verdiğiniz üçüncü kişileri korur. Kusurlu olduğunuz bir kazada karşı tarafın zararını sizin yerinize sigorta şirketi öder.",
        ],
        bullets: [
          "Karşı tarafın aracında ve eşyalarında oluşan maddi hasar",
          "Kazada yaralanan üçüncü kişilerin sağlık giderleri",
          "Kalıcı sakatlık ve geçici iş göremezlik tazminatı",
          "Hayatını kaybeden kişinin yakınlarına ödenen destekten yoksun kalma tazminatı",
          "Kendi aracınızdaki yolcuların bedeni zararları",
        ],
      },
      {
        heading: "Trafik sigortası neleri karşılamaz?",
        paragraphs: [
          "Poliçe yalnızca karşı tarafa verilen zararlarla sınırlıdır. Aşağıdaki durumlar kapsam dışında kalır ve ayrı bir sigorta gerektirir.",
        ],
        bullets: [
          "Kendi aracınızda oluşan hasar: kasko ile güvence altına alınır.",
          "Teminat limitlerini aşan tutarlar: İhtiyari Mali Mesuliyet (İMM) sigortası ile karşılanır.",
          "Trafik cezaları ve idari para cezaları",
          "Kasten verilen zararlar",
        ],
      },
      {
        heading: "Trafik sigortası fiyatı nasıl belirlenir?",
        paragraphs: [
          "Trafik sigortası primini her sigorta şirketi kendi belirler; ancak hiçbir şirket SEDDK'nın araç türü ve il bazında ilan ettiği azami (tavan) primi aşamaz. Bu yüzden aynı araç için şirketler arasında belirgin fiyat farkı oluşabilir ve karşılaştırma yapmak en uygun fiyatı bulmanın en kısa yoludur.",
        ],
        bullets: [
          "Araç türü ve kullanım şekli: otomobil, taksi, kamyonet veya motosiklet",
          "Aracın trafiğe kayıtlı olduğu il",
          "Hasarsızlık basamağınız",
          "Sigorta şirketinin fiyatlama politikası",
        ],
      },
      {
        heading: "Hasarsızlık basamakları nasıl çalışır?",
        paragraphs: [
          "Trafik sigortasında 0'dan 8'e kadar dokuz basamak bulunur. İlk kez poliçe yaptıran araç sahibi 4. basamaktan başlar. Hasarsız geçen her poliçe döneminde bir üst basamağa çıkılır ve prim düşer; en yüksek indirim 8. basamaktadır.",
          "Basamağı düşüren şey kazanın kendisi değil, sizin poliçenizden karşı tarafa tazminat ödenmesidir. Kusursuz olduğunuz ve ödemenin karşı tarafın sigortasından yapıldığı bir kaza basamağınızı etkilemez.",
          "1 Ocak 2026'dan itibaren önce yeni aracını alıp avantajlı basamaktaki eski aracını sonra satan araç sahipleri de basamaklarını yeni araca aktarabilir. Bunun için acenteye veya sigorta şirketine başvurmak yeterlidir; başvuru yapılmazsa düzeltme yenileme döneminde sistem tarafından otomatik yapılır.",
        ],
      },
      {
        heading: "Sigorta Uzmanı'nda trafik sigortası teklifi nasıl alınır?",
        paragraphs: [
          "Teklif almak ücretsizdir ve birkaç dakika sürer. Basamak bilginiz ve araç bilgileriniz Sigorta Bilgi ve Gözetim Merkezi (SBM) kayıtlarından otomatik çekilir; ayrıca belge yüklemeniz gerekmez.",
        ],
        bullets: [
          "T.C. kimlik numaranızı, cep telefonunuzu ve doğum tarihinizi girin.",
          "Plaka ve ruhsat seri numaranızla araç bilgilerinizi tamamlayın.",
          "Anlaşmalı sigorta şirketlerinden gelen teklifleri fiyata göre karşılaştırın.",
          "Seçtiğiniz teklifi 3D Secure ile güvenli şekilde ödeyin; poliçeniz anında düzenlenir.",
        ],
      },
      {
        heading: "Trafik sigortası yaptırmazsanız ne olur?",
        paragraphs: [
          "Zorunlu trafik sigortası olmayan araç sahibine idari para cezası uygulanır ve araç geçerli bir poliçe yapılana kadar trafikten men edilir. Asıl risk ise kazadır: sigortasız bir araçla karşı tarafa verilen zararı Güvence Hesabı öder ve ödediği tutarı daha sonra araç sahibinden geri talep eder.",
          "Poliçenizin bitiş tarihini takip etmek ve süre dolmadan yenilemek, sigortasız kalınan günleri önler.",
        ],
      },
    ],
    faqHeading: "Trafik sigortası hakkında sık sorulan sorular",
    faq: [
      {
        question: "Trafik sigortası zorunlu mu?",
        answer:
          "Evet. 2918 sayılı Karayolları Trafik Kanunu'nun 91. maddesi gereği trafiğe çıkan her motorlu aracın zorunlu trafik sigortası olmalıdır. Sigortasız araç trafikten men edilir ve sahibine idari para cezası uygulanır.",
      },
      {
        question: "2026 trafik sigortası teminat limitleri ne kadar?",
        answer:
          "2026'da tüm araç gruplarında maddi zarar limiti araç başına 400.000 TL, kaza başına 800.000 TL'dir. Kişi başına bedeni zarar limiti 3.600.000 TL'dir. Kaza başına bedeni limit otomobilde 18.000.000 TL, kamyon ve kamyonette 36.000.000 TL, motosiklette 10.800.000 TL'dir.",
      },
      {
        question: "Trafik sigortası ile kasko arasındaki fark nedir?",
        answer:
          "Trafik sigortası zorunludur ve yalnızca karşı tarafa verdiğiniz zararı karşılar. Kasko isteğe bağlıdır ve kendi aracınızda oluşan hasarı, çalınmayı ve doğal afet zararlarını karşılar. Aracınızı tam olarak korumak için ikisi birlikte yaptırılır.",
      },
      {
        question: "Trafik sigortası basamağımı nasıl öğrenirim?",
        answer:
          "Basamağınız mevcut poliçenizde yazar. Sigorta Uzmanı'nda teklif alırken basamak bilginiz SBM kayıtlarından otomatik olarak çekilir ve fiyata yansıtılır; ayrıca sorgulama yapmanız gerekmez.",
      },
      {
        question: "Aracımı satınca trafik sigortası ne olur?",
        answer:
          "Araç satıldığında poliçe yeni sahibine geçmez; yeni sahip kendi adına poliçe yaptırmalıdır. Siz noter satış belgesiyle poliçenizi iptal ettirebilir, kullanılmayan süreye ait primin iadesini talep edebilirsiniz.",
      },
      {
        question: "Teminat limitleri yetmezse ne olur?",
        answer:
          "Zarar trafik sigortası limitini aşarsa aşan kısmı kusurlu araç sahibi kendisi öder. Bu riske karşı İhtiyari Mali Mesuliyet (İMM) sigortası yaptırılabilir; İMM, trafik sigortası limitlerinin üzerindeki zararları seçilen tutara kadar karşılar.",
      },
      {
        question: "İnternetten alınan trafik sigortası geçerli mi?",
        answer:
          "Evet. Poliçe doğrudan sigorta şirketi tarafından düzenlenir ve SBM kayıtlarına işlenir; şubeden alınan poliçeyle aynı geçerliliğe sahiptir. Ödeme tamamlandığında poliçenizi ve makbuzunuzu aynı ekrandan indirebilirsiniz.",
      },
      {
        question: "Trafik sigortası teklifi almak ücretli mi?",
        answer:
          "Hayır. Teklif almak, karşılaştırma yapmak ve danışmanlık hizmeti ücretsizdir. Ödediğiniz tutar, sigorta şirketinin belirlediği poliçe primidir.",
      },
    ],
    related: [
      { label: "Kasko teklifi al", path: "/teklif/kasko" },
      { label: "İMM teklifi al", path: "/teklif/imm" },
      { label: "Kısa süreli trafik sigortası", path: "/teklif/kisa-sureli-trafik" },
      { label: "Araç satışında poliçe iptali", path: "/police-iptal" },
    ],
    guncelleme: "2026-10-16",
    kaynak: {
      label: "SEDDK zorunlu trafik sigortası teminat limitleri",
      path: "https://www.seddk.gov.tr/tr/tuketici-kosesi/teminat-limitleri/zorunlu-trafik-sigortasi-limitleri",
    },
  },
  kasko: {
    heading: "Kasko sigortası rehberi 2026",
    summary:
      "Kasko, kendi aracınızın çarpma, çarpışma, devrilme, yanma ve çalınma risklerini poliçede yazılı kapsam dahilinde karşılayan isteğe bağlı bir mal sigortasıdır. Zorunlu trafik sigortasının yerini tutmaz: trafik sigortası karşı tarafa verilen zararı, kasko ise kendi aracınızdaki hasarı güvence altına alır. Sel, deprem ve dolu gibi riskler temel teminata kendiliğinden girmez; ek sözleşme ile poliçeye eklenir.",
    sections: [
      {
        heading: "Kasko neleri karşılar?",
        paragraphs: [
          "Kara Araçları Kasko Sigortası Genel Şartları'nda temel teminat; aracın başka bir araç veya cisimle çarpışması, araca dışarıdan çarpılması, devrilme, düşme, yuvarlanma, yanma ve çalınma olarak tanımlanır. Dar kasko, kasko, genişletilmiş kasko ve tam kasko bu risklerin farklı paketleridir. Paketin adı tek başına kapsamı göstermez; hangi riskin dahil olduğu poliçede açıkça yazar.",
        ],
        table: {
          caption: "Temel kasko teminatı ve ek sözleşme ile eklenebilen riskler",
          head: ["Risk", "Temel teminat", "Ek sözleşme"],
          rows: [
            ["Çarpışma, çarpma, devrilme", "Dahil", "—"],
            ["Yanma", "Dahil", "—"],
            ["Çalınma veya çalınmaya teşebbüs", "Dahil", "—"],
            ["Sel ve su baskını", "Dahil değil", "Poliçeye eklenebilir"],
            ["Deprem", "Dahil değil", "Poliçeye eklenebilir"],
            ["Dolu, fırtına ve benzeri doğal afetler", "Dahil değil", "Poliçeye eklenebilir"],
            ["Yurt dışı kullanım", "Dahil değil", "Poliçeye eklenebilir"],
          ],
        },
        note: "İkame araç, mini onarım, cam ve yol yardım bir teminat değil, poliçeye eklenen hizmettir. Süre, adet ve araç sınıfı şirkete göre değişir.",
      },
      {
        heading: "Kasko fiyatı nasıl belirlenir?",
        paragraphs: [
          "Kasko primi her sigorta şirketinin kendi tarifesine göre hesaplanır. Araç değeri fiyata giren kalemlerden biridir; tek başına primi belirlemez.",
        ],
        bullets: [
          "Aracın markası, modeli, model yılı ve Türkiye Sigorta Birliği kasko değer listesindeki referans bedeli",
          "Kullanım şekli ve aracın bulunduğu il",
          "Sürücü ve sigortalının hasar geçmişi",
          "Seçilen teminatlar, muafiyet ve servis ağı",
        ],
      },
      {
        heading: "Kasko her hasarı öder mi?",
        paragraphs: [
          "Poliçede olmayan risk, genel veya özel şartlardaki istisna ve kasten verilen zarar kapsam dışındadır. Tam hasar veya çalınmada ödeme, hasar tarihindeki rayiç değere göre yapılır. Kasko değer listesindeki tutar, her dosyada koşulsuz ödenecek tazminat değildir.",
          "Kendi aracınızdaki hasar için kasko, karşı tarafa verdiğiniz zarar için trafik sigortası gerekir. Trafik limitinin üzerindeki sorumluluk ise İhtiyari Mali Mesuliyet (İMM) ile tamamlanır.",
        ],
      },
    ],
    faqHeading: "Kasko hakkında sık sorulan sorular",
    faq: [
      {
        question: "Kasko zorunlu mu?",
        answer:
          "Hayır. Kasko isteğe bağlıdır. Trafiğe çıkmak için zorunlu olan poliçe trafik sigortasıdır. Kasko, kendi aracınızdaki hasarı karşılamak için yaptırılır.",
      },
      {
        question: "Kasko trafik sigortasının yerini tutar mı?",
        answer:
          "Hayır. Kasko kendi aracınızı korur. Karşı tarafa verilen maddi ve bedeni zararlar zorunlu trafik sigortasının konusudur. İki poliçe birbirinin yerine geçmez.",
      },
      {
        question: "Sel ve deprem kaskoya dahil mi?",
        answer:
          "Temel kasko teminatına dahil değildir. Sel, su baskını, deprem ve dolu gibi riskler ek sözleşme ile poliçeye alınır. Teklifte bu kalemlerin işaretli olup olmadığı ayrıca kontrol edilmelidir.",
      },
      {
        question: "Kasko değer listesindeki tutar ödenir mi?",
        answer:
          "Liste, sigorta şirketlerinin kullandığı referans değerdir. Tam hasar veya çalınmada esas alınan tutar, hasar tarihindeki rayiç değerdir ve poliçedeki değerleme yöntemine göre belirlenir.",
      },
      {
        question: "Kasko teklifi almak ücretli mi?",
        answer:
          "Hayır. Teklif almak ve karşılaştırmak ücretsizdir. Ödenen tutar, seçilen sigorta şirketinin poliçe primidir.",
      },
    ],
    related: [
      { label: "Trafik sigortası teklifi al", path: "/teklif/trafik-sigortasi" },
      { label: "İMM teklifi al", path: "/teklif/imm" },
      { label: "Trafik sigortası ve kasko karşılaştırması", path: "/karsilastirma/trafik-sigortasi-vs-kasko" },
    ],
    guncelleme: "2026-10-16",
    kaynak: {
      label: "SEDDK Kara Araçları Kasko Sigortası Genel Şartları",
      path: "https://seddk.gov.tr/upload/Sigortac%C4%B1l%C4%B1k%20Mevzuat%C4%B1/Genel%20%C5%9Eartlar/Mal%20Sigortalar%C4%B1/Kara%20Ara%C3%A7lar%C4%B1%20Kasko%20Sigortas%C4%B1%20Genel%20%C5%9Eartlar%C4%B1.pdf",
    },
  },
  "kisa-sureli-trafik": {
    heading: "Kısa süreli trafik sigortası rehberi 2026",
    summary:
      "Kısa süreli trafik sigortası, zorunlu trafik sigortasıyla aynı teminatı bir yıldan kısa süre için sağlayan poliçedir. Noter satışı, devir ve ikinci el araç ticareti gibi geçici ihtiyaçlarda kullanılır. 2026 teminat limitleri yıllık poliçeyle aynıdır: araç başına maddi zarar 400.000 TL, kişi başına bedeni zarar 3.600.000 TL'dir. Kendi aracınızdaki hasarı karşılamaz.",
    sections: [
      {
        heading: "Yıllık trafik sigortasından farkı nedir?",
        paragraphs: [
          "Kısa süreli poliçe ayrı bir teminat türü değildir. Karşı tarafa verilen maddi ve bedeni zararlar, yıllık zorunlu trafik sigortasıyla aynı yasal limitler içinde karşılanır. Değişen tek unsur poliçe süresidir.",
        ],
        table: {
          caption: "Yıllık ve kısa süreli zorunlu trafik sigortası",
          head: ["Karşılaştırma", "Yıllık trafik sigortası", "Kısa süreli trafik sigortası"],
          rows: [
            ["Teminat limiti", "2026 yasal limitleri", "Aynı 2026 yasal limitleri"],
            ["Süre", "Genellikle 1 yıl", "İhtiyaca göre daha kısa"],
            ["Karşı tarafın zararı", "Karşılanır", "Karşılanır"],
            ["Kendi aracın hasarı", "Karşılanmaz", "Karşılanmaz"],
            ["Tipik kullanım", "Aracın yıl boyu trafikte olması", "Satış, devir ve geçici kullanım"],
          ],
        },
        note: "2026'da maddi zarar limiti araç başına 400.000 TL, kaza başına 800.000 TL'dir. Kişi başına bedeni zarar limiti 3.600.000 TL'dir.",
      },
      {
        heading: "Satış gerçekleşmezse poliçe ne olur?",
        paragraphs: [
          "Alıcı adına satıştan önce düzenlenen poliçe, satış veya devir tamamlanmazsa başlangıçtan iptal edilebilir. SEDDK'nın 2024/30 sayılı genelgesine göre bu durumda tahsil edilen prim kesinti yapılmadan iade edilir.",
          "Satış tamamlanırsa satıcının eski poliçesi yeni malike geçmez. Aracı devralan kişi kendi adına sigortalı olmalıdır. Galerinin kısa süreli poliçesi, nihai alıcının yıllık poliçesinin yerine geçmez.",
        ],
      },
      {
        heading: "Sigorta Uzmanı'nda kısa süreli teklif nasıl alınır?",
        paragraphs: [
          "Teklif almak ücretsizdir. Plaka ve ruhsat bilgileriyle araç kaydı Sigorta Bilgi ve Gözetim Merkezi üzerinden sorgulanır.",
        ],
        bullets: [
          "T.C. kimlik numaranızı, cep telefonunuzu ve doğum tarihinizi girin.",
          "Plaka ve ruhsat seri numaranızla araç bilgilerini tamamlayın.",
          "Gelen teklifleri süre ve prim üzerinden karşılaştırın.",
          "Seçtiğiniz teklifi 3D Secure ile ödeyin; poliçe düzenlendiğinde indirebilirsiniz.",
        ],
      },
    ],
    faqHeading: "Kısa süreli trafik sigortası hakkında sık sorulan sorular",
    faq: [
      {
        question: "Kısa süreli trafik sigortası zorunlu trafik sigortasının yerini tutar mı?",
        answer:
          "Poliçenin geçerli olduğu sürede evet. Teminat, yıllık zorunlu trafik sigortasıyla aynı yasal limitlerdir. Süre bitince araç yeniden sigortasız kalır ve yeni bir poliçe gerekir.",
      },
      {
        question: "2026 teminat limitleri kısa süreli poliçede değişir mi?",
        answer:
          "Hayır. 2026'da araç başına maddi zarar limiti 400.000 TL, kişi başına bedeni zarar limiti 3.600.000 TL'dir. Sürenin kısa olması bu tutarları düşürmez.",
      },
      {
        question: "Noter satışı olmazsa primi geri alabilir miyim?",
        answer:
          "Satış veya devir tamamlanmazsa poliçe başlangıçtan iptal edilebilir ve tahsil edilen prim kesintisiz iade edilir. Satışın gerçekleşmediğini gösteren belge istenebilir.",
      },
      {
        question: "Kısa süreli poliçe kendi aracımın hasarını karşılar mı?",
        answer:
          "Hayır. Yalnızca karşı tarafa verilen zararları karşılar. Kendi aracınızdaki hasar için kasko gerekir.",
      },
    ],
    related: [
      { label: "Yıllık trafik sigortası", path: "/teklif/trafik-sigortasi" },
      { label: "Kasko teklifi al", path: "/teklif/kasko" },
      { label: "Araç satışında poliçe iptali", path: "/police-iptal" },
    ],
    guncelleme: "2026-10-16",
    kaynak: {
      label: "SEDDK zorunlu trafik sigortası teminat limitleri",
      path: "https://www.seddk.gov.tr/tr/tuketici-kosesi/teminat-limitleri/zorunlu-trafik-sigortasi-limitleri",
    },
  },
  imm: {
    heading: "İMM sigortası rehberi 2026",
    summary:
      "İhtiyari Mali Mesuliyet (İMM), zorunlu trafik sigortası limitlerinin üzerinde kalan maddi ve bedeni sorumluluğu, poliçede seçilen tutara kadar karşılayan ek bir sorumluluk sigortasıdır. 2026'da trafik sigortası araç başına 400.000 TL maddi, kişi başına 3.600.000 TL bedeni zarar öder. Zarar bu tutarları aşarsa aşan kısmı, İMM yoksa kusurlu sürücü kendisi öder.",
    sections: [
      {
        heading: "2026'da İMM hangi limitten sonra devreye girer?",
        paragraphs: [
          "İMM, trafik sigortasının ödediği tutarın üzerine eklenir. Trafik sigortası önce kendi limitine kadar öder; kalan ve hukuken sorumlu olunan bölüm, İMM poliçesindeki limite kadar İMM'den talep edilir.",
        ],
        table: {
          caption: "2026 zorunlu trafik sigortası limitleri ve İMM'nin başladığı yer",
          head: ["Teminat", "2026 trafik sigortası limiti", "Limit aşılırsa"],
          rows: [
            ["Maddi zarar, araç başına", "400.000 TL", "İMM, seçilen limite kadar"],
            ["Maddi zarar, kaza başına", "800.000 TL", "İMM, seçilen limite kadar"],
            ["Bedeni zarar, kişi başına", "3.600.000 TL", "İMM, seçilen limite kadar"],
            ["Bedeni zarar, kaza başına (otomobil)", "18.000.000 TL", "İMM, seçilen limite kadar"],
            ["Bedeni zarar, kaza başına (kamyon, kamyonet)", "36.000.000 TL", "İMM, seçilen limite kadar"],
            ["Bedeni zarar, kaza başına (motosiklet)", "10.800.000 TL", "İMM, seçilen limite kadar"],
          ],
        },
        note: "İMM'nin kendi limiti poliçede seçilir. Kasko paketinin içinde sunulabilir veya ayrı poliçe olarak düzenlenebilir; kaskonun olması yüksek bir İMM limiti olduğu anlamına gelmez.",
      },
      {
        heading: "İMM neleri karşılar, neleri karşılamaz?",
        paragraphs: [
          "İMM bir sorumluluk sigortasıdır. Trafik sigortası limitini aşan üçüncü kişi zararlarını karşılar. Sigortalının kendi aracındaki hasarı İMM'nin konusu değildir; o hasar kasko ile güvence altına alınır.",
        ],
        bullets: [
          "Limit üstü maddi hasar: yüksek değerli bir araca veya birden fazla araca verilen zarar",
          "Limit üstü bedeni zarar: tedavi, sakatlık ve destekten yoksun kalma tazminatı",
          "Kendi aracın hasarı: kapsam dışıdır, kasko gerekir",
          "Trafik ve idari para cezaları: kapsam dışıdır",
        ],
      },
      {
        heading: "İMM limiti nasıl seçilir?",
        paragraphs: [
          "Tek bir yasal İMM limiti yoktur. Sigorta şirketleri farklı tutarlar sunar. Yoğun trafikte, ticari kullanımda veya yüksek bedelli araçların bulunduğu güzergâhlarda düşük limit ağır bir kazada yetmeyebilir. Teklifler karşılaştırılırken primle birlikte seçilen maddi ve bedeni limit okunmalıdır.",
        ],
      },
    ],
    faqHeading: "İMM hakkında sık sorulan sorular",
    faq: [
      {
        question: "İMM zorunlu mu?",
        answer:
          "Hayır. Zorunlu olan trafik sigortasıdır. İMM, trafik sigortası limitlerinin yetmediği kazalar için isteğe bağlı ek güvencedir.",
      },
      {
        question: "İMM kaskonun içinde midir?",
        answer:
          "Bazı kasko paketlerine eklenebilir, ayrı poliçe olarak da düzenlenebilir. Kasko yaptırmış olmak, yüksek bir İMM limiti bulunduğunu göstermez. Poliçedeki İMM tutarı ayrıca kontrol edilmelidir.",
      },
      {
        question: "2026 trafik limiti aşılırsa kalanı kim öder?",
        answer:
          "Zorunlu trafik sigortası yürürlükteki limite kadar öder. Limitin üzerinde kalan tutar, İMM varsa poliçedeki limite kadar İMM'den; yoksa kusurlu araç işleteni veya sürücüden talep edilir.",
      },
      {
        question: "İMM kendi aracımın hasarını karşılar mı?",
        answer:
          "Hayır. İMM üçüncü kişilere karşı sorumluluğu tamamlar. Kendi aracınızdaki hasar için kasko gerekir.",
      },
    ],
    related: [
      { label: "Trafik sigortası teklifi al", path: "/teklif/trafik-sigortasi" },
      { label: "Kasko teklifi al", path: "/teklif/kasko" },
      { label: "İMM limit karşılaştırması", path: "/karsilastirma/imm-vs-yuksek-teminatli-imm" },
    ],
    guncelleme: "2026-10-16",
    kaynak: {
      label: "SEDDK zorunlu trafik sigortası teminat limitleri",
      path: "https://www.seddk.gov.tr/tr/tuketici-kosesi/teminat-limitleri/zorunlu-trafik-sigortasi-limitleri",
    },
  },
  "tamamlayici-saglik": {
    heading: "Tamamlayıcı sağlık sigortası rehberi 2026",
    summary:
      "Tamamlayıcı sağlık sigortası (TSS), aktif genel sağlık sigortası bulunan kişilerin SGK ile anlaşmalı özel hastanelerde ödediği fark ücretini, sigorta şirketinin anlaşmalı kurum ağında ve poliçe limitleri dahilinde karşılayan sağlık sigortasıdır. SGK'nın yerini tutmaz. Tedavi tarihinde SGK provizyonu alınamazsa poliçe devreye girmez.",
    sections: [
      {
        heading: "TSS ile özel sağlık sigortası arasındaki fark",
        paragraphs: [
          "İki ürün de özel hastane giderine yöneliktir. TSS, SGK'nın karşıladığı işlemin üzerine kalan farkı öder. Özel sağlık sigortası ise tedaviyi SGK sistemine bağlamadan, kendi kurum ağı ve limitleri üzerinden değerlendirir.",
        ],
        table: {
          caption: "Tamamlayıcı sağlık ve özel sağlık sigortası",
          head: ["Karşılaştırma", "Tamamlayıcı sağlık", "Özel sağlık"],
          rows: [
            ["SGK şartı", "Aktif genel sağlık sigortası gerekir", "Temel kullanım şartı değildir"],
            ["Hastane", "Hem SGK hem şirket ağıyla anlaşmalı kurum", "Şirketin anlaşmalı ağı"],
            ["Ne ödenir", "SGK sonrası kalan fark ücreti", "Poliçedeki limit ve oran"],
            ["Yurt dışı tedavi", "Standart kapsamda yoktur", "Pakete göre eklenebilir"],
            ["Prim", "Aynı ihtiyaçta genellikle daha düşüktür", "Ağ ve limite göre daha yüksek olabilir"],
          ],
        },
        note: "SEDDK'ya göre doğum teminatında bekleme süresi en fazla 12 ay, diğer teminatlarda en fazla 6 aydır. Şirket daha kısa süre uygulayabilir.",
      },
      {
        heading: "TSS hangi giderleri karşılar?",
        paragraphs: [
          "Yatarak tedavi, ameliyat ve poliçede seçilmişse ayakta tedavi, SGK'nın karşıladığı işlemler için anlaşmalı kurumda oluşan fark ücretini kapsar. İlaç, diş ve doğum her üründe standart değildir. Hastanenin listede görünmesi yetmez; doktorun ve branşın da SGK ile anlaşmalı olması gerekir. SGK kapsamı dışındaki işlemler ve anlaşmasız kurumlar karşılanmaz.",
        ],
        bullets: [
          "Anlaşmalı özel hastanede yatarak tedavi farkı",
          "Poliçede varsa ayakta muayene, tahlil ve görüntüleme farkı",
          "Doğum, ancak teminat seçilmiş ve bekleme süresi dolmuşsa",
        ],
      },
      {
        heading: "Fiyat neden kişiden kişiye değişir?",
        paragraphs: [
          "TSS primi sabit bir tarife değildir. Yaş, yaşanılan şehir, seçilen hastane ağı, ayakta tedavi adedi, katılım payı ve sağlık beyanı fiyatı değiştirir. En düşük prim, ihtiyaç duyulan hastaneyi ağın dışında bırakıyorsa uygun poliçe sayılmaz.",
        ],
      },
    ],
    faqHeading: "Tamamlayıcı sağlık sigortası hakkında sık sorulan sorular",
    faq: [
      {
        question: "SGK olmadan TSS yapılabilir mi?",
        answer:
          "Hayır. TSS'nin kullanılabilmesi için tedavi tarihinde aktif genel sağlık sigortası hakkı gerekir. SGK provizyonu alınamazsa poliçe fark ücretini karşılamaz. SGK'sı olmayanlar için özel sağlık sigortası değerlendirilir.",
      },
      {
        question: "TSS her özel hastanede geçerli mi?",
        answer:
          "Hayır. Hastanenin hem SGK ile hem de sigorta şirketinin TSS ağıyla anlaşmalı olması gerekir. Aynı şirketin farklı planlarında hastane ağı değişebilir.",
      },
      {
        question: "TSS ile özel sağlık sigortası aynı anda gerekir mi?",
        answer:
          "Çoğu kişi ihtiyacına göre birini seçer. Aktif SGK'sı olup anlaşmalı özel hastanede fark ödemek istemeyenler için TSS yeterlidir. SGK şartı olmadan veya yurt dışı teminatla güvence isteyenler özel sağlık sigortasına bakar.",
      },
      {
        question: "Bekleme süresi var mı?",
        answer:
          "Olabilir. SEDDK'ya göre doğumda bekleme süresi en fazla 12 ay, diğer teminatlarda en fazla 6 aydır. Şirket daha kısa süre belirleyebilir. Süre poliçede yazar.",
      },
      {
        question: "TSS teklifi almak ücretli mi?",
        answer:
          "Hayır. Teklif almak ve karşılaştırmak ücretsizdir. Ödenen tutar, seçilen sigorta şirketinin poliçe primidir.",
      },
    ],
    related: [
      { label: "Özel sağlık sigortası teklifi al", path: "/teklif/ozel-saglik" },
      { label: "TSS ve özel sağlık karşılaştırması", path: "/karsilastirma/tamamlayici-saglik-vs-ozel-saglik" },
    ],
    guncelleme: "2026-10-16",
    kaynak: {
      label: "SEDDK Özel Sağlık Sigortalarında Yeni Dönem Bilgilendirme Rehberi",
      path: "https://seddk.gov.tr/UploadContent/Documents/%C3%96SS_YeniD%C3%B6nemBilgilendirme_Rehberi.pdf",
    },
  },
  "ozel-saglik": {
    heading: "Özel sağlık sigortası rehberi 2026",
    summary:
      "Özel sağlık sigortası, hastalık veya kaza nedeniyle gereken yatarak ve ayakta tedavi giderlerini, SGK şartı aramadan ve poliçedeki limitler dahilinde karşılayan isteğe bağlı bir sağlık sigortasıdır. Tamamlayıcı sağlıktan farkı, tedavinin SGK provizyonuna bağlı olmamasıdır. Hangi işlemin ödeneceği hastane ağına, limite, katılım payına ve bekleme süresine göre değişir.",
    sections: [
      {
        heading: "Özel sağlık sigortası neleri kapsar?",
        paragraphs: [
          "Yatarak tedavi teminatı ameliyat, hastane yatışı, yoğun bakım ve yatış sırasındaki tetkikleri kapsayabilir. Ayakta tedavi doktor muayenesi, laboratuvar ve görüntülemeyi yıllık adet veya tutar limiti ile sunabilir. Doğum, diş, check-up ve yurt dışı tedavi her planda yoktur.",
        ],
        table: {
          caption: "Özel sağlık sigortasında sık karşılaşılan teminat ayrımı",
          head: ["Teminat", "Poliçede nasıl yer alır", "Dikkat edilecek nokta"],
          rows: [
            ["Yatarak tedavi", "Planın temel teminatıdır", "Anlaşmalı kurum ve ön onay şartı"],
            ["Ayakta tedavi", "Ayrı seçilir", "Yıllık adet, tutar veya katılım payı"],
            ["Doğum", "Ek teminattır", "Bekleme süresi 12 aya kadar çıkabilir"],
            ["Yurt dışı tedavi", "Ek teminattır", "Ülke, limit ve ön onay poliçede yazar"],
            ["Anlaşmasız kurum", "Her planda yoktur", "Varsa geri ödeme oranı sınırlı olabilir"],
          ],
        },
        note: "Limitsiz ifadesi, bütün giderlerin koşulsuz ödeneceği anlamına gelmez. Anlaşmalı kurum, ön onay ve özel şartlar uygulanır.",
      },
      {
        heading: "Kimler için özel sağlık, kimler için TSS?",
        paragraphs: [
          "Aktif SGK'sı olan ve anlaşmalı özel hastanedeki fark ücretini karşılamak isteyen kişiler için tamamlayıcı sağlık genellikle yeterli olur. SGK'sı olmayan, daha geniş hastane ağı veya yurt dışı teminatı isteyen kişiler özel sağlık sigortasını değerlendirir.",
          "Prim; yaş, şehir, kurum ağı, seçilen teminatlar ve sağlık beyanına göre hesaplanır. İlk yılın düşük olması, yenilemede aynı primin süreceği anlamına gelmez. Ömür boyu yenileme garantisinin poliçede taahhüt edilip edilmediği okunmalıdır.",
        ],
      },
    ],
    faqHeading: "Özel sağlık sigortası hakkında sık sorulan sorular",
    faq: [
      {
        question: "Özel sağlık sigortası için SGK gerekir mi?",
        answer:
          "Hayır. Özel sağlık sigortasında SGK, tamamlayıcı sağlıktaki gibi temel kullanım şartı değildir. Tedavi, poliçenin kurum ağı ve limitleri üzerinden değerlendirilir.",
      },
      {
        question: "Özel sağlık ile tamamlayıcı sağlık aynı mıdır?",
        answer:
          "Hayır. Tamamlayıcı sağlık, SGK'nın ödediği işlemin farkını karşılar ve aktif SGK ister. Özel sağlık, SGK provizyonuna bağlı olmadan poliçe limitleri içinde ödeme yapar.",
      },
      {
        question: "Anlaşmasız hastanede kullanabilir miyim?",
        answer:
          "Poliçeye bağlıdır. Bazı planlar anlaşmasız kurumda geri ödeme sunar. Ödeme oranı ve üst limit poliçede yazar. Anlaşmalı kurumda provizyon ile doğrudan ödeme daha yaygındır.",
      },
      {
        question: "Bekleme süresi uygulanır mı?",
        answer:
          "Evet, bazı teminatlarda uygulanır. SEDDK'ya göre doğumda bekleme süresi en fazla 12 ay, diğer teminatlarda en fazla 6 aydır. Şirket daha kısa süre belirleyebilir.",
      },
    ],
    related: [
      { label: "Tamamlayıcı sağlık teklifi al", path: "/teklif/tamamlayici-saglik" },
      { label: "TSS ve özel sağlık karşılaştırması", path: "/karsilastirma/tamamlayici-saglik-vs-ozel-saglik" },
      { label: "Seyahat sağlık teklifi al", path: "/teklif/seyahat-saglik" },
    ],
    guncelleme: "2026-10-16",
    kaynak: {
      label: "SEDDK Özel Sağlık Sigortalarında Yeni Dönem Bilgilendirme Rehberi",
      path: "https://seddk.gov.tr/UploadContent/Documents/%C3%96SS_YeniD%C3%B6nemBilgilendirme_Rehberi.pdf",
    },
  },
  "seyahat-saglik": {
    heading: "Seyahat sağlık sigortası rehberi 2026",
    summary:
      "Seyahat sağlık sigortası, yolculuk sırasında ani bir hastalık veya kaza nedeniyle oluşan tedavi, tıbbi nakil ve vefat hâlinde nakil giderlerini poliçenin süresi, ülkesi ve limiti dahilinde karşılar. Schengen vizesi başvurularında asgari 30.000 avro teminat ve tüm Schengen bölgesinde geçerlilik aranır. Yeşil Kart'ın yerini tutmaz: Yeşil Kart aracın yurt dışı trafik sorumluluğu, seyahat sağlık kişinin acil sağlık gideridir.",
    sections: [
      {
        heading: "Schengen vizesi için poliçe nasıl olmalıdır?",
        paragraphs: [
          "Schengen vizesi başvurularında seyahat sağlık sigortası, acil tıbbi bakım, hastanede tedavi ve tıbbi nedenle geri dönüş giderlerini kapsamalıdır. Yalnızca başvuru yapılan ülkeyi kapsayan bir poliçe yeterli görülmeyebilir.",
        ],
        table: {
          caption: "Schengen vizesi başvurularında aranan seyahat sağlık şartları",
          head: ["Şart", "Beklenen durum"],
          rows: [
            ["Asgari teminat", "30.000 avro"],
            ["Tedavi", "Acil tıbbi bakım ve hastane tedavisi"],
            ["Geri dönüş", "Tıbbi nedenle geri dönüş ve vefat hâlinde nakil"],
            ["Bölge", "Tüm Schengen bölgesi"],
            ["Süre", "Başvurulan seyahat tarihlerini kapsaması"],
          ],
        },
        note: "Vize sigortası ayrı bir branş değildir. Konsolosluk şartlarına uygun düzenlenmiş bir seyahat sağlık poliçesidir. Güncel belge listesi ilgili temsilcilikten kontrol edilmelidir.",
      },
      {
        heading: "Hangi giderler kapsanır?",
        paragraphs: [
          "Seyahat Sağlık Sigortası Genel Şartları çerçevesinde ani hastalık ve kazanın tedavi gideri, sigortalının uygun sağlık kuruluşuna nakli ve vefat hâlinde nakil temel teminatlardandır. Bagaj, seyahat iptali ve refakatçi ulaşımı her poliçede yoktur.",
        ],
        bullets: [
          "Ani hastalık veya kaza sonucu hastane ve tedavi gideri",
          "Bulunulan yerde tedavi mümkün değilse tıbbi nakil",
          "Vefat hâlinde cenazenin nakli",
          "Poliçe öncesi bilinen hastalıklar ve tehlikeli sporlar, özel şart yoksa kapsam dışı kalabilir",
        ],
      },
      {
        heading: "Yurt içi ve vizesiz seyahatte zorunlu mu?",
        paragraphs: [
          "Yurt içi bireysel seyahatlerde seyahat sağlık sigortası genel olarak zorunlu değildir. Vizesiz giriş de sigortanın hiç sorulmayacağı anlamına gelmez; ülke giriş kuralları değişebilir. Zorunlu olmasa bile yurt dışındaki acil tedavi ve nakil gideri yüksek tutarlara çıkabildiği için poliçe, vize belgesinden ayrı bir güvence olarak değerlendirilir.",
        ],
      },
    ],
    faqHeading: "Seyahat sağlık sigortası hakkında sık sorulan sorular",
    faq: [
      {
        question: "Seyahat sağlık sigortası zorunlu mu?",
        answer:
          "Her yolculuk için tek tip bir zorunluluk yoktur. Schengen ve bazı vize türlerinde başvuru şartıdır. Vizesiz veya yurt içi seyahatte genel olarak zorunlu değildir; yine de acil tedavi gideri için yaptırılması değerlendirilir.",
      },
      {
        question: "Schengen için asgari teminat ne kadar?",
        answer:
          "Schengen vizesi başvurularında seyahat sağlık sigortasının asgari 30.000 avro teminat sağlaması beklenir. Poliçenin tüm Schengen bölgesinde ve seyahat tarihlerinde geçerli olması gerekir.",
      },
      {
        question: "Seyahat sağlık ile Yeşil Kart aynı mı?",
        answer:
          "Hayır. Seyahat sağlık kişinin acil sağlık giderini karşılar. Yeşil Kart, aracın yurt dışında üçüncü kişilere verdiği trafik zararını belgeleyen uluslararası sorumluluk sigortasıdır.",
      },
      {
        question: "Özel sağlık sigortam yurt dışında geçerli mi?",
        answer:
          "Poliçeye bağlıdır. Birçok özel sağlık planı yurt dışını kapsamaz veya sınırlı kapsar. Yurt dışı seyahat için ayrı seyahat sağlık poliçesi gerekir.",
      },
    ],
    related: [
      { label: "Yeşil Kart teklifi al", path: "/teklif/yesil-kart" },
      { label: "Özel sağlık teklifi al", path: "/teklif/ozel-saglik" },
      { label: "Yeşil Kart ve seyahat sağlık karşılaştırması", path: "/karsilastirma/yesil-kart-vs-seyahat-saglik" },
    ],
    guncelleme: "2026-10-16",
    kaynak: {
      label: "SEDDK Seyahat Sağlık Sigortası Genel Şartları",
      path: "https://www.seddk.gov.tr/upload/Sigortac%C4%B1l%C4%B1k%20Mevzuat%C4%B1/Genel%20%C5%9Eartlar/Can%20Sigortalar%C4%B1/Seyahat%20Sa%C4%9Fl%C4%B1k%20Sigortas%C4%B1%20Genel%20%C5%9Eartlar%C4%B1.pdf",
    },
  },
  dask: {
    heading: "DASK rehberi 2026",
    summary:
      "DASK (Zorunlu Deprem Sigortası), meskenlerde deprem ile depremin doğrudan neden olduğu yangın, infilak, tsunami ve yer kaymasının binada oluşturduğu maddi zararları karşılayan zorunlu sigortadır. Eşyayı, kira kaybını ve bedeni zararları karşılamaz. Prim, konutun satış fiyatına göre değil; brüt metrekare, yapı tarzı ve deprem risk grubuna göre hesaplanır.",
    sections: [
      {
        heading: "DASK neleri karşılar?",
        paragraphs: [
          "Teminat binayadır. Tam yıkım şartı aranmaz; depremden kaynaklanan kısmi bina hasarı da kapsamdadır. Temeller, ana duvarlar, tavan ve tabanlar, merdivenler, asansörler, çatı ve bacalar gibi yapı bölümleri değerlendirilir. Arsa değeri ve konutun satış bedeli sigorta bedeline girmez.",
        ],
        table: {
          caption: "DASK kapsamı ve konut sigortasına kalan riskler",
          head: ["Zarar", "DASK", "Konut sigortası"],
          rows: [
            ["Depremin binada oluşturduğu hasar", "Karşılanır", "DASK limitinin üstü için eklenebilir"],
            ["Deprem kaynaklı yangın, infilak, tsunami, yer kayması", "Binadaki doğrudan zarar karşılanır", "Poliçeye göre"],
            ["Ev eşyası", "Karşılanmaz", "Eşya teminatı varsa karşılanır"],
            ["Kira kaybı ve alternatif konaklama", "Karşılanmaz", "Ek teminat olarak eklenebilir"],
            ["Deprem dışı yangın, su, hırsızlık", "Karşılanmaz", "Seçilen teminata göre"],
          ],
        },
        note: "Konut sigortası DASK yerine geçmez. Zorunlu deprem sigortası ayrı poliçe olarak düzenlenir.",
      },
      {
        heading: "DASK fiyatı nasıl hesaplanır?",
        paragraphs: [
          "Sigorta bedeli, yapı tarzı için ilan edilen metrekare birim maliyeti ile brüt yüzölçümünün çarpılmasıyla bulunur ve yürürlükteki azami teminatla sınırlıdır. Bu bedele, adresin deprem risk grubu ve yapı tarzının tarife oranı uygulanır.",
        ],
        bullets: [
          "İl, ilçe, mahalle ve adres kodu",
          "Brüt metrekare",
          "Betonarme veya diğer yapı tarzı",
          "İnşa yılı ve toplam kat sayısı",
        ],
      },
      {
        heading: "DASK yaptırılmazsa ne olur?",
        paragraphs: [
          "Kanun kapsamındaki meskenler için DASK zorunludur. Elektrik ve su aboneliği ile tapu işlemlerinde poliçe istenebilir. Depremde eşya hasarı, deprem dışı yangın veya su baskını DASK'tan ödenmez; bu riskler konut sigortasının konusudur.",
        ],
      },
    ],
    faqHeading: "DASK hakkında sık sorulan sorular",
    faq: [
      {
        question: "DASK zorunlu mu?",
        answer:
          "Evet. Kanun kapsamındaki meskenler için Zorunlu Deprem Sigortası yaptırılır. Tapu ve bazı abonelik işlemlerinde poliçe aranır.",
      },
      {
        question: "DASK eşyaları karşılar mı?",
        answer:
          "Hayır. DASK yalnızca binadaki deprem kaynaklı doğrudan maddi zararı karşılar. Mobilya, elektronik ve kişisel eşya için konut sigortasında eşya teminatı gerekir.",
      },
      {
        question: "Konut sigortası DASK yerine geçer mi?",
        answer:
          "Hayır. Konut sigortasında deprem teminatı olsa bile DASK ayrı ve zorunlu poliçedir. Konut sigortası, DASK limitinin üzerinde kalan bina değeri ve eşya için ek güvence sağlayabilir.",
      },
      {
        question: "DASK primi evin satış fiyatına göre mi hesaplanır?",
        answer:
          "Hayır. Hesap, brüt metrekare, yapı tarzı ve deprem risk grubu üzerinden yürürlükteki tarifeye göre yapılır. Arsa ve semt değeri prime girmez.",
      },
      {
        question: "Kiracı DASK yaptırabilir mi?",
        answer:
          "Sigorta menfaati bina malikine aittir. Kiracı, malik adına sigorta ettiren olabilir; tazminat hak sahibine ödenir. Kiracının kendi eşyası DASK kapsamında değildir.",
      },
    ],
    related: [
      { label: "Konut sigortası teklifi al", path: "/teklif/konut" },
      { label: "DASK ve konut karşılaştırması", path: "/karsilastirma/dask-vs-konut-sigortasi" },
    ],
    guncelleme: "2026-10-16",
    kaynak: {
      label: "DASK teminat ve kapsamı",
      path: "https://dask.gov.tr/tr/teminat-ve-kapsami",
    },
  },
  "yesil-kart": {
    heading: "Yeşil Kart sigortası rehberi 2026",
    summary:
      "Yeşil Kart, aracınızla sisteme dahil bir ülkeye çıktığınızda üçüncü kişilere vereceğiniz zararları, kazanın olduğu ülkenin zorunlu trafik sigortası kuralları ve limitleri çerçevesinde belgeleyen uluslararası motorlu taşıt sigortasıdır. Türkiye'de düzenlenen trafik sigortasının her ülkede geçerli olduğu varsayılmamalıdır. Yeşil Kart kendi aracınızın hasarını ve yolcuların sağlık giderini karşılamaz.",
    sections: [
      {
        heading: "Yeşil Kart, seyahat sağlık ve kasko nasıl ayrılır?",
        paragraphs: [
          "Araçla yurt dışına çıkarken üç ayrı ihtiyaç vardır. Yeşil Kart trafik sorumluluğunu, seyahat sağlık kişilerin acil tedavi giderini, yurt dışı kasko teminatı ise aracın kendi hasarını konu alır. Birinin bulunması diğerini karşılamaz.",
        ],
        table: {
          caption: "Araçla yurt dışına çıkarken poliçe ayrımı",
          head: ["Ürün", "Kimi korur", "Karşılamadığı şey"],
          rows: [
            ["Yeşil Kart", "Yurt dışında zarar gören üçüncü kişiler", "Kendi araç hasarı ve sağlık gideri"],
            ["Seyahat sağlık", "Yolculuktaki kişilerin acil sağlık gideri", "Aracın trafik sorumluluğu"],
            ["Yurt dışı kasko teminatı", "Sigortalı aracın kendi hasarı", "Karşı tarafın zararı ve tedavi"],
          ],
        },
        note: "Teminat, kazanın gerçekleştiği ülkedeki zorunlu trafik sigortası limitlerine göre uygulanır. Türkiye'deki 2026 trafik limitleri yurt dışında kendiliğinden geçerli olmaz.",
      },
      {
        heading: "Belge yola çıkmadan nasıl kontrol edilir?",
        paragraphs: [
          "Poliçenin başlangıç ve bitiş tarihi tüm güzergâhı kapsamalıdır. Belgede bir ülke kodunun üzeri çiziliyse Yeşil Kart o ülkede geçerli değildir. Gidilecek her ülke, sınır kapısından önce tek tek kontrol edilmelidir.",
        ],
        bullets: [
          "Ruhsat bilgileri belgedeki araçla aynı olmalıdır.",
          "Süre, gidiş ve dönüş günlerini içermelidir.",
          "Ülke kodu çizili olan yerlerde belge geçerli sayılmaz.",
          "Sürücü ve yolcular için ayrı seyahat sağlık poliçesi değerlendirilmelidir.",
        ],
      },
    ],
    faqHeading: "Yeşil Kart hakkında sık sorulan sorular",
    faq: [
      {
        question: "Yeşil Kart zorunlu mu?",
        answer:
          "Türkiye içinde zorunlu değildir. Aracınızla Yeşil Kart sistemine dahil bir ülkeye çıkarken, o ülkede üçüncü kişilere karşı mali sorumluluğun belgelenmesi için gerekir. Güncel ülke listesi Türkiye Motorlu Taşıt Bürosu'ndan kontrol edilmelidir.",
      },
      {
        question: "Türkiye trafik sigortası yurt dışında geçerli mi?",
        answer:
          "Her ülkede doğrudan geçerli olduğu kabul edilmez. Sisteme dahil ülkelerde bu sorumluluk Yeşil Kart ile belgelenir. Kendi ülkesinin trafik poliçesini sınırda göstermenin yeterli olacağı varsayılmamalıdır.",
      },
      {
        question: "Yeşil Kart sağlık giderini karşılar mı?",
        answer:
          "Hayır. Yeşil Kart araç sorumluluk sigortasıdır. Sürücü ve yolcuların hastane, tedavi ve nakil giderleri için seyahat sağlık sigortası gerekir.",
      },
      {
        question: "Yeşil Kart aracımın hasarını öder mi?",
        answer:
          "Hayır. Karşı tarafın zararını, kazanın olduğu ülkenin kurallarına göre güvence altına alır. Aracınızın yurt dışındaki kendi hasarı için kaskoda yurt dışı teminatı ayrıca bakılmalıdır.",
      },
    ],
    related: [
      { label: "Seyahat sağlık teklifi al", path: "/teklif/seyahat-saglik" },
      { label: "Trafik sigortası teklifi al", path: "/teklif/trafik-sigortasi" },
      { label: "Yeşil Kart ve seyahat sağlık karşılaştırması", path: "/karsilastirma/yesil-kart-vs-seyahat-saglik" },
    ],
    guncelleme: "2026-10-16",
    kaynak: {
      label: "Türkiye Motorlu Taşıt Bürosu Yeşil Kart bilgileri",
      path: "https://www.tmtb.org.tr/page/3/v-pills-bc15c73d-1d68-4484-93b2-b182ca9aa568-tab/",
    },
  },
  konut: {
    heading: "Konut sigortası rehberi 2026",
    summary:
      "Konut sigortası, yangın başta olmak üzere poliçeye eklenen su baskını, hırsızlık, fırtına ve benzeri risklere karşı binayı ve eşyayı güvence altına alan isteğe bağlı bir mal sigortasıdır. DASK'ın yerini tutmaz. Depremin binada oluşturduğu zarar için ayrı zorunlu deprem sigortası gerekir. Hangi ek riskin dahil olduğu, seçilen ürünün özel şartında yazar.",
    sections: [
      {
        heading: "Konut sigortası neleri kapsar?",
        paragraphs: [
          "Yangın, yıldırım ve infilak temel güvencedir. Sel, dahili su, fırtına, hırsızlık, cam kırılması ve eşya teminatı poliçeye ayrıca eklenebilir. Standart bir yangın teminatı, bütün bu riskleri kendiliğinden kapsamaz.",
        ],
        table: {
          caption: "Konut sigortası ve DASK kapsam ayrımı",
          head: ["Risk", "Konut sigortası", "DASK"],
          rows: [
            ["Yangın", "Temel teminat", "Yalnızca deprem kaynaklı yangın"],
            ["Depremin binada oluşturduğu hasar", "Ek teminat ve DASK üstü için", "Zorunlu teminat"],
            ["Ev eşyası", "Eşya bedeli seçilmişse", "Karşılanmaz"],
            ["Hırsızlık", "Ek teminat", "Karşılanmaz"],
            ["Su baskını ve dahili su", "Ek teminat", "Karşılanmaz"],
            ["Kira kaybı, alternatif konaklama", "Ek teminat olarak eklenebilir", "Karşılanmaz"],
          ],
        },
        note: "Bina bedeli arsa değerine göre değil, yapının yeniden inşa maliyetine göre yazılır. Eşya bedeli düşük kalırsa hasarda eksik sigorta uygulanabilir.",
      },
      {
        heading: "Ev sahibi ve kiracı ne yaptırmalı?",
        paragraphs: [
          "DASK ve binanın yangın teminatı malike aittir. Kiracının önceliği kendi eşyası ile komşuya veya ev sahibine karşı sorumluluğudur. Malikin DASK poliçesi, kiracının eşyasını korumaz.",
        ],
        bullets: [
          "Ev sahibi: DASK ve binayı kapsayan konut sigortası",
          "Kiracı: eşya bedeli ve sorumluluk teminatı",
          "İkisi de: poliçedeki muafiyet, limit ve istisnalar",
        ],
      },
      {
        heading: "Teklifte hangi kalemler karşılaştırılmalı?",
        paragraphs: [
          "Prim tek başına yeterli ölçü değildir. Bina bedeli, eşya bedeli, deprem ek teminatı, hırsızlık limiti, su hasarı ve asistans hizmetinin yıllık kullanım adedi yan yana okunmalıdır.",
        ],
      },
    ],
    faqHeading: "Konut sigortası hakkında sık sorulan sorular",
    faq: [
      {
        question: "Konut sigortası zorunlu mu?",
        answer:
          "Hayır. Konut sigortası isteğe bağlıdır. Meskenler için zorunlu olan poliçe DASK'tır. Konut sigortası yangın, su, hırsızlık ve eşya gibi DASK'ın karşılamadığı riskler için yaptırılır.",
      },
      {
        question: "Konut sigortası depremi karşılar mı?",
        answer:
          "Deprem teminatı poliçeye eklenmişse, DASK limitinin üzerinde kalan bina değeri ve poliçedeki eşya bedeli konut sigortasından değerlendirilebilir. Bu ek teminat DASK zorunluluğunu kaldırmaz.",
      },
      {
        question: "Kiracının eşyasını ev sahibinin poliçesi karşılar mı?",
        answer:
          "Hayır. Malik adına düzenlenen DASK ve bina poliçesi kiracının eşyasını kapsamaz. Kiracı, kendi eşyası için ayrı konut sigortası yaptırabilir.",
      },
      {
        question: "Sigorta bedeli nasıl belirlenmeli?",
        answer:
          "Bina bedelinde yeniden inşa maliyeti, eşya bedelinde evdeki eşyanın güncel ikame değeri esas alınır. Satış fiyatı veya arsa değeri doğru bedel değildir. Düşük bedel, hasarda eksik ödeme riski yaratır.",
      },
    ],
    related: [
      { label: "DASK teklifi al", path: "/teklif/dask" },
      { label: "DASK ve konut karşılaştırması", path: "/karsilastirma/dask-vs-konut-sigortasi" },
    ],
    guncelleme: "2026-10-16",
    kaynak: {
      label: "Yangın Sigortası Genel Şartları",
      path: "https://www.tsb.org.tr/content/Legislations/Yang%C4%B1n_Sigortas%C4%B1_Genel_Sartlar%C4%B1.pdf",
    },
  },
};

export function getProductGuide(slug: string): ProductGuide | undefined {
  return GUIDES[slug];
}
