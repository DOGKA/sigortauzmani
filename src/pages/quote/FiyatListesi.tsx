/**
 * Adım 3 — Şirket fiyatları.
 *
 * Primler asenkron geliyor; `TeklifCalisildi` true olana kadar liste akmaya
 * devam ediyor. Bu yüzden "hepsi geldi" beklenmiyor, gelen her sonuç anında
 * gösteriliyor ve hâlâ bekleniyorsa üstte bir durum satırı kalıyor.
 *
 * Otorizasyona düşen teklifler sunucuda eleniyor (`api/io/primler.ts`), bu
 * listeye hiç gelmiyor. Sayısı taşınıyor ki müşteri eksik şirketleri merak
 * etmesin.
 *
 * Gösterilen tutar sigorta şirketinden gelen primin kendisidir; üzerine
 * hesaplanmış referans fiyat, indirim veya kazanç eklenmez.
 */

import { useState } from "react";
import BelgeButonu from "./BelgeButonu";
import BilgiNotu from "./BilgiNotu";
import IlerlemePaneli from "./IlerlemePaneli";
import { TEKLIF_HAZIRLIK_MESAJLARI } from "./beklemeMetinleri";
import { BRANS_ADLARI, type BransSonucu } from "./flowState";
import { formatPrim } from "./paraBirimi";
import { satinAlinabilirSirket } from "../../lib/io/satinAlFiltre";
import type { SirketTeklifi } from "../../lib/io/types";

const ZAMAN_BICIMI = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function teklifAnahtari(bransNo: number, sirket: SirketTeklifi): string {
  return `${bransNo}-${sirket.Id}-${sirket.TeklifNo}`;
}

/** Teklifin alındığı an; `alindiAt` istemcide işaretleniyor. */
function teklifZamani(sirket: SirketTeklifi): string | null {
  if (typeof sirket.alindiAt !== "string") return null;
  const tarih = new Date(sirket.alindiAt);
  return Number.isNaN(tarih.getTime()) ? null : ZAMAN_BICIMI.format(tarih);
}

/** En düşük primli teklif; kartlarda "en uygun" etiketi için. */
function enUygunId(sirketler: SirketTeklifi[]): number | null {
  let enIyi: SirketTeklifi | null = null;
  for (const sirket of sirketler) {
    if (!enIyi || sirket.Prim < enIyi.Prim) enIyi = sirket;
  }
  return enIyi?.Id ?? null;
}

interface Props {
  sonuclar: BransSonucu[];
  /** Teklif PDF'i oturuma karşı doğrulandığı için gerekli; yoksa gizlenir. */
  oturumId: string | null;
  /** Kısa süreli trafikte anında satın alınabilir şirket listesi farklı. */
  kisaSureli: boolean;
  onSatinAl: (bransNo: number, teklifId: number, teklif: SirketTeklifi) => void;
  onTeklifIste: (
    bransNo: number,
    teklif: SirketTeklifi,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  onGeri: () => void;
}

export default function FiyatListesi({
  sonuclar,
  oturumId,
  kisaSureli,
  onSatinAl,
  onTeklifIste,
  onGeri,
}: Props) {
  const [gonderiliyor, setGonderiliyor] = useState<string | null>(null);
  const [hatalar, setHatalar] = useState<Record<string, string>>({});

  const hepsiTamam = sonuclar.every((sonuc) => sonuc.tamamlandi);
  const toplamTeklif = sonuclar.reduce(
    (toplam, sonuc) => toplam + sonuc.sirketler.length,
    0,
  );
  const toplamOtorizasyon = sonuclar.reduce(
    (toplam, sonuc) => toplam + sonuc.otorizasyonSayisi,
    0,
  );

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

  return (
    <div className="flow__card flow__card--wide">
      <h2 className="flow__card-title">Teklifler</h2>

      {!hepsiTamam ? (
        <IlerlemePaneli
          baslik="Teklifleriniz hazırlanıyor"
          mesajlar={TEKLIF_HAZIRLIK_MESAJLARI}
          not="Teklifler geldikçe aşağıdaki listeye eklenir. Bu işlem genellikle bir dakikadan kısa sürer; sayfada kalmanız yeterli."
        />
      ) : null}

      {hepsiTamam && toplamTeklif === 0 ? (
        <div className="flow__empty">
          <p>
            Şu anda bu bilgilerle anında satın alınabilir teklif çıkmadı.
            Ekibimiz sizin için manuel olarak çalışabilir.
          </p>
        </div>
      ) : null}

      {hepsiTamam && toplamOtorizasyon > 0 ? (
        <p className="flow__hint">
          {toplamOtorizasyon} şirket fiyatı için sigorta şirketinin ayrıca onayı
          gerekiyor, bu yüzden burada listelenmiyor. Bu teklifleri isterseniz
          ekibimiz sizin için takip edebilir.
        </p>
      ) : null}

      {sonuclar.map((sonuc) => {
        const enUygun = enUygunId(sonuc.sirketler);
        const sirali = [...sonuc.sirketler].sort((a, b) => a.Prim - b.Prim);

        return (
          <section key={sonuc.bransNo} className="flow__brans">
            {sonuclar.length > 1 ? (
              <h3 className="flow__brans-title">
                {BRANS_ADLARI[sonuc.bransNo] ?? `Branş ${sonuc.bransNo}`}
              </h3>
            ) : null}

            {sirali.length === 0 && sonuc.tamamlandi ? (
              <p className="flow__hint">Bu üründe teklif gelmedi.</p>
            ) : null}

            <ul className="flow__teklifler">
              {sirali.map((sirket) => {
                const satinAl = satinAlinabilirSirket(
                  sonuc.bransNo,
                  sirket.SirketKodu,
                  kisaSureli,
                );
                const anahtar = teklifAnahtari(sonuc.bransNo, sirket);
                const bekliyor = gonderiliyor === anahtar;
                const zaman = teklifZamani(sirket);

                return (
                  <li
                    key={anahtar}
                    className={`flow__teklif${sirket.Id === enUygun ? " flow__teklif--best" : ""}`}
                  >
                    <div className="flow__teklif-sirket">
                      <span className="flow__teklif-ad">{sirket.SirketAdi}</span>
                      {sirket.Id === enUygun ? (
                        <span className="flow__badge">En uygun</span>
                      ) : null}
                      {oturumId ? (
                        <BelgeButonu
                          key={anahtar}
                          oturumId={oturumId}
                          bransNo={sonuc.bransNo}
                          teklifId={sonuc.teklifId}
                          sirketTeklifId={sirket.Id}
                          tip="teklif"
                          etiket="Teklif PDF'i"
                          gorunum="ikon"
                        />
                      ) : null}
                    </div>
                    <div className="flow__teklif-detay">
                      <span className="flow__teklif-odenecek">
                        <strong className="flow__teklif-prim">
                          {formatPrim(sirket.Prim, sonuc.bransNo)}
                        </strong>
                        {sirket.Taksit ? (
                          <span className="flow__teklif-taksit">
                            {sirket.Taksit}
                          </span>
                        ) : null}
                      </span>
                      {zaman ? (
                        <span className="flow__teklif-zaman">
                          Teklif zamanı: {zaman}
                        </span>
                      ) : null}
                    </div>
                    {satinAl ? (
                      <button
                        type="button"
                        className="flow__primary flow__primary--sm"
                        onClick={() =>
                          onSatinAl(sonuc.bransNo, sonuc.teklifId, sirket)
                        }
                      >
                        Satın al
                      </button>
                    ) : (
                      <div className="flow__teklif-aksiyon">
                        <button
                          type="button"
                          className="flow__primary flow__primary--sm"
                          disabled={bekliyor || Boolean(gonderiliyor)}
                          onClick={() => void teklifIste(sonuc.bransNo, sirket)}
                        >
                          {bekliyor ? "Gönderiliyor…" : "Teklif iste"}
                        </button>
                        {hatalar[anahtar] ? (
                          <span className="flow__teklif-hata">
                            {hatalar[anahtar]}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {toplamTeklif > 0 ? (
        <BilgiNotu>
          Listelenen tutarlar sigorta şirketlerinden gelen tekliflerdir ve
          poliçe değildir. Sigorta şirketi, poliçeleştirme sırasında yaptığı
          son kontrole göre teklifi güncelleyebilir veya kabul etmeyebilir.
        </BilgiNotu>
      ) : null}

      <div className="flow__actions">
        <button type="button" className="flow__ghost" onClick={onGeri}>
          Bilgileri düzenle
        </button>
      </div>
    </div>
  );
}
