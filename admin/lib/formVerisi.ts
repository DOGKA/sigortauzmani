/**
 * `teklif_oturumlari.form_data` okuma yardımcıları.
 *
 * Alan iki katmanlı: `girdiler` müşterinin gördüğü etiketlerle kaydedilen
 * özet, `talepler` ise IO'ya gönderilen ham gövde. Özet, etiket tabloları
 * istemcide olduğu için orada üretiliyor (bkz. src/pages/quote/ozet.ts).
 * Özet eklenmeden önce oluşmuş kayıtlarda alan boş kalıyor; o kayıtlar için
 * ham gövde düzleştirilip alan adları çevrilerek gösteriliyor — kodlar kod
 * hâlinde kalır ama hiçbir bilgi gizlenmez.
 */

export interface OzetSatiri {
  etiket: string;
  deger: string;
}

/** IO gövdesindeki alan yolları. Eski kayıtların okunabilirliği için. */
const ALAN_ADLARI: Record<string, string> = {
  SigortaEttirenAyniMi: "Sigorta ettiren sigortalı ile aynı",
  SigortaliStr: "MERNİS sigortalı bloğu",
  MeslekKodu: "Meslek kodu",
  "Sigortali.KimlikNo": "Kimlik numarası",
  "Sigortali.Dogumtarihi": "Doğum tarihi",
  "Sigortali.DogumTarihi": "Doğum tarihi",
  "Sigortali.Cep": "Cep telefonu",
  "Arac.Plaka": "Plaka",
  "Arac.TescilBelge": "Ruhsat seri no",
  "Arac.PlakamYok": "Plakası yok",
  "Arac.KisaSureli": "Kısa süreli poliçe",
  "Arac.AracKodu": "Araç kodu (marka-model)",
  "Arac.YakitTipi": "Yakıt tipi kodu",
  "Arac.IlKodu": "İl kodu",
  "Arac.ModelYili": "Model yılı",
  "Arac.KullanimTarzi": "Kullanım tarzı kodu",
  "Arac.KullanimSekli": "Kullanım şekli kodu",
  "Arac.MotorNo": "Motor no",
  "Arac.SasiNo": "Şasi no",
  "Arac.KisiSayisi": "Kişi sayısı",
  "Imm.ImmBedel": "İMM teminat bedeli kodu",
  "Imm.ManeviTazminat": "Manevi tazminat kodu",
  "Seyahat.Kapsam": "Seyahat bölgesi kodu",
  "Seyahat.GidilenYer": "Gidilen yer kodu",
  "Seyahat.PlanSecimi": "Plan kodu",
  "Seyahat.SeyahatSebebi": "Seyahat sebebi kodu",
  "Seyahat.GidisTarihi": "Gidiş tarihi",
  "Seyahat.DonusTarihi": "Dönüş tarihi",
  "Dask.PolicemYok": "Poliçesi yok (ilk kez)",
  "Dask.DaskPoliceNo": "Mevcut DASK poliçe no",
  "Dask.AdresKodu": "UAVT adres kodu",
  "Dask.SigortaEttirenSifati": "Sigorta ettiren sıfatı kodu",
  "Dask.YapiTarzi": "Yapı tarzı kodu",
  "Dask.InsaaYili": "İnşa yılı",
  "Dask.ToplamKatSayisi": "Toplam kat sayısı kodu",
  "Dask.KullanimSekli": "Kullanım şekli kodu",
  "Dask.BinaHasarDurumu": "Bina hasar durumu kodu",
  "Dask.BrutM2": "Brüt metrekare",
  "Dask.BinadakiKonumu": "Bulunduğu kat kodu",
};

export interface TeklifKaydi {
  bransNo: number;
  teklifId: number;
}

export interface TeklifHatasi {
  bransNo: number;
  message: string;
}

function ozetOku(value: unknown): OzetSatiri[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((satir) => {
    if (!satir || typeof satir !== "object") return [];
    const { etiket, deger } = satir as Record<string, unknown>;
    if (typeof etiket !== "string" || typeof deger !== "string") return [];
    return [{ etiket, deger }];
  });
}

/** Katmanlı gövdeyi "Arac.TescilBelge" biçiminde yol/değer çiftlerine açar. */
function duzlestir(value: unknown, prefix = ""): OzetSatiri[] {
  if (value === null || value === undefined || value === "") return [];

  if (Array.isArray(value)) {
    return value.flatMap((eleman, index) =>
      duzlestir(eleman, `${prefix}[${index + 1}]`),
    );
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(
      ([key, deger]) => duzlestir(deger, prefix ? `${prefix}.${key}` : key),
    );
  }

  const metin =
    typeof value === "boolean" ? (value ? "Evet" : "Hayır") : String(value);
  return [{ etiket: ALAN_ADLARI[prefix] ?? prefix, deger: metin }];
}

/**
 * Panelde gösterilecek girdi listesi. Özet varsa o kullanılır; yoksa ham
 * gövde düzleştirilir. `SigortaliStr` her iki yolda da atlanıyor: IO'nun
 * şifreli bloğu, ekranda yüzlerce karakterlik bir gürültü.
 */
export function girilenBilgiler(formData: unknown): OzetSatiri[] {
  if (!formData || typeof formData !== "object") return [];
  const record = formData as Record<string, unknown>;

  const ozet = ozetOku(record.girdiler);
  if (ozet.length) return ozet;

  const talepler = Array.isArray(record.talepler) ? record.talepler : [];
  return talepler
    .flatMap((talep) => {
      if (!talep || typeof talep !== "object") return [];
      return duzlestir((talep as Record<string, unknown>).payload);
    })
    .filter((satir) => !satir.etiket.includes("SigortaliStr"));
}

export function teklifKayitlari(formData: unknown): TeklifKaydi[] {
  if (!formData || typeof formData !== "object") return [];
  const teklifler = (formData as Record<string, unknown>).teklifler;
  if (!Array.isArray(teklifler)) return [];
  return teklifler.flatMap((kayit) => {
    if (!kayit || typeof kayit !== "object") return [];
    const { bransNo, teklifId } = kayit as Record<string, unknown>;
    if (typeof bransNo !== "number" || typeof teklifId !== "number") return [];
    return [{ bransNo, teklifId }];
  });
}

export function teklifHatalari(formData: unknown): TeklifHatasi[] {
  if (!formData || typeof formData !== "object") return [];
  const hatalar = (formData as Record<string, unknown>).hatalar;
  if (!Array.isArray(hatalar)) return [];
  return hatalar.flatMap((kayit) => {
    if (!kayit || typeof kayit !== "object") return [];
    const { bransNo, message } = kayit as Record<string, unknown>;
    if (typeof bransNo !== "number" || typeof message !== "string") return [];
    return [{ bransNo, message }];
  });
}
