/**
 * Uzun süren işlemler için dolan ilerleme çubuğu.
 *
 * Gerçek yüzde bilinemiyor: primler sigorta şirketlerinden kendi hızlarında
 * geliyor, kaç saniye süreceği baştan belli değil. Bu yüzden çubuk tahmini
 * süreye göre yavaşlayarak ilerliyor ve tavanı geçmiyor; bekleme uzasa da
 * "bitti" izlenimi vermiyor. Bekleme boyunca hangi aşamada olduğumuzu
 * anlatan mesajlar sırayla gösteriliyor.
 */

import { useEffect, useRef, useState } from "react";

interface Props {
  baslik: string;
  mesajlar: string[];
  /** Çubuğun tavana yaklaşması beklenen süre. */
  tahminiSaniye?: number;
  not?: string;
}

const TIK_MS = 250;
const TAVAN = 94;

export default function IlerlemePaneli({
  baslik,
  mesajlar,
  tahminiSaniye = 45,
  not,
}: Props) {
  const [gecenMs, setGecenMs] = useState(0);
  const baslangic = useRef(0);

  useEffect(() => {
    baslangic.current = Date.now();
    const id = window.setInterval(() => {
      setGecenMs(Date.now() - baslangic.current);
    }, TIK_MS);
    return () => window.clearInterval(id);
  }, []);

  const gecenSn = gecenMs / 1000;
  // Üstel yaklaşma: başta hızlı ilerliyor, sonra yavaşlayıp tavana dayanıyor.
  const oran = TAVAN * (1 - Math.exp(-gecenSn / (tahminiSaniye / 2.5)));

  const araSn = tahminiSaniye / mesajlar.length;
  const mesajIndex = Math.min(
    mesajlar.length - 1,
    Math.floor(gecenSn / araSn),
  );

  return (
    <div className="flow__ilerleme">
      <p className="flow__ilerleme-baslik">{baslik}</p>

      <div
        className="flow__ilerleme-ray"
        role="progressbar"
        aria-label={baslik}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(oran)}
      >
        <span
          className="flow__ilerleme-dolgu"
          style={{ width: `${oran}%` }}
        />
      </div>

      <p className="flow__ilerleme-mesaj" aria-live="polite">
        {mesajlar[mesajIndex]}
      </p>

      {not ? <p className="flow__ilerleme-not">{not}</p> : null}
    </div>
  );
}
