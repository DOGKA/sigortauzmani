/**
 * Self servis teklif akışı (tam otomasyon ürünleri).
 *
 * CRM dökümanındaki akışın müşteri tarafındaki karşılığı: kimlik → sorgular
 * → ürün alanları → "Teklif Çalış" → fiyat listesi → satın alma. Üyelik
 * yok; oturum sunucudan gelen imzalı çerezle taşınıyor.
 *
 * Otomasyona açılmayan ürünler (Konut, TSS, Özel Sağlık, Yeşil Kart) bu
 * sayfaya hiç düşmüyor; `App.tsx` onları mevcut lead formuna yönlendiriyor.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AdvisorVideo from "../components/AdvisorVideo";
import TalepBasariEkrani from "../components/TalepBasariEkrani";
import { useInternalProductSlug, useLocale, useT } from "../lib/i18n/context";
import { localizedProduct } from "../lib/i18n/products";
import { getProduct } from "../data/products";
import { getQuoteKvkkGovde, QUOTE_KVKK_SURUM } from "../data/quoteKvkk";
import { isSaglikUrunu } from "../data/saglikRiza";
import { IoError, primleriBekle, teklifOlustur } from "../lib/io/client";
import type {
  PrimlerSonuc,
  SatinAlmaSonuc,
  SirketTeklifi,
  TeklifPayload,
} from "../lib/io/types";
import { createTalep, generateTalepNo } from "../lib/supabase";
import { ROBOTS_NOINDEX, pageOgImageUrl } from "../lib/seo/config";
import { useSeo } from "../lib/seo/useSeo";
import AracAdimi from "./quote/AracAdimi";
import BelgeButonu from "./quote/BelgeButonu";
import DaskAdimi from "./quote/DaskAdimi";
import EskiTeklifModali from "./quote/EskiTeklifModali";
import FiyatListesi from "./quote/FiyatListesi";
import KimlikAdimi from "./quote/KimlikAdimi";
import OdemeModali from "./quote/OdemeModali";
import SeyahatAdimi from "./quote/SeyahatAdimi";
import {
  aracTeklifPayload,
  daskTeklifPayload,
  seyahatTeklifPayload,
} from "./quote/buildPayload";
import { ozetSatirlari } from "./quote/ozet";
import {
  bosArac,
  bosDask,
  bosKimlik,
  bosSeyahat,
  BRANS_ADLARI,
  kimlikNoOf,
  urunGereksinimi,
  type Adim,
  type AracDurumu,
  type BransSonucu,
  type DaskDurumu,
  type KimlikDurumu,
  type SeyahatDurumu,
} from "./quote/flowState";
import "./QuoteFlowPage.css";

const ADIM_SIRASI: Adim[] = ["kimlik", "detay", "fiyatlar", "sonuc"];

const DETAY_VIDEO = "/advisor-2.mp4";

interface SecilenTeklif {
  bransNo: number;
  teklifId: number;
  teklif: SirketTeklifi;
}

/** Anında satın alınamayan şirketlerde açılan talep. */
interface TalepBasarisi {
  talepNo: string;
  urunAdi: string;
  sirketAdi: string;
}

export default function QuoteFlowPage() {
  const slug = useInternalProductSlug();
  const { locale, href, quoteHref } = useLocale();
  const t = useT();
  const found = slug ? getProduct(slug) : undefined;
  const product = found ? localizedProduct(found, locale) : undefined;
  const gereksinim = slug ? urunGereksinimi(slug) : null;

  const [adim, setAdim] = useState<Adim>("kimlik");
  // Aydınlatma metni kimlik adımında gösteriliyor; sürümü ve gösterim anı
  // talep kaydına yazılıyor ki sonradan hangi metnin gösterildiği
  // kanıtlanabilsin.
  const [kvkkGosterildiAt] = useState(() => new Date().toISOString());
  const [kimlik, setKimlik] = useState<KimlikDurumu>(bosKimlik);
  const [arac, setArac] = useState<AracDurumu>(bosArac);
  const [seyahat, setSeyahat] = useState<SeyahatDurumu>(bosSeyahat);
  const [dask, setDask] = useState<DaskDurumu>(bosDask);
  const [meslekKodu, setMeslekKodu] = useState("");
  const [immBedel, setImmBedel] = useState("1");
  const [manevi, setManevi] = useState("0");
  const [kaskoDa, setKaskoDa] = useState(false);

  const [oturumId, setOturumId] = useState<string | null>(null);
  const [oturumNo, setOturumNo] = useState<string | null>(null);
  const [sonuclar, setSonuclar] = useState<BransSonucu[]>([]);
  const [calisiyor, setCalisiyor] = useState(false);
  const [hata, setHata] = useState("");
  // Kullanıcının düzeltemeyeceği hatalarda (token bitti, servis kapalı,
  // kapasite doldu) self servisi bırakıp lead formunu öneriyoruz.
  const [geriDonus, setGeriDonus] = useState("");

  const [secilen, setSecilen] = useState<SecilenTeklif | null>(null);
  const [satinAlma, setSatinAlma] = useState<SatinAlmaSonuc | null>(null);
  // Poliçe ve makbuz PDF'leri satın alınan teklifin satır kimliğiyle
  // alınıyor; sonuç ekranı ödeme modalı kapandıktan sonra da ihtiyaç duyuyor.
  const [satinAlinan, setSatinAlinan] = useState<SecilenTeklif | null>(null);
  // "Teklif iste" ile açılan talep; lead formundaki başarı ekranını açıyor.
  const [talepBasari, setTalepBasari] = useState<TalepBasarisi | null>(null);
  // IO 24 saatten eski teklifi döndürdüğünde sorulan soru.
  const [eskiTeklifSorusu, setEskiTeklifSorusu] = useState(false);
  const [eskiTeklifTarihi, setEskiTeklifTarihi] = useState<string | null>(null);
  const [yeniTeklifGonderiliyor, setYeniTeklifGonderiliyor] = useState(false);
  const [yeniTeklifHatasi, setYeniTeklifHatasi] = useState("");

  const pollAbort = useRef<AbortController | null>(null);
  // En az bir fiyat geldiyse polling hatası akışı bozmamalı; kullanıcı
  // eldeki tekliflerle devam edebilir.
  const fiyatGeldi = useRef(false);

  const productPath = product ? quoteHref(product.slug) : href("home");

  useSeo(
    product
      ? {
          title: product.seoTitle,
          description: product.metaDescription,
          path: productPath,
          image: pageOgImageUrl(product.seoTitle, product.title),
          // Teklif akışı kişiye özel ve adımlı; arama motorlarına kapalı.
          robots: ROBOTS_NOINDEX,
        }
      : {
          title: t.quote.notFound,
          description: "",
          path: "/",
          robots: ROBOTS_NOINDEX,
        },
  );

  useEffect(() => {
    return () => pollAbort.current?.abort();
  }, []);

  const bransSonucGuncelle = useCallback(
    (bransNo: number, primler: PrimlerSonuc) => {
      const { sirketler, teklifCalisildi: tamamlandi } = primler;
      const otorizasyonSayisi = primler.otorizasyonSayisi ?? 0;
      if (sirketler.length) fiyatGeldi.current = true;
      setSonuclar((onceki) =>
        onceki.map((sonuc) => {
          if (sonuc.bransNo !== bransNo) return sonuc;
          // Aynı şirket her turda tekrar gelebiliyor; TeklifNo + Id ile
          // tekilleştirip son gelen değeri tutuyoruz.
          const harita = new Map<string, SirketTeklifi>();
          for (const mevcut of sonuc.sirketler) {
            harita.set(`${mevcut.Id}-${mevcut.TeklifNo}`, mevcut);
          }
          for (const yeni of sirketler) {
            const anahtar = `${yeni.Id}-${yeni.TeklifNo}`;
            // Teklif zamanı ilk görüldüğü anda sabitleniyor; sonraki turlar
            // aynı satırı tekrar döndürdüğünde tarih ileri kaymamalı.
            const oncekiZaman = harita.get(anahtar)?.alindiAt;
            harita.set(anahtar, {
              ...yeni,
              alindiAt:
                typeof oncekiZaman === "string"
                  ? oncekiZaman
                  : new Date().toISOString(),
            });
          }
          return {
            ...sonuc,
            sirketler: [...harita.values()],
            tamamlandi: tamamlandi || sonuc.tamamlandi,
            // Her tur aynı satırları tekrar döndürdüğü için sayaç
            // biriktirilmez, son turun değeri geçerlidir.
            otorizasyonSayisi: Math.max(
              otorizasyonSayisi,
              sonuc.otorizasyonSayisi,
            ),
            eskiTeklif: primler.eskiTeklif === true || sonuc.eskiTeklif,
          };
        }),
      );
    },
    [],
  );

  /**
   * `oncekiTeklifId` verildiğinde bu bir "yeni teklif" denemesidir: eski
   * teklif diyalogunda kullanıcı yeni teklif istediğinde IO'ya gerçekten
   * gidilir. Partner CRM'indeki "vazgeç" de aynı şeyi yapıyor.
   */
  const teklifCalis = async (oncekiTeklifId?: number) => {
    if (!gereksinim || !product) return;

    setHata("");
    setCalisiyor(true);
    fiyatGeldi.current = false;

    let anaPayload: TeklifPayload;
    if (gereksinim.adimTipi === "seyahat") {
      anaPayload = seyahatTeklifPayload(kimlik, seyahat);
    } else if (gereksinim.adimTipi === "dask") {
      anaPayload = daskTeklifPayload(kimlik, dask);
    } else {
      anaPayload = aracTeklifPayload({
        kimlik,
        arac,
        gereksinim,
        meslekKodu,
        immBedel,
        manevi,
      });
    }

    const talepler = [{ bransNo: gereksinim.bransNo, payload: anaPayload }];

    // Trafik akışında aynı araç için Kasko da hazırlanabiliyor. Kasko
    // yakıt tipi istediği için kullanıcı seçmediyse ek teklif atlanır.
    // Kısa süreli trafikte bu seçenek hiç sorulmuyor.
    if (gereksinim.bransNo === 0 && !gereksinim.kisaSureli && kaskoDa) {
      const kaskoGereksinim = { ...gereksinim, bransNo: 1, yakitGerekli: true };
      talepler.push({
        bransNo: 1,
        payload: aracTeklifPayload({
          kimlik,
          arac,
          gereksinim: kaskoGereksinim,
          meslekKodu,
        }),
      });
    }

    try {
      const sonuc = await teklifOlustur({
        productSlug: product.slug,
        talepler,
        kisi: {
          entityType: kimlik.entityType,
          // Gerçek kişinin kimlik numarası; yabancı uyrukluda YKN aynı
          // alana yazılıyor, ayrımı entityType taşıyor.
          tckn: kimlik.entityType === "sirket" ? null : kimlikNoOf(kimlik),
          vergiNo: kimlik.entityType === "sirket" ? kimlik.vkn : null,
          adSoyad: kimlik.adSoyad || null,
          phone: kimlik.phone.replace(/\D/g, "") || null,
          birthDate: kimlik.birthDate || null,
          plate:
            gereksinim.aracGerekli && arac.plakaVar
              ? arac.plaka.toUpperCase()
              : null,
          adresKodu: gereksinim.adimTipi === "dask" ? dask.adresKodu : null,
        },
        // Panelde okunabilir olsun diye kodların etiketlenmiş hâli; IO
        // gövdesi de ayrıca kaydedildiği için bu yalnızca gösterim içindir.
        girdiler: ozetSatirlari({
          gereksinim,
          kimlik,
          arac,
          seyahat,
          dask,
          meslekKodu,
          immBedel,
          manevi,
          kaskoDa,
        }),
      });

      setOturumId(sonuc.oturumId);
      setOturumNo(sonuc.oturumNo);

      // IO aynı kişi ve aynı riziko için yeni teklif açmıyor, kayıtlı
      // teklifi geri veriyor. Deneme aynı TeklifId ile döndüyse tazelenecek
      // bir şey yok: eldeki liste bozulmadan bırakılıp talep ekibe düşüyor,
      // soru ekranı da sonucu göstermek için açık kalıyor.
      if (
        oncekiTeklifId !== undefined &&
        sonuc.teklifler.length > 0 &&
        sonuc.teklifler.every((teklif) => teklif.teklifId === oncekiTeklifId)
      ) {
        const talep = await teklifIste(sonuc.teklifler[0].bransNo);
        setYeniTeklifHatasi(
          talep.ok ? t.flow.reworkedDialog.retryFailed : talep.error,
        );
        return;
      }

      setSonuclar(
        sonuc.teklifler.map((teklif) => ({
          bransNo: teklif.bransNo,
          teklifId: teklif.teklifId,
          sirketler: [],
          tamamlandi: false,
          otorizasyonSayisi: 0,
          // 24 saati geçmiş teklifte anında satın alma kapalı kalıyor;
          // liste "Teklif iste" düğmesine dönüyor.
          eskiTeklif: teklif.eskiTeklif === true,
        })),
      );
      // Sorgu arka planda sürüyor: "devam" seçilirse fiyatlar hazır olur.
      const eski = sonuc.teklifler.find((teklif) => teklif.eskiTeklif === true);
      setEskiTeklifTarihi(eski?.teklifTarihi ?? null);
      setEskiTeklifSorusu(Boolean(eski));
      setAdim("fiyatlar");

      pollAbort.current?.abort();
      const controller = new AbortController();
      pollAbort.current = controller;

      // Branşlar paralel sorgulanır; biri bitmeden diğeri beklemez.
      await Promise.all(
        sonuc.teklifler.map((teklif) =>
          primleriBekle(
            {
              oturumId: sonuc.oturumId,
              bransNo: teklif.bransNo,
              teklifId: teklif.teklifId,
            },
            (primler) => bransSonucGuncelle(teklif.bransNo, primler),
            controller.signal,
          ),
        ),
      );
    } catch (error) {
      const mesaj =
        error instanceof IoError
          ? error.message
          : "Teklif çalıştırılamadı. Lütfen tekrar deneyin.";

      // Fiyatlar gelmeye başladıktan sonra polling koparsa akışı bozmuyoruz:
      // listeyi tamamlandı işaretleyip eldeki tekliflerle devam ediyoruz.
      if (fiyatGeldi.current) {
        setSonuclar((onceki) =>
          onceki.map((sonuc) => ({ ...sonuc, tamamlandi: true })),
        );
      } else if (error instanceof IoError && error.fallback) {
        setGeriDonus(mesaj);
      } else {
        setHata(mesaj);
        setAdim("detay");
      }
    } finally {
      setCalisiyor(false);
    }
  };

  /**
   * Ekibe manuel teklif talebi düşürür. `teklif` boş geçilebilir: eski
   * teklif diyalogunda "yeni teklif oluştur" seçildiğinde henüz bir şirket
   * seçilmiş olmuyor.
   */
  const teklifIste = async (
    bransNo: number,
    teklif?: SirketTeklifi | null,
  ): Promise<{ ok: true } | { ok: false; error: string }> => {
    if (!product || !gereksinim) {
      return { ok: false, error: "Ürün bulunamadı." };
    }

    const kaskoEkTeklif = bransNo === 1 && product.slug !== "kasko";
    const talepNo = generateTalepNo();
    const urunAdi = kaskoEkTeklif ? BRANS_ADLARI[1] : product.title;

    const sonuc = await createTalep({
      talep_no: talepNo,
      product_slug: kaskoEkTeklif ? "kasko" : product.slug,
      // Ana üründe branş adı yerine ürünün kendi başlığı kullanılıyor:
      // kısa süreli trafik de branş 0'da çalıştığı için branş adı
      // "Trafik Sigortası" derdi ve panelde iki ürün ayırt edilemezdi.
      product_title: urunAdi,
      insured_for: null,
      entity_type: kimlik.entityType === "sirket" ? "sirket" : "sahis",
      tckn: kimlik.entityType === "sirket" ? null : kimlikNoOf(kimlik) || null,
      vergi_no: kimlik.entityType === "sirket" ? kimlik.vkn || null : null,
      phone: kimlik.phone || null,
      birth_date: kimlik.birthDate || null,
      plate:
        gereksinim.aracGerekli && arac.plakaVar
          ? arac.plaka.toUpperCase() || null
          : null,
      document_serial:
        gereksinim.aracGerekli && arac.plakaVar
          ? arac.tescilBelge.toUpperCase() || null
          : null,
      motor_no:
        gereksinim.aracGerekli && !arac.plakaVar
          ? arac.motorNo.trim().toUpperCase() || null
          : null,
      sasi_no:
        gereksinim.aracGerekli && !arac.plakaVar
          ? arac.sasiNo.trim().toUpperCase() || null
          : null,
      sirket_adi: teklif?.SirketAdi ?? null,
      gosterilen_prim: teklif?.Prim ?? null,
      saglik_acik_riza: isSaglikUrunu(product.slug)
        ? kimlik.saglikRiza === "veriyorum"
        : null,
      locale,
      ...(getQuoteKvkkGovde(product.slug)
        ? {
            kvkk_surum: `${QUOTE_KVKK_SURUM}:${locale}`,
            kvkk_gosterildi_at: kvkkGosterildiAt,
          }
        : {}),
    });

    if (!sonuc.ok) return sonuc;

    // Talep açıldıktan sonra fiyat listesinde kalmanın anlamı yok; süreç
    // artık ekibin elinde. Lead formuyla aynı başarı ekranına geçiliyor.
    pollAbort.current?.abort();
    setTalepBasari({
      talepNo,
      urunAdi,
      sirketAdi: teklif?.SirketAdi ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    return sonuc;
  };

  /** "Yeni teklif oluştur" — akışı ilk adımdan başlatır. */
  const akisiSifirla = () => {
    setTalepBasari(null);
    setSatinAlma(null);
    setSatinAlinan(null);
    setSecilen(null);
    setSonuclar([]);
    setEskiTeklifSorusu(false);
    setOturumId(null);
    setOturumNo(null);
    setKimlik(bosKimlik);
    setArac(bosArac);
    setSeyahat(bosSeyahat);
    setDask(bosDask);
    setMeslekKodu("");
    setImmBedel("1");
    setManevi("0");
    setKaskoDa(false);
    setHata("");
    setGeriDonus("");
    setAdim("kimlik");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!product || !gereksinim) {
    return (
      <div className="flow flow--empty">
        <h1>{t.quote.notFound}</h1>
        <Link to={href("home")} className="flow__primary">
          {t.quote.homeBack}
        </Link>
      </div>
    );
  }

  // Talep açıldıysa akış biter: adım çubuğu ve fiyat listesi yerine lead
  // formuyla aynı başarı ekranı gösteriliyor.
  if (talepBasari) {
    return (
      <div className="flow">
        <div className="flow__inner">
          <nav className="flow__breadcrumb" aria-label={t.quote.breadcrumb}>
            <Link to={href("home")}>{t.quote.home}</Link>
            <span aria-hidden="true">/</span>
            <span>{product.title}</span>
          </nav>

          <div className="flow__card flow__card--basari">
            <TalepBasariEkrani
              talepNo={talepBasari.talepNo}
              onYeniTeklif={akisiSifirla}
            />
          </div>
        </div>
      </div>
    );
  }

  const aktifIndex = ADIM_SIRASI.indexOf(adim);
  const adimEtiketleri: Record<Adim, string> = {
    kimlik: t.quote.identityStep,
    detay: t.quote.detailsStep,
    fiyatlar: t.quote.offers,
    sonuc: t.quote.policy,
  };

  return (
    <div className="flow">
      <div className="flow__inner">
        <nav className="flow__breadcrumb" aria-label={t.quote.breadcrumb}>
          <Link to={href("home")}>{t.quote.home}</Link>
          <span aria-hidden="true">/</span>
          <span>{product.title}</span>
        </nav>

        <h1 className="flow__title">{product.title}</h1>

        {!geriDonus ? (
          <ol className="flow__steps">
            {ADIM_SIRASI.map((deger, index) => (
              <li
                key={deger}
                className={`flow__step${index <= aktifIndex ? " flow__step--active" : ""}`}
              >
                <span className="flow__step-no">{index + 1}</span>
                <span className="flow__step-label">{adimEtiketleri[deger]}</span>
              </li>
            ))}
          </ol>
        ) : null}

        {!geriDonus && (adim === "kimlik" || adim === "detay") ? (
          <AdvisorVideo
            replayKey={aktifIndex}
            videoSrc={adim === "detay" ? DETAY_VIDEO : undefined}
            transcript={adim === "detay" ? t.quote.advisorNext : undefined}
          />
        ) : null}

        {geriDonus ? (
          <div className="flow__card">
            <h2 className="flow__card-title">{t.flow.instantUnavailable}</h2>
            <p className="flow__card-sub">{geriDonus}</p>
            <p className="flow__fallback-text">{t.flow.fallbackText}</p>
            <div className="flow__actions">
              <Link to={href("home")} className="flow__ghost">
                {t.quote.homeBack}
              </Link>
              <Link
                to={`${productPath}?form=manuel`}
                className="flow__primary"
              >
                {t.flow.toManual}
              </Link>
            </div>
          </div>
        ) : null}

        {!geriDonus && adim === "kimlik" ? (
          <KimlikAdimi
            productSlug={product.slug}
            bransNo={gereksinim.bransNo}
            durum={kimlik}
            onDegis={(patch) => setKimlik((onceki) => ({ ...onceki, ...patch }))}
            onDevam={() => {
              // MERNİS kayıtlı adresin UAVT kodunu verdiyse DASK adımı hazır
              // gelsin. Kullanıcı daha önce elle bir kod girdiyse ona
              // dokunulmuyor.
              if (kimlik.adresKodu) {
                setDask((onceki) =>
                  onceki.adresKodu
                    ? onceki
                    : { ...onceki, adresKodu: kimlik.adresKodu },
                );
              }
              setAdim("detay");
            }}
          />
        ) : null}

        {!geriDonus && adim === "detay" && gereksinim.adimTipi === "seyahat" ? (
          <SeyahatAdimi
            durum={seyahat}
            onDegis={(patch) => setSeyahat((onceki) => ({ ...onceki, ...patch }))}
            onGeri={() => setAdim("kimlik")}
            onTeklifCalis={teklifCalis}
            calisiyor={calisiyor}
            hata={hata}
          />
        ) : null}

        {!geriDonus && adim === "detay" && gereksinim.adimTipi === "dask" ? (
          <DaskAdimi
            durum={dask}
            onDegis={(patch) => setDask((onceki) => ({ ...onceki, ...patch }))}
            onGeri={() => setAdim("kimlik")}
            onTeklifCalis={teklifCalis}
            calisiyor={calisiyor}
            hata={hata}
          />
        ) : null}

        {!geriDonus && adim === "detay" && gereksinim.adimTipi === "arac" ? (
          <AracAdimi
            gereksinim={gereksinim}
            kimlik={kimlik}
            durum={arac}
            onDegis={(patch) => setArac((onceki) => ({ ...onceki, ...patch }))}
            meslekKodu={meslekKodu}
            onMeslekDegis={setMeslekKodu}
            immBedel={immBedel}
            manevi={manevi}
            onImmDegis={(patch) => {
              if (patch.immBedel !== undefined) setImmBedel(patch.immBedel);
              if (patch.manevi !== undefined) setManevi(patch.manevi);
            }}
            kaskoDa={kaskoDa}
            onKaskoDaDegis={setKaskoDa}
            onGeri={() => setAdim("kimlik")}
            onTeklifCalis={teklifCalis}
            calisiyor={calisiyor}
            hata={hata}
          />
        ) : null}

        {!geriDonus && adim === "fiyatlar" ? (
          <FiyatListesi
            sonuclar={sonuclar}
            oturumId={oturumId}
            kisaSureli={gereksinim.kisaSureli}
            onSatinAl={(bransNo, teklifId, teklif) =>
              setSecilen({ bransNo, teklifId, teklif })
            }
            onTeklifIste={teklifIste}
            onGeri={() => {
              pollAbort.current?.abort();
              setAdim("detay");
            }}
          />
        ) : null}

        {!geriDonus && adim === "fiyatlar" && eskiTeklifSorusu ? (
          <EskiTeklifModali
            teklifTarihi={eskiTeklifTarihi}
            yeniTeklifGonderiliyor={yeniTeklifGonderiliyor}
            yeniTeklifHatasi={yeniTeklifHatasi}
            onDevam={() => setEskiTeklifSorusu(false)}
            onYeniTeklif={async () => {
              setYeniTeklifGonderiliyor(true);
              setYeniTeklifHatasi("");
              // Şirket yeni teklif açarsa liste tazelenip soru kapanıyor;
              // açmazsa gerçek sonuç ekranda kalıyor ve talep ekibe düşüyor.
              await teklifCalis(sonuclar[0]?.teklifId);
              setYeniTeklifGonderiliyor(false);
            }}
          />
        ) : null}

        {!geriDonus && adim === "sonuc" && satinAlma ? (
          <div className="flow__card">
            <h2 className="flow__card-title">{t.flow.policyReady}</h2>
            <p className="flow__card-sub">{t.flow.paymentReceived}</p>

            <dl className="flow__ozet">
              {satinAlma.policeNo ? (
                <>
                  <dt>{t.flow.policyNo}</dt>
                  <dd>{satinAlma.policeNo}</dd>
                </>
              ) : null}
              {oturumNo ? (
                <>
                  <dt>{t.flow.txnNo}</dt>
                  <dd>{oturumNo}</dd>
                </>
              ) : null}
              <dt>{t.flow.paidCard}</dt>
              <dd>**** {satinAlma.kartSon4}</dd>
            </dl>

            {/* Ödeme anında hazır olmayan belge gizlenmiyor: makbuz sigorta
                şirketinde poliçeden biraz sonra oluşabildiği için buton
                kalıyor ve istendiğinde yeniden soruluyor. */}
            <div className="flow__inline-actions">
              {satinAlma.policePdfUrl ? (
                <a
                  className="flow__secondary"
                  href={satinAlma.policePdfUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.flow.downloadPolicy}
                </a>
              ) : oturumId && satinAlinan ? (
                <BelgeButonu
                  oturumId={oturumId}
                  bransNo={satinAlinan.bransNo}
                  teklifId={satinAlinan.teklifId}
                  sirketTeklifId={satinAlinan.teklif.Id}
                  tip="police"
                  etiket={t.flow.downloadPolicy}
                />
              ) : null}

              {satinAlma.makbuzPdfUrl ? (
                <a
                  className="flow__secondary"
                  href={satinAlma.makbuzPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.flow.downloadReceipt}
                </a>
              ) : oturumId && satinAlinan ? (
                <BelgeButonu
                  oturumId={oturumId}
                  bransNo={satinAlinan.bransNo}
                  teklifId={satinAlinan.teklifId}
                  sirketTeklifId={satinAlinan.teklif.Id}
                  tip="makbuz"
                  etiket={t.flow.downloadReceipt}
                />
              ) : null}
            </div>

            <div className="flow__actions">
              <Link to={href("home")} className="flow__ghost">
                {t.quote.homeBack}
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      {secilen && oturumId ? (
        <OdemeModali
          oturumId={oturumId}
          bransNo={secilen.bransNo}
          teklifId={secilen.teklifId}
          teklif={secilen.teklif}
          kimlikNo={kimlikNoOf(kimlik)}
          onTeklifIste={() => teklifIste(secilen.bransNo, secilen.teklif)}
          onKapat={() => setSecilen(null)}
          onBasarili={(sonuc) => {
            pollAbort.current?.abort();
            setSatinAlinan(secilen);
            setSecilen(null);
            setSatinAlma(sonuc);
            setAdim("sonuc");
          }}
        />
      ) : null}
    </div>
  );
}
