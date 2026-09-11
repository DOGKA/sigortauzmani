import { createClient as createServiceClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import {
  DEFAULT_SITE_SETTINGS,
  type NotificationSettings,
} from "../../../shared/site-settings";

export type NotificationKind = "talep" | "iptal" | "iletisim" | "test";

interface SendConfiguredInput {
  kind: NotificationKind;
  reference?: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer }[];
  forcedRecipients?: string[];
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createServiceClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function configuration() {
  const service = serviceClient();
  if (!service)
    return {
      settings: { ...DEFAULT_SITE_SETTINGS.notifications, recipients: [] },
      service: null,
    };
  const { data } = await service
    .from("site_settings")
    .select("value")
    .eq("key", "notifications")
    .maybeSingle();
  const stored = data?.value as Partial<NotificationSettings> | undefined;
  const settings: NotificationSettings = {
    ...DEFAULT_SITE_SETTINGS.notifications,
    ...stored,
    recipients: Array.isArray(stored?.recipients) ? stored.recipients : [],
  };
  return { settings, service };
}

export async function getNotificationRecipients() {
  const { settings } = await configuration();
  return settings.recipients;
}

export async function sendConfiguredEmail(input: SendConfiguredInput) {
  const { settings, service } = await configuration();
  const fallback = process.env.NOTIFY_TO_EMAIL ?? "sigorta@sigortauzmani.net";
  const recipients = input.forcedRecipients?.length
    ? input.forcedRecipients
    : settings.recipients.length
      ? settings.recipients
      : [fallback];
  const kindEnabled =
    input.kind === "test" ||
    (input.kind === "talep" && settings.talepEnabled) ||
    (input.kind === "iptal" && settings.iptalEnabled) ||
    (input.kind === "iletisim" && settings.iletisimEnabled);

  const log = async (
    status: "sent" | "skipped" | "error",
    providerId?: string,
    errorMessage?: string,
  ) => {
    if (!service) return;
    const { error } = await service.from("notification_send_log").insert({
      kind: input.kind,
      reference: input.reference,
      recipients,
      status,
      provider_id: providerId,
      error_message: errorMessage?.slice(0, 1000),
    });
    if (error) console.error("Bildirim günlüğü yazılamadı:", error);
  };

  if (!settings.enabled || !kindEnabled) {
    await log("skipped");
    return { status: "skipped" as const };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    await log("error", undefined, "RESEND_API_KEY tanımlı değil");
    throw new Error("RESEND_API_KEY tanımlı değil");
  }

  try {
    const { data, error } = await new Resend(apiKey).emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ??
        "Sigorta Uzmanı <onboarding@resend.dev>",
      to: recipients,
      subject: input.subject,
      html: input.html,
      replyTo: input.replyTo,
      attachments: input.attachments,
    });
    if (error) throw new Error(error.message);
    await log("sent", data?.id);
    return { status: "sent" as const, id: data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "E-posta gönderilemedi";
    await log("error", undefined, message);
    throw error;
  }
}
