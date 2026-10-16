/**
 * Kimlik numarasından doğum tarihi: IO `GET /api/sorgu/dogumtarihi?tc=`.
 *
 * Dokümanda `POST` + `{ "tc": ... }` yazıyor ama canlıda o yol 404 dönüyor;
 * çalışan biçim sorgu parametreli GET. Yanıt `Sigortali.DogumTarihi`
 * ("1992-12-07T02:00:00+02:00") ve `Sigortali.DogumTarihiStr` ("7.12.1992")
 * taşıyor; doğum yeri gibi başka kişisel alanlar da geliyor.
 *
 * Sonuç hiçbir zaman istemciye dönmüyor: yalnızca teklif / TRAMER gövdesine
 * ve kendi kayıtlarımıza ekleniyor. Çağıran uç, telefonun bu oturumda SMS
 * koduyla doğrulandığını kontrol etmekle yükümlü; aksi hâlde herhangi bir
 * kimlik numarasıyla sorgu yaptırılabilirdi.
 */

import { ioFetch } from "./io";

const SORGU_TIMEOUT_MS = 10_000;

/**
 * Aynı ziyaretçi kimlik, TRAMER ve teklif adımlarında aynı numarayı üç kez
 * sorduruyor. İzolasyon başına en iyi çaba önbelleği; kaybolması yalnızca
 * fazladan bir sorgu demek.
 */
const ONBELLEK_MS = 30 * 60 * 1000;
const MAX_ONBELLEK = 500;
const onbellek = new Map<string, { tarih: string; zaman: number }>();

/** 11 haneli, sıfırla başlamayan kimlik numarası (T.C. ya da YKN). */
export function sorgulanabilirKimlik(value: unknown): string | null {
  const rakamlar = String(value ?? "").replace(/\D/g, "");
  return /^[1-9]\d{10}$/.test(rakamlar) ? rakamlar : null;
}

function makulYil(yil: string): boolean {
  const sayi = Number(yil);
  return sayi >= 1900 && sayi <= new Date().getFullYear();
}

function tarihOku(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const kok = payload as Record<string, unknown>;
  const kaynak =
    kok.Sigortali && typeof kok.Sigortali === "object"
      ? (kok.Sigortali as Record<string, unknown>)
      : kok;

  // Saat dilimi kayması günü değiştirmesin diye yerel tarih kısmı alınıyor.
  const iso = String(kaynak.DogumTarihi ?? "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso && makulYil(iso[1])) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const noktali = String(kaynak.DogumTarihiStr ?? "").match(
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
  );
  if (noktali && makulYil(noktali[3])) {
    return `${noktali[3]}-${noktali[2].padStart(2, "0")}-${noktali[1].padStart(2, "0")}`;
  }
  return null;
}

/** YYYY-AA-GG ya da bulunamazsa null. */
export async function dogumTarihiSorgula(
  sessionId: string,
  kimlikNo: string,
): Promise<string | null> {
  const anahtar = `${sessionId}:${kimlikNo}`;
  const kayit = onbellek.get(anahtar);
  if (kayit && Date.now() - kayit.zaman < ONBELLEK_MS) return kayit.tarih;

  const sonuc = await ioFetch(
    `/api/sorgu/dogumtarihi?tc=${encodeURIComponent(kimlikNo)}`,
    { method: "GET", timeoutMs: SORGU_TIMEOUT_MS },
  );
  const tarih = sonuc.ok ? tarihOku(sonuc.data) : null;
  if (tarih) {
    if (onbellek.size >= MAX_ONBELLEK) onbellek.clear();
    onbellek.set(anahtar, { tarih, zaman: Date.now() });
  }
  return tarih;
}

/**
 * IO gövdesindeki `Sigortali` bloğunda doğum tarihi yoksa sorgulayıp ekler.
 * Araç branşları küçük t'li `Dogumtarihi`, diğerleri `DogumTarihi` bekliyor.
 * Tüzel kişide (`KimlikTipi: 1`) dokunulmuyor.
 */
export async function sigortaliyaDogumTarihiEkle(
  sessionId: string,
  govde: Record<string, unknown>,
  alan: "Dogumtarihi" | "DogumTarihi",
): Promise<{ govde: Record<string, unknown>; tarih: string | null }> {
  const sigortali = govde.Sigortali;
  if (!sigortali || typeof sigortali !== "object" || Array.isArray(sigortali)) {
    return { govde, tarih: null };
  }
  const blok = sigortali as Record<string, unknown>;
  const mevcut = [blok.Dogumtarihi, blok.DogumTarihi].find(
    (deger) => typeof deger === "string" && deger.trim(),
  );
  if (typeof mevcut === "string") return { govde, tarih: mevcut };
  if (Number(blok.KimlikTipi) === 1) return { govde, tarih: null };

  const kimlikNo = sorgulanabilirKimlik(blok.KimlikNo);
  if (!kimlikNo) return { govde, tarih: null };

  const tarih = await dogumTarihiSorgula(sessionId, kimlikNo);
  if (!tarih) return { govde, tarih: null };

  const { Dogumtarihi: _kucuk, DogumTarihi: _buyuk, ...temiz } = blok;
  return {
    govde: { ...govde, Sigortali: { ...temiz, [alan]: tarih } },
    tarih,
  };
}
