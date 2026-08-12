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
      "İhtiyacınıza ve paylaştığınız bilgilere göre anlaşmalı sigorta şirketlerinin teklifleri araştırılır. Fiyat, teminat ve kapsamlar karşılaştırılarak uygun seçenekler size sunulur. Seçiminizin ardından poliçe işlemleriniz için destek sağlanır.",
  },
  {
    question: "Sigorta Uzmanı'nı neden tercih etmeliyim?",
    answer:
      "Sigorta Uzmanı, farklı sigorta şirketlerinin ürün ve tekliflerine ulaşmayı kolaylaştıran bir sigorta hizmet platformudur. Seçenekler yalnızca fiyat açısından değil; teminat, kapsam ve ihtiyaçlarınıza uygunluk bakımından da değerlendirilir. Poliçeleştirme, yenileme, değişiklik ve hasar süreçlerinde destek sunulur.",
  },
  {
    question: "Teklif almak için ek ücret öder miyim?",
    answer:
      "Tekliflerin araştırılması ve karşılaştırılması için sizden ayrıca hizmet bedeli talep edilmez. Poliçe primi, seçilen sigorta şirketinin sunduğu teklif, teminatlar ve ödeme koşullarına göre belirlenir.",
  },
  {
    question: "Sigorta tekliflerini karşılaştırırken nelere dikkat etmeliyim?",
    answer:
      "Fiyatın yanı sıra teminat limitleri, muafiyetler, istisnalar, ek hizmetler ve ödeme koşulları birlikte değerlendirilmelidir. Ekibimiz, seçenekler arasındaki farkları açıklayarak ihtiyacınıza uygun poliçeyi seçmenize yardımcı olur.",
  },
  {
    question: "Kişisel verilerim nasıl kullanılıyor ve korunuyor?",
    answer:
      "Paylaştığınız kişisel veriler, teklif ve poliçe süreçlerinin yürütülmesi amacıyla KVKK ve ilgili mevzuat kapsamında işlenir. Gerekli bilgiler, süreçle sınırlı olarak ilgili sigorta şirketleri, yetkili hizmet sağlayıcılar ve yasal zorunluluk hâlinde yetkili kurumlarla paylaşılabilir. Ayrıntılı bilgi için KVKK Aydınlatma Metni'ni inceleyebilirsiniz.",
  },
];
