import { NextResponse } from "next/server";
import type { LegalLocale, LegalStatus } from "../../../../../shared/site-settings";
import { jsonHandler, requireUser, serviceClient } from "@/lib/settings/server";

const LOCALES = new Set<LegalLocale>(["tr", "en", "ar", "fa"]);
const STATUSES = new Set<LegalStatus>(["draft", "published", "unpublished"]);
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function authorized() {
  const user = await requireUser();
  return user;
}

export async function GET() {
  return jsonHandler(async () => {
    if (!(await authorized()))
      return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
    const service = serviceClient();
    const { data, error } = await service
      .from("legal_documents")
      .select("id,slug,locale,title,description,updated_at,versions:legal_document_versions(id,version,status,content,effective_at,published_at,updated_at)")
      .order("slug")
      .order("locale");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ documents: data });
  }, "Yasal belgeler alınamadı.");
}

export async function POST(request: Request) {
  return jsonHandler(
    async () => {
      const user = await authorized();
      if (!user) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
      const body = (await request.json()) as Record<string, unknown>;
      const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
      const locale = body.locale as LegalLocale;
      const title = typeof body.title === "string" ? body.title.trim() : "";
      if (!SLUG.test(slug) || !LOCALES.has(locale) || !title)
        return NextResponse.json({ error: "Belge alanlarını kontrol edin." }, { status: 400 });
      const service = serviceClient();
      const { data: document, error } = await service
        .from("legal_documents")
        .insert({
          slug,
          locale,
          title: title.slice(0, 200),
          description: typeof body.description === "string" ? body.description.slice(0, 500) : "",
        })
        .select("id")
        .single();
      if (error) throw error;
      const { error: versionError } = await service
        .from("legal_document_versions")
        .insert({
          document_id: document.id,
          version: 1,
          status: "draft",
          content: body.content ?? { intro: [], sections: [] },
          created_by: user.id,
        });
      if (versionError) throw versionError;
      return NextResponse.json({ id: document.id }, { status: 201 });
    },
    "Belge oluşturulamadı.",
    400,
  );
}

export async function PUT(request: Request) {
  return jsonHandler(
    async () => {
      const user = await authorized();
      if (!user) return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
      const body = (await request.json()) as Record<string, unknown>;
      const documentId = typeof body.documentId === "string" ? body.documentId : "";
      const status = body.status as LegalStatus;
      if (!documentId || !STATUSES.has(status))
        return NextResponse.json({ error: "Geçersiz sürüm işlemi." }, { status: 400 });
      const service = serviceClient();

      if (status === "draft") {
        const { data: latest, error: readError } = await service
          .from("legal_document_versions")
          .select("version")
          .eq("document_id", documentId)
          .order("version", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (readError) throw readError;
        const { error } = await service.from("legal_document_versions").insert({
          document_id: documentId,
          version: (latest?.version ?? 0) + 1,
          status: "draft",
          content: body.content ?? { intro: [], sections: [] },
          created_by: user.id,
        });
        if (error) throw error;
      } else {
        const versionId = typeof body.versionId === "string" ? body.versionId : "";
        if (!versionId) throw new Error("Sürüm seçilmedi.");
        if (status === "published") {
          const { error: unpublishError } = await service
            .from("legal_document_versions")
            .update({ status: "unpublished" })
            .eq("document_id", documentId)
            .eq("status", "published");
          if (unpublishError) throw unpublishError;
        }
        const { error } = await service
          .from("legal_document_versions")
          .update({
            status,
            content: body.content,
            effective_at: body.effectiveAt || null,
            published_at: status === "published" ? new Date().toISOString() : null,
          })
          .eq("id", versionId)
          .eq("document_id", documentId);
        if (error) throw error;
      }
      return NextResponse.json({ ok: true });
    },
    "Sürüm güncellenemedi.",
    400,
  );
}

export async function DELETE(request: Request) {
  return jsonHandler(
    async () => {
      if (!(await authorized()))
        return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
      const id = new URL(request.url).searchParams.get("id");
      if (!id) return NextResponse.json({ error: "Belge seçilmedi." }, { status: 400 });
      const { error } = await serviceClient().from("legal_documents").delete().eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    },
    "Belge silinemedi.",
    400,
  );
}
