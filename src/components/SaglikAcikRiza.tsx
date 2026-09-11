/**
 * Sağlık ürünlerinde genel KVKK notunun altında duran iki ayrı blok:
 * özel nitelikli veri aydınlatması ve ondan bağımsız açık rıza seçimi.
 * İki blok bilerek tek kutuda birleştirilmiyor.
 */

import { useId } from "react";
import { COMPANY } from "../data/company";
import type { SaglikRizaSecimi } from "../data/saglikRiza";
import { interpolate } from "../lib/i18n/format";
import { useT } from "../lib/i18n/context";
import "./SaglikAcikRiza.css";

interface Props {
  deger: SaglikRizaSecimi;
  onDegis: (deger: SaglikRizaSecimi) => void;
  hata?: boolean;
}

export default function SaglikAcikRiza({ deger, onDegis, hata = false }: Props) {
  const t = useT();
  const grupAdi = useId();
  const secenekler = [
    { value: "veriyorum" as const, label: t.quote.consentYes },
    { value: "vermiyorum" as const, label: t.quote.consentNo },
  ];

  return (
    <div className="saglik-kvkk">
      <fieldset
        className={`saglik-kvkk__riza${hata ? " saglik-kvkk__riza--hata" : ""}`}
      >
        <legend>{t.quote.consentTitle}</legend>
        <p className="saglik-kvkk__riza-metin">
          {interpolate(t.quote.consentBody, { company: COMPANY.unvan })}
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
