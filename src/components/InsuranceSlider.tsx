import { useRef } from "react";
import { Link } from "react-router-dom";
import carSlider from "../assets/sliders/car-slider.svg";
import familySlider from "../assets/sliders/famil-slider.svg";
import houseSlider from "../assets/sliders/house-slider.svg";
import "./InsuranceSlider.css";

const slides = [
  {
    title: "Aracınız İçin Güvenli Yolculuklar",
    subtitle: "Kasko ve trafik sigortasında size özel avantajlı teklifleri keşfedin.",
    image: carSlider,
    alt: "Şehir yolunda ilerleyen mavi otomobil",
    cta: "Trafik Sigortası Teklifi Al",
    to: "/teklif/trafik-sigortasi",
  },
  {
    title: "Sevdiklerinizin Sağlığı Güvende",
    subtitle: "Ailenize uygun sağlık sigortası seçeneklerini kolayca karşılaştırın.",
    image: familySlider,
    alt: "Birlikte vakit geçiren mutlu aile",
    cta: "Tamamlayıcı Sağlık Teklifi Al",
    to: "/teklif/tamamlayici-saglik",
  },
  {
    title: "Eviniz İçin Güçlü Bir Güvence",
    subtitle: "DASK ile evinizi beklenmedik risklere karşı bugünden koruyun.",
    image: houseSlider,
    alt: "Bahçeli modern aile evi",
    cta: "DASK Teklifi Al",
    to: "/teklif/dask",
  },
];

export default function InsuranceSlider() {
  const trackRef = useRef<HTMLDivElement>(null);

  const move = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;

    const card = track.querySelector<HTMLElement>(".insurance-slider__card");
    track.scrollBy({
      left: direction * ((card?.offsetWidth ?? track.clientWidth) + 18),
      behavior: "smooth",
    });
  };

  return (
    <section className="insurance-slider" aria-labelledby="insurance-slider-title">
      <div className="insurance-slider__bg" aria-hidden="true" />
      <div className="insurance-slider__inner">
        <div className="insurance-slider__heading">
          <div>
            <span className="insurance-slider__eyebrow">Sizin için seçtik</span>
            <h2 id="insurance-slider-title">Hayatın Her Anında Yanınızdayız</h2>
            <p>İhtiyacınıza uygun güvenceyi bulun, teklifinizi dakikalar içinde alın.</p>
          </div>

          <div className="insurance-slider__controls">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Önceki sigorta seçeneği"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Sonraki sigorta seçeneği"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="insurance-slider__track" ref={trackRef}>
          {slides.map((slide) => (
            <Link className="insurance-slider__card" to={slide.to} key={slide.title}>
              <img src={slide.image} alt={slide.alt} />
              <span className="insurance-slider__shade" aria-hidden="true" />
              <span className="insurance-slider__content">
                <strong>{slide.title}</strong>
                <span>{slide.subtitle}</span>
                <span className="insurance-slider__cta">
                  {slide.cta}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
