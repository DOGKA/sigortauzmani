import { NextResponse } from "next/server";
import {
  sendTalepNotificationEmail,
  type TalepEmailPayload,
} from "@/lib/email/talep-notification";

const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN ?? "http://localhost:5173";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function isValidPayload(body: unknown): body is TalepEmailPayload {
  if (!body || typeof body !== "object") return false;
  const data = body as Record<string, unknown>;
  return (
    typeof data.talep_no === "string" &&
    data.talep_no.length >= 8 &&
    typeof data.product_title === "string" &&
    data.product_title.length > 0
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
        { error: "Geçersiz talep verisi" },
        { status: 400, headers: corsHeaders() },
      );
    }

    await sendTalepNotificationEmail(body);

    return NextResponse.json(
      { ok: true },
      { status: 200, headers: corsHeaders() },
    );
  } catch (error) {
    console.error("Talep bildirim e-postası gönderilemedi:", error);
    return NextResponse.json(
      { error: "E-posta gönderilemedi" },
      { status: 500, headers: corsHeaders() },
    );
  }
}
