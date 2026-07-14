import { Resend } from "resend";

export interface TalepEmailPayload {
  talep_no: string;
  product_title: string;
  insured_for?: string | null;
  tckn?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  plate?: string | null;
  document_serial?: string | null;
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "-";
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
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

export function buildTalepEmailHtml(talep: TalepEmailPayload) {
  return `
<!DOCTYPE html>
<html lang="tr">
  <body style="margin:0;padding:24px;background:#f6f8fb;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="padding:24px 28px;background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#ffffff;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.85;">Yeni Talep</p>
        <h1 style="margin:0;font-size:24px;line-height:1.3;">${talep.product_title}</h1>
        <p style="margin:12px 0 0;font-size:18px;font-weight:700;">Talep No: ${talep.talep_no}</p>
      </div>
      <div style="padding:8px 20px 24px;">
        <table style="width:100%;border-collapse:collapse;">
          ${row("Sigorta Türü", talep.product_title)}
          ${row("Talep No", talep.talep_no)}
          ${row("Sigortalanacak Kişi", talep.insured_for)}
          ${row("T.C. Kimlik No", talep.tckn)}
          ${row("Cep Telefonu", talep.phone)}
          ${row("Doğum Tarihi", formatDate(talep.birth_date))}
          ${row("Plaka", talep.plate)}
          ${row("Belge Seri No", talep.document_serial)}
        </table>
        <p style="margin:20px 0 0;padding:14px 16px;background:#f8fafc;border-radius:12px;color:#475569;font-size:13px;line-height:1.6;">
          Bu talep web sitesi üzerinden oluşturuldu. Detayları admin paneldeki
          <strong>Talepler</strong> bölümünden de görüntüleyebilirsiniz.
        </p>
      </div>
    </div>
  </body>
</html>
  `.trim();
}

export async function sendTalepNotificationEmail(talep: TalepEmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_TO_EMAIL ?? "sigorta@sigortauzmani.com";
  const from =
    process.env.RESEND_FROM_EMAIL ??
    "Sigorta Uzmanı <onboarding@resend.dev>";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY tanımlı değil");
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Yeni Talep: ${talep.talep_no} — ${talep.product_title}`,
    html: buildTalepEmailHtml(talep),
  });

  if (error) {
    throw new Error(error.message);
  }
}
