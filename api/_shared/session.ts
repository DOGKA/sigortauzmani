/**
 * Üyeliksiz teklif akışı için anonim oturum.
 *
 * Site giriş istemediği hâlde her teklifin bir sahibi olması gerekiyor:
 * primler polling'i, teklif güncelleme ve satın alma aynı oturuma bağlanmalı,
 * admin panelde de yolculuk tek satırda görünmeli. Bu yüzden ilk istekte
 * imzalı bir çerez veriliyor.
 *
 * IP adresi rate limit ve kötüye kullanım takibi için gerekli ama kişisel
 * veri; ham hâlde saklanmıyor, SESSION_SECRET ile tuzlanıp hash'leniyor.
 */

import { readEnv } from "./supabase";

export const SESSION_COOKIE = "su_sid";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 6;

function secret(): string | null {
  return readEnv("SESSION_SECRET") ?? null;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(value: string, key: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(value),
  );
  return toHex(signature);
}

/** Sabit süreli karşılaştırma; imza doğrulamasında zamanlama sızıntısını önler. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Rate limit'in dayandığı IP; istemci tarafından taklit edilemiyor olması
 * gerekiyor.
 *
 * Vercel gelen `x-forwarded-for`ı kendisi ezdiği için düz kurulumda güvenli,
 * ama platform garantisi yalnızca `x-vercel-forwarded-for` başlığında; önüne
 * bir proxy girse bile bu başlık korunuyor. Zincir başlıklarında istemcinin
 * ekleyebildiği uç en soldaki olduğundan **en sağdaki** değer alınıyor.
 */
export function clientIp(request: Request): string {
  for (const header of ["x-vercel-forwarded-for", "x-forwarded-for"]) {
    const zincir = request.headers.get(header);
    if (!zincir) continue;
    const parcalar = zincir
      .split(",")
      .map((parca) => parca.trim())
      .filter(Boolean);
    const enSag = parcalar.at(-1);
    if (enSag) return enSag;
  }
  // Tek değerli başlık; zincir olmadığı için olduğu gibi okunuyor.
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function hashIp(ip: string): Promise<string> {
  const key = secret();
  if (!key) return "unsalted";
  // Tuzlanmış hash: aynı ziyaretçiyi tanıyabilmek için deterministik,
  // ama tuz olmadan IP'ye geri çevrilemez.
  return (await hmac(`ip:${ip}`, key)).slice(0, 32);
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [rawKey, ...rest] = part.split("=");
    if (rawKey?.trim() === name) return rest.join("=").trim() || null;
  }
  return null;
}

export interface Session {
  id: string;
  /** Çerez yeni üretildiyse yanıta eklenmesi gereken Set-Cookie değeri. */
  setCookie: string | null;
}

function buildCookie(value: string): string {
  return [
    `${SESSION_COOKIE}=${value}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`,
  ].join("; ");
}

/**
 * Geçerli oturumu döner, yoksa yeni bir tane üretir.
 * Çerez `<id>.<imza>` biçiminde; imza tutmazsa çerez yok sayılır.
 */
export async function resolveSession(request: Request): Promise<Session> {
  const key = secret();
  const existing = readCookie(request, SESSION_COOKIE);

  if (existing && key) {
    const separator = existing.lastIndexOf(".");
    if (separator > 0) {
      const id = existing.slice(0, separator);
      const signature = existing.slice(separator + 1);
      if (safeEqual(await hmac(id, key), signature)) {
        return { id, setCookie: null };
      }
    }
  }

  const id = crypto.randomUUID();
  if (!key) {
    // İmzalayamıyorsak çerez vermiyoruz; oturum tek istek boyunca yaşar.
    return { id, setCookie: null };
  }
  const signature = await hmac(id, key);
  return { id, setCookie: buildCookie(`${id}.${signature}`) };
}

export function withCookie(response: Response, session: Session): Response {
  if (!session.setCookie) return response;
  const headers = new Headers(response.headers);
  headers.append("set-cookie", session.setCookie);
  return new Response(response.body, { status: response.status, headers });
}
