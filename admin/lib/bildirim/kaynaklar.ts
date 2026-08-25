/**
 * Bildirim merkezinin izlediği tablolar.
 *
 * Her tanım hem açılıştaki "son kayıtlar" sorgusunu hem de realtime insert
 * olayını besliyor, bu yüzden `olustur` yalnızca satırın kendi kolonlarını
 * kullanabilir: realtime yükü join taşımaz.
 *
 * teklif_oturumlari bilinçli olarak listede değil. Siteye giren her ziyaretçi
 * teklif akışını başlattığında oraya satır düşüyor; bildirime çevrilirse panel
 * kullanılamaz hâle gelir. Satın almaya dönenler zaten satin_almalar üzerinden
 * bildiriliyor.
 */

import { formatPrim, paraKodu } from "@/lib/format";
import { IPTAL_BRANS_LABELS, type IptalBrans } from "@/lib/types";

export type BildirimKaynagi = "talep" | "iptal_talep" | "iletisim" | "police";

export interface Bildirim {
  kaynak: BildirimKaynagi;
  kayitId: string;
  baslik: string;
  ozet: string;
  createdAt: string;
  /** Acil iletişim mesajı, başarısız satın alma gibi öne çıkması gerekenler. */
  acil: boolean;
}

export interface KaynakTanimi {
  kaynak: BildirimKaynagi;
  tablo: string;
  /** Bildirim kartındaki rozet metni. */
  etiket: string;
  rozetStili: string;
  /** Kaydın listelendiği panel sayfası. */
  href: string;
  /** Açılış sorgusundaki select kolonları. */
  kolonlar: string;
  olustur: (satir: SatirVerisi) => Bildirim | null;
}

type SatirVerisi = Record<string, unknown>;

function metin(deger: unknown): string | null {
  if (typeof deger === "string" && deger.trim() !== "") return deger;
  if (typeof deger === "number") return String(deger);
  return null;
}

/** Boş alanlar özet satırında " · · " boşluğu bırakmasın diye eleniyor. */
function birlestir(...parcalar: (string | null)[]): string {
  return parcalar.filter((parca): parca is string => Boolean(parca)).join(" · ");
}

function temelAlanlar(satir: SatirVerisi) {
  const kayitId = metin(satir.id);
  const createdAt = metin(satir.created_at);
  if (!kayitId || !createdAt) return null;
  return { kayitId, createdAt };
}

export const BILDIRIM_KAYNAKLARI: KaynakTanimi[] = [
  {
    kaynak: "talep",
    tablo: "talepler",
    etiket: "Teklif Talebi",
    rozetStili: "bg-sky-100 text-sky-700",
    href: "/talepler",
    kolonlar: "id, talep_no, product_title, sirket_adi, phone, created_at",
    olustur: (satir) => {
      const temel = temelAlanlar(satir);
      if (!temel) return null;
      return {
        kaynak: "talep",
        ...temel,
        baslik: metin(satir.product_title) ?? "Yeni teklif talebi",
        ozet: birlestir(
          metin(satir.talep_no),
          metin(satir.sirket_adi),
          metin(satir.phone),
        ),
        acil: false,
      };
    },
  },
  {
    kaynak: "iptal_talep",
    tablo: "iptal_talepleri",
    etiket: "İptal Talebi",
    rozetStili: "bg-orange-100 text-orange-700",
    href: "/iptal-talepleri",
    kolonlar: "id, iptal_no, brans, ad_soyad, plate, created_at",
    olustur: (satir) => {
      const temel = temelAlanlar(satir);
      if (!temel) return null;
      const brans = metin(satir.brans) as IptalBrans | null;
      return {
        kaynak: "iptal_talep",
        ...temel,
        baslik: (brans && IPTAL_BRANS_LABELS[brans]) ?? "Poliçe iptal talebi",
        ozet: birlestir(
          metin(satir.iptal_no),
          metin(satir.ad_soyad),
          metin(satir.plate),
        ),
        acil: false,
      };
    },
  },
  {
    kaynak: "iletisim",
    tablo: "iletisim_talepleri",
    etiket: "İletişim",
    rozetStili: "bg-violet-100 text-violet-700",
    href: "/iletisim",
    kolonlar: "id, iletisim_no, ad_soyad, konu, oncelik, created_at",
    olustur: (satir) => {
      const temel = temelAlanlar(satir);
      if (!temel) return null;
      const oncelik = metin(satir.oncelik);
      return {
        kaynak: "iletisim",
        ...temel,
        baslik: metin(satir.konu) ?? "Yeni iletişim mesajı",
        ozet: birlestir(
          metin(satir.iletisim_no),
          metin(satir.ad_soyad),
          oncelik === "acil"
            ? "Acil"
            : oncelik === "oncelikli"
              ? "Öncelikli"
              : null,
        ),
        acil: oncelik === "acil" || oncelik === "oncelikli",
      };
    },
  },
  {
    kaynak: "police",
    tablo: "satin_almalar",
    etiket: "Poliçe",
    rozetStili: "bg-emerald-100 text-emerald-700",
    href: "/policeler",
    kolonlar:
      "id, police_no, sirket_adi, prim, brans_no, status, hata_mesaji, created_at",
    olustur: (satir) => {
      const temel = temelAlanlar(satir);
      if (!temel) return null;
      const basarisiz = satir.status === "basarisiz";
      const bransNo =
        typeof satir.brans_no === "number" ? satir.brans_no : null;
      const prim =
        typeof satir.prim === "number" || typeof satir.prim === "string"
          ? formatPrim(satir.prim, paraKodu(bransNo))
          : null;
      return {
        kaynak: "police",
        ...temel,
        baslik: basarisiz
          ? "Başarısız poliçe işlemi"
          : (metin(satir.sirket_adi) ?? "Yeni poliçe"),
        ozet: basarisiz
          ? birlestir(metin(satir.sirket_adi), metin(satir.hata_mesaji))
          : birlestir(metin(satir.police_no), prim),
        acil: basarisiz,
      };
    },
  },
];

export const KAYNAK_HARITASI: Record<BildirimKaynagi, KaynakTanimi> =
  Object.fromEntries(
    BILDIRIM_KAYNAKLARI.map((tanim) => [tanim.kaynak, tanim]),
  ) as Record<BildirimKaynagi, KaynakTanimi>;

/** Bildirimin okundu/erteleme kaydıyla eşleştiği benzersiz anahtar. */
export function bildirimAnahtari(
  kaynak: BildirimKaynagi,
  kayitId: string,
): string {
  return `${kaynak}:${kayitId}`;
}
