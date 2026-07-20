import { Resend } from "resend";

export interface IptalEmailPayload {
  iptal_no: string;
  brans: string;
  brans_label?: string;
  ad_soyad: string;
  phone: string;
  tckn?: string | null;
  vergi_no?: string | null;
  plate: string;
  belge_path?: string;
}

function row(label: string, value: string | null | undefined) {
  const display = value?.trim() || "-";
  return `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e8edf3;color:#64748b;font-size:13px;width:38%;">${label}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e8edf3;color:#0f172a;font-size:14px;font-weight:600;">${display}</td>
    </tr>
  `;
}

export function buildIptalEmailHtml(iptal: IptalEmailPayload) {
  const bransLabel = iptal.brans_label || iptal.brans;
  return `
<!DOCTYPE html>
<html lang="tr">
  <body style="margin:0;padding:24px;background:#f6f8fb;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="padding:24px 28px;background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#ffffff;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.85;">Poliçe İptal Talebi</p>
        <h1 style="margin:0;font-size:24px;line-height:1.3;">${bransLabel}</h1>
        <p style="margin:12px 0 0;font-size:18px;font-weight:700;">İptal No: ${iptal.iptal_no}</p>
      </div>
      <div style="padding:8px 20px 24px;">
        <table style="width:100%;border-collapse:collapse;">
          ${row("İptal No", iptal.iptal_no)}
          ${row("Branş", bransLabel)}
          ${row("Ad Soyad", iptal.ad_soyad)}
          ${row("Cep Telefonu", iptal.phone)}
          ${iptal.vergi_no ? row("Vergi No", iptal.vergi_no) : row("T.C. Kimlik No", iptal.tckn)}
          ${row("Plaka", iptal.plate)}
          ${row("Belge", iptal.belge_path ? "Yüklendi" : "-")}
        </table>
        <p style="margin:20px 0 0;padding:14px 16px;background:#f8fafc;border-radius:12px;color:#475569;font-size:13px;line-height:1.6;">
          Bu talep web sitesi üzerinden oluşturuldu. Detayları admin paneldeki
          <strong>İptal Talepleri</strong> bölümünden görüntüleyebilirsiniz.
        </p>
      </div>
    </div>
  </body>
</html>
  `.trim();
}

export async function sendIptalNotificationEmail(iptal: IptalEmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const to =
    process.env.NOTIFY_IPTAL_TO_EMAIL ??
    process.env.NOTIFY_TO_EMAIL ??
    "sigorta@sigortauzmani.com";
  const from =
    process.env.RESEND_FROM_EMAIL ??
    "Sigorta Uzmanı <onboarding@resend.dev>";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY tanımlı değil");
  }

  const resend = new Resend(apiKey);
  const bransLabel = iptal.brans_label || iptal.brans;

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Poliçe İptal Talebi: ${iptal.iptal_no} — ${bransLabel}`,
    html: buildIptalEmailHtml(iptal),
  });

  if (error) {
    throw new Error(error.message);
  }
}
