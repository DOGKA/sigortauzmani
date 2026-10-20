import { NextResponse } from "next/server";
import { assertImage, storeContentImage } from "@/lib/blog/server";
import { jsonHandler, requireUser } from "@/lib/settings/server";

export async function POST(request: Request) {
  return jsonHandler(
    async () => {
      const user = await requireUser();
      if (!user) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });

      const file = (await request.formData()).get("file");
      if (!(file instanceof File)) throw new Error("Görsel seçilmedi.");
      assertImage(file);
      const url = await storeContentImage(Buffer.from(await file.arrayBuffer()));
      return NextResponse.json({ url });
    },
    "Görsel yüklenemedi.",
    400,
  );
}
