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
 */

import IlerlemePaneli from "./IlerlemePaneli";
import { TEKLIF_HAZIRLIK_MESAJLARI } from "./beklemeMetinleri";
import { fiyatGosterimi } from "./fiyatlandirma";
import { BRANS_ADLARI, type BransSonucu } from "./flowState";
import type { SirketTeklifi } from "../../lib/io/types";

const paraBirimi = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
});

function formatPrim(prim: number | undefined): string {
  if (typeof prim !== "number" || !Number.isFinite(prim)) return "—";
  return paraBirimi.format(prim);
}

/** En düşük primi bulur; kartlarda "en uygun" etiketi için. */
function enUygunId(sirketler: SirketTeklifi[]): number | null {
  let enIyi: SirketTeklifi | null = null;
  for (const sirket of sirketler) {
    if (typeof sirket.Prim !== "number" || sirket.Prim <= 0) continue;
    if (!enIyi || sirket.Prim < enIyi.Prim) enIyi = sirket;
  }
  return enIyi?.Id ?? null;
}

interface Props {
  sonuclar: BransSonucu[];
  onSatinAl: (bransNo: number, teklifId: number, teklif: SirketTeklifi) => void;
  onGeri: () => void;
}

export default function FiyatListesi({ sonuclar, onSatinAl, onGeri }: Props) {
  const hepsiTamam = sonuclar.every((sonuc) => sonuc.tamamlandi);
  const toplamTeklif = sonuclar.reduce(
    (toplam, sonuc) => toplam + sonuc.sirketler.length,
    0,
  );
  const toplamOtorizasyon = sonuclar.reduce(
    (toplam, sonuc) => toplam + sonuc.otorizasyonSayisi,
    0,
  );

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
        const sirali = [...sonuc.sirketler].sort((a, b) => {
          const aPrim = typeof a.Prim === "number" ? a.Prim : Infinity;
          const bPrim = typeof b.Prim === "number" ? b.Prim : Infinity;
          return aPrim - bPrim;
        });

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
                const gosterim = fiyatGosterimi(sirket.Prim);

                return (
                  <li
                    key={`${sirket.Id}-${sirket.TeklifNo}`}
                    className={`flow__teklif${sirket.Id === enUygun ? " flow__teklif--best" : ""}`}
                  >
                    <div className="flow__teklif-sirket">
                      <span className="flow__teklif-ad">{sirket.SirketAdi}</span>
                      {sirket.Id === enUygun ? (
                        <span className="flow__badge">En uygun</span>
                      ) : null}
                      {gosterim ? (
                        <span className="flow__badge flow__badge--indirim">
                          %{gosterim.yuzde} indirim
                        </span>
                      ) : null}
                    </div>
                    <div className="flow__teklif-detay">
                      {gosterim ? (
                        <span className="flow__teklif-liste">
                          {formatPrim(gosterim.listeFiyati)}
                        </span>
                      ) : null}
                      <span className="flow__teklif-prim">
                        {formatPrim(sirket.Prim)}
                      </span>
                      {gosterim ? (
                        <span className="flow__teklif-kazanc">
                          {formatPrim(gosterim.kazanc)} kazanç
                        </span>
                      ) : null}
                      {sirket.Taksit ? (
                        <span className="flow__teklif-taksit">
                          {sirket.Taksit}
                        </span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="flow__primary flow__primary--sm"
                      onClick={() =>
                        onSatinAl(sonuc.bransNo, sonuc.teklifId, sirket)
                      }
                    >
                      Satın al
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <div className="flow__actions">
        <button type="button" className="flow__ghost" onClick={onGeri}>
          Bilgileri düzenle
        </button>
      </div>
    </div>
  );
}
