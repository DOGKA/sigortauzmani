/**
 * Sağlık ürünlerinde genel KVKK notunun altında duran iki ayrı blok:
 * özel nitelikli veri aydınlatması ve ondan bağımsız açık rıza seçimi.
 * İki blok bilerek tek kutuda birleştirilmiyor.
 */

import { useId } from "react";
import {
  SAGLIK_RIZA_BASLIK,
  SAGLIK_RIZA_HATA,
  SAGLIK_RIZA_METNI,
  SAGLIK_RIZA_RET_NOTU,
  SAGLIK_RIZA_SECENEKLERI,
  type SaglikRizaSecimi,
} from "../data/saglikRiza";
import "./SaglikAcikRiza.css";

interface Props {
  deger: SaglikRizaSecimi;
  onDegis: (deger: SaglikRizaSecimi) => void;
  hata?: boolean;
}

export default function SaglikAcikRiza({ deger, onDegis, hata = false }: Props) {
  const grupAdi = useId();

  return (
    <div className="saglik-kvkk">
      <fieldset
        className={`saglik-kvkk__riza${hata ? " saglik-kvkk__riza--hata" : ""}`}
      >
        <legend>{SAGLIK_RIZA_BASLIK}</legend>
        <p className="saglik-kvkk__riza-metin">{SAGLIK_RIZA_METNI}</p>

        <div className="saglik-kvkk__secenekler">
          {SAGLIK_RIZA_SECENEKLERI.map((secenek) => (
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
          <p className="saglik-kvkk__not">{SAGLIK_RIZA_RET_NOTU}</p>
        ) : null}

        {hata ? (
          <p className="saglik-kvkk__hata" role="alert">
            {SAGLIK_RIZA_HATA}
          </p>
        ) : null}
      </fieldset>
    </div>
  );
}
