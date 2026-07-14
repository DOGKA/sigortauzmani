import { useState } from "react";
import "./Faq.css";

const FAQ_ITEMS = [
  {
    question: "Neden Sigorta Uzmanı'nı tercih etmeliyim, farkınız nedir?",
    answer:
      "Sigorta Uzmanı, müşterilerini temsil eden ve onların menfaatleri doğrultusunda hareket eden bir sigorta brokeridir. Bu misyonla her zaman müşterilerimizin tarafındayız; 30'a yakın sigorta şirketinin teklifini tek bir sayfada görmenizi, hem teminatları hem de fiyatları objektif olarak karşılaştırmanızı sağlıyoruz. Böylece ihtiyacınıza en uygun sigortayı kolayca belirliyor ve online olarak satın alabiliyorsunuz. Ayrıca satış sonrası herhangi bir ihtiyacınızda tecrübeli ekibimiz 7/24 desteğe hazır.",
  },
  {
    question: "Poliçe satışında müşterilerden ek ücret alıyor musunuz?",
    answer:
      "Hayır, hizmetlerimiz için sizden hiçbir ek ücret talep etmiyoruz. Ödediğiniz tutar, sigorta şirketinin belirlediği poliçe primiyle aynıdır. Karşılaştırma, danışmanlık ve satış sonrası destek hizmetlerimizin tamamı ücretsizdir.",
  },
  {
    question: "Poliçe fiyatlarında indirim yapıyor musunuz?",
    answer:
      "Poliçe fiyatları, sigorta şirketleri tarafından yasal düzenlemeler çerçevesinde belirlenir; bu nedenle aynı poliçe her kanalda aynı fiyattır. Bizim farkımız, 30'a yakın sigorta şirketinin teklifini aynı anda karşılaştırarak size en uygun fiyatlı ve en kapsamlı seçeneği bulmanızı sağlamamızdır.",
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

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="faq" aria-labelledby="faq-title">
      <div className="faq__inner">
        <div className="faq__heading">
          <span className="faq__eyebrow">Merak edilenler</span>
          <h2 id="faq-title">Sigorta Uzmanı Hakkında En Merak Edilen 5 Soru</h2>
          <p>
            Aklınıza takılan başka sorular için 7/24 canlı destek hattımızdan
            bize ulaşabilirsiniz.
          </p>
        </div>

        <div className="faq__list">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                className={`faq__item ${isOpen ? "faq__item--open" : ""}`}
                key={item.question}
              >
                <button
                  type="button"
                  className="faq__question"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{item.question}</span>
                  <span className="faq__icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
                <div className="faq__answer">
                  <p>{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
