"use client";

import { createContext, useContext } from "react";
import { useBildirimler, type BildirimDurumu } from "./useBildirimler";

/**
 * Bildirim durumu tek yerde tutuluyor: hem üst çubuktaki zil hem kenar
 * menüsündeki rozetler hem de köşeye düşen kartlar aynı aboneliği paylaşsın,
 * her biri ayrı realtime kanalı açmasın diye.
 */
const BildirimBaglami = createContext<BildirimDurumu | null>(null);

export function BildirimSaglayici({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const durum = useBildirimler();
  return (
    <BildirimBaglami.Provider value={durum}>{children}</BildirimBaglami.Provider>
  );
}

export function useBildirimBaglami(): BildirimDurumu {
  const baglam = useContext(BildirimBaglami);
  if (!baglam) {
    throw new Error(
      "useBildirimBaglami yalnızca BildirimSaglayici içinde kullanılabilir.",
    );
  }
  return baglam;
}
