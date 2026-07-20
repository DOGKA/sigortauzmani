export type GlossaryCategory =
  | "genel"
  | "arac"
  | "hasar"
  | "saglik"
  | "konut"
  | "hukuki";

export interface GlossaryTerm {
  slug: string;
  term: string;
  shortDefinition: string;
  definition: string;
  category: GlossaryCategory;
  related?: string[];
  popular?: boolean;
}

export const CATEGORY_LABELS: Record<GlossaryCategory, string> = {
  genel: "Genel Kavramlar",
  arac: "Araç Sigortası",
  hasar: "Hasar ve Onarım",
  saglik: "Sağlık Sigortası",
  konut: "Konut ve DASK",
  hukuki: "Hukuki Terimler",
};

export const glossaryTerms: GlossaryTerm[] = [
  {
    slug: "muafiyet",
    term: "Muafiyet",
    shortDefinition:
      "Hasar durumunda sigortalının kendi cebinden karşıladığı tutar veya oran.",
    definition:
      "Muafiyet, poliçede belirlenen ve hasar gerçekleştiğinde sigorta şirketinin ödemeyeceği kısmı ifade eder. Tutar üzerinden (örneğin 5.000 TL) veya hasarın yüzdesi olarak tanımlanabilir. Muafiyetli poliçelerde prim genellikle daha düşüktür; buna karşılık küçük hasarlarda sigortalı daha fazla katkı sağlar. Teklif karşılaştırırken muafiyet tutarını teminat kapsamıyla birlikte değerlendirmek önemlidir.",
    category: "genel",
    related: ["prim", "teminat", "kasko"],
    popular: true,
  },
  {
    slug: "imm",
    term: "İMM",
    shortDefinition:
      "İhtiyari Mali Mesuliyet; trafik sigortası limitlerinin üstünü tamamlayan ek sorumluluk teminatı.",
    definition:
      "İMM (İhtiyari Mali Mesuliyet), zorunlu trafik sigortasının yasal teminat limitlerini aşan maddi ve bedeni zararları karşılamak için yapılan ek bir sorumluluk sigortasıdır. Ağır kazalarda karşı tarafa ödenecek tazminat trafik limitini aşabilir; İMM bu farkı güvence altına alır. Limit seçenekleri şirketlere göre değişir; yüksek limitli İMM, özellikle şehir içi yoğun trafikte kritik bir korumadır.",
    category: "arac",
    related: ["trafik-sigortasi", "teminat", "rucu"],
    popular: true,
  },
  {
    slug: "mini-onarim",
    term: "Mini Onarım",
    shortDefinition:
      "Küçük çizik, göçük ve cam hasarlarının hasarsızlık indirimini bozmadan onarılması hizmeti.",
    definition:
      "Mini onarım, kasko poliçelerinde sıkça sunulan; boyasız göçük düzeltme, küçük çizik giderme, far-stop ve cam tamiri gibi lokal işlemleri kapsayan bir hizmettir. Genellikle hasarsızlık indirimini etkilemez ve hızlı servis ağı üzerinden yürütülür. Hizmetin kapsamı, adet limiti ve hangi parçaları kapsadığı poliçeden poliçeye değişir; teklif alırken mini onarım şartlarını kontrol etmek faydalıdır.",
    category: "hasar",
    related: ["kasko", "hasarsizlik", "ikame-arac"],
    popular: true,
  },
  {
    slug: "ikame-arac",
    term: "İkame Araç",
    shortDefinition:
      "Hasar onarımı süresince sigortalıya verilen geçici yedek araç hizmeti.",
    definition:
      "İkame araç (yedek araç), kaskoda hasarlı aracın serviste kaldığı süre boyunca sigortalıya sağlanan geçici araçtır. Kiralama süresi, sınıfı ve kilometre sınırı poliçe koşullarına bağlıdır. Bu teminat çoğu zaman ek olarak seçilir veya belirli kasko paketlerinde standart gelir. Onarım süresi uzadığında ulaşım mağduriyetini azaltmak için özellikle şehirde yaşayan sürücüler için değerlidir.",
    category: "hasar",
    related: ["kasko", "mini-onarim", "pert"],
    popular: true,
  },
  {
    slug: "rayic-bedel",
    term: "Rayiç Bedel",
    shortDefinition:
      "Bir malın piyasa koşullarına göre belirlenen güncel değeri.",
    definition:
      "Rayiç bedel, sigortalı malın (çoğunlukla araç veya konut eşyası) hasar anındaki piyasa değeridir. Pert kararlarında, çalınma tazminatında ve bazı konut hasarlarında ödeme rayiç bedele göre yapılır. Araçta model yılı, kilometre, donanım ve piyasa talebi değeri etkiler. Poliçedeki sigorta bedeli ile rayiç bedel arasındaki fark, eksik veya aşkın sigorta riskine yol açabilir.",
    category: "genel",
    related: ["pert", "sovtaj", "eksik-sigorta"],
    popular: true,
  },
  {
    slug: "pert",
    term: "Pert",
    shortDefinition:
      "Aracın onarım maliyetinin ekonomik olmadığı ağır hasar durumu.",
    definition:
      "Pert (ağır hasar), onarım tutarının aracın rayiç bedeline oranla yüksek olması nedeniyle aracın ekonomik olarak tamir edilmesinin uygun görülmemesidir. Sigorta şirketi genellikle rayiç bedelden sovtaj (hurda) değerini düşerek tazminat öder. Pert kaydı aracın ikinci el değerini ve sigortalanabilirliğini etkiler. Ağır hasar (pert) ile çekme belgesi süreçleri farklı hukuki sonuçlar doğurabilir.",
    category: "hasar",
    related: ["rayic-bedel", "sovtaj", "kasko"],
    popular: true,
  },
  {
    slug: "sovtaj",
    term: "Sovtaj",
    shortDefinition:
      "Hasar sonrası kalan malın (hurda/parça) ekonomik değeri.",
    definition:
      "Sovtaj, hasar sonrası kullanılamaz hale gelen veya ekonomik ömrünü tamamlayan malın kalan değeridir. Pert araçlarda hurda değeri, yangın hasarında kullanılabilir parçalar sovtaj olarak değerlendirilir. Tazminat hesabında genellikle sigorta bedeli veya rayiç bedelden sovtaj düşülür; sovtajın kime ait olacağı poliçe ve hasar anlaşmasına göre değişir.",
    category: "hasar",
    related: ["pert", "rayic-bedel", "tazminat"],
    popular: true,
  },
  {
    slug: "zeyilname",
    term: "Zeyilname",
    shortDefinition:
      "Mevcut poliçede yapılan değişiklikleri belgeleyen ek sözleşme.",
    definition:
      "Zeyilname (ek poliçe), yürürlükteki sigorta sözleşmesinde adres, araç, teminat limiti, ek sürücü veya prim gibi unsurlarda yapılan değişiklikleri resmileştiren belgedir. Değişiklikler genellikle zeyil tarihinde yürürlüğe girer ve prim farkı oluşabilir. Poliçeyi güncellemeden yapılan bildirim eksiklikleri, hasar anında teminat tartışmasına yol açabilir; bu nedenle önemli değişiklikleri zamanında zeyilleştirmek gerekir.",
    category: "genel",
    related: ["police", "teminat", "prim"],
    popular: true,
  },
  {
    slug: "rucu",
    term: "Rücu",
    shortDefinition:
      "Sigorta şirketinin ödediği tazminatı asıl sorumlusundan geri talep etmesi.",
    definition:
      "Rücu, sigortacının hasar tazminatını ödedikten sonra zarara neden olan üçüncü kişiye veya kusurlu tarafa başvurarak ödediği tutarı geri istemesidir. Trafik kazalarında kusurlu sürücünün sigortacısına, işveren sorumluluğunda ilgili tarafa rücu edilebilir. Poliçe şartlarına aykırı kullanımda (alkollü sürüş vb.) şirket sigortalıya da rücu hakkını kullanabilir. Rücu süreci, hasar dosyasının hukuki boyutunu oluşturur.",
    category: "hukuki",
    related: ["imm", "trafik-sigortasi", "tazminat"],
    popular: true,
  },
  {
    slug: "ferdi-kaza",
    term: "Ferdi Kaza",
    shortDefinition:
      "Kaza sonucu ölüm, sakatlık ve tedavi masraflarını güvence altına alan sigorta.",
    definition:
      "Ferdi kaza sigortası, ani ve harici bir olay sonucu meydana gelen kaza nedeniyle ölüm, sürekli sakatlanma ve bazı poliçelerde tedavi giderlerini teminat altına alır. Hastalık kaynaklı durumlar genellikle kapsam dışıdır. Ferdi kaza; bireysel poliçe olarak veya araç/seyahat paketlerinin içinde ek teminat şeklinde sunulabilir. Teminat limitleri ve meslek sınıfı prim hesabını doğrudan etkiler.",
    category: "saglik",
    related: ["teminat", "prim", "seyahat-saglik"],
    popular: true,
  },
  {
    slug: "police",
    term: "Poliçe",
    shortDefinition:
      "Sigorta sözleşmesinin şartlarını içeren resmi belge.",
    definition:
      "Poliçe, sigortacı ile sigortalı arasındaki sözleşmenin yazılı belgesidir. Teminatlar, muafiyetler, süre, prim, istisnalar ve tarafların yükümlülükleri poliçede yer alır. Sözleşme, primin ödenmesi ve poliçenin düzenlenmesiyle yürürlüğe girer. Hasar anında hak talebi poliçe koşullarına göre değerlendirilir; bu nedenle genel şartlar ve özel şartlar dikkatle okunmalıdır.",
    category: "genel",
    related: ["zeyilname", "teminat", "prim"],
  },
  {
    slug: "prim",
    term: "Prim",
    shortDefinition:
      "Sigorta güvencesi karşılığında ödenen bedel.",
    definition:
      "Prim, sigorta şirketinin üstlendiği risk karşılığında sigortalının ödediği ücrettir. Araçta yaş, marka-model, il, hasarsızlık; sağlıkta yaş, hastalık geçmişi; konutta bina yaşı ve konum prim hesabını etkiler. Peşin veya taksitli ödenebilir. Prim ödenmemesi teminatın askıya alınmasına veya poliçenin iptaline yol açabilir.",
    category: "genel",
    related: ["police", "muafiyet", "hasarsizlik"],
  },
  {
    slug: "teminat",
    term: "Teminat",
    shortDefinition:
      "Sigorta şirketinin hasar halinde üstlendiği güvence kapsamı.",
    definition:
      "Teminat, poliçede tanımlanan risklerin gerçekleşmesi halinde şirketin ödeme veya hizmet yükümlülüğüdür. Ana teminatlar (örneğin kaskoda çarpışma) ve ek teminatlar (ikame araç, cam, ferdi kaza) olarak ayrılır. Teminat dışı kalan durumlar istisna maddelerinde belirtilir. Doğru ürün seçimi, ihtiyaca uygun teminat paketini belirlemekle başlar.",
    category: "genel",
    related: ["police", "muafiyet", "istisna"],
  },
  {
    slug: "trafik-sigortasi",
    term: "Trafik Sigortası",
    shortDefinition:
      "Üçüncü kişilere verilen zararları karşılayan zorunlu mali sorumluluk sigortası.",
    definition:
      "Zorunlu mali sorumluluk (trafik) sigortası, araç işleteninin üçüncü kişilere verdiği maddi ve bedeni zararları yasal limitler dahilinde karşılar. Kendi aracınızın hasarı genellikle kapsam dışıdır; bunun için kasko gerekir. Trafik sigortası olmadan trafiğe çıkmak yasaktır ve cezai yaptırımları vardır. Limitler yetersiz kaldığında İMM ile tamamlanması önerilir.",
    category: "arac",
    related: ["imm", "kasko", "rucu"],
  },
  {
    slug: "kasko",
    term: "Kasko",
    shortDefinition:
      "Aracın kendi hasarlarını ve belirli riskleri güvence altına alan ihtiyari sigorta.",
    definition:
      "Kasko, çarpışma, çalınma, yangın, doğal afet ve cam kırılması gibi risklere karşı aracınızı koruyan ihtiyari bir sigortadır. Paket içeriği şirketten şirkete değişir; dar kasko ile genişletilmiş kasko arasında teminat farkı vardır. Hasarsızlık indirimi, muafiyet ve ek hizmetler (mini onarım, ikame araç) prim ve memnuniyeti doğrudan etkiler.",
    category: "arac",
    related: ["trafik-sigortasi", "mini-onarim", "ikame-arac", "pert"],
  },
  {
    slug: "hasarsizlik",
    term: "Hasarsızlık İndirimi",
    shortDefinition:
      "Hasarsız geçen yıllara bağlı olarak uygulanan prim indirimi.",
    definition:
      "Hasarsızlık indirimi (veya basamak sistemi), poliçe döneminde hasar kullanılmadığında sonraki yenilemede uygulanan indirimdir. Trafik ve kaskoda basamaklar farklı işler. Büyük hasarlarda indirim düşebilir; mini onarım gibi hizmetler çoğu zaman basamağı etkilemez. İndirim hakkının aktarımı şirket ve ürün kurallarına bağlıdır.",
    category: "arac",
    related: ["prim", "kasko", "mini-onarim"],
  },
  {
    slug: "eksik-sigorta",
    term: "Eksik Sigorta",
    shortDefinition:
      "Sigorta bedelinin malın gerçek değerinden düşük olması durumu.",
    definition:
      "Eksik sigorta, poliçede yazılı bedelin rayiç bedelden düşük olmasıdır. Hasarda çoğu zaman oransal (mutabakatlı) ödeme uygulanır; yani hasarın tamamı değil, sigorta bedeli / gerçek değer oranında tazminat ödenir. Özellikle konut eşyası ve araç kaskosunda bedelin güncel tutulması eksik sigorta riskini azaltır.",
    category: "genel",
    related: ["rayic-bedel", "asiri-sigorta", "tazminat"],
  },
  {
    slug: "asiri-sigorta",
    term: "Aşkın (Aşırı) Sigorta",
    shortDefinition:
      "Sigorta bedelinin malın gerçek değerinden yüksek olması.",
    definition:
      "Aşkın sigorta, sigorta bedelinin rayiç bedeli aşmasıdır. Hasarda ödeme gerçek zararı veya rayiç bedeli aşamaz; fazla prim kısmen iade edilebilir. Bilinçli olarak yüksek bedel yazmak avantaj sağlamaz. Doğru bedel tespiti hem prim hem tazminat açısından dengeli bir koruma sunar.",
    category: "genel",
    related: ["eksik-sigorta", "rayic-bedel", "prim"],
  },
  {
    slug: "tazminat",
    term: "Tazminat",
    shortDefinition:
      "Hasar veya risk gerçekleştiğinde sigortacının ödediği karşılık.",
    definition:
      "Tazminat, teminat kapsamındaki bir olay sonucunda sigortalının veya hak sahibinin uğradığı zararın poliçe şartları çerçevesinde karşılanmasıdır. Ödeme nakdi olabileceği gibi onarım, ikame mal veya hizmet şeklinde de olabilir. Muafiyet, sovtaj ve eksik sigorta gibi unsurlar nihai tutarı etkiler.",
    category: "genel",
    related: ["teminat", "sovtaj", "muafiyet"],
  },
  {
    slug: "istisna",
    term: "İstisna",
    shortDefinition:
      "Poliçede açıkça teminat dışı bırakılan durumlar.",
    definition:
      "İstisnalar, sigorta şirketinin ödemeyeceği halleri tanımlar. Örneğin savaş, nükleer risk, alkollü sürüş veya beyan dışı kullanım birçok poliçede istisnadır. Genel şartlar ve özel şartlar birlikte okunmalıdır. Teklif aşamasında istisna listesini bilmek, beklenmeyen redleri önler.",
    category: "hukuki",
    related: ["teminat", "police", "beyan"],
  },
  {
    slug: "beyan",
    term: "Beyan Yükümlülüğü",
    shortDefinition:
      "Sigortalının riskle ilgili doğru ve eksiksiz bilgi verme zorunluluğu.",
    definition:
      "Beyan yükümlülüğü, teklif ve sözleşme sırasında riskin değerlendirilmesini etkileyen bilgilerin doğru verilmesini gerektirir. Yanlış veya eksik beyan, hasarda tazminatın azaltılmasına veya poliçenin iptaline yol açabilir. Araç kullanım şekli, sağlık geçmişi ve bina özellikleri tipik beyan konularıdır.",
    category: "hukuki",
    related: ["police", "istisna", "rucu"],
  },
  {
    slug: "dask",
    term: "DASK",
    shortDefinition:
      "Zorunlu Deprem Sigortası; konutları deprem ve deprem kaynaklı hasarlara karşı korur.",
    definition:
      "DASK (Doğal Afet Sigortaları Kurumu), meskenleri deprem ve depremin neden olduğu yangın, infilak, tsunami ve yer kayması risklerine karşı zorunlu olarak güvence altına alır. Teminat binanın yeniden inşa maliyetine göre hesaplanır; eşya genellikle kapsam dışıdır. Tapu ve elektrik aboneliği işlemlerinde DASK poliçesi aranır. İhtiyari konut sigortası, DASK’ın üstünü tamamlar.",
    category: "konut",
    related: ["konut-sigortasi", "teminat", "rayic-bedel"],
  },
  {
    slug: "konut-sigortasi",
    term: "Konut Sigortası",
    shortDefinition:
      "Bina ve eşyayı yangın, hırsızlık, su baskını gibi risklere karşı koruyan ihtiyari sigorta.",
    definition:
      "Konut sigortası, DASK’ın kapsamadığı yangın, hırsızlık, cam kırılması, elektronik cihaz, ferdi kaza ve sorumluluk gibi riskleri paket halinde sunar. Bina ve eşya teminatları ayrı ayrı belirlenebilir. Deprem teminatı çoğu zaman DASK’a ek olarak veya entegre şekilde yapılandırılır. Doğru eşya bedeli eksik sigortayı önler.",
    category: "konut",
    related: ["dask", "eksik-sigorta", "ferdi-kaza"],
  },
  {
    slug: "tamamlayici-saglik",
    term: "Tamamlayıcı Sağlık Sigortası (TSS)",
    shortDefinition:
      "SGK anlaşmalı özel hastanelerde fark ücretlerini karşılayan sağlık sigortası.",
    definition:
      "Tamamlayıcı sağlık sigortası, Sosyal Güvenlik Kurumu anlaşmalı özel hastanelerde oluşabilecek fark ücretlerini poliçe limitleri dahilinde karşılar. Ayakta ve yatarak tedavi paketleri bulunur. Bekleme süreleri, ağ kapsamı ve coğrafi sınırlar ürünler arasında değişir. TSS, özel sağlık sigortasına göre genellikle daha uygun primlidir.",
    category: "saglik",
    related: ["ozel-saglik", "prim", "teminat"],
  },
  {
    slug: "ozel-saglik",
    term: "Özel Sağlık Sigortası",
    shortDefinition:
      "Özel hastane ve kliniklerde geniş kapsamlı tedavi güvencesi sunan sigorta.",
    definition:
      "Özel sağlık sigortası, anlaşmalı kurumlarda ayakta/yatarak tedavi, check-up, doğum ve diş gibi ek teminatlarla kapsamlı bir sağlık güvencesi sağlar. Prim; yaş, cinsiyet, sağlık beyanı ve seçilen plana göre değişir. Önceden var olan hastalıklar için bekleme süresi veya istisna uygulanabilir. Network genişliği hizmet kalitesini doğrudan etkiler.",
    category: "saglik",
    related: ["tamamlayici-saglik", "ferdi-kaza", "beyan"],
  },
  {
    slug: "seyahat-saglik",
    term: "Seyahat Sağlık Sigortası",
    shortDefinition:
      "Yurt içi veya yurt dışı seyahatte ani hastalık ve kaza masraflarını karşılayan poliçe.",
    definition:
      "Seyahat sağlık sigortası, seyahat süresince oluşabilecek tıbbi acil durumlar, hastaneye yatış, ilaç ve bazı ürünlerde bagaj/uçuş iptali gibi ek riskleri kapsar. Schengen vizesi için belirli limitlerde seyahat sigortası zorunludur. Poliçe süresi seyahat tarihleriyle uyumlu olmalıdır; süre aşımında teminat sona erer.",
    category: "saglik",
    related: ["ferdi-kaza", "teminat", "istisna"],
  },
  {
    slug: "yesil-kart",
    term: "Yeşil Kart",
    shortDefinition:
      "Yurt dışında araç kullanırken üçüncü şahıs sorumluluğunu belgeleyen uluslararası sigorta.",
    definition:
      "Yeşil Kart (Green Card), Türkiye’den çıkışta yabancı ülkelerde zorunlu mali sorumluluk teminatını gösteren uluslararası belgedir. Geçerli olduğu ülkeler kart üzerinde yer alır. Trafik sigortası ile ilişkili olmakla birlikte her poliçe otomatik Yeşil Kart hakkı vermeyebilir; yurt dışı seyahatten önce ayrıca düzenlenmesi gerekir.",
    category: "arac",
    related: ["trafik-sigortasi", "imm", "teminat"],
  },
  {
    slug: "agir-kusur",
    term: "Ağır Kusur",
    shortDefinition:
      "Hasarda tazminatı etkileyebilecek ciddi ihmal veya kural ihlali.",
    definition:
      "Ağır kusur, sigortalının veya sürücünün teminatı zayıflatacak ölçüde kurallara aykırı davranmasıdır. Alkollü araç kullanma, ehliyetsiz sürüş veya bilerek tehlikeye atma tipik örneklerdir. Bu hallerde şirket ödemeyi reddedebilir veya ödedikten sonra rücu edebilir. Poliçe genel şartlarındaki kusur tanımları bağlayıcıdır.",
    category: "hukuki",
    related: ["rucu", "istisna", "beyan"],
  },
  {
    slug: "hasar-dosyasi",
    term: "Hasar Dosyası",
    shortDefinition:
      "Hasar ihbarından ödeme veya red kararına kadar tutulan resmi süreç kaydı.",
    definition:
      "Hasar dosyası; ihbar, ekspertiz, evrak toplama, onarım/pert kararı ve tazminat ödemesini kapsayan süreçtir. Eksik evrak dosyayı uzatır. Fotoğraf, tutanak, ehliyet, ruhsat ve faturalar sık istenen belgelerdir. Sigorta brokeri veya acente, dosya takibinde sigortalıyı temsil ederek süreci hızlandırabilir.",
    category: "hasar",
    related: ["ekspertiz", "tazminat", "pert"],
  },
  {
    slug: "ekspertiz",
    term: "Ekspertiz",
    shortDefinition:
      "Hasarın nedeni, kapsamı ve tutarının uzman tarafından tespiti.",
    definition:
      "Ekspertiz, sigorta şirketinin veya bağımsız eksperin hasarı yerinde ya da dosya üzerinden inceleyerek raporladığı süreçtir. Onarım yöntemi, yedek parça, işçilik ve sovtaj bu rapora dayanır. Anlaşmazlık halinde ikinci ekspertiz veya tahkim yolları gündeme gelebilir. Doğru ve zamanında ekspertiz, adil tazminat için kritiktir.",
    category: "hasar",
    related: ["hasar-dosyasi", "sovtaj", "rayic-bedel"],
  },
  {
    slug: "anlasmali-servis",
    term: "Anlaşmalı Servis",
    shortDefinition:
      "Sigorta şirketinin özel koşullarla çalıştığı yetkili onarım ağı.",
    definition:
      "Anlaşmalı servisler, şirketin anlaşmalı olduğu yetkili veya özel servislerdir. Genellikle muafiyet avantajı, hızlı onay ve orijinal/eşdeğer parça garantisi sunar. Anlaşmasız serviste işlem daha uzun sürebilir ve katılım payı artabilir. Kasko seçiminde servis ağı kalitesi önemli bir kriterdir.",
    category: "hasar",
    related: ["kasko", "mini-onarim", "ikame-arac"],
  },
  {
    slug: "yenileme",
    term: "Yenileme",
    shortDefinition:
      "Poliçe süresinin bitiminde aynı veya güncellenmiş koşullarla devam edilmesi.",
    definition:
      "Yenileme, poliçe vadesi sonunda teminatın sürdürülmesidir. Prim; hasar geçmişi, tarife ve enflasyon etkisine göre yeniden hesaplanır. Sağlık sigortalarında yenileme garantisi kritik bir haktır. Erken yenileme araştırması, teminatsız kalma riskini azaltır ve daha iyi teklif bulmayı kolaylaştırır.",
    category: "genel",
    related: ["prim", "hasarsizlik", "police"],
  },
  {
    slug: "iptal",
    term: "Poliçe İptali",
    shortDefinition:
      "Sözleşmenin vade dolmadan sona erdirilmesi ve prim iade kuralları.",
    definition:
      "Poliçe iptali; sigortalının talebi, prim ödenmemesi veya beyan aykırılığı gibi nedenlerle yapılabilir. İade tutarı kullanılan gün, hasar durumu ve ürün tipine göre değişir. Zorunlu trafik sigortasında plaka devri veya hurda gibi özel iptal halleri vardır. İptal öncesi teminatsız kalma riski değerlendirilmelidir.",
    category: "genel",
    related: ["police", "prim", "zeyilname"],
  },
  {
    slug: "lehtar",
    term: "Lehtar",
    shortDefinition:
      "Sigorta tazminatını alma hakkına sahip olarak gösterilen kişi veya kurum.",
    definition:
      "Lehtar, poliçede tazminatın ödeneceği olarak belirtilen taraftır. Hayat ve ferdi kaza ürünlerinde lehtar ataması yaygındır; kredi bağlantılı poliçelerde banka lehtar olabilir. Lehtar değişikliği genellikle zeyilname ile yapılır. Net lehtar tanımı, ödeme sürecindeki hukuki anlaşmazlıkları azaltır.",
    category: "hukuki",
    related: ["ferdi-kaza", "tazminat", "zeyilname"],
  },
  {
    slug: "broker",
    term: "Sigorta Brokeri",
    shortDefinition:
      "Sigortalıyı temsil ederek şirketler arasında bağımsız teklif karşılaştıran uzman.",
    definition:
      "Sigorta brokeri, müşterinin menfaatini gözeterek birden fazla sigorta şirketinden teklif toplayan, teminatları karşılaştıran ve satış sonrası hasar/destek süreçlerinde yanında olan bağımsız bir aracıdır. Acenteden farkı, tek bir şirkete bağlı olmamasıdır. Doğru broker seçimi, hem fiyat hem teminat kalitesinde avantaj sağlar.",
    category: "genel",
    related: ["police", "teminat", "prim"],
  },
];

export const popularTerms = glossaryTerms.filter((t) => t.popular);

export function getTerm(slug: string): GlossaryTerm | undefined {
  return glossaryTerms.find((t) => t.slug === slug);
}

export function getRelatedTerms(term: GlossaryTerm): GlossaryTerm[] {
  if (!term.related?.length) return [];
  return term.related
    .map((slug) => getTerm(slug))
    .filter((t): t is GlossaryTerm => Boolean(t));
}

/** Turkish-friendly alphabetical sort */
export function sortTermsAz(terms: GlossaryTerm[]): GlossaryTerm[] {
  return [...terms].sort((a, b) =>
    a.term.localeCompare(b.term, "tr", { sensitivity: "base" }),
  );
}

export function getAlphabetLetters(terms: GlossaryTerm[]): string[] {
  const letters = new Set<string>();
  for (const term of terms) {
    const first = term.term.charAt(0).toLocaleUpperCase("tr-TR");
    letters.add(first);
  }
  return [...letters].sort((a, b) => a.localeCompare(b, "tr"));
}
