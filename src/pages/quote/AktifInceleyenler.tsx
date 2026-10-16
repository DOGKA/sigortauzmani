import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale, useT } from "../../lib/i18n/context";
import { interpolate } from "../../lib/i18n/format";
import { LOCALE_META } from "../../lib/i18n/locales";
import "./AktifInceleyenler.css";

interface Props {
  productSlug: string;
}

interface ZiyaretciYaniti {
  sayi: number | null;
}

const YENILEME_MS = 15_000;
const ILK_GECIKME_MS = 3_000;
const GORUNME_MS = 6_000;
const ARA_MS = 20_000;

export default function AktifInceleyenler({ productSlug }: Props) {
  const t = useT();
  const { locale } = useLocale();
  const [oturumId] = useState(() => crypto.randomUUID());
  const [sayi, setSayi] = useState<number | null>(null);
  const [gorunur, setGorunur] = useState(false);

  useEffect(() => {
    let iptal = false;
    let kayitli = false;

    const guncelle = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch("/api/aktif-ziyaretci", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            urun: productSlug,
            oturum: oturumId,
            aktif: true,
          }),
        });
        if (!response.ok) return;
        const sonuc = (await response.json()) as ZiyaretciYaniti;
        kayitli = true;
        if (iptal || document.visibilityState !== "visible") {
          ayril();
          return;
        }
        if (typeof sonuc.sayi === "number") setSayi(sonuc.sayi);
      } catch {
        // Gösterge teklif akışını etkilememeli; bağlantı gelince tekrar denenir.
      }
    };

    const ayril = () => {
      if (!kayitli) return;
      kayitli = false;
      const govde = JSON.stringify({
        urun: productSlug,
        oturum: oturumId,
        aktif: false,
      });
      const veri = new Blob([govde], { type: "application/json" });
      if (!navigator.sendBeacon("/api/aktif-ziyaretci", veri)) {
        void fetch("/api/aktif-ziyaretci", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: govde,
          keepalive: true,
        });
      }
    };

    const gorunurlukDegisti = () => {
      if (document.visibilityState === "visible") {
        void guncelle();
      } else {
        ayril();
      }
    };

    void guncelle();
    const zamanlayici = window.setInterval(() => void guncelle(), YENILEME_MS);
    document.addEventListener("visibilitychange", gorunurlukDegisti);
    window.addEventListener("pagehide", ayril);

    return () => {
      iptal = true;
      window.clearInterval(zamanlayici);
      document.removeEventListener("visibilitychange", gorunurlukDegisti);
      window.removeEventListener("pagehide", ayril);
      ayril();
    };
  }, [oturumId, productSlug]);

  const hazir = sayi !== null;

  useEffect(() => {
    if (!hazir) return;
    let zamanlayici: number;

    const goster = () => {
      setGorunur(true);
      zamanlayici = window.setTimeout(gizle, GORUNME_MS);
    };
    const gizle = () => {
      setGorunur(false);
      zamanlayici = window.setTimeout(goster, ARA_MS);
    };

    zamanlayici = window.setTimeout(goster, ILK_GECIKME_MS);
    return () => window.clearTimeout(zamanlayici);
  }, [hazir]);

  if (sayi === null) return null;

  return (
    <div
      className={`aktif-inceleyenler${gorunur ? " aktif-inceleyenler--gorunur" : ""}`}
      role="status"
      aria-hidden={!gorunur}
    >
      <Eye className="aktif-inceleyenler__ikon" aria-hidden="true" />
      <span>
        {interpolate(t.flow.stats.viewingNow, {
          n: new Intl.NumberFormat(LOCALE_META[locale].bcp47).format(sayi),
        })}
      </span>
    </div>
  );
}
