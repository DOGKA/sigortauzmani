/**
 * "Cep numarası gönderilince IO eski CRM kaydını mı bağlıyor?" testi.
 *
 * Aynı kimlik ve araçla iki teklif çalıştırır: biri `Cep` alanıyla, diğeri
 * onsuz. Dönen sigortalı bilgisi (ad, telefon, müşteri kaydı) farklıysa iddia
 * doğrulanmış olur; aynıysa telefonun kişi referansı olmadığı görülür.
 *
 * DİKKAT: sigorta şirketinde gerçek teklif oluşturur. Test kimliğiyle çalıştır.
 *
 *   node scripts/io-cep-testi.mjs
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const KOK = resolve(import.meta.dirname, "..");

function envYukle() {
  const env = {};
  try {
    const raw = readFileSync(resolve(KOK, ".env"), "utf8");
    for (const satir of raw.split("\n")) {
      const temiz = satir.trim();
      if (!temiz || temiz.startsWith("#")) continue;
      const esittir = temiz.indexOf("=");
      if (esittir < 0) continue;
      env[temiz.slice(0, esittir).trim()] = temiz
        .slice(esittir + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
    }
  } catch {
    // .env yoksa process.env'e düşülür.
  }
  return { ...env, ...process.env };
}

const ENV = envYukle();
const BASE = (ENV.IO_API_BASE_URL ?? "").replace(/\/+$/, "");
const TOKEN = ENV.IO_API_TOKEN ?? "";
const KANAL = Number.isFinite(Number(ENV.IO_KANAL)) ? Number(ENV.IO_KANAL) : 0;

if (!BASE || !TOKEN) {
  console.error("IO_API_BASE_URL veya IO_API_TOKEN yok (.env).");
  process.exit(1);
}

const TEST = {
  kimlikNo: "42379456538",
  dogumTarihi: "1993-09-02",
  cep: "5418778000",
  plaka: "35CRP160",
  tescilBelge: "IH843008",
  bransNo: 0,
};

async function ioPost(path, body) {
  const yanit = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const metin = await yanit.text();
  let veri;
  try {
    veri = JSON.parse(metin);
  } catch {
    veri = metin;
  }
  return { status: yanit.status, veri };
}

function teklifGovdesi(cep, arac = {}) {
  return {
    BransNo: TEST.bransNo,
    Kanal: KANAL,
    KodGonder: false,
    SigortaEttirenAyniMi: true,
    Sigortali: {
      KimlikNo: TEST.kimlikNo,
      Dogumtarihi: TEST.dogumTarihi,
      KodGonder: false,
      ...(cep ? { Cep: cep } : {}),
    },
    Arac: {
      Plaka: arac.plaka ?? TEST.plaka,
      TescilBelge: arac.tescilBelge ?? TEST.tescilBelge,
      PlakamYok: false,
      KisaSureli: false,
    },
  };
}

/** Yanıtın neresinde olursa olsun kişiye dair alanları toplar. */
function kisiAlanlari(veri, yol = "", bulunan = {}) {
  if (!veri || typeof veri !== "object") return bulunan;
  for (const [anahtar, deger] of Object.entries(veri)) {
    const tamYol = yol ? `${yol}.${anahtar}` : anahtar;
    if (deger && typeof deger === "object") {
      kisiAlanlari(deger, tamYol, bulunan);
      continue;
    }
    if (deger === null || deger === "" || deger === undefined) continue;
    if (
      /(^|\.)(Ad|Adi|Soyad|Soyadi|AdSoyad|Unvan|Cep|Telefon|Gsm|Email|Eposta|MusteriNo|KimlikNo|Dogum)/i.test(
        tamYol,
      )
    ) {
      bulunan[tamYol] = String(deger);
    }
  }
  return bulunan;
}

async function primleriBekle(teklifId) {
  for (let deneme = 0; deneme < 12; deneme++) {
    const { veri } = await ioPost("/api/teklif/primler", {
      BransNo: TEST.bransNo,
      TeklifId: teklifId,
    });
    const bitti = veri?.TeklifCalisildi === true;
    if (bitti) return veri;
    await new Promise((c) => setTimeout(c, 2500));
  }
  return null;
}

function teklifIdOku(veri) {
  for (const anahtar of ["TeklifId", "Id", "teklifId"]) {
    const deger = veri?.[anahtar];
    if (typeof deger === "number") return deger;
    if (typeof deger === "string" && /^\d+$/.test(deger)) return Number(deger);
  }
  return null;
}

function satirlariOku(veri) {
  for (const anahtar of ["Sirketler", "Teklifler", "Primler", "Sonuclar", "Liste"]) {
    if (Array.isArray(veri?.[anahtar])) return veri[anahtar];
  }
  return Array.isArray(veri) ? veri : [];
}

/** Kimlik / müşteri eşleşmesini gösteren üst düzey alanlar. */
const KIMLIK_ALANLARI = [
  "TeklifId",
  "TalepId",
  "MusteriNo",
  "MayaPoliceID",
  "SubeNo",
  "AcenteID",
  "PerID",
];

async function senaryo(etiket, cep, arac) {
  console.log(`\n${"=".repeat(62)}\n${etiket}\n${"=".repeat(62)}`);

  const govde = teklifGovdesi(cep, arac);
  console.log("İstek Sigortali:", JSON.stringify(govde.Sigortali));
  console.log("İstek Arac:", JSON.stringify(govde.Arac));

  const teklif = await ioPost("/api/teklif", govde);
  console.log("teklif HTTP:", teklif.status);

  const govdeYaniti = teklif.veri ?? {};
  console.log("\nTeklif yanıtı — kimlik alanları:");
  for (const alan of KIMLIK_ALANLARI) {
    console.log(`  ${alan} = ${JSON.stringify(govdeYaniti[alan])}`);
  }
  console.log("\nTeklif yanıtı — Sigortali bloğu:");
  console.log(JSON.stringify(govdeYaniti.Sigortali, null, 2));
  console.log("SigortaliStr uzunluğu:", String(govdeYaniti.SigortaliStr ?? "").length);

  const kisi = kisiAlanlari(govdeYaniti.Sigortali, "Sigortali");
  for (const alan of KIMLIK_ALANLARI) {
    if (govdeYaniti[alan] !== undefined) kisi[alan] = String(govdeYaniti[alan]);
  }

  const teklifId = teklifIdOku(govdeYaniti);
  if (!teklifId) {
    console.log("Teklif numarası alınamadı, senaryo durdu.");
    return { etiket, teklifId: null, kisi };
  }

  const primler = await primleriBekle(teklifId);
  if (!primler) {
    console.log("\nPrimler zamanında gelmedi.");
    return { etiket, teklifId, kisi };
  }

  const satirlar = satirlariOku(primler);
  console.log("\nGelen şirket satırı:", satirlar.length);
  Object.assign(kisi, kisiAlanlari(primler.Sigortali, "Primler.Sigortali"));
  if (primler.Sigortali) {
    console.log("Primler Sigortali:", JSON.stringify(primler.Sigortali));
  }

  console.log("\nToplanan kişi alanları:");
  const anahtarlar = Object.keys(kisi).sort();
  if (!anahtarlar.length) console.log("  (kişi alanı dönmedi)");
  for (const anahtar of anahtarlar) console.log(`  ${anahtar} = ${kisi[anahtar]}`);

  return { etiket, teklifId, kisi };
}

const sonuclar = [
  await senaryo("A) Kayıttaki cep (05418778000)", TEST.cep),
  await senaryo("B) Cep hiç gönderilmiyor", null),
  await senaryo("C) Alakasız cep (05001112233)", "5001112233"),
  // Aynı kimlik, farklı araç: teklif numarasını neyin sabitlediğini gösterir.
  await senaryo("D) Kayıttaki cep + farklı plaka", TEST.cep, {
    plaka: "34ABC123",
    tescilBelge: "AA123456",
  }),
];

console.log(`\n${"=".repeat(62)}\nKARŞILAŞTIRMA\n${"=".repeat(62)}`);
const tumAnahtarlar = [
  ...new Set(sonuclar.flatMap((s) => Object.keys(s.kisi))),
].sort();

let farkVar = false;
for (const anahtar of tumAnahtarlar) {
  const degerler = sonuclar.map((s) => s.kisi[anahtar] ?? "—");
  const ayni = degerler.every((d) => d === degerler[0]);
  if (!ayni) farkVar = true;
  console.log(`${ayni ? "  " : "≠ "}${anahtar}`);
  sonuclar.forEach((s, i) => console.log(`    ${s.etiket}: ${degerler[i]}`));
}

console.log(
  farkVar
    ? "\nSONUÇ: Alanlar senaryolara göre değişiyor — cep numarası kaydı etkiliyor."
    : "\nSONUÇ: Kişi alanları üç senaryoda da aynı — cep kaynaklı fark yok.",
);
console.log(
  "TeklifId'ler:",
  sonuclar.map((s) => `${s.etiket} → ${s.teklifId ?? "-"}`).join(" | "),
);
