import { useLocale, useT } from "../lib/i18n/context";

export default function TurkishContentNotice() {
  const { locale } = useLocale();
  const t = useT();
  if (locale === "tr") return null;
  return (
    <p
      style={{
        margin: "0 auto 16px",
        maxWidth: 720,
        padding: "10px 14px",
        borderRadius: 12,
        background: "#e3edfd",
        color: "#0b48c8",
        fontSize: 14,
        fontWeight: 600,
        textAlign: "center",
      }}
    >
      {t.notice.turkishSection} · {t.nav.turkish}
    </p>
  );
}
