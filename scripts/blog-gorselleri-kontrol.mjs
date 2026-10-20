/**
 * Üretilen blog görsellerini Gemini ile tarar; okunabilir yazı, marka/logo
 * veya plaka içerenleri işaretler. Sonuç `blog-gorselleri/kontrol.json`a
 * yazılır. İşaretlenenler şu komutla yeniden üretilir:
 *   node scripts/blog-gorselleri-uret.mjs --kontrol
 *
 * Kullanım:
 *   node scripts/blog-gorselleri-kontrol.mjs                # hepsi
 *   node scripts/blog-gorselleri-kontrol.mjs --only <slug>  # tek görsel
 *   node scripts/blog-gorselleri-kontrol.mjs --isaretli     # yalnızca daha önce işaretlenenler
 *
 * Diğer seçenekler: --concurrency 4, --model gemini-flash-latest
 */

import { existsSync, readFileSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "blog-gorselleri");
const SONUC = path.join(OUT_DIR, "kontrol.json");

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
    only: value("only", null),
    isaretli: argv.includes("--isaretli"),
    concurrency: Math.max(1, Number(value("concurrency", "4")) || 4),
    model: value("model", "gemini-flash-latest"),
  };
}

const TALIMAT = `You are reviewing a stock-style cover photo for a Turkish insurance blog.
List every piece of readable text in the image (signs, screens, uniforms, vehicles, packaging, plates).
Then decide whether the image must be regenerated. Set "yeniden_uret" to true if ANY of these apply:
- any text is misspelled, garbled, nonsensical or not real Turkish/English (e.g. "NOTARİSİ", "TERMİNASI");
- a real brand name or logo is readable (banks, airlines, car makers, shops, insurers);
- a licence plate with readable characters is visible;
- a flag is prominently visible;
- there are obvious AI artefacts on people (extra fingers, melted faces, broken limbs).
A short, correctly spelled generic word that fits the scene (e.g. "ECZANE", "TAKSİ", "GECİKMELİ") is acceptable.
Answer in Turkish in "neden" (one short sentence; empty if acceptable).`;

const SEMA = {
  type: "OBJECT",
  properties: {
    metinler: { type: "ARRAY", items: { type: "STRING" } },
    yeniden_uret: { type: "BOOLEAN" },
    neden: { type: "STRING" },
  },
  required: ["metinler", "yeniden_uret", "neden"],
};

const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

async function incele(dosya, opts, key) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${opts.model}:generateContent`;
  const data = (await readFile(path.join(OUT_DIR, dosya))).toString("base64");
  const body = {
    contents: [
      {
        parts: [
          { inlineData: { mimeType: MIME[path.extname(dosya)] ?? "image/jpeg", data } },
          { text: TALIMAT },
        ],
      },
    ],
    generationConfig: { responseMimeType: "application/json", responseSchema: SEMA, temperature: 0 },
  };

  for (let deneme = 1; ; deneme += 1) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      const json = await response.json();
      const text = json.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
      if (!text) throw new Error("Boş yanıt");
      return JSON.parse(text);
    }
    const mesaj = (await response.text()).slice(0, 300);
    if ([401, 402, 403].includes(response.status)) {
      const error = new Error(`HTTP ${response.status}: ${mesaj}`);
      error.durdur = true;
      throw error;
    }
    if (!(response.status === 429 || response.status >= 500) || deneme >= 5) {
      throw new Error(`HTTP ${response.status}: ${mesaj}`);
    }
    await new Promise((r) => setTimeout(r, 2000 * 2 ** deneme));
  }
}

async function main() {
  loadEnv(path.join(ROOT, ".env.local"));
  loadEnv(path.join(ROOT, ".env"));
  const opts = args();
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error(".env.local içinde GEMINI_API_KEY yok.");

  let dosyalar = (await readdir(OUT_DIR))
    .filter((f) => MIME[path.extname(f)] && !f.startsWith("_"))
    .sort();
  if (opts.only) dosyalar = dosyalar.filter((f) => f.replace(/\.[^.]+$/, "") === opts.only);

  const sonuc = existsSync(SONUC) ? JSON.parse(readFileSync(SONUC, "utf8")) : {};
  if (opts.isaretli) dosyalar = dosyalar.filter((f) => sonuc[f.replace(/\.[^.]+$/, "")]?.yeniden_uret);
  console.log(`İncelenecek görsel: ${dosyalar.length} | Model: ${opts.model}\n`);

  let sira = 0;
  let biten = 0;
  let durduruldu = null;
  const hatalar = [];

  async function isci() {
    while (sira < dosyalar.length && !durduruldu) {
      const dosya = dosyalar[sira++];
      const slug = dosya.replace(/\.[^.]+$/, "");
      try {
        const r = await incele(dosya, opts, key);
        sonuc[slug] = { ...r, incelendi: new Date().toISOString() };
        await writeFile(SONUC, JSON.stringify(sonuc, null, 2));
        biten += 1;
        const yazi = r.metinler.length ? ` [${r.metinler.join(", ")}]` : "";
        console.log(
          `[${biten}/${dosyalar.length}] ${r.yeniden_uret ? "✗" : "✓"} ${slug}${yazi}${r.neden ? ` — ${r.neden}` : ""}`,
        );
      } catch (error) {
        if (error.durdur) {
          durduruldu ??= error.message;
          return;
        }
        biten += 1;
        hatalar.push(slug);
        console.log(`[${biten}/${dosyalar.length}] ! ${slug} — ${error.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(opts.concurrency, dosyalar.length) }, isci));

  if (durduruldu) {
    console.error(`\nDurduruldu: ${durduruldu}`);
    process.exitCode = 1;
    return;
  }

  const isaretli = Object.entries(sonuc).filter(([, r]) => r.yeniden_uret).map(([slug]) => slug);
  console.log(`\nİşaretlenen: ${isaretli.length}${hatalar.length ? ` | İncelenemeyen: ${hatalar.length}` : ""}`);
  for (const slug of isaretli) console.log(`  - ${slug}: ${sonuc[slug].neden}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
