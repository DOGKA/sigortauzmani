/**
 * IO API istek ve yanıt tipleri.
 *
 * Alan adları IO'nun beklediği gibi PascalCase; dönüştürmemek hataları
 * azaltıyor çünkü dokümantasyonla birebir karşılaştırılabiliyor.
 */

export interface Sigortali {
  KimlikNo: string;
  /**
   * Dokümantasyon araç branşlarında `Dogumtarihi`, konut/sağlıkta
   * `DogumTarihi` kullanıyor. İkisi de opsiyonel bırakıldı; ürün adımı
   * hangisini dolduracağını biliyor.
   */
  Dogumtarihi?: string;
  DogumTarihi?: string;
  Cep?: string;
}

export interface Arac {
  Plaka?: string;
  TescilBelge?: string;
  PlakamYok?: boolean;
  KisaSureli?: boolean;
  IlKodu?: string;
  ModelYili?: string;
  KullanimTarzi?: string;
  KullanimSekli?: string;
  AracKodu?: string;
  MotorNo?: string;
  SasiNo?: string;
  KisiSayisi?: string;
  YakitTipi?: string;
  Marka?: string;
  MarkaTipi?: string;
}

export interface ImmBilgisi {
  ImmBedel: string;
  ManeviTazminat: string;
}

export interface DaskBilgisi {
  PolicemYok?: boolean;
  DaskPoliceNo?: string;
  AdresKodu?: string;
  SigortaEttirenSifati?: string;
  YapiTarzi?: string;
  InsaaYili?: string;
  ToplamKatSayisi?: string;
  KullanimSekli?: string;
  BinaHasarDurumu?: string;
  BrutM2?: string;
  BinadakiKonumu?: string;
}

export interface SeyahatBilgisi {
  /** Kapsam "Y" ise il kodu, değilse ülke kodu. */
  GidilenYer: string;
  PlanSecimi: string;
  SeyahatSebebi: string;
  GidisTarihi: string;
  DonusTarihi: string;
  Kapsam: string;
}

/** POST /api/teklif gövdesi. `BransNo` ve `Kanal` sunucuda eklenir. */
export interface TeklifPayload {
  SigortaEttirenAyniMi: boolean;
  Sigortali: Sigortali;
  Arac?: Arac;
  Imm?: ImmBilgisi;
  Dask?: DaskBilgisi;
  Seyahat?: SeyahatBilgisi;
  BitisTarihi?: string;
  MeslekKodu?: string;
  /**
   * MERNİS yanıtından gelen şifreli sigortalı bloğu. Dokümantasyonda
   * geçmiyor, canlı yanıtta var.
   */
  SigortaliStr?: string;
}

/** Primler yanıtındaki tek şirket teklifi. */
export interface SirketTeklifi {
  Id: number;
  SirketKodu: string;
  /** Proxy tarafından koddan çözülüp eklenir. */
  SirketAdi: string;
  Prim: number;
  TeklifNo: string;
  TaksitKodu?: string;
  Taksit?: string;
  AcenteKodu?: string;
  isWebServis?: boolean;
  /**
   * Şirketin satın almaya izin verip vermediği. Dokümantasyonda satın alma
   * isteğinin bir alanı olarak geçiyor ama prim yanıtındaki satırda da
   * geliyor ve orada okunması gerekiyor: kapalı satırlar poliçeleşmiyor.
   */
  SatinAl?: boolean;
  /** Satır bazlı hata / koşul metni. Doluysa prim bağlamıyor. */
  Hata?: string;
  /**
   * Teklifin arayüze ilk düştüğü an (ISO). IO'dan gelmiyor; polling sırasında
   * istemcide işaretleniyor ve teklif kartında "teklif zamanı" olarak
   * gösteriliyor.
   */
  alindiAt?: string;
  [key: string]: unknown;
}

export interface Marka {
  MarkaKodu: string;
  MarkaAdi: string;
}

export interface MarkaTipi {
  TipKodu: string;
  TipAdi: string;
}

export interface Meslek {
  Kodu: string;
  Adi: string;
}

export interface Il {
  IlKodu: string;
  IlAdi: string;
}

export interface Ilce {
  IlceKodu?: string;
  IlceAdi?: string;
  [key: string]: unknown;
}

export interface Ulke {
  UlkeKodu: string;
  UlkeAdi: string;
  Kapsam?: string;
}

/**
 * UAVT hiyerarşisindeki tek kayıt. Her seviye aynı şekli döndürüyor ama
 * dolu gelen alanlar seviyeye göre değişiyor (canlı yanıttan doğrulandı):
 *
 * - İlçe/Semt/Mahalle/Cadde: `Adi` dolu, alt seviyeye `Kod` ile inilir.
 * - Bina: `Adi` null; etiket `BlokAdi` + `DisKapiNo`'dan kurulur.
 * - Daire: `Adi` null; etiket `IcKapiNo`'dan kurulur.
 *
 * `AdresNo` yalnızca daire seviyesinde dolu ve DASK'ın beklediği 10 haneli
 * UAVT adres kodu bu; `Kod` farklı (8 haneli iç kimlik).
 */
export interface AdresKaydi {
  Kod?: string | null;
  Adi?: string | null;
  /** Daire seviyesinde UAVT adres kodu. `Dask.AdresKodu` buraya bakar. */
  AdresNo?: string | null;
  BlokAdi?: string | null;
  SiteAdi?: string | null;
  DisKapiNo?: string | null;
  IcKapiNo?: string | null;
  [key: string]: unknown;
}

export type AdresSeviyesi =
  | "Ilce"
  | "Semt"
  | "Mahalle"
  | "Cadde"
  | "Bina"
  | "Daire"
  | "Uavt";

export interface KartBilgisi {
  KartSahibi: string;
  KimlikNo: string;
  KartNo: string;
  SonKullanimAy: string;
  SonKullanimYil: string;
  Cvv2: string;
}

export interface TeklifOlusturSonuc {
  oturumId: string | null;
  oturumNo: string | null;
  teklifler: {
    bransNo: number;
    teklifId: number;
    /**
     * IO yeni teklif açmak yerine 24 saatten eski bir teklifi döndürdü.
     * Tanzim tarihi değişmek zorunda olduğu için o primlerle satın alma
     * yapılamıyor; yeni teklif çalıştırılması gerekiyor.
     */
    eskiTeklif?: boolean;
    /**
     * Teklifin bilinen en eski işlem anı (ISO). Kendi kaydımızla IO'nun
     * acente defterindeki tarihinin eskisi; ikisi de yoksa null.
     */
    teklifTarihi?: string | null;
    /**
     * Aynı branşta yürürlükte olan poliçenin bitiş tarihi (ISO). Yeni teklifin
     * neden açılamadığını açıklayan tarih bu: poliçe sürerken şirket sonraki
     * vade için teklif çalıştırmıyor.
     */
    policeBitisi?: string | null;
  }[];
  hatalar: { bransNo: number; message: string }[];
}

/** Araç bilgileri girilirken yapılan CRM tipi kayıtlı teklif ön kontrolü. */
export interface KayitliTeklifKontrolSonucu {
  bulundu: boolean;
  teklifId: number | null;
  teklifTarihi: string | null;
  policeBitisi: string | null;
}

export interface PrimlerSonuc {
  teklifCalisildi: boolean;
  /**
   * IO yeni teklif açmak yerine daha önce çalışılmış teklifi döndürdü.
   * Satırlar eski çalışmadan kalıyor ve satın almada şirket reddediyor;
   * arayüz bu durumda anında satın almayı kapatıp talep açtırıyor.
   */
  eskiTeklif?: boolean;
  /** Otorizasyona düştüğü için listeden çıkarılan teklif sayısı. */
  otorizasyonSayisi?: number;
  sirketler: SirketTeklifi[];
}

export interface SatinAlmaSonuc {
  policeKesildi: boolean;
  policeNo: string | null;
  policePdfUrl: string | null;
  makbuzPdfUrl: string | null;
  kartSon4: string;
}
