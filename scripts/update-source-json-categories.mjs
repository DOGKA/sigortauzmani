/**
 * fusionmarkt-blog-module altındaki kaynak JSON batch dosyalarında hem
 * batch seviyesindeki "category" alanını hem de varsa makale seviyesindeki
 * "category" override'ını CATEGORY_MAP'e göre 5 sabit kategoriye günceller.
 * Böylece scripts/generate-blog-seed-sql.mjs yeniden çalıştırıldığında da
 * yazılar doğru kategoriyle üretilir.
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { CATEGORY_MAP } from "./blog-category-map.mjs";

const SOURCE_DIR = "/Users/dogukanarik/Desktop/fusionmarkt-blog-module";

const files = (await readdir(SOURCE_DIR)).filter((name) =>
  /^sigortauzmani_blog_batch_\d+.*\.json$/i.test(name),
);

let updatedArticles = 0;
let updatedBatches = 0;

for (const fileName of files) {
  const fullPath = path.join(SOURCE_DIR, fileName);
  const raw = await readFile(fullPath, "utf8");
  const json = JSON.parse(raw);
  const articles = Array.isArray(json.articles) ? json.articles : [];

  let fileChanged = false;
  const articleCategories = new Set();

  for (const article of articles) {
    const target = CATEGORY_MAP[article.slug];
    if (!target) continue;
    articleCategories.add(target);
    if (article.category !== target) {
      article.category = target;
      fileChanged = true;
      updatedArticles += 1;
    }
  }

  // Bir batch'teki tüm makaleler artık aynı hedef kategoriye düşüyorsa
  // batch-level category alanını da o kategoriyle sadeleştir.
  if (articleCategories.size === 1) {
    const [onlyCategory] = [...articleCategories];
    if (json.category !== onlyCategory) {
      json.category = onlyCategory;
      fileChanged = true;
      updatedBatches += 1;
    }
  }

  if (fileChanged) {
    await writeFile(fullPath, `${JSON.stringify(json, null, 2)}\n`, "utf8");
    console.log(`Güncellendi: ${fileName}`);
  }
}

console.log(`\nToplam: ${updatedArticles} makale, ${updatedBatches} batch güncellendi.`);
