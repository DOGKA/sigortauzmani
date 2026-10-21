/**
 * Yayındaki blog yazıları için Gemini ile kapak görseli üretir.
 *
 * Yazılar canlı sitenin herkese açık kart listesinden okunur; prompt başlık,
 * özet ve kategoriden hazırlanır. Görseller `blog-gorselleri/<slug>.<uzantı>`
 * olarak kaydedilir, prompt ve sonuçlar `blog-gorselleri/manifest.json`a
 * yazılır. Dosyası olan yazı atlanır; yarıda kalırsa aynı komut kaldığı
 * yerden devam eder.
 *
 * Anahtar: .env.local içinde GEMINI_API_KEY
 *
 * Kullanım:
 *   node scripts/blog-gorselleri-uret.mjs --dry-run        # sayı ve örnek prompt
 *   node scripts/blog-gorselleri-uret.mjs --limit 3        # ilk 3 yazı (deneme)
 *   node scripts/blog-gorselleri-uret.mjs                  # hepsi
 *   node scripts/blog-gorselleri-uret.mjs --only <slug>    # tek yazı
 *   node scripts/blog-gorselleri-uret.mjs --force          # var olanları yeniden üret
 *   node scripts/blog-gorselleri-uret.mjs --kontrol        # kontrol.json'da işaretlenenleri yeniden üret
 *
 * Diğer seçenekler: --concurrency 3, --aspect 16:9, --size 1K|2K|4K,
 * --model gemini-3-pro-image (Pro'da 1K ve 2K aynı fiyat)
 */

import { existsSync, readFileSync } from "node:fs";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "blog-gorselleri");
const MANIFEST = path.join(OUT_DIR, "manifest.json");
const KONTROL = path.join(OUT_DIR, "kontrol.json");
const CARDS_URL =
  process.env.BLOG_CARDS_URL ??
  "https://sigortauzmani.net/sb/rest/v1/blog_post_cards?select=slug,title,excerpt,category&order=published_at.desc";

function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (process.env[key.trim()] === undefined) {
      process.env[key.trim()] = rest.join("=").trim().replace(/^['"]|['"]$/g, "");
    }
  }
}

function args() {
  const argv = process.argv.slice(2);
  const value = (name, fallback) => {
    const i = argv.indexOf(`--${name}`);
    return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
  };
  return {
    dryRun: argv.includes("--dry-run"),
    force: argv.includes("--force"),
    kontrol: argv.includes("--kontrol"),
    only: value("only", null),
    limit: Number(value("limit", "0")) || 0,
    concurrency: Math.max(1, Number(value("concurrency", "3")) || 3),
    aspect: value("aspect", "16:9"),
    size: value("size", "2K"),
    model: value("model", "gemini-3-pro-image"),
  };
}

const KATEGORI_SAHNE = {
  "Araç Sigortaları":
    "on the road, at a parking spot, a minor collision on a city street, a repair garage, a car wash, a rainy or snowy road, a car interior",
  "Sağlık Sigortaları":
    "a modern hospital corridor, a doctor's consultation room, a pharmacy counter, a physiotherapy session, a family at a paediatric check-up, an active healthy moment outdoors",
  "Konut ve DASK":
    "an apartment building facade, a living room, a kitchen with water damage, a balcony, a neighbourhood street after rain, a building under renovation",
  "Seyahat Sigortaları":
    "an airport terminal, a boarding gate, a hotel room, luggage at a carousel, a European old-town street, a mountain or beach destination",
  "Sigorta Rehberi":
    "the real-life moment behind the topic: at home with family, outside a shop, on the street, at a service counter, in a car",
};

/** Görseller birbirine benzemesin diye her yazıya sabit ama farklı bir kişi ve çekim seçilir. */
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
];

const CEKIMLER = [
  "wide establishing shot outdoors",
  "medium shot at eye level",
  "close-up detail shot with a shallow depth of field",
  "over-the-shoulder shot",
  "street-level view with depth and perspective",
  "high-angle view from a balcony or window",
];

function sec(liste, slug, tuz) {
  let h = tuz;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return liste[h % liste.length];
}

function prompt(post) {
  const sahne = KATEGORI_SAHNE[post.category] ?? "an everyday situation related to insurance";
  return [
    "Create a cover photo for a Turkish insurance blog article.",
    `Article title (Turkish): "${post.title}"`,
    `Article summary (Turkish): "${post.excerpt}"`,
    `Category: ${post.category ?? "Sigorta"}. Possible settings: ${sahne}.`,
    "Show the specific real-life situation this article is about, as it happens, so a reader instantly connects the image to the title.",
    `Subject: ${sec(KISILER, post.slug, 7)}. Framing: ${sec(CEKIMLER, post.slug, 13)}.`,
    "Avoid the cliché of someone sitting at a desk or table reading papers, holding documents or looking at a laptop or phone. No paperwork in the frame.",
    "Style: realistic editorial photography, soft depth of field, clean composition with some empty space.",
    "Lighting: always bright and clearly lit. Use clean daylight outdoors, or even neutral indoor light. The main subject must be easy to see, not lost in shadow.",
    "Do not make the scene gloomy, dark, grey, overcast or pessimistic, even when the topic is an accident, damage or a claim. Keep the situation recognizable and the mood open.",
    "Colour: natural and neutral, with at most a hint of sky blue. Do not apply a yellow, amber, sepia, golden-hour or warm tungsten colour grade.",
    "People, places and vehicles should look like present-day Turkey.",
    "Do not include any text, letters, numbers, logos, flags, watermarks, licence plates or brand names. No charts, no UI screenshots, no collage.",
    "Keep shop signs, storefronts, information boards and screens out of frame, or so blurred that nothing is legible. Cars are generic unbadged models with no grille emblem, and their plates are blank or hidden. Aircraft have a plain white livery without airline markings. Uniforms have no lettering.",
  ].join("\n");
}

async function fetchPosts() {
  const response = await fetch(CARDS_URL);
  if (!response.ok) throw new Error(`Blog listesi alınamadı (${response.status}).`);
  const rows = await response.json();
  return rows.filter((row) => row.slug && row.title);
}

const EXT = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

async function generate(post, opts, key) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${opts.model}:generateContent`;
  const body = {
    contents: [{ parts: [{ text: prompt(post) }] }],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: opts.aspect, imageSize: opts.size },
    },
  };

  for (let deneme = 1; ; deneme += 1) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      const data = await response.json();
      const parts = data.candidates?.[0]?.content?.parts ?? [];
      const image = parts.find((part) => part.inlineData?.data);
      if (!image) {
        const neden = data.candidates?.[0]?.finishReason ?? data.promptFeedback?.blockReason;
        throw new Error(`Görsel dönmedi (${neden ?? "bilinmiyor"})`);
      }
      return image.inlineData;
    }
    const tekrar = response.status === 429 || response.status >= 500;
    const mesaj = (await response.text()).slice(0, 300);
    if ([401, 402, 403].includes(response.status)) {
      const error = new Error(`HTTP ${response.status}: ${mesaj}`);
      error.durdur = true;
      throw error;
    }
    if (!tekrar || deneme >= 5) throw new Error(`HTTP ${response.status}: ${mesaj}`);
    await new Promise((r) => setTimeout(r, 2000 * 2 ** deneme));
  }
}

function sure(ms) {
  const sn = Math.round(ms / 1000);
  return sn >= 60 ? `${Math.floor(sn / 60)} dk ${sn % 60} sn` : `${sn} sn`;
}

async function main() {
  loadEnv(path.join(ROOT, ".env.local"));
  loadEnv(path.join(ROOT, ".env"));
  const opts = args();

  let posts = await fetchPosts();
  if (opts.only) posts = posts.filter((post) => post.slug === opts.only);
  if (opts.kontrol) {
    if (!existsSync(KONTROL)) throw new Error("Önce scripts/blog-gorselleri-kontrol.mjs çalıştırın.");
    const kontrol = JSON.parse(readFileSync(KONTROL, "utf8"));
    posts = posts.filter((post) => kontrol[post.slug]?.yeniden_uret);
    opts.force = true;
  }

  await mkdir(OUT_DIR, { recursive: true });
  const mevcut = new Set(
    (await readdir(OUT_DIR)).filter((f) => !f.endsWith(".json")).map((f) => f.replace(/\.[^.]+$/, "")),
  );
  const bekleyen = posts.filter((post) => opts.force || !mevcut.has(post.slug));
  const kuyruk = opts.limit ? bekleyen.slice(0, opts.limit) : bekleyen;

  console.log(`Toplam blog: ${posts.length}`);
  console.log(`Görseli olan: ${posts.length - bekleyen.length}`);
  console.log(`Bu çalıştırmada üretilecek: ${kuyruk.length}`);
  console.log(`Model: ${opts.model} | Oran: ${opts.aspect} | Boyut: ${opts.size} | Paralel: ${opts.concurrency}\n`);

  if (opts.dryRun) {
    if (kuyruk[0]) console.log(`Örnek prompt (${kuyruk[0].slug}):\n\n${prompt(kuyruk[0])}`);
    return;
  }
  if (!kuyruk.length) return;

  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error(".env.local içinde GEMINI_API_KEY yok.");

  const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
  const baslangic = Date.now();
  let biten = 0;
  let basarili = 0;
  const hatalar = [];
  let sira = 0;
  let durduruldu = null;

  async function isci() {
    while (sira < kuyruk.length && !durduruldu) {
      const post = kuyruk[sira++];
      const t0 = Date.now();
      try {
        const image = await generate(post, opts, key);
        const ext = EXT[image.mimeType] ?? "png";
        const dosya = `${post.slug}.${ext}`;
        await writeFile(path.join(OUT_DIR, dosya), Buffer.from(image.data, "base64"));
        manifest[post.slug] = {
          dosya,
          title: post.title,
          category: post.category,
          model: opts.model,
          aspect: opts.aspect,
          prompt: prompt(post),
          uretildi: new Date().toISOString(),
        };
        await writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
        basarili += 1;
        biten += 1;
        log("✓", post, t0);
      } catch (error) {
        if (error.durdur) {
          durduruldu ??= error.message;
          return;
        }
        biten += 1;
        hatalar.push({ slug: post.slug, hata: error.message });
        log("✗", post, t0, error.message);
      }
    }
  }

  function log(isaret, post, t0, hata) {
    const gecen = Date.now() - baslangic;
    const kalan = biten ? (gecen / biten) * (kuyruk.length - biten) : 0;
    const yuzde = Math.round((biten / kuyruk.length) * 100);
    const satir = `[${String(biten).padStart(String(kuyruk.length).length)}/${kuyruk.length}] %${yuzde} ${isaret} ${post.slug} (${sure(Date.now() - t0)}) | kalan ~${sure(kalan)}`;
    console.log(hata ? `${satir}\n    ${hata}` : satir);
  }

  await Promise.all(Array.from({ length: Math.min(opts.concurrency, kuyruk.length) }, isci));

  if (durduruldu) {
    console.error(`\nDurduruldu, API isteği kabul etmiyor (kredi veya yetki):\n${durduruldu}`);
    console.error(`Üretilen: ${basarili}. Sorun giderilince aynı komut kaldığı yerden devam eder.`);
    process.exitCode = 1;
    return;
  }

  console.log(`\nBitti: ${basarili} başarılı, ${hatalar.length} hatalı, süre ${sure(Date.now() - baslangic)}`);
  if (hatalar.length) {
    console.log("Hatalılar için aynı komutu tekrar çalıştırın; yalnızca eksikler üretilir.");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
