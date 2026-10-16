import { readEnv } from "./_shared/supabase";

export const config = { runtime: "edge" };

interface IstekGovdesi {
  urun?: unknown;
  oturum?: unknown;
  aktif?: unknown;
}

const URUN_DESENI = /^[a-z0-9-]{1,80}$/;
const UUID_DESENI =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json(
      { error: "Yalnızca POST desteklenir." },
      { status: 405, headers: { allow: "POST" } },
    );
  }

  let govde: IstekGovdesi;
  try {
    govde = (await request.json()) as IstekGovdesi;
  } catch {
    return Response.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const urun = typeof govde.urun === "string" ? govde.urun : "";
  const oturum = typeof govde.oturum === "string" ? govde.oturum : "";
  const aktif = govde.aktif !== false;
  if (!URUN_DESENI.test(urun) || !UUID_DESENI.test(oturum)) {
    return Response.json({ error: "Geçersiz ürün veya oturum." }, { status: 400 });
  }

  const url = readEnv("SUPABASE_URL") ?? readEnv("VITE_SUPABASE_URL");
  const key = readEnv("VITE_SUPABASE_ANON_KEY") ?? readEnv("SUPABASE_ANON_KEY");
  if (!url || !key) {
    return Response.json({ sayi: null }, { status: 503 });
  }

  try {
    const response = await fetch(
      `${url}/rest/v1/rpc/urun_ziyaretci_guncelle`,
      {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          p_urun_slug: urun,
          p_oturum_id: oturum,
          p_aktif: aktif,
        }),
      },
    );

    if (!response.ok) {
      return Response.json({ sayi: null }, { status: 503 });
    }

    const sonuc: unknown = await response.json();
    const sayi =
      typeof sonuc === "number" && Number.isInteger(sonuc) && sonuc > 0
        ? sonuc
        : null;

    return Response.json(
      { sayi },
      {
        headers: {
          "cache-control": "no-store",
          "content-type": "application/json; charset=utf-8",
        },
      },
    );
  } catch {
    return Response.json({ sayi: null }, { status: 503 });
  }
}
