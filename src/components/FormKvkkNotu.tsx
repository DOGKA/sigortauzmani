import { Link } from "react-router-dom";
import { useLocale, useT } from "../lib/i18n/context";
import "./FormKvkkNotu.css";

export default function FormKvkkNotu({
  variant,
}: {
  variant: "iletisim" | "iptal";
}) {
  const t = useT();
  const { href } = useLocale();
  const copy =
    variant === "iptal"
      ? {
          body: t.cancel.kvkkBody,
          more: t.cancel.kvkkMore,
          link: t.cancel.kvkkLink,
          after: t.cancel.kvkkAfter,
        }
      : {
          body: t.contact.kvkkBody,
          more: t.quote.kvkkMore,
          link: t.quote.kvkkLink,
          after: t.quote.kvkkAfter,
        };

  return (
    <p className="form-kvkk-notu">
      {copy.body} {copy.more}{" "}
      <Link to={href("kvkk")}>{copy.link}</Link>
      {copy.after}
    </p>
  );
}
