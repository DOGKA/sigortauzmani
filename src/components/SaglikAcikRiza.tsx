/**
 * Sağlık ürünlerinde tek kutu: üstte özel nitelikli veri aydınlatması, altında
 * ondan ayrı açık rıza cümlesi ve seçimi. Aydınlatma ile rıza aynı cümlede
 * birleştirilmiyor; KVKK rızanın aydınlatmadan ayrı alınmasını istiyor.
 */

import { useId } from "react";
import { Link } from "react-router-dom";
import type { SaglikRizaSecimi } from "../data/saglikRiza";
import { interpolate } from "../lib/i18n/format";
import { useLocale, useT } from "../lib/i18n/context";
import { useSiteSettings } from "../lib/settings/context";
import "./SaglikAcikRiza.css";

interface Props {
  deger: SaglikRizaSecimi;
  onDegis: (deger: SaglikRizaSecimi) => void;
  hata?: boolean;
}

export default function SaglikAcikRiza({ deger, onDegis, hata = false }: Props) {
  const t = useT();
  const { href } = useLocale();
  const { settings } = useSiteSettings();
  const grupAdi = useId();
  const secenekler = [
    { value: "veriyorum" as const, label: t.quote.consentYes },
    { value: "vermiyorum" as const, label: t.quote.consentNo },
  ];

  return (
    <div className={`saglik-kvkk${hata ? " saglik-kvkk--hata" : ""}`}>
      <p className="saglik-kvkk__bilgi">
        {t.quote.saglikKvkkBody} {t.quote.kvkkMore}{" "}
        <Link to={href("kvkk")} target="_blank" rel="noreferrer">
          {t.quote.kvkkLink}
        </Link>
        {t.quote.kvkkAfter}
      </p>

      <fieldset className="saglik-kvkk__riza">
        <legend>{t.quote.consentTitle}</legend>
        <p className="saglik-kvkk__riza-metin">
          {interpolate(t.quote.consentBody, { company: settings.company.legalName })}
        </p>

        <div className="saglik-kvkk__secenekler">
          {secenekler.map((secenek) => (
            <label key={secenek.value} className="saglik-kvkk__secenek">
              <input
                type="radio"
                name={grupAdi}
                value={secenek.value}
                checked={deger === secenek.value}
                onChange={() => onDegis(secenek.value)}
              />
              <span>{secenek.label}</span>
            </label>
          ))}
        </div>

        {deger === "vermiyorum" ? (
          <p className="saglik-kvkk__not">{t.quote.consentDeclineNote}</p>
        ) : null}

        {hata ? (
          <p className="saglik-kvkk__hata" role="alert">
            {t.quote.consentError}
          </p>
        ) : null}
      </fieldset>
    </div>
  );
}
