import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";
import {
  sendTalepNotificationEmail,
  type TalepEmailPayload,
} from "@/lib/email/talep-notification";

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

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!isValidPayload(body)) {
      return NextResponse.json(
        { error: "Geçersiz talep verisi" },
        { status: 400, headers: corsHeaders(request) },
      );
    }

    await sendTalepNotificationEmail(body);

    return NextResponse.json(
      { ok: true },
      { status: 200, headers: corsHeaders(request) },
    );
  } catch (error) {
    console.error("Talep bildirim e-postası gönderilemedi:", error);
    return NextResponse.json(
      { error: "E-posta gönderilemedi" },
      { status: 500, headers: corsHeaders(request) },
    );
  }
}
