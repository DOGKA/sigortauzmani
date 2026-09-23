/**
 * Prim sorgusu: POST /api/teklif/primler.
 *
 * IO teklifleri şirket şirket asenkron topluyor; `TeklifCalisildi` true
 * olana kadar istemci ~3 saniye aralıkla tekrar çağırır. Ara sonuçlar da
 * dolu gelebildiği için her turda gelenler kaydedilir ve istemciye
 * döndürülür — kullanıcı fiyatları akarken görür.
 *
 * Polling olduğu için rate limit burada geniş; pahalı olan teklif
 * oluşturma adımı (`api/io/teklif.ts`) zaten sınırlanıyor.
 */

import { errorResponse, ioFetch, jsonResponse } from "../_shared/io";
import {
  oturumTeklifIdleri,
  rateCheck,
  updateOturum,
  upsertFiyatlar,
  type FiyatInput,
} from "../_shared/iolog";
import { clientIp, hashIp, resolveSession, withCookie } from "../_shared/session";
import {
  normalizeSirketKodu,
  sirketAdi,
  sirketGizli,
} from "../../src/lib/io/sirketler";

export const config = { runtime: "edge" };

const MAX_POLL_PER_HOUR = 1200;

interface RequestBody {
  oturumId?: string;
  bransNo?: number;
  teklifId?: number;
}

interface SirketTeklifi {
  Id?: number;
  SirketKodu?: string | number;
  Prim?: number | string;
  TeklifNo?: string;
  TaksitKodu?: string;
  Taksit?: string;
  /** IO'nun satın alma bayrağı; kapalıysa şirket poliçeleştirmiyor. */
  SatinAl?: boolean;
  /** Satır bazlı hata / koşul metni. Doluysa prim bağlamıyor. */
  Hata?: string;
  [key: string]: unknown;
}

/**
 * Sayısal alanları çözer. Primin string geldiği durumları da karşılıyor:
 * virgül içeriyorsa Türkçe biçim kabul edilip nokta binlik ayırıcı olarak
 * atılıyor. Toleranslı olması önemli, çünkü çözülemeyen prim aşağıda
 * "satın alınamaz" sayılıp listeden düşüyor — biçim yüzünden geçerli bir
 * teklifi gizlemek istemiyoruz.
 */
function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  if (typeof value === "string") {
    const temiz = value.includes(",")
      ? value.replace(/\./g, "").replace(",", ".")
      : value;
    const parsed = Number(temiz.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readSirketler(payload: unknown): SirketTeklifi[] {
  if (!payload || typeof payload !== "object") return [];
  const list = (payload as Record<string, unknown>).Sirketler;
  return Array.isArray(list) ? (list as SirketTeklifi[]) : [];
}

/**
 * Otorizasyona düşen teklifler müşteriye listelenmiyor.
 *
 * Bu satırlarda şirket fiyatı bağlamıyor, manuel onaya gönderiyor. Kaskoda ve
 * DASK'ta sık görülüyor ama her branşta çıkabiliyor. Listelersek müşteri
 * satın al'a basıp hataya düşer, çünkü satılabilir bir prim yok.
 *
 * Canlı yanıtta satırın kendi `SatinAl` bayrağı var ve en doğrudan işaret o;
 * dolu `Hata` metni de aynı anlama geliyor (şirket primi bir koşula bağlamış:
 * araç fotoğrafı istiyor, prim aralığı dışı, KPS hatası…). Bunların yanında
 * "otorizasyon" geçen alanlara da bakılıyor, çünkü alan adı şirketten şirkete
 * değişebiliyor. Ham satır Supabase'e yine yazılıyor; denetim izi kalıyor.
 */
function satinAlinabilir(sirket: SirketTeklifi): boolean {
  const prim = toNumber(sirket.Prim);
  if (prim === null || prim <= 0) return false;

  // IO'nun kendi bayrağı. Kapalıysa poliçeleşmiyor; primi dolu olsa bile
  // satın al düğmesi gösterilmemeli.
  if (sirket.SatinAl === false) return false;
  if (typeof sirket.Hata === "string" && sirket.Hata.trim()) return false;

  for (const [key, value] of Object.entries(sirket)) {
    if (typeof value === "string" && /otoriz/i.test(value)) return false;
    // Bayrak ya da kod alanı olarak gelirse (isOtorizasyon: true,
    // OtorizasyonDurumu: "1" gibi). "0"/"false" gibi kapalı değerler geçerli
    // teklifi elememeli.
    if (/otoriz/i.test(key) && dolu(value)) return false;
  }
  return true;
}

/**
 * Çalışması bir daha tamamlanmayan, ölü teklif mi.
 *
 * IO'nun daha önce çalışılmış bir teklifi geri verdiği durumda görülüyordu:
 * çalıştırılacak şirket kalmadığı için `SirketSayisi` 0 geliyor ama
 * `TeklifCalisildi` hiçbir turda true olmuyor, yani polling boşa 90 saniye
 * dönüyor. Teklif akışı artık her seferinde yeni teklif açtığı için bu
 * duruma düşülmemesi gerekir; kontrol yalnızca polling'i zamanında kesen
 * bir emniyet olarak duruyor. Satın alma tarafı ayrıca korunuyor: ödeme
 * öncesi `teklifguncelle` `SatinAl: false` derse kart çekilmiyor.
 *
 * Taze tekliflerde `SirketSayisi` çalıştırılacak şirket sayısını veriyor ve
 * tamamlandığında `TeklifCalisildi` true oluyor; ilk turda henüz hiç şirket
 * çalışmamış olabileceği için `CalisilanSirketSayisi` şartı da aranıyor.
 */
function takiliTeklifMi(
  payload: Record<string, unknown>,
  teklifCalisildi: boolean,
  satirSayisi: number,
): boolean {
  if (teklifCalisildi || satirSayisi === 0) return false;
  const sirketSayisi = toNumber(payload?.SirketSayisi);
  const calisilan = toNumber(payload?.CalisilanSirketSayisi);
  return sirketSayisi === 0 && calisilan !== null && calisilan > 0;
}

/** Bayrak alanının "açık" sayılıp sayılmayacağı. */
function dolu(value: unknown): boolean {
  if (value === null || value === undefined || value === false) return false;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const temiz = value.trim().toLowerCase();
    return temiz !== "" && temiz !== "0" && temiz !== "false";
  }
  return true;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Yöntem desteklenmiyor." }, 405);
  }

  const session = await resolveSession(request);
  const ipHash = await hashIp(clientIp(request));

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return withCookie(jsonResponse({ error: "Geçersiz istek." }, 400), session);
  }

  const bransNo = toNumber(body.bransNo);
  const teklifId = toNumber(body.teklifId);
  if (bransNo === null || teklifId === null) {
    return withCookie(
      jsonResponse({ error: "Branş ve teklif bilgisi zorunlu." }, 400),
      session,
    );
  }

  const allowed = await rateCheck(ipHash, "primler", MAX_POLL_PER_HOUR, 3600);
  if (!allowed) {
    return withCookie(
      jsonResponse({ error: "Çok fazla istek. Lütfen sayfayı yenileyin." }, 429),
      session,
    );
  }

  // Teklif numarası istemciden gelse de yalnızca bu çerezin açtığı
  // oturumun kayıtlı teklifleri sorgulanır. Numara ardışık olduğu için
  // oturum kontrolü olmadan başka bir ziyaretçinin primi okunabiliyordu.
  if (!body.oturumId) {
    return withCookie(jsonResponse({ error: "Teklif oturumu zorunlu." }, 400), session);
  }
  const teklifIdleri = await oturumTeklifIdleri(body.oturumId, session.id);
  if (!teklifIdleri.includes(teklifId)) {
    return withCookie(
      jsonResponse({ error: "Bu teklif bu oturuma ait değil." }, 403),
      session,
    );
  }

  const result = await ioFetch(`/api/teklif/primler`, {
    method: "POST",
    body: { BransNo: bransNo, TeklifId: teklifId },
  });

  if (!result.ok) {
    return withCookie(errorResponse(result.error), session);
  }

  const payload = result.data as Record<string, unknown>;
  const teklifCalisildi = payload?.TeklifCalisildi === true;
  // Gizli şirket IO'dan gelse de kayda ve istemciye hiç yazılmıyor.
  const sirketler = readSirketler(payload).filter(
    (sirket) => !sirketGizli(sirket.SirketKodu),
  );
  const takili = takiliTeklifMi(payload, teklifCalisildi, sirketler.length);

  if (sirketler.length) {
    const fiyatlar: FiyatInput[] = sirketler.map((sirket) => ({
      brans_no: bransNo,
      sirket_kodu: normalizeSirketKodu(sirket.SirketKodu),
      sirket_adi: sirketAdi(sirket.SirketKodu),
      io_teklif_satir_id: toNumber(sirket.Id),
      teklif_no: sirket.TeklifNo ?? null,
      prim: toNumber(sirket.Prim),
      taksit: sirket.Taksit ?? null,
      taksit_kodu: sirket.TaksitKodu ?? null,
      raw: sirket,
    }));
    await upsertFiyatlar(body.oturumId, fiyatlar);
    if (teklifCalisildi) {
      await updateOturum(body.oturumId, { status: "teklif_calisti" });
    } else if (takili) {
      // Panelde polling'in neden erken kesildiği görünsün.
      await updateOturum(body.oturumId, {
        status: "teklif_calisti",
        hata_mesaji:
          "IO teklifi tamamlanmış işaretlemedi (SirketSayisi 0); polling kesildi.",
      });
    }
  }

  const listelenecek = sirketler.filter(satinAlinabilir);

  return withCookie(
    jsonResponse({
      // Takılı teklifte `TeklifCalisildi` hiçbir turda true olmuyor;
      // tamamlandı saymazsak istemci boşuna 90 saniye polling yapıyor.
      teklifCalisildi: teklifCalisildi || takili,
      // Müşteriye yalnızca satın alınabilir teklifler gidiyor; elenen sayı
      // ekranda "manuel onay bekliyor" notu için taşınıyor.
      otorizasyonSayisi: sirketler.length - listelenecek.length,
      sirketler: listelenecek.map((sirket) => ({
        ...sirket,
        SirketKodu: normalizeSirketKodu(sirket.SirketKodu),
        SirketAdi: sirketAdi(sirket.SirketKodu),
        // İstemci Prim'i sayı kabul ediyor; süzgeçten geçen her satırda
        // geçerli bir değer olduğu garanti.
        Prim: toNumber(sirket.Prim),
      })),
    }),
    session,
  );
}
