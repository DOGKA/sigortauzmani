/**
 * `/api/io/*` proxy'sine giden istemci.
 *
 * Aynı origin'e istek atılıyor, bu yüzden CORS ayarı yok; oturum çerezi
 * otomatik taşınıyor (`credentials: "same-origin"` varsayılan davranış ama
 * niyeti açık etmek için yazıldı).
 *
 * IO token'ı bu katmanda hiç yok; her şey sunucu tarafında.
 */

import type {
  AdresKaydi,
  AdresSeviyesi,
  Il,
  Ilce,
  KartBilgisi,
  Marka,
  MarkaTipi,
  Meslek,
  PrimlerSonuc,
  SatinAlmaSonuc,
  SirketTeklifi,
  TeklifOlusturSonuc,
  TeklifPayload,
  Ulke,
} from "./types";

export class IoError extends Error {
  readonly status: number;
  readonly code: number | null;
  /**
   * Kullanıcının girdisiyle düzeltilemeyecek hata (token bitti, servis
   * kapalı, kapasite doldu). Arayüz bunu görünce self servisi bırakıp lead
   * formunu önerir; "tekrar dene" göstermek anlamsız olur.
   */
  readonly fallback: boolean;

  constructor(
    message: string,
    status: number,
    code: number | null,
    fallback = false,
  ) {
    super(message);
    this.name = "IoError";
    this.status = status;
    this.code = code;
    this.fallback = fallback;
  }
}

async function call<T>(
  action: string,
  init: { method?: "GET" | "POST"; body?: unknown; query?: Record<string, string> },
): Promise<T> {
  const query = init.query
    ? `?${new URLSearchParams(init.query).toString()}`
    : "";

  let response: Response;
  try {
    response = await fetch(`/api/io/${action}${query}`, {
      method: init.method ?? "GET",
      credentials: "same-origin",
      headers: init.body === undefined ? undefined : { "Content-Type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw new IoError(
      "Bağlantı kurulamadı. İnternet bağlantınızı kontrol edin.",
      0,
      null,
    );
  }


  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      throw new IoError("Sunucudan okunamayan bir yanıt alındı.", response.status, null);
    }
  }

  if (!response.ok) {
    const record = (payload ?? {}) as {
      error?: string;
      code?: number | null;
      fallback?: boolean;
    };
    throw new IoError(
      record.error ?? "İşlem tamamlanamadı. Lütfen tekrar deneyin.",
      response.status,
      record.code ?? null,
      record.fallback === true,
    );
  }

  return payload as T;
}

// ============================================================
// Referans listeleri
// ============================================================

export function getIller(): Promise<Il[]> {
  return call<Il[]>("iller", {});
}

export function getIlceler(ilKodu: string): Promise<Ilce[]> {
  return call<Ilce[]>("ilceler", { query: { IlKodu: ilKodu } });
}

export function getUlkeler(): Promise<Ulke[]> {
  return call<Ulke[]>("ulkeler", {});
}

export function getMeslekler(): Promise<Meslek[]> {
  return call<Meslek[]>("meslek", {});
}

export function getTeminatlar(
  bransNo: number,
  kullanimTarzi: string,
): Promise<unknown[]> {
  return call<unknown[]>("teminat", {
    query: { BransNo: String(bransNo), KT: kullanimTarzi },
  });
}

export function getMarkalar(): Promise<Marka[]> {
  return call<Marka[]>("bb", { method: "POST", body: { st: 1 } });
}

export function getMarkaTipleri(
  markaKodu: string,
  modelYili: string,
): Promise<MarkaTipi[]> {
  return call<MarkaTipi[]>("bb", {
    method: "POST",
    body: { st: 2, Arac: { MarkaKodu: markaKodu, ModelYili: modelYili } },
  });
}

export function getAdresKayitlari(
  seviye: AdresSeviyesi,
  deger: string,
): Promise<AdresKaydi[]> {
  return call<AdresKaydi[]>("adreskodu", {
    query: { st: seviye, deger },
  });
}

// ============================================================
// Sorgular
// ============================================================

export async function sorguMernis(body: {
  BransNo: number | string;
  Sigortali: { KimlikNo: string; DogumTarihi?: string; Cep?: string };
}): Promise<Record<string, unknown>> {
  try {
    return await call("mernis", { method: "POST", body });
  } catch (error) {
    // Vite yerelde api/ fonksiyonlarını çalıştırmaz; 404 o zaman düşer.
    // Canlıda sorgu zaten kapalı ve atlandi döner. Her iki durumda da
    // kimlik adımı durmamalı ve müşteriye SMS gitmemeli.
    if (error instanceof IoError && (error.status === 404 || error.status === 0)) {
      return { atlandi: true };
    }
    throw error;
  }
}

export function sorguTramer(body: {
  BransNo: number | string;
  SigortaEttirenAyniMi: boolean;
  Sigortali: { KimlikNo: string; Dogumtarihi?: string; Cep?: string };
  Arac: { Plaka: string; TescilBelge: string };
}): Promise<Record<string, unknown>> {
  return call("tramer", { method: "POST", body });
}

export function sorguTescilBelge(body: {
  BransNo: number | string;
  SigortaEttirenAyniMi: boolean;
  Sigortali: { KimlikNo: string; Dogumtarihi?: string; Cep?: string };
  Arac: { Plaka: string };
}): Promise<Record<string, unknown>> {
  return call("tescilbelge", { method: "POST", body });
}

export function sorguDaskPolice(policeNo: string): Promise<Record<string, unknown>> {
  return call("dask-sorgu", { method: "POST", body: { pno: policeNo } });
}

// ============================================================
// Teklif
// ============================================================

export interface TeklifTalebi {
  bransNo: number;
  payload: TeklifPayload;
}

export interface KisiBilgisi {
  entityType: "sahis" | "yabanci" | "sirket";
  tckn?: string | null;
  vergiNo?: string | null;
  adSoyad?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  plate?: string | null;
  adresKodu?: string | null;
}

export function teklifOlustur(body: {
  productSlug: string;
  talepler: TeklifTalebi[];
  kisi: KisiBilgisi;
}): Promise<TeklifOlusturSonuc> {
  // `api/io/teklif.ts` statik rota olduğu için `[action].ts` yerine ona düşer.
  return call<TeklifOlusturSonuc>("teklif", { method: "POST", body });
}

export function primleriGetir(body: {
  oturumId: string | null;
  bransNo: number;
  teklifId: number;
}): Promise<PrimlerSonuc> {
  return call<PrimlerSonuc>("primler", { method: "POST", body });
}

export function teklifDetay(body: {
  BransNo: number;
  TeklifId: number;
  TeklifDetay: Record<string, unknown>;
}): Promise<unknown> {
  return call("teklifdetay", { method: "POST", body });
}

export function teklifGuncelle(body: Record<string, unknown>): Promise<unknown> {
  return call("teklifguncelle", { method: "POST", body });
}

export function satinAl(body: {
  oturumId: string;
  bransNo: number;
  teklifId: number;
  teklif: Partial<SirketTeklifi>;
  kart: KartBilgisi;
}): Promise<SatinAlmaSonuc> {
  return call<SatinAlmaSonuc>("satinal", { method: "POST", body });
}

export function teklifPdfUrl(id: number): Promise<{ Url?: string }> {
  return call<{ Url?: string }>("yazdir", {
    query: { id: String(id), tipi: "t" },
  });
}

// ============================================================
// Primler polling
// ============================================================

const POLL_ARALIGI_MS = 3000;
const POLL_MAX_SURE_MS = 90_000;
/** Üst üste bu kadar hata alınırsa servis ayakta değil sayılır. */
const POLL_MAX_ARDISIK_HATA = 4;

/**
 * `TeklifCalisildi` true olana kadar primleri sorgular.
 *
 * Ara sonuçlar da dolu gelebildiği için her turda `onSonuc` çağrılır;
 * kullanıcı fiyatları akarken görür.
 *
 * Tek bir hata akışı bitirmiyor çünkü IO geçici 500'ler döndürebiliyor. Ama
 * üst üste hata gelirse servis gerçekten ayakta değildir; bu durumda sabit
 * aralıkla 90 saniye boyunca istek yığmak yerine aralığı büyütüp vazgeçiyoruz.
 * Karşı taraf tek operatör hacmi için tasarlandığı için boşa giden istekleri
 * en aza indirmek önemli.
 */
export async function primleriBekle(
  params: { oturumId: string | null; bransNo: number; teklifId: number },
  onSonuc: (
    sirketler: SirketTeklifi[],
    tamamlandi: boolean,
    otorizasyonSayisi: number,
  ) => void,
  signal?: AbortSignal,
): Promise<void> {
  const baslangic = Date.now();
  let ardisikHata = 0;

  while (Date.now() - baslangic < POLL_MAX_SURE_MS) {
    if (signal?.aborted) return;

    try {
      const sonuc = await primleriGetir(params);
      onSonuc(
        sonuc.sirketler,
        sonuc.teklifCalisildi,
        sonuc.otorizasyonSayisi ?? 0,
      );
      if (sonuc.teklifCalisildi) return;
      ardisikHata = 0;
    } catch (error) {
      if (error instanceof IoError) {
        // Kapasite ya da yetki sorunu kalıcı; beklemenin anlamı yok.
        if (error.status === 429 || error.fallback) throw error;
      }
      ardisikHata += 1;
      if (ardisikHata >= POLL_MAX_ARDISIK_HATA) {
        throw error instanceof IoError
          ? error
          : new IoError(
              "Fiyatlar alınamadı. Lütfen daha sonra tekrar deneyin.",
              0,
              null,
              true,
            );
      }
    }

    // Hata biriktikçe aralık açılır (3s, 6s, 9s…); sağlıklı akış etkilenmez.
    const bekleme = POLL_ARALIGI_MS * (ardisikHata + 1);
    await new Promise((resolve) => setTimeout(resolve, bekleme));
  }

  // Süre doldu: elde ne varsa gösterilir, tamamlandı işaretlenir ki
  // arayüz sonsuza kadar "hesaplanıyor" demesin.
  onSonuc([], true, 0);
}
