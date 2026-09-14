import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocale, useT } from "../lib/i18n/context";

export default function UnavailablePage({
  title,
  message,
  contactTo,
  contactLabel,
}: {
  title: string;
  message: string;
  contactTo?: string;
  contactLabel?: string;
}) {
  const { href } = useLocale();
  const t = useT();
  useEffect(() => {
    const existing = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const meta = existing ?? document.createElement("meta");
    const previous = meta.content;
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    if (!existing) document.head.appendChild(meta);
    return () => {
      if (existing) meta.content = previous;
      else meta.remove();
    };
  }, []);

  return (
    <main style={{ minHeight: "68vh", display: "grid", placeItems: "center", padding: "48px 20px", background: "#f6f8fb" }}>
      <section style={{ width: "min(620px, 100%)", padding: "44px", borderRadius: 24, border: "1px solid #e2e8f0", background: "white", textAlign: "center", boxShadow: "0 20px 60px rgba(15,23,42,.08)" }}>
        <img src="/favicon.svg" alt="" width="64" height="64" />
        <h1 style={{ margin: "20px 0 10px", color: "#0f172a", fontSize: "clamp(28px, 5vw, 40px)" }}>{title}</h1>
        <p style={{ margin: "0 auto 26px", maxWidth: 480, color: "#64748b", lineHeight: 1.7 }}>{message}</p>
        <Link to={contactTo ?? href("contact")} style={{ display: "inline-block", borderRadius: 12, background: "#0284c7", padding: "12px 20px", color: "white", fontWeight: 700, textDecoration: "none" }}>
          {contactLabel ?? t.unavailable.contact}
        </Link>
      </section>
    </main>
  );
}
