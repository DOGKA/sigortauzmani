/**
 * Teklif akışının altındaki güven kartı.
 *
 * Sayılar `/api/istatistik` üzerinden doğrudan veritabanından geliyor
 * (`supabase/schema_istatistik.sql`). Eşiğin altındaki metrik null döner ve
 * burada hiç çizilmez; istatistik gelmezse yalnızca resmî güvenceler kalır.
 */

import { useEffect, useRef, useState, type RefObject } from "react";
import { Star } from "lucide-react";
import { useLocale, useT } from "../../lib/i18n/context";
import { interpolate } from "../../lib/i18n/format";
import { LOCALE_META } from "../../lib/i18n/locales";
import { useTeklifIstatistik } from "./istatistik";
import "./GuvenSeridi.css";

/**
 * Sayıyı aşağı yuvarlar: 1.287 → 1.200. Yukarı yuvarlamak gerçekte olmayan
 * bir sayıyı göstermek olur.
 */
function asagiYuvarla(n: number): number {
  const adim = n < 100 ? 10 : n < 1000 ? 50 : n < 10000 ? 100 : 1000;
  return Math.floor(n / adim) * adim;
}

/** Şablondan sayı yer tutucusunu çıkarır: "{n} teklif hazırladı" → "teklif hazırladı". */
function aciklama(sablon: string): string {
  return sablon.replace("{n}", "").trim();
}

function useGorundu(ref: RefObject<HTMLElement | null>): boolean {
  const [gorundu, setGorundu] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setGorundu(true);
      return;
    }
    const gozlemci = new IntersectionObserver(
      ([giris]) => {
        if (giris?.isIntersecting) {
          setGorundu(true);
          gozlemci.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    gozlemci.observe(el);
    return () => gozlemci.disconnect();
  }, [ref]);
  return gorundu;
}

/** Kart ekrana girdiğinde 0'dan hedefe yavaşlayarak sayar. */
function useSayac(hedef: number, basla: boolean): number {
  const [deger, setDeger] = useState(0);
  useEffect(() => {
    if (!basla) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDeger(hedef);
      return;
    }
    const SURE_MS = 1200;
    const baslangic = performance.now();
    let kare = 0;
    const ilerle = (an: number) => {
      const oran = Math.min(1, (an - baslangic) / SURE_MS);
      setDeger(Math.round(hedef * (1 - (1 - oran) ** 3)));
      if (oran < 1) kare = requestAnimationFrame(ilerle);
    };
    kare = requestAnimationFrame(ilerle);
    return () => cancelAnimationFrame(kare);
  }, [hedef, basla]);
  return deger;
}

export default function GuvenSeridi() {
  const t = useT();
  const { locale } = useLocale();
  const veri = useTeklifIstatistik();
  const kart = useRef<HTMLElement>(null);
  const gorundu = useGorundu(kart);

  const sayi = new Intl.NumberFormat(LOCALE_META[locale].bcp47);
  const teklifHedef = veri?.teklif_toplam ? asagiYuvarla(veri.teklif_toplam) : 0;
  const policeHedef = veri?.police_toplam ? asagiYuvarla(veri.police_toplam) : 0;
  const teklif = useSayac(teklifHedef, gorundu);
  const police = useSayac(policeHedef, gorundu);

  return (
    <section ref={kart} className="guven" aria-label={t.flow.stats.label}>
      {veri ? (
        <div className="guven__ust">
          <p className="guven__baslik">{t.flow.stats.label}</p>
          <dl className="guven__metrikler">
            {teklifHedef ? (
              <div
                className="guven__metrik"
                aria-label={interpolate(t.flow.stats.quotes, { n: `${sayi.format(teklifHedef)}+` })}
              >
                <dt>
                  <span>{aciklama(t.flow.stats.quotes)}</span>
                </dt>
                <dd>{sayi.format(teklif)}+</dd>
              </div>
            ) : null}
            {policeHedef ? (
              <div
                className="guven__metrik"
                aria-label={interpolate(t.flow.stats.policies, { n: `${sayi.format(policeHedef)}+` })}
              >
                <dt>
                  <span>{aciklama(t.flow.stats.policies)}</span>
                </dt>
                <dd>{sayi.format(police)}+</dd>
              </div>
            ) : null}
            <div
              className="guven__metrik guven__metrik--puan"
              aria-label={interpolate(t.flow.stats.reviews, { n: "5.0/5.0" })}
            >
              <dt>
                <span>{t.flow.stats.reviewCount}</span>
              </dt>
              <dd>
                <span>5.0</span>
                <span className="guven__yildizlar" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} />
                  ))}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      ) : null}

      <div className="guven__alt">
        <p className="guven__baslik">{t.flow.stats.atBrand}</p>
        <ul className="guven__avantajlar" aria-label={t.flow.stats.atBrand}>
        <li>
          <strong>{t.flow.stats.authorizedValue}</strong>
          <span>{t.flow.stats.authorizedLabel}</span>
        </li>
        <li>
          <strong>{t.flow.stats.freeValue}</strong>
          <span>{t.flow.stats.freeLabel}</span>
        </li>
        <li>
          <strong>{t.flow.stats.noFeeValue}</strong>
          <span>{t.flow.stats.noFeeLabel}</span>
        </li>
        </ul>
      </div>
    </section>
  );
}
