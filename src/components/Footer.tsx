import { useRef } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const columns = [
  {
    title: "Lorem Ipsum",
    links: ["Dolor sit amet", "Consectetur elit", "Sed do eiusmod", "Tempor incididunt"],
  },
  {
    title: "Ut Labore",
    links: ["Dolore magna", "Aliqua enim", "Minim veniam", "Quis nostrud"],
  },
  {
    title: "Exercitation",
    links: ["Ullamco laboris", "Nisi ut aliquip", "Ex ea commodo", "Duis aute irure"],
  },
];

export default function Footer() {
  const sceneRef = useRef<HTMLDivElement>(null);

  const handleMove = (event: React.MouseEvent<HTMLElement>) => {
    const scene = sceneRef.current;
    if (!scene) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    scene.style.setProperty("--tilt-x", `${x * 10}`);
    scene.style.setProperty("--tilt-y", `${y * 10}`);
  };

  const handleLeave = () => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.style.setProperty("--tilt-x", "0");
    scene.style.setProperty("--tilt-y", "0");
  };

  return (
    <footer className="footer" onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <div className="footer__bg" aria-hidden="true">
        <div className="footer__blob footer__blob--1" />
        <div className="footer__blob footer__blob--2" />
        <div className="footer__grid-pattern" />
      </div>

      <div className="footer__scene" ref={sceneRef} aria-hidden="true">
        <span className="footer__orb footer__orb--1" />
        <span className="footer__orb footer__orb--2" />
        <span className="footer__orb footer__orb--3" />
        <span className="footer__ring" />
      </div>

      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <Link to="/" className="footer__brand-link">
              <img src="/sigortauzmani-logo.svg" alt="Sigorta Uzmanı" />
              <span>
                sigorta<strong>uzmanı</strong>
              </span>
            </Link>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <a href="tel:4440000" className="footer__phone">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
                  fill="currentColor"
                />
              </svg>
              444 00 00
            </a>
          </div>

          <div className="footer__columns">
            {columns.map((column) => (
              <div className="footer__column" key={column.title}>
                <h3>{column.title}</h3>
                <ul>
                  {column.links.map((link) => (
                    <li key={link}>
                      <button type="button">{link}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="footer__bottom">
          <span>© 2026 Sigorta Uzmanı. Powered by Juststack Software and Tech.</span>
          <div className="footer__legal">
            <button type="button">KVKK Aydınlatma Metni</button>
            <button type="button">Gizlilik Politikası</button>
            <button type="button">Çerez Politikası</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
