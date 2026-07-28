/**
 * supabase/recategorize_blog_categories.sql dosyasını CATEGORY_MAP'ten üretir.
 * Bu SQL, blog_posts tablosunda YALNIZCA category kolonunu günceller
 * (içerik/başlık/tarih gibi hiçbir alana dokunmaz) ve Supabase SQL
 * editöründe (owner/service_role yetkisiyle) çalıştırılmak üzere tasarlanmıştır.
 */

import { writeFile } from "node:fs/promises";
import { CATEGORY_MAP } from "./blog-category-map.mjs";

const OUTPUT_FILE = "/Users/dogukanarik/Desktop/sigortauzmani/supabase/recategorize_blog_categories.sql";

function sqlQuote(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

const entries = Object.entries(CATEGORY_MAP);

const caseLines = entries
  .map(([slug, category]) => `    when ${sqlQuote(slug)} then ${sqlQuote(category)}`)
  .join("\n");

const slugList = entries.map(([slug]) => sqlQuote(slug)).join(", ");

const sql = `-- Otomatik üretildi: scripts/generate-recategorize-sql.mjs (kaynak: scripts/blog-category-map.mjs)
-- Blog kategorilerini 18'den 5 sabit kategoriye indirger.
-- Sadece "category" kolonunu değiştirir, başka hiçbir alana dokunmaz.
--
-- Kullanım: Bu dosyanın tamamını Supabase Dashboard > SQL Editor içine
-- yapıştırıp çalıştırın (owner/service_role yetkisi gerekir; anon anahtarla
-- RLS nedeniyle satırlar güncellenmez).

begin;

update public.blog_posts
set category = case slug
${caseLines}
    else category
  end,
  updated_at = now()
where slug in (${slugList});

commit;
`;

await writeFile(OUTPUT_FILE, sql, "utf8");
console.log(`Generated ${entries.length} slug mappings -> ${OUTPUT_FILE}`);
