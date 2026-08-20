/**
 * Adım 1 — Kimlik ve MERNİS.
 *
 * MERNİS sorgusu şu anda kapalı (`IO_MERNIS_ENABLED`), çünkü sorgulanan
 * kişinin telefonuna onay kodu SMS'i yolluyor ve bu istemciden kapatılamıyor.
 * Kapalıyken proxy `atlandi` döndürüyor; adım kullanıcının girdiği bilgilerle
 * sessizce devam ediyor. Bu yüzden doğum tarihi artık zorunlu — sorgu açıkken
 * bile yanıt gerçek doğum tarihini vermiyordu.
 *
 * Aşağıdaki okuma mantığı sorgu geri açıldığında geçerli olacak.
 *
 * Yanıttaki `isMernis` başarı bayrağı DEĞİL: canlı sorgularda kaydı olmayan
 * kimliklerde `true`, kaydı bulunanlarda `false` dönüyor. Anlaşılan "MERNİS'e
 * gitmek gerekiyor mu" sorusunu yanıtlıyor. Bu yüzden başarı, dönen verinin
 * kendisinden okunuyor: kayıt bulunduğunda maskeli ad soyad ve UAVT adres
 * kodu geliyor, bulunmadığında tüm alanlar null kalıyor.
 *
 * Ad soyad yalnızca maskeli geliyor ("DO*** AK***"); açık ad ancak SMS onayı
 * ile açılıyor. Kullanıcıya doğrulama olarak bu maskeli hâli gösteriyoruz,
 * sigorta şirketine kimlik `SigortaliStr` ile taşınıyor.
 *
 * Sorgu tutmasa da akış durmuyor; teklif araç bilgisiyle de çalışabiliyor
 * ve kimliği sigorta şirketi ayrıca doğruluyor.
 */

import { useState } from "react";
import { IoError, sorguMernis } from "../../lib/io/client";
import {
  formatPhoneInput,
  isValidForeignId,
  isValidMobilePhone,
  isValidTckn,
  isValidVkn,
  normalizeMobilePhone,
} from "../../utils/validation";
import type { KimlikDurumu, KisiTipi } from "./flowState";
import { kimlikNoOf } from "./flowState";

const TIP_ETIKETLERI: Record<KisiTipi, string> = {
  sahis: "T.C. vatandaşı",
  yabanci: "Yabancı uyruklu",
  sirket: "Şirket",
};

const ALAN_ETIKETLERI: Record<KisiTipi, string> = {
  sahis: "T.C. Kimlik Numarası",
  yabanci: "Yabancı Kimlik Numarası",
  sirket: "Vergi Kimlik Numarası",
};

/**
 * MERNİS yanıtındaki ad soyad alan adı yanıta göre değişebiliyor. Açık ad
 * (`Adi` + `Soyadi`) SMS onayı olmadan gelmediği için maskeli alanlara da
 * düşülüyor; kullanıcı kendini maskeli hâlden de tanıyabiliyor.
 */
function okuAdSoyad(payload: Record<string, unknown>): string {
  const sigortali = payload.Sigortali;
  const kaynak =
    sigortali && typeof sigortali === "object"
      ? (sigortali as Record<string, unknown>)
      : payload;

  const metin = (deger: unknown): string =>
    typeof deger === "string" ? deger.replace(/\s+/g, " ").trim() : "";

  const acik = [metin(kaynak.Adi ?? kaynak.Ad), metin(kaynak.Soyadi ?? kaynak.Soyad)]
    .filter(Boolean)
    .join(" ");
  if (acik) return acik;

  for (const anahtar of ["AdUnvan", "AdSoyad", "Unvan", "AdUnvanYildizli"]) {
    const deger = metin(kaynak[anahtar]);
    if (deger) return deger;
  }
  return "";
}

/**
 * MERNİS doğum tarihini geri döndürüyorsa yakalar. Seyahat ve DASK
 * gövdeleri `DogumTarihi` istiyor ama kullanıcı sorgu tuttuğunda bu alanı
 * hiç doldurmuyor; yanıtta varsa buradan besliyoruz. Alan adı ve biçim
 * dokümante edilmediği için birkaç olasılık deneniyor.
 *
 * Alan çoğu zaman gerçek tarihi taşımıyor: gönderdiğimiz değer yankılanıyor,
 * göndermediğimizde de .NET varsayılanı `0001-01-01` dönüyor. Bu yüzden
 * yalnızca makul bir doğum yılı kabul ediliyor; aksi hâlde kullanıcının
 * doğum tarihi alanına çöp bir değer yazılırdı.
 */
function okuDogumTarihi(payload: Record<string, unknown>): string {
  const sigortali = payload.Sigortali;
  const kaynak =
    sigortali && typeof sigortali === "object"
      ? (sigortali as Record<string, unknown>)
      : payload;

  const buYil = new Date().getFullYear();
  const makul = (yil: string): boolean => {
    const sayi = Number(yil);
    return sayi >= 1900 && sayi <= buYil;
  };

  for (const anahtar of ["DogumTarihi", "Dogumtarihi", "DogumTarih"]) {
    const deger = kaynak[anahtar];
    if (typeof deger !== "string" || !deger.trim()) continue;

    // "1970-12-24" ya da "1970-12-24T00:00:00" → tarih kısmı yeter.
    const iso = deger.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso && makul(iso[1])) return `${iso[1]}-${iso[2]}-${iso[3]}`;

    // "24.12.1970" biçimi.
    const noktali = deger.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (noktali && makul(noktali[3])) {
      return `${noktali[3]}-${noktali[2]}-${noktali[1]}`;
    }
  }
  return "";
}

/**
 * MERNİS kayıtlı adresin UAVT kodunu döndürüyorsa yakalar; DASK adımında
 * kullanıcı kodu elle aramak zorunda kalmasın. Alan adı dokümante edilmediği
 * için birkaç olasılık deneniyor ve yalnızca 10 haneli değerler kabul
 * ediliyor — UAVT kodu on hane, hiyerarşideki diğer kodlar daha kısa.
 */
function okuAdresKodu(payload: Record<string, unknown>): string {
  const sigortali = payload.Sigortali;
  const kaynaklar = [
    payload,
    sigortali && typeof sigortali === "object"
      ? (sigortali as Record<string, unknown>)
      : null,
  ];

  for (const kaynak of kaynaklar) {
    if (!kaynak) continue;
    for (const anahtar of ["AdresKodu", "AdresNo", "UavtKodu", "UAVT"]) {
      const deger = kaynak[anahtar];
      if (deger === null || deger === undefined) continue;
      const rakamlar = String(deger).replace(/\D/g, "");
      if (rakamlar.length === 10) return rakamlar;
    }
  }
  return "";
}

function kimlikGecerli(durum: KimlikDurumu): boolean {
  if (durum.entityType === "sahis") return isValidTckn(durum.tckn);
  if (durum.entityType === "yabanci") return isValidForeignId(durum.ykn);
  return isValidVkn(durum.vkn);
}

interface Props {
  bransNo: number;
  durum: KimlikDurumu;
  /**
   * Doğum tarihi her branşta zorunlu; bu bayrak yalnızca ipucu metnini
   * değiştiriyor. Seyahatte prim doğrudan yaşa bağlı olduğu için kullanıcıya
   * bunun neden istendiği söyleniyor.
   */
  dogumZorunlu?: boolean;
  onDegis: (patch: Partial<KimlikDurumu>) => void;
  onDevam: () => void;
}

export default function KimlikAdimi({
  bransNo,
  durum,
  dogumZorunlu = false,
  onDegis,
  onDevam,
}: Props) {
  const [hatalar, setHatalar] = useState<Record<string, string>>({});
  const [sorguluyor, setSorguluyor] = useState(false);
  const [uyari, setUyari] = useState("");

  const dogrula = () => {
    const next: Record<string, string> = {};
    if (!kimlikGecerli(durum)) {
      next.kimlik =
        durum.entityType === "sirket"
          ? "Geçerli bir Vergi Kimlik Numarası girin (10 hane)."
          : durum.entityType === "yabanci"
            ? "Yabancı Kimlik Numarası 99 ile başlayan 11 hane olmalı."
            : "Geçerli bir T.C. Kimlik Numarası girin (11 hane).";
    }
    if (!isValidMobilePhone(durum.phone)) {
      next.phone = "Geçerli bir cep telefonu girin (05XX XXX XX XX).";
    }
    // Şirketlerde alan zaten gizli; zorunlu tutmak görünmeyen bir hataya
    // yol açardı. Şahıslarda ise her zaman isteniyor: MERNİS kapalı olduğu
    // için doğum tarihini başka hiçbir kaynaktan alamıyoruz ve teklif
    // gövdesi bu alanı taşıyor.
    if (durum.entityType !== "sirket" && !durum.birthDate) {
      next.birthDate = "Doğum tarihinizi girin.";
    }
    setHatalar(next);
    return Object.keys(next).length === 0;
  };

  const devamEt = async () => {
    if (!dogrula()) return;
    setUyari("");
    setSorguluyor(true);

    try {
      const yanit = await sorguMernis({
        BransNo: bransNo,
        Sigortali: {
          KimlikNo: kimlikNoOf(durum),
          // Boş doğum tarihi göndermiyoruz; MERNİS gerekiyorsa geri istiyor.
          ...(durum.birthDate ? { DogumTarihi: durum.birthDate } : {}),
          Cep: normalizeMobilePhone(durum.phone),
        },
      });

      // Sorgu kapalıysa (müşteriye SMS kodu gönderdiği için) doğrulama adımı
      // yok sayılıp kullanıcının girdiği bilgilerle devam ediliyor.
      if (yanit.atlandi === true) {
        onDegis({ mernisTamam: false });
        onDevam();
        return;
      }

      // Başarısız sorgu da HTTP 200 ve HataKodu'suz dönüyor, `isMernis` ise
      // ters yönde çalışıyor. Bu yüzden kaydın bulunup bulunmadığı dönen
      // verinin doluluğundan anlaşılıyor.
      const adSoyad = okuAdSoyad(yanit);
      const adresKodu = okuAdresKodu(yanit);
      const dogrulandi = Boolean(adSoyad || adresKodu);
      const yanittakiDogum = okuDogumTarihi(yanit);
      onDegis({
        adSoyad,
        mernisTamam: dogrulandi,
        adresKodu,
        sigortaliStr:
          typeof yanit.SigortaliStr === "string" ? yanit.SigortaliStr : "",
        // Kullanıcının girdiği değer varsa ona dokunulmuyor.
        ...(!durum.birthDate && yanittakiDogum
          ? { birthDate: yanittakiDogum }
          : {}),
      });

      if (dogrulandi) {
        onDevam();
        return;
      }

      setUyari(
        "Kaydınız bulunamadı. Kimlik numaranızı kontrol edin veya bilgilerinizi kendiniz girerek devam edin.",
      );
    } catch (error) {
      setUyari(
        `${
          error instanceof IoError
            ? error.message
            : "Kimlik bilgileri doğrulanamadı."
        } Yine de devam edebilirsiniz.`,
      );
      onDegis({ mernisTamam: false });
    } finally {
      setSorguluyor(false);
    }
  };

  const kisiTipiDegis = (tip: KisiTipi) => {
    if (tip === durum.entityType) return;
    onDegis({
      entityType: tip,
      tckn: "",
      ykn: "",
      vkn: "",
      adSoyad: "",
      mernisTamam: false,
      sigortaliStr: "",
      adresKodu: "",
    });
    setHatalar({});
    setUyari("");
  };

  const kimlikDegeri =
    durum.entityType === "sahis"
      ? durum.tckn
      : durum.entityType === "yabanci"
        ? durum.ykn
        : durum.vkn;

  const kimlikYaz = (value: string) => {
    if (durum.entityType === "sahis") onDegis({ tckn: value });
    else if (durum.entityType === "yabanci") onDegis({ ykn: value });
    else onDegis({ vkn: value });
  };

  // Şirketlerde doğum tarihi hiç sorulmuyor.
  const dogumTarihiGoster = durum.entityType !== "sirket";

  return (
    <div className="flow__card">
      <h2 className="flow__card-title">Kimlik bilgileri</h2>
      <p className="flow__card-sub">
        Bilgileriniz sigorta şirketlerinden fiyat almak için kullanılır.
      </p>

      <div className="flow__toggle" role="group" aria-label="Kişi tipi">
        {(Object.keys(TIP_ETIKETLERI) as KisiTipi[]).map((tip) => (
          <button
            key={tip}
            type="button"
            className={`flow__toggle-btn${durum.entityType === tip ? " flow__toggle-btn--active" : ""}`}
            onClick={() => kisiTipiDegis(tip)}
          >
            {TIP_ETIKETLERI[tip]}
          </button>
        ))}
      </div>

      <div className="flow__grid">
        <label className="flow__field">
          <span className="flow__label">{ALAN_ETIKETLERI[durum.entityType]}</span>
          <input
            className={`flow__input${hatalar.kimlik ? " flow__input--error" : ""}`}
            inputMode="numeric"
            autoComplete="off"
            maxLength={durum.entityType === "sirket" ? 10 : 11}
            value={kimlikDegeri}
            onChange={(event) =>
              kimlikYaz(event.target.value.replace(/\D/g, ""))
            }
          />
          {hatalar.kimlik ? (
            <span className="flow__error">{hatalar.kimlik}</span>
          ) : null}
        </label>

        <label className="flow__field">
          <span className="flow__label">Cep telefonu</span>
          <input
            className={`flow__input${hatalar.phone ? " flow__input--error" : ""}`}
            inputMode="tel"
            autoComplete="tel"
            placeholder="05XX XXX XX XX"
            value={durum.phone}
            onChange={(event) =>
              onDegis({ phone: formatPhoneInput(event.target.value) })
            }
          />
          {hatalar.phone ? (
            <span className="flow__error">{hatalar.phone}</span>
          ) : null}
        </label>

        {dogumTarihiGoster ? (
          <label className="flow__field">
            <span className="flow__label">Doğum tarihi</span>
            <input
              type="date"
              className={`flow__input${hatalar.birthDate ? " flow__input--error" : ""}`}
              value={durum.birthDate}
              onChange={(event) => onDegis({ birthDate: event.target.value })}
            />
            {hatalar.birthDate ? (
              <span className="flow__error">{hatalar.birthDate}</span>
            ) : (
              <span className="flow__hint">
                {dogumZorunlu
                  ? "Primin hesaplanması için gerekli."
                  : "Sigorta şirketleri teklif için istiyor."}
              </span>
            )}
          </label>
        ) : null}
      </div>

      {uyari ? <p className="flow__warning">{uyari}</p> : null}

      <div className="flow__actions">
        {uyari ? (
          <button type="button" className="flow__ghost" onClick={onDevam}>
            Yine de devam et
          </button>
        ) : null}
        <button
          type="button"
          className="flow__primary"
          onClick={devamEt}
          disabled={sorguluyor}
        >
          {sorguluyor
            ? "Bilgiler getiriliyor…"
            : uyari
              ? "Tekrar dene"
              : "Devam et"}
        </button>
      </div>
    </div>
  );
}
