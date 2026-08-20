/**
 * Adım 2 — Araç bilgileri (Trafik, Kasko, İMM ortak).
 *
 * CRM dökümanındaki iki yol: "Plaka Var" seçilirse plaka + belge seri no
 * girilir ve TRAMER sorgusu araç bilgisini getirir; "Plakam Yok" (YK)
 * seçilirse araç bilgileri elle girilir.
 *
 * Ürün farkları: Kasko meslek ve yakıt tipi ister, İMM teminat bedeli
 * ister, Trafik ise aynı araç için Kasko teklifi de sorar.
 */

import { useEffect, useState } from "react";
import {
  IoError,
  getIller,
  getMarkaTipleri,
  getMarkalar,
  getMeslekler,
  sorguTramer,
} from "../../lib/io/client";
import {
  IMM_BEDELLERI,
  KULLANIM_TARZLARI,
  MANEVI_TAZMINATLAR,
  YAKIT_TIPLERI,
  kullanimSekilleri,
  modelYillari,
  normalizeIlKodu,
} from "../../lib/io/constants";
import type { Il, Marka, MarkaTipi, Meslek } from "../../lib/io/types";
import {
  isValidChassisNo,
  isValidDocumentSerial,
  isValidPlate,
  normalizeMobilePhone,
} from "../../utils/validation";
import { okuAdSoyad } from "../../lib/io/okuma";
import { kimlikNoOf, type AracDurumu, type KimlikDurumu, type UrunGereksinimi } from "./flowState";

interface Props {
  gereksinim: UrunGereksinimi;
  kimlik: KimlikDurumu;
  durum: AracDurumu;
  onDegis: (patch: Partial<AracDurumu>) => void;
  meslekKodu: string;
  onMeslekDegis: (kod: string) => void;
  immBedel: string;
  manevi: string;
  onImmDegis: (patch: { immBedel?: string; manevi?: string }) => void;
  kaskoDa: boolean;
  onKaskoDaDegis: (deger: boolean) => void;
  onGeri: () => void;
  onTeklifCalis: () => void;
  calisiyor: boolean;
  hata: string;
}

export default function AracAdimi({
  gereksinim,
  kimlik,
  durum,
  onDegis,
  meslekKodu,
  onMeslekDegis,
  immBedel,
  manevi,
  onImmDegis,
  kaskoDa,
  onKaskoDaDegis,
  onGeri,
  onTeklifCalis,
  calisiyor,
  hata,
}: Props) {
  const [hatalar, setHatalar] = useState<Record<string, string>>({});
  const [iller, setIller] = useState<Il[]>([]);
  const [markalar, setMarkalar] = useState<Marka[]>([]);
  const [tipler, setTipler] = useState<MarkaTipi[]>([]);
  const [meslekler, setMeslekler] = useState<Meslek[]>([]);
  const [tramerDurumu, setTramerDurumu] = useState<
    "bekliyor" | "sorguluyor" | "geldi" | "gelmedi"
  >("bekliyor");
  const [tramerNotu, setTramerNotu] = useState("");

  // Meslek listesi kaskoda zorunlu; diğer branşlarda hiç istenmiyor.
  useEffect(() => {
    if (!gereksinim.meslekGerekli) return;
    let iptal = false;
    getMeslekler()
      .then((liste) => {
        if (!iptal) setMeslekler(liste);
      })
      .catch(() => undefined);
    return () => {
      iptal = true;
    };
  }, [gereksinim.meslekGerekli]);

  // YK akışına geçildiğinde il ve marka listeleri gerekiyor.
  useEffect(() => {
    if (durum.plakaVar) return;
    let iptal = false;
    Promise.all([getIller(), getMarkalar()])
      .then(([illerListesi, markaListesi]) => {
        if (iptal) return;
        setIller(illerListesi);
        setMarkalar(markaListesi);
      })
      .catch(() => undefined);
    return () => {
      iptal = true;
    };
  }, [durum.plakaVar]);

  // Marka veya model yılı değişince tip listesi yenilenir.
  useEffect(() => {
    if (durum.plakaVar || !durum.markaKodu) {
      setTipler([]);
      return;
    }
    let iptal = false;
    getMarkaTipleri(durum.markaKodu, durum.modelYili)
      .then((liste) => {
        if (!iptal) setTipler(liste);
      })
      .catch(() => {
        if (!iptal) setTipler([]);
      });
    return () => {
      iptal = true;
    };
  }, [durum.plakaVar, durum.markaKodu, durum.modelYili]);

  const plakaliSorgula = async () => {
    const next: Record<string, string> = {};
    if (!isValidPlate(durum.plaka)) {
      next.plaka = "Geçerli bir plaka girin (örn. 34ABC123).";
    }
    if (!isValidDocumentSerial(durum.tescilBelge)) {
      next.tescilBelge = "Belge seri no 2 harf + 6 hane olmalı (örn. AB123456).";
    }
    setHatalar(next);
    if (Object.keys(next).length) return;

    setTramerDurumu("sorguluyor");
    setTramerNotu("");
    try {
      const yanit = await sorguTramer({
        BransNo: gereksinim.bransNo,
        SigortaEttirenAyniMi: true,
        Sigortali: {
          KimlikNo: kimlikNoOf(kimlik),
          Dogumtarihi: kimlik.birthDate,
          Cep: normalizeMobilePhone(kimlik.phone),
        },
        Arac: {
          Plaka: durum.plaka.replace(/\s/g, "").toUpperCase(),
          TescilBelge: durum.tescilBelge.replace(/\s/g, "").toUpperCase(),
        },
      });
      setTramerDurumu("geldi");
      // TRAMER, sorguladığımız kimliğin değil ruhsat sahibinin adını
      // döndürüyor: farklı kişilerle denendiğinde yanıt plakanın sahibini
      // veriyor. Bu yüzden "sigortalı" olarak değil araç sahibi olarak
      // gösteriliyor; kullanıcı yanlış plaka girdiyse buradan görüyor.
      onDegis({ tramerTamam: true, aracSahibi: okuAdSoyad(yanit) });
    } catch (error) {
      // Dokümantasyon HataKodu 14/17'de araç bilgisinin gelmediğini ve
      // YK gibi elle girişe düşülmesi gerektiğini söylüyor.
      setTramerDurumu("gelmedi");
      setTramerNotu(
        error instanceof IoError
          ? error.message
          : "Araç bilgileri getirilemedi.",
      );
      onDegis({ tramerTamam: false, aracSahibi: "" });
    }
  };

  const ykDogrula = () => {
    const next: Record<string, string> = {};
    if (!durum.ilKodu) next.ilKodu = "İl seçin.";
    if (!durum.modelYili) next.modelYili = "Model yılı seçin.";
    if (!durum.markaKodu) next.markaKodu = "Marka seçin.";
    if (!durum.tipKodu) next.tipKodu = "Model seçin.";
    if (!durum.kullanimSekli) next.kullanimSekli = "Kullanım şekli seçin.";
    if (!durum.motorNo.trim()) next.motorNo = "Motor numarası girin.";
    if (!isValidChassisNo(durum.sasiNo)) {
      next.sasiNo = "Şasi numarası 17 karakter olmalı.";
    }
    if (gereksinim.yakitGerekli && !durum.yakitTipi) {
      next.yakitTipi = "Yakıt tipi seçin.";
    }
    setHatalar(next);
    return Object.keys(next).length === 0;
  };

  const teklifCalis = () => {
    const next: Record<string, string> = {};
    if (gereksinim.meslekGerekli && !meslekKodu) {
      next.meslek = "Meslek seçin.";
    }
    if (durum.plakaVar) {
      if (!isValidPlate(durum.plaka)) {
        next.plaka = "Geçerli bir plaka girin.";
      }
      if (!isValidDocumentSerial(durum.tescilBelge)) {
        next.tescilBelge = "Belge seri no 2 harf + 6 hane olmalı.";
      }
      // TRAMER araç bilgisini getirememişse marka/model elle seçilmeli.
      if (tramerDurumu === "gelmedi" && (!durum.markaKodu || !durum.tipKodu)) {
        next.markaKodu = "Araç bilgisi gelmedi, marka ve modeli seçin.";
      }
      setHatalar(next);
      if (Object.keys(next).length) return;
    } else {
      if (!ykDogrula()) return;
      if (Object.keys(next).length) {
        setHatalar(next);
        return;
      }
    }
    onTeklifCalis();
  };

  const plakaModuDegis = (plakaVar: boolean) => {
    if (plakaVar === durum.plakaVar) return;
    onDegis({
      plakaVar,
      plaka: "",
      tescilBelge: "",
      markaKodu: "",
      tipKodu: "",
      motorNo: "",
      sasiNo: "",
      tramerTamam: false,
    });
    setHatalar({});
    setTramerDurumu("bekliyor");
    setTramerNotu("");
  };

  const sekiller = kullanimSekilleri(durum.kullanimTarzi);

  return (
    <div className="flow__card">
      <h2 className="flow__card-title">Araç bilgileri</h2>
      {kimlik.adSoyad ? (
        <p className="flow__card-sub">
          Sigortalı: <strong>{kimlik.adSoyad}</strong>
        </p>
      ) : null}

      {gereksinim.meslekGerekli ? (
        <label className="flow__field flow__field--full">
          <span className="flow__label">Meslek</span>
          <select
            className={`flow__input${hatalar.meslek ? " flow__input--error" : ""}`}
            value={meslekKodu}
            onChange={(event) => onMeslekDegis(event.target.value)}
          >
            <option value="">Seçin</option>
            {meslekler.map((meslek) => (
              <option key={meslek.Kodu} value={meslek.Kodu}>
                {meslek.Adi}
              </option>
            ))}
          </select>
          <span className="flow__hint">
            Bazı şirketler meslek grubuna göre indirim uyguluyor.
          </span>
          {hatalar.meslek ? (
            <span className="flow__error">{hatalar.meslek}</span>
          ) : null}
        </label>
      ) : null}

      <div className="flow__toggle" role="group" aria-label="Araç durumu">
        <button
          type="button"
          className={`flow__toggle-btn${durum.plakaVar ? " flow__toggle-btn--active" : ""}`}
          onClick={() => plakaModuDegis(true)}
        >
          Plakam var
        </button>
        <button
          type="button"
          className={`flow__toggle-btn${!durum.plakaVar ? " flow__toggle-btn--active" : ""}`}
          onClick={() => plakaModuDegis(false)}
        >
          Plakam henüz çıkmadı
        </button>
      </div>

      {durum.plakaVar ? (
        <>
          <div className="flow__grid">
            <label className="flow__field">
              <span className="flow__label">Plaka</span>
              <input
                className={`flow__input${hatalar.plaka ? " flow__input--error" : ""}`}
                placeholder="34ABC123"
                autoComplete="off"
                value={durum.plaka}
                onChange={(event) =>
                  onDegis({ plaka: event.target.value.toUpperCase() })
                }
              />
              {hatalar.plaka ? (
                <span className="flow__error">{hatalar.plaka}</span>
              ) : null}
            </label>

            <label className="flow__field">
              <span className="flow__label">Belge seri no</span>
              <input
                className={`flow__input${hatalar.tescilBelge ? " flow__input--error" : ""}`}
                placeholder="AB123456"
                autoComplete="off"
                maxLength={8}
                value={durum.tescilBelge}
                onChange={(event) =>
                  onDegis({ tescilBelge: event.target.value.toUpperCase() })
                }
              />
              <span className="flow__hint">Ruhsatın sağ üst köşesinde yer alır.</span>
              {hatalar.tescilBelge ? (
                <span className="flow__error">{hatalar.tescilBelge}</span>
              ) : null}
            </label>
          </div>

          <div className="flow__inline-actions">
            <button
              type="button"
              className="flow__secondary"
              onClick={plakaliSorgula}
              disabled={tramerDurumu === "sorguluyor"}
            >
              {tramerDurumu === "sorguluyor"
                ? "Araç sorgulanıyor…"
                : "Araç bilgilerini getir"}
            </button>
            {tramerDurumu === "geldi" ? (
              <span className="flow__ok">
                {durum.aracSahibi
                  ? `Araç bilgileri alındı. Ruhsat sahibi: ${durum.aracSahibi}`
                  : "Araç bilgileri alındı."}
              </span>
            ) : null}
          </div>

          {tramerDurumu === "gelmedi" ? (
            <>
              <p className="flow__warning">
                {tramerNotu} Marka ve modeli aşağıdan seçerek devam edebilirsiniz.
              </p>
              <MarkaModelSecici
                markalar={markalar}
                tipler={tipler}
                markaKodu={durum.markaKodu}
                tipKodu={durum.tipKodu}
                modelYili={durum.modelYili}
                hatalar={hatalar}
                onDegis={onDegis}
              />
            </>
          ) : null}
        </>
      ) : (
        <>
          <div className="flow__grid">
            <label className="flow__field">
              <span className="flow__label">Plaka ili</span>
              <select
                className={`flow__input${hatalar.ilKodu ? " flow__input--error" : ""}`}
                value={durum.ilKodu}
                onChange={(event) =>
                  onDegis({ ilKodu: normalizeIlKodu(event.target.value) })
                }
              >
                <option value="">Seçin</option>
                {iller.map((il) => (
                  <option key={il.IlKodu} value={normalizeIlKodu(il.IlKodu)}>
                    {normalizeIlKodu(il.IlKodu)} — {il.IlAdi}
                  </option>
                ))}
              </select>
              {hatalar.ilKodu ? (
                <span className="flow__error">{hatalar.ilKodu}</span>
              ) : null}
            </label>

            <label className="flow__field">
              <span className="flow__label">Kullanım tarzı</span>
              <select
                className="flow__input"
                value={durum.kullanimTarzi}
                onChange={(event) =>
                  onDegis({
                    kullanimTarzi: event.target.value,
                    kullanimSekli: "",
                    kisiSayisi: "",
                  })
                }
              >
                {KULLANIM_TARZLARI.map((secenek) => (
                  <option key={secenek.value} value={secenek.value}>
                    {secenek.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flow__field">
              <span className="flow__label">Kullanım şekli</span>
              <select
                className={`flow__input${hatalar.kullanimSekli ? " flow__input--error" : ""}`}
                value={durum.kullanimSekli}
                onChange={(event) => {
                  const secilen = sekiller.find(
                    (sekil) => sekil.value === event.target.value,
                  );
                  onDegis({
                    kullanimSekli: event.target.value,
                    kisiSayisi: secilen ? String(secilen.kisiSayisi) : "",
                  });
                }}
              >
                <option value="">Seçin</option>
                {sekiller.map((sekil) => (
                  <option key={`${sekil.value}-${sekil.label}`} value={sekil.value}>
                    {sekil.label}
                  </option>
                ))}
              </select>
              {hatalar.kullanimSekli ? (
                <span className="flow__error">{hatalar.kullanimSekli}</span>
              ) : null}
            </label>

            {gereksinim.yakitGerekli ? (
              <label className="flow__field">
                <span className="flow__label">Yakıt tipi</span>
                <select
                  className={`flow__input${hatalar.yakitTipi ? " flow__input--error" : ""}`}
                  value={durum.yakitTipi}
                  onChange={(event) => onDegis({ yakitTipi: event.target.value })}
                >
                  <option value="">Seçin</option>
                  {YAKIT_TIPLERI.map((secenek) => (
                    <option key={secenek.value} value={secenek.value}>
                      {secenek.label}
                    </option>
                  ))}
                </select>
                {hatalar.yakitTipi ? (
                  <span className="flow__error">{hatalar.yakitTipi}</span>
                ) : null}
              </label>
            ) : null}
          </div>

          <MarkaModelSecici
            markalar={markalar}
            tipler={tipler}
            markaKodu={durum.markaKodu}
            tipKodu={durum.tipKodu}
            modelYili={durum.modelYili}
            hatalar={hatalar}
            onDegis={onDegis}
            yeniKayit
          />

          <div className="flow__grid">
            <label className="flow__field">
              <span className="flow__label">Motor numarası</span>
              <input
                className={`flow__input${hatalar.motorNo ? " flow__input--error" : ""}`}
                autoComplete="off"
                value={durum.motorNo}
                onChange={(event) =>
                  onDegis({ motorNo: event.target.value.toUpperCase() })
                }
              />
              {hatalar.motorNo ? (
                <span className="flow__error">{hatalar.motorNo}</span>
              ) : null}
            </label>

            <label className="flow__field">
              <span className="flow__label">Şasi numarası</span>
              <input
                className={`flow__input${hatalar.sasiNo ? " flow__input--error" : ""}`}
                autoComplete="off"
                maxLength={17}
                value={durum.sasiNo}
                onChange={(event) =>
                  onDegis({ sasiNo: event.target.value.toUpperCase() })
                }
              />
              {hatalar.sasiNo ? (
                <span className="flow__error">{hatalar.sasiNo}</span>
              ) : null}
            </label>
          </div>
        </>
      )}

      {gereksinim.immGerekli ? (
        <div className="flow__grid">
          <label className="flow__field">
            <span className="flow__label">İMM teminat bedeli</span>
            <select
              className="flow__input"
              value={immBedel}
              onChange={(event) => onImmDegis({ immBedel: event.target.value })}
            >
              {IMM_BEDELLERI.map((secenek) => (
                <option key={secenek.value} value={secenek.value}>
                  {secenek.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flow__field">
            <span className="flow__label">Manevi tazminat</span>
            <select
              className="flow__input"
              value={manevi}
              onChange={(event) => onImmDegis({ manevi: event.target.value })}
            >
              {MANEVI_TAZMINATLAR.map((secenek) => (
                <option key={secenek.value} value={secenek.value}>
                  {secenek.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {gereksinim.bransNo === 0 ? (
        <label className="flow__check">
          <input
            type="checkbox"
            checked={kaskoDa}
            onChange={(event) => onKaskoDaDegis(event.target.checked)}
          />
          <span>
            Aynı araç için <strong>Kasko</strong> teklifi de hazırlansın
          </span>
        </label>
      ) : null}

      {hata ? <p className="flow__warning">{hata}</p> : null}

      <div className="flow__actions">
        <button type="button" className="flow__ghost" onClick={onGeri}>
          Geri
        </button>
        <button
          type="button"
          className="flow__primary"
          onClick={teklifCalis}
          disabled={calisiyor}
        >
          {calisiyor ? "Teklifler çalışıyor…" : "Teklif çalış"}
        </button>
      </div>
    </div>
  );
}

interface SeciciProps {
  markalar: Marka[];
  tipler: MarkaTipi[];
  markaKodu: string;
  tipKodu: string;
  modelYili: string;
  hatalar: Record<string, string>;
  onDegis: (patch: Partial<AracDurumu>) => void;
  yeniKayit?: boolean;
}

/** Marka listesi statik değil; `/api/bb` ile geliyor ve AracKodu = marka + tip. */
function MarkaModelSecici({
  markalar,
  tipler,
  markaKodu,
  tipKodu,
  modelYili,
  hatalar,
  onDegis,
  yeniKayit = false,
}: SeciciProps) {
  return (
    <div className="flow__grid">
      <label className="flow__field">
        <span className="flow__label">Model yılı</span>
        <select
          className={`flow__input${hatalar.modelYili ? " flow__input--error" : ""}`}
          value={modelYili}
          onChange={(event) =>
            onDegis({ modelYili: event.target.value, tipKodu: "" })
          }
        >
          <option value="">Seçin</option>
          {modelYillari(yeniKayit).map((yil) => (
            <option key={yil} value={yil}>
              {yil}
            </option>
          ))}
        </select>
        {hatalar.modelYili ? (
          <span className="flow__error">{hatalar.modelYili}</span>
        ) : null}
      </label>

      <label className="flow__field">
        <span className="flow__label">Marka</span>
        <select
          className={`flow__input${hatalar.markaKodu ? " flow__input--error" : ""}`}
          value={markaKodu}
          onChange={(event) =>
            onDegis({ markaKodu: event.target.value, tipKodu: "" })
          }
        >
          <option value="">Seçin</option>
          {markalar.map((marka) => (
            <option key={marka.MarkaKodu} value={marka.MarkaKodu}>
              {marka.MarkaAdi}
            </option>
          ))}
        </select>
        {hatalar.markaKodu ? (
          <span className="flow__error">{hatalar.markaKodu}</span>
        ) : null}
      </label>

      <label className="flow__field">
        <span className="flow__label">Model</span>
        <select
          className={`flow__input${hatalar.tipKodu ? " flow__input--error" : ""}`}
          value={tipKodu}
          onChange={(event) => onDegis({ tipKodu: event.target.value })}
          disabled={!markaKodu}
        >
          <option value="">{markaKodu ? "Seçin" : "Önce marka seçin"}</option>
          {tipler.map((tip) => (
            <option key={tip.TipKodu} value={tip.TipKodu}>
              {tip.TipAdi}
            </option>
          ))}
        </select>
        {hatalar.tipKodu ? (
          <span className="flow__error">{hatalar.tipKodu}</span>
        ) : null}
      </label>
    </div>
  );
}
