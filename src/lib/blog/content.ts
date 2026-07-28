/**
 * Blog içeriği hazırlama
 *
 * HTML temizliği, başlık kimlikleri ve içindekiler çıkarımı tek yerde toplandı;
 * böylece TOC ile gövdedeki `id`'ler her zaman aynı algoritmadan üretilir.
 */

export interface BlogHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface PreparedBlogContent {
  html: string;
  headings: BlogHeading[];
}

const TURKISH_MAP: Record<string, string> = {
  ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
  ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
};

export function slugifyHeading(text: string): string {
  return text
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (ch) => TURKISH_MAP[ch] ?? ch)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60)
    .replace(/-+$/, "");
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&[a-z]+;/gi, " ");
}

export function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, ""))
    .replace(/\\r\\n|\\n|\\r/g, " ")
    .replace(/\r\n|\n|\r/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function createExcerpt(content: string, maxLength = 200): string {
  const text = stripHtml(content);
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + "…";
}

export function calculateReadingTime(content: string): number {
  const wordCount = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/\s*style\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "");
}

/** Gövdenin başında başlığın tekrarı varsa kaldırır. */
function dropLeadingTitle(html: string, title?: string): string {
  if (!title) return html;
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`^\\s*<h[1-6][^>]*>\\s*${escaped}\\s*<\\/h[1-6]>\\s*`, "i"),
    new RegExp(`^\\s*<(strong|b)[^>]*>\\s*${escaped}\\s*<\\/(strong|b)>\\s*`, "i"),
    new RegExp(`^\\s*${escaped}\\s*`, "i"),
  ];
  return patterns.reduce((acc, pattern) => acc.replace(pattern, ""), html);
}

function normalizeMarkup(html: string): string {
  return html
    .replace(/\\r\\n/g, "<br />")
    .replace(/\\n/g, "<br />")
    .replace(/\\r/g, "<br />")
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/(<br\s*\/?>\s*){3,}/gi, "<br /><br />")
    .replace(/^(\s*<br\s*\/?>\s*)+/i, "")
    .replace(/^(<p>\s*<br\s*\/?>\s*<\/p>\s*)+/gi, "");
}

/** İlk görsel öncelikli, kalanlar tembel yüklenir. */
function optimizeImages(html: string): string {
  let index = 0;
  return html.replace(/<img([^>]*)>/gi, (match, attrs: string) => {
    if (/\bloading\s*=/i.test(attrs)) return match;
    index++;
    const loading =
      index === 1
        ? 'loading="eager" fetchpriority="high" decoding="async"'
        : 'loading="lazy" decoding="async"';
    return `<img ${loading}${attrs}>`;
  });
}

/* Bu eşiklerin üstündeki metin ağırlıklı tablolar mobilde karta dönüşür. */
const CARD_LAYOUT_AVERAGE_CHARS = 18;
const CARD_LAYOUT_LONGEST_CHARS = 45;

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function matchAll(html: string, pattern: RegExp): RegExpExecArray[] {
  const regex = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
  const matches: RegExpExecArray[] = [];
  let match = regex.exec(html);
  while (match) {
    matches.push(match);
    if (match.index === regex.lastIndex) regex.lastIndex++;
    match = regex.exec(html);
  }
  return matches;
}

/** İlk başlık satırındaki sütun adları; yoksa boş dizi. */
function readColumnLabels(table: string): string[] {
  const firstRow = table.match(/<tr\b[^>]*>([\s\S]*?)<\/tr>/i);
  if (!firstRow || !/<th\b/i.test(firstRow[1])) return [];
  return matchAll(firstRow[1], /<th\b[^>]*>([\s\S]*?)<\/th>/gi).map((cell) =>
    stripHtml(cell[1])
  );
}

/**
 * Kısa değerli matris tabloları mobilde yatay kaydırmayla,
 * uzun metinli karşılaştırma tabloları kart yığınıyla daha okunur oluyor.
 */
function pickTableLayout(table: string, columnCount: number): "cards" | "scroll" {
  if (columnCount < 2) return "scroll";

  const lengths = matchAll(table, /<td\b[^>]*>([\s\S]*?)<\/td>/gi).map(
    (cell) => stripHtml(cell[1]).length
  );
  if (!lengths.length) return "scroll";

  const average = lengths.reduce((total, length) => total + length, 0) / lengths.length;
  const longest = Math.max(...lengths);

  return average >= CARD_LAYOUT_AVERAGE_CHARS || longest >= CARD_LAYOUT_LONGEST_CHARS
    ? "cards"
    : "scroll";
}

/** Kart görünümünde sütun adı hücrenin üstünde etiket olarak görünür. */
function labelCells(table: string, labels: string[]): string {
  if (!labels.length) return table;

  return table.replace(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi, (row) => {
    let column = 0;
    return row.replace(/<td\b([^>]*)>/gi, (cell, attrs: string) => {
      const label = labels[column++];
      if (!label || /\bdata-label\s*=/i.test(attrs)) return cell;
      return `<td${attrs} data-label="${escapeAttribute(label)}">`;
    });
  });
}

/**
 * Kart görünümü `display: block` ile tablo semantiğini bozduğu için
 * rolleri açıkça geri veriyoruz.
 */
function restoreTableRoles(table: string): string {
  return table
    .replace(/<table\b((?![^>]*\brole=)[^>]*)>/i, '<table$1 role="table">')
    .replace(/<(thead|tbody|tfoot)\b((?![^>]*\brole=)[^>]*)>/gi, '<$1$2 role="rowgroup">')
    .replace(/<tr\b((?![^>]*\brole=)[^>]*)>/gi, '<tr$1 role="row">')
    .replace(/<th\b((?![^>]*\brole=)[^>]*)>/gi, '<th$1 role="columnheader">')
    .replace(/<td\b((?![^>]*\brole=)[^>]*)>/gi, '<td$1 role="cell">');
}

/**
 * Her tabloyu kaydırma sarmalayıcısına alır ve mobil düzenini işaretler:
 * `cards` satırları karta çevirir, `scroll` ilk sütunu sabitleyip yana kaydırır.
 */
function enhanceTables(html: string): string {
  return html.replace(/<table\b[^>]*>[\s\S]*?<\/table>/gi, (table) => {
    const labels = readColumnLabels(table);
    const columnCount =
      labels.length ||
      matchAll(table.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/i)?.[0] ?? "", /<t[dh]\b/gi).length;
    const layout = pickTableLayout(table, columnCount);

    let markup = labelCells(table, labels);
    if (layout === "cards") markup = restoreTableRoles(markup);

    const scrollAttrs =
      layout === "scroll"
        ? ' role="region" tabindex="0" aria-label="Kaydırılabilir tablo"'
        : "";
    const hint =
      layout === "scroll"
        ? '<p class="blog-table__hint" aria-hidden="true">Tabloyu yana kaydırın</p>'
        : "";

    return (
      `<div class="blog-table" data-layout="${layout}" data-columns="${columnCount}">` +
      `<div class="blog-table__scroll"${scrollAttrs}>${markup}</div>${hint}` +
      `</div>`
    );
  });
}

/**
 * h2/h3 başlıklarına benzersiz `id` ve kopyalanabilir çapa linki ekler,
 * aynı geçişte içindekiler listesini toplar.
 */
function annotateHeadings(html: string): PreparedBlogContent {
  const headings: BlogHeading[] = [];
  const used = new Map<string, number>();

  const output = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, levelRaw: string, attrs: string, inner: string) => {
      const text = stripHtml(inner);
      if (!text) return match;

      const base = slugifyHeading(text) || `bolum-${headings.length + 1}`;
      const seen = used.get(base) ?? 0;
      used.set(base, seen + 1);
      const id = seen === 0 ? base : `${base}-${seen + 1}`;

      const level = Number(levelRaw) as 2 | 3;
      headings.push({ id, text, level });

      const cleanedAttrs = attrs.replace(/\s*id\s*=\s*["'][^"']*["']/gi, "");
      const anchor = `<a class="blog-content__anchor" href="#${id}" aria-label="${text} bölümüne bağlantı">#</a>`;
      return `<h${level}${cleanedAttrs} id="${id}">${inner}${anchor}</h${level}>`;
    }
  );

  return { html: output, headings };
}

export function prepareBlogContent(
  content: string,
  title?: string
): PreparedBlogContent {
  if (!content) return { html: "", headings: [] };

  const normalized = normalizeMarkup(dropLeadingTitle(content, title));
  const safe = enhanceTables(optimizeImages(sanitizeHtml(normalized)));
  return annotateHeadings(safe);
}
