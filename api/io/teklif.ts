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
 * Olağan istek `Kanal: 0` ile gider ve IO kayıtlı teklif varsa onu döndürür.
 * `yeniTeklif: true` gelirse kayıt kontrolünü atlatan kanal kullanılır ve IO
 * şirketleri yeniden çalıştırıp yeni TeklifId açar (bkz. `ioYeniTeklifKanal`).
 */

import {
  errorResponse,
  ioFetch,
  ioIcHata,
  ioKanal,
  ioYeniTeklifKanal,
  jsonResponse,
} from "../_shared/io";
import {
  createOturum,
  globalRateCheck,
  rateCheck,
  teklifIlkGorulme,
  updateOturum,
} from "../_shared/iolog";
import { clientIp, hashIp, resolveSession, withCookie } from "../_shared/session";
import { readEnv } from "../_shared/supabase";
import { aktifPoliceBitisi, ioTeklifTarihi } from "../_shared/uye";

export const config = { runtime: "edge" };

const MAX_TEKLIF_PER_HOUR = 12;
const MAX_BRANS_PER_REQUEST = 2;

/**
 * Tüm ziyaretçiler için ortak saatlik tavan. Beklenen iş hacminin çok
 * üstünde bırakıldı; amaç normal trafiği kısmak değil, bot ya da beklenmeyen
 * bir sıçramanın IO'yu boğmasını engellemek. Env'den ayarlanabilir ki
 * kampanya dönemlerinde deploy gerekmeden yükseltilebilsin.
 */
function maxTeklifGlobalPerHour(): number {
  const parsed = Number(readEnv("IO_MAX_TEKLIF_GLOBAL_PER_HOUR"));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 200;
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
  /**
   * Kullanıcı kayıtlı teklifi reddedip yeni teklif istedi ("Hayır, yeni
   * teklif oluştur" / "Vazgeç"). IO'ya kayıt kontrolünü atlatan kanalla
   * gidilir; bkz. `ioYeniTeklifKanal`.
   */
  yeniTeklif?: boolean;
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

/**
 * Teklifin tanzim tarihi geçmiş mi (24 saatten eski mi).
 *
 * Aynı gün içinde tanzim tarihi değişmediği için teklif aynı primlerle
 * satın alınabiliyor. 24 saati geçtiğinde tanzim tarihi değişmek zorunda,
 * şirketin fiyatı da değişebiliyor; eski teklif üzerinden satın alma
 * "Şirket şu an Satın Alma için uygun değildir." (HataKodu 22) ile
 * reddediliyor. Böyle bir teklife yeni teklif çalıştırmak gerekiyor.
 *
 * IO tarafı burada yardımcı olmuyor: `primler` eski teklifin satırlarını
 * `SatinAl: true` ve dolu `TeklifNo` ile döndürmeye devam ediyor, yanıtta
 * teklif tarihi de yok. Bu yüzden yaş kendi kaydımızdan hesaplanıyor.
 */
const TEKLIF_GECERLILIK_MS = 24 * 60 * 60 * 1000;

function tanzimGecmis(ilkGorulme: string | null): boolean {
  if (!ilkGorulme) return false;
  const ms = Date.parse(ilkGorulme);
  if (Number.isNaN(ms)) return false;
  return Date.now() - ms > TEKLIF_GECERLILIK_MS;
}

/**
 * İki tarihin eskisi.
 *
 * Her iki kaynak da teklifin gerçek açılış anından yeni olabiliyor: kendi
 * kaydımız teklifi ilk gördüğümüz anı tutuyor (CRM'de daha önce açılmışsa
 * geç kalıyor), IO'nun alanı ise son işlem anını tutuyor (güncelleme onu
 * ileri atıyor). Bu yüzden eski olan seçiliyor — teklifin yaşını olduğundan
 * küçük göstermek satın almayı yanlışlıkla açar, büyük göstermek yalnızca
 * gereksiz yere yeni teklif sorar.
 */
function enEskiTarih(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  const ma = Date.parse(a);
  const mb = Date.parse(b);
  if (Number.isNaN(ma)) return b;
  if (Number.isNaN(mb)) return a;
  return ma <= mb ? a : b;
}

/**
 * Acente defterinde arama anahtarı.
 *
 * Araç branşlarında plaka en dar sonucu veriyor: aynı kimlikle on teklif
 * dönerken plakayla üç teklif döndü. Plaka yoksa kimlik numarasına düşülüyor.
 */
function aramaAnahtari(kisi: RequestBody["kisi"]): string | null {
  const plaka = kisi?.plate?.replace(/\s+/g, "").toUpperCase();
  if (plaka) return plaka;
  const kimlik = kisi?.tckn?.trim() || kisi?.vergiNo?.trim();
  return kimlik || null;
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

  const allowed = await rateCheck(ipHash, "teklif", MAX_TEKLIF_PER_HOUR, 3600);
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
  const yeniTeklif = body.yeniTeklif === true;
  const kanal = yeniTeklif ? ioYeniTeklifKanal() : ioKanal();
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
    form_data: { girdiler, talepler, yeniTeklif },
  });

  const arama = aramaAnahtari(kisi);
  const sonuclar: {
    bransNo: number;
    teklifId: number;
    eskiTeklif: boolean;
    teklifTarihi: string | null;
    /** Aynı branşta yürürlükte olan poliçenin bitiş tarihi; yoksa null. */
    policeBitisi: string | null;
  }[] = [];
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
    let teklifTarihi = oturum
      ? await teklifIlkGorulme(teklifId, oturum.id)
      : null;
    let policeBitisi: string | null = null;

    // IO yeni teklif açmak yerine kayıtlı teklifi döndürdüyse ("Teklif
    // kayıtlıdır. TeklifId ile primleri alabilirsiniz.", HataKodu 1) teklifin
    // yaşını ve müşterinin yürürlükteki poliçesini acente defterinden
    // soruyoruz. Kendi kaydımız CRM'de açılmış teklifleri görmüyor, defter
    // görüyor. Taze tekliflerde sorulacak bir şey olmadığı için iki ek istek
    // hiç yapılmıyor.
    if (ioIcHata(result.data).kod === 1 && arama) {
      const [ioTarih, bitis] = await Promise.all([
        ioTeklifTarihi(arama, teklifId),
        aktifPoliceBitisi(arama, talep.bransNo),
      ]);
      teklifTarihi = enEskiTarih(teklifTarihi, ioTarih);
      policeBitisi = bitis;
    }

    sonuclar.push({
      bransNo: talep.bransNo,
      teklifId,
      eskiTeklif: tanzimGecmis(teklifTarihi),
      teklifTarihi,
      policeBitisi,
    });
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
        yeniTeklif,
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
