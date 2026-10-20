import { NextResponse } from "next/server";
import { assertImage, generateCover, storeCover } from "@/lib/blog/server";
import { jsonHandler, requireUser } from "@/lib/settings/server";

export const maxDuration = 180;

/**
 * JSON gövde: başlık ve içerikten Gemini ile kapak üretir.
 * Form gövdesi: seçilen dosyayı kapak olarak kaydeder.
 * Her iki durumda da yazıya bağlanmaz; panel "Kullan" deyince alana yazar.
 */
export async function POST(request: Request) {
  return jsonHandler(
    async () => {
      const user = await requireUser();
      if (!user) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });

      if ((request.headers.get("content-type") ?? "").includes("multipart/form-data")) {
        const file = (await request.formData()).get("file");
        if (!(file instanceof File)) throw new Error("Görsel seçilmedi.");
        assertImage(file);
        const src = await storeCover(Buffer.from(await file.arrayBuffer()));
        return NextResponse.json({ src });
      }

      const body = (await request.json()) as Record<string, unknown>;
      const title = typeof body.title === "string" ? body.title.trim() : "";
      const content = typeof body.content === "string" ? body.content : "";
      if (!title) throw new Error("Kapak üretmek için önce başlığı yazın.");
      if (content.replace(/<[^>]+>/g, "").trim().length < 40) {
        throw new Error("Kapak üretmek için içeriğe biraz metin yazın.");
      }

      const image = await generateCover({
        title,
        content,
        category: typeof body.category === "string" && body.category ? body.category : null,
        attempt: Number.isInteger(body.attempt) ? (body.attempt as number) : 0,
      });
      const src = await storeCover(image);
      return NextResponse.json({ src });
    },
    "Kapak oluşturulamadı.",
    400,
  );
}
