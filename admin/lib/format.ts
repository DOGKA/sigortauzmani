/**
 * Panelde paylaşılan biçimlendirme ve maskeleme yardımcıları.
 *
 * Kimlik numaraları listelerde maskeli, detay açıldığında açık gösteriliyor.
 * Maskeleme sunucu tarafında değil görüntüde yapıldığı için gizlilik değil
 * omuz üstü okuma önlemi: veriyi zaten görme yetkisi olan kullanıcı,
 * ekranında tüm müşterilerin kimlik numarasını aynı anda taşımıyor.
 */

const paraBirimi = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
});

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string | null) {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}

export function formatPrim(prim: number | string | null) {
  if (prim === null || prim === "") return "-";
  // Supabase numeric kolonları string olarak dönebiliyor.
  const sayi = typeof prim === "string" ? Number(prim) : prim;
  if (!Number.isFinite(sayi)) return "-";
  return paraBirimi.format(sayi);
}

/**
 * Kimlik numarasının ilk üç ve son iki hanesini bırakır: 123******45.
 * Kısa değerler ayırt edilemeyecek kadar açılmasın diye tamamen maskelenir.
 */
export function maskKimlikNo(deger: string | null): string {
  if (!deger) return "-";
  const temiz = deger.trim();
  if (temiz.length < 7) return "*".repeat(temiz.length);
  return `${temiz.slice(0, 3)}${"*".repeat(temiz.length - 5)}${temiz.slice(-2)}`;
}

/** Cep telefonunun son iki hanesi hariç maskeler: 05** *** ** 45. */
export function maskPhone(deger: string | null): string {
  if (!deger) return "-";
  const rakamlar = deger.replace(/\D/g, "");
  if (rakamlar.length < 6) return "*".repeat(rakamlar.length);
  return `${rakamlar.slice(0, 2)}${"*".repeat(rakamlar.length - 4)}${rakamlar.slice(-2)}`;
}
