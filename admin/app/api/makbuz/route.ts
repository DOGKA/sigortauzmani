/**
 * Ödeme makbuzunu talep üzerine getirir: POST /api/makbuz { satinAlmaId }.
 *
 * Makbuz satın alma anında çoğu şirkette hazır olmuyor. `api/io/satinal.ts` o
 * an bulamadığında alanı null bırakıp bir daha denemiyor, dolayısıyla kayıt
 * kendiliğinden dolmuyor. Müşteriye "makbuzunuza ihtiyacınız olursa ekibimiz
 * iletir" dendiği için paneldeki kullanıcının belgeyi sonradan alabilmesi
 * gerekiyor.
 *
 * Sitedeki `api/io/belge.ts` ucu ziyaretçinin oturum çerezine bağlı olduğu
 * için panelden kullanılamıyor. Middleware `/api/makbuz` yolunu zaten oturum
 * arkasında tutuyor; buradaki kullanıcı kontrolü ikinci katman.
 */

import { NextResponse } from "next/server";
import { makbuzUrlGetir, teklifSatiriIdBul } from "@/lib/io/makbuz";
import { createClient } from "@/lib/supabase/server";

interface Govde {
  satinAlmaId?: string;
}

type SupabaseIstemcisi = Awaited<ReturnType<typeof createClient>>;

interface SatinAlmaOzeti {
  oturum_id: string;
  brans_no: number;
  sirket_kodu: string;
}

/**
 * Belge kimliği satın alma kaydında tutulmuyor.
 *
 * Önce prim listesinin veritabanına yazılmış hâline bakılıyor; orada yoksa
 * oturumun IO teklif numarasıyla liste yeniden okunuyor. İkinci yol her zaman
 * çalışıyor, birincisi yalnızca IO'ya gidilmesini önleyen kısa yol.
 */
async function ioTeklifSatirIdBul(
  supabase: SupabaseIstemcisi,
  kayit: SatinAlmaOzeti,
): Promise<number | null> {
  const { data: fiyat } = await supabase
    .from("teklif_fiyatlari")
    .select("io_teklif_satir_id")
    .eq("oturum_id", kayit.oturum_id)
    .eq("sirket_kodu", kayit.sirket_kodu)
    .not("io_teklif_satir_id", "is", null)
    .limit(1)
    .maybeSingle();

  const kayitliId = Number(fiyat?.io_teklif_satir_id);
  if (Number.isFinite(kayitliId) && kayitliId > 0) return kayitliId;

  const { data: oturum } = await supabase
    .from("teklif_oturumlari")
    .select("io_teklif_id")
    .eq("id", kayit.oturum_id)
    .maybeSingle();

  const teklifId = Number(oturum?.io_teklif_id);
  if (!Number.isFinite(teklifId) || teklifId <= 0) return null;

  return teklifSatiriIdBul(teklifId, kayit.brans_no, kayit.sirket_kodu);
}

/**
 * Adres bir kez alındıktan sonra kayda yazılıyor ki sonraki açılışlarda IO'ya
 * tekrar gidilmesin. satin_almalar'da authenticated rolünün update yetkisi
 * bilinçli olarak yok, o yüzden yazma service role ile. Anahtar tanımlı
 * değilse indirme yine çalışır, yalnızca adres kalıcı olmaz.
 */
async function makbuzuKaydet(satinAlmaId: string, url: string): Promise<void> {
  const servisAnahtari = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!servisAnahtari || !supabaseUrl) return;

  try {
    await fetch(
      `${supabaseUrl}/rest/v1/satin_almalar?id=eq.${encodeURIComponent(satinAlmaId)}`,
      {
        method: "PATCH",
        headers: {
          apikey: servisAnahtari,
          Authorization: `Bearer ${servisAnahtari}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ makbuz_pdf_url: url }),
      },
    );
  } catch (error) {
    console.error("Makbuz adresi kaydedilemedi:", error);
  }
}

/**
 * IO makbuzu vermediğinde panelde ne yazacağımızı poliçenin yaşı belirliyor.
 *
 * Belgeyi üreten şirketlerde makbuz poliçeyle birlikte ya da onu izleyen
 * saatlerde çıkıyor. Bir günü geçmişse beklemenin faydası olmuyor; o şirket
 * makbuzu entegrasyona hiç açmıyor demektir ve kullanıcıyı boşuna tekrar
 * denemeye yönlendirmemek gerekiyor.
 */
const BEKLEME_SINIRI_SAAT = 24;

function makbuzYokMesaji(
  olusturmaZamani: string | null,
  sirketAdi: string | null,
): string {
  const zaman = olusturmaZamani ? Date.parse(olusturmaZamani) : NaN;
  const yasSaat = Number.isNaN(zaman)
    ? null
    : (Date.now() - zaman) / 3_600_000;

  if (yasSaat === null || yasSaat < BEKLEME_SINIRI_SAAT) {
    return "Makbuz sigorta şirketinden henüz alınamadı. Bu belge genelde poliçenin kesilmesini izleyen saatler içinde hazır oluyor; biraz sonra tekrar deneyin.";
  }

  const sirket = sirketAdi?.trim() || "Sigorta şirketi";
  const gun = Math.floor(yasSaat / 24);
  const sure = gun >= 1 ? `${gun} gündür` : "bir günden uzun süredir";
  return `${sirket} bu poliçenin makbuzunu ${sure} vermiyor. Beklemenin faydası yok: bazı şirketler makbuzu entegrasyona hiç açmıyor. Belgeye ihtiyaç varsa şirketin kendi acente panelinden ya da müşteri hizmetlerinden isteyin.`;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Oturum bulunamadı." }, { status: 401 });
  }

  let govde: Govde;
  try {
    govde = (await request.json()) as Govde;
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const satinAlmaId = govde.satinAlmaId;
  if (!satinAlmaId) {
    return NextResponse.json(
      { error: "Satın alma kimliği eksik." },
      { status: 400 },
    );
  }

  const { data: kayit, error: kayitHatasi } = await supabase
    .from("satin_almalar")
    .select(
      "id, oturum_id, brans_no, sirket_kodu, sirket_adi, makbuz_pdf_url, created_at",
    )
    .eq("id", satinAlmaId)
    .maybeSingle();

  if (kayitHatasi) {
    return NextResponse.json({ error: kayitHatasi.message }, { status: 500 });
  }
  if (!kayit) {
    return NextResponse.json(
      { error: "Satın alma kaydı bulunamadı." },
      { status: 404 },
    );
  }
  if (kayit.makbuz_pdf_url) {
    return NextResponse.json({ url: kayit.makbuz_pdf_url as string });
  }

  const satirId = await ioTeklifSatirIdBul(supabase, kayit as SatinAlmaOzeti);
  if (satirId === null) {
    return NextResponse.json(
      { error: "Bu satın almanın teklif satırı bulunamadı, makbuz istenemiyor." },
      { status: 404 },
    );
  }

  const sonuc = await makbuzUrlGetir(satirId);
  if (!sonuc.ok) {
    // Makbuzun çıkmaması arıza değil: şirketlerin bir kısmı bu belgeyi
    // entegrasyona hiç açmıyor. Bekleyerek gelip gelmeyeceğini poliçenin
    // yaşından kestirebiliyoruz, mesajı da ona göre veriyoruz.
    return NextResponse.json(
      {
        error: makbuzYokMesaji(
          kayit.created_at as string | null,
          kayit.sirket_adi as string | null,
        ),
        ioMesaji: sonuc.mesaj,
      },
      { status: 404 },
    );
  }

  await makbuzuKaydet(satinAlmaId, sonuc.url);
  return NextResponse.json({ url: sonuc.url });
}
