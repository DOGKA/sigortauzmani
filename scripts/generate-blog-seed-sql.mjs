import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE_DIR = "/Users/dogukanarik/Desktop/fusionmarkt-blog-module";
const OUTPUT_FILE = "/Users/dogukanarik/Desktop/sigortauzmani/supabase/blog_seed.sql";

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

function normalizeStatus(raw) {
  const value = String(raw ?? "").toUpperCase();
  if (value === "ARCHIVED") return "ARCHIVED";
  // Import edilen yazılar sitede görünmesi için varsayılan olarak publish edilir.
  return "PUBLISHED";
}

function parsePublishedAt(article, batchDate, offsetMinutes) {
  const rawDate = article?.fact_checked_at || batchDate || "2026-07-27";
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : "2026-07-27";
  const hh = 9 + Math.floor(offsetMinutes / 60) % 12;
  const mm = offsetMinutes % 60;
  const hhStr = String(hh).padStart(2, "0");
  const mmStr = String(mm).padStart(2, "0");
  return `${safeDate}T${hhStr}:${mmStr}:00+03:00`;
}

function collectTags(article) {
  const tags = [];
  if (article.focus_keyword) tags.push(String(article.focus_keyword));
  if (Array.isArray(article.secondary_keywords)) {
    for (const kw of article.secondary_keywords) tags.push(String(kw));
  }
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))].slice(0, 12);
}

const files = (await readdir(SOURCE_DIR))
  .filter((name) => /^sigortauzmani_blog_batch_\d+.*\.json$/i.test(name))
  .sort((a, b) => a.localeCompare(b, "tr"));

const rows = [];
let order = 0;

for (const fileName of files) {
  const fullPath = path.join(SOURCE_DIR, fileName);
  const raw = await readFile(fullPath, "utf8");
  const json = JSON.parse(raw);
  const batchCategory = json.category ?? null;
  const batchDate = json.fact_checked_at ?? null;
  const articles = Array.isArray(json.articles) ? json.articles : [];

  for (const article of articles) {
    if (!article?.slug || !article?.title || !article?.content_html) continue;
    rows.push({
      slug: String(article.slug).trim(),
      title: String(article.title).trim(),
      content: String(article.content_html),
      excerpt: article.excerpt ? String(article.excerpt) : null,
      category: article.category ? String(article.category) : batchCategory,
      status: normalizeStatus(article.status),
      published_at: parsePublishedAt(article, batchDate, order),
      view_count: 0,
      author_name: "Sigorta Uzmanı",
      meta_title: article.seo_title ? String(article.seo_title) : null,
      meta_description: article.meta_description ? String(article.meta_description) : null,
      tags: collectTags(article),
    });
    order += 1;
  }
}

const valuesSql = rows
  .map((row) => {
    return `(
  ${dollarQuote(row.slug)},
  ${dollarQuote(row.title)},
  ${dollarQuote(row.content)},
  ${row.excerpt ? dollarQuote(row.excerpt) : "NULL"},
  ${row.category ? dollarQuote(row.category) : "NULL"},
  ${toPgTextArray(row.tags)},
  ${row.meta_title ? dollarQuote(row.meta_title) : "NULL"},
  ${row.meta_description ? dollarQuote(row.meta_description) : "NULL"},
  ${dollarQuote(row.author_name)},
  ${dollarQuote(row.status)}::blog_post_status,
  ${row.view_count},
  ${dollarQuote(row.published_at)}::timestamptz
)`;
  })
  .join(",\n");

const sql = `-- Auto-generated from fusionmarkt blog JSON batches.
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
  view_count = excluded.view_count,
  published_at = excluded.published_at,
  updated_at = now();

notify pgrst, 'reload schema';

commit;
`;

await writeFile(OUTPUT_FILE, sql, "utf8");
console.log(`Generated ${rows.length} posts -> ${OUTPUT_FILE}`);
