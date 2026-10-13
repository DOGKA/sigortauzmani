/**
 * 3D Secure yönlendirmesi.
 *
 * `Us3D: true` ile satın almada IO poliçeyi hemen kesmiyor; önce bankanın
 * doğrulama sayfasını döndürüyor, poliçe müşteri şifreyi girdikten sonra IO
 * tarafında kesiliyor. Yanıtın biçimi dokümanda yok ve şirketten şirkete
 * değişebiliyor: kendiliğinden gönderilen bir HTML form ya da bir adres.
 * Bu yüzden alan adına bağlanmadan yanıtın içinde ikisi de aranıyor.
 *
 * HTML formun gizli alanlarında kart numarası bulunabiliyor; içeriği hiçbir
 * yere yazılmamalı, yalnızca istemciye aktarılmalı.
 */

export type UcDYonlendirme = { html: string } | { url: string };

// Teklif satırları şirketin genel ödeme sayfasını `Link` alanında taşıyor ve
// satın alma yanıtında geri gelebiliyor; genel `url`/`link` adları kart
// reddini 3D sanmaya yol açacağı için kabul edilmiyor.
const URL_ANAHTARI = /3d|acs|redirect|yonlendir|secure/i;
const HTML_FORM = /<form[\s>]|<html[\s>]|<!doctype html/i;

function tara(deger: unknown, anahtar: string, derinlik: number): UcDYonlendirme | null {
  if (typeof deger === "string") {
    const metin = deger.trim();
    if (HTML_FORM.test(metin)) return { html: metin };
    if (/^https?:\/\//i.test(metin) && URL_ANAHTARI.test(anahtar)) {
      return { url: metin };
    }
    return null;
  }
  if (!deger || typeof deger !== "object" || derinlik > 4) return null;

  // HTML adres içeren alanlardan önce gelsin: form bankaya POST ediyor,
  // aynı yanıttaki adres çoğu zaman yalnızca formun hedefi.
  let adres: UcDYonlendirme | null = null;
  for (const [alt, icerik] of Object.entries(deger as Record<string, unknown>)) {
    const bulunan = tara(icerik, alt, derinlik + 1);
    if (!bulunan) continue;
    if ("html" in bulunan) return bulunan;
    adres ??= bulunan;
  }
  return adres;
}

export function ucDYonlendirmesi(payload: unknown): UcDYonlendirme | null {
  return tara(payload, "", 0);
}

/** Kayda yazılabilecek özet: içerik değil, yalnızca biçim ve hedef alan adı. */
export function ucDOzeti(yonlendirme: UcDYonlendirme): Record<string, unknown> {
  if ("url" in yonlendirme) {
    try {
      return { ucDSecure: "url", host: new URL(yonlendirme.url).host };
    } catch {
      return { ucDSecure: "url" };
    }
  }
  const hedef = /<form[^>]*action=["']([^"']+)["']/i.exec(yonlendirme.html)?.[1];
  let host: string | null = null;
  try {
    host = hedef ? new URL(hedef).host : null;
  } catch {
    host = null;
  }
  return { ucDSecure: "html", host, uzunluk: yonlendirme.html.length };
}

export const UCD_BEKLIYOR = "3D doğrulamaya yönlendirildi; poliçe bekleniyor.";
