/**
 * 3D Secure sonrası poliçe takibi: POST /api/io/ucd-durum.
 *
 * Banka doğrulamasında poliçe IO tarafında kesiliyor ve bize bildirim
 * gelmiyor. İstemci banka sayfasını gösterirken bu ucu aralıklarla çağırır;
 * uç IO'nun poliçe listesinde oturumdaki sigortalının bugün aynı şirket ve
 * branşta kesilmiş poliçesini arar.
 *
 * Poliçe listesi acentenin tüm poliçelerini döndürdüğü için arama yalnızca
 * oturum kaydındaki kimlik numarasıyla yapılıyor ve uç, bu oturumda 3D'ye
 * yönlendirilmiş bir satın alma yoksa hiç çalışmıyor; aksi hâlde başkasının
 * poliçesini sorgulamak için kullanılabilirdi.
 */

import { ioFetch, jsonResponse } from "../_shared/io";
import {
  dbRequest,
  oturumTeklifIdleri,
  rateCheck,
  recordSatinAlma,
  updateOturum,
} from "../_shared/iolog";
import { resolveSession, withCookie } from "../_shared/session";
import { UCD_BEKLIYOR } from "../_shared/ucd";
import { belgeUrl } from "../_shared/yazdir";
import { normalizeSirketKodu, sirketAdi } from "../../src/lib/io/sirketler";

export const config = { runtime: "edge" };

/** İstemci 5 saniyede bir soruyor; banka ekranında 10 dakika kalınabilir. */
const MAX_SORGU_PER_HOUR = 400;
const BEKLEME_PENCERESI_MS = 30 * 60 * 1000;

interface RequestBody {
  oturumId?: string;
  bransNo?: number;
  teklifId?: number;
  sirketTeklifId?: number;
  sirketKodu?: string | number;
}

interface IoPolice {
  PolId?: number;
  PoliceNo?: string;
  SirketKodu?: string | number;
  BransNo?: number | string;
  KimlikNo?: string;
  Plaka?: string;
  TanzimTarihi?: string;
  DisPolice?: boolean;
}

interface BekleyenKayit {
  teklif_no: string | null;
  prim: number | null;
  taksit: string | null;
  taksit_kodu: string | null;
  kart_sahibi: string | null;
  kart_son4: string | null;
  created_at: string;
}

function istanbulGunu(tarih: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(tarih);
}

function plakaNormal(plaka: unknown): string {
  return String(plaka ?? "").replace(/\s/g, "").toUpperCase();
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Yöntem desteklenmiyor." }, 405);
  }

  const session = await resolveSession(request);
  const yanit = (body: unknown, status = 200) =>
    withCookie(jsonResponse(body, status), session);

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return yanit({ error: "Geçersiz istek." }, 400);
  }

  const bransNo = Number(body.bransNo);
  const teklifId = Number(body.teklifId);
  const sirketTeklifId = Number(body.sirketTeklifId);
  const sirketKodu = normalizeSirketKodu(body.sirketKodu);
  if (!body.oturumId || !Number.isFinite(bransNo) || !Number.isFinite(teklifId) || !sirketKodu) {
    return yanit({ error: "Eksik bilgi." }, 400);
  }

  const izinli = await rateCheck(`ucd:${session.id}`, "ucd_durum", MAX_SORGU_PER_HOUR, 3600);
  if (!izinli) return yanit({ error: "Çok fazla istek." }, 429);

  const teklifIdleri = await oturumTeklifIdleri(body.oturumId, session.id);
  if (!teklifIdleri.includes(teklifId)) {
    return yanit({ error: "Bu teklif bu oturuma ait değil." }, 403);
  }

  const oturumId = encodeURIComponent(body.oturumId);
  const [oturum] =
    (await dbRequest<{ id: string; tckn: string | null; vergi_no: string | null; plate: string | null }[]>(
      `teklif_oturumlari?id=eq.${oturumId}&session_id=eq.${encodeURIComponent(session.id)}` +
        `&select=id,tckn,vergi_no,plate&limit=1`,
      { method: "GET" },
    )) ?? [];
  if (!oturum) return yanit({ error: "Teklif oturumu bulunamadı." }, 404);

  const sonrasi = new Date(Date.now() - BEKLEME_PENCERESI_MS).toISOString();
  const [bekleyen] =
    (await dbRequest<BekleyenKayit[]>(
      `satin_almalar?oturum_id=eq.${oturumId}&sirket_kodu=eq.${encodeURIComponent(sirketKodu)}` +
        `&hata_mesaji=eq.${encodeURIComponent(UCD_BEKLIYOR)}&created_at=gte.${encodeURIComponent(sonrasi)}` +
        `&select=teklif_no,prim,taksit,taksit_kodu,kart_sahibi,kart_son4,created_at` +
        `&order=created_at.desc&limit=1`,
      { method: "GET" },
    )) ?? [];
  if (!bekleyen) return yanit({ error: "Bekleyen 3D ödeme bulunamadı." }, 404);

  const kimlik = String(oturum.tckn ?? oturum.vergi_no ?? "").replace(/\D/g, "");
  if (!kimlik) return yanit({ policeKesildi: false, bekliyor: true });

  const result = await ioFetch<IoPolice[]>(`/api/uye/policeler`, {
    method: "POST",
    body: { Arama: kimlik, Sayfa: 0 },
  });
  if (!result.ok || !Array.isArray(result.data)) {
    return yanit({ policeKesildi: false, bekliyor: true });
  }

  const ilkGun = istanbulGunu(new Date(bekleyen.created_at));
  const plaka = plakaNormal(oturum.plate);
  const police = result.data
    .filter(
      (p) =>
        !p.DisPolice &&
        p.PoliceNo &&
        String(p.KimlikNo ?? "") === kimlik &&
        normalizeSirketKodu(p.SirketKodu) === sirketKodu &&
        Number(p.BransNo) === bransNo &&
        String(p.TanzimTarihi ?? "").slice(0, 10) >= ilkGun &&
        (!plaka || !p.Plaka || plakaNormal(p.Plaka) === plaka),
    )
    .sort((a, b) => Number(b.PolId ?? 0) - Number(a.PolId ?? 0))[0];

  if (!police) return yanit({ policeKesildi: false, bekliyor: true });

  const policeNo = String(police.PoliceNo);
  const kayitli = await dbRequest<{ police_pdf_url: string | null; makbuz_pdf_url: string | null }[]>(
    `satin_almalar?oturum_id=eq.${oturumId}&police_no=eq.${encodeURIComponent(policeNo)}` +
      `&status=eq.basarili&select=police_pdf_url,makbuz_pdf_url&limit=1`,
    { method: "GET" },
  );
  if (kayitli?.[0]) {
    return yanit({
      policeKesildi: true,
      policeNo,
      policePdfUrl: kayitli[0].police_pdf_url,
      makbuzPdfUrl: kayitli[0].makbuz_pdf_url,
      kartSon4: bekleyen.kart_son4 ?? "",
    });
  }

  const polId = Number(police.PolId);
  const [policePdf, makbuzPdf] = await Promise.all([
    (Number.isFinite(polId) ? belgeUrl(polId, "p") : Promise.resolve(null)).then(
      (url) => url ?? (Number.isFinite(sirketTeklifId) ? belgeUrl(sirketTeklifId, "t") : null),
    ),
    Number.isFinite(sirketTeklifId) ? belgeUrl(sirketTeklifId, "m") : Promise.resolve(null),
  ]);

  await recordSatinAlma({
    oturum_id: oturum.id,
    brans_no: bransNo,
    sirket_kodu: sirketKodu,
    sirket_adi: sirketAdi(sirketKodu),
    teklif_no: bekleyen.teklif_no,
    police_no: policeNo,
    prim: bekleyen.prim,
    taksit: bekleyen.taksit,
    taksit_kodu: bekleyen.taksit_kodu,
    kart_sahibi: bekleyen.kart_sahibi,
    kart_son4: bekleyen.kart_son4,
    uc_d_secure: true,
    police_pdf_url: policePdf,
    makbuz_pdf_url: makbuzPdf,
    io_response: { ucDSecure: "tamamlandi", polId: Number.isFinite(polId) ? polId : null },
    status: "basarili",
  });
  await updateOturum(oturum.id, { status: "satin_alindi" });

  return yanit({
    policeKesildi: true,
    policeNo,
    policePdfUrl: policePdf,
    makbuzPdfUrl: makbuzPdf,
    kartSon4: bekleyen.kart_son4 ?? "",
  });
}
