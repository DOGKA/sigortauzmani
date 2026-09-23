import "./Partners.css";
import { useT } from "../lib/i18n/context";

const PARTNERS = [
  { file: "aksigorta.webp", name: "Aksigorta" },
  { file: "allianz.webp", name: "Allianz" },
  { file: "anadolu.webp", name: "Anadolu Sigorta" },
  { file: "ankara.webp", name: "Ankara Sigorta" },
  { file: "axa.webp", name: "AXA Sigorta" },
  { file: "bereket-sigorta.webp", name: "Bereket Sigorta" },
  { file: "corpus-sigorta.webp", name: "Corpus Sigorta" },
  { file: "emaa-sigorta.webp", name: "EMAA Sigorta" },
  { file: "gig-sigorta.webp", name: "GIG Sigorta" },
  { file: "hdi.webp", name: "HDI Sigorta" },
  { file: "hepsi-iyi-sigorta.webp", name: "Hepiyi Sigorta" },
  { file: "magdeburger-sigorta.webp", name: "Magdeburger Sigorta" },
  { file: "mapfre.webp", name: "MAPFRE Sigorta" },
  { file: "neova-sigorta.webp", name: "Neova Sigorta" },
  { file: "orient-sigorta.webp", name: "Orient Sigorta" },
  { file: "quick-sigorta.webp", name: "Quick Sigorta" },
  { file: "ray-sigorta.webp", name: "Ray Sigorta" },
  { file: "referans-sigorta.webp", name: "Referans Sigorta" },
  { file: "sompo.webp", name: "Sompo Sigorta" },
  { file: "turk-nippon-sigorta.webp", name: "Türk Nippon Sigorta" },
  { file: "turkiye.webp", name: "Türkiye Sigorta" },
  { file: "unico-sigorta.webp", name: "Unico Sigorta" },
  { file: "zurich-sigorta.webp", name: "Zurich Sigorta" },
];

const firstRow = PARTNERS.slice(0, Math.ceil(PARTNERS.length / 2));
const secondRow = PARTNERS.slice(Math.ceil(PARTNERS.length / 2));

function MarqueeRow({
  partners,
  reverse,
}: {
  partners: typeof PARTNERS;
  reverse?: boolean;
}) {
  return (
    <div className={`partners__row ${reverse ? "partners__row--reverse" : ""}`}>
      <div className="partners__row-track">
        {[...partners, ...partners].map((partner, i) => (
          <div className="partners__logo" key={`${partner.file}-${i}`}>
            <img
              src={`/assets/img/partners/${partner.file}`}
              alt={partner.name}
              title={partner.name}
              width="138"
              height="56"
              loading="lazy"
              fetchPriority="low"
              decoding="async"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Partners() {
  const t = useT();
  return (
    <section className="partners" aria-labelledby="partners-title">
      <div className="partners__inner">
        <div className="partners__heading">
          <span className="partners__eyebrow">{t.partners.eyebrow}</span>
          <h2 id="partners-title">{t.partners.title}</h2>
          <p>{t.partners.lead}</p>
        </div>

        <div className="partners__marquee">
          <MarqueeRow partners={firstRow} />
          <MarqueeRow partners={secondRow} reverse />
        </div>
      </div>
    </section>
  );
}
