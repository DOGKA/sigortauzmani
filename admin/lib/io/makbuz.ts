/**
 * IO (Sigorta Gross) üzerinden ödeme makbuzu getirme.
 *
 * Site tarafındaki `api/_shared/yazdir.ts` ile aynı sözleşmeyi kullanıyor ama
 * oradan import edilmiyor: iki uygulama ayrı deploy ediliyor ve o dosya edge
 * runtime'a bağlı bir yardımcı zinciri taşıyor.
 *
 * Belge kimliği olarak teklif satırının Id'si kullanılıyor; IO satın almadan
 * sonra yeni bir kimlik üretmiyor. Bu kimlik satın alma kaydında tutulmadığı
 * için oturumun teklif numarasıyla prim listesi yeniden okunup ilgili şirket
 * satırı bulunuyor. Liste IO'da hazır duruyor, çağrı sigorta şirketlerine
 * yeniden gitmiyor.
 */

const ZAMAN_ASIMI_MS = 30_000;

export type BelgeSonucu =
  | { ok: true; url: string }
  | { ok: false; mesaj: string };

interface IoYanit {
  status: number;
  govde: unknown;
}

/**
 * `src/lib/io/sirketler.ts` içindeki normalize işleminin aynısı. Satın alma
 * kaydındaki kod bu kuralla yazıldığı için karşılaştırma da bununla yapılmalı;
 * iki uygulama ayrı paketlendiğinden ortak dosya yerine kopyalandı.
 */
function normalizeSirketKodu(kod: unknown): string {
  if (kod === null || kod === undefined) return "";
  const ham = String(kod).trim();
  if (!ham) return "";
  if (!/^\d+$/.test(ham)) return ham.toUpperCase();
  return ham.length >= 3 ? ham : ham.padStart(3, "0");
}

async function ioIstek(
  yol: string,
  init: { method: "GET" | "POST"; body?: unknown },
): Promise<IoYanit | null> {
  const base = process.env.IO_API_BASE_URL?.replace(/\/+$/, "");
  const token = process.env.IO_API_TOKEN;
  if (!base || !token) return null;

  try {
    const yanit = await fetch(`${base}${yol}`, {
      method: init.method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: AbortSignal.timeout(ZAMAN_ASIMI_MS),
    });
    const govde: unknown = await yanit.json().catch(() => null);
    return { status: yanit.status, govde };
  } catch {
    return null;
  }
}

/** PDF adresi yanıtta Url / pdf / downloadUrl olarak gelebiliyor. */
function urlOku(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const kayit = payload as Record<string, unknown>;
  for (const alan of ["Url", "url", "pdf", "Pdf", "downloadUrl"]) {
    const deger = kayit[alan];
    if (typeof deger === "string" && deger.startsWith("http")) return deger;
  }
  return null;
}

/** IO'nun kendi açıklaması ("Pdf Yazdırılamadı." gibi). */
function ioMesaji(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const hata = (payload as Record<string, unknown>).Hata;
  if (!hata || typeof hata !== "object") return null;
  const mesaj = (hata as Record<string, unknown>).Mesaj;
  return typeof mesaj === "string" && mesaj.trim() ? mesaj.trim() : null;
}

/** Prim listesinden satın alınan şirketin teklif satırı kimliğini bulur. */
export async function teklifSatiriIdBul(
  teklifId: number,
  bransNo: number,
  sirketKodu: string,
): Promise<number | null> {
  const yanit = await ioIstek("/api/teklif/primler", {
    method: "POST",
    body: { BransNo: bransNo, TeklifId: teklifId },
  });
  if (!yanit || yanit.status !== 200 || !yanit.govde) return null;

  const sirketler = (yanit.govde as { Sirketler?: unknown }).Sirketler;
  if (!Array.isArray(sirketler)) return null;

  const hedef = sirketler.find(
    (satir) =>
      normalizeSirketKodu((satir as { SirketKodu?: unknown })?.SirketKodu) ===
      sirketKodu,
  );
  const id = Number((hedef as { Id?: unknown })?.Id);
  return Number.isFinite(id) && id > 0 ? id : null;
}

/**
 * Makbuzu ister.
 *
 * Yanıt HTTP 200 dönüp başarısız olabiliyor ve hata bilgisi kökteki `HataKodu`
 * yerine iç içe `Hata` nesnesinde geliyor; `Hata.Basarili` başarılı çağrılarda
 * bile false. Bu yüzden tek güvenilir ölçüt `Url` alanının dolu olması.
 */
export async function makbuzUrlGetir(
  ioTeklifSatirId: number,
): Promise<BelgeSonucu> {
  const yanit = await ioIstek(
    `/api/yazdir?id=${ioTeklifSatirId}&tipi=m`,
    { method: "GET" },
  );
  if (!yanit) {
    return { ok: false, mesaj: "Sigorta servisine ulaşılamadı." };
  }
  if (yanit.status === 401 || yanit.status === 403) {
    return { ok: false, mesaj: "Sigorta servisi yetkilendirmesi geçersiz." };
  }
  if (yanit.status !== 200) {
    return { ok: false, mesaj: "Sigorta servisi şu anda yanıt vermiyor." };
  }

  const url = urlOku(yanit.govde);
  if (url) return { ok: true, url };
  return { ok: false, mesaj: ioMesaji(yanit.govde) ?? "Belge alınamadı." };
}
