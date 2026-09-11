import { useState } from "react";
import { useT } from "../lib/i18n/context";
import "./Faq.css";

export default function Faq() {
  const t = useT();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="faq" id="sss" aria-labelledby="faq-title">
      <div className="faq__inner">
        <div className="faq__heading">
          <span className="faq__eyebrow">{t.faq.eyebrow}</span>
          <h2 id="faq-title">{t.faq.title}</h2>
          <p>{t.faq.lead}</p>
        </div>

        <div className="faq__list">
          {t.faq.items.map((item, index) => {
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
