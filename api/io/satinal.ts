/**
 * Satın alma: POST /api/teklif/satinal.
 *
 * Kart verisi yalnızca bu dosyadan geçer ve hiçbir yere yazılmaz:
 * - Bu handler'da log alınmaz; hata durumunda bile istek gövdesi basılmaz.
 * - Veritabanına yalnızca kart sahibinin adı ve son 4 hane gider
 *   (`api/_shared/iolog.ts` içindeki stripCardFields IO yanıtını da temizler).
 *
 * 3D Secure: Sigorta Gross tarafında bozuk olduğu ve partner panelinde de
 * kapalı geçildiği için varsayılan kapalı. Düzeltildiğinde IO_3DS_ENABLED
 * ile açılabilir.
 *
 * Daini Mürtehin: partner ödeme ekranında var ama API dökümantasyonunda
 * karşılığı yok. Self serviste her zaman "Yok" olduğu için alan hiç
 * gönderilmiyor; IO tarafı zorunlu tutarsa burada eklenmesi gerekir.
 */

import {
  errorResponse,
  io3dsEnabled,
  ioFetch,
  ioKanal,
  jsonResponse,
} from "../_shared/io";
import { findOturum, rateCheck, recordSatinAlma, updateOturum } from "../_shared/iolog";
import { clientIp, hashIp, resolveSession, withCookie } from "../_shared/session";
import { normalizeSirketKodu, sirketAdi } from "../../src/lib/io/sirketler";

export const config = { runtime: "edge" };

const MAX_SATINAL_PER_HOUR = 10;

interface SeciliTeklif {
  Id?: number;
  SirketKodu?: string | number;
  AcenteKodu?: string;
  TeklifNo?: string;
  isWebServis?: boolean;
  Prim?: number;
  Taksit?: string;
  TaksitKodu?: string;
}

interface Kart {
  KartSahibi?: string;
  KimlikNo?: string;
  KartNo?: string;
  SonKullanimAy?: string | number;
  SonKullanimYil?: string | number;
  Cvv2?: string;
}

interface RequestBody {
  oturumId?: string;
  bransNo?: number;
  teklifId?: number;
  teklif?: SeciliTeklif;
  kart?: Kart;
}

function digitsOnly(value: unknown): string {
  return String(value ?? "").replace(/\D/g, "");
}

/** Kart doğrulaması; hatalı veriyi IO'ya göndermeden kesiyoruz. */
function validateKart(kart: Kart): { ok: true } | { ok: false; message: string } {
  const kartNo = digitsOnly(kart.KartNo);
  if (kartNo.length < 15 || kartNo.length > 19) {
    return { ok: false, message: "Kart numarası geçersiz." };
  }
  const cvv = digitsOnly(kart.Cvv2);
  if (cvv.length < 3 || cvv.length > 4) {
    return { ok: false, message: "Güvenlik kodu geçersiz." };
  }
  const ay = Number(digitsOnly(kart.SonKullanimAy));
  if (!Number.isFinite(ay) || ay < 1 || ay > 12) {
    return { ok: false, message: "Son kullanma ayı geçersiz." };
  }
  const yil = Number(digitsOnly(kart.SonKullanimYil));
  const currentYear = new Date().getUTCFullYear();
  if (!Number.isFinite(yil) || yil < currentYear || yil > currentYear + 25) {
    return { ok: false, message: "Son kullanma yılı geçersiz." };
  }
  if (!String(kart.KartSahibi ?? "").trim()) {
    return { ok: false, message: "Kart sahibi adı zorunlu." };
  }
  return { ok: true };
}

/** PDF adresi yanıtta Url / pdf / downloadUrl olarak gelebiliyor. */
function readPdfUrl(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  for (const key of ["Url", "url", "pdf", "Pdf", "downloadUrl"]) {
    const value = record[key];
    if (typeof value === "string" && value.startsWith("http")) return value;
  }
  return null;
}

async function fetchPdf(id: number, tipi: "t" | "m"): Promise<string | null> {
  const result = await ioFetch(`/api/yazdir?id=${id}&tipi=${tipi}`, {
    method: "GET",
  });
  return result.ok ? readPdfUrl(result.data) : null;
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

  const { oturumId, teklif, kart } = body;
  const bransNo = Number(body.bransNo);
  const teklifId = Number(body.teklifId);

  if (!oturumId || !teklif || !kart || !Number.isFinite(bransNo) || !Number.isFinite(teklifId)) {
    return withCookie(jsonResponse({ error: "Eksik ödeme bilgisi." }, 400), session);
  }

  const oturum = await findOturum(oturumId, session.id);
  if (!oturum) {
    return withCookie(
      jsonResponse({ error: "Teklif oturumu bulunamadı. Lütfen yeniden teklif alın." }, 404),
      session,
    );
  }

  const allowed = await rateCheck(ipHash, "satinal", MAX_SATINAL_PER_HOUR, 3600);
  if (!allowed) {
    return withCookie(
      jsonResponse({ error: "Çok fazla ödeme denemesi. Lütfen bizi arayın." }, 429),
      session,
    );
  }

  const kartCheck = validateKart(kart);
  if (!kartCheck.ok) {
    return withCookie(jsonResponse({ error: kartCheck.message }, 400), session);
  }

  const kartNo = digitsOnly(kart.KartNo);
  const kartSon4 = kartNo.slice(-4);
  const sirketKodu = normalizeSirketKodu(teklif.SirketKodu);

  const result = await ioFetch(`/api/teklif/satinal`, {
    method: "POST",
    timeoutMs: 60_000,
    body: {
      TeklifId: teklifId,
      BransNo: bransNo,
      Kanal: ioKanal(),
      Police: {
        Id: teklif.Id,
        SirketKodu: sirketKodu,
        AcenteKodu: teklif.AcenteKodu ?? "",
        TeklifNo: teklif.TeklifNo ?? "",
        isWebServis: teklif.isWebServis ?? true,
        SanalPos: true,
        SatinAl: true,
        Us3D: io3dsEnabled(),
        Prim: teklif.Prim,
        Taksit: teklif.Taksit ?? "Peşin",
        TaksitKodu: teklif.TaksitKodu ?? "1",
        KartSahibi: String(kart.KartSahibi ?? "").trim(),
        KimlikNo: digitsOnly(kart.KimlikNo),
        KartNo: kartNo,
        SonKullanimAy: digitsOnly(kart.SonKullanimAy).padStart(2, "0"),
        SonKullanimYil: digitsOnly(kart.SonKullanimYil),
        Cvv2: digitsOnly(kart.Cvv2),
      },
    },
  });

  if (!result.ok) {
    await recordSatinAlma({
      oturum_id: oturum.id,
      brans_no: bransNo,
      sirket_kodu: sirketKodu,
      sirket_adi: sirketAdi(sirketKodu),
      teklif_no: teklif.TeklifNo ?? null,
      prim: teklif.Prim ?? null,
      taksit: teklif.Taksit ?? null,
      taksit_kodu: teklif.TaksitKodu ?? null,
      kart_sahibi: String(kart.KartSahibi ?? "").trim(),
      kart_son4: kartSon4,
      uc_d_secure: io3dsEnabled(),
      status: "basarisiz",
      hata_mesaji: result.error.message,
    });
    return withCookie(errorResponse(result.error), session);
  }

  const payload = result.data as Record<string, unknown>;
  const policeKesildi = payload?.PoliceKesildi === true;
  const police = (payload?.Police ?? {}) as Record<string, unknown>;
  const policeNo =
    typeof police.PoliceNo === "string" ? police.PoliceNo : null;

  if (!policeKesildi) {
    await recordSatinAlma({
      oturum_id: oturum.id,
      brans_no: bransNo,
      sirket_kodu: sirketKodu,
      sirket_adi: sirketAdi(sirketKodu),
      teklif_no: teklif.TeklifNo ?? null,
      prim: teklif.Prim ?? null,
      kart_sahibi: String(kart.KartSahibi ?? "").trim(),
      kart_son4: kartSon4,
      uc_d_secure: io3dsEnabled(),
      io_response: payload,
      status: "basarisiz",
      hata_mesaji: "Poliçe kesilemedi.",
    });
    return withCookie(
      jsonResponse(
        { error: "Ödeme tamamlanamadı. Kart bilgilerinizi kontrol edip tekrar deneyin." },
        422,
      ),
      session,
    );
  }

  // Poliçe ve makbuz PDF'leri satın alma sonrası TeklifDetay.Id ile alınır.
  const pdfId = Number(teklif.Id);
  const [policePdf, makbuzPdf] = Number.isFinite(pdfId)
    ? await Promise.all([fetchPdf(pdfId, "t"), fetchPdf(pdfId, "m")])
    : [null, null];

  await recordSatinAlma({
    oturum_id: oturum.id,
    brans_no: bransNo,
    sirket_kodu: sirketKodu,
    sirket_adi: sirketAdi(sirketKodu),
    teklif_no: teklif.TeklifNo ?? null,
    police_no: policeNo,
    prim: teklif.Prim ?? null,
    taksit: teklif.Taksit ?? null,
    taksit_kodu: teklif.TaksitKodu ?? null,
    kart_sahibi: String(kart.KartSahibi ?? "").trim(),
    kart_son4: kartSon4,
    uc_d_secure: io3dsEnabled(),
    police_pdf_url: policePdf,
    makbuz_pdf_url: makbuzPdf,
    io_response: payload,
    status: "basarili",
  });

  await updateOturum(oturum.id, { status: "satin_alindi" });

  return withCookie(
    jsonResponse({
      policeKesildi: true,
      policeNo,
      policePdfUrl: policePdf,
      makbuzPdfUrl: makbuzPdf,
      kartSon4,
    }),
    session,
  );
}
