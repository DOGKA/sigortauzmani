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
import { okuAdSoyad, okuAdresKodu, okuDogumTarihi } from "../../lib/io/okuma";
import QuoteKvkkNotu from "../../components/QuoteKvkkNotu";
import SaglikAcikRiza from "../../components/SaglikAcikRiza";
import { isSaglikUrunu } from "../../data/saglikRiza";
import {
  formatPhoneInput,
  isValidForeignId,
  isValidMobilePhone,
  isValidTckn,
  isValidVkn,
  kisiTipiCikar,
} from "../../utils/validation";
import { normalizeDigits } from "../../lib/i18n/format";
import { useT } from "../../lib/i18n/context";
import type { KimlikDurumu } from "./flowState";
import { kimlikNoOf } from "./flowState";

function kimlikGecerli(durum: KimlikDurumu): boolean {
  if (durum.entityType === "sahis") return isValidTckn(durum.tckn);
  if (durum.entityType === "yabanci") return isValidForeignId(durum.ykn);
  return isValidVkn(durum.vkn);
}

interface Props {
  productSlug: string;
  bransNo: number;
  durum: KimlikDurumu;
  onDegis: (patch: Partial<KimlikDurumu>) => void;
  onDevam: () => void;
}

export default function KimlikAdimi({
  productSlug,
  bransNo,
  durum,
  onDegis,
  onDevam,
}: Props) {
  const t = useT();
  const [hatalar, setHatalar] = useState<Record<string, string>>({});
  const [sorguluyor, setSorguluyor] = useState(false);
  const [uyari, setUyari] = useState("");
  const sadeceTckn = productSlug === "kisa-sureli-trafik";

  const dogrula = () => {
    const next: Record<string, string> = {};
    if (sadeceTckn ? !isValidTckn(durum.tckn) : !kimlikGecerli(durum)) {
      // Alan tek olduğu için eksik girişte hangi numaranın beklendiği
      // söylenmeli; tip yalnızca girilen değerden çıkarılabiliyor.
      next.kimlik =
        sadeceTckn
          ? t.quote.shortTermTcknError
          : durum.entityType === "sirket"
          ? t.quote.vknError
          : durum.entityType === "yabanci"
            ? t.quote.yknError
            : t.quote.tcknError;
    }
    if (!isValidMobilePhone(durum.phone)) {
      next.phone = t.quote.phoneError;
    }
    // Şirketlerde alan zaten gizli; zorunlu tutmak görünmeyen bir hataya
    // yol açardı. Şahıslarda ise her zaman isteniyor: MERNİS kapalı olduğu
    // için doğum tarihini başka hiçbir kaynaktan alamıyoruz ve teklif
    // gövdesi bu alanı taşıyor.
    if (durum.entityType !== "sirket" && !durum.birthDate) {
      next.birthDate = t.quote.birthError;
    }
    // Rıza vermemek akışı durdurmuyor; yalnızca seçimin yapılmış olması
    // isteniyor ki sessiz bir varsayılan rıza sayılmasın.
    if (isSaglikUrunu(productSlug) && !durum.saglikRiza) {
      next.saglikRiza = t.quote.consentError;
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

      setUyari(t.quote.notFoundRecord);
    } catch (error) {
      setUyari(
        `${
          error instanceof IoError ? error.message : t.quote.verifyFailed
        } ${t.quote.stillContinue}`,
      );
      onDegis({ mernisTamam: false });
    } finally {
      setSorguluyor(false);
    }
  };

  const kimlikDegeri = sadeceTckn ? durum.tckn : kimlikNoOf(durum);

  const kimlikYaz = (value: string) => {
    const kimlikNo = normalizeDigits(value).replace(/\D/g, "").slice(0, 11);
    // Kısa süreli trafik TRAMER'i VKN + doğum tarihini kabul etmiyor;
    // araçla ilişkili gerçek kişinin TCKN + doğum tarihini doğruluyor.
    // Yazım sırasında 10 hanede değeri VKN alanına taşımamak için tipi
    // bu üründe baştan sona `sahis` tutuyoruz.
    const tip = sadeceTckn ? "sahis" : kisiTipiCikar(kimlikNo);
    onDegis({
      entityType: tip,
      tckn: tip === "sahis" ? kimlikNo : "",
      ykn: tip === "yabanci" ? kimlikNo : "",
      vkn: tip === "sirket" ? kimlikNo : "",
      // Numara değişti; önceki sorgunun sonucu artık bu kişiye ait değil.
      adSoyad: "",
      mernisTamam: false,
      sigortaliStr: "",
      adresKodu: "",
    });
  };

  // Kısa süreli trafikte VKN kabul edilmediği için doğum tarihi her zaman
  // gösterilir. Diğer ürünlerde şirket akışı eskisi gibi devam eder.
  const dogumTarihiGoster = sadeceTckn || durum.entityType !== "sirket";

  return (
    <div className="flow__card">
      <h2 className="flow__card-title">{t.quote.identity}</h2>
      <p className="flow__card-sub">{t.quote.identityLead}</p>

      <div className="flow__grid">
        <label className="flow__field">
          <span className="flow__label">
            {sadeceTckn ? t.quote.shortTermTcknLabel : t.quote.kimlikLabel}
          </span>
          <input
            className={`flow__input${hatalar.kimlik ? " flow__input--error" : ""}`}
            inputMode="numeric"
            autoComplete="off"
            maxLength={11}
            value={kimlikDegeri}
            onChange={(event) => kimlikYaz(event.target.value)}
          />
          <span className="flow__hint">
            {sadeceTckn ? t.quote.shortTermTcknHint : t.quote.kimlikHint}
          </span>
          {hatalar.kimlik ? (
            <span className="flow__error">{hatalar.kimlik}</span>
          ) : null}
        </label>

        <label className="flow__field">
          <span className="flow__label">{t.quote.phone}</span>
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
            <span className="flow__label">{t.quote.birthDate}</span>
            <input
              type="date"
              className={`flow__input${hatalar.birthDate ? " flow__input--error" : ""}`}
              value={durum.birthDate}
              onChange={(event) => onDegis({ birthDate: event.target.value })}
            />
            {hatalar.birthDate ? (
              <span className="flow__error">{hatalar.birthDate}</span>
            ) : null}
          </label>
        ) : null}
      </div>

      <QuoteKvkkNotu productSlug={productSlug} />

      {isSaglikUrunu(productSlug) ? (
        <SaglikAcikRiza
          deger={durum.saglikRiza}
          onDegis={(deger) => {
            onDegis({ saglikRiza: deger });
            setHatalar((onceki) => {
              if (!onceki.saglikRiza) return onceki;
              const kalan = { ...onceki };
              delete kalan.saglikRiza;
              return kalan;
            });
          }}
          hata={Boolean(hatalar.saglikRiza)}
        />
      ) : null}

      {uyari ? <p className="flow__warning">{uyari}</p> : null}

      <div className="flow__actions">
        {uyari ? (
          <button type="button" className="flow__ghost" onClick={onDevam}>
            {t.quote.continueAnyway}
          </button>
        ) : null}
        <button
          type="button"
          className="flow__primary"
          onClick={devamEt}
          disabled={sorguluyor}
        >
          {sorguluyor
            ? t.quote.loading
            : uyari
              ? t.quote.retry
              : t.quote.continueEt}
        </button>
      </div>
    </div>
  );
}
