/**
 * Belge (PDF) uçu: GET /api/yazdir?id=&tipi=.
 *
 * Üç belge de aynı uçtan geliyor; ayrımı `tipi` yapıyor:
 * - `t` satın alma öncesi teklif PDF'i, sonrasında poliçe PDF'i
 * - `m` ödeme makbuzu (dekont)
 * - `p` üye poliçe listesindeki PolId ile poliçe PDF'i (bizde üyelik yok)
 *
 * Her iki durumda da `id` teklif satırının Id'si; satın alma yanıtındaki
 * `Police.Id` gönderdiğimiz değerin aynısı, yeni bir poliçe kimliği değil.
 *
 * Yanıt HTTP 200 dönüp başarısız olabiliyor, üstelik iki ayrı biçimde:
 * hata bilgisi kökteki `HataKodu` yerine iç içe `Hata` nesnesinde geliyor ve
 * `Hata.Basarili` başarılı çağrılarda bile false. Bu yüzden tek güvenilir
 * ölçüt `Url` alanının dolu olması.
 *
 * Belge her teklifte çıkmıyor: sigorta şirketlerinin yaklaşık yarısı teklif
 * PDF'i paylaşmıyor ve "Pdf oluşturulamadı." dönüyor. Bu bir arıza değil,
 * şirketin entegrasyonunda o belgenin olmaması; çağıran taraf null'ı normal
 * bir sonuç olarak karşılamalı.
 */

import { ioFetch } from "./io";

export type YazdirTipi = "t" | "m" | "p";

export type BelgeSonucu =
  | { ok: true; url: string }
  | { ok: false; message: string };

/** PDF adresi yanıtta Url / pdf / downloadUrl olarak gelebiliyor. */
function urlOku(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  for (const key of ["Url", "url", "pdf", "Pdf", "downloadUrl"]) {
    const value = record[key];
    if (typeof value === "string" && value.startsWith("http")) return value;
  }
  return null;
}

/** IO'nun kendi açıklaması ("Pdf oluşturulamadı." gibi); log için. */
function ioMesaji(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const hata = (payload as Record<string, unknown>).Hata;
  if (!hata || typeof hata !== "object") return null;
  const mesaj = (hata as Record<string, unknown>).Mesaj;
  return typeof mesaj === "string" && mesaj.trim() ? mesaj.trim() : null;
}

export async function belgeGetir(
  id: number,
  tipi: YazdirTipi,
): Promise<BelgeSonucu> {
  const result = await ioFetch(`/api/yazdir?id=${id}&tipi=${tipi}`, {
    method: "GET",
  });
  if (!result.ok) return { ok: false, message: result.error.message };

  const url = urlOku(result.data);
  if (url) return { ok: true, url };
  return { ok: false, message: ioMesaji(result.data) ?? "Belge alınamadı." };
}

/** Yalnızca adres isteyen çağrılar için; hata ayrıntısı gerekmiyorsa. */
export async function belgeUrl(
  id: number,
  tipi: YazdirTipi,
): Promise<string | null> {
  const sonuc = await belgeGetir(id, tipi);
  return sonuc.ok ? sonuc.url : null;
}
