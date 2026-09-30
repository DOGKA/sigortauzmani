/**
 * Şirket bu teklif üzerinden satın almaya izin vermediğinde kart ekranı
 * yerine açılan uyarı. Tek aksiyon aynı şirket adına talep açmak; ödeme
 * ekranına dönülmez.
 */

import { useState } from "react";
import { useT } from "../../lib/i18n/context";
import { formatPrim } from "./paraBirimi";
import type { SirketTeklifi } from "../../lib/io/types";

interface Props {
  bransNo: number;
  teklif: SirketTeklifi;
  mesaj: string;
  onKapat: () => void;
  onTeklifIste: () => Promise<{ ok: true } | { ok: false; error: string }>;
}

export default function SatinAlUyariModali({
  bransNo,
  teklif,
  mesaj,
  onKapat,
  onTeklifIste,
}: Props) {
  const t = useT();
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState("");

  const talepAc = async () => {
    setHata("");
    setGonderiliyor(true);
    const sonuc = await onTeklifIste();
    setGonderiliyor(false);
    // Başarılıysa sayfa başarı ekranına geçtiği için modal zaten kapanıyor.
    if ("error" in sonuc) setHata(sonuc.error);
  };

  return (
    <div
      className="flow__overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="satinal-uyari-baslik"
    >
      <div className="flow__modal">
        <button
          type="button"
          className="flow__modal-close"
          onClick={onKapat}
          aria-label={t.flow.close}
        >
          ×
        </button>

        <div className="flow__modal-head">
          <span className="flow__modal-sirket">{teklif.SirketAdi}</span>
          <span className="flow__modal-odenecek">
            <strong className="flow__modal-prim">
              {formatPrim(teklif.Prim, bransNo)}
            </strong>
          </span>
        </div>

        <h2 className="flow__modal-title" id="satinal-uyari-baslik">
          {t.flow.offers.warnTitle}
        </h2>
        <p className="flow__warning">{mesaj}</p>
        <p className="flow__modal-lead">{t.flow.offers.warnNote}</p>

        {hata ? <p className="flow__warning">{hata}</p> : null}

        <button
          type="button"
          className="flow__primary flow__primary--block"
          disabled={gonderiliyor}
          onClick={() => void talepAc()}
        >
          {gonderiliyor ? t.flow.offers.sending : t.flow.offers.request}
        </button>
      </div>
    </div>
  );
}
