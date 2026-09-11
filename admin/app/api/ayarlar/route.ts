import { NextResponse } from "next/server";
import { SETTING_KEYS } from "../../../../shared/site-settings";
import {
  readSettings,
  requireUser,
  serviceClient,
} from "@/lib/settings/server";
import { validateSettings } from "@/lib/settings/validation";

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  try {
    return NextResponse.json({ settings: await readSettings() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ayarlar alınamadı.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });

  try {
    const settings = validateSettings(await request.json());
    const service = serviceClient();
    const rows = SETTING_KEYS.map((key) => ({
      key,
      value: settings[key],
      is_public: key !== "notifications",
      updated_by: user.id,
    }));
    const { error } = await service.from("site_settings").upsert(rows);
    if (error) throw error;
    return NextResponse.json({ settings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ayarlar kaydedilemedi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
