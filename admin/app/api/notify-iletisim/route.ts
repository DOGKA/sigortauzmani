import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";
import {
  sendContactNotificationEmail,
  type ContactEmailPayload,
  type ContactPriority,
} from "@/lib/email/contact-notification";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_REQUEST_BYTES = 6 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const PRIORITIES = new Set<ContactPriority>(["normal", "oncelikli", "acil"]);
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isRateLimited(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const key = forwarded?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const current = rateLimits.get(key);
  if (!current || current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > RATE_LIMIT_MAX;
}

function safeFilename(filename: string) {
  return (
    filename
      .normalize("NFKD")
      .replace(/[^\w.-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120) || "belge"
  );
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  try {
    if (isRateLimited(request)) {
      return NextResponse.json(
        { error: "Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin." },
        { status: 429, headers: corsHeaders(request) },
      );
    }

    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_REQUEST_BYTES) {
      return NextResponse.json(
        { error: "İstek boyutu çok büyük" },
        { status: 413, headers: corsHeaders(request) },
      );
    }

    const formData = await request.formData();
    if (text(formData, "website")) {
      return NextResponse.json(
        { ok: true },
        { status: 200, headers: corsHeaders(request) },
      );
    }

    const iletisimNo = text(formData, "iletisim_no");
    const name = text(formData, "ad_soyad");
    const email = text(formData, "email").toLowerCase();
    const subject = text(formData, "konu");
    const priority = text(formData, "oncelik") as ContactPriority;
    const message = text(formData, "mesaj");

    if (
      iletisimNo.length < 10 ||
      name.length < 2 ||
      name.length > 100 ||
      !validEmail(email) ||
      email.length > 160 ||
      subject.length < 3 ||
      subject.length > 160 ||
      !PRIORITIES.has(priority) ||
      message.length < 10 ||
      message.length > 3000
    ) {
      return NextResponse.json(
        { error: "Geçersiz iletişim formu verisi" },
        { status: 400, headers: corsHeaders(request) },
      );
    }

    const fileValue = formData.get("belge");
    let attachment: ContactEmailPayload["attachment"];
    if (fileValue instanceof File && fileValue.size > 0) {
      if (
        fileValue.size > MAX_FILE_BYTES ||
        !ALLOWED_FILE_TYPES.has(fileValue.type)
      ) {
        return NextResponse.json(
          { error: "Geçersiz belge türü veya boyutu" },
          { status: 400, headers: corsHeaders(request) },
        );
      }
      attachment = {
        filename: safeFilename(fileValue.name),
        content: Buffer.from(await fileValue.arrayBuffer()),
      };
    }

    await sendContactNotificationEmail({
      iletisim_no: iletisimNo,
      ad_soyad: name,
      email,
      konu: subject,
      oncelik: priority,
      mesaj: message,
      belge_path: text(formData, "belge_path") || null,
      attachment,
    });

    return NextResponse.json(
      { ok: true },
      { status: 200, headers: corsHeaders(request) },
    );
  } catch (error) {
    console.error("İletişim bildirim e-postası gönderilemedi:", error);
    return NextResponse.json(
      { error: "E-posta gönderilemedi" },
      { status: 500, headers: corsHeaders(request) },
    );
  }
}
