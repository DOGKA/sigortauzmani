import { NextResponse } from "next/server";
import { dbError, validatePost } from "@/lib/blog/server";
import { BLOG_STATUSES, type BlogStatus } from "@/lib/blog/shared";
import { jsonHandler, requireUser, serviceClient } from "@/lib/settings/server";

const POST_COLUMNS =
  "id,slug,title,category,status,featured_image,view_count,published_at,updated_at,content,excerpt,meta_title,meta_description,tags";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Context = { params: Promise<{ id: string }> };

async function readId(context: Context): Promise<string> {
  const { id } = await context.params;
  if (!UUID.test(id)) throw new Error("Yazı bulunamadı.");
  return id;
}

export async function GET(_request: Request, context: Context) {
  return jsonHandler(async () => {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });

    const { data, error } = await serviceClient()
      .from("blog_posts")
      .select(POST_COLUMNS)
      .eq("id", await readId(context))
      .maybeSingle();
    if (error) throw dbError(error);
    if (!data) return NextResponse.json({ error: "Yazı bulunamadı." }, { status: 404 });
    return NextResponse.json({ post: data });
  }, "Yazı alınamadı.");
}

export async function PUT(request: Request, context: Context) {
  return jsonHandler(
    async () => {
      const user = await requireUser();
      if (!user) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });

      const id = await readId(context);
      const input = validatePost(await request.json());
      const service = serviceClient();

      const { data: current, error: readError } = await service
        .from("blog_posts")
        .select("published_at")
        .eq("id", id)
        .maybeSingle();
      if (readError) throw dbError(readError);
      if (!current) return NextResponse.json({ error: "Yazı bulunamadı." }, { status: 404 });

      const { error } = await service
        .from("blog_posts")
        .update({
          ...input,
          ...(input.status === "PUBLISHED" && !current.published_at
            ? { published_at: new Date().toISOString() }
            : {}),
        })
        .eq("id", id);
      if (error) throw dbError(error);
      return NextResponse.json({ ok: true });
    },
    "Yazı kaydedilemedi.",
    400,
  );
}

/** Listedeki hızlı yayınla / yayından kaldır. */
export async function PATCH(request: Request, context: Context) {
  return jsonHandler(
    async () => {
      const user = await requireUser();
      if (!user) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });

      const id = await readId(context);
      const { status } = (await request.json()) as { status?: BlogStatus };
      if (!status || !BLOG_STATUSES.includes(status)) throw new Error("Durum geçersiz.");

      const service = serviceClient();
      const { data: current, error: readError } = await service
        .from("blog_posts")
        .select("category,content,published_at")
        .eq("id", id)
        .maybeSingle();
      if (readError) throw dbError(readError);
      if (!current) return NextResponse.json({ error: "Yazı bulunamadı." }, { status: 404 });
      if (status === "PUBLISHED") {
        if (!current.category) throw new Error("Yayınlamak için önce kategori seçin.");
        if (!current.content?.replace(/<[^>]+>/g, "").trim()) {
          throw new Error("Yayınlamak için önce içerik girin.");
        }
      }

      const { error } = await service
        .from("blog_posts")
        .update({
          status,
          ...(status === "PUBLISHED" && !current.published_at
            ? { published_at: new Date().toISOString() }
            : {}),
        })
        .eq("id", id);
      if (error) throw dbError(error);
      return NextResponse.json({ ok: true });
    },
    "Durum değiştirilemedi.",
    400,
  );
}

export async function DELETE(_request: Request, context: Context) {
  return jsonHandler(
    async () => {
      const user = await requireUser();
      if (!user) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });

      const { error } = await serviceClient()
        .from("blog_posts")
        .delete()
        .eq("id", await readId(context));
      if (error) throw dbError(error);
      return NextResponse.json({ ok: true });
    },
    "Yazı silinemedi.",
    400,
  );
}
