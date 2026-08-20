/**
 * Self servis teklif akışının durum tipleri.
 *
 * Araç branşları (Trafik, Kasko, İMM) aynı adımları paylaşıyor, farkları
 * yalnızca ek alanlar: Kasko meslek + yakıt tipi, İMM teminat bedeli
 * istiyor. Bu yüzden tek bir durum nesnesi tutuluyor ve ürün bazlı
 * gereklilikler `urunGereksinimleri` ile belirleniyor.
 */

import { OTOMATIK_URUNLER } from "../../lib/io/constants";
import type { SirketTeklifi } from "../../lib/io/types";

export type Adim = "kimlik" | "detay" | "fiyatlar" | "sonuc";

/**
 * MERNİS her üç kimlik tipini de otomatik çekiyor; ayrım yalnızca hangi
 * alanın doğrulanacağı ve hangi etiketin gösterileceği için var.
 */
export type KisiTipi = "sahis" | "yabanci" | "sirket";

export interface KimlikDurumu {
  entityType: KisiTipi;
  tckn: string;
  /** Yabancı kimlik numarası (99 ile başlayan 11 hane). */
  ykn: string;
  vkn: string;
  birthDate: string;
  phone: string;
  /** MERNİS'ten dönen ad soyad; yalnızca kullanıcıya gösterilir. */
  adSoyad: string;
  /**
   * MERNİS doğrulaması tuttu mu. Dikkat: başarısız sorgu da HTTP 200
   * dönüyor ve HataKodu taşımıyor; sinyal yanıttaki `isMernis` alanı.
   */
  mernisTamam: boolean;
  /**
   * MERNİS yanıtındaki şifreli sigortalı bloğu. Dokümantasyonda geçmiyor
   * ama yanıtta geliyor; teklif isteğinde beklenmesi muhtemel olduğu için
   * taşınıyor.
   */
  sigortaliStr: string;
  /**
   * MERNİS kayıtlı adresin UAVT kodunu döndürüyorsa buraya alınıyor ve DASK
   * adımında hazır geliyor. Farklı bir taşınmaz sigortalanacaksa kullanıcı
   * değiştiriyor.
   */
  adresKodu: string;
}

export interface AracDurumu {
  plakaVar: boolean;
  plaka: string;
  tescilBelge: string;
  /** Plakası çıkmamış araç (YK) alanları */
  ilKodu: string;
  modelYili: string;
  markaKodu: string;
  tipKodu: string;
  kullanimTarzi: string;
  kullanimSekli: string;
  kisiSayisi: string;
  motorNo: string;
  sasiNo: string;
  yakitTipi: string;
  /** TRAMER'den araç bilgisi geldi mi */
  tramerTamam: boolean;
}

export interface SeyahatDurumu {
  /** "A" Avrupa, "T" tüm dünya, "Y" yurt içi. */
  kapsam: string;
  /** Kapsam "Y" ise il kodu, değilse ülke kodu. */
  gidilenYer: string;
  planSecimi: string;
  seyahatSebebi: string;
  gidisTarihi: string;
  donusTarihi: string;
}

export interface DaskDurumu {
  /** Mevcut DASK poliçesi yok; yeni akış bina bilgileri ister. */
  policemYok: boolean;
  /** Yenileme akışında bina bilgileri yerine bu gönderilir. */
  daskPoliceNo: string;
  /** 10 haneli UAVT kodu; MERNİS'ten gelir ya da seçiciden bulunur. */
  adresKodu: string;
  /**
   * Kullanıcı kodu bilmiyor: CRM'deki "Adres Kodumu Bilmiyorum" karşılığı,
   * UAVT hiyerarşisi seçicisini açar.
   */
  adresKoduBilinmiyor: boolean;
  /** Seçiciden bulunan okunabilir adres; API'ye gitmiyor. */
  adresOzeti: string;
  sigortaEttirenSifati: string;
  yapiTarzi: string;
  insaaYili: string;
  toplamKatSayisi: string;
  kullanimSekli: string;
  binaHasarDurumu: string;
  brutM2: string;
  binadakiKonumu: string;
}

export interface UrunGereksinimi {
  bransNo: number;
  /** İkinci adımda hangi form gösterilecek. */
  adimTipi: "arac" | "seyahat" | "dask";
  /** Araç bilgisi isteyen branşlar. */
  aracGerekli: boolean;
  /** Kaskoda şirketler meslek grubuna göre indirim uyguluyor. */
  meslekGerekli: boolean;
  /** Kaskoda zorunlu, trafikte değil. */
  yakitGerekli: boolean;
  immGerekli: boolean;
}

export const URUN_GEREKSINIMLERI: Record<string, UrunGereksinimi> = {
  "trafik-sigortasi": {
    bransNo: 0,
    adimTipi: "arac",
    aracGerekli: true,
    meslekGerekli: false,
    yakitGerekli: false,
    immGerekli: false,
  },
  kasko: {
    bransNo: 1,
    adimTipi: "arac",
    aracGerekli: true,
    meslekGerekli: true,
    yakitGerekli: true,
    immGerekli: false,
  },
  imm: {
    bransNo: 22,
    adimTipi: "arac",
    aracGerekli: true,
    meslekGerekli: false,
    yakitGerekli: false,
    immGerekli: true,
  },
  "seyahat-saglik": {
    bransNo: 6,
    adimTipi: "seyahat",
    aracGerekli: false,
    meslekGerekli: false,
    yakitGerekli: false,
    immGerekli: false,
  },
  dask: {
    bransNo: 2,
    adimTipi: "dask",
    aracGerekli: false,
    meslekGerekli: false,
    yakitGerekli: false,
    immGerekli: false,
  },
};

export function urunGereksinimi(slug: string): UrunGereksinimi | null {
  return URUN_GEREKSINIMLERI[slug] ?? null;
}

export function bransNoOf(slug: string): number | null {
  return OTOMATIK_URUNLER[slug] ?? null;
}

export const BRANS_ADLARI: Record<number, string> = {
  0: "Trafik Sigortası",
  1: "Kasko",
  2: "DASK",
  6: "Seyahat Sağlık",
  22: "İMM",
};

/** Bir branşın fiyat listesi ve durumu. */
export interface BransSonucu {
  bransNo: number;
  teklifId: number;
  sirketler: SirketTeklifi[];
  tamamlandi: boolean;
  /**
   * Otorizasyona düştüğü için listelenmeyen teklif sayısı. Müşteriye
   * "bir kısmı manuel onay bekliyor" notu göstermek için tutuluyor.
   */
  otorizasyonSayisi: number;
}

export const bosKimlik: KimlikDurumu = {
  entityType: "sahis",
  tckn: "",
  ykn: "",
  vkn: "",
  birthDate: "",
  phone: "",
  adSoyad: "",
  mernisTamam: false,
  sigortaliStr: "",
  adresKodu: "",
};

export const bosArac: AracDurumu = {
  plakaVar: true,
  plaka: "",
  tescilBelge: "",
  ilKodu: "",
  modelYili: "",
  markaKodu: "",
  tipKodu: "",
  kullanimTarzi: "01",
  kullanimSekli: "",
  kisiSayisi: "",
  motorNo: "",
  sasiNo: "",
  yakitTipi: "",
  tramerTamam: false,
};

export const bosSeyahat: SeyahatDurumu = {
  kapsam: "A",
  gidilenYer: "",
  planSecimi: "1",
  seyahatSebebi: "1",
  gidisTarihi: "",
  donusTarihi: "",
};

export const bosDask: DaskDurumu = {
  policemYok: true,
  daskPoliceNo: "",
  adresKodu: "",
  adresKoduBilinmiyor: false,
  adresOzeti: "",
  sigortaEttirenSifati: "1",
  yapiTarzi: "",
  insaaYili: "",
  toplamKatSayisi: "",
  kullanimSekli: "1",
  binaHasarDurumu: "1",
  brutM2: "",
  binadakiKonumu: "",
};

/** `AracKodu` = MarkaKodu (3) + TipKodu (4). */
export function aracKodu(arac: AracDurumu): string {
  if (!arac.markaKodu || !arac.tipKodu) return "";
  return `${arac.markaKodu}${arac.tipKodu}`;
}

export function kimlikNoOf(kimlik: KimlikDurumu): string {
  if (kimlik.entityType === "sahis") return kimlik.tckn;
  if (kimlik.entityType === "yabanci") return kimlik.ykn;
  return kimlik.vkn;
}
