/** Rapor ekranındaki sayı, oran ve para biçimleri. */

const SAYI = new Intl.NumberFormat("tr-TR");

export function sayiYaz(deger: number): string {
  return SAYI.format(Math.round(deger));
}

export function yuzdeYaz(deger: number, basamak = 1): string {
  return `%${deger.toLocaleString("tr-TR", {
    minimumFractionDigits: basamak,
    maximumFractionDigits: basamak,
  })}`;
}

/** Eksen etiketleri için kısaltılmış tutar: 1,2 mn · 45,3 B. */
export function kisaTutar(deger: number): string {
  const mutlak = Math.abs(deger);
  if (mutlak >= 1_000_000) {
    return `${(deger / 1_000_000).toLocaleString("tr-TR", {
      maximumFractionDigits: 1,
    })} mn`;
  }
  if (mutlak >= 1_000) {
    return `${(deger / 1_000).toLocaleString("tr-TR", {
      maximumFractionDigits: 1,
    })} B`;
  }
  return SAYI.format(Math.round(deger));
}

export function euroYaz(deger: number): string {
  return `${deger.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}
