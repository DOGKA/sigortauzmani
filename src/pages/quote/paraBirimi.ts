/**
 * Prim gösterimindeki para birimi.
 *
 * Seyahat sağlık (branş 6) primleri Euro gelir; diğer self servis ürünler
 * TL. Ödenecek tutarı IO hesaplar — burada yalnızca birim etiketi değişir.
 */

const FORMATTERLAR: Record<"TRY" | "EUR", Intl.NumberFormat> = {
  TRY: new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }),
  EUR: new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }),
};

/** Seyahat sağlık IO branş kodu. */
export const SEYAHAT_BRANS_NO = 6;

export function paraKodu(bransNo: number): "TRY" | "EUR" {
  return bransNo === SEYAHAT_BRANS_NO ? "EUR" : "TRY";
}

export function formatPrim(prim: number | undefined, bransNo: number): string {
  if (typeof prim !== "number" || !Number.isFinite(prim)) return "—";
  return FORMATTERLAR[paraKodu(bransNo)].format(prim);
}
