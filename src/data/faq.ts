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
    question: "Neden Sigorta Uzmanı'nı tercih etmeliyim, farkınız nedir?",
    answer:
      "Sigorta Uzmanı, anlaşmalı olduğu 30'a yakın sigorta şirketinin tekliflerini sizin için araştıran ve karşılaştıran deneyimli bir sigorta acentesidir. İhtiyaçlarınıza uygun seçenekleri yalnızca fiyatlarıyla değil; teminatları, kapsamları ve avantajlarıyla birlikte değerlendirerek karar vermenizi kolaylaştırırız. Amacımız sadece en ucuz poliçeyi sunmak değil, doğru teminatlarla en uygun sigortayı bulmanıza yardımcı olmaktır. Poliçe düzenlendikten sonra da yenileme, değişiklik ve hasar süreçlerinde uzman ekibimizle yanınızda olmaya devam ederiz.",
  },
  {
    question: "Poliçe satışında müşterilerden ek ücret alıyor musunuz?",
    answer:
      "Hayır, hizmetlerimiz için sizden hiçbir ek ücret talep etmiyoruz. Ödediğiniz tutar, sigorta şirketinin belirlediği poliçe primiyle aynıdır. Karşılaştırma, danışmanlık ve satış sonrası destek hizmetlerimizin tamamı ücretsizdir.",
  },
  {
    question: "Poliçe fiyatlarında indirim yapıyor musunuz?",
    answer:
      "Poliçe fiyatları, sigorta şirketleri tarafından yasal düzenlemeler çerçevesinde belirlenir. Bizim farkımız, 30'a yakın sigorta şirketinin teklifini aynı anda karşılaştırarak size en uygun fiyatlı ve en kapsamlı seçeneği bulmanızı sağlamamızdır.",
  },
  {
    question: "En iyi sigorta teklifini nasıl seçeceğim?",
    answer:
      "En iyi teklif yalnızca en düşük fiyatlı olan değil, ihtiyacınızı en iyi karşılayandır. Karşılaştırma ekranımızda fiyatların yanı sıra teminat kapsamlarını, muafiyetleri ve ek hizmetleri de net biçimde görebilirsiniz. Kararsız kaldığınızda uzman ekibimiz size en uygun seçeneği bulmanız için ücretsiz danışmanlık sunar.",
  },
  {
    question: "Sigorta Uzmanı'nda kişisel bilgilerim güvende mi?",
    answer:
      "Evet. Kişisel verileriniz 6698 sayılı KVKK kapsamında işlenir ve korunur. Bilgileriniz SSL sertifikası ile şifrelenerek iletilir, yalnızca teklif oluşturma ve poliçeleştirme amacıyla kullanılır; üçüncü kişilerle izniniz olmadan asla paylaşılmaz.",
  },
];
