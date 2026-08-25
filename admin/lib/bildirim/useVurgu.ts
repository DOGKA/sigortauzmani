"use client";

import { useCallback, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

/** Vurgulanan satırı komşularından ayıran ortak sınıf. */
export const VURGU_SATIR_SINIFI =
  "bg-amber-50 ring-2 ring-inset ring-amber-300";

/**
 * Bildirim merkezindeki "Görüntüle" düğmesi listeye ?vurgu=<id> ile geliyor.
 * Aranan kayıt yüzlerce satır arasında kaybolmasın diye ilgili satır
 * işaretlenip görünür alana kaydırılıyor.
 *
 * @param detayiAc Verilirse vurgulanan kaydın detay satırı da açılır.
 */
export function useVurgu(detayiAc?: (kayitId: string) => void) {
  const parametreler = useSearchParams();
  const vurguId = parametreler.get("vurgu");

  // Zaten açık olan sayfada başka bir bildirime tıklandığında da detayın
  // açılması gerekiyor; efekt yerine render sırasında karşılaştırılıyor ki
  // araya fazladan bir çizim turu girmesin.
  const [islenenVurgu, setIslenenVurgu] = useState<string | null>(null);
  if (vurguId !== islenenVurgu) {
    setIslenenVurgu(vurguId);
    if (vurguId) detayiAc?.(vurguId);
  }

  // Satır her yeniden çizildiğinde sayfa tekrar zıplamasın diye tek seferlik.
  const kaydirilan = useRef<string | null>(null);

  const vurguRef = useCallback(
    (dugum: HTMLTableRowElement | null) => {
      if (!dugum || !vurguId || kaydirilan.current === vurguId) return;
      kaydirilan.current = vurguId;
      dugum.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    [vurguId],
  );

  return { vurguId, vurguRef };
}
