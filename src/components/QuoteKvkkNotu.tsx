import { Link } from "react-router-dom";
import { getQuoteKvkkGovde } from "../data/quoteKvkk";
import { isSaglikUrunu } from "../data/saglikRiza";
import { useLocale, useT } from "../lib/i18n/context";
import BilgiNotu from "../pages/quote/BilgiNotu";

interface Props {
  productSlug: string;
  /** Self servis akışında BilgiNotu; lead formunda quote stili. */
  variant?: "flow" | "quote";
}

export default function QuoteKvkkNotu({
  productSlug,
  variant = "flow",
}: Props) {
  const { href } = useLocale();
  const t = useT();
  if (!getQuoteKvkkGovde(productSlug)) return null;
  const govde = isSaglikUrunu(productSlug) ? t.quote.saglikKvkkBody : t.quote.kvkkBody;

  const metin = (
    <>
      {govde} {t.quote.kvkkMore}{" "}
      <Link to={href("kvkk")} target="_blank" rel="noreferrer">
        {t.quote.kvkkLink}
      </Link>
      {t.quote.kvkkAfter}
    </>
  );

  if (variant === "quote") {
    return (
      <p className="quote__kvkk-notu">
        <svg
          className="quote__kvkk-notu-ikon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 16v-4M12 8h.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span>{metin}</span>
      </p>
    );
  }

  return <BilgiNotu>{metin}</BilgiNotu>;
}
