import { NextResponse } from "next/server";
import { dbError, validatePost } from "@/lib/blog/server";
import { jsonHandler, requireUser, serviceClient } from "@/lib/settings/server";

const LIST_COLUMNS =
  "id,slug,title,category,status,featured_image,view_count,published_at,updated_at";

export async function GET() {
  return jsonHandler(async () => {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });

    const { data, error } = await serviceClient()
      .from("blog_posts")
      .select(LIST_COLUMNS)
      .order("updated_at", { ascending: false, nullsFirst: false });
    if (error) throw dbError(error);
    return NextResponse.json({ posts: data ?? [] });
  }, "Yazılar alınamadı.");
}

export async function POST(request: Request) {
  return jsonHandler(
    async () => {
      const user = await requireUser();
      if (!user) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });

      const input = validatePost(await request.json());
      const { data, error } = await serviceClient()
        .from("blog_posts")
        .insert({
          ...input,
          published_at: input.status === "PUBLISHED" ? new Date().toISOString() : null,
        })
        .select("id")
        .single();
      if (error) throw dbError(error);
      return NextResponse.json({ id: data.id }, { status: 201 });
    },
    "Yazı kaydedilemedi.",
    400,
  );
}
