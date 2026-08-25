"use client";

import { useState } from "react";

/**
 * Ödeme makbuzunu indirir; kayıtta adres yoksa IO'dan o an ister.
 *
 * Makbuz satın alma anında çoğu şirkette hazır olmadığı için kayıttaki alan
 * genelde boş kalıyor ve kendiliğinden dolmuyor. Buton bu yüzden adres varken
 * de yokken de görünüyor: müşteriye "ekibimiz iletir" dendiğinde paneldeki
 * kullanıcının belgeye tek tıkla ulaşması gerekiyor.
 */

const BUTON_SINIFI =
  "rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";

export default function MakbuzButonu({
  satinAlmaId,
  mevcutUrl,
}: {
  satinAlmaId: string;
  mevcutUrl: string | null;
}) {
  const [url, setUrl] = useState<string | null>(mevcutUrl);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState("");

  const getir = async () => {
    if (yukleniyor) return;
    setYukleniyor(true);
    setMesaj("");

    try {
      const yanit = await fetch("/api/makbuz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ satinAlmaId }),
      });
      const govde = (await yanit.json()) as { url?: string; error?: string };

      if (!yanit.ok || !govde.url) {
        setMesaj(govde.error ?? "Makbuz alınamadı.");
        return;
      }

      setUrl(govde.url);
      // Yeni sekme, tıklamadan sonra açıldığı için engellenebiliyor; buton
      // yerini bağlantıya bıraktığından belge her hâlükârda erişilebilir.
      window.open(govde.url, "_blank", "noopener,noreferrer");
    } catch {
      setMesaj("Makbuz alınamadı. Bağlantınızı kontrol edip tekrar deneyin.");
    } finally {
      setYukleniyor(false);
    }
  };

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={BUTON_SINIFI}
        onClick={(olay) => olay.stopPropagation()}
      >
        Makbuzu İndir
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={yukleniyor}
        onClick={(olay) => {
          olay.stopPropagation();
          void getir();
        }}
        className={BUTON_SINIFI}
      >
        {yukleniyor ? "Makbuz isteniyor…" : "Makbuzu İndir"}
      </button>
      {mesaj && (
        <span className="max-w-md text-xs leading-relaxed text-slate-500">
          {mesaj}
        </span>
      )}
    </>
  );
}
