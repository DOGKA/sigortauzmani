/**
 * Ana sayfada görünen sıkça sorulan sorular. FAQPage şeması bu listeden
 * üretildiği için metinler sayfada görünenle birebir aynı kalmalıdır.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export const HOME_FAQ_ITEMS: FaqItem[] = [
  {
    question: "Teklif alma süreci nasıl ilerliyor?",
    answer:
      "Bilgilerinizi ürün formuna girin. Entegrasyon bulunan sigorta şirketlerinden gelen anlık fiyat ve teminat seçeneklerini karşılaştırın. Seçtiğiniz şirkette çevrim içi satın alma destekleniyorsa doğrudan sigorta şirketinin ödeme ekranına yönlendirilirsiniz. Desteklenmiyorsa işleminiz, talep numaranız üzerinden WhatsApp temsilcimizle devam eder.",
  },
  {
    question: "Sigorta Uzmanı'nı neden tercih etmeliyim?",
    answer:
      "sigortauzmani.net, farklı sigorta şirketlerinin ürün ve tekliflerine ulaşmayı kolaylaştıran dijital bir sigorta platformudur. Entegre şirketlerden gelen fiyat ve teminat seçeneklerini tek ekranda görmenize yardımcı olur; poliçe, yenileme, değişiklik ve hasar süreçlerinde destek sunar.",
  },
  {
    question: "Teklif almak için ek ücret öder miyim?",
    answer:
      "Teklifleri görüntülemek ve karşılaştırmak için sizden ayrıca hizmet bedeli talep edilmez. Poliçe primi ve ödeme koşulları seçtiğiniz sigorta şirketinin teklifine göre belirlenir. Çevrim içi satın almada ödeme, sigorta şirketinin kendi ödeme ekranında yapılır; kart bilgileriniz Sigorta Uzmanı tarafından görülmez veya saklanmaz.",
  },
  {
    question: "Sigorta tekliflerini karşılaştırırken nelere dikkat etmeliyim?",
    answer:
      "Fiyatın yanı sıra teminat limitleri, muafiyetler, istisnalar, ek hizmetler ve ödeme koşulları birlikte değerlendirilmelidir. Ekibimiz, seçenekler arasındaki farkları açıklayarak ihtiyacınıza uygun poliçeyi seçmenize yardımcı olur.",
  },
  {
    question: "Kişisel verilerim nasıl kullanılıyor ve korunuyor?",
    answer:
      "Paylaştığınız kişisel veriler; tekliflerin oluşturulması, ilgili sigorta şirketlerinden fiyat alınması, seçtiğiniz satın alma veya temsilci destek sürecinin yürütülmesi amacıyla KVKK ve ilgili mevzuat kapsamında işlenir. Çevrim içi ödemede kart bilgileriniz sigorta şirketinin ekranına girilir; Sigorta Uzmanı tarafından görülmez veya saklanmaz. Ayrıntılı bilgi için KVKK Aydınlatma Metni'ni inceleyebilirsiniz.",
  },
];
