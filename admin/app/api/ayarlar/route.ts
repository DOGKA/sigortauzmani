import { NextResponse } from "next/server";
import { SETTING_KEYS } from "../../../../shared/site-settings";
import {
  jsonHandler,
  readSettings,
  requireUser,
  serviceClient,
} from "@/lib/settings/server";
import { validateSettings } from "@/lib/settings/validation";

export async function GET() {
  return jsonHandler(async () => {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
    return NextResponse.json({ settings: await readSettings() });
  }, "Ayarlar alınamadı.");
}

export async function PUT(request: Request) {
  return jsonHandler(
    async () => {
      const user = await requireUser();
      if (!user) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });

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
    },
    "Ayarlar kaydedilemedi.",
    400,
  );
}
