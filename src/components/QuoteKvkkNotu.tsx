import { Link } from "react-router-dom";
import { getQuoteKvkkGovde } from "../data/quoteKvkk";
import { ROUTES } from "../lib/seo/routes";
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
  const govde = getQuoteKvkkGovde(productSlug);
  if (!govde) return null;

  const metin = (
    <>
      {govde} Ayrıntılı bilgi için{" "}
      <Link to={ROUTES.kvkk} target="_blank" rel="noreferrer">
        KVKK Aydınlatma Metni
      </Link>
      &rsquo;ni inceleyebilirsiniz.
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
