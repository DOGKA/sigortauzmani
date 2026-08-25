/**
 * Grafik renkleri. Durum renkleri panelde kullanılan rozetlerle aynı aileden
 * seçildi: "Satın alındı" tabloda yeşilse grafikte de yeşil görünsün.
 */

import type { OturumStatus, TalepStatus } from "@/lib/types";

/** Kategori sayısı önceden bilinmeyen grafikler (branş, şirket) için sıra. */
export const SIRA_RENKLERI = [
  "#0ea5e9",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#14b8a6",
  "#6366f1",
  "#ec4899",
  "#84cc16",
  "#64748b",
];

export function siraRengi(index: number): string {
  return SIRA_RENKLERI[index % SIRA_RENKLERI.length];
}

export const OTURUM_RENKLERI: Record<OturumStatus, string> = {
  baslatildi: "#94a3b8",
  sorgu_tamam: "#0ea5e9",
  teklif_calisti: "#8b5cf6",
  secildi: "#f59e0b",
  satin_alindi: "#10b981",
  hata: "#ef4444",
};

export const TALEP_RENKLERI: Record<TalepStatus, string> = {
  yeni: "#0ea5e9",
  arandi: "#f59e0b",
  teklif_verildi: "#8b5cf6",
  tamamlandi: "#10b981",
  iptal: "#ef4444",
};

export const KIMLIK_RENKLERI: Record<string, string> = {
  sahis: "#0ea5e9",
  sirket: "#8b5cf6",
  yabanci: "#14b8a6",
};

/** Huni adımları açıktan koyuya: son adım (satış) vurgulu yeşil. */
export const HUNI_RENKLERI = [
  "#bae6fd",
  "#7dd3fc",
  "#38bdf8",
  "#0ea5e9",
  "#10b981",
];

export const SERI_RENKLERI = {
  oturum: "#8b5cf6",
  police: "#10b981",
  talep: "#0ea5e9",
  prim: "#bae6fd",
  izgara: "#e2e8f0",
  eksen: "#94a3b8",
};
