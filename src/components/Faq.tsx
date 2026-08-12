import { useState } from "react";
import { HOME_FAQ_ITEMS } from "../data/faq";
import "./Faq.css";

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="faq" id="sss" aria-labelledby="faq-title">
      <div className="faq__inner">
        <div className="faq__heading">
          <span className="faq__eyebrow">Sıkça sorulan sorular</span>
          <h2 id="faq-title">Sigorta Uzmanı Hakkında Merak Ettikleriniz</h2>
          <p>
            Yanıtını bulamadığınız sorular için danışma hattımızdan bize
            ulaşabilirsiniz.
          </p>
        </div>

        <div className="faq__list">
          {HOME_FAQ_ITEMS.map((item, index) => {
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
