import {
  createClient as createServiceClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { BulkResource } from "@/lib/bulk-actions";

interface RequestBody {
  resource?: BulkResource;
  ids?: unknown;
}

const MAX_DELETE_COUNT = 500;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validIds(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= MAX_DELETE_COUNT &&
    value.every((id) => typeof id === "string" && UUID_PATTERN.test(id))
  );
}

async function deleteNotificationStates(
  service: SupabaseClient,
  source: "talep" | "iptal_talep" | "iletisim" | "police",
  ids: string[],
) {
  if (!ids.length) return;
  const { error } = await service
    .from("admin_bildirim_durumlari")
    .delete()
    .eq("kaynak", source)
    .in("kayit_id", ids);
  if (error) {
    // Ana kayıt silindi; bildirim izi temizlenememesi işlemi başarısız
    // göstermesin. Tekrar silme denemesi artık kaynak satırı bulamaz.
    console.error("Bildirim durumları temizlenemedi:", error);
  }
}

export async function POST(request: Request) {
  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  if (!validIds(body.ids)) {
    return NextResponse.json(
      { error: `1-${MAX_DELETE_COUNT} geçerli kayıt seçin.` },
      { status: 400 },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Sunucu silme yapılandırması eksik." },
      { status: 500 },
    );
  }

  const service = createServiceClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const ids = [...new Set(body.ids)];

  try {
    if (body.resource === "talepler") {
      const { error } = await service.from("talepler").delete().in("id", ids);
      if (error) throw error;
      await deleteNotificationStates(service, "talep", ids);
    } else if (body.resource === "iptal-talepleri") {
      const { data: records, error: readError } = await service
        .from("iptal_talepleri")
        .select("belge_path")
        .in("id", ids);
      if (readError) throw readError;
      const { error } = await service
        .from("iptal_talepleri")
        .delete()
        .in("id", ids);
      if (error) throw error;
      await deleteNotificationStates(service, "iptal_talep", ids);
      const paths = (records ?? [])
        .map((record) => record.belge_path as string | null)
        .filter((path): path is string => Boolean(path));
      if (paths.length) {
        const { error: storageError } = await service.storage
          .from("iptal-belgeleri")
          .remove(paths);
        if (storageError) console.error("İptal belgeleri silinemedi:", storageError);
      }
    } else if (body.resource === "iletisim") {
      const { data: records, error: readError } = await service
        .from("iletisim_talepleri")
        .select("belge_path")
        .in("id", ids);
      if (readError) throw readError;
      const { error } = await service
        .from("iletisim_talepleri")
        .delete()
        .in("id", ids);
      if (error) throw error;
      await deleteNotificationStates(service, "iletisim", ids);
      const paths = (records ?? [])
        .map((record) => record.belge_path as string | null)
        .filter((path): path is string => Boolean(path));
      if (paths.length) {
        const { error: storageError } = await service.storage
          .from("iletisim-belgeleri")
          .remove(paths);
        if (storageError) console.error("İletişim belgeleri silinemedi:", storageError);
      }
    } else if (body.resource === "policeler") {
      const { error } = await service
        .from("satin_almalar")
        .delete()
        .in("id", ids);
      if (error) throw error;
      await deleteNotificationStates(service, "police", ids);
    } else if (body.resource === "teklif-gecmisi") {
      // satin_almalar FK'si RESTRICT olduğu için önce bağlı satın almalar
      // temizlenir; teklif_fiyatlari parent silinince CASCADE ile gider.
      const { data: purchases, error: purchaseReadError } = await service
        .from("satin_almalar")
        .select("id")
        .in("oturum_id", ids);
      if (purchaseReadError) throw purchaseReadError;
      const purchaseIds = (purchases ?? []).map((purchase) => purchase.id as string);
      const { error: purchaseError } = await service
        .from("satin_almalar")
        .delete()
        .in("oturum_id", ids);
      if (purchaseError) throw purchaseError;
      await deleteNotificationStates(service, "police", purchaseIds);
      const { error } = await service
        .from("teklif_oturumlari")
        .delete()
        .in("id", ids);
      if (error) throw error;
    } else {
      return NextResponse.json(
        { error: "Desteklenmeyen kayıt türü." },
        { status: 400 },
      );
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Kayıtlar silinemedi.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ deleted: ids.length });
}
