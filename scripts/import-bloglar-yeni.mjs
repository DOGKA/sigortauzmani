/**
 * `bloglar yeni/` klasöründeki batch JSON yazılarını Supabase blog_posts'a basar.
 *
 * Kullanım:
 *   node scripts/import-bloglar-yeni.mjs              # dry-run
 *   node scripts/import-bloglar-yeni.mjs --apply       # REST upsert
 *   node scripts/import-bloglar-yeni.mjs --sql         # SQL dosyası üretir
 *
 * RLS INSERT/UPDATE genelde service_role ister:
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-bloglar-yeni.mjs --apply
 *
 * Yoksa --sql ile üretilen dosyayı Supabase SQL Editor'de çalıştırın.
 */

import { readFileSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FINAL_CATEGORIES } from "./blog-category-map.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SOURCE_DIR = path.join(ROOT, "bloglar yeni");
const SQL_OUT = path.join(ROOT, "supabase", "blog_seed_yeni.sql");

const CATEGORY_ALIAS = {
  "Araç Sigortaları ve Mevzuat": "Araç Sigortaları",
  "Sağlık Sigortaları": "Sağlık Sigortaları",
  "Sigorta Rehberi": "Sigorta Rehberi",
  "Konut ve DASK": "Konut ve DASK",
  "Seyahat Sigortaları": "Seyahat Sigortaları",
  "Araç Sigortaları": "Araç Sigortaları",
};

function loadEnvFile(filePath) {
  try {
    const text = readFileSync(filePath, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  } catch {
    // optional
  }
}

loadEnvFile(path.join(ROOT, ".env"));
loadEnvFile(path.join(ROOT, "admin", ".env.local"));

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://kxjtmrbphoxvzwppcmzx.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const USING_SERVICE_ROLE = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

function slugify(input) {
  let s = String(input ?? "")
    .trim()
    .toLowerCase();
  const tr = {
    ı: "i",
    ğ: "g",
    ü: "u",
    ş: "s",
    ö: "o",
    ç: "c",
    â: "a",
    î: "i",
    û: "u",
    "’": "",
    "‘": "",
    "'": "",
    "´": "",
    "`": "",
  };
  for (const [a, b] of Object.entries(tr)) s = s.split(a).join(b);
  s = s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  s = s.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return s.slice(0, 90);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function normalizeCategory(raw) {
  const mapped = CATEGORY_ALIAS[String(raw ?? "").trim()] ?? null;
  if (mapped && FINAL_CATEGORIES.includes(mapped)) return mapped;
  return "Sigorta Rehberi";
}

function buildContent(blog) {
  const parts = [String(blog.content_html ?? "").trim()];

  if (blog.result_assessment) {
    parts.push(`<h2>Sonuç</h2>\n<p>${escapeHtml(blog.result_assessment)}</p>`);
  }

  if (Array.isArray(blog.faq) && blog.faq.length) {
    const faqHtml = blog.faq
      .map((item) => {
        const q = escapeHtml(item.question ?? "");
        const a = escapeHtml(item.answer ?? "");
        return `<h3>${q}</h3>\n<p>${a}</p>`;
      })
      .join("\n");
    parts.push(`<h2>Sıkça Sorulan Sorular</h2>\n${faqHtml}`);
  }

  if (Array.isArray(blog.external_links) && blog.external_links.length) {
    const links = blog.external_links
      .filter((l) => l?.url)
      .map((l) => {
        const title = escapeHtml(l.title || l.url);
        const url = String(l.url).replaceAll('"', "%22");
        return `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a></li>`;
      })
      .join("\n");
    if (links) parts.push(`<h2>Kaynaklar</h2>\n<ul>\n${links}\n</ul>`);
  }

  return parts.filter(Boolean).join("\n\n");
}

function parsePublishedAt(batchDate, offsetMinutes) {
  const rawDate = batchDate || "2026-08-12";
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : "2026-08-12";
  const hh = 9 + (Math.floor(offsetMinutes / 60) % 12);
  const mm = offsetMinutes % 60;
  return `${safeDate}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00+03:00`;
}

function dollarQuote(value) {
  const text = value ?? "";
  for (let i = 0; i < 1000; i += 1) {
    const tag = `$q${i}$`;
    if (!text.includes(tag)) return `${tag}${text}${tag}`;
  }
  throw new Error("Could not find safe dollar-quote delimiter");
}

function toPgTextArray(items) {
  if (!items.length) return "ARRAY[]::text[]";
  return `ARRAY[${items.map((item) => dollarQuote(item)).join(", ")}]::text[]`;
}

async function loadPosts() {
  const files = (await readdir(SOURCE_DIR))
    .filter((name) => /^sigortauzmani_blog_batch_\d+.*\.json$/i.test(name))
    .sort((a, b) => a.localeCompare(b, "tr"));

  const rows = [];
  let order = 0;
  const seen = new Set();

  for (const fileName of files) {
    const fullPath = path.join(SOURCE_DIR, fileName);
    const json = JSON.parse(await readFile(fullPath, "utf8"));
    const batchCategory = normalizeCategory(json.category);
    const batchDate = json.fact_checked_at ?? null;
    const blogs = Array.isArray(json.blogs) ? json.blogs : [];

    for (const blog of blogs) {
      if (!blog?.title || !blog?.content_html) continue;
      let slug = slugify(blog.title);
      if (!slug) throw new Error(`Slug üretilemedi: ${blog.title}`);
      if (seen.has(slug)) slug = `${slug}-${blog.id ?? order}`;
      seen.add(slug);

      const excerpt = blog.short_summary ? String(blog.short_summary).trim() : null;
      rows.push({
        sourceId: blog.id ?? null,
        sourceFile: fileName,
        slug,
        title: String(blog.title).trim(),
        content: buildContent(blog),
        excerpt,
        category: batchCategory,
        status: "PUBLISHED",
        published_at: parsePublishedAt(batchDate, order * 3),
        view_count: 0,
        author_name: "Sigorta Uzmanı",
        meta_title: String(blog.title).trim(),
        meta_description: excerpt,
        tags: [],
      });
      order += 1;
    }
  }

  return rows;
}

async function upsertViaRest(rows) {
  if (!SUPABASE_KEY) {
    throw new Error("Supabase anahtarı bulunamadı (.env içinde VITE_SUPABASE_ANON_KEY veya SUPABASE_SERVICE_ROLE_KEY).");
  }

  const endpoint = `${SUPABASE_URL}/rest/v1/blog_posts?on_conflict=slug`;
  let ok = 0;
  const batchSize = 5;

  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize).map((row) => ({
      slug: row.slug,
      title: row.title,
      content: row.content,
      excerpt: row.excerpt,
      category: row.category,
      tags: row.tags,
      meta_title: row.meta_title,
      meta_description: row.meta_description,
      author_name: row.author_name,
      status: row.status,
      view_count: row.view_count,
      published_at: row.published_at,
    }));

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(chunk),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Upsert başarısız (offset ${i}): ${response.status} ${body}`);
    }

    const saved = await response.json();
    if (!Array.isArray(saved) || saved.length === 0) {
      throw new Error(
        `Upsert yanıtı boş (offset ${i}). RLS engelliyor olabilir; SUPABASE_SERVICE_ROLE_KEY veya --sql kullanın.`,
      );
    }
    ok += saved.length;
    console.log(`  ${ok}/${rows.length} yazıldı…`);
  }

  return ok;
}

async function writeSql(rows) {
  const valuesSql = rows
    .map(
      (row) => `(
  ${dollarQuote(row.slug)},
  ${dollarQuote(row.title)},
  ${dollarQuote(row.content)},
  ${row.excerpt ? dollarQuote(row.excerpt) : "NULL"},
  ${dollarQuote(row.category)},
  ${toPgTextArray(row.tags)},
  ${row.meta_title ? dollarQuote(row.meta_title) : "NULL"},
  ${row.meta_description ? dollarQuote(row.meta_description) : "NULL"},
  ${dollarQuote(row.author_name)},
  ${dollarQuote(row.status)}::blog_post_status,
  ${row.view_count},
  ${dollarQuote(row.published_at)}::timestamptz
)`,
    )
    .join(",\n");

  const sql = `-- Auto-generated from bloglar yeni/
-- Source: ${SOURCE_DIR}
-- Total posts: ${rows.length}

begin;

insert into public.blog_posts (
  slug,
  title,
  content,
  excerpt,
  category,
  tags,
  meta_title,
  meta_description,
  author_name,
  status,
  view_count,
  published_at
)
values
${valuesSql}
on conflict (slug) do update
set
  title = excluded.title,
  content = excluded.content,
  excerpt = excluded.excerpt,
  category = excluded.category,
  tags = excluded.tags,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  author_name = excluded.author_name,
  status = excluded.status,
  published_at = excluded.published_at,
  updated_at = now();

notify pgrst, 'reload schema';

commit;
`;

  await writeFile(SQL_OUT, sql, "utf8");
  return SQL_OUT;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const sqlMode = process.argv.includes("--sql");
  const rows = await loadPosts();

  const byCat = new Map(FINAL_CATEGORIES.map((c) => [c, 0]));
  for (const row of rows) byCat.set(row.category, (byCat.get(row.category) ?? 0) + 1);

  console.log(`Kaynak: ${SOURCE_DIR}`);
  console.log(`Toplam yazı: ${rows.length}`);
  console.log("Kategori dağılımı:");
  for (const [cat, n] of byCat) if (n) console.log(`  ${cat}: ${n}`);
  console.log("\nÖrnek sluglar:");
  for (const row of rows.slice(0, 5)) {
    console.log(`  [${row.sourceId}] ${row.slug}`);
  }

  if (sqlMode) {
    const out = await writeSql(rows);
    console.log(`\nSQL yazıldı: ${out}`);
  }

  if (!apply) {
    if (!sqlMode) {
      console.log("\nDry-run. Canlıya basmak için --apply, SQL için --sql ekleyin.");
    }
    return;
  }

  console.log(
    `\nSupabase upsert: ${SUPABASE_URL} (key: ${USING_SERVICE_ROLE ? "service_role" : "anon"})`,
  );
  if (!USING_SERVICE_ROLE) {
    console.warn(
      "Uyarı: SUPABASE_SERVICE_ROLE_KEY yok. RLS INSERT/UPDATE engellerse istek başarısız olur.",
    );
  }

  const count = await upsertViaRest(rows);
  console.log(`\nTamam: ${count} yazı upsert edildi.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
