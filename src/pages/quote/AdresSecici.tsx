/**
 * UAVT adres seçici (DASK için).
 *
 * Akış dokümandaki sırayı izliyor: İl → İlçe → Semt → Mahalle → Cadde →
 * Bina → Daire. Her seviye bir öncekinin `Kod` değeriyle sorgulanıyor.
 *
 * Sonuçta DASK'a gönderilen değer daire kaydındaki `AdresNo` (10 haneli
 * UAVT kodu), `Kod` değil — `Kod` sekiz haneli bir iç kimlik ve DASK onu
 * kabul etmiyor. Bina ve daire seviyelerinde `Adi` null geldiği için etiket
 * blok/kapı numaralarından kuruluyor.
 */

import { useEffect, useState } from "react";
import { getAdresKayitlari, getIller } from "../../lib/io/client";
import { normalizeIlKodu } from "../../lib/io/constants";
import type { AdresKaydi, AdresSeviyesi, Il } from "../../lib/io/types";

/** Seviye sırası; her adım öncekinin kodunu girdi alır. */
const SEVIYELER: { st: AdresSeviyesi; label: string }[] = [
  { st: "Ilce", label: "İlçe" },
  { st: "Semt", label: "Semt / Bucak" },
  { st: "Mahalle", label: "Mahalle / Köy" },
  { st: "Cadde", label: "Cadde / Sokak" },
  { st: "Bina", label: "Bina" },
  { st: "Daire", label: "Daire" },
];

/** Bina ve dairede `Adi` boş; okunabilir etiketi parçalardan kurar. */
function kayitEtiketi(kayit: AdresKaydi, st: AdresSeviyesi): string {
  if (kayit.Adi && kayit.Adi.trim()) return kayit.Adi.trim();

  const parcalar: string[] = [];
  if (st === "Bina") {
    if (kayit.SiteAdi?.trim()) parcalar.push(kayit.SiteAdi.trim());
    if (kayit.BlokAdi?.trim()) parcalar.push(kayit.BlokAdi.trim());
    if (kayit.DisKapiNo?.trim()) parcalar.push(`No: ${kayit.DisKapiNo.trim()}`);
  } else if (st === "Daire") {
    if (kayit.IcKapiNo?.trim()) parcalar.push(`Daire: ${kayit.IcKapiNo.trim()}`);
  }

  if (parcalar.length) return parcalar.join(" ");
  // Hiçbir etiket parçası yoksa kullanıcı en azından bir şey görmeli.
  return kayit.Kod ? `Kod: ${kayit.Kod}` : "(isimsiz)";
}

interface Props {
  /** Seçim tamamlanınca UAVT adres kodu, iptal edilince boş string. */
  onSecim: (adresKodu: string, ozet: string) => void;
}

export default function AdresSecici({ onSecim }: Props) {
  const [iller, setIller] = useState<Il[]>([]);
  const [ilKodu, setIlKodu] = useState("");
  const [ilAdi, setIlAdi] = useState("");
  // Her seviye için yüklenen liste ve seçilen kayıt.
  const [listeler, setListeler] = useState<AdresKaydi[][]>([]);
  const [secimler, setSecimler] = useState<AdresKaydi[]>([]);
  const [yukleniyor, setYukleniyor] = useState<number | null>(null);
  const [sorunlu, setSorunlu] = useState("");

  useEffect(() => {
    let iptal = false;
    getIller()
      .then((liste) => {
        if (!iptal) setIller(liste);
      })
      .catch(() => undefined);
    return () => {
      iptal = true;
    };
  }, []);

  /** Verilen seviyeyi üst kodla yükler ve altındaki her şeyi sıfırlar. */
  const seviyeYukle = async (index: number, ustKod: string) => {
    setSorunlu("");
    setYukleniyor(index);
    setListeler((onceki) => onceki.slice(0, index));
    setSecimler((onceki) => onceki.slice(0, index));
    onSecim("", "");

    try {
      const kayitlar = await getAdresKayitlari(SEVIYELER[index].st, ustKod);
      setListeler((onceki) => {
        const next = onceki.slice(0, index);
        next[index] = kayitlar;
        return next;
      });
      if (!kayitlar.length) {
        setSorunlu(
          `${SEVIYELER[index].label} listesi boş döndü. Farklı bir seçim deneyin.`,
        );
      }
    } catch {
      setSorunlu(
        `${SEVIYELER[index].label} listesi alınamadı. Lütfen tekrar deneyin.`,
      );
    } finally {
      setYukleniyor(null);
    }
  };

  const ilSecildi = (kod: string) => {
    const secilen = iller.find((il) => normalizeIlKodu(il.IlKodu) === kod);
    setIlKodu(kod);
    setIlAdi(secilen?.IlAdi ?? "");
    setListeler([]);
    setSecimler([]);
    onSecim("", "");
    if (kod) void seviyeYukle(0, kod);
  };

  const seviyeSecildi = (index: number, kod: string) => {
    const kayit = listeler[index]?.find((k) => String(k.Kod) === kod);
    if (!kayit) return;

    const yeniSecimler = [...secimler.slice(0, index), kayit];
    setSecimler(yeniSecimler);

    const sonSeviye = index === SEVIYELER.length - 1;
    if (!sonSeviye) {
      void seviyeYukle(index + 1, String(kayit.Kod));
      return;
    }

    // Daire seçildi: DASK'ın istediği kod `AdresNo`.
    const adresKodu = kayit.AdresNo?.trim() ?? "";
    if (!adresKodu) {
      setSorunlu(
        "Bu daire için UAVT adres kodu bulunamadı. Farklı bir daire seçin.",
      );
      onSecim("", "");
      return;
    }
    const ozet = [
      ilAdi,
      ...yeniSecimler.map((k, i) => kayitEtiketi(k, SEVIYELER[i].st)),
    ]
      .filter(Boolean)
      .join(" / ");
    onSecim(adresKodu, ozet);
  };

  return (
    <div className="flow__adres">
      <div className="flow__grid">
        <label className="flow__field">
          <span className="flow__label">İl</span>
          <select
            className="flow__input"
            value={ilKodu}
            onChange={(event) => ilSecildi(event.target.value)}
          >
            <option value="">Seçin</option>
            {iller.map((il) => (
              <option key={il.IlKodu} value={normalizeIlKodu(il.IlKodu)}>
                {il.IlAdi}
              </option>
            ))}
          </select>
        </label>

        {SEVIYELER.map((seviye, index) => {
          const liste = listeler[index];
          // Üst seviye seçilmeden bu seviye gösterilmiyor.
          const gorunur = index === 0 ? Boolean(ilKodu) : Boolean(secimler[index - 1]);
          if (!gorunur) return null;

          return (
            <label key={seviye.st} className="flow__field">
              <span className="flow__label">{seviye.label}</span>
              <select
                className="flow__input"
                value={secimler[index]?.Kod ? String(secimler[index].Kod) : ""}
                onChange={(event) => seviyeSecildi(index, event.target.value)}
                disabled={yukleniyor === index || !liste?.length}
              >
                <option value="">
                  {yukleniyor === index
                    ? "Yükleniyor…"
                    : liste?.length
                      ? "Seçin"
                      : "Kayıt yok"}
                </option>
                {(liste ?? []).map((kayit) => (
                  <option key={String(kayit.Kod)} value={String(kayit.Kod)}>
                    {kayitEtiketi(kayit, seviye.st)}
                  </option>
                ))}
              </select>
            </label>
          );
        })}
      </div>

      {sorunlu ? <p className="flow__warning">{sorunlu}</p> : null}
    </div>
  );
}
