/**
 * Teklif formlarında ilk kişisel veri adımında gösterilen KVKK aydınlatma
 * metinleri. Onay kutusu kullanılmaz; metin bilgilendirme amaçlıdır.
 */

export type QuoteKvkkVariant = "arac" | "konut" | "saglik" | "seyahat";

/** Metnin gövdesi; kapanış cümlesi bileşende bağlantıyla birleştirilir. */
export const QUOTE_KVKK_GOVDELER: Record<QuoteKvkkVariant, string> = {
  arac:
    "Paylaştığınız kimlik, iletişim, doğum tarihi ve araç bilgileri; entegre sigorta şirketlerinin sistemlerinden anlık teklif almak, teklifleri karşılaştırarak size göstermek ve seçiminiz hâlinde poliçe sürecini başlatmak amacıyla işlenir. Çevrim içi satın alma destekleniyorsa ilgili sigorta şirketinin ödeme ekranına yönlendirilirsiniz; desteklenmiyorsa işlem talep numarasıyla WhatsApp temsilcisi üzerinden tamamlanır.",
  konut:
    "Paylaştığınız kimlik, iletişim, doğum tarihi, adres ve taşınmaz bilgileri; adres ve sigortalı bilgilerini doğrulamak, entegre sigorta şirketlerinin sistemlerinden anlık teklif almak, teklifleri karşılaştırarak size göstermek ve seçiminiz hâlinde poliçe sürecini başlatmak amacıyla işlenir. Çevrim içi satın alma destekleniyorsa ilgili sigorta şirketinin ödeme ekranına yönlendirilirsiniz; desteklenmiyorsa işlem talep numarasıyla WhatsApp temsilcisi üzerinden tamamlanır.",
  saglik:
    "Paylaştığınız kimlik, sigortalanacak kişi seçimi ve iletişim bilgileri; entegre sigorta şirketlerinin sistemlerinden anlık sağlık sigortası teklifi almak, teklifleri karşılaştırarak size göstermek ve seçiminiz hâlinde poliçe sürecini başlatmak amacıyla işlenir. Çevrim içi satın alma destekleniyorsa ilgili sigorta şirketinin ödeme ekranına yönlendirilirsiniz; desteklenmiyorsa işlem talep numarasıyla WhatsApp temsilcisi üzerinden tamamlanır. Bu aşamada hastalık, teşhis, tedavi, ilaç veya ameliyat bilgisi istenmemektedir.",
  seyahat:
    "Paylaştığınız kimlik, iletişim, doğum tarihi ve seyahat bilgileri; entegre sigorta şirketlerinin sistemlerinden anlık teklif almak, teklifleri karşılaştırarak size göstermek ve seçiminiz hâlinde poliçe sürecini başlatmak amacıyla işlenir. Çevrim içi satın alma destekleniyorsa ilgili sigorta şirketinin ödeme ekranına yönlendirilirsiniz; desteklenmiyorsa işlem talep numarasıyla WhatsApp temsilcisi üzerinden tamamlanır.",
};

const SLUG_TO_VARIANT: Record<string, QuoteKvkkVariant> = {
  "trafik-sigortasi": "arac",
  "kisa-sureli-trafik": "arac",
  kasko: "arac",
  imm: "arac",
  "yesil-kart": "arac",
  dask: "konut",
  konut: "konut",
  "tamamlayici-saglik": "saglik",
  "ozel-saglik": "saglik",
  "seyahat-saglik": "seyahat",
};

export function getQuoteKvkkVariant(slug: string): QuoteKvkkVariant | undefined {
  return SLUG_TO_VARIANT[slug];
}

export function getQuoteKvkkGovde(slug: string): string | undefined {
  const variant = getQuoteKvkkVariant(slug);
  return variant ? QUOTE_KVKK_GOVDELER[variant] : undefined;
}
