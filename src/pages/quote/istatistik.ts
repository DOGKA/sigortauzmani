/**
 * `/api/istatistik` istemcisi. Güven şeridi ve teklif ekranındaki
 * "En popüler" etiketi aynı yanıtı kullanıyor; tek istekle paylaşılıyor.
 */

import { useEffect, useState } from "react";

export interface TeklifIstatistik {
  teklif_toplam: number | null;
  police_toplam: number | null;
  sirket_sayisi: number | null;
  populer: Record<string, string>;
}

let istek: Promise<TeklifIstatistik | null> | null = null;

function istatistikGetir(): Promise<TeklifIstatistik | null> {
  istek ??= fetch("/api/istatistik")
    .then((response) => (response.ok ? (response.json() as Promise<TeklifIstatistik>) : null))
    .catch(() => null);
  return istek;
}

export function useTeklifIstatistik(): TeklifIstatistik | null {
  const [veri, setVeri] = useState<TeklifIstatistik | null>(null);

  useEffect(() => {
    let iptal = false;
    void istatistikGetir().then((sonuc) => {
      if (!iptal) setVeri(sonuc);
    });
    return () => {
      iptal = true;
    };
  }, []);

  return veri;
}
