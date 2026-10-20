/**
 * PostgreSQL'deki ürün ayarına, her ürün için ayrı önerilen şirket listesini yazar.
 * Mevcut enabledSlugs korunur. Eski tek liste de aynı kodlarla doldurulur.
 *
 * Bağlantı: .env.local içindeki DATABASE_URL
 * Kullanım: npx tsx scripts/onerilen-sirketleri-isaretle.ts
 */

import { readFileSync } from "node:fs";
import pg from "pg";
import { AKTIF_SIRKET_KODLARI } from "../shared/sirketler";
import { ALL_PRODUCT_SLUGS } from "../shared/site-settings";

function envDosyasi(path: string): Record<string, string> {
  try {
    const env: Record<string, string> = {};
    for (const line of readFileSync(path, "utf8").split("\n")) {
      if (!line.trim() || line.trim().startsWith("#") || !line.includes("=")) continue;
      const [key, ...rest] = line.split("=");
      env[key.trim()] = rest.join("=").trim().replace(/^['"]|['"]$/g, "");
    }
    return env;
  } catch {
    return {};
  }
}

const env = envDosyasi(new URL("../.env.local", import.meta.url));
const connectionString = process.env.DATABASE_URL || env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL yok. .env.local içine PostgreSQL adresini yazın.");
}

const kodlar = [...AKTIF_SIRKET_KODLARI];
const harita = Object.fromEntries(ALL_PRODUCT_SLUGS.map((slug) => [slug, kodlar]));
const pool = new pg.Pool({ connectionString, max: 1 });

try {
  const guncel = await pool.query<{ harita: Record<string, string[]> }>(
    `update public.site_settings
     set value = value || jsonb_build_object(
       'onerilenSirketler', $1::jsonb,
       'onerilenSirketlerBySlug', $2::jsonb
     ),
     updated_at = now()
     where key = 'products'
     returning value->'onerilenSirketlerBySlug' as harita`,
    [JSON.stringify(kodlar), JSON.stringify(harita)],
  );

  if (guncel.rowCount === 0) {
    await pool.query(
      `insert into public.site_settings (key, value, is_public)
       values (
         'products',
         jsonb_build_object(
           'enabledSlugs', $1::jsonb,
           'onerilenSirketler', $2::jsonb,
           'onerilenSirketlerBySlug', $3::jsonb
         ),
         true
       )`,
      [JSON.stringify([...ALL_PRODUCT_SLUGS]), JSON.stringify(kodlar), JSON.stringify(harita)],
    );
  }

  const yazilan = guncel.rows[0]?.harita ?? harita;
  const ozet = ALL_PRODUCT_SLUGS.map((slug) => `${slug}: ${(yazilan[slug] ?? kodlar).length}`).join("\n");
  console.log(`PostgreSQL: her ürüne ${kodlar.length} şirket işaretlendi.\n${ozet}`);
} finally {
  await pool.end();
}
