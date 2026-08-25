"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrim } from "@/lib/format";
import DonutGrafik from "@/components/rapor/DonutGrafik";
import HuniGrafik from "@/components/rapor/HuniGrafik";
import KpiKarti from "@/components/rapor/KpiKarti";
import RaporKarti, {
  BosDurum,
  GrafikLegend,
} from "@/components/rapor/RaporKarti";
import SaatGrafik from "@/components/rapor/SaatGrafik";
import SirketGrafik from "@/components/rapor/SirketGrafik";
import TrendGrafik from "@/components/rapor/TrendGrafik";
import { euroYaz, sayiYaz, yuzdeYaz } from "@/lib/rapor/bicim";
import { SERI_RENKLERI } from "@/lib/rapor/renkler";
import { raporOzeti } from "@/lib/rapor/ozet";
import {
  ARALIKLAR,
  raporVerisiGetir,
  type Aralik,
  type RaporVerisi,
} from "@/lib/rapor/veri";

const TARIH_BICIMI = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "long",
});

const SAAT_BICIMI = new Intl.DateTimeFormat("tr-TR", {
  hour: "2-digit",
  minute: "2-digit",
});

export default function RaporlarPanel() {
  const supabase = useMemo(() => createClient(), []);
  const [aralik, setAralik] = useState<Aralik>("30g");
  const [veri, setVeri] = useState<RaporVerisi | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);
  const [sonGuncelleme, setSonGuncelleme] = useState<Date | null>(null);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      const sonuc = await raporVerisiGetir(supabase, aralik);
      setVeri(sonuc);
      setHata(null);
      setSonGuncelleme(new Date());
    } catch (sebep) {
      setHata(
        sebep instanceof Error ? sebep.message : "Rapor verisi alınamadı.",
      );
    }
    setYukleniyor(false);
  }, [supabase, aralik]);

  useEffect(() => {
    void (async () => {
      await yukle();
    })();
  }, [yukle]);

  const ozet = useMemo(
    () => (veri ? raporOzeti(veri, aralik) : null),
    [veri, aralik],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
        <div className="flex flex-wrap gap-1.5">
          {ARALIKLAR.map((secenek) => (
            <button
              key={secenek.deger}
              onClick={() => setAralik(secenek.deger)}
              className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
                aralik === secenek.deger
                  ? "border-sky-200 bg-sky-50 text-sky-700"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {secenek.etiket}
            </button>
          ))}
        </div>

        {ozet && (
          <span className="text-sm text-slate-400">
            {TARIH_BICIMI.format(ozet.baslangic)} –{" "}
            {TARIH_BICIMI.format(ozet.bitis)}
          </span>
        )}

        <button
          onClick={() => void yukle()}
          disabled={yukleniyor}
          className="ml-auto flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={yukleniyor ? "animate-spin" : ""}
          >
            <path
              d="M21 12a9 9 0 1 1-2.6-6.3M21 3v5h-5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Yenile
        </button>

        {sonGuncelleme && (
          <span className="text-xs text-slate-400">
            Son güncelleme {SAAT_BICIMI.format(sonGuncelleme)}
          </span>
        )}
      </div>

      {hata && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {hata}
        </div>
      )}

      {veri?.kesildi && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Sorgu satır limitine dayandı; daha dar bir tarih aralığı seçmezseniz
          rapor bu aralığın tamamını kapsamayabilir.
        </div>
      )}

      {!ozet ? (
        <YuklemeIskeleti />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {ozet.kpiler.map((kpi) => (
              <KpiKarti key={kpi.anahtar} kpi={kpi} />
            ))}
          </div>

          <RaporKarti
            baslik="Günlük hareket ve yazılan prim"
            aciklama={
              ozet.zamanHaftalik
                ? "Aralık uzun olduğu için kovalar haftalık. Sütunlar prim (sağ eksen), çizgiler adet (sol eksen)."
                : "Sütunlar yazılan primi (sağ eksen), çizgiler adetleri (sol eksen) gösterir."
            }
            sag={
              <GrafikLegend
                ogeler={[
                  { ad: "Teklif oturumu", renk: SERI_RENKLERI.oturum },
                  { ad: "Poliçe", renk: SERI_RENKLERI.police },
                  {
                    ad: "Callback talebi",
                    renk: SERI_RENKLERI.talep,
                    kesikli: true,
                  },
                  { ad: "Prim (TL)", renk: "#7dd3fc" },
                ]}
              />
            }
          >
            <TrendGrafik noktalar={ozet.zaman} />
          </RaporKarti>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <RaporKarti
              baslik="Self servis dönüşüm hunisi"
              aciklama={`Teklif akışının adım adım daralması. Bu aralıkta ${sayiYaz(
                ozet.hataliOturum,
              )} oturum hatayla sonuçlandı.`}
            >
              <HuniGrafik adimlar={ozet.huni} />
            </RaporKarti>

            <RaporKarti
              baslik="Kimlik tipi"
              aciklama="Oturumların şahıs, şirket ve yabancı uyruklu dağılımı."
            >
              <DonutGrafik
                dilimler={ozet.kimlikTipleri}
                merkezEtiketi="oturum"
              />
            </RaporKarti>
          </div>

          <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            <RaporKarti
              baslik="Branş bazlı poliçe"
              aciklama="Başarıyla tamamlanan satın almaların branş dağılımı."
            >
              <DonutGrafik
                dilimler={ozet.bransDilimleri}
                merkezEtiketi="poliçe"
                bosMesaji="Bu aralıkta tamamlanmış poliçe yok."
              />
            </RaporKarti>

            <RaporKarti
              baslik="Oturum durumları"
              aciklama="Akışın hangi adımda bırakıldığı."
            >
              <DonutGrafik
                dilimler={ozet.oturumDurumlari}
                merkezEtiketi="oturum"
              />
            </RaporKarti>

            <RaporKarti
              baslik="Callback talepleri"
              aciklama="Self servis dışı ürünlerin talep durumları."
            >
              <DonutGrafik
                dilimler={ozet.talepDurumlari}
                merkezEtiketi="talep"
                bosMesaji="Bu aralıkta callback talebi yok."
              />
            </RaporKarti>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <RaporKarti
              baslik="Şirket rekabeti"
              aciklama="Fiyat verdiği oturum sayısına karşı kazandığı poliçe."
              sag={
                <GrafikLegend
                  ogeler={[
                    { ad: "Fiyat verdiği oturum", renk: "#c7d2fe" },
                    { ad: "Kazandığı poliçe", renk: SERI_RENKLERI.talep },
                  ]}
                />
              }
            >
              <SirketGrafik sirketler={ozet.sirketler} />
            </RaporKarti>

            <RaporKarti
              baslik="Şirket performans tablosu"
              aciklama="En ucuz sütunu, aynı oturum ve branşta en düşük primi verme sayısıdır."
              govdeSinifi="flex-1 overflow-x-auto"
            >
              {ozet.sirketler.length === 0 ? (
                <div className="p-5">
                  <BosDurum mesaj="Bu aralıkta şirket verisi yok." />
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                      <th className="px-5 py-3 font-semibold">Şirket</th>
                      <th className="px-3 py-3 text-right font-semibold">
                        Teklif
                      </th>
                      <th className="px-3 py-3 text-right font-semibold">
                        En ucuz
                      </th>
                      <th className="px-3 py-3 text-right font-semibold">
                        Poliçe
                      </th>
                      <th className="px-3 py-3 text-right font-semibold">
                        Kazanma
                      </th>
                      <th className="px-5 py-3 text-right font-semibold">
                        Prim
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ozet.sirketler.slice(0, 12).map((sirket) => (
                      <tr
                        key={sirket.kod}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="max-w-48 truncate px-5 py-3 font-medium text-slate-700">
                          {sirket.ad}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                          {sayiYaz(sirket.teklifOturumu)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                          {sayiYaz(sirket.enUcuz)}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold tabular-nums text-slate-800">
                          {sayiYaz(sirket.police)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                          {yuzdeYaz(sirket.kazanmaOrani)}
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums text-slate-600">
                          {sirket.primEur && !sirket.primTry
                            ? euroYaz(sirket.primEur)
                            : formatPrim(sirket.primTry, "TRY")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </RaporKarti>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <RaporKarti
              baslik="Saat bazlı yoğunluk"
              aciklama="Ziyaretçinin akışa girdiği saat. Çağrı vardiyasını buna göre kurun."
              sag={
                <GrafikLegend
                  ogeler={[
                    { ad: "Teklif oturumu", renk: SERI_RENKLERI.oturum },
                    { ad: "Callback talebi", renk: SERI_RENKLERI.talep },
                  ]}
                />
              }
            >
              <SaatGrafik saatler={ozet.saatler} />
            </RaporKarti>

            <RaporKarti
              baslik="Destek yükü"
              aciklama="İptal ve iletişim tarafında biriken iş."
            >
              <ul className="space-y-3">
                <DestekSatiri
                  etiket="İptal talebi"
                  deger={ozet.destek.iptalToplam}
                  alt={`${sayiYaz(ozet.destek.iptalAcik)} tanesi hâlâ açık`}
                />
                <DestekSatiri
                  etiket="İletişim mesajı"
                  deger={ozet.destek.iletisimToplam}
                  alt={`${sayiYaz(ozet.destek.iletisimYeni)} yeni · ${sayiYaz(
                    ozet.destek.iletisimAcil,
                  )} öncelikli`}
                />
              </ul>
            </RaporKarti>
          </div>

          <RaporKarti
            baslik="Ürün performansı"
            aciklama="Self servis satırlarında adet oturum, sonuç poliçedir. Callback satırlarında adet talep, sonuç tamamlanan taleptir."
            govdeSinifi="overflow-x-auto"
          >
            {ozet.urunler.length === 0 ? (
              <div className="p-5">
                <BosDurum mesaj="Bu aralıkta ürün hareketi yok." />
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-semibold">Ürün</th>
                    <th className="px-4 py-3 font-semibold">Kanal</th>
                    <th className="px-4 py-3 text-right font-semibold">Adet</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Sonuç
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Dönüşüm
                    </th>
                    <th className="px-5 py-3 text-right font-semibold">Prim</th>
                  </tr>
                </thead>
                <tbody>
                  {ozet.urunler.map((urun) => (
                    <tr
                      key={urun.anahtar}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-5 py-3 font-medium text-slate-700">
                        {urun.ad}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-lg px-2 py-1 text-xs font-medium ${
                            urun.kanal === "Self servis"
                              ? "bg-violet-100 text-violet-700"
                              : "bg-sky-100 text-sky-700"
                          }`}
                        >
                          {urun.kanal}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                        {sayiYaz(urun.adet)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-800">
                        {sayiYaz(urun.sonuc)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                        {yuzdeYaz(urun.donusum)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-slate-600">
                        {urun.kanal === "Callback"
                          ? "—"
                          : urun.primEur && !urun.primTry
                            ? euroYaz(urun.primEur)
                            : formatPrim(urun.primTry, "TRY")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </RaporKarti>

          <RaporKarti
            baslik="En sık hatalar"
            aciklama="Teklif akışında ve ödeme adımında düşen kayıtların gerekçeleri."
            govdeSinifi="overflow-x-auto"
          >
            {ozet.hatalar.length === 0 ? (
              <div className="p-5">
                <BosDurum mesaj="Bu aralıkta kayıtlı hata yok." />
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-semibold">Kaynak</th>
                    <th className="px-4 py-3 font-semibold">Mesaj</th>
                    <th className="px-4 py-3 text-right font-semibold">Adet</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Son görülme
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ozet.hatalar.map((satir) => (
                    <tr
                      key={`${satir.kaynak}-${satir.mesaj}`}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-lg px-2 py-1 text-xs font-medium ${
                            satir.kaynak === "Ödeme"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {satir.kaynak}
                        </span>
                      </td>
                      <td className="max-w-xl px-4 py-3 text-slate-600">
                        {satir.mesaj}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-800">
                        {sayiYaz(satir.adet)}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-500">
                        {new Date(satir.sonTarih).toLocaleString("tr-TR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </RaporKarti>

          {ozet.bosMu && (
            <p className="pb-2 text-center text-sm text-slate-400">
              Seçilen aralıkta hiç kayıt yok. Daha geniş bir aralık seçmeyi
              deneyin.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function DestekSatiri({
  etiket,
  deger,
  alt,
}: {
  etiket: string;
  deger: number;
  alt: string;
}) {
  return (
    <li className="rounded-xl border border-slate-200 px-4 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-slate-600">{etiket}</span>
        <span className="text-xl font-bold tabular-nums text-slate-800">
          {sayiYaz(deger)}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-slate-400">{alt}</p>
    </li>
  );
}

function YuklemeIskeleti() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      <div className="grid gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>
    </div>
  );
}
