/**
 * Acente defterindeki teklif ve poliçe kayıtları.
 *
 * `POST /api/uye/teklifler` ve `POST /api/uye/policeler`. Dökümanda ikisi de
 * GET yazıyor, oysa GET'e "The requested resource does not support http
 * method 'GET'." ile 405 dönüyorlar; uçlar `{ Arama, Sayfa }` gövdesiyle POST
 * istiyor.
 *
 * Uçlar acentenin tamamının kaydını görüyor: `Arama` boş gönderildiğinde
 * dönen otuz teklifin yirmi üçü bizim sitemizden hiç geçmemişti, yani CRM'de
 * operatörün açtığı kayıtlar da burada. Kendi veritabanımızın göremediği o
 * teklifleri tanımamızı sağlayan tek kaynak bu.
 *
 * Karşılığında yanıt hiçbir zaman istemciye çıplak verilmemeli: kayıtlar
 * başka müşterilerin adını, kimlik numarasını ve primini taşıyor. Bu yüzden
 * buradaki fonksiyonlar kayıt değil, yalnızca sorulan kimliğe ait tek bir
 * tarih döndürüyor.
 *
 * Kayıt okumak akışı bloke etmemeli: uç düşerse ya da yavaşlarsa teklif
 * kendi kaydımızla devam eder, bu yüzden hata fırlatılmıyor.
 */

import { ioFetch } from "./io";

/** Uçların sabit sayfa boyu. */
const SAYFA_BOYU = 10;

/**
 * Kimlik ya da plakayla arandığında hedef kayıt ilk sayfada oluyor; ikinci
 * sayfa yalnızca çok teklifi olan müşteriler için emniyet payı. Teklif akışı
 * bunu beklediği için tavan düşük tutuluyor.
 */
const MAX_SAYFA = 2;

const TIMEOUT_MS = 8_000;

/**
 * IO tarihleri saat dilimi taşımıyor (`2026-09-14T12:21:25.477`) ve Türkiye
 * saatini veriyor: dokunulmamış tekliflerde kendi `created_at` kaydımızla
 * saniyesi saniyesine örtüşüyor. Sunucu UTC'de çalıştığı için ek yapılmazsa
 * tarih üç saat geriye kayar. Türkiye 2016'dan beri sabit +03:00 olduğundan
 * sabit ek güvenli.
 */
function ioTarihiIso(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const metin = value.trim();
  if (!metin) return null;
  if (/(?:Z|[+-]\d{2}:?\d{2})$/.test(metin)) return metin;
  return `${metin}+03:00`;
}

/** Yanıt bazı uçlarda çıplak dizi, bazılarında nesnenin içinde geliyor. */
function listeCikar(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (!data || typeof data !== "object") return [];
  for (const value of Object.values(data as Record<string, unknown>)) {
    if (Array.isArray(value) && value.length && typeof value[0] === "object") {
      return value as Record<string, unknown>[];
    }
  }
  return [];
}

async function uyeKayitlari(
  uc: "teklifler" | "policeler",
  arama: string,
): Promise<Record<string, unknown>[]> {
  const kayitlar: Record<string, unknown>[] = [];
  for (let sayfa = 0; sayfa < MAX_SAYFA; sayfa += 1) {
    const result = await ioFetch<unknown>(`/api/uye/${uc}`, {
      method: "POST",
      timeoutMs: TIMEOUT_MS,
      body: { Arama: arama, Sayfa: sayfa },
    });
    if (!result.ok) break;
    const liste = listeCikar(result.data);
    kayitlar.push(...liste);
    if (liste.length < SAYFA_BOYU) break;
  }
  return kayitlar;
}

/**
 * Verilen teklifin IO tarafındaki son işlem zamanı.
 *
 * Alan oluşturma değil son işlem zamanını tutuyor: hiç dokunulmamış üç
 * teklifte kendi kaydımızla birebir aynı çıktı, ama `teklifguncelle`
 * çağırdığımız iki teklifte çağrı saatine atladı. Dolayısıyla tek başına yaş
 * ölçüsü değil — tarihin eski olması teklifin eski olduğunu kanıtlar, yeni
 * olması taze olduğunu kanıtlamaz. Çağıran taraf bunu kendi kaydıyla
 * birleştirip eski olanı seçiyor.
 */
export async function ioTeklifTarihi(
  arama: string,
  teklifId: number,
): Promise<string | null> {
  for (const kayit of await uyeKayitlari("teklifler", arama)) {
    if (Number(kayit.TeklifId) === teklifId) {
      return ioTarihiIso(kayit.TeklifTarihi);
    }
  }
  return null;
}

export interface KayitliTeklifBilgisi {
  teklifId: number;
  teklifTarihi: string | null;
}

/**
 * Kişi + plaka + branş için acente defterindeki en son teklif.
 *
 * Arama plaka ile daraltılsa bile IO yanıtına güvenilip ilk kayıt doğrudan
 * kullanılmıyor; kimlik ve branş sunucuda tekrar karşılaştırılıyor. Böylece
 * istemci başka bir plakayı deneyerek acente defterinden veri çekemez.
 *
 * Kısa süreli trafik yıllık trafikle aynı `BransNo: 0` değerini kullanıyor
 * ve `/api/uye/teklifler` kaydı `KisaSureli` alanı taşımıyor. CRM de araç
 * bilgileri girilirken aynı kişi/riziko için genel kayıt kontrolü yaptığı
 * için burada iki trafik türü yapay bir şirket-sayısı kuralıyla ayrılmıyor.
 */
export async function kayitliTeklifBul(
  plaka: string,
  kimlikNo: string,
  bransNo: number,
): Promise<KayitliTeklifBilgisi | null> {
  const arananKimlik = kimlikNo.replace(/\D/g, "");
  let bulunan: { teklifId: number; teklifTarihi: string | null; ms: number } | null =
    null;

  for (const kayit of await uyeKayitlari("teklifler", plaka)) {
    if (String(kayit.KimlikNo ?? "").replace(/\D/g, "") !== arananKimlik) continue;
    if (Number(kayit.BransNo) !== bransNo) continue;

    const teklifId = Number(kayit.TeklifId);
    if (!Number.isFinite(teklifId) || teklifId <= 0) continue;
    const teklifTarihi = ioTarihiIso(kayit.TeklifTarihi);
    const ms = teklifTarihi ? Date.parse(teklifTarihi) : 0;
    const siralama = Number.isNaN(ms) ? 0 : ms;
    if (!bulunan || siralama > bulunan.ms) {
      bulunan = { teklifId, teklifTarihi, ms: siralama };
    }
  }

  return bulunan
    ? { teklifId: bulunan.teklifId, teklifTarihi: bulunan.teklifTarihi }
    : null;
}

/**
 * Aynı branşta yürürlükte olan poliçenin bitiş tarihi.
 *
 * Yeni teklifin önündeki gerçek engel bu: mevcut poliçe sürerken şirket
 * sonraki vade için teklif açmıyor ve CRM'de bile "Bu vade için teklif
 * çalışılamaz" (HataKodu 11) dönüyor. Tarih poliçenin kendi kaydından geldiği
 * için teklif üzerinde yaptığımız hiçbir işlem onu kaydırmıyor; teklif
 * tarihinin aksine güvenilir.
 *
 * Birden fazla yürürlükte poliçe varsa en uzağa giden seçiliyor: yeni teklifin
 * ne zaman açılabileceğini belirleyen o.
 */
export async function aktifPoliceBitisi(
  arama: string,
  bransNo: number,
): Promise<string | null> {
  const simdi = Date.now();
  let enUzak: { iso: string; ms: number } | null = null;

  for (const kayit of await uyeKayitlari("policeler", arama)) {
    if (kayit.Yururlukte !== true) continue;
    if (Number(kayit.BransNo) !== bransNo) continue;
    const iso = ioTarihiIso(kayit.BitisTarihi);
    if (!iso) continue;
    const ms = Date.parse(iso);
    if (Number.isNaN(ms) || ms <= simdi) continue;
    if (!enUzak || ms > enUzak.ms) enUzak = { iso, ms };
  }

  return enUzak?.iso ?? null;
}
