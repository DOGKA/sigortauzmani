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
  ioIcHata,
  ioKanal,
  jsonResponse,
} from "../_shared/io";
import { findOturum, rateCheck, recordSatinAlma, updateOturum } from "../_shared/iolog";
import { clientIp, hashIp, resolveSession, withCookie } from "../_shared/session";
import { belgeGetir } from "../_shared/yazdir";
import { satinAlinabilirSirket } from "../../src/lib/io/satinAlFiltre";
import { normalizeSirketKodu, sirketAdi } from "../../src/lib/io/sirketler";

export const config = { runtime: "edge" };

/**
 * Ödeme denemesi iki sayaçla sınırlı:
 *
 * - Aynı çerez oturumu + aynı teklif oturumu: kart tarama ve aynı kişide
 *   ısrarlı deneme burada kesiliyor. Yanlış CVV, yanlış tarih, prim değişti
 *   onayı (ikinci bir çağrı), 3D tekrarı ve aynı listeden ikinci şirketi
 *   deneme dürüst bir müşteride üst üste gelebiliyor; on bunların hepsini
 *   karşılar, kart tarayan botu yine keser.
 * - IP: ekip aynı ofis bağlantısından art arda farklı müşterilere poliçe
 *   kesebildiği için kişi değil hacim ölçüsü; bot denemesini yine kapatır.
 */
const MAX_SATINAL_PER_OTURUM = 10;
const OTURUM_WINDOW_SECONDS = 15 * 60;
const MAX_SATINAL_PER_HOUR = 100;

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
  /**
   * Şirket primi güncellediğinde ziyaretçinin açıkça onayladığı tutar.
   * Arayüz yeni tutarı gösterip onay aldıktan sonra gönderiyor; sunucu
   * yenilenen primi bununla karşılaştırıyor ki onaylanmamış bir tutar
   * çekilmesin.
   */
  onaylananPrim?: number;
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

/**
 * Satın alma öncesi seçilen teklifi yenile.
 *
 * `TeklifNo`, şirketin o teklif için o an geçerli olan numarası. Teklif bir
 * gün önce çalışıldıysa numara eskiyor ve satın almada şirket "Şirket şu an
 * Satın Alma için uygun değildir." (HataKodu 22) diyor; ödemenin kart
 * yüzünden değil bu yüzden döndüğü canlı API'de ölçüldü. Partner CRM'i de
 * onay adımında teklifi yeniliyor (dökümandaki "Onay adımında teklif
 * detayını yenile" adımı) — eksik olan tek adım buydu.
 *
 * `teklifguncelle` yalnızca gönderilen satırı yeniliyor: aynı gün içinde
 * tanzim tarihi geçmediği için numara ve prim aynı kalıyor, tanzim tarihi
 * geçmişse şirket yeni prim verebiliyor. Bu yüzden dönen prim çağırana
 * bildiriliyor, sessizce farklı tutar çekilmiyor.
 *
 * Yanıttaki `SatinAl` kritik: `primler` eski teklifin satırını `SatinAl:
 * true` göstermeye devam ederken yenileme aynı satır için `false` diyor
 * (24 gün önceki teklifte canlı API'de ölçüldü). Yani şirketin ödemeyi
 * reddedeceği kart çekilmeden önce buradan anlaşılıyor.
 *
 * Yenileme isteği başarısız olursa satın alma engellenmiyor: eldeki
 * numarayla denenmesi, ödemeyi hiç denememekten iyi.
 */
async function teklifiYenile(
  bransNo: number,
  teklifId: number,
  teklif: SeciliTeklif,
  sirketKodu: string,
): Promise<{
  teklifNo: string | null;
  prim: number | null;
  /** Şirket bu satırdan satın almaya izin veriyor mu; bilinmiyorsa null. */
  satinAlinabilir: boolean | null;
  hata: string | null;
}> {
  const satir = {
    Id: teklif.Id,
    SirketKodu: sirketKodu,
    TeklifNo: teklif.TeklifNo ?? "",
    Prim: teklif.Prim,
    TaksitKodu: teklif.TaksitKodu ?? "1",
    Taksit: teklif.Taksit ?? "Peşin",
    AcenteKodu: teklif.AcenteKodu ?? "",
  };

  // Teminat listesi güncellemeye aynen geri gönderiliyor; boş gitmesi
  // teminatları sıfırlamıyor ama şirket bazında primi değiştirebiliyor.
  const detay = await ioFetch(`/api/teklif/teklifdetay`, {
    method: "POST",
    body: { BransNo: bransNo, TeklifId: teklifId, TeklifDetay: satir },
  });
  const teminat = detay.ok && Array.isArray(detay.data) ? detay.data : [];

  const guncel = await ioFetch(`/api/teklif/teklifguncelle`, {
    method: "POST",
    timeoutMs: 60_000,
    body: {
      BransNo: bransNo,
      TeklifId: teklifId,
      Guncelle: true,
      Sirketler: [],
      TeklifDetay: { ...satir, Teminat: teminat },
      Police: {
        SirketKodu: sirketKodu,
        TaksitKodu: satir.TaksitKodu,
        AcenteKodu: satir.AcenteKodu,
        TeklifNo: satir.TeklifNo,
      },
    },
  });

  if (!guncel.ok) {
    return { teklifNo: null, prim: null, satinAlinabilir: null, hata: null };
  }

  // Yanıt, güncellenmiş teklif satırının kendisi.
  const satirYeni = (guncel.data ?? {}) as Record<string, unknown>;
  const teklifNo =
    typeof satirYeni.TeklifNo === "string" && satirYeni.TeklifNo.trim()
      ? satirYeni.TeklifNo.trim()
      : null;
  const prim = Number(satirYeni.Prim);
  const satirHata =
    typeof satirYeni.Hata === "string" && satirYeni.Hata.trim()
      ? satirYeni.Hata.trim()
      : null;

  return {
    teklifNo,
    prim: Number.isFinite(prim) && prim > 0 ? prim : null,
    satinAlinabilir:
      typeof satirYeni.SatinAl === "boolean" ? satirYeni.SatinAl : null,
    hata: satirHata,
  };
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

  // Dar sayaç (aynı kişi/teklif) önce; dolmuşsa IP sayacı boşuna artmaz.
  // Teklif oturumu zaten çerezle doğrulandı, o yüzden anahtar kimlik
  // numarası değil oturum kimliği.
  const oturumAllowed = await rateCheck(
    `satinal:${session.id}:${oturum.id}`,
    "satinal_oturum",
    MAX_SATINAL_PER_OTURUM,
    OTURUM_WINDOW_SECONDS,
  );
  if (!oturumAllowed) {
    return withCookie(
      jsonResponse(
        {
          error:
            "Bu teklif için kısa sürede çok fazla ödeme denemesi yapıldı. Lütfen birkaç dakika sonra tekrar deneyin ya da bizi arayın.",
        },
        429,
      ),
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

  // Kısa süreli trafikte izin listesi farklı. Bayrak istemciden değil oturum
  // kaydındaki üründen okunuyor; aksi hâlde istemci listeyi seçebilirdi.
  const kisaSureli = oturum.product_slug === "kisa-sureli-trafik";

  if (!satinAlinabilirSirket(bransNo, sirketKodu, kisaSureli)) {
    return withCookie(
      jsonResponse(
        {
          error:
            "Bu teklif anında satın alınamıyor. Ekibimiz sizinle iletişime geçecek.",
        },
        403,
      ),
      session,
    );
  }

  const yenilenen = await teklifiYenile(bransNo, teklifId, teklif, sirketKodu);
  const gosterilenPrim = Number(teklif.Prim);
  const yeniPrim = yenilenen.prim;

  // Şirket satın almayı kapatmışsa kart hiç çekilmiyor. Eskiden bu ancak
  // ödeme denendikten sonra HataKodu 22 ile anlaşılıyor, ziyaretçiye de
  // "kart bilgilerinizi kontrol edin" deniyordu.
  if (yenilenen.satinAlinabilir === false) {
    const mesaj =
      yenilenen.hata ??
      "Sigorta şirketi bu teklif üzerinden satın almayı kapattı. Teklifin tanzim tarihi geçtiği için yeni teklif çalıştırılması gerekiyor.";
    await recordSatinAlma({
      oturum_id: oturum.id,
      brans_no: bransNo,
      sirket_kodu: sirketKodu,
      sirket_adi: sirketAdi(sirketKodu),
      teklif_no: yenilenen.teklifNo ?? teklif.TeklifNo ?? null,
      prim: teklif.Prim ?? null,
      kart_sahibi: String(kart.KartSahibi ?? "").trim(),
      kart_son4: kartSon4,
      uc_d_secure: io3dsEnabled(),
      io_response: { yenileme: "SatinAl:false", hata: yenilenen.hata },
      status: "basarisiz",
      hata_mesaji: mesaj,
    });
    return withCookie(
      jsonResponse({ error: mesaj, sirketReddi: true }, 422),
      session,
    );
  }

  // Tanzim tarihi geçtiği için şirket yeni prim verdiyse kart çekilmiyor:
  // ziyaretçi gördüğü tutardan farklı bir tutarı onaylamamış olur. Yeni
  // tutar arayüzde gösterilip onaylandığında `onaylananPrim` ile geri
  // geliyor ve karşılaştırma ona göre yapılıyor.
  const onaylanan = Number(body.onaylananPrim);
  const beklenenPrim =
    Number.isFinite(onaylanan) && onaylanan > 0 ? onaylanan : gosterilenPrim;

  if (
    yeniPrim !== null &&
    Number.isFinite(beklenenPrim) &&
    Math.abs(yeniPrim - beklenenPrim) > 0.01
  ) {
    return withCookie(
      jsonResponse(
        {
          error:
            "Sigorta şirketi bu teklif için primi güncelledi. Yeni tutarı onaylayın.",
          primDegisti: true,
          eskiPrim: beklenenPrim,
          yeniPrim,
        },
        409,
      ),
      session,
    );
  }

  const teklifNo = yenilenen.teklifNo ?? teklif.TeklifNo ?? "";
  // Yenileme prim döndürdüyse geçerli tutar o: buraya gelindiğinde tutar
  // ya değişmemiştir ya da ziyaretçi tarafından onaylanmıştır.
  const odenecekPrim = yeniPrim ?? teklif.Prim;

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
        TeklifNo: teklifNo,
        isWebServis: teklif.isWebServis ?? true,
        SanalPos: true,
        SatinAl: true,
        Us3D: io3dsEnabled(),
        Prim: odenecekPrim,
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
      teklif_no: teklifNo || null,
      prim: odenecekPrim ?? null,
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
    // Gerçek sebep kökte değil iç içe `Hata` nesnesinde geliyor; eski bir
    // teklifle satın almaya gidildiğinde şirket "Şirket şu an Satın Alma için
    // uygun değildir." (HataKodu 22) döndürüyor. Bunu göstermek zorunlu:
    // yerine kart uyarısı basmak müşteriyi doğru kartı tekrar tekrar
    // denemeye itiyordu.
    const icHata = ioIcHata(payload);
    const sirketReddi = icHata.kod === 22 || /uygun de[ğg]il/i.test(icHata.mesaj ?? "");

    await recordSatinAlma({
      oturum_id: oturum.id,
      brans_no: bransNo,
      sirket_kodu: sirketKodu,
      sirket_adi: sirketAdi(sirketKodu),
      teklif_no: teklifNo || null,
      prim: odenecekPrim ?? null,
      kart_sahibi: String(kart.KartSahibi ?? "").trim(),
      kart_son4: kartSon4,
      uc_d_secure: io3dsEnabled(),
      io_response: payload,
      status: "basarisiz",
      hata_mesaji: icHata.mesaj ?? "Poliçe kesilemedi.",
    });
    return withCookie(
      jsonResponse(
        {
          error:
            icHata.mesaj ??
            "Ödeme tamamlanamadı. Kart bilgilerinizi kontrol edip tekrar deneyin.",
          code: icHata.kod,
          // Kart sorunu değil: bu teklif üzerinden satın alma kapalı. Arayüz
          // "tekrar dene" yerine talep açma yolunu gösteriyor.
          sirketReddi,
        },
        422,
      ),
      session,
    );
  }

  // Poliçe ve makbuz PDF'leri seçilen teklif satırının Id'siyle alınır;
  // IO satın almadan sonra yeni bir belge kimliği üretmiyor.
  //
  // Makbuz her şirkette çıkmıyor ("Pdf Yazdırılamadı.") ve çıkacak olanlarda
  // da poliçeden biraz sonra hazırlanabiliyor. Bu yüzden burada dönen null
  // satın almayı başarısız yapmıyor; sonuç ekranı makbuzu talep üzerine
  // yeniden istiyor (`api/io/belge.ts`).
  const pdfId = Number(teklif.Id);
  const [policeBelgesi, makbuzBelgesi] = Number.isFinite(pdfId)
    ? await Promise.all([belgeGetir(pdfId, "t"), belgeGetir(pdfId, "m")])
    : [null, null];

  const policePdf = policeBelgesi?.ok ? policeBelgesi.url : null;
  const makbuzPdf = makbuzBelgesi?.ok ? makbuzBelgesi.url : null;

  await recordSatinAlma({
    oturum_id: oturum.id,
    brans_no: bransNo,
    sirket_kodu: sirketKodu,
    sirket_adi: sirketAdi(sirketKodu),
    teklif_no: teklifNo || null,
    police_no: policeNo,
    prim: odenecekPrim ?? null,
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
