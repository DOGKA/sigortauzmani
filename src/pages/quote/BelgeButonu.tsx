/**
 * CRM'den belge (PDF) getiren buton: teklif PDF'i, poliçe ve ödeme makbuzu.
 *
 * Adres önceden bilinmiyor; her belge sigorta şirketinden o an üretiliyor ve
 * birkaç saniye sürebiliyor. Bu yüzden buton önce isteği atıyor, gelen adresi
 * saklıyor ve bağlantıya dönüşüyor.
 *
 * Adres geldiğinde yeni sekme açılmaya çalışılıyor ama bu, kullanıcı
 * etkileşiminden sonra beklendiği için tarayıcı tarafından engellenebiliyor.
 * Engellenirse kullanıcı elde kalmasın diye buton yerini görünür bir
 * bağlantıya bırakıyor — her iki durumda da PDF'e erişilebiliyor.
 *
 * Belgenin gelmemesi olağan: şirketlerin bir kısmı teklif PDF'i paylaşmıyor ve
 * bunu önceden söyleyen bir alan yok, ancak sorunca öğreniliyor. O yüzden bu
 * bir hata gibi gösterilmiyor; sunucudan gelen açıklama olduğu gibi yazılıyor.
 */

import { useState } from "react";
import { IoError, belgeGetir } from "../../lib/io/client";

type BelgeTipi = "teklif" | "police" | "makbuz";

interface Props {
  oturumId: string;
  bransNo: number;
  teklifId: number;
  sirketTeklifId: number;
  tip: BelgeTipi;
  etiket: string;
  /** Teklif listesinde yalnızca ikon, sonuç ekranında etiketli buton. */
  gorunum?: "ikon" | "buton";
}

function PdfIkonu() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </svg>
  );
}

export default function BelgeButonu({
  oturumId,
  bransNo,
  teklifId,
  sirketTeklifId,
  tip,
  etiket,
  gorunum = "buton",
}: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState("");

  const ikonlu = gorunum === "ikon";

  const getir = async () => {
    if (yukleniyor) return;
    setYukleniyor(true);
    setMesaj("");

    try {
      const sonuc = await belgeGetir({
        oturumId,
        bransNo,
        teklifId,
        sirketTeklifId,
        tip,
      });
      setUrl(sonuc.url);
      window.open(sonuc.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      setMesaj(
        error instanceof IoError
          ? error.message
          : "Belge şu anda alınamadı. Lütfen tekrar deneyin.",
      );
    } finally {
      setYukleniyor(false);
    }
  };

  if (url) {
    return (
      <a
        className={ikonlu ? "flow__belge flow__belge--ikon" : "flow__secondary"}
        href={url}
        target="_blank"
        rel="noreferrer"
        title={`${etiket} — yeni sekmede açılır`}
      >
        {ikonlu ? <PdfIkonu /> : etiket}
        {ikonlu ? <span className="flow__gizli">{etiket}</span> : null}
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        className={ikonlu ? "flow__belge flow__belge--ikon" : "flow__secondary"}
        onClick={() => void getir()}
        disabled={yukleniyor}
        title={etiket}
      >
        {ikonlu ? <PdfIkonu /> : yukleniyor ? "Hazırlanıyor…" : etiket}
        {ikonlu ? (
          <span className="flow__gizli">
            {yukleniyor ? `${etiket} hazırlanıyor` : etiket}
          </span>
        ) : null}
      </button>
      {mesaj ? <span className="flow__belge-not">{mesaj}</span> : null}
    </>
  );
}
