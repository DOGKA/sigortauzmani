import { NextResponse } from "next/server";
import {
  getNotificationRecipients,
  sendConfiguredEmail,
} from "@/lib/email/send-configured";
import { requireUser } from "@/lib/settings/server";

const WINDOW_MS = 10 * 60 * 1000;
const attempts = new Map<string, number>();

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user?.email)
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });

  const last = attempts.get(user.id) ?? 0;
  if (Date.now() - last < WINDOW_MS)
    return NextResponse.json(
      { error: "Test e-postası 10 dakikada bir gönderilebilir." },
      { status: 429 },
    );

  const body = (await request.json().catch(() => ({}))) as { recipient?: unknown };
  const requested =
    typeof body.recipient === "string" ? body.recipient.trim().toLowerCase() : "";
  const saved = await getNotificationRecipients();
  const allowed = new Set([...saved.map((item) => item.toLowerCase()), user.email.toLowerCase()]);
  if (!allowed.has(requested))
    return NextResponse.json(
      { error: "Test yalnızca kayıtlı alıcılara veya oturum e-postanıza gönderilebilir." },
      { status: 403 },
    );

  try {
    attempts.set(user.id, Date.now());
    await sendConfiguredEmail({
      kind: "test",
      reference: user.id,
      forcedRecipients: [requested],
      subject: "Sigorta Uzmanı bildirim testi",
      html: `<div style="font-family:Arial;padding:24px"><h1>Bildirimler çalışıyor</h1><p>Bu e-posta yönetim panelindeki güvenli test aracından gönderildi.</p><p>${new Date().toLocaleString("tr-TR")}</p></div>`,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    attempts.delete(user.id);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Test gönderilemedi." },
      { status: 500 },
    );
  }
}
