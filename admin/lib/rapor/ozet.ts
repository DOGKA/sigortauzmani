/**
 * Ham satırlardan rapor metriklerini üretir.
 *
 * Tüm hesap istemcide, saf fonksiyonlarla yapılıyor: veri zaten panele
 * çekildiği için ikinci bir tur veritabanı sorgusu gerekmiyor ve aynı
 * satırlar hem KPI hem grafik hem tablo için tekrar tekrar kullanılıyor.
 */

import { paraKodu } from "@/lib/format";
import {
  BRANS_LABELS,
  OTURUM_STATUS_LABELS,
  OTURUM_STATUS_ORDER,
  STATUS_LABELS,
  STATUS_ORDER,
} from "@/lib/types";
import {
  KIMLIK_RENKLERI,
  OTURUM_RENKLERI,
  TALEP_RENKLERI,
  siraRengi,
} from "@/lib/rapor/renkler";
import {
  donemBaslangici,
  gunBasi,
  oncekiDonemBaslangici,
  type Aralik,
  type FiyatSatiri,
  type OturumSatiri,
  type RaporVerisi,
  type SatisSatiri,
  type TalepSatiri,
} from "@/lib/rapor/veri";

export interface Dilim {
  anahtar: string;
  ad: string;
  deger: number;
  renk: string;
}

export interface ZamanNoktasi {
  anahtar: string;
  etiket: string;
  oturum: number;
  police: number;
  talep: number;
  primTry: number;
}

export interface HuniAdimi {
  ad: string;
  aciklama: string;
  deger: number;
  /** İlk adıma göre oran (%). */
  oran: number;
  /** Bir önceki adımdan bu adıma geçiş oranı (%). */
  gecis: number;
}

export interface SirketSatiri {
  kod: string;
  ad: string;
  teklifOturumu: number;
  enUcuz: number;
  police: number;
  kazanmaOrani: number;
  primTry: number;
  primEur: number;
}

export interface UrunSatiri {
  anahtar: string;
  ad: string;
  kanal: "Self servis" | "Callback";
  adet: number;
  sonuc: number;
  donusum: number;
  primTry: number;
  primEur: number;
}

export interface HataSatiri {
  mesaj: string;
  kaynak: "Teklif" | "Ödeme";
  adet: number;
  sonTarih: string;
}

export interface SaatNoktasi {
  saat: string;
  oturum: number;
  talep: number;
}

export interface Kpi {
  anahtar: string;
  etiket: string;
  deger: number;
  bicim: "sayi" | "para" | "yuzde";
  onceki: number | null;
  altBilgi?: string;
  /** Artışın iyi mi kötü mü olduğunu belirler; hata metriklerinde ters. */
  tersYon?: boolean;
}

export interface RaporOzeti {
  baslangic: Date;
  bitis: Date;
  kpiler: Kpi[];
  zaman: ZamanNoktasi[];
  zamanHaftalik: boolean;
  huni: HuniAdimi[];
  hataliOturum: number;
  bransDilimleri: Dilim[];
  oturumDurumlari: Dilim[];
  talepDurumlari: Dilim[];
  kimlikTipleri: Dilim[];
  sirketler: SirketSatiri[];
  saatler: SaatNoktasi[];
  urunler: UrunSatiri[];
  hatalar: HataSatiri[];
  destek: {
    iptalToplam: number;
    iptalAcik: number;
    iletisimToplam: number;
    iletisimAcil: number;
    iletisimYeni: number;
  };
  bosMu: boolean;
}

/** Oturum durumunun huni sırası. "hata" ilerlemeyi temsil etmediği için -1. */
const OTURUM_SIRASI: Record<string, number> = {
  baslatildi: 0,
  sorgu_tamam: 1,
  teklif_calisti: 2,
  secildi: 3,
  satin_alindi: 4,
  hata: -1,
};

/** Self servise açık ürünlerin panelde görünen adları. */
const URUN_ADLARI: Record<string, string> = {
  "trafik-sigortasi": "Trafik Sigortası",
  "kisa-sureli-trafik": "Kısa Süreli Trafik",
  kasko: "Kasko",
  imm: "İMM",
  "seyahat-saglik": "Seyahat Sağlık",
  dask: "DASK",
};

/**
 * Satın alma satırı, oturumu pencerenin dışında kalmışsa ürüne branş
 * üzerinden bağlanıyor. Trafik ile kısa süreli trafik aynı branşı paylaştığı
 * için bu yol yalnızca yıllık trafiğe düşer; oturum bulunabildiğinde
 * doğrudan slug kullanılıyor.
 */
const BRANS_URUNU: Record<number, string> = {
  0: "trafik-sigortasi",
  1: "kasko",
  2: "dask",
  6: "seyahat-saglik",
  22: "imm",
};

const GUN_BICIMI = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
});

function sayi(deger: number | string | null): number {
  if (deger === null || deger === "") return 0;
  const cevrim = typeof deger === "string" ? Number(deger) : deger;
  return Number.isFinite(cevrim) ? cevrim : 0;
}

/** Yerel saate göre YYYY-MM-DD anahtarı; UTC'ye kaydırmadan gün kovası verir. */
function gunAnahtari(tarih: Date): string {
  return tarih.toLocaleDateString("sv-SE");
}

function haftaBasi(tarih: Date): Date {
  const kopya = gunBasi(tarih);
  const pazartesiFarki = (kopya.getDay() + 6) % 7;
  kopya.setDate(kopya.getDate() - pazartesiFarki);
  return kopya;
}

function pencere<T extends { created_at: string }>(
  satirlar: T[],
  baslangic: Date,
  bitis: Date | null,
): T[] {
  return satirlar.filter((satir) => {
    const tarih = new Date(satir.created_at);
    if (tarih < baslangic) return false;
    return bitis ? tarih < bitis : true;
  });
}

function enErkenTarih(veri: RaporVerisi): Date {
  const hepsi = [
    ...veri.oturumlar,
    ...veri.satislar,
    ...veri.talepler,
    ...veri.iptaller,
    ...veri.iletisimler,
  ].map((satir) => new Date(satir.created_at).getTime());
  if (!hepsi.length) return gunBasi(new Date());
  return gunBasi(new Date(Math.min(...hepsi)));
}

function dilimle(
  sayimlar: Map<string, number>,
  ad: (anahtar: string) => string,
  renk: (anahtar: string, index: number) => string,
): Dilim[] {
  return [...sayimlar.entries()]
    .filter(([, deger]) => deger > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([anahtar, deger], index) => ({
      anahtar,
      ad: ad(anahtar),
      deger,
      renk: renk(anahtar, index),
    }));
}

function artir(hedef: Map<string, number>, anahtar: string, adet = 1) {
  hedef.set(anahtar, (hedef.get(anahtar) ?? 0) + adet);
}

interface TemelMetrik {
  oturum: number;
  fiyatListelenen: number;
  police: number;
  primTry: number;
  primEur: number;
  talep: number;
  donusum: number;
  basarisizOdeme: number;
}

function temelMetrikler(
  oturumlar: OturumSatiri[],
  satislar: SatisSatiri[],
  talepler: TalepSatiri[],
  fiyatliOturumlar: Set<string>,
): TemelMetrik {
  const basarili = satislar.filter((s) => s.status === "basarili");
  const primTry = basarili
    .filter((s) => paraKodu(s.brans_no) === "TRY")
    .reduce((toplam, s) => toplam + sayi(s.prim), 0);
  const primEur = basarili
    .filter((s) => paraKodu(s.brans_no) === "EUR")
    .reduce((toplam, s) => toplam + sayi(s.prim), 0);

  const fiyatListelenen = oturumlar.filter(
    (o) => fiyatliOturumlar.has(o.id) || OTURUM_SIRASI[o.status] >= 2,
  ).length;

  return {
    oturum: oturumlar.length,
    fiyatListelenen,
    police: basarili.length,
    primTry,
    primEur,
    talep: talepler.length,
    donusum: oturumlar.length ? (basarili.length / oturumlar.length) * 100 : 0,
    basarisizOdeme: satislar.filter((s) => s.status === "basarisiz").length,
  };
}

function zamanSerisi(
  baslangic: Date,
  bitis: Date,
  oturumlar: OturumSatiri[],
  satislar: SatisSatiri[],
  talepler: TalepSatiri[],
): { noktalar: ZamanNoktasi[]; haftalik: boolean } {
  const gunSayisi =
    Math.floor((gunBasi(bitis).getTime() - gunBasi(baslangic).getTime()) / 86400000) + 1;
  // Uzun aralıklarda günlük kovalar okunamayacak kadar sıkışıyor.
  const haftalik = gunSayisi > 120;
  const kovala = (tarih: Date) =>
    gunAnahtari(haftalik ? haftaBasi(tarih) : tarih);

  const noktalar = new Map<string, ZamanNoktasi>();
  const imlec = haftalik ? haftaBasi(baslangic) : gunBasi(baslangic);
  while (imlec <= bitis) {
    const anahtar = gunAnahtari(imlec);
    noktalar.set(anahtar, {
      anahtar,
      etiket: haftalik
        ? `${GUN_BICIMI.format(imlec)} hf.`
        : GUN_BICIMI.format(imlec),
      oturum: 0,
      police: 0,
      talep: 0,
      primTry: 0,
    });
    imlec.setDate(imlec.getDate() + (haftalik ? 7 : 1));
  }

  for (const oturum of oturumlar) {
    const nokta = noktalar.get(kovala(new Date(oturum.created_at)));
    if (nokta) nokta.oturum += 1;
  }
  for (const satis of satislar) {
    if (satis.status !== "basarili") continue;
    const nokta = noktalar.get(kovala(new Date(satis.created_at)));
    if (!nokta) continue;
    nokta.police += 1;
    if (paraKodu(satis.brans_no) === "TRY") nokta.primTry += sayi(satis.prim);
  }
  for (const talep of talepler) {
    const nokta = noktalar.get(kovala(new Date(talep.created_at)));
    if (nokta) nokta.talep += 1;
  }

  return { noktalar: [...noktalar.values()], haftalik };
}

function huniOlustur(
  oturumlar: OturumSatiri[],
  fiyatliOturumlar: Set<string>,
  satinAlanOturumlar: Set<string>,
): HuniAdimi[] {
  const enAz = (oturum: OturumSatiri, sira: number) => {
    if (OTURUM_SIRASI[oturum.status] >= sira) return true;
    // Durum alanı son adımda kalabiliyor; fiyat ve satın alma kayıtları
    // oturumun o adımı geçtiğinin kesin kanıtı.
    if (sira <= 2 && fiyatliOturumlar.has(oturum.id)) return true;
    return sira <= 4 && satinAlanOturumlar.has(oturum.id);
  };

  const adimlar = [
    {
      ad: "Başlatıldı",
      aciklama: "Teklif akışına giren ziyaretçi",
      deger: oturumlar.length,
    },
    {
      ad: "Kimlik doğrulandı",
      aciklama: "MERNİS / TRAMER sorgusu tamam",
      deger: oturumlar.filter((o) => enAz(o, 1)).length,
    },
    {
      ad: "Fiyat listelendi",
      aciklama: "Şirketlerden en az bir prim döndü",
      deger: oturumlar.filter((o) => enAz(o, 2)).length,
    },
    {
      ad: "Teklif seçildi",
      aciklama: "Ödeme adımına geçildi",
      deger: oturumlar.filter((o) => enAz(o, 3)).length,
    },
    {
      ad: "Poliçe alındı",
      aciklama: "Ödeme başarıyla tamamlandı",
      deger: oturumlar.filter((o) => enAz(o, 4)).length,
    },
  ];

  const ilk = adimlar[0].deger;
  return adimlar.map((adim, index) => {
    const onceki = index === 0 ? adim.deger : adimlar[index - 1].deger;
    return {
      ...adim,
      oran: ilk ? (adim.deger / ilk) * 100 : 0,
      gecis: onceki ? (adim.deger / onceki) * 100 : 0,
    };
  });
}

function sirketleriTopla(
  fiyatlar: FiyatSatiri[],
  satislar: SatisSatiri[],
): SirketSatiri[] {
  const adlar = new Map<string, string>();
  const oturumSetleri = new Map<string, Set<string>>();
  const enUcuzSayimi = new Map<string, number>();
  const policeSayimi = new Map<string, number>();
  const primTry = new Map<string, number>();
  const primEur = new Map<string, number>();

  for (const fiyat of fiyatlar) {
    if (fiyat.sirket_adi) adlar.set(fiyat.sirket_kodu, fiyat.sirket_adi);
    const set = oturumSetleri.get(fiyat.sirket_kodu) ?? new Set<string>();
    set.add(fiyat.oturum_id);
    oturumSetleri.set(fiyat.sirket_kodu, set);
  }

  // Aynı oturum ve branşta en düşük primi veren şirket "en ucuz" sayılır;
  // fiyat rekabetinin kazanılan poliçeden bağımsız göstergesi.
  const enUcuzAdaylari = new Map<string, FiyatSatiri>();
  for (const fiyat of fiyatlar) {
    const prim = sayi(fiyat.prim);
    if (prim <= 0) continue;
    const anahtar = `${fiyat.oturum_id}|${fiyat.brans_no}`;
    const mevcut = enUcuzAdaylari.get(anahtar);
    if (!mevcut || prim < sayi(mevcut.prim)) enUcuzAdaylari.set(anahtar, fiyat);
  }
  for (const kazanan of enUcuzAdaylari.values()) {
    artir(enUcuzSayimi, kazanan.sirket_kodu);
  }

  for (const satis of satislar) {
    if (satis.status !== "basarili") continue;
    if (satis.sirket_adi) adlar.set(satis.sirket_kodu, satis.sirket_adi);
    artir(policeSayimi, satis.sirket_kodu);
    const hedef = paraKodu(satis.brans_no) === "EUR" ? primEur : primTry;
    hedef.set(
      satis.sirket_kodu,
      (hedef.get(satis.sirket_kodu) ?? 0) + sayi(satis.prim),
    );
  }

  const kodlar = new Set([
    ...oturumSetleri.keys(),
    ...policeSayimi.keys(),
  ]);

  return [...kodlar]
    .map((kod) => {
      const teklifOturumu = oturumSetleri.get(kod)?.size ?? 0;
      const police = policeSayimi.get(kod) ?? 0;
      return {
        kod,
        ad: adlar.get(kod) ?? `Şirket ${kod}`,
        teklifOturumu,
        enUcuz: enUcuzSayimi.get(kod) ?? 0,
        police,
        kazanmaOrani: teklifOturumu ? (police / teklifOturumu) * 100 : 0,
        primTry: primTry.get(kod) ?? 0,
        primEur: primEur.get(kod) ?? 0,
      };
    })
    .sort(
      (a, b) =>
        b.police - a.police ||
        b.primTry - a.primTry ||
        b.teklifOturumu - a.teklifOturumu,
    );
}

function urunleriTopla(
  oturumlar: OturumSatiri[],
  satislar: SatisSatiri[],
  talepler: TalepSatiri[],
): UrunSatiri[] {
  const oturumUrunu = new Map<string, string>();
  const oturumSayimi = new Map<string, number>();
  for (const oturum of oturumlar) {
    oturumUrunu.set(oturum.id, oturum.product_slug);
    artir(oturumSayimi, oturum.product_slug);
  }

  const policeSayimi = new Map<string, number>();
  const primTry = new Map<string, number>();
  const primEur = new Map<string, number>();
  for (const satis of satislar) {
    if (satis.status !== "basarili") continue;
    const slug =
      oturumUrunu.get(satis.oturum_id) ??
      BRANS_URUNU[satis.brans_no] ??
      `brans-${satis.brans_no}`;
    artir(policeSayimi, slug);
    const hedef = paraKodu(satis.brans_no) === "EUR" ? primEur : primTry;
    hedef.set(slug, (hedef.get(slug) ?? 0) + sayi(satis.prim));
  }

  const selfServis: UrunSatiri[] = [
    ...new Set([...oturumSayimi.keys(), ...policeSayimi.keys()]),
  ].map((slug) => {
    const adet = oturumSayimi.get(slug) ?? 0;
    const sonuc = policeSayimi.get(slug) ?? 0;
    return {
      anahtar: `self-${slug}`,
      ad: URUN_ADLARI[slug] ?? slug,
      kanal: "Self servis" as const,
      adet,
      sonuc,
      donusum: adet ? (sonuc / adet) * 100 : 0,
      primTry: primTry.get(slug) ?? 0,
      primEur: primEur.get(slug) ?? 0,
    };
  });

  const talepSayimi = new Map<string, number>();
  const talepAdlari = new Map<string, string>();
  const tamamlanan = new Map<string, number>();
  for (const talep of talepler) {
    const anahtar = talep.product_slug || talep.product_title;
    talepAdlari.set(anahtar, talep.product_title || anahtar);
    artir(talepSayimi, anahtar);
    if (talep.status === "tamamlandi") artir(tamamlanan, anahtar);
  }

  const leadler: UrunSatiri[] = [...talepSayimi.entries()].map(
    ([anahtar, adet]) => {
      const sonuc = tamamlanan.get(anahtar) ?? 0;
      return {
        anahtar: `lead-${anahtar}`,
        ad: talepAdlari.get(anahtar) ?? anahtar,
        kanal: "Callback" as const,
        adet,
        sonuc,
        donusum: adet ? (sonuc / adet) * 100 : 0,
        primTry: 0,
        primEur: 0,
      };
    },
  );

  return [...selfServis, ...leadler].sort((a, b) => b.adet - a.adet);
}

function hatalariTopla(
  oturumlar: OturumSatiri[],
  satislar: SatisSatiri[],
): HataSatiri[] {
  const kovalar = new Map<string, HataSatiri>();

  const ekle = (
    mesaj: string | null,
    kaynak: HataSatiri["kaynak"],
    tarih: string,
  ) => {
    const temiz = (mesaj ?? "").trim();
    if (!temiz) return;
    const anahtar = `${kaynak}|${temiz}`;
    const mevcut = kovalar.get(anahtar);
    if (mevcut) {
      mevcut.adet += 1;
      if (tarih > mevcut.sonTarih) mevcut.sonTarih = tarih;
      return;
    }
    kovalar.set(anahtar, { mesaj: temiz, kaynak, adet: 1, sonTarih: tarih });
  };

  for (const oturum of oturumlar) {
    if (oturum.status !== "hata") continue;
    ekle(oturum.hata_mesaji, "Teklif", oturum.created_at);
  }
  for (const satis of satislar) {
    if (satis.status !== "basarisiz") continue;
    ekle(satis.hata_mesaji, "Ödeme", satis.created_at);
  }

  return [...kovalar.values()].sort((a, b) => b.adet - a.adet).slice(0, 8);
}

export function raporOzeti(veri: RaporVerisi, aralik: Aralik): RaporOzeti {
  const bitis = new Date();
  const baslangic = donemBaslangici(aralik) ?? enErkenTarih(veri);
  const oncekiBaslangic = oncekiDonemBaslangici(aralik);

  const oturumlar = pencere(veri.oturumlar, baslangic, null);
  const satislar = pencere(veri.satislar, baslangic, null);
  const fiyatlar = pencere(veri.fiyatlar, baslangic, null);
  const talepler = pencere(veri.talepler, baslangic, null);
  const iptaller = pencere(veri.iptaller, baslangic, null);
  const iletisimler = pencere(veri.iletisimler, baslangic, null);

  const fiyatliOturumlar = new Set(fiyatlar.map((f) => f.oturum_id));
  const satinAlanOturumlar = new Set(
    satislar.filter((s) => s.status === "basarili").map((s) => s.oturum_id),
  );

  const simdi = temelMetrikler(oturumlar, satislar, talepler, fiyatliOturumlar);

  let onceki: TemelMetrik | null = null;
  if (oncekiBaslangic) {
    const oncekiOturumlar = pencere(veri.oturumlar, oncekiBaslangic, baslangic);
    const oncekiSatislar = pencere(veri.satislar, oncekiBaslangic, baslangic);
    const oncekiTalepler = pencere(veri.talepler, oncekiBaslangic, baslangic);
    const oncekiFiyatlar = pencere(veri.fiyatlar, oncekiBaslangic, baslangic);
    onceki = temelMetrikler(
      oncekiOturumlar,
      oncekiSatislar,
      oncekiTalepler,
      new Set(oncekiFiyatlar.map((f) => f.oturum_id)),
    );
  }

  const bransSayimi = new Map<string, number>();
  for (const satis of satislar) {
    if (satis.status !== "basarili") continue;
    artir(bransSayimi, String(satis.brans_no));
  }

  const oturumDurumSayimi = new Map<string, number>();
  const kimlikSayimi = new Map<string, number>();
  for (const oturum of oturumlar) {
    artir(oturumDurumSayimi, oturum.status);
    artir(kimlikSayimi, oturum.entity_type);
  }

  const talepDurumSayimi = new Map<string, number>();
  for (const talep of talepler) artir(talepDurumSayimi, talep.status);

  const saatler: SaatNoktasi[] = Array.from({ length: 24 }, (_, saat) => ({
    saat: `${String(saat).padStart(2, "0")}`,
    oturum: 0,
    talep: 0,
  }));
  for (const oturum of oturumlar) {
    saatler[new Date(oturum.created_at).getHours()].oturum += 1;
  }
  for (const talep of talepler) {
    saatler[new Date(talep.created_at).getHours()].talep += 1;
  }

  const { noktalar, haftalik } = zamanSerisi(
    baslangic,
    bitis,
    oturumlar,
    satislar,
    talepler,
  );

  const kpiler: Kpi[] = [
    {
      anahtar: "oturum",
      etiket: "Teklif oturumu",
      deger: simdi.oturum,
      bicim: "sayi",
      onceki: onceki?.oturum ?? null,
      altBilgi: "Self servis akışını başlatan ziyaretçi",
    },
    {
      anahtar: "fiyat",
      etiket: "Fiyat listelenen",
      deger: simdi.fiyatListelenen,
      bicim: "sayi",
      onceki: onceki?.fiyatListelenen ?? null,
      altBilgi: "En az bir şirketten prim dönen oturum",
    },
    {
      anahtar: "police",
      etiket: "Poliçe",
      deger: simdi.police,
      bicim: "sayi",
      onceki: onceki?.police ?? null,
      altBilgi: `${simdi.basarisizOdeme} başarısız ödeme denemesi`,
    },
    {
      anahtar: "prim",
      etiket: "Yazılan prim",
      deger: simdi.primTry,
      bicim: "para",
      onceki: onceki?.primTry ?? null,
      altBilgi: simdi.primEur
        ? `Ayrıca ${simdi.primEur.toLocaleString("tr-TR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} € seyahat primi`
        : "Seyahat sağlık primleri euro olarak ayrı tutulur",
    },
    {
      anahtar: "talep",
      etiket: "Callback talebi",
      deger: simdi.talep,
      bicim: "sayi",
      onceki: onceki?.talep ?? null,
      altBilgi: "Self servis dışı ürünler ve manuel forma düşenler",
    },
    {
      anahtar: "donusum",
      etiket: "Oturum → poliçe",
      deger: simdi.donusum,
      bicim: "yuzde",
      onceki: onceki?.donusum ?? null,
      altBilgi: "Başlatılan oturumların satışa dönme oranı",
    },
  ];

  return {
    baslangic,
    bitis,
    kpiler,
    zaman: noktalar,
    zamanHaftalik: haftalik,
    huni: huniOlustur(oturumlar, fiyatliOturumlar, satinAlanOturumlar),
    hataliOturum: oturumlar.filter((o) => o.status === "hata").length,
    bransDilimleri: dilimle(
      bransSayimi,
      (anahtar) => BRANS_LABELS[Number(anahtar)] ?? `Branş ${anahtar}`,
      (_, index) => siraRengi(index),
    ),
    oturumDurumlari: dilimle(
      oturumDurumSayimi,
      (anahtar) =>
        OTURUM_STATUS_LABELS[
          anahtar as (typeof OTURUM_STATUS_ORDER)[number]
        ] ?? anahtar,
      (anahtar, index) => OTURUM_RENKLERI[
        anahtar as (typeof OTURUM_STATUS_ORDER)[number]
      ] ?? siraRengi(index),
    ),
    talepDurumlari: dilimle(
      talepDurumSayimi,
      (anahtar) =>
        STATUS_LABELS[anahtar as (typeof STATUS_ORDER)[number]] ?? anahtar,
      (anahtar, index) =>
        TALEP_RENKLERI[anahtar as (typeof STATUS_ORDER)[number]] ??
        siraRengi(index),
    ),
    kimlikTipleri: dilimle(
      kimlikSayimi,
      (anahtar) =>
        anahtar === "sahis"
          ? "Şahıs"
          : anahtar === "sirket"
            ? "Şirket"
            : "Yabancı uyruklu",
      (anahtar, index) => KIMLIK_RENKLERI[anahtar] ?? siraRengi(index),
    ),
    sirketler: sirketleriTopla(fiyatlar, satislar),
    saatler,
    urunler: urunleriTopla(oturumlar, satislar, talepler),
    hatalar: hatalariTopla(oturumlar, satislar),
    destek: {
      iptalToplam: iptaller.length,
      iptalAcik: iptaller.filter((i) => i.status !== "tamamlandi").length,
      iletisimToplam: iletisimler.length,
      iletisimAcil: iletisimler.filter((i) => i.oncelik !== "normal").length,
      iletisimYeni: iletisimler.filter((i) => i.status === "yeni").length,
    },
    bosMu:
      oturumlar.length === 0 &&
      satislar.length === 0 &&
      talepler.length === 0 &&
      iptaller.length === 0 &&
      iletisimler.length === 0,
  };
}
