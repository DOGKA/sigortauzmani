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
import { Link, useParams } from "react-router-dom";
import { getProduct } from "../data/products";
import { IoError, primleriBekle, teklifOlustur } from "../lib/io/client";
import type { SatinAlmaSonuc, SirketTeklifi, TeklifPayload } from "../lib/io/types";
import { ROBOTS_NOINDEX, pageOgImageUrl } from "../lib/seo/config";
import { ROUTES } from "../lib/seo/routes";
import { useSeo } from "../lib/seo/useSeo";
import AracAdimi from "./quote/AracAdimi";
import DaskAdimi from "./quote/DaskAdimi";
import FiyatListesi from "./quote/FiyatListesi";
import KimlikAdimi from "./quote/KimlikAdimi";
import OdemeModali from "./quote/OdemeModali";
import SeyahatAdimi from "./quote/SeyahatAdimi";
import {
  aracTeklifPayload,
  daskTeklifPayload,
  seyahatTeklifPayload,
} from "./quote/buildPayload";
import {
  bosArac,
  bosDask,
  bosKimlik,
  bosSeyahat,
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

const ADIM_ETIKETLERI: Record<Adim, string> = {
  kimlik: "Kimlik",
  detay: "Detaylar",
  fiyatlar: "Teklifler",
  sonuc: "Poliçe",
};

const ADIM_SIRASI: Adim[] = ["kimlik", "detay", "fiyatlar", "sonuc"];

interface SecilenTeklif {
  bransNo: number;
  teklifId: number;
  teklif: SirketTeklifi;
}

export default function QuoteFlowPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProduct(slug) : undefined;
  const gereksinim = slug ? urunGereksinimi(slug) : null;

  const [adim, setAdim] = useState<Adim>("kimlik");
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

  const pollAbort = useRef<AbortController | null>(null);
  // En az bir fiyat geldiyse polling hatası akışı bozmamalı; kullanıcı
  // eldeki tekliflerle devam edebilir.
  const fiyatGeldi = useRef(false);

  const productPath = product ? ROUTES.quote(product.slug) : "/";

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
          title: "Ürün bulunamadı",
          description: "",
          path: "/",
          robots: ROBOTS_NOINDEX,
        },
  );

  useEffect(() => {
    return () => pollAbort.current?.abort();
  }, []);

  const bransSonucGuncelle = useCallback(
    (
      bransNo: number,
      sirketler: SirketTeklifi[],
      tamamlandi: boolean,
      otorizasyonSayisi: number,
    ) => {
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
            harita.set(`${yeni.Id}-${yeni.TeklifNo}`, yeni);
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
          };
        }),
      );
    },
    [],
  );

  const teklifCalis = async () => {
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
    if (gereksinim.bransNo === 0 && kaskoDa) {
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
      });

      setOturumId(sonuc.oturumId);
      setOturumNo(sonuc.oturumNo);
      setSonuclar(
        sonuc.teklifler.map((teklif) => ({
          bransNo: teklif.bransNo,
          teklifId: teklif.teklifId,
          sirketler: [],
          tamamlandi: false,
          otorizasyonSayisi: 0,
        })),
      );
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
            (sirketler, tamamlandi, otorizasyonSayisi) =>
              bransSonucGuncelle(
                teklif.bransNo,
                sirketler,
                tamamlandi,
                otorizasyonSayisi,
              ),
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

  if (!product || !gereksinim) {
    return (
      <div className="flow flow--empty">
        <h1>Ürün bulunamadı</h1>
        <Link to="/" className="flow__primary">
          Anasayfaya dön
        </Link>
      </div>
    );
  }

  const aktifIndex = ADIM_SIRASI.indexOf(adim);

  return (
    <div className="flow">
      <div className="flow__inner">
        <nav className="flow__breadcrumb" aria-label="Sayfa yolu">
          <Link to="/">Ana Sayfa</Link>
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
                <span className="flow__step-label">{ADIM_ETIKETLERI[deger]}</span>
              </li>
            ))}
          </ol>
        ) : (
          <div className="flow__card">
            <h2 className="flow__card-title">
              Şu anda anında teklif alınamıyor
            </h2>
            <p className="flow__card-sub">{geriDonus}</p>
            <p className="flow__fallback-text">
              Bilgilerinizi bırakırsanız uzmanlarımız sizin için teklifleri
              hazırlayıp en kısa sürede arar. Girdiğiniz bilgiler kaybolmadı,
              formda yeniden girmeniz gerekecek.
            </p>
            <div className="flow__actions">
              <Link to="/" className="flow__ghost">
                Ana sayfaya dön
              </Link>
              <Link
                to={`${productPath}?form=manuel`}
                className="flow__primary"
              >
                Teklif formuna geç
              </Link>
            </div>
          </div>
        )}

        {!geriDonus && adim === "kimlik" ? (
          <KimlikAdimi
            bransNo={gereksinim.bransNo}
            durum={kimlik}
            dogumZorunlu={gereksinim.adimTipi !== "arac"}
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
            kimlik={kimlik}
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
            kimlik={kimlik}
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
            onSatinAl={(bransNo, teklifId, teklif) =>
              setSecilen({ bransNo, teklifId, teklif })
            }
            onGeri={() => {
              pollAbort.current?.abort();
              setAdim("detay");
            }}
          />
        ) : null}

        {!geriDonus && adim === "sonuc" && satinAlma ? (
          <div className="flow__card">
            <h2 className="flow__card-title">Poliçeniz hazır</h2>
            <p className="flow__card-sub">
              Ödemeniz alındı ve poliçeniz düzenlendi.
            </p>

            <dl className="flow__ozet">
              {satinAlma.policeNo ? (
                <>
                  <dt>Poliçe numarası</dt>
                  <dd>{satinAlma.policeNo}</dd>
                </>
              ) : null}
              {oturumNo ? (
                <>
                  <dt>İşlem numarası</dt>
                  <dd>{oturumNo}</dd>
                </>
              ) : null}
              <dt>Ödenen kart</dt>
              <dd>**** {satinAlma.kartSon4}</dd>
            </dl>

            <div className="flow__inline-actions">
              {satinAlma.policePdfUrl ? (
                <a
                  className="flow__secondary"
                  href={satinAlma.policePdfUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Poliçeyi indir
                </a>
              ) : null}
              {satinAlma.makbuzPdfUrl ? (
                <a
                  className="flow__secondary"
                  href={satinAlma.makbuzPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Makbuzu indir
                </a>
              ) : null}
            </div>

            <div className="flow__actions">
              <Link to="/" className="flow__ghost">
                Ana sayfaya dön
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
          onKapat={() => setSecilen(null)}
          onBasarili={(sonuc) => {
            pollAbort.current?.abort();
            setSecilen(null);
            setSatinAlma(sonuc);
            setAdim("sonuc");
          }}
        />
      ) : null}
    </div>
  );
}
