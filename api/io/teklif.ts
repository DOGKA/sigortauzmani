/**
 * Teklif oluşturma: POST /api/teklif.
 *
 * Ayrı dosyada çünkü tek bir passthrough değil — oturum kaydını açar,
 * Kanal'ı sunucudan enjekte eder ve dönen TeklifId'yi saklar. Sonraki
 * adımlar (primler, satın alma) bu oturum üzerinden doğrulanır.
 *
 * Trafik akışında aynı araç için Kasko da hazırlanabildiği (CRM dökümanı
 * §2.8) için birden fazla branş tek istekte gönderilebilir; her biri IO'da
 * ayrı bir teklif oluşturur.
 *
 * Her istek IO'da yeni teklif açar (bkz. `ioTeklifKanal`): eski teklifle
 * devam yolu yok, fiyatlar her seferinde güncel gelir. Yürürlükte poliçesi
 * olan kişide de çalışır; IO vadeyi poliçe bitişine çeker. Yalnızca vade
 * IO'nun yenileme penceresinin dışındaysa (örn. bitişe 57 gün varken)
 * HataKodu 11 "… vade için teklif çalışıyorsunuz" ile reddeder; o mesaj
 * olduğu gibi istemciye döner. Bu bizim koyduğumuz bir engel değil.
 *
 * Tek istisna aynı ziyaretçinin aynı girdiyi kısa sürede yeniden
 * göndermesi: o zaman IO'ya gidilmez, az önce açılan teklif geri verilir
 * (bkz. `TEKRAR_PENCERESI_MS`). Bunun dışında oturum başına kısa pencereli
 * bir sayaç düğme spam'ini kesiyor.
 */

import {
  errorResponse,
  ioFetch,
  ioIcHata,
  ioTeklifKanal,
  jsonResponse,
} from "../_shared/io";
import {
  createOturum,
  globalRateCheck,
  rateCheck,
  sonTeklifTekrari,
  updateOturum,
} from "../_shared/iolog";
import { clientIp, hashIp, resolveSession, withCookie } from "../_shared/session";
import { readEnv } from "../_shared/supabase";

export const config = { runtime: "edge" };

/**
 * IP başına saatlik tavan. Ofis tek bağlantıdan saatte 200 müşteriye kadar
 * çalışabilsin diye ziyaretçi değil hacim ölçüsü; kişi bazlı spam'i
 * aşağıdaki dar sayaç kesiyor. mernis / tramer / ön kontrol limitleri
 * (`[action].ts`, `kayitli-teklif.ts`) bununla aynı tutulmalı, yoksa müşteri
 * teklife gelemeden sorgu adımında takılır.
 */
const MAX_TEKLIF_PER_HOUR = 200;
const MAX_BRANS_PER_REQUEST = 2;

/**
 * Kısa pencerede iki ayrı sayaç:
 *
 * - Aynı çerez oturumu + aynı kişi/araç: bir alanı değiştirip yeniden
 *   çalıştırmak (IMM tutarı, kasko ekle/çıkar…) IO'da her seferinde yeni
 *   teklif açıyor. Anahtar kimlik + plaka olduğu için plakasız branşlar
 *   (DASK, sağlık, seyahat) aynı kişide tek sayaçta toplanıyor; müşteri
 *   trafik + sağlık + DASK'ı art arda birkaç varyantla çalıştırabilsin diye
 *   on. Onun üstü karşılaştırma değil spam.
 * - Aynı çerez oturumu, toplam: farklı müşterilere art arda çalışan ekip için
 *   geniş bırakıldı. IP tavanı saatte 200 iken tek bilgisayardan on dakikada
 *   33 gerekir; 40 bunun üstünde kalır ama botu yine keser.
 *
 * Aynı girdinin birebir tekrarı iki sayaca da girmiyor (bkz.
 * `TEKRAR_PENCERESI_MS`); geri-ileri gezinme kota yemiyor.
 */
const MAX_TEKLIF_PER_KISI = 10;
const MAX_TEKLIF_PER_SESSION = 40;
const SESSION_WINDOW_SECONDS = 10 * 60;

/**
 * Aynı oturum + aynı girdi bu süre içinde yeniden gelirse IO'ya gidilmez,
 * az önce açılan teklif geri verilir. Fiyat ekranından geri gelip hiçbir şeyi
 * değiştirmeden tekrar "Teklif Çalış"a basmanın karşılığı bu.
 */
const TEKRAR_PENCERESI_MS = 30 * 60 * 1000;

async function sha256Kisa(metin: string): Promise<string> {
  const ozet = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(metin),
  );
  return Array.from(new Uint8Array(ozet), (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

/** Girdinin oturum kaydına yazılan kısa özeti; kişisel veri taşımaz. */
function talepOzeti(talepler: TeklifTalep[]): Promise<string> {
  return sha256Kisa(JSON.stringify(talepler));
}

/**
 * Kişi bazlı sayacın anahtarı: oturum + kimlik + plaka. Kimlik numarası
 * sayaç tablosuna çıplak yazılmasın diye özetleniyor; oturum kimliği de
 * karışıma girdiği için iki ziyaretçinin aynı müşteriyi çalıştırması
 * birbirinin kotasını etkilemiyor.
 */
function kisiAnahtari(sessionId: string, kisi: RequestBody["kisi"]): Promise<string> {
  const kimlik = (kisi?.tckn ?? kisi?.vergiNo ?? "").replace(/\D/g, "");
  const plaka = (kisi?.plate ?? "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return sha256Kisa(`kisi:${sessionId}:${kimlik}:${plaka}`);
}

/**
 * Tüm ziyaretçiler için ortak saatlik tavan. Beklenen iş hacminin çok
 * üstünde bırakıldı; amaç normal trafiği kısmak değil, bot ya da beklenmeyen
 * bir sıçramanın IO'yu boğmasını engellemek. Env'den ayarlanabilir ki
 * kampanya dönemlerinde deploy gerekmeden yükseltilebilsin. IP tavanı
 * (200) ile aynı olsaydı ofis tek başına siteyi doldururdu; o yüzden iki
 * katı.
 */
function maxTeklifGlobalPerHour(): number {
  const parsed = Number(readEnv("IO_MAX_TEKLIF_GLOBAL_PER_HOUR"));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 400;
}

interface TeklifTalep {
  bransNo: number;
  payload: Record<string, unknown>;
}

/** `teklif_oturumlari.entity_type` check kısıtıyla birebir aynı olmalı. */
const KISI_TIPLERI = ["sahis", "yabanci", "sirket"] as const;
type KisiTipi = (typeof KISI_TIPLERI)[number];

/** Gövde istemciden geliyor; kısıta uymayan değer insert'i düşürmesin. */
function kisiTipi(value: unknown): KisiTipi {
  return KISI_TIPLERI.includes(value as KisiTipi) ? (value as KisiTipi) : "sahis";
}

/**
 * Panelde gösterilecek etiketli girdi özeti. Kodları etikete çeviren
 * tablolar istemcide olduğu için özet orada üretiliyor; burada yalnızca
 * biçimi doğrulanıp kayda alınıyor. Gösterim amaçlı olduğundan teklif
 * gövdesini etkilemiyor.
 */
interface OzetSatiri {
  etiket: string;
  deger: string;
}

const MAX_OZET_SATIRI = 40;
const MAX_OZET_UZUNLUK = 200;

function temizOzet(value: unknown): OzetSatiri[] {
  if (!Array.isArray(value)) return [];
  const satirlar: OzetSatiri[] = [];
  for (const satir of value.slice(0, MAX_OZET_SATIRI)) {
    if (!satir || typeof satir !== "object") continue;
    const { etiket, deger } = satir as Record<string, unknown>;
    if (typeof etiket !== "string" || typeof deger !== "string") continue;
    if (!etiket.trim() || !deger.trim()) continue;
    satirlar.push({
      etiket: etiket.slice(0, MAX_OZET_UZUNLUK),
      deger: deger.slice(0, MAX_OZET_UZUNLUK),
    });
  }
  return satirlar;
}

interface RequestBody {
  productSlug?: string;
  talepler?: TeklifTalep[];
  girdiler?: unknown;
  kisi?: {
    entityType?: KisiTipi;
    tckn?: string | null;
    vergiNo?: string | null;
    adSoyad?: string | null;
    phone?: string | null;
    birthDate?: string | null;
    plate?: string | null;
    adresKodu?: string | null;
  };
}

/**
 * TeklifId gelmediğinde IO gerçek sebebi HTTP 200 gövdesindeki `Hata`
 * nesnesinde döndürüyor — örneğin DASK yenilemede poliçe numarası
 * bulunamadığında HataKodu 11 ve "Aradığınız kriterlere uygun kayıt
 * bulunamadı." Genel bir mesaj göstermek kullanıcıyı neyi düzelteceği
 * konusunda kör bırakıyordu.
 */
function ioHataMesaji(payload: unknown): string | null {
  return ioIcHata(payload).mesaj;
}

/**
 * Yanıtın kişisel veri taşımayan skaler alanları.
 *
 * `/api/teklif` yanıtı hiç kaydedilmiyordu. IO aynı kişi ve aynı riziko için
 * yeni teklif açmak yerine mevcut (aylar öncesine ait olabilen) teklif
 * kaydını döndürüyor; ödemenin neden reddedildiği ancak canlı API'ye elle
 * bağlanıp anlaşılabildi. Özet kayda geçsin ki bir daha gerekmesin.
 *
 * Sigortalı bloğu ve şifreli `SigortaliStr` bilinçli olarak dışarıda: teşhis
 * için işe yaramıyor, oturum kaydında kimlik bilgisi zaten ayrı kolonlarda.
 */
function ioYanitOzeti(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object") return {};
  const ozet: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    if (value === null || typeof value === "object") continue;
    if (/sigortali|kimlik|str$/i.test(key)) continue;
    ozet[key] = value;
  }
  // İç içe `Hata` nesnesi düzleştiriliyor: yukarıdaki döngü nesneleri
  // atlıyor, oysa IO'nun asıl açıklaması ("Teklif kayıtlıdır.", "Sistem
  // Hatası" …) orada duruyor ve teşhis için en değerli alan o.
  const { kod, mesaj } = ioIcHata(payload);
  if (kod !== null) ozet.HataKodu = kod;
  if (mesaj !== null) ozet.HataMesaj = mesaj;
  return ozet;
}

/** Yanıt alan adı uca göre TeklifId / Id olarak değişebiliyor. */
function readTeklifId(payload: unknown): number | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  for (const key of ["TeklifId", "TeklifID", "Id"]) {
    const value = Number(record[key]);
    if (Number.isFinite(value) && value > 0) return value;
  }
  return null;
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

  const talepler = body.talepler ?? [];
  if (!body.productSlug || !talepler.length) {
    return withCookie(
      jsonResponse({ error: "Ürün ve teklif bilgisi zorunlu." }, 400),
      session,
    );
  }
  if (talepler.length > MAX_BRANS_PER_REQUEST) {
    return withCookie(
      jsonResponse({ error: "Tek istekte en fazla iki branş çalıştırılabilir." }, 400),
      session,
    );
  }

  // Aynı girdi az önce çalıştırıldıysa IO'ya gitmeden o teklif geri veriliyor.
  // Sayaçlardan önce bakılıyor ki geri-ileri gezinme ziyaretçinin kotasını
  // yemesin; bu yol yalnızca kendi kaydımızı okur.
  const talepHash = await talepOzeti(talepler);
  const tekrar = await sonTeklifTekrari(
    session.id,
    talepHash,
    new Date(Date.now() - TEKRAR_PENCERESI_MS),
  );
  if (tekrar) {
    return withCookie(
      jsonResponse({
        oturumId: tekrar.id,
        oturumNo: tekrar.oturum_no,
        teklifler: tekrar.teklifler,
        hatalar: [],
        tekrar: true,
      }),
      session,
    );
  }

  // Dar sayaç (aynı kişi) önce: o dolmuşsa geniş sayaçları boşuna
  // arttırmıyoruz.
  const kisiAllowed = await rateCheck(
    await kisiAnahtari(session.id, body.kisi),
    "teklif_kisi",
    MAX_TEKLIF_PER_KISI,
    SESSION_WINDOW_SECONDS,
  );
  if (!kisiAllowed) {
    return withCookie(
      jsonResponse(
        {
          error:
            "Bu kişi için kısa sürede birden fazla teklif çalıştırdınız. Fiyatlar birkaç dakika içinde değişmez; lütfen biraz sonra tekrar deneyin.",
          fallback: false,
        },
        429,
      ),
      session,
    );
  }

  const sessionAllowed = await rateCheck(
    `oturum:${session.id}`,
    "teklif_oturum",
    MAX_TEKLIF_PER_SESSION,
    SESSION_WINDOW_SECONDS,
  );
  const allowed =
    sessionAllowed &&
    (await rateCheck(ipHash, "teklif", MAX_TEKLIF_PER_HOUR, 3600));
  if (!allowed) {
    return withCookie(
      jsonResponse(
        {
          error:
            "Kısa sürede çok fazla teklif çalıştırdınız. Lütfen bir süre sonra tekrar deneyin.",
          fallback: false,
        },
        429,
      ),
      session,
    );
  }

  // Genel tavan: kullanıcının kendi limiti dolmasa da toplam hacim
  // aşıldıysa self servis durur ve kullanıcı lead formuna yönlendirilir.
  const globalAllowed = await globalRateCheck(
    "teklif",
    maxTeklifGlobalPerHour(),
    3600,
  );
  if (!globalAllowed) {
    return withCookie(
      jsonResponse(
        {
          error:
            "Şu anda beklenenden yoğun bir talep var. Formu doldurursanız ekibimiz sizin için teklif hazırlayıp arayacak.",
          fallback: true,
        },
        429,
      ),
      session,
    );
  }

  const kisi = body.kisi ?? {};
  const girdiler = temizOzet(body.girdiler);
  const kanal = ioTeklifKanal();
  const oturum = await createOturum({
    session_id: session.id,
    ip_hash: ipHash,
    product_slug: body.productSlug,
    brans_no: talepler[0].bransNo,
    entity_type: kisiTipi(kisi.entityType),
    tckn: kisi.tckn ?? null,
    vergi_no: kisi.vergiNo ?? null,
    ad_soyad: kisi.adSoyad ?? null,
    phone: kisi.phone ?? null,
    birth_date: kisi.birthDate ?? null,
    plate: kisi.plate ?? null,
    adres_kodu: kisi.adresKodu ?? null,
    form_data: { girdiler, talepler, kanal, talepHash },
  });

  const sonuclar: { bransNo: number; teklifId: number }[] = [];
  const hatalar: { bransNo: number; message: string }[] = [];
  /** Yalnızca oturum kaydına yazılıyor; istemciye dönmüyor. */
  const ioYanitlari: Record<string, unknown>[] = [];

  for (const talep of talepler) {
    const result = await ioFetch(`/api/teklif`, {
      method: "POST",
      body: {
        ...talep.payload,
        BransNo: talep.bransNo,
        Kanal: kanal,
      },
    });

    if (!result.ok) {
      hatalar.push({ bransNo: talep.bransNo, message: result.error.message });
      continue;
    }
    ioYanitlari.push({
      bransNo: talep.bransNo,
      ...ioYanitOzeti(result.data),
    });
    const teklifId = readTeklifId(result.data);
    if (teklifId === null) {
      hatalar.push({
        bransNo: talep.bransNo,
        message: ioHataMesaji(result.data) ?? "Teklif numarası alınamadı.",
      });
      continue;
    }
    sonuclar.push({ bransNo: talep.bransNo, teklifId });
  }

  // Hiçbiri tutmadıysa istemciye ilk hatayı döneriz; oturum "hata" olarak
  // işaretlenir ki panelde nerede koptuğu görünsün.
  if (!sonuclar.length) {
    if (oturum) {
      await updateOturum(oturum.id, {
        status: "hata",
        hata_mesaji: hatalar[0]?.message ?? "Teklif oluşturulamadı.",
      });
    }
    return withCookie(
      errorResponse({
        status: 422,
        code: null,
        message: hatalar[0]?.message ?? "Teklif oluşturulamadı.",
      }),
      session,
    );
  }

  if (oturum) {
    await updateOturum(oturum.id, {
      status: "sorgu_tamam",
      io_teklif_id: sonuclar[0].teklifId,
      form_data: {
        girdiler,
        talepler,
        kanal,
        talepHash,
        teklifler: sonuclar,
        hatalar,
        ioYanitlari,
      },
    });
  }

  return withCookie(
    jsonResponse({
      oturumId: oturum?.id ?? null,
      oturumNo: oturum?.oturum_no ?? null,
      teklifler: sonuclar,
      hatalar,
    }),
    session,
  );
}
