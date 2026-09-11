/**
 * `src/data/legal.ts` içindeki yayında olan yasal metinleri Supabase'in
 * `legal_documents` / `legal_document_versions` tablolarına taşıyan SQL üretir.
 *
 * Site metinleri güncellendiğinde yeniden çalıştırılabilir; üretilen SQL
 * idempotenttir ve mevcut 1. sürümün içeriğini yerinde günceller.
 */

import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { rolldown } from "rolldown";

const ROOT = path.resolve(import.meta.dirname, "..");
const ENTRY = path.join(ROOT, "src/data/legal.ts");
const OUTPUT_FILE = path.join(ROOT, "supabase/legal_seed.sql");
const LOCALE = "tr";

const MONTHS = {
  ocak: "01",
  şubat: "02",
  mart: "03",
  nisan: "04",
  mayıs: "05",
  haziran: "06",
  temmuz: "07",
  ağustos: "08",
  eylül: "09",
  ekim: "10",
  kasım: "11",
  aralık: "12",
};

function dollarQuote(value) {
  const text = String(value ?? "");
  for (let i = 0; i < 1000; i += 1) {
    const tag = `$q${i}$`;
    if (!text.includes(tag)) return `${tag}${text}${tag}`;
  }
  throw new Error("Güvenli dollar-quote sınırlayıcısı bulunamadı");
}

/** "1 Eylül 2026" → "2026-09-01T00:00:00+03:00" */
function parseUpdatedAt(value) {
  const [day, month, year] = String(value).trim().split(/\s+/);
  const monthNumber = MONTHS[String(month).toLocaleLowerCase("tr")];
  if (!monthNumber || !/^\d{4}$/.test(year ?? "")) {
    throw new Error(`Güncelleme tarihi çözümlenemedi: ${value}`);
  }
  return `${year}-${monthNumber}-${String(day).padStart(2, "0")}T00:00:00+03:00`;
}

/**
 * Sürüm içeriği, sitenin render ettiği her alanı taşır: paragraf listeleri,
 * madde listeleri (`items`) ve madde sonrası paragraflar (`closing`).
 */
function toContent(doc) {
  return {
    h1: doc.h1,
    eyebrow: doc.eyebrow,
    updatedAt: doc.updatedAt,
    summary: doc.summary,
    intro: doc.intro,
    sections: doc.sections.map((section) => ({
      heading: section.heading,
      ...(section.paragraphs?.length ? { paragraphs: section.paragraphs } : {}),
      ...(section.items?.length ? { items: section.items } : {}),
      ...(section.closing?.length ? { closing: section.closing } : {}),
    })),
  };
}

async function loadLegalDocuments() {
  const bundle = await rolldown({ input: ENTRY, logLevel: "silent" });
  const { output } = await bundle.generate({ format: "esm" });
  await bundle.close();

  const directory = await mkdtemp(path.join(tmpdir(), "legal-seed-"));
  try {
    const file = path.join(directory, "legal.mjs");
    await writeFile(file, output[0].code, "utf8");
    const module = await import(pathToFileURL(file).href);
    return module.legalDocuments;
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

function toStatements(doc) {
  const slug = doc.path.replace(/^\//, "");
  const timestamp = parseUpdatedAt(doc.updatedAt);
  const content = JSON.stringify(toContent(doc), null, 2);

  return `-- ${doc.h1}
insert into public.legal_documents (slug, locale, title, description)
values (${dollarQuote(slug)}, '${LOCALE}', ${dollarQuote(doc.h1)}, ${dollarQuote(doc.description)})
on conflict (slug, locale) do update
set title = excluded.title,
    description = excluded.description;

-- Tek yayımlanmış sürüm kısıtı için 1. sürüm dışındaki yayımlar geri alınır.
update public.legal_document_versions v
set status = 'unpublished'
from public.legal_documents d
where v.document_id = d.id
  and d.slug = ${dollarQuote(slug)}
  and d.locale = '${LOCALE}'
  and v.status = 'published'
  and v.version <> 1;

insert into public.legal_document_versions
  (document_id, version, status, content, effective_at, published_at)
select
  d.id,
  1,
  'published',
  ${dollarQuote(content)}::jsonb,
  '${timestamp}'::timestamptz,
  '${timestamp}'::timestamptz
from public.legal_documents d
where d.slug = ${dollarQuote(slug)}
  and d.locale = '${LOCALE}'
on conflict (document_id, version) do update
set status = 'published',
    content = excluded.content,
    effective_at = excluded.effective_at,
    published_at = excluded.published_at;`;
}

const documents = await loadLegalDocuments();
if (!Array.isArray(documents) || !documents.length) {
  throw new Error("src/data/legal.ts içinden belge okunamadı");
}

const sql = `-- Otomatik üretildi: npm run legal:seed (scripts/generate-legal-seed-sql.mjs)
-- Kaynak: src/data/legal.ts — sitede yayında olan ${LOCALE.toUpperCase()} metinler.
-- Supabase SQL Editor'de çalıştırın. Tekrar çalıştırılabilir.

begin;

${documents.map(toStatements).join("\n\n")}

commit;
`;

await writeFile(OUTPUT_FILE, sql, "utf8");

const sections = documents.reduce((total, doc) => total + doc.sections.length, 0);
console.log(
  `${documents.length} belge, ${sections} bölüm -> ${path.relative(ROOT, OUTPUT_FILE)}`,
);
