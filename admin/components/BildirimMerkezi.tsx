"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useBildirimBaglami } from "@/lib/bildirim/BildirimSaglayici";
import {
  KAYNAK_HARITASI,
  type Bildirim,
} from "@/lib/bildirim/kaynaklar";
import { ERTELEME_SECENEKLERI } from "@/lib/bildirim/useBildirimler";

function gecenSure(iso: string): string {
  const dakika = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (dakika < 1) return "az önce";
  if (dakika < 60) return `${dakika} dk önce`;
  const saat = Math.floor(dakika / 60);
  if (saat < 24) return `${saat} sa önce`;
  return `${Math.floor(saat / 24)} gün önce`;
}

export default function BildirimMerkezi() {
  const {
    bildirimler,
    toastlar,
    hazir,
    hata,
    okunduYap,
    ertele,
    hepsiniOkunduYap,
    toastKapat,
  } = useBildirimBaglami();
  const [acik, setAcik] = useState(false);
  const router = useRouter();

  const goruntule = useCallback(
    (bildirim: Bildirim) => {
      const tanim = KAYNAK_HARITASI[bildirim.kaynak];
      okunduYap(bildirim);
      setAcik(false);
      router.push(`${tanim.href}?vurgu=${bildirim.kayitId}`);
    },
    [okunduYap, router],
  );

  useEffect(() => {
    if (!acik) return;
    const tuslaKapat = (olay: KeyboardEvent) => {
      if (olay.key === "Escape") setAcik(false);
    };
    window.addEventListener("keydown", tuslaKapat);
    return () => window.removeEventListener("keydown", tuslaKapat);
  }, [acik]);

  const sayi = bildirimler.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setAcik((onceki) => !onceki)}
        aria-label={
          sayi > 0 ? `Bildirimler, ${sayi} okunmamış` : "Bildirimler"
        }
        aria-expanded={acik}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {sayi > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white">
            {sayi > 99 ? "99+" : sayi}
          </span>
        )}
      </button>

      {acik && (
        <>
          <button
            type="button"
            aria-label="Bildirim panelini kapat"
            onClick={() => setAcik(false)}
            className="fixed inset-0 z-40 cursor-default bg-slate-900/20"
          />
          <aside
            aria-label="Bildirimler"
            className="fixed right-0 top-0 z-50 flex h-screen w-[min(24rem,100vw)] flex-col border-l border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Bildirimler
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  {sayi > 0 ? `${sayi} okunmamış kayıt` : "Hepsi okundu"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAcik(false)}
                aria-label="Kapat"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {hata && (
              <p className="border-b border-rose-200 bg-rose-50 px-5 py-3 text-xs text-rose-700">
                {hata}
              </p>
            )}

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {!hazir ? (
                <p className="py-10 text-center text-sm text-slate-400">
                  Bildirimler yükleniyor…
                </p>
              ) : sayi === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">
                  Yeni bildirim yok. Yeni bir kayıt düştüğünde burada ve ekranın
                  sağ üst köşesinde görünür.
                </p>
              ) : (
                bildirimler.map((bildirim) => (
                  <BildirimKarti
                    key={`${bildirim.kaynak}:${bildirim.kayitId}`}
                    bildirim={bildirim}
                    onOkundu={() => okunduYap(bildirim)}
                    onErtele={(hatirlatAt) => ertele(bildirim, hatirlatAt)}
                    onGoruntule={() => goruntule(bildirim)}
                  />
                ))
              )}
            </div>

            {sayi > 0 && (
              <div className="border-t border-slate-200 px-4 py-3">
                <button
                  type="button"
                  onClick={hepsiniOkunduYap}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Tümünü okundu işaretle
                </button>
              </div>
            )}
          </aside>
        </>
      )}

      {/* Çekmece açıkken aynı kartları iki kez göstermemek için köşe yığını susar. */}
      {!acik && toastlar.length > 0 && (
        <div className="pointer-events-none fixed right-4 top-20 z-40 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-3">
          {toastlar.map((bildirim) => (
            <div
              key={`${bildirim.kaynak}:${bildirim.kayitId}`}
              className="pointer-events-auto"
            >
              <BildirimKarti
                bildirim={bildirim}
                yeni
                onOkundu={() => okunduYap(bildirim)}
                onErtele={(hatirlatAt) => ertele(bildirim, hatirlatAt)}
                onGoruntule={() => goruntule(bildirim)}
                onKapat={() => toastKapat(bildirim)}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function BildirimKarti({
  bildirim,
  yeni = false,
  onOkundu,
  onErtele,
  onGoruntule,
  onKapat,
}: {
  bildirim: Bildirim;
  yeni?: boolean;
  onOkundu: () => void;
  onErtele: (hatirlatAt: Date) => void;
  onGoruntule: () => void;
  onKapat?: () => void;
}) {
  const [erteleAcik, setErteleAcik] = useState(false);
  const erteleRef = useRef<HTMLDivElement>(null);
  const tanim = KAYNAK_HARITASI[bildirim.kaynak];

  useEffect(() => {
    if (!erteleAcik) return;
    const disariTikla = (olay: MouseEvent) => {
      if (!erteleRef.current?.contains(olay.target as Node)) {
        setErteleAcik(false);
      }
    };
    document.addEventListener("mousedown", disariTikla);
    return () => document.removeEventListener("mousedown", disariTikla);
  }, [erteleAcik]);

  return (
    <article
      className={`rounded-2xl border bg-white p-4 ${yeni ? "shadow-xl" : ""} ${
        bildirim.acil ? "border-rose-300" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${tanim.rozetStili}`}
        >
          {tanim.etiket}
        </span>
        <div className="flex items-center gap-1">
          <span className="whitespace-nowrap text-[11px] text-slate-400">
            {gecenSure(bildirim.createdAt)}
          </span>
          {onKapat && (
            <button
              type="button"
              onClick={onKapat}
              aria-label="Bildirimi gizle"
              className="flex h-6 w-6 items-center justify-center rounded-md text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <p className="mt-2 text-sm font-semibold leading-snug text-slate-800">
        {bildirim.baslik}
      </p>
      {bildirim.ozet && (
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          {bildirim.ozet}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onOkundu}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Okundu
        </button>

        <div className="relative" ref={erteleRef}>
          <button
            type="button"
            onClick={() => setErteleAcik((onceki) => !onceki)}
            aria-expanded={erteleAcik}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Hatırlat
          </button>
          {erteleAcik && (
            <div className="absolute right-0 top-full z-10 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
              {ERTELEME_SECENEKLERI.map((secenek) => (
                <button
                  key={secenek.id}
                  type="button"
                  onClick={() => {
                    setErteleAcik(false);
                    onErtele(secenek.hesapla());
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  {secenek.etiket}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onGoruntule}
          className="ml-auto rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-700"
        >
          Görüntüle
        </button>
      </div>
    </article>
  );
}
