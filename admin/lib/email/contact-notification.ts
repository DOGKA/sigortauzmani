import { Resend } from "resend";

export type ContactPriority = "normal" | "oncelikli" | "acil";

export interface ContactEmailPayload {
  iletisim_no: string;
  ad_soyad: string;
  email: string;
  konu: string;
  oncelik: ContactPriority;
  mesaj: string;
  belge_path?: string | null;
  attachment?: {
    filename: string;
    content: Buffer;
  };
}

const PRIORITY_LABELS: Record<ContactPriority, string> = {
  normal: "Normal",
  oncelikli: "Öncelikli",
  acil: "Acil",
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e8edf3;color:#64748b;font-size:13px;width:34%;">${label}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e8edf3;color:#0f172a;font-size:14px;font-weight:600;">${escapeHtml(value)}</td>
    </tr>
  `;
}

export function buildContactEmailHtml(payload: ContactEmailPayload) {
  const priority = PRIORITY_LABELS[payload.oncelik];
  return `
<!DOCTYPE html>
<html lang="tr">
  <body style="margin:0;padding:24px;background:#f6f8fb;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="padding:24px 28px;background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#fff;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.85;">Yeni İletişim Mesajı · ${priority}</p>
        <h1 style="margin:0;font-size:23px;line-height:1.3;">${escapeHtml(payload.konu)}</h1>
        <p style="margin:12px 0 0;font-size:16px;font-weight:700;">${escapeHtml(payload.iletisim_no)}</p>
      </div>
      <div style="padding:8px 20px 24px;">
        <table style="width:100%;border-collapse:collapse;">
          ${row("Ad Soyad", payload.ad_soyad)}
          ${row("E-posta", payload.email)}
          ${row("Öncelik", priority)}
          ${row("Konu", payload.konu)}
          ${row("Belge", payload.attachment ? payload.attachment.filename : "Eklenmedi")}
        </table>
        <div style="margin-top:20px;padding:18px;background:#f8fafc;border-radius:12px;color:#334155;font-size:14px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(payload.mesaj)}</div>
        <p style="margin:18px 0 0;color:#64748b;font-size:12px;line-height:1.6;">
          Bu mesaja yanıt verdiğinizde yanıtınız doğrudan formu dolduran kişiye gider.
          Kayıt admin panelindeki <strong>İletişim</strong> bölümünde de bulunur.
        </p>
      </div>
    </div>
  </body>
</html>
  `.trim();
}

export async function sendContactNotificationEmail(
  payload: ContactEmailPayload,
) {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL ??
    "Sigorta Uzmanı <onboarding@resend.dev>";

  if (!apiKey) throw new Error("RESEND_API_KEY tanımlı değil");

  const resend = new Resend(apiKey);
  const priority = PRIORITY_LABELS[payload.oncelik].toLocaleUpperCase("tr-TR");
  const { error } = await resend.emails.send({
    from,
    to: "sigorta@sigortauzmani.net",
    replyTo: payload.email,
    subject: `[${priority}] Yeni İletişim Mesajı — ${payload.konu}`,
    html: buildContactEmailHtml(payload),
    attachments: payload.attachment ? [payload.attachment] : undefined,
  });

  if (error) throw new Error(error.message);
}
