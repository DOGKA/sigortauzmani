import { NextResponse } from "next/server";
import {
  sendIptalNotificationEmail,
  type IptalEmailPayload,
} from "@/lib/email/iptal-notification";

const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN ?? "http://localhost:5173";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function isValidPayload(body: unknown): body is IptalEmailPayload {
  if (!body || typeof body !== "object") return false;
  const data = body as Record<string, unknown>;
  return (
    typeof data.iptal_no === "string" &&
    data.iptal_no.length >= 8 &&
    typeof data.brans === "string" &&
    data.brans.length > 0 &&
    typeof data.ad_soyad === "string" &&
    data.ad_soyad.length > 0 &&
    typeof data.phone === "string" &&
    data.phone.length > 0 &&
    typeof data.plate === "string" &&
    data.plate.length > 0
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!isValidPayload(body)) {
      return NextResponse.json(
        { error: "Geçersiz iptal talep verisi" },
        { status: 400, headers: corsHeaders() },
      );
    }

    await sendIptalNotificationEmail(body);

    return NextResponse.json(
      { ok: true },
      { status: 200, headers: corsHeaders() },
    );
  } catch (error) {
    console.error("İptal bildirim e-postası gönderilemedi:", error);
    return NextResponse.json(
      { error: "E-posta gönderilemedi" },
      { status: 500, headers: corsHeaders() },
    );
  }
}
