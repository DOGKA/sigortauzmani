import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { supabaseServerUrl } from "@/lib/supabase/url";
import {
  BLOG_STATUSES,
  SLUG_PATTERN,
  siteOrigin,
  type BlogPostInput,
  type BlogStatus,
} from "./shared";

const BUCKET = "blog";
/** Gemini 2K kapaklar ~3.5 MB; yükleme ve nginx ile aynı tavan. */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/** Kapının yolu (`/sb`); site ve panel alan adlarında aynı. */
function gatewayPath(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) throw new Error("NEXT_PUBLIC_SUPABASE_URL tanımlı değil.");
  return new URL(raw).pathname.replace(/\/+$/, "");
}

async function putObject(objectPath: string, data: Buffer, type: string): Promise<void> {
  const url = supabaseServerUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase sunucu yapılandırması eksik.");
  const response = await fetch(`${url.replace(/\/+$/, "")}/storage/v1/object/${BUCKET}/${objectPath}`, {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, apikey: key, "content-type": type },
    body: new Uint8Array(data),
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.message ?? `Görsel kaydedilemedi (${response.status}).`);
  }
}

function newId(): string {
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `${day}-${randomBytes(6).toString("hex")}`;
}

export function assertImage(file: File): void {
  if (!IMAGE_TYPES.has(file.type)) throw new Error("Yalnızca JPG, PNG, WebP veya GIF yüklenebilir.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Görsel en fazla 20 MB olabilir.");
}

/**
 * Yazı içi görsel: genişliği 1600'ü aşmayan WebP. Yazı gövdesi panelde de
 * gösterildiği için tam adres döner.
 */
export async function storeContentImage(input: Buffer): Promise<string> {
  const data = await sharp(input, { animated: true })
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toBuffer();
  const objectPath = `icerik/${newId()}.webp`;
  await putObject(objectPath, data, "image/webp");
  return `${siteOrigin()}${gatewayPath()}/storage/v1/object/public/${BUCKET}/${objectPath}`;
}

/**
 * Kapak: sitedeki statik kapaklarla aynı düzen (`-1600` ve `-800`).
 * `featured_image` için site köküne göre göreli yol döner.
 */
export async function storeCover(input: Buffer): Promise<string> {
  const id = newId();
  for (const width of [1600, 800]) {
    const data = await sharp(input)
      .rotate()
      .resize({ width, height: Math.round((width * 9) / 16), fit: "cover" })
      .webp({ quality: width > 800 ? 72 : 70, effort: 5 })
      .toBuffer();
    await putObject(`kapak/${id}-${width}.webp`, data, "image/webp");
  }
  return `${gatewayPath()}/storage/v1/object/public/${BUCKET}/kapak/${id}-1600.webp`;
}

/* ---- Kapak üretimi (scripts/blog-gorselleri-uret.mjs ile aynı yönerge) ---- */

const KATEGORI_SAHNE: Record<string, string[]> = {
  "Araç Sigortaları": [
    "two cars stopped after a minor fender-bender at a city intersection",
    "a car being lifted onto a tow truck on a highway shoulder",
    "a mechanic inspecting a dented bumper in a bright repair workshop",
    "a car parked on a tree-lined residential street with a scratch on its door",
    "a driver handing over keys at a dealership forecourt",
    "a cracked windscreen being replaced by a technician",
    "a car driving along a coastal road",
    "an electric car charging at a public charging station",
    "a family loading luggage into a car before a road trip",
    "a car on a mountain road after fresh snow, under clear sky",
    "a multi-storey car park with a single car in focus",
    "a hail-dented car roof in a driveway",
  ],
  "Sağlık Sigortaları": [
    "a doctor talking with a patient in a bright consultation room",
    "a nurse checking on a patient in a modern hospital room",
    "a physiotherapist guiding a knee exercise",
    "a parent holding a newborn in a maternity ward",
    "a paediatrician examining a smiling child",
    "a pharmacist handing medicine across a counter",
    "an older couple walking in a park",
    "a dentist at work in a clean clinic",
    "a runner stretching on a riverside path",
    "an ambulance parked at a hospital entrance",
    "a lab technician handling blood sample tubes",
  ],
  "Konut ve DASK": [
    "a living room with a water stain spreading across the ceiling",
    "a plumber fixing a leaking pipe under a kitchen sink",
    "an apartment building facade with balconies and plants",
    "a family carrying moving boxes into a new home",
    "a cracked wall being inspected by an engineer in a hard hat",
    "a cosy living room with sunlight through large windows",
    "a detached house with a garden after a storm, a fallen branch on the lawn",
    "a building under renovation with scaffolding",
    "keys being handed over at the door of a flat",
    "a quiet residential street after rain",
    "a smoke detector on a bright kitchen ceiling",
  ],
  "Seyahat Sigortaları": [
    "a traveller waiting at an airport gate with a large window view of planes",
    "a suitcase going around an empty baggage carousel",
    "a couple walking with luggage through an old-town street",
    "a hiker on a mountain trail with a wide valley behind",
    "a beach resort promenade in the morning",
    "a traveller at a hotel reception desk",
    "a train platform with a high-speed train arriving",
    "a student with a backpack outside a university building abroad",
    "a family at a ski resort",
    "a traveller being helped by a doctor in a foreign clinic",
    "a ferry crossing a bright blue sea",
  ],
  "Sigorta Rehberi": [
    "a small business owner opening the shutter of their shop",
    "a family in their kitchen on a weekday morning",
    "two people shaking hands outside an office building",
    "a craftsman working in a sunny workshop",
    "a farmer walking through a green field",
    "a young couple on their new apartment balcony",
    "a café owner arranging tables on a terrace",
    "a busy pedestrian street seen from above",
    "an older man gardening in his backyard",
    "a delivery van parked outside a warehouse",
  ],
};

const GENEL_SAHNE = [
  "an everyday moment related to the topic, in a city street",
  "an everyday moment related to the topic, at home",
  "an everyday moment related to the topic, in a workplace",
];

const ORTAMLAR = [
  "a Western European city",
  "a Mediterranean coastal town",
  "a Scandinavian town",
  "a North American suburb",
  "a modern East Asian city",
  "a Latin American city",
  "a contemporary Middle Eastern city",
  "a Central European old town",
  "an Australian coastal city",
  "a countryside village",
  "a large international metropolis",
  "a present-day Turkish city",
];

const KISILER = [
  "a young woman in her late twenties",
  "a couple in their thirties",
  "a retired man in his sixties",
  "a family with a young child",
  "a young male driver in his early twenties",
  "a woman in her forties",
  "no people at all; let objects, vehicles or the place tell the story",
  "an elderly woman with her adult daughter",
  "a man in his forties",
  "a young professional woman in her thirties",
  "a group of friends in their twenties",
  "a father with a teenage son",
  "a middle-aged couple",
  "a professional at work (mechanic, nurse, engineer or similar)",
];

const CEKIMLER = [
  "wide establishing shot outdoors",
  "medium shot at eye level",
  "close-up detail shot with a shallow depth of field",
  "over-the-shoulder shot",
  "street-level view with depth and perspective",
  "high-angle view from a balcony or window",
  "low-angle shot looking slightly up",
  "candid documentary-style shot",
  "aerial drone view",
  "shot through a doorway or window frame",
];

const MEVSIMLER = [
  "spring, fresh green leaves",
  "bright summer day",
  "early autumn with a few coloured leaves",
  "crisp clear winter day",
  "late morning",
  "midday",
];

function sec<T>(liste: T[], anahtar: string, tuz: number): T {
  let h = tuz;
  for (const ch of anahtar) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return liste[h % liste.length];
}

function plainText(html: string): string {
  return html
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface CoverRequest {
  title: string;
  content: string;
  category: string | null;
  /** Aynı yazı için her "yeniden üret" farklı kişi ve çekim dener. */
  attempt: number;
}

export function coverPrompt({ title, content, category, attempt }: CoverRequest): string {
  const sahneler = (category && KATEGORI_SAHNE[category]) || GENEL_SAHNE;
  const ozet = plainText(content).slice(0, 700);
  const anahtar = `${title}#${attempt}`;
  return [
    "Create a cover photo for an insurance blog article.",
    `Article title (Turkish): "${title}"`,
    `Article summary (Turkish): "${ozet}"`,
    `Category: ${category ?? "Sigorta"}.`,
    "Show the specific real-life situation this article is about, as it happens, so a reader instantly connects the image to the title.",
    `Suggested scene: ${sec(sahneler, anahtar, 3)}. Use it if it fits the article; otherwise choose a different scene that clearly matches the title.`,
    `Location: ${sec(ORTAMLAR, anahtar, 5)}. Time: ${sec(MEVSIMLER, anahtar, 11)}.`,
    `Subject: ${sec(KISILER, anahtar, 7)}. Framing: ${sec(CEKIMLER, anahtar, 13)}.`,
    "Avoid the cliché of someone sitting at a desk or table reading papers, holding documents or looking at a laptop or phone. No paperwork in the frame.",
    "Style: realistic editorial photography, soft depth of field, clean composition with some empty space.",
    "Lighting: always bright and clearly lit. Use clean daylight outdoors, or even neutral indoor light. The main subject must be easy to see, not lost in shadow.",
    "Do not make the scene gloomy, dark, grey, overcast or pessimistic, even when the topic is an accident, damage or a claim. Keep the situation recognizable and the mood open.",
    "Colour: natural and neutral, with at most a hint of sky blue. Do not apply a yellow, amber, sepia, golden-hour or warm tungsten colour grade.",
    "People, places and vehicles should look contemporary and international, with a natural mix of backgrounds. Do not add landmarks or national symbols that tie the image to one country.",
    "Do not include any text, letters, numbers, logos, flags, watermarks, licence plates or brand names. No charts, no UI screenshots, no collage.",
    "Keep shop signs, storefronts, information boards and screens out of frame, or so blurred that nothing is legible. Cars are generic unbadged models with no grille emblem, and their plates are blank or hidden. Aircraft have a plain white livery without airline markings. Uniforms have no lettering.",
  ].join("\n");
}

const COVER_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-3-pro-image";

export async function generateCover(request: CoverRequest): Promise<Buffer> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Sunucuda GEMINI_API_KEY tanımlı değil.");

  const body = JSON.stringify({
    contents: [{ parts: [{ text: coverPrompt(request) }] }],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: "16:9", imageSize: "2K" },
    },
  });

  for (let attempt = 1; ; attempt += 1) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${COVER_MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body,
        signal: AbortSignal.timeout(120_000),
      },
    );
    if (response.ok) {
      const data = await response.json();
      const parts: { inlineData?: { data?: string } }[] = data.candidates?.[0]?.content?.parts ?? [];
      const image = parts.find((part) => part.inlineData?.data);
      if (!image?.inlineData?.data) {
        const reason = data.candidates?.[0]?.finishReason ?? data.promptFeedback?.blockReason;
        throw new Error(`Görsel üretilemedi (${reason ?? "yanıt boş"}). Tekrar deneyin.`);
      }
      return Buffer.from(image.inlineData.data, "base64");
    }
    if ([401, 402, 403].includes(response.status)) {
      throw new Error("Görsel servisi isteği kabul etmedi (API anahtarı veya kredi).");
    }
    const retry = response.status === 429 || response.status >= 500;
    if (!retry || attempt >= 3) {
      throw new Error(`Görsel servisi hata verdi (${response.status}). Tekrar deneyin.`);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000 * 2 ** attempt));
  }
}

/* ---- Yazı doğrulama ---- */

function text(value: unknown, field: string, max: number, required = false): string | null {
  if (value === undefined || value === null || value === "") {
    if (required) throw new Error(`${field} zorunlu.`);
    return null;
  }
  if (typeof value !== "string") throw new Error(`${field} geçersiz.`);
  const trimmed = value.trim();
  if (required && !trimmed) throw new Error(`${field} zorunlu.`);
  if (trimmed.length > max) throw new Error(`${field} en fazla ${max} karakter olabilir.`);
  return trimmed || null;
}

export function validatePost(raw: unknown): BlogPostInput {
  if (!raw || typeof raw !== "object") throw new Error("Geçersiz istek.");
  const body = raw as Record<string, unknown>;

  const slug = text(body.slug, "Adres (slug)", 120, true)!;
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error("Adres yalnızca küçük harf, rakam ve tire içerebilir.");
  }

  const status = (body.status ?? "DRAFT") as BlogStatus;
  if (!BLOG_STATUSES.includes(status)) throw new Error("Durum geçersiz.");

  const category = text(body.category, "Kategori", 80);
  if (status === "PUBLISHED" && !category) throw new Error("Yayınlamak için kategori seçin.");

  const content = typeof body.content === "string" ? body.content : "";
  if (content.length > 500_000) throw new Error("İçerik çok uzun.");
  if (status === "PUBLISHED" && !plainText(content)) throw new Error("Yayınlamak için içerik girin.");

  const featured = text(body.featured_image, "Kapak görseli", 500);
  if (featured && !/^(\/|https?:\/\/)/i.test(featured)) throw new Error("Kapak görseli adresi geçersiz.");

  return {
    slug,
    title: text(body.title, "Başlık", 200, true)!,
    category,
    status,
    featured_image: featured,
    content,
    excerpt: text(body.excerpt, "Kısa özet", 400),
    meta_title: text(body.meta_title, "SEO başlığı", 120),
    meta_description: text(body.meta_description, "SEO açıklaması", 300),
  };
}

/** PostgREST hataları `Error` değil; `jsonHandler` mesajı okuyabilsin. */
export function dbError(error: { code?: string; message: string }): Error {
  if (error.code === "23505") return new Error("Bu adres (slug) başka bir yazıda kullanılıyor.");
  return new Error(error.message);
}
