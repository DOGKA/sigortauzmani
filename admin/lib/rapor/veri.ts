/**
 * Raporlar sayfasının veri katmanı.
 *
 * Panelin diğer ekranları tek tabloyu listeliyor, rapor ise altı tabloyu
 * çapraz okuyor. Sorgular burada duruyor ki grafik bileşenleri yalnızca
 * hazır seriyi çizsin.
 *
 * Her sorgu seçilen aralığın iki katını çekiyor: ikinci yarı ekranda
 * gösterilen dönem, ilk yarı ise KPI kartlarındaki "önceki döneme göre
 * değişim" karşılaştırması için. Tek sorguda gelmesi, aynı veriyi ikinci
 * kez sormaktan ucuz.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  IletisimOncelik,
  IletisimStatus,
  IptalBrans,
  IptalStatus,
  OturumStatus,
  TalepStatus,
} from "@/lib/types";

export type Aralik = "7g" | "30g" | "90g" | "tum";

export const ARALIKLAR: { deger: Aralik; etiket: string; gun: number | null }[] =
  [
    { deger: "7g", etiket: "Son 7 gün", gun: 7 },
    { deger: "30g", etiket: "Son 30 gün", gun: 30 },
    { deger: "90g", etiket: "Son 90 gün", gun: 90 },
    { deger: "tum", etiket: "Tümü", gun: null },
  ];

/**
 * Tek sorgudan dönecek en fazla satır. Teklif fiyatları oturum başına
 * şirket sayısı kadar satır ürettiği için en hızlı büyüyen tablo bu;
 * limit dolduğunda ekranda uyarı gösteriliyor.
 */
export const SATIR_LIMITI = 20000;

export interface OturumSatiri {
  id: string;
  created_at: string;
  status: OturumStatus;
  brans_no: number;
  product_slug: string;
  entity_type: "sahis" | "yabanci" | "sirket";
  hata_mesaji: string | null;
}

export interface SatisSatiri {
  oturum_id: string;
  created_at: string;
  status: "basarili" | "basarisiz";
  prim: number | string | null;
  brans_no: number;
  sirket_kodu: string;
  sirket_adi: string | null;
  hata_mesaji: string | null;
}

export interface FiyatSatiri {
  oturum_id: string;
  created_at: string;
  brans_no: number;
  sirket_kodu: string;
  sirket_adi: string | null;
  prim: number | string | null;
}

export interface TalepSatiri {
  created_at: string;
  status: TalepStatus;
  product_slug: string;
  product_title: string;
  contact_pref: "hemen" | "tarihli";
}

export interface IptalSatiri {
  created_at: string;
  brans: IptalBrans;
  status: IptalStatus;
}

export interface IletisimSatiri {
  created_at: string;
  oncelik: IletisimOncelik;
  status: IletisimStatus;
}

export interface RaporVerisi {
  oturumlar: OturumSatiri[];
  satislar: SatisSatiri[];
  fiyatlar: FiyatSatiri[];
  talepler: TalepSatiri[];
  iptaller: IptalSatiri[];
  iletisimler: IletisimSatiri[];
  /** Sorgulardan biri limite dayandıysa true; rapor eksik veri gösteriyor demektir. */
  kesildi: boolean;
}

export function aralikGunu(aralik: Aralik): number | null {
  return ARALIKLAR.find((a) => a.deger === aralik)?.gun ?? null;
}

export function gunBasi(tarih: Date): Date {
  const kopya = new Date(tarih);
  kopya.setHours(0, 0, 0, 0);
  return kopya;
}

/** Ekranda gösterilen dönemin başlangıcı. "Son 7 gün" bugünü de sayar. */
export function donemBaslangici(aralik: Aralik, simdi = new Date()): Date | null {
  const gun = aralikGunu(aralik);
  if (gun === null) return null;
  const baslangic = gunBasi(simdi);
  baslangic.setDate(baslangic.getDate() - (gun - 1));
  return baslangic;
}

/** Karşılaştırma dönemi: seçilen aralığın hemen öncesindeki eşit uzunluktaki pencere. */
export function oncekiDonemBaslangici(
  aralik: Aralik,
  simdi = new Date(),
): Date | null {
  const gun = aralikGunu(aralik);
  if (gun === null) return null;
  const baslangic = gunBasi(simdi);
  baslangic.setDate(baslangic.getDate() - (2 * gun - 1));
  return baslangic;
}

const KOLONLAR = {
  teklif_oturumlari:
    "id, created_at, status, brans_no, product_slug, entity_type, hata_mesaji",
  satin_almalar:
    "oturum_id, created_at, status, prim, brans_no, sirket_kodu, sirket_adi, hata_mesaji",
  teklif_fiyatlari:
    "oturum_id, created_at, brans_no, sirket_kodu, sirket_adi, prim",
  talepler: "created_at, status, product_slug, product_title, contact_pref",
  iptal_talepleri: "created_at, brans, status",
  iletisim_talepleri: "created_at, oncelik, status",
} as const;

type Tablo = keyof typeof KOLONLAR;

async function tabloOku<T>(
  supabase: SupabaseClient,
  tablo: Tablo,
  baslangic: string | null,
): Promise<{ satirlar: T[]; kesildi: boolean }> {
  let sorgu = supabase
    .from(tablo)
    .select(KOLONLAR[tablo])
    .order("created_at", { ascending: false })
    .limit(SATIR_LIMITI);

  if (baslangic) sorgu = sorgu.gte("created_at", baslangic);

  const { data, error } = await sorgu;
  if (error) throw new Error(`${tablo}: ${error.message}`);

  const satirlar = (data ?? []) as unknown as T[];
  return { satirlar, kesildi: satirlar.length >= SATIR_LIMITI };
}

export async function raporVerisiGetir(
  supabase: SupabaseClient,
  aralik: Aralik,
): Promise<RaporVerisi> {
  const baslangicTarihi = oncekiDonemBaslangici(aralik);
  const baslangic = baslangicTarihi ? baslangicTarihi.toISOString() : null;

  const [oturumlar, satislar, fiyatlar, talepler, iptaller, iletisimler] =
    await Promise.all([
      tabloOku<OturumSatiri>(supabase, "teklif_oturumlari", baslangic),
      tabloOku<SatisSatiri>(supabase, "satin_almalar", baslangic),
      tabloOku<FiyatSatiri>(supabase, "teklif_fiyatlari", baslangic),
      tabloOku<TalepSatiri>(supabase, "talepler", baslangic),
      tabloOku<IptalSatiri>(supabase, "iptal_talepleri", baslangic),
      tabloOku<IletisimSatiri>(supabase, "iletisim_talepleri", baslangic),
    ]);

  return {
    oturumlar: oturumlar.satirlar,
    satislar: satislar.satirlar,
    fiyatlar: fiyatlar.satirlar,
    talepler: talepler.satirlar,
    iptaller: iptaller.satirlar,
    iletisimler: iletisimler.satirlar,
    kesildi: [oturumlar, satislar, fiyatlar, talepler, iptaller, iletisimler].some(
      (sonuc) => sonuc.kesildi,
    ),
  };
}
