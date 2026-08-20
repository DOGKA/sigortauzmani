/**
 * IO sorgu yanıtlarından alan okuyucuları.
 *
 * Sorgu uçlarının yanıt şeması dokümante edilmiş değil ve uçlar arasında
 * tutarsız: aynı bilgi bazen kökte bazen `Sigortali` içinde, alan adı bazen
 * `Adi` bazen `AdUnvan` oluyor, MERNİS maskeli döndürürken TRAMER açık
 * döndürüyor. Bu yüzden okuma savunmacı yapılıyor ve tek yerde toplanıyor.
 */

function kaynakOf(payload: Record<string, unknown>): Record<string, unknown> {
  const sigortali = payload.Sigortali;
  return sigortali && typeof sigortali === "object"
    ? (sigortali as Record<string, unknown>)
    : payload;
}

function metin(deger: unknown): string {
  return typeof deger === "string" ? deger.replace(/\s+/g, " ").trim() : "";
}

/**
 * Ad soyadı okur. MERNİS açık adı (`Adi` + `Soyadi`) yalnızca SMS onayından
 * sonra veriyor, o yüzden maskeli alana da düşülüyor; TRAMER ise açık
 * döndürüyor.
 */
export function okuAdSoyad(payload: Record<string, unknown>): string {
  const kaynak = kaynakOf(payload);

  const acik = [metin(kaynak.Adi ?? kaynak.Ad), metin(kaynak.Soyadi ?? kaynak.Soyad)]
    .filter(Boolean)
    .join(" ");
  if (acik) return acik;

  for (const anahtar of ["AdUnvan", "AdSoyad", "Unvan", "AdUnvanYildizli"]) {
    const deger = metin(kaynak[anahtar]);
    if (deger) return deger;
  }
  return "";
}

/**
 * Soyadı maskeler: "DİYAEDDİN TEMEL" → "DİYAEDDİN T***".
 *
 * TRAMER ruhsat sahibinin adını açık döndürüyor. Kullanıcıya doğru aracı
 * sorguladığını göstermek için ad yeterli; açık soyadı basmak siteyi plaka ve
 * ruhsat seri numarasını bilen herkes için isim sorgulama aracına çevirirdi.
 */
export function maskeleSoyad(adSoyad: string): string {
  const parcalar = adSoyad.trim().split(/\s+/).filter(Boolean);
  if (!parcalar.length) return "";
  if (parcalar.length === 1) return `${parcalar[0].slice(0, 1)}***`;

  const soyad = parcalar[parcalar.length - 1];
  return [...parcalar.slice(0, -1), `${soyad.slice(0, 1)}***`].join(" ");
}

/**
 * Doğum tarihini okur. Alan çoğu zaman gerçek tarihi taşımıyor:
 * gönderdiğimiz değer yankılanıyor, göndermediğimizde de .NET varsayılanı
 * `0001-01-01` dönüyor. Bu yüzden yalnızca makul bir doğum yılı kabul
 * ediliyor; aksi hâlde kullanıcının doğum tarihi alanına çöp değer yazılırdı.
 */
export function okuDogumTarihi(payload: Record<string, unknown>): string {
  const kaynak = kaynakOf(payload);

  const buYil = new Date().getFullYear();
  const makul = (yil: string): boolean => {
    const sayi = Number(yil);
    return sayi >= 1900 && sayi <= buYil;
  };

  for (const anahtar of ["DogumTarihi", "Dogumtarihi", "DogumTarih"]) {
    const deger = kaynak[anahtar];
    if (typeof deger !== "string" || !deger.trim()) continue;

    // "1970-12-24" ya da "1970-12-24T00:00:00" → tarih kısmı yeter.
    const iso = deger.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso && makul(iso[1])) return `${iso[1]}-${iso[2]}-${iso[3]}`;

    // "24.12.1970" biçimi.
    const noktali = deger.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (noktali && makul(noktali[3])) {
      return `${noktali[3]}-${noktali[2]}-${noktali[1]}`;
    }
  }
  return "";
}

/**
 * Kayıtlı adresin UAVT kodunu okur; DASK adımında kullanıcı kodu elle aramak
 * zorunda kalmasın. Yalnızca 10 haneli değerler kabul ediliyor — UAVT kodu on
 * hane, hiyerarşideki diğer kodlar daha kısa.
 */
export function okuAdresKodu(payload: Record<string, unknown>): string {
  const sigortali = payload.Sigortali;
  const kaynaklar = [
    payload,
    sigortali && typeof sigortali === "object"
      ? (sigortali as Record<string, unknown>)
      : null,
  ];

  for (const kaynak of kaynaklar) {
    if (!kaynak) continue;
    for (const anahtar of ["AdresKodu", "AdresNo", "UavtKodu", "UAVT"]) {
      const deger = kaynak[anahtar];
      if (deger === null || deger === undefined) continue;
      const rakamlar = String(deger).replace(/\D/g, "");
      if (rakamlar.length === 10) return rakamlar;
    }
  }
  return "";
}
