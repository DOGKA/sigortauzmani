/**
 * Adım 2 — Seyahat Sağlık bilgileri.
 *
 * Dokümandaki kritik ayrım: `GidilenYer` tek bir alan ama anlamı kapsama
 * bağlı. Kapsam "Y" (yurt içi) ise il kodu, diğer kapsamlarda ülke kodu
 * bekleniyor. Bu yüzden kapsam değişince seçim sıfırlanıyor ve liste
 * kaynağı değişiyor.
 *
 * Ülke listesi de kapsama göre filtreleniyor: `/api/ulkeler` her ülkeye bir
 * `Kapsam` etiketi veriyor ("A" Schengen, "T" tüm dünya). Schengen poliçesi
 * Avrupa dışını kapsamadığı için "A" seçiliyken yalnızca "A" ülkeleri
 * listeleniyor; "T" seçiliyken tümü listelenebiliyor.
 */

import { useEffect, useState } from "react";
import { getIller, getUlkeler } from "../../lib/io/client";
import {
  SEYAHAT_KAPSAMLARI,
  SEYAHAT_PLANLARI,
  SEYAHAT_SEBEPLERI,
  normalizeIlKodu,
} from "../../lib/io/constants";
import type { Il, Ulke } from "../../lib/io/types";
import type { KimlikDurumu, SeyahatDurumu } from "./flowState";

function bugun(): string {
  return new Date().toISOString().slice(0, 10);
}

interface Props {
  kimlik: KimlikDurumu;
  durum: SeyahatDurumu;
  onDegis: (patch: Partial<SeyahatDurumu>) => void;
  onGeri: () => void;
  onTeklifCalis: () => void;
  calisiyor: boolean;
  hata: string;
}

export default function SeyahatAdimi({
  kimlik,
  durum,
  onDegis,
  onGeri,
  onTeklifCalis,
  calisiyor,
  hata,
}: Props) {
  const [hatalar, setHatalar] = useState<Record<string, string>>({});
  const [ulkeler, setUlkeler] = useState<Ulke[]>([]);
  const [iller, setIller] = useState<Il[]>([]);

  const yurtIci = durum.kapsam === "Y";

  const gosterilecekUlkeler =
    durum.kapsam === "A"
      ? ulkeler.filter((ulke) => ulke.Kapsam === "A")
      : ulkeler;

  useEffect(() => {
    let iptal = false;
    const yukle = yurtIci ? getIller() : getUlkeler();
    yukle
      .then((liste) => {
        if (iptal) return;
        if (yurtIci) setIller(liste as Il[]);
        else setUlkeler(liste as Ulke[]);
      })
      .catch(() => undefined);
    return () => {
      iptal = true;
    };
  }, [yurtIci]);

  const dogrula = () => {
    const next: Record<string, string> = {};
    if (!durum.gidilenYer) {
      next.gidilenYer = yurtIci ? "Gidilecek ili seçin." : "Gidilecek ülkeyi seçin.";
    }
    if (!durum.gidisTarihi) next.gidisTarihi = "Gidiş tarihini seçin.";
    if (!durum.donusTarihi) next.donusTarihi = "Dönüş tarihini seçin.";
    if (
      durum.gidisTarihi &&
      durum.donusTarihi &&
      durum.donusTarihi < durum.gidisTarihi
    ) {
      next.donusTarihi = "Dönüş tarihi gidiş tarihinden önce olamaz.";
    }
    if (durum.gidisTarihi && durum.gidisTarihi < bugun()) {
      next.gidisTarihi = "Gidiş tarihi bugünden önce olamaz.";
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
      <h2 className="flow__card-title">Seyahat bilgileri</h2>
      {kimlik.adSoyad ? (
        <p className="flow__card-sub">
          Sigortalı: <strong>{kimlik.adSoyad}</strong>
        </p>
      ) : null}

      <div className="flow__grid">
        <label className="flow__field">
          <span className="flow__label">Seyahat bölgesi</span>
          <select
            className="flow__input"
            value={durum.kapsam}
            onChange={(event) =>
              // Kapsam değişince GidilenYer'in anlamı değiştiği için sıfırlanır.
              onDegis({ kapsam: event.target.value, gidilenYer: "" })
            }
          >
            {SEYAHAT_KAPSAMLARI.map((secenek) => (
              <option key={secenek.value} value={secenek.value}>
                {secenek.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flow__field">
          <span className="flow__label">
            {yurtIci ? "Gidilecek il" : "Gidilecek ülke"}
          </span>
          <select
            className={`flow__input${hatalar.gidilenYer ? " flow__input--error" : ""}`}
            value={durum.gidilenYer}
            onChange={(event) => onDegis({ gidilenYer: event.target.value })}
          >
            <option value="">Seçin</option>
            {yurtIci
              ? iller.map((il) => (
                  <option key={il.IlKodu} value={normalizeIlKodu(il.IlKodu)}>
                    {il.IlAdi}
                  </option>
                ))
              : gosterilecekUlkeler.map((ulke) => (
                  <option key={ulke.UlkeKodu} value={ulke.UlkeKodu}>
                    {ulke.UlkeAdi}
                  </option>
                ))}
          </select>
          {hatalar.gidilenYer ? (
            <span className="flow__error">{hatalar.gidilenYer}</span>
          ) : null}
        </label>

        <label className="flow__field">
          <span className="flow__label">Plan</span>
          <select
            className="flow__input"
            value={durum.planSecimi}
            onChange={(event) => onDegis({ planSecimi: event.target.value })}
          >
            {SEYAHAT_PLANLARI.map((secenek) => (
              <option key={secenek.value} value={secenek.value}>
                {secenek.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flow__field">
          <span className="flow__label">Seyahat sebebi</span>
          <select
            className="flow__input"
            value={durum.seyahatSebebi}
            onChange={(event) => onDegis({ seyahatSebebi: event.target.value })}
          >
            {SEYAHAT_SEBEPLERI.map((secenek) => (
              <option key={secenek.value} value={secenek.value}>
                {secenek.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flow__field">
          <span className="flow__label">Gidiş tarihi</span>
          <input
            type="date"
            className={`flow__input${hatalar.gidisTarihi ? " flow__input--error" : ""}`}
            min={bugun()}
            value={durum.gidisTarihi}
            onChange={(event) => onDegis({ gidisTarihi: event.target.value })}
          />
          {hatalar.gidisTarihi ? (
            <span className="flow__error">{hatalar.gidisTarihi}</span>
          ) : null}
        </label>

        <label className="flow__field">
          <span className="flow__label">Dönüş tarihi</span>
          <input
            type="date"
            className={`flow__input${hatalar.donusTarihi ? " flow__input--error" : ""}`}
            min={durum.gidisTarihi || bugun()}
            value={durum.donusTarihi}
            onChange={(event) => onDegis({ donusTarihi: event.target.value })}
          />
          {hatalar.donusTarihi ? (
            <span className="flow__error">{hatalar.donusTarihi}</span>
          ) : null}
        </label>
      </div>

      {hata ? <p className="flow__warning">{hata}</p> : null}

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
