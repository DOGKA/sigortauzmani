import carMini from "../assets/minis/car-mini.svg";
import kaskoMini from "../assets/minis/sigortauzmani-mini.svg";
import healthMini from "../assets/minis/health-mini.svg";
import houseMini from "../assets/minis/house-mini.svg";
import travelMini from "../assets/minis/travel-mini.svg";
import "./MiniShowcase.css";

type Card = {
  image: string;
  alt: string;
  lines: string[];
  highlight: string;
  featured?: boolean;
};

const CARDS: Card[] = [
  {
    image: kaskoMini,
    alt: "Kasko",
    lines: ["Kasko ile", "beklenmediklere", "hazırlıklı olun."],
    highlight: "Kasko",
    featured: true,
  },
  {
    image: carMini,
    alt: "Trafik sigortası",
    lines: ["Yolda güven,", "içinizde huzur."],
    highlight: "güven,",
  },
  {
    image: healthMini,
    alt: "Sağlık sigortası",
    lines: ["Sağlığınız", "en değerli", "hazineniz."],
    highlight: "Sağlığınız",
  },
  {
    image: houseMini,
    alt: "Konut sigortası",
    lines: ["Evinizi", "güvence", "altına alın."],
    highlight: "güvence",
  },
  {
    image: travelMini,
    alt: "Seyahat sigortası",
    lines: ["Seyahatiniz", "güvende,", "anılarınız değerli."],
    highlight: "Seyahatiniz",
  },
];

function CardText({ card }: { card: Card }) {
  return (
    <p className="mini-showcase__text">
      {card.lines.map((line) => (
        <span key={line} className="mini-showcase__line">
          {line.split(" ").map((word, wordIndex) => (
            <span
              key={`${line}-${wordIndex}`}
              className={
                word === card.highlight
                  ? "mini-showcase__word mini-showcase__word--accent"
                  : "mini-showcase__word"
              }
            >
              {word}
            </span>
          ))}
        </span>
      ))}
    </p>
  );
}

export default function MiniShowcase() {
  return (
    <section className="mini-showcase" aria-label="Sigorta ürünleri vitrini">
      <div className="mini-showcase__inner">
        <div className="mini-showcase__grid">
          {CARDS.map((card) => (
            <article
              className={`mini-showcase__card ${
                card.featured ? "mini-showcase__card--featured" : ""
              }`}
              key={card.alt}
            >
              <img
                src={card.image}
                alt={card.alt}
                loading="lazy"
                className="mini-showcase__image"
              />
              <CardText card={card} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
