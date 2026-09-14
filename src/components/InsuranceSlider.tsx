import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLocale, useT } from "../lib/i18n/context";
import trafikSlider400 from "../assets/sliders/trafik-sigortasi-400.webp";
import trafikSlider800 from "../assets/sliders/trafik-sigortasi-800.webp";
import trafikSlider1200 from "../assets/sliders/trafik-sigortasi-1200.webp";
import kaskoSlider400 from "../assets/sliders/kasko-400.webp";
import kaskoSlider800 from "../assets/sliders/kasko-800.webp";
import kaskoSlider1200 from "../assets/sliders/kasko-1200.webp";
import tamamlayiciSaglikSlider400 from "../assets/sliders/tamamlayici-saglik-400.webp";
import tamamlayiciSaglikSlider800 from "../assets/sliders/tamamlayici-saglik-800.webp";
import tamamlayiciSaglikSlider1200 from "../assets/sliders/tamamlayici-saglik-1200.webp";
import ozelSaglikSlider400 from "../assets/sliders/ozel-saglik-400.webp";
import ozelSaglikSlider800 from "../assets/sliders/ozel-saglik-800.webp";
import ozelSaglikSlider1200 from "../assets/sliders/ozel-saglik-1200.webp";
import immSlider400 from "../assets/sliders/ihtiyari-mali-mesuliyet-400.webp";
import immSlider800 from "../assets/sliders/ihtiyari-mali-mesuliyet-800.webp";
import immSlider1200 from "../assets/sliders/ihtiyari-mali-mesuliyet-1200.webp";
import daskSlider400 from "../assets/sliders/dask-400.webp";
import daskSlider800 from "../assets/sliders/dask-800.webp";
import daskSlider1200 from "../assets/sliders/dask-1200.webp";
import konutSlider400 from "../assets/sliders/konut-sigortasi-400.webp";
import konutSlider800 from "../assets/sliders/konut-sigortasi-800.webp";
import konutSlider1200 from "../assets/sliders/konut-sigortasi-1200.webp";
import seyahatSaglikSlider400 from "../assets/sliders/seyahat-saglik-400.webp";
import seyahatSaglikSlider800 from "../assets/sliders/seyahat-saglik-800.webp";
import seyahatSaglikSlider1200 from "../assets/sliders/seyahat-saglik-1200.webp";
import yesilKartSlider400 from "../assets/sliders/yesil-kart-400.webp";
import yesilKartSlider800 from "../assets/sliders/yesil-kart-800.webp";
import yesilKartSlider1200 from "../assets/sliders/yesil-kart-1200.webp";
import "./InsuranceSlider.css";

const INITIAL_LOADED = 2;
const LOAD_AHEAD = 1;

const slides = [
  {
    eyebrow: "Trafik Sigortası",
    titleLine1: "Yola çıkarken.",
    titleLine2: "Güvenceniz hazır.",
    subtitle: "Zorunlu trafik sigortası tekliflerini kolayca değerlendirin.",
    image400: trafikSlider400,
    image800: trafikSlider800,
    image1200: trafikSlider1200,
    alt: "Dağ yolunda virajı dönen beyaz otomobil",
    cta: "Trafik Sigortası Teklifi Al",
    to: "/teklif/trafik-sigortasi",
  },
  {
    eyebrow: "Kasko",
    titleLine1: "Beklenmeyene karşı.",
    titleLine2: "Aracınız güvende.",
    subtitle: "Aracınızı farklı risklere karşı kapsamlı güvenceyle koruyun.",
    image400: kaskoSlider400,
    image800: kaskoSlider800,
    image1200: kaskoSlider1200,
    alt: "Arkadan çarpma sonucu hasar görmüş otomobil",
    cta: "Kasko Teklifi Al",
    to: "/teklif/kasko",
  },
  {
    eyebrow: "Tamamlayıcı Sağlık Sigortası",
    titleLine1: "Sağlığınız için.",
    titleLine2: "Bütçenizi yormadan.",
    subtitle:
      "SGK ile anlaşmalı özel hastanelerde, poliçe kapsamındaki fark ücretlerine karşı güvence seçeneklerini değerlendirin.",
    image400: tamamlayiciSaglikSlider400,
    image800: tamamlayiciSaglikSlider800,
    image1200: tamamlayiciSaglikSlider1200,
    alt: "Birbirine destek olan kenetlenmiş eller",
    cta: "Tamamlayıcı Sağlık Teklifi Al",
    to: "/teklif/tamamlayici-saglik",
  },
  {
    eyebrow: "Özel Sağlık Sigortası",
    titleLine1: "Sağlığınız için.",
    titleLine2: "Daha geniş güvence.",
    subtitle: "İhtiyacınıza uygun kapsam ve sağlık ağı seçeneklerini değerlendirin.",
    image400: ozelSaglikSlider400,
    image800: ozelSaglikSlider800,
    image1200: ozelSaglikSlider1200,
    alt: "Masada duran stetoskop",
    cta: "Özel Sağlık Teklifi Al",
    to: "/teklif/ozel-saglik",
  },
  {
    eyebrow: "İhtiyari Mali Mesuliyet (İMM)",
    titleLine1: "Limitler yetmediğinde.",
    titleLine2: "Ek güvence yanınızda.",
    subtitle: "Trafik sigortası limitlerini aşan sorumluluklara karşı korunun.",
    image400: immSlider400,
    image800: immSlider800,
    image1200: immSlider1200,
    alt: "Trafik kazasında hasar gören iki otomobil",
    cta: "İMM Teklifi Al",
    to: "/teklif/imm",
  },
  {
    eyebrow: "DASK",
    titleLine1: "Deprem beklenmez.",
    titleLine2: "Eviniz güvende.",
    subtitle: "Zorunlu deprem sigortanızı kolayca oluşturun.",
    image400: daskSlider400,
    image800: daskSlider800,
    image1200: daskSlider1200,
    alt: "Gün batımında modern konut siluetleri",
    cta: "DASK Teklifi Al",
    to: "/teklif/dask",
  },
  {
    eyebrow: "Konut Sigortası",
    titleLine1: "Eviniz değerli.",
    titleLine2: "Güvencesi hazır.",
    subtitle: "Evinizi ve eşyalarınızı beklenmedik risklere karşı koruyun.",
    image400: konutSlider400,
    image800: konutSlider800,
    image1200: konutSlider1200,
    alt: "Akşam ışıkları yanan bahçeli müstakil ev",
    cta: "Konut Sigortası Teklifi Al",
    to: "/teklif/konut",
  },
  {
    eyebrow: "Seyahat Sağlık Sigortası",
    titleLine1: "Yola çıkmadan.",
    titleLine2: "Güvenceniz hazır.",
    subtitle: "Seyahatiniz boyunca sağlık risklerine karşı koruma sağlayın.",
    image400: seyahatSaglikSlider400,
    image800: seyahatSaglikSlider800,
    image1200: seyahatSaglikSlider1200,
    alt: "Havalimanında bekleyen seyahat valizi",
    cta: "Seyahat Sağlık Teklifi Al",
    to: "/teklif/seyahat-saglik",
  },
  {
    eyebrow: "Yeşil Kart Sigortası",
    titleLine1: "Sınırlar değişir.",
    titleLine2: "Güvenceniz sürer.",
    subtitle: "Aracınızı yurt dışında kullanırken gerekli olan sigorta için teklif alın.",
    image400: yesilKartSlider400,
    image800: yesilKartSlider800,
    image1200: yesilKartSlider1200,
    alt: "Dağ manzaralı yolda ilerleyen beyaz otomobil",
    cta: "Yeşil Kart Teklifi Al",
    to: "/teklif/yesil-kart",
  },
];

export default function InsuranceSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [loadedCount, setLoadedCount] = useState(INITIAL_LOADED);
  const { quoteHref, dir } = useLocale();
  const t = useT();

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
      left: direction * (dir === "rtl" ? -1 : 1) * ((card?.offsetWidth ?? track.clientWidth) + 18),
      behavior: "smooth",
    });
  };

  return (
    <section className="insurance-slider" aria-labelledby="insurance-slider-title">
      <div className="insurance-slider__bg" aria-hidden="true" />
      <div className="insurance-slider__inner">
        <div className="insurance-slider__heading">
          <div>
            <span className="insurance-slider__eyebrow">{t.slider.eyebrow}</span>
            <h2 id="insurance-slider-title">{t.slider.title}</h2>
            <p>{t.slider.lead}</p>
          </div>

          <div className="insurance-slider__controls">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label={t.slider.prev}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label={t.slider.next}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="insurance-slider__track" ref={trackRef} onScroll={revealFromScroll}>
          {slides.map((slide, index) => {
            const slug = slide.to.replace("/teklif/", "");
            const copy = t.slides[slug] ?? {
              eyebrow: slide.eyebrow,
              line1: slide.titleLine1,
              line2: slide.titleLine2,
              subtitle: slide.subtitle,
              cta: slide.cta,
            };
            return (
            <Link className="insurance-slider__card" to={quoteHref(slug)} key={slide.eyebrow}>
              {index < loadedCount && (
                <img
                  src={slide.image1200}
                  srcSet={`${slide.image400} 400w, ${slide.image800} 800w, ${slide.image1200} 1200w`}
                  sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1128px) calc(100vw - 48px), 1080px"
                  alt={slide.alt}
                  width={1200}
                  height={597}
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "low"}
                  decoding="async"
                />
              )}
              <span className="insurance-slider__content">
                <span className="insurance-slider__badge">{copy.eyebrow}</span>
                <strong>
                  {copy.line1}
                  <em>{copy.line2}</em>
                </strong>
                <span>{copy.subtitle}</span>
                <span className="insurance-slider__cta">
                  {copy.cta}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </span>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
