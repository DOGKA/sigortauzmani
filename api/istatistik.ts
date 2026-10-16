import { readEnv } from "./_shared/supabase";

export const config = { runtime: "edge" };

export interface TeklifIstatistik {
  teklif_toplam: number | null;
  police_toplam: number | null;
  sirket_sayisi: number | null;
  /** Branş numarası → son 90 günde en çok satın alınan şirket kodu. */
  populer: Record<string, string>;
}

const BOS: TeklifIstatistik = {
  teklif_toplam: null,
  police_toplam: null,
  sirket_sayisi: null,
  populer: {},
};

function sayi(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function populerHaritasi(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  const sonuc: Record<string, string> = {};
  for (const [brans, kod] of Object.entries(value)) {
    if (/^\d+$/.test(brans) && typeof kod === "string" && kod) sonuc[brans] = kod;
  }
  return sonuc;
}

export default async function handler(): Promise<Response> {
  const url = readEnv("SUPABASE_URL") ?? readEnv("VITE_SUPABASE_URL");
  const key = readEnv("VITE_SUPABASE_ANON_KEY") ?? readEnv("SUPABASE_ANON_KEY");
  let sonuc = BOS;

  if (url && key) {
    try {
      const response = await fetch(
        `${url}/rest/v1/rpc/get_public_teklif_istatistik`,
        {
          method: "POST",
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            "content-type": "application/json",
          },
          body: "{}",
        },
      );
      if (response.ok) {
        const ham = (await response.json()) as Record<string, unknown> | null;
        sonuc = {
          teklif_toplam: sayi(ham?.teklif_toplam),
          police_toplam: sayi(ham?.police_toplam),
          sirket_sayisi: sayi(ham?.sirket_sayisi),
          populer: populerHaritasi(ham?.populer),
        };
      }
    } catch {
      // Şerit boş döner ve arayüzde gizlenir.
    }
  }

  // Sorgu tüm teklif ve satış tablolarını sayıyor; her ziyaretçide çalışmasın.
  return Response.json(sonuc, {
    headers: {
      "cache-control":
        "public, max-age=300, s-maxage=1800, stale-while-revalidate=86400",
      "content-type": "application/json; charset=utf-8",
    },
  });
}
