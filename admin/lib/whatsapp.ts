import type { Talep } from "@/lib/types";

/** Türkiye cep numarasını wa.me formatına çevirir (905XXXXXXXXX). */
export function normalizeTrPhoneForWa(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("90") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 11) return `9${digits}`;
  if (digits.length === 10 && digits.startsWith("5")) return `90${digits}`;

  return null;
}

/** Müşteriye giden hazır mesaj — form talebine yanıt olduğu belli olsun diye kısa tutulur. */
export function buildTalepWhatsAppMessage(talep: Talep): string {
  return [
    "Merhaba,",
    "",
    `Sigorta Uzmanı'ndan yazıyorum. Web sitemizden ilettiğiniz ${talep.product_title} talebiniz (${talep.talep_no}) için size ulaşıyorum.`,
    "",
    "Müsait misiniz?",
  ].join("\n");
}

export function buildTalepWhatsAppUrl(talep: Talep): string | null {
  if (!talep.phone) return null;

  const normalized = normalizeTrPhoneForWa(talep.phone);
  if (!normalized) return null;

  const text = encodeURIComponent(buildTalepWhatsAppMessage(talep));
  return `https://wa.me/${normalized}?text=${text}`;
}
