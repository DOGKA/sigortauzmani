/**
 * Blog kategorilerini 18'den 5'e indirir (canlı Supabase üzerinde).
 *
 * NOT: Bu script anon/publishable anahtarla çalışır. blog_posts
 * tablosunda RLS UPDATE'i yalnızca service_role'e izin veriyorsa istekler
 * sessizce hiçbir şeyi değiştirmez (200 döner ama satır güncellenmez).
 * Gerçek güncelleme için ya SUPABASE_SERVICE_ROLE_KEY ortam değişkenini
 * tanımlayın ya da supabase/recategorize_blog_categories.sql dosyasını
 * Supabase SQL editöründe çalıştırın.
 *
 * Kullanım:
 *   node scripts/recategorize-blog-posts.mjs           # dry-run özet basar
 *   node scripts/recategorize-blog-posts.mjs --apply    # gerçekten günceller
 */

import { CATEGORY_MAP, FINAL_CATEGORIES } from "./blog-category-map.mjs";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "https://kxjtmrbphoxvzwppcmzx.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY ??
  "sb_publishable_yWE-ED-e15ZgXXedSEL-zg_Y9L0h6ZH";
const USING_SERVICE_ROLE = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fetchCurrentCategories() {
  const endpoint = `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,category&order=slug.asc`;
  const response = await fetch(endpoint, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!response.ok) {
    throw new Error(`Kategoriler okunamadı: ${response.status} ${await response.text()}`);
  }
  return /** @type {{slug: string, category: string | null}[]} */ (await response.json());
}

async function updateCategory(slug, category) {
  const endpoint = `${SUPABASE_URL}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}`;
  const response = await fetch(endpoint, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ category }),
  });
  if (!response.ok) {
    throw new Error(`${slug}: ${response.status} ${await response.text()}`);
  }
  const rows = await response.json();
  return rows.length > 0;
}

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(
    `Supabase: ${SUPABASE_URL} (key: ${USING_SERVICE_ROLE ? "service_role" : "anon/publishable"})`,
  );

  const current = await fetchCurrentCategories();
  const currentBySlug = new Map(current.map((row) => [row.slug, row.category]));

  const missing = current.filter((row) => !CATEGORY_MAP[row.slug]);
  if (missing.length) {
    console.warn(
      `Uyarı: DB'de olup eşlemede olmayan ${missing.length} slug var, bunlar değişmeyecek:`,
      missing.map((row) => row.slug),
    );
  }

  const changes = current
    .map((row) => ({ slug: row.slug, from: row.category, to: CATEGORY_MAP[row.slug] }))
    .filter((row) => row.to && row.to !== row.from);

  const summary = new Map(FINAL_CATEGORIES.map((cat) => [cat, 0]));
  for (const slug of Object.keys(CATEGORY_MAP)) {
    const cat = CATEGORY_MAP[slug];
    summary.set(cat, (summary.get(cat) ?? 0) + 1);
  }

  console.log("\nHedef kategori dağılımı (68 yazı):");
  for (const [cat, count] of summary) console.log(`  ${cat}: ${count}`);
  console.log(`\nDeğişecek kayıt sayısı: ${changes.length} / ${current.length}`);

  if (!apply) {
    console.log("\nDry-run modundasınız. Gerçekten güncellemek için --apply ekleyin.");
    return;
  }

  if (!USING_SERVICE_ROLE) {
    console.warn(
      "\nUyarı: SUPABASE_SERVICE_ROLE_KEY tanımlı değil. RLS UPDATE'i engelliyorsa " +
        "istekler sessizce hiçbir şeyi değiştirmeyebilir.",
    );
  }

  console.log("\nGüncelleniyor...");
  let updatedCount = 0;
  let noopCount = 0;
  for (const change of changes) {
    const updated = await updateCategory(change.slug, change.to);
    if (updated) updatedCount += 1;
    else noopCount += 1;
    process.stdout.write(`\r  ${updatedCount + noopCount}/${changes.length}`);
  }
  console.log(`\nTamamlandı. Gerçekten güncellenen: ${updatedCount}, etkisiz (RLS?): ${noopCount}`);

  if (noopCount > 0) {
    console.log(
      "\nBazı satırlar güncellenemedi. En muhtemel sebep RLS: anon anahtar UPDATE için yetkili değil.\n" +
        "Çözüm: supabase/recategorize_blog_categories.sql dosyasını Supabase SQL editöründe çalıştırın.",
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
