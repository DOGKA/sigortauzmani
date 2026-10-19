/**
 * Adım 3 — Şirket fiyatları.
 *
 * Primler asenkron geliyor; `TeklifCalisildi` true olana kadar liste akmaya
 * devam ediyor. Bu yüzden "hepsi geldi" beklenmiyor, gelen her sonuç anında
 * gösteriliyor ve hâlâ bekleniyorsa üstte bir durum satırı kalıyor.
 *
 * Tüm fiyatlar gelince ana branşın öne çıkan teklifleri (en uygun, önerilen,
 * en popüler) bir modalda yan yana kartlar olarak açılıyor; önerilen ortada
 * ve vurgulu. Kapatınca liste kalıyor; üstteki
 * düğmeyle modal yeniden açılabiliyor. En az iki ayrı kart çıkmıyorsa modal
 * açılmıyor, etiketler yalnızca listede görünüyor.
 *
 * Otorizasyona düşen teklifler sunucuda eleniyor (`api/io/primler.ts`), bu
 * listeye hiç gelmiyor. Sayısı taşınıyor ki müşteri eksik şirketleri merak
 * etmesin.
 *
 * IO primi müşterinin ödeyeceği kampanya fiyatıdır. TL tekliflerde zam
 * yansıtılmayan tutar ayrıca karşılaştırma amacıyla gösterilir.
 */

import { useEffect, useMemo, useState } from "react";
import { useLocale, useT } from "../../lib/i18n/context";
import { formatDateTime, interpolate } from "../../lib/i18n/format";
import type { Locale } from "../../lib/i18n/locales";
import { satinAlinabilirSirket } from "../../lib/io/satinAlFiltre";
import type { SirketTeklifi } from "../../lib/io/types";
import { useSiteSettings } from "../../lib/settings/context";
import BilgiNotu from "./BilgiNotu";
import IlerlemePaneli from "./IlerlemePaneli";
import { kalanSure } from "./KampanyaSayaci";
import { BRANS_ADLARI, type BransSonucu } from "./flowState";
import { useTeklifIstatistik } from "./istatistik";
import { oneCikanlar, onerilenSirket, teklifAnahtari, type Etiket } from "./oneCikanlar";
import TeklifKarti from "./TeklifKarti";
import "./FiyatListesi.css";

/** Teklifin alındığı an; `alindiAt` istemcide işaretleniyor. */
function teklifZamani(sirket: SirketTeklifi, locale: Locale): string | null {
  if (typeof sirket.alindiAt !== "string") return null;
  const tarih = new Date(sirket.alindiAt);
  return Number.isNaN(tarih.getTime()) ? null : formatDateTime(sirket.alindiAt, locale);
}

/** Aynı şirket taksit satırlarıyla birden çok kez gelebildiği için tekilleştirilir. */
function sirketAdedi(sirketler: SirketTeklifi[]): number {
  return new Set(sirketler.map((sirket) => sirket.SirketKodu)).size;
}

const KAMPANYA_SURESI_MS = 5 * 60 * 1000;

interface Props {
  sonuclar: BransSonucu[];
  /** Teklif PDF'i oturuma karşı doğrulandığı için gerekli; yoksa gizlenir. */
  oturumId: string | null;
  /** Kısa süreli trafikte anında satın alınabilir şirket listesi farklı. */
  kisaSureli: boolean;
  onSatinAl: (
    bransNo: number,
    teklifId: number,
    teklif: SirketTeklifi,
  ) => Promise<void>;
  onTeklifIste: (
    bransNo: number,
    teklif: SirketTeklifi,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  onGeri: () => void;
  onSureDoldu: () => void;
  /** Ödeme modalı açıkken sayaç onun içinde gösteriliyor. */
  odemeAcik: boolean;
  onKampanyaBitis: (bitis: number) => void;
}

export default function FiyatListesi({
  sonuclar,
  oturumId,
  kisaSureli,
  onSatinAl,
  onTeklifIste,
  onGeri,
  onSureDoldu,
  odemeAcik,
  onKampanyaBitis,
}: Props) {
  const t = useT();
  const { locale } = useLocale();
  const { settings } = useSiteSettings();
  const istatistik = useTeklifIstatistik();
  const bransAdi = (bransNo: number) =>
    bransNo === 0
      ? t.flow.brans.trafik
      : bransNo === 1
        ? t.flow.brans.kasko
        : bransNo === 2
          ? t.flow.brans.dask
          : bransNo === 6
            ? t.flow.brans.travel
            : bransNo === 22
              ? t.flow.brans.imm
              : BRANS_ADLARI[bransNo] ?? String(bransNo);
  const [gonderiliyor, setGonderiliyor] = useState<string | null>(null);
  const [hatalar, setHatalar] = useState<Record<string, string>>({});
  // "Satın al" basılınca şirkete ön kontrol soruluyor; o sırada düğme kilitli.
  const [kontrolEdilen, setKontrolEdilen] = useState<string | null>(null);
  const [modalKapali, setModalKapali] = useState(false);
  const [kampanyaBitis, setKampanyaBitis] = useState<number | null>(null);
  const [simdi, setSimdi] = useState(() => Date.now());

  const onerilenKodlar = useMemo(
    () => new Set(settings.products.onerilenSirketler),
    [settings.products.onerilenSirketler],
  );

  const oneCikanlarBransa = useMemo(
    () =>
      sonuclar.map((sonuc) =>
        oneCikanlar(
          sonuc.bransNo,
          sonuc.sirketler,
          onerilenKodlar,
          istatistik?.populer[String(sonuc.bransNo)],
        ),
      ),
    [sonuclar, onerilenKodlar, istatistik],
  );

  const etiketHaritasi = useMemo(() => {
    const harita = new Map<string, Etiket[]>();
    sonuclar.forEach((sonuc, i) => {
      for (const oc of oneCikanlarBransa[i]) {
        harita.set(teklifAnahtari(sonuc.bransNo, oc.teklif), [...oc.etiketler]);
      }
      for (const sirket of sonuc.sirketler) {
        if (!onerilenSirket(sirket.SirketKodu, onerilenKodlar)) continue;
        const anahtar = teklifAnahtari(sonuc.bransNo, sirket);
        const mevcut = harita.get(anahtar) ?? [];
        if (mevcut.includes("recommended")) continue;
        harita.set(anahtar, [...mevcut, "recommended"]);
      }
    });
    return harita;
  }, [sonuclar, oneCikanlarBransa, onerilenKodlar]);

  const hepsiTamam = sonuclar.every((sonuc) => sonuc.tamamlandi);
  const toplamTeklif = sonuclar.reduce(
    (toplam, sonuc) => toplam + sonuc.sirketler.length,
    0,
  );
  const toplamOtorizasyon = sonuclar.reduce(
    (toplam, sonuc) => toplam + sonuc.otorizasyonSayisi,
    0,
  );

  useEffect(() => {
    if (!hepsiTamam || toplamTeklif === 0 || kampanyaBitis !== null) return;
    const bitis = Date.now() + KAMPANYA_SURESI_MS;
    setKampanyaBitis(bitis);
    onKampanyaBitis(bitis);
    setSimdi(Date.now());
  }, [hepsiTamam, kampanyaBitis, onKampanyaBitis, toplamTeklif]);

  useEffect(() => {
    if (kampanyaBitis === null || kampanyaBitis <= simdi) return;
    const zamanlayici = window.setInterval(() => setSimdi(Date.now()), 1000);
    return () => window.clearInterval(zamanlayici);
  }, [kampanyaBitis, simdi]);

  const kampanyaKalan = kampanyaBitis === null ? 0 : Math.max(0, kampanyaBitis - simdi);
  const kampanyaAktif = kampanyaKalan > 0;

  useEffect(() => {
    if (kampanyaBitis === null || simdi < kampanyaBitis) return;
    onSureDoldu();
  }, [kampanyaBitis, onSureDoldu, simdi]);

  const ana = sonuclar[0];
  // Modalda yalnızca en uygun ve önerilen kartları; en uygun üstte.
  const anaOneCikanlar = useMemo(
    () =>
      (oneCikanlarBransa[0] ?? []).filter(
        (oc) => oc.etiketler.includes("best") || oc.etiketler.includes("recommended"),
      ),
    [oneCikanlarBransa],
  );
  const vurguluOneCikan =
    anaOneCikanlar.find((oc) => oc.etiketler.includes("recommended")) ?? anaOneCikanlar[0];
  const modalVar = hepsiTamam && Boolean(ana) && anaOneCikanlar.length > 0;
  const modalAcik = modalVar && !modalKapali;

  useEffect(() => {
    if (!modalAcik) return;
    const kapat = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalKapali(true);
    };
    window.addEventListener("keydown", kapat);
    return () => window.removeEventListener("keydown", kapat);
  }, [modalAcik]);

  const satinAlBaslat = async (bransNo: number, teklifId: number, teklif: SirketTeklifi) => {
    if (kontrolEdilen) return;
    // Ödeme modalı bunun üstüne açılıyor; iki modal üst üste kalmasın.
    setModalKapali(true);
    setKontrolEdilen(teklifAnahtari(bransNo, teklif));
    try {
      await onSatinAl(bransNo, teklifId, teklif);
    } finally {
      setKontrolEdilen(null);
    }
  };

  // Talep açılınca sayfa başarı ekranına geçiyor; bu yüzden burada
  // "alındı" durumu tutulmuyor, yalnızca gönderim sırası kilitleniyor.
  const teklifIste = async (bransNo: number, teklif: SirketTeklifi) => {
    const anahtar = teklifAnahtari(bransNo, teklif);
    if (gonderiliyor) return;

    setGonderiliyor(anahtar);
    setHatalar((onceki) => {
      if (!onceki[anahtar]) return onceki;
      const sonraki = { ...onceki };
      delete sonraki[anahtar];
      return sonraki;
    });

    const sonuc = await onTeklifIste(bransNo, teklif);
    setGonderiliyor(null);

    const hataMesaji = "error" in sonuc ? sonuc.error : null;
    if (hataMesaji) {
      setHatalar((onceki) => ({ ...onceki, [anahtar]: hataMesaji }));
    }
  };

  const kart = (
    sonuc: BransSonucu,
    sirket: SirketTeklifi,
    etiketler: Etiket[],
    gorunum: "liste" | "one-cikan",
    vurgu = false,
  ) => {
    const anahtar = teklifAnahtari(sonuc.bransNo, sirket);
    const satinAl = satinAlinabilirSirket(sonuc.bransNo, sirket.SirketKodu, kisaSureli);
    return (
      <TeklifKarti
        key={anahtar}
        sirket={sirket}
        bransNo={sonuc.bransNo}
        teklifId={sonuc.teklifId}
        oturumId={oturumId}
        etiketler={etiketler}
        gorunum={gorunum}
        vurgu={vurgu}
        zaman={teklifZamani(sirket, locale)}
        satinAl={satinAl}
        kilitli={satinAl ? Boolean(kontrolEdilen) : Boolean(gonderiliyor)}
        kampanyaAktif={kampanyaAktif}
        islemMetni={
          kontrolEdilen === anahtar
            ? t.flow.offers.checking
            : gonderiliyor === anahtar
              ? t.flow.offers.sending
              : null
        }
        hata={hatalar[anahtar] ?? null}
        onSatinAl={() => void satinAlBaslat(sonuc.bransNo, sonuc.teklifId, sirket)}
        onTeklifIste={() => void teklifIste(sonuc.bransNo, sirket)}
      />
    );
  };

  return (
    <div className="flow__card flow__card--wide fiyat">
      <div className="fiyat__ust">
        <h2 className="flow__card-title">{t.quote.offers}</h2>
        {modalVar && modalKapali ? (
          <button
            type="button"
            className="fiyat__one-cikan-ac"
            onClick={() => setModalKapali(false)}
          >
            {t.flow.offers.showFeatured}
          </button>
        ) : null}
      </div>

      {!hepsiTamam ? (
        <IlerlemePaneli
          baslik={t.flow.preparing}
          mesajlar={[...t.flow.preparingMsgs]}
          not={t.flow.preparingNot}
        />
      ) : null}

      {hepsiTamam && toplamTeklif === 0 ? (
        <div className="flow__empty">
          <p>{t.flow.offers.empty}</p>
        </div>
      ) : null}

      {hepsiTamam && toplamOtorizasyon > 0 ? (
        <p className="flow__hint">
          {interpolate(t.flow.offers.authorization, { n: toplamOtorizasyon })}
        </p>
      ) : null}

      {hepsiTamam && toplamTeklif > 0 && !modalAcik && !odemeAcik ? (
        <div
          className={`fiyat__kampanya-sayac${
            kampanyaAktif ? "" : " fiyat__kampanya-sayac--bitti"
          }`}
          role="timer"
          aria-live="polite"
        >
          <span>{t.flow.offers.campaignLast}</span>
          <strong>{kalanSure(kampanyaKalan)}</strong>
        </div>
      ) : null}

      {hepsiTamam ? sonuclar.map((sonuc) => {
        const sirali = [...sonuc.sirketler].sort((a, b) => a.Prim - b.Prim);
        const adet = sirketAdedi(sonuc.sirketler);

        return (
          <section key={sonuc.bransNo} className="fiyat__brans">
            {sonuclar.length > 1 || adet >= 2 ? (
              <div className="fiyat__brans-ust">
                {sonuclar.length > 1 ? (
                  <h3 className="fiyat__brans-ad">{bransAdi(sonuc.bransNo)}</h3>
                ) : null}
                {adet >= 2 ? (
                  <p className="fiyat__ozet">
                    {interpolate(t.flow.offers.fromCompanies, { n: adet })}
                  </p>
                ) : null}
              </div>
            ) : null}

            {sirali.length === 0 && sonuc.tamamlandi ? (
              <p className="flow__hint">{t.flow.offers.none}</p>
            ) : null}

            <ul className="fiyat__liste">
              {sirali.map((sirket) =>
                kart(
                  sonuc,
                  sirket,
                  etiketHaritasi.get(teklifAnahtari(sonuc.bransNo, sirket)) ?? [],
                  "liste",
                ),
              )}
            </ul>
          </section>
        );
      }) : null}

      {hepsiTamam && toplamTeklif > 0 ? (
        <BilgiNotu>{t.flow.offers.disclaimer}</BilgiNotu>
      ) : null}

      <div className="flow__actions">
        <button type="button" className="flow__ghost" onClick={onGeri}>
          {t.flow.editDetails}
        </button>
      </div>

      {modalAcik && ana ? (
        <div
          className="flow__overlay fiyat__overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fiyat-one-cikan-baslik"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalKapali(true);
          }}
        >
          <div className="fiyat__modal">
            <button
              type="button"
              className="flow__modal-close"
              aria-label={t.flow.close}
              onClick={() => setModalKapali(true)}
            >
              ×
            </button>
            <h2 className="fiyat__modal-baslik" id="fiyat-one-cikan-baslik">
              {t.flow.offers.featuredTitle}
            </h2>
            <p className="fiyat__modal-lead">
              {interpolate(t.flow.offers.featuredLead, { n: sirketAdedi(ana.sirketler) })}
            </p>
            <div
              className={`fiyat__kampanya-sayac fiyat__kampanya-sayac--modal${
                kampanyaAktif ? "" : " fiyat__kampanya-sayac--bitti"
              }`}
              role="timer"
            >
              <span>{t.flow.offers.campaignLast}</span>
              <strong>{kalanSure(kampanyaKalan)}</strong>
            </div>
            <ul className="fiyat__oc-liste" data-adet={anaOneCikanlar.length}>
              {anaOneCikanlar.map((oc) =>
                kart(ana, oc.teklif, oc.etiketler, "one-cikan", oc === vurguluOneCikan),
              )}
            </ul>
            <button
              type="button"
              className="flow__ghost fiyat__tumu"
              onClick={() => setModalKapali(true)}
            >
              {t.flow.offers.showAll}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
