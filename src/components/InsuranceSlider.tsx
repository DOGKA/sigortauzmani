import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import trafikSlider from "../assets/sliders/trafik-sigortasi.png";
import kaskoSlider from "../assets/sliders/kasko.png";
import tamamlayiciSaglikSlider from "../assets/sliders/tamamlayici-saglik.png";
import ozelSaglikSlider from "../assets/sliders/ozel-saglik.png";
import immSlider from "../assets/sliders/ihtiyari-mali-mesuliyet.png";
import daskSlider from "../assets/sliders/dask.png";
import konutSlider from "../assets/sliders/konut-sigortasi.png";
import seyahatSaglikSlider from "../assets/sliders/seyahat-saglik.png";
import yesilKartSlider from "../assets/sliders/yesil-kart.png";
import "./InsuranceSlider.css";

const INITIAL_LOADED = 3;
const LOAD_AHEAD = 2;

const slides = [
  {
    eyebrow: "Trafik Sigortası",
    titleLine1: "Yola çıkarken.",
    titleLine2: "Güvenceniz hazır.",
    subtitle: "Zorunlu trafik sigortası tekliflerini kolayca değerlendirin.",
    image: trafikSlider,
    alt: "Dağ yolunda virajı dönen beyaz otomobil",
    cta: "Trafik Sigortası Teklifi Al",
    to: "/teklif/trafik-sigortasi",
  },
  {
    eyebrow: "Kasko",
    titleLine1: "Beklenmeyene karşı.",
    titleLine2: "Aracınız güvende.",
    subtitle: "Aracınızı farklı risklere karşı kapsamlı güvenceyle koruyun.",
    image: kaskoSlider,
    alt: "Arkadan çarpma sonucu hasar görmüş otomobil",
    cta: "Kasko Teklifi Al",
    to: "/teklif/kasko",
  },
  {
    eyebrow: "Tamamlayıcı Sağlık Sigortası",
    titleLine1: "Sağlığınız için.",
    titleLine2: "Bütçenizi yormadan.",
    subtitle: "SGK anlaşmalı özel hastanelerde avantajlı sağlık güvencesi.",
    image: tamamlayiciSaglikSlider,
    alt: "Birbirine destek olan kenetlenmiş eller",
    cta: "Tamamlayıcı Sağlık Teklifi Al",
    to: "/teklif/tamamlayici-saglik",
  },
  {
    eyebrow: "Özel Sağlık Sigortası",
    titleLine1: "Sağlığınız için.",
    titleLine2: "Daha geniş güvence.",
    subtitle: "İhtiyacınıza uygun kapsam ve sağlık ağı seçeneklerini değerlendirin.",
    image: ozelSaglikSlider,
    alt: "Masada duran stetoskop",
    cta: "Özel Sağlık Teklifi Al",
    to: "/teklif/ozel-saglik",
  },
  {
    eyebrow: "İhtiyari Mali Mesuliyet (İMM)",
    titleLine1: "Limitler yetmediğinde.",
    titleLine2: "Ek güvence yanınızda.",
    subtitle: "Trafik sigortası limitlerini aşan sorumluluklara karşı korunun.",
    image: immSlider,
    alt: "Trafik kazasında hasar gören iki otomobil",
    cta: "İMM Teklifi Al",
    to: "/teklif/imm",
  },
  {
    eyebrow: "DASK",
    titleLine1: "Deprem beklenmez.",
    titleLine2: "Eviniz güvende.",
    subtitle: "Zorunlu deprem sigortanızı kolayca oluşturun.",
    image: daskSlider,
    alt: "Gün batımında modern konut siluetleri",
    cta: "DASK Teklifi Al",
    to: "/teklif/dask",
  },
  {
    eyebrow: "Konut Sigortası",
    titleLine1: "Eviniz değerli.",
    titleLine2: "Güvencesi hazır.",
    subtitle: "Evinizi ve eşyalarınızı beklenmedik risklere karşı koruyun.",
    image: konutSlider,
    alt: "Akşam ışıkları yanan bahçeli müstakil ev",
    cta: "Teklif Al",
    to: "/teklif/dask",
  },
  {
    eyebrow: "Seyahat Sağlık Sigortası",
    titleLine1: "Yola çıkmadan.",
    titleLine2: "Güvenceniz hazır.",
    subtitle: "Seyahatiniz boyunca sağlık risklerine karşı koruma sağlayın.",
    image: seyahatSaglikSlider,
    alt: "Havalimanında bekleyen seyahat valizi",
    cta: "Seyahat Sağlık Teklifi Al",
    to: "/teklif/seyahat-saglik",
  },
  {
    eyebrow: "Yeşil Kart Sigortası",
    titleLine1: "Sınırlar değişir.",
    titleLine2: "Güvenceniz sürer.",
    subtitle: "Yurt dışı araç kullanımınız için gerekli sigortayı hazırlayın.",
    image: yesilKartSlider,
    alt: "Dağ manzaralı yolda ilerleyen beyaz otomobil",
    cta: "Yeşil Kart Teklifi Al",
    to: "/teklif/yesil-kart",
  },
];

export default function InsuranceSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [loadedCount, setLoadedCount] = useState(INITIAL_LOADED);

  const revealFromScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const card = track.querySelector<HTMLElement>(".insurance-slider__card");
    const step = (card?.offsetWidth ?? track.clientWidth) + 18;
    const activeIndex = Math.round(track.scrollLeft / step);

    setLoadedCount((count) =>
      Math.min(slides.length, Math.max(count, activeIndex + 1 + LOAD_AHEAD)),
    );
  }, []);

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

        <div className="insurance-slider__track" ref={trackRef} onScroll={revealFromScroll}>
          {slides.map((slide, index) => (
            <Link className="insurance-slider__card" to={slide.to} key={slide.eyebrow}>
              {index < loadedCount && (
                <img
                  src={slide.image}
                  alt={slide.alt}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  decoding="async"
                />
              )}
              <span className="insurance-slider__content">
                <span className="insurance-slider__badge">{slide.eyebrow}</span>
                <strong>
                  {slide.titleLine1}
                  <em>{slide.titleLine2}</em>
                </strong>
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
