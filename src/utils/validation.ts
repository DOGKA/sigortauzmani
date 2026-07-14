// T.C. Kimlik Numarası resmi doğrulama algoritması:
// - 11 hane, ilk hane 0 olamaz
// - 10. hane = ((1,3,5,7,9. hanelerin toplamı × 7) − (2,4,6,8. hanelerin toplamı)) mod 10
// - 11. hane = ilk 10 hanenin toplamı mod 10
export function isValidTckn(value: string): boolean {
  if (!/^[1-9]\d{10}$/.test(value)) return false;
  const d = value.split("").map(Number);
  const oddSum = d[0] + d[2] + d[4] + d[6] + d[8];
  const evenSum = d[1] + d[3] + d[5] + d[7];
  const check10 = ((oddSum * 7 - evenSum) % 10 + 10) % 10;
  const check11 = d.slice(0, 10).reduce((a, b) => a + b, 0) % 10;
  return check10 === d[9] && check11 === d[10];
}

// Türkiye GSM numarası: 05XX XXX XX XX
// "+90", "90" veya "0" öneklerini kabul eder, çekirdek numara 5 ile başlayan 10 hane olmalı.
export function isValidMobilePhone(value: string): boolean {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("90")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^5\d{9}$/.test(digits);
}

// Telefon girişini "05XX XXX XX XX" biçiminde maskeler.
export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const parts = [
    digits.slice(0, 4),
    digits.slice(4, 7),
    digits.slice(7, 9),
    digits.slice(9, 11),
  ].filter(Boolean);
  return parts.join(" ");
}

// Türk plakalarında Q, W, X ve Türkçe özel karakterler (Ç, Ğ, İ, Ö, Ş, Ü) kullanılmaz.
const PLATE_LETTER = "[A-PR-VYZ]";

// Geçerli plaka biçimleri (il kodu 01-81):
// XX A 9999(9) | XX AA 999(9) | XX AAA 99(9)
const PLATE_REGEX = new RegExp(
  `^(0[1-9]|[1-7]\\d|8[01])(?:${PLATE_LETTER}\\d{4,5}|${PLATE_LETTER}{2}\\d{3,4}|${PLATE_LETTER}{3}\\d{2,3})$`,
);

export function isValidPlate(value: string): boolean {
  return PLATE_REGEX.test(value.replace(/\s+/g, ""));
}

// Araç tescil (ruhsat) belge seri no: 2 harf + 6 rakam (örn. AA999999)
export function isValidDocumentSerial(value: string): boolean {
  return /^[A-Z]{2}\d{6}$/.test(value);
}

// 18 yaşını doldurmuş en genç kişinin doğum tarihi (date input max değeri için).
export function getMaxBirthDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
}

export function isAdult(isoDate: string): boolean {
  if (!isoDate) return false;
  return isoDate <= getMaxBirthDate();
}
