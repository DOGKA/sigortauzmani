/**
 * Belge indirme: teklif PDF'i, poliçe PDF'i ve ödeme makbuzu.
 *
 * Ayrı dosyada çünkü `[action].ts` allowlist'i gibi düz bir passthrough
 * olamaz. IO'nun `/api/yazdir` ucu id'yi sorgu parametresinde alıyor ve
 * kimin teklifi olduğuna bakmıyor; id'ler de ardışık (17895290, 17895291…).
 * İstemciye serbest id bırakılsaydı sayaç çevirerek başkalarının teklif ve
 * poliçe PDF'leri indirilebilirdi.
 *
 * Bu yüzden zincirin her halkası doğrulanıyor:
 * çerezdeki oturum → o oturumun IO teklif kimlikleri → teklifin prim
 * listesinde gerçekten bulunan şirket satırı.
 *
 * Satın alma sonrası poliçe ve makbuz da aynı teklif satırı id'siyle
 * alınıyor (IO satın alma yanıtında yeni bir kimlik üretmiyor), o yüzden
 * üç belge tipi tek uçtan geçiyor.
 */

import { ioFetch, jsonResponse } from "../_shared/io";
import { oturumTeklifIdleri, rateCheck } from "../_shared/iolog";
import { clientIp, hashIp, resolveSession, withCookie } from "../_shared/session";
import { belgeGetir, type YazdirTipi } from "../_shared/yazdir";

export const config = { runtime: "edge" };

const MAX_BELGE_PER_HOUR = 120;

type BelgeTipi = "teklif" | "police" | "makbuz";

const YAZDIR_TIPI: Record<BelgeTipi, YazdirTipi> = {
  teklif: "t",
  // Satın alma sonrası poliçe de teklif PDF'iyle aynı tipten geliyor;
  // `p` üye poliçe listesi içindir ve bizim akışımızda karşılığı yok.
  police: "t",
  makbuz: "m",
};

/**
 * Belge çıkmadığında kullanıcıya gösterilecek metin. IO'nun kendi mesajı
 * ("Pdf oluşturulamadı.") müşteriye bir şey anlatmıyor ve arıza izlenimi
 * veriyor; oysa şirketlerin bir kısmı bu belgeyi hiç paylaşmıyor.
 */
const BULUNAMADI_MESAJI: Record<BelgeTipi, string> = {
  teklif: "Bu sigorta şirketi teklif PDF'i paylaşmıyor.",
  police: "Poliçe PDF'i şu anda alınamadı. Lütfen birazdan tekrar deneyin.",
  makbuz:
    "Ödeme makbuzu sigorta şirketinden henüz gelmedi. Poliçeniz geçerli; makbuzunuza ihtiyacınız olursa ekibimiz iletir.",
};

interface RequestBody {
  oturumId?: string;
  bransNo?: number;
  teklifId?: number;
  sirketTeklifId?: number;
  tip?: BelgeTipi;
}

/**
 * İstenen şirket satırı gerçekten bu teklifin sonucu mu.
 *
 * Prim listesi IO'da hazır duruyor; çağrı sigorta şirketlerine yeniden
 * gitmiyor, istemcinin zaten saniyede bir sorguladığı ucun aynısı.
 */
async function teklifSatiriGecerli(
  bransNo: number,
  teklifId: number,
  sirketTeklifId: number,
): Promise<boolean> {
  const result = await ioFetch<{ Sirketler?: { Id?: unknown }[] }>(
    `/api/teklif/primler`,
    { method: "POST", body: { BransNo: bransNo, TeklifId: teklifId } },
  );
  if (!result.ok) return false;
  const sirketler = result.data?.Sirketler;
  if (!Array.isArray(sirketler)) return false;
  return sirketler.some((sirket) => Number(sirket?.Id) === sirketTeklifId);
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

  const tip = body.tip;
  const bransNo = Number(body.bransNo);
  const teklifId = Number(body.teklifId);
  const sirketTeklifId = Number(body.sirketTeklifId);

  if (
    !tip ||
    !(tip in YAZDIR_TIPI) ||
    !body.oturumId ||
    !Number.isFinite(bransNo) ||
    !Number.isFinite(teklifId) ||
    !Number.isFinite(sirketTeklifId)
  ) {
    return withCookie(jsonResponse({ error: "Eksik belge bilgisi." }, 400), session);
  }

  const allowed = await rateCheck(ipHash, "belge", MAX_BELGE_PER_HOUR, 3600);
  if (!allowed) {
    return withCookie(
      jsonResponse({ error: "Çok fazla belge isteği. Lütfen biraz sonra deneyin." }, 429),
      session,
    );
  }

  const teklifIdleri = await oturumTeklifIdleri(body.oturumId, session.id);
  if (!teklifIdleri.includes(teklifId)) {
    return withCookie(
      jsonResponse({ error: "Belge bu oturuma ait değil." }, 403),
      session,
    );
  }

  if (!(await teklifSatiriGecerli(bransNo, teklifId, sirketTeklifId))) {
    return withCookie(
      jsonResponse({ error: "Belge bu oturuma ait değil." }, 403),
      session,
    );
  }

  const sonuc = await belgeGetir(sirketTeklifId, YAZDIR_TIPI[tip]);
  if (!sonuc.ok) {
    // 404: belge yok. Hata değil, o yüzden istemci bunu "tekrar dene"
    // yerine açıklayıcı bir not olarak gösteriyor.
    return withCookie(jsonResponse({ error: BULUNAMADI_MESAJI[tip] }, 404), session);
  }

  return withCookie(jsonResponse({ url: sonuc.url }), session);
}
