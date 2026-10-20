/**
 * `blog-gorselleri/` içindeki ana görsellerden sitede kullanılan WebP
 * kopyaları üretir: `public/blog/kapak/<slug>-800.webp` ve `-1600.webp`.
 * Site kapağı `blog_posts.featured_image` alanından okur; yeni görseller
 * için alanı `supabase/schema_blog_admin.sql` ile ya da panelden doldurun.
 *
 * Kullanım: node scripts/blog-gorselleri-webp.mjs [--force]
 */

import { existsSync } from "node:fs";
import { mkdir, readdir, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KAYNAK = path.join(ROOT, "blog-gorselleri");
const HEDEF = path.join(ROOT, "public/blog/kapak");
const GENISLIKLER = [800, 1600];

const require = createRequire(path.join(ROOT, "admin/package.json"));
const sharp = require("sharp");

async function main() {
  const force = process.argv.includes("--force");
  await mkdir(HEDEF, { recursive: true });

  const dosyalar = (await readdir(KAYNAK))
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f) && !f.startsWith("_"))
    .sort();

  let uretilen = 0;
  for (const dosya of dosyalar) {
    const slug = dosya.replace(/\.[^.]+$/, "");
    const kaynak = path.join(KAYNAK, dosya);
    const kaynakZamani = (await stat(kaynak)).mtimeMs;

    for (const genislik of GENISLIKLER) {
      const cikti = path.join(HEDEF, `${slug}-${genislik}.webp`);
      if (!force && existsSync(cikti) && (await stat(cikti)).mtimeMs >= kaynakZamani) continue;
      await sharp(kaynak)
        .resize({ width: genislik, height: Math.round((genislik * 9) / 16), fit: "cover" })
        .webp({ quality: genislik > 800 ? 72 : 70, effort: 5 })
        .toFile(cikti);
      uretilen += 1;
    }
  }

  const boyut = (await Promise.all((await readdir(HEDEF)).map((f) => stat(path.join(HEDEF, f))))).reduce(
    (t, s) => t + s.size,
    0,
  );
  console.log(`${dosyalar.length} yazı, ${uretilen} yeni WebP. Klasör: ${(boyut / 1024 / 1024).toFixed(1)} MB`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
