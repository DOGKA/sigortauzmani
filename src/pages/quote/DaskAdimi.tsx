/**
 * Adım 2 — DASK bina bilgileri.
 *
 * DASK primini belirleyen asıl girdi UAVT adres kodu, çünkü deprem bölgesi
 * ondan çözülüyor. CRM akışındaki gibi kod doğrudan girilebiliyor: MERNİS
 * kayıtlı adresin kodunu döndürüyorsa alan hazır geliyor, kullanıcı kodu
 * bilmiyorsa "Adres kodumu bilmiyorum" ile UAVT hiyerarşisinden buluyor.
 *
 * `PolicemYok` ayrımı dokümandaki iki örneğe karşılık geliyor, ancak canlı
 * denemeler dökümanı yalanlıyor: yenilemede yalnızca poliçe numarası
 * göndermek teklifi oluşturmuyor, IO "Aradığınız kriterlere uygun kayıt
 * bulunamadı" diyor. Teklifi asıl süren girdi her iki durumda da adres ve
 * bina bilgileri; poliçe numarası yalnızca yenileme kaydını bağlıyor. Bu
 * yüzden iki yolda da aynı bilgiler isteniyor, yenilemede poliçe numarası
 * ek olarak soruluyor.
 */

import { useState } from "react";
import {
  BINA_HASAR_DURUMLARI,
  DASK_BINADAKI_KONUMLAR,
  DASK_KULLANIM_SEKILLERI,
  SIGORTA_ETTIREN_SIFATLARI,
  TOPLAM_KAT_SAYILARI,
  YAPI_TARZLARI,
  insaaYillari,
} from "../../lib/io/constants";
import AdresSecici from "./AdresSecici";
import IlerlemePaneli from "./IlerlemePaneli";
import { TEKLIF_HAZIRLIK_MESAJLARI } from "./beklemeMetinleri";
import type { DaskDurumu } from "./flowState";

interface Props {
  durum: DaskDurumu;
  onDegis: (patch: Partial<DaskDurumu>) => void;
  onGeri: () => void;
  onTeklifCalis: () => void;
  calisiyor: boolean;
  hata: string;
}

export default function DaskAdimi({
  durum,
  onDegis,
  onGeri,
  onTeklifCalis,
  calisiyor,
  hata,
}: Props) {
  const [hatalar, setHatalar] = useState<Record<string, string>>({});

  const dogrula = () => {
    const next: Record<string, string> = {};

    if (!durum.policemYok && !durum.daskPoliceNo.trim()) {
      next.daskPoliceNo = "Mevcut DASK poliçe numaranızı girin.";
    }

    if (!/^\d{10}$/.test(durum.adresKodu)) {
      next.adres = durum.adresKoduBilinmiyor
        ? "Adresinizi daire seviyesine kadar seçin."
        : "UAVT adres kodu 10 haneli olmalı. Bilmiyorsanız aşağıdan bulabilirsiniz.";
    }
    if (!durum.sigortaEttirenSifati) next.sifat = "Sigorta ettiren sıfatını seçin.";
    if (!durum.yapiTarzi) next.yapiTarzi = "Yapı tarzını seçin.";
    if (!durum.insaaYili) next.insaaYili = "İnşa yılını seçin.";
    if (!durum.toplamKatSayisi) next.katSayisi = "Toplam kat aralığını seçin.";
    if (!durum.kullanimSekli) next.kullanimSekli = "Kullanım şeklini seçin.";
    if (!durum.binaHasarDurumu) next.hasar = "Hasar durumunu seçin.";
    if (!durum.binadakiKonumu) next.konum = "Bulunduğu katı seçin.";

    const m2 = Number(durum.brutM2);
    if (!durum.brutM2.trim() || !Number.isFinite(m2) || m2 <= 0) {
      next.brutM2 = "Brüt metrekareyi girin.";
    } else if (m2 > 2000) {
      next.brutM2 = "Brüt metrekare çok yüksek görünüyor, kontrol edin.";
    }

    setHatalar(next);
    return Object.keys(next).length === 0;
  };

  const devamEt = () => {
    if (!dogrula()) return;
    onTeklifCalis();
  };

  return (
    <div className="flow__card">
      <h2 className="flow__card-title">Bina bilgileri</h2>

      <div className="flow__toggle" role="group" aria-label="DASK poliçe durumu">
        <button
          type="button"
          className={`flow__toggle-btn${durum.policemYok ? " flow__toggle-btn--active" : ""}`}
          onClick={() => onDegis({ policemYok: true })}
        >
          İlk kez yaptıracağım
        </button>
        <button
          type="button"
          className={`flow__toggle-btn${!durum.policemYok ? " flow__toggle-btn--active" : ""}`}
          onClick={() => onDegis({ policemYok: false })}
        >
          Mevcut poliçemi yenileyeceğim
        </button>
      </div>

      {!durum.policemYok ? (
        <label className="flow__field flow__field--full">
          <span className="flow__label">Mevcut DASK poliçe numarası</span>
          <input
            className={`flow__input${hatalar.daskPoliceNo ? " flow__input--error" : ""}`}
            inputMode="numeric"
            autoComplete="off"
            value={durum.daskPoliceNo}
            onChange={(event) =>
              onDegis({ daskPoliceNo: event.target.value.replace(/\s/g, "") })
            }
          />
          {hatalar.daskPoliceNo ? (
            <span className="flow__error">{hatalar.daskPoliceNo}</span>
          ) : (
            <span className="flow__hint">
              Mevcut DASK poliçenizin üzerinde yer alır. Yenileme teklifinin
              hazırlanabilmesi için numaranın eksiksiz girilmesi gerekir.
            </span>
          )}
        </label>
      ) : null}

      <h3 className="flow__brans-title">Adres</h3>

      <label className="flow__field flow__field--full">
        <span className="flow__label">UAVT adres kodu</span>
        <input
          className={`flow__input${hatalar.adres ? " flow__input--error" : ""}`}
          inputMode="numeric"
          autoComplete="off"
          maxLength={10}
          value={durum.adresKodu}
          onChange={(event) =>
            onDegis({
              adresKodu: event.target.value.replace(/\D/g, ""),
              // Elle yazılan kod seçicinin bulduğu özeti geçersiz kılar.
              adresOzeti: "",
            })
          }
          disabled={durum.adresKoduBilinmiyor}
        />
        {hatalar.adres ? (
          <span className="flow__error">{hatalar.adres}</span>
        ) : (
          <span className="flow__hint">
            Elektrik veya su faturanızda, tapunuzda ya da e-Devlet adres
            bilgilerinizde yer alır.
          </span>
        )}
      </label>

      <label className="flow__check">
        <input
          type="checkbox"
          checked={durum.adresKoduBilinmiyor}
          onChange={(event) =>
            onDegis({
              adresKoduBilinmiyor: event.target.checked,
              // Yönteme geçilirken önceki değer taşınmıyor ki hangi
              // adresin seçildiği belirsiz kalmasın.
              adresKodu: "",
              adresOzeti: "",
            })
          }
        />
        Adres kodumu bilmiyorum, adresimden bulmak istiyorum
      </label>

      {durum.adresKoduBilinmiyor ? (
        <>
          <AdresSecici
            onSecim={(adresKodu, ozet) => onDegis({ adresKodu, adresOzeti: ozet })}
          />
          {durum.adresOzeti ? (
            <p className="flow__ok">
              {durum.adresOzeti} — UAVT: {durum.adresKodu}
            </p>
          ) : null}
        </>
      ) : null}

      <h3 className="flow__brans-title">Yapı bilgileri</h3>
      <div className="flow__grid">
        <label className="flow__field">
          <span className="flow__label">Sigorta ettiren sıfatı</span>
          <select
            className={`flow__input${hatalar.sifat ? " flow__input--error" : ""}`}
            value={durum.sigortaEttirenSifati}
            onChange={(event) =>
              onDegis({ sigortaEttirenSifati: event.target.value })
            }
          >
            <option value="">Seçin</option>
            {SIGORTA_ETTIREN_SIFATLARI.map((secenek) => (
              <option key={secenek.value} value={secenek.value}>
                {secenek.label}
              </option>
            ))}
          </select>
          {hatalar.sifat ? (
            <span className="flow__error">{hatalar.sifat}</span>
          ) : null}
        </label>

        <label className="flow__field">
          <span className="flow__label">Yapı tarzı</span>
          <select
            className={`flow__input${hatalar.yapiTarzi ? " flow__input--error" : ""}`}
            value={durum.yapiTarzi}
            onChange={(event) => onDegis({ yapiTarzi: event.target.value })}
          >
            <option value="">Seçin</option>
            {YAPI_TARZLARI.map((secenek) => (
              <option key={secenek.value} value={secenek.value}>
                {secenek.label}
              </option>
            ))}
          </select>
          {hatalar.yapiTarzi ? (
            <span className="flow__error">{hatalar.yapiTarzi}</span>
          ) : null}
        </label>

        <label className="flow__field">
          <span className="flow__label">İnşa yılı</span>
          <select
            className={`flow__input${hatalar.insaaYili ? " flow__input--error" : ""}`}
            value={durum.insaaYili}
            onChange={(event) => onDegis({ insaaYili: event.target.value })}
          >
            <option value="">Seçin</option>
            {insaaYillari().map((yil) => (
              <option key={yil} value={yil}>
                {yil}
              </option>
            ))}
          </select>
          {hatalar.insaaYili ? (
            <span className="flow__error">{hatalar.insaaYili}</span>
          ) : null}
        </label>

        <label className="flow__field">
          <span className="flow__label">Binadaki toplam kat sayısı</span>
          <select
            className={`flow__input${hatalar.katSayisi ? " flow__input--error" : ""}`}
            value={durum.toplamKatSayisi}
            onChange={(event) => onDegis({ toplamKatSayisi: event.target.value })}
          >
            <option value="">Seçin</option>
            {TOPLAM_KAT_SAYILARI.map((secenek) => (
              <option key={secenek.value} value={secenek.value}>
                {secenek.label}
              </option>
            ))}
          </select>
          {hatalar.katSayisi ? (
            <span className="flow__error">{hatalar.katSayisi}</span>
          ) : null}
        </label>

        <label className="flow__field">
          <span className="flow__label">Dairenin bulunduğu kat</span>
          <select
            className={`flow__input${hatalar.konum ? " flow__input--error" : ""}`}
            value={durum.binadakiKonumu}
            onChange={(event) => onDegis({ binadakiKonumu: event.target.value })}
          >
            <option value="">Seçin</option>
            {DASK_BINADAKI_KONUMLAR.map((secenek) => (
              <option key={secenek.value} value={secenek.value}>
                {secenek.label}
              </option>
            ))}
          </select>
          {hatalar.konum ? (
            <span className="flow__error">{hatalar.konum}</span>
          ) : null}
        </label>

        <label className="flow__field">
          <span className="flow__label">Kullanım şekli</span>
          <select
            className={`flow__input${hatalar.kullanimSekli ? " flow__input--error" : ""}`}
            value={durum.kullanimSekli}
            onChange={(event) => onDegis({ kullanimSekli: event.target.value })}
          >
            <option value="">Seçin</option>
            {DASK_KULLANIM_SEKILLERI.map((secenek) => (
              <option key={secenek.value} value={secenek.value}>
                {secenek.label}
              </option>
            ))}
          </select>
          {hatalar.kullanimSekli ? (
            <span className="flow__error">{hatalar.kullanimSekli}</span>
          ) : null}
        </label>

        <label className="flow__field">
          <span className="flow__label">Bina hasar durumu</span>
          <select
            className={`flow__input${hatalar.hasar ? " flow__input--error" : ""}`}
            value={durum.binaHasarDurumu}
            onChange={(event) => onDegis({ binaHasarDurumu: event.target.value })}
          >
            <option value="">Seçin</option>
            {BINA_HASAR_DURUMLARI.map((secenek) => (
              <option key={secenek.value} value={secenek.value}>
                {secenek.label}
              </option>
            ))}
          </select>
          {hatalar.hasar ? (
            <span className="flow__error">{hatalar.hasar}</span>
          ) : null}
        </label>

        <label className="flow__field">
          <span className="flow__label">Brüt metrekare</span>
          <input
            className={`flow__input${hatalar.brutM2 ? " flow__input--error" : ""}`}
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={durum.brutM2}
            onChange={(event) =>
              onDegis({ brutM2: event.target.value.replace(/\D/g, "") })
            }
          />
          {hatalar.brutM2 ? (
            <span className="flow__error">{hatalar.brutM2}</span>
          ) : null}
        </label>
      </div>

      {hata ? <p className="flow__warning">{hata}</p> : null}

      {calisiyor ? (
        <IlerlemePaneli
          baslik="Teklifleriniz hazırlanıyor"
          mesajlar={TEKLIF_HAZIRLIK_MESAJLARI}
          tahminiSaniye={20}
        />
      ) : null}

      <div className="flow__actions">
        <button type="button" className="flow__ghost" onClick={onGeri}>
          Geri
        </button>
        <button
          type="button"
          className="flow__primary"
          onClick={devamEt}
          disabled={calisiyor}
        >
          {calisiyor ? "Teklifler çalışıyor…" : "Teklif çalış"}
        </button>
      </div>
    </div>
  );
}
