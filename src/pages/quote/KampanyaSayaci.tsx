import { useEffect, useState } from "react";
import { useT } from "../../lib/i18n/context";
import "./FiyatListesi.css";

export function kalanSure(zaman: number): string {
  const toplamSaniye = Math.max(0, Math.ceil(zaman / 1000));
  const dakika = Math.floor(toplamSaniye / 60);
  const saniye = toplamSaniye % 60;
  return `${String(dakika).padStart(2, "0")}:${String(saniye).padStart(2, "0")}`;
}

/** Ödeme modalının içindeki kampanya sayacı; bitiş anı fiyat listesinden gelir. */
export default function KampanyaSayaci({ bitis }: { bitis: number }) {
  const t = useT();
  const [simdi, setSimdi] = useState(() => Date.now());

  useEffect(() => {
    if (bitis <= simdi) return;
    const zamanlayici = window.setInterval(() => setSimdi(Date.now()), 1000);
    return () => window.clearInterval(zamanlayici);
  }, [bitis, simdi]);

  const kalan = Math.max(0, bitis - simdi);
  return (
    <div
      className={`fiyat__kampanya-sayac fiyat__kampanya-sayac--modal${
        kalan > 0 ? "" : " fiyat__kampanya-sayac--bitti"
      }`}
      role="timer"
    >
      <span>{t.flow.offers.campaignLast}</span>
      <strong>{kalanSure(kalan)}</strong>
    </div>
  );
}
