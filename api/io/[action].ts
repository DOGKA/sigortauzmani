/**
 * IO API için allowlist'li proxy: referans listeleri ve sorgu uçları.
 *
 * Serbest path kabul edilmez. İstemci yalnızca ACTIONS içindeki anahtarları
 * çağırabilir; aksi hâlde partner token'ı ile IO'daki her uca erişilebilir
 * bir açık kapı bırakmış olurduk.
 *
 * Sorgu uçları (MERNİS, TRAMER, tescil) sigorta şirketlerinde ve kamu
 * servislerinde gerçek maliyet doğuruyor ve kötüye kullanılırsa ücretsiz bir
 * kimlik sorgulama servisine dönüşür. Bu yüzden IP başına sayaç zorunlu.
 *
 * Teklif oluşturma, primler ve satın alma buraya dahil değil; oturum kaydı
 * tuttukları için ayrı dosyalarda.
 */

import { errorResponse, ioFetch, ioKanal, jsonResponse } from "../_shared/io";
import { rateCheck } from "../_shared/iolog";
import { clientIp, hashIp, resolveSession, withCookie } from "../_shared/session";

export const config = { runtime: "edge" };

interface ActionDef {
  method: "GET" | "POST";
  /** IO tarafındaki yol. GET uçlarında query `buildQuery` ile eklenir. */
  path: string;
  /** İzin verilen query parametreleri; istemci başkasını gönderemez. */
  queryParams?: string[];
  /** Kanal alanı istemciden değil sunucudan gelir. */
  injectKanal?: boolean;
  rateLimit?: { limit: number; windowSeconds: number };
}

const HOUR = 3600;

const ACTIONS: Record<string, ActionDef> = {
  // --- Referans listeleri: maliyetsiz, geniş limit ---
  iller: { method: "GET", path: "/api/iller" },
  ilceler: { method: "GET", path: "/api/ilceler", queryParams: ["IlKodu"] },
  ulkeler: { method: "GET", path: "/api/ulkeler" },
  meslek: { method: "GET", path: "/api/teklif/meslek" },
  teminat: {
    method: "GET",
    path: "/api/teklif/teminat",
    queryParams: ["BransNo", "KT"],
  },
  adreskodu: {
    method: "GET",
    path: "/api/sorgu/adreskodu",
    queryParams: ["st", "deger"],
    rateLimit: { limit: 300, windowSeconds: HOUR },
  },
  // Marka / model listesi. POST ama yalnızca { st, Arac } taşır.
  bb: { method: "POST", path: "/api/bb", rateLimit: { limit: 300, windowSeconds: HOUR } },

  // --- Sorgular: maliyetli, dar limit ---
  mernis: {
    method: "POST",
    path: "/api/sorgu/mernis",
    injectKanal: true,
    rateLimit: { limit: 30, windowSeconds: HOUR },
  },
  tramer: {
    method: "POST",
    path: "/api/sorgu/tramer",
    injectKanal: true,
    rateLimit: { limit: 30, windowSeconds: HOUR },
  },
  tescilbelge: {
    method: "POST",
    path: "/api/sorgu/tescilbelge",
    injectKanal: true,
    rateLimit: { limit: 30, windowSeconds: HOUR },
  },
  dogumtarihi: {
    method: "POST",
    path: "/api/sorgu/dogumtarihi",
    rateLimit: { limit: 30, windowSeconds: HOUR },
  },
  "dask-sorgu": {
    method: "POST",
    path: "/api/sorgu/dask",
    rateLimit: { limit: 30, windowSeconds: HOUR },
  },

  // --- Teklif yardımcıları (oturum kaydı gerektirmeyenler) ---
  teklifdetay: {
    method: "POST",
    path: "/api/teklif/teklifdetay",
    rateLimit: { limit: 120, windowSeconds: HOUR },
  },
  teklifguncelle: {
    method: "POST",
    path: "/api/teklif/teklifguncelle",
    rateLimit: { limit: 120, windowSeconds: HOUR },
  },
  yazdir: {
    method: "GET",
    path: "/api/yazdir",
    queryParams: ["id", "tipi"],
    rateLimit: { limit: 120, windowSeconds: HOUR },
  },
};

function buildQuery(
  requestUrl: URL,
  allowed: string[] | undefined,
): string {
  if (!allowed?.length) return "";
  const params = new URLSearchParams();
  for (const key of allowed) {
    const value = requestUrl.searchParams.get(key);
    if (value !== null && value !== "") params.set(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export default async function handler(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const actionName = requestUrl.pathname.split("/").pop() ?? "";
  const action = ACTIONS[actionName];

  if (!action) {
    return jsonResponse({ error: "Bilinmeyen işlem." }, 404);
  }
  if (request.method !== action.method) {
    return jsonResponse({ error: "Yöntem desteklenmiyor." }, 405);
  }

  const session = await resolveSession(request);
  const ipHash = await hashIp(clientIp(request));

  if (action.rateLimit) {
    const allowed = await rateCheck(
      ipHash,
      actionName,
      action.rateLimit.limit,
      action.rateLimit.windowSeconds,
    );
    if (!allowed) {
      return withCookie(
        jsonResponse(
          { error: "Çok fazla deneme yaptınız. Lütfen biraz sonra tekrar deneyin." },
          429,
        ),
        session,
      );
    }
  }

  let body: unknown;
  if (action.method === "POST") {
    try {
      body = await request.json();
    } catch {
      return withCookie(jsonResponse({ error: "Geçersiz istek." }, 400), session);
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return withCookie(jsonResponse({ error: "Geçersiz istek." }, 400), session);
    }
    if (action.injectKanal) {
      body = { ...(body as Record<string, unknown>), Kanal: ioKanal() };
    }
  }

  const result = await ioFetch(
    `${action.path}${buildQuery(requestUrl, action.queryParams)}`,
    { method: action.method, body },
  );

  const response = result.ok
    ? jsonResponse(result.data)
    : errorResponse(result.error);

  return withCookie(response, session);
}
