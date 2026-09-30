/**
 * Satın alma öncesi seçilen teklif satırını yenile.
 *
 * `TeklifNo`, şirketin o teklif için o an geçerli olan numarası. Partner
 * CRM'i de onay adımında teklifi yeniliyor (dökümandaki "Onay adımında teklif
 * detayını yenile" adımı); ödeme öncesi aynı adım burada yapılıyor. Hem
 * ödemeden önceki ön kontrol (`api/io/on-kontrol.ts`) hem ödemenin kendisi
 * (`api/io/satinal.ts`) bunu kullanıyor.
 *
 * `SatinAl` bayrağı karar için kullanılmıyor. Yenilemenin yanıtı ölçülen
 * her teklifte `false` döndü: 24 günlük teklifte de, bir dakikalık teklifte
 * de. 29.09'da bir dakikalık Türk Nippon kısa süreli trafik teklifi bu
 * bayrak yüzünden durduruldu; CRM aynı satırdan bir dakika sonra poliçe
 * kesti. Fiyat listesindeki (`primler`) bayrak da poliçe kesildikten sonra
 * bile `true` kalıyor, yani o da ayırt etmiyor. Şirketin gerçek reddi
 * satırın hata metninde ya da satın alma yanıtında (HataKodu 22) geliyor;
 * ikincisinde kart çekilmiyor.
 *
 * Yenileme prim döndürmezse ödeme yapılmıyor: tutar istemciden gelen
 * `Prim` alanına bırakılırsa ziyaretçi gördüğünden farklı bir tutarı
 * onaylatmadan ödeme başlardı.
 */

import { ioFetch } from "./io";
import { hataBasariNotu } from "../../src/lib/io/hataBasari";

export interface YenilenecekTeklif {
  Id?: number;
  TeklifNo?: string;
  Prim?: number;
  Taksit?: string;
  TaksitKodu?: string;
  AcenteKodu?: string;
}

/** Kayda yazılan yanıt özeti. Kişisel veri taşımayan alanlarla sınırlı. */
export interface YenilemeOzeti {
  ok: boolean;
  hataKodu?: number | null;
  mesaj?: string | null;
  SatinAl?: unknown;
  SanalPos?: unknown;
  TeklifNo?: unknown;
  Prim?: unknown;
  Hata?: unknown;
  HataMesaj?: unknown;
  Otorizasyon?: unknown;
  alanlar?: string[];
}

export const YENILEME_DOGRULANAMADI =
  "Sigorta şirketinden bu teklif için güncel tutar alınamadı. Kartınızdan çekim yapılmadı.";

export type YenilemeSonucu =
  | {
      durum: "acik";
      prim: number;
      teklifNo: string | null;
      /** Satırın `SanalPos` bayrağı; yanıtta yoksa null. */
      sanalPos: boolean | null;
      ozet: YenilemeOzeti;
    }
  | { durum: "kapali"; mesaj: string; teklifNo: string | null; ozet: YenilemeOzeti }
  | { durum: "dogrulanamadi"; ozet: YenilemeOzeti };

function metin(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function teklifiYenile(
  bransNo: number,
  teklifId: number,
  teklif: YenilenecekTeklif,
  sirketKodu: string,
): Promise<YenilemeSonucu> {
  const satir = {
    Id: teklif.Id,
    SirketKodu: sirketKodu,
    TeklifNo: teklif.TeklifNo ?? "",
    Prim: teklif.Prim,
    TaksitKodu: teklif.TaksitKodu ?? "1",
    Taksit: teklif.Taksit ?? "Peşin",
    AcenteKodu: teklif.AcenteKodu ?? "",
  };

  // Teminat listesi güncellemeye aynen geri gönderiliyor; boş gitmesi
  // teminatları sıfırlamıyor ama şirket bazında primi değiştirebiliyor.
  const detay = await ioFetch(`/api/teklif/teklifdetay`, {
    method: "POST",
    body: { BransNo: bransNo, TeklifId: teklifId, TeklifDetay: satir },
  });
  const teminat = detay.ok && Array.isArray(detay.data) ? detay.data : [];

  const guncel = await ioFetch(`/api/teklif/teklifguncelle`, {
    method: "POST",
    timeoutMs: 60_000,
    body: {
      BransNo: bransNo,
      TeklifId: teklifId,
      Guncelle: true,
      Sirketler: [],
      TeklifDetay: { ...satir, Teminat: teminat },
      Police: {
        SirketKodu: sirketKodu,
        TaksitKodu: satir.TaksitKodu,
        AcenteKodu: satir.AcenteKodu,
        TeklifNo: satir.TeklifNo,
      },
    },
  });

  if (!guncel.ok) {
    return {
      durum: "dogrulanamadi",
      ozet: { ok: false, hataKodu: guncel.error.code ?? null, mesaj: guncel.error.message },
    };
  }

  // Yanıt, güncellenmiş teklif satırının kendisi.
  const yeni = (guncel.data ?? {}) as Record<string, unknown>;
  const ozet: YenilemeOzeti = {
    ok: true,
    SatinAl: yeni.SatinAl,
    SanalPos: yeni.SanalPos,
    TeklifNo: yeni.TeklifNo,
    Prim: yeni.Prim,
    Hata: yeni.Hata,
    HataMesaj: yeni.HataMesaj,
    Otorizasyon: yeni.Otorizasyon,
    alanlar: Object.keys(yeni),
  };

  const teklifNo = metin(yeni.TeklifNo);
  // AXA başarılı kaydı hata alanına yazıyor; o not ret sayılmıyor.
  const hata = [metin(yeni.Hata), metin(yeni.HataMesaj)].find(
    (deger) => deger && !hataBasariNotu(deger),
  );
  if (hata) return { durum: "kapali", mesaj: hata, teklifNo, ozet };

  const prim = Number(yeni.Prim);
  if (!Number.isFinite(prim) || prim <= 0) return { durum: "dogrulanamadi", ozet };

  const sanalPos = typeof yeni.SanalPos === "boolean" ? yeni.SanalPos : null;
  return { durum: "acik", prim, teklifNo, sanalPos, ozet };
}
