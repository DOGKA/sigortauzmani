"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import TooltipKutusu from "@/components/rapor/TooltipKutusu";
import { BosDurum } from "@/components/rapor/RaporKarti";
import { formatPrim } from "@/lib/format";
import { sayiYaz, yuzdeYaz } from "@/lib/rapor/bicim";
import { SERI_RENKLERI } from "@/lib/rapor/renkler";
import type { SirketSatiri } from "@/lib/rapor/ozet";

const EKSEN_YAZISI = { fontSize: 11, fill: SERI_RENKLERI.eksen };

export default function SirketGrafik({
  sirketler,
}: {
  sirketler: SirketSatiri[];
}) {
  if (!sirketler.length) {
    return <BosDurum mesaj="Bu aralıkta şirketlerden fiyat dönmemiş." />;
  }

  // Uzun şirket adları ekseni taşırıyor; grafik ilk 8'i gösteriyor, tamamı
  // aşağıdaki tabloda.
  const veri = sirketler.slice(0, 8).map((sirket) => ({
    ...sirket,
    kisaAd: sirket.ad.length > 18 ? `${sirket.ad.slice(0, 17)}…` : sirket.ad,
  }));

  return (
    <div style={{ height: Math.max(veri.length * 46 + 24, 200) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={veri}
          layout="vertical"
          margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
          barGap={2}
        >
          <CartesianGrid
            horizontal={false}
            stroke={SERI_RENKLERI.izgara}
            strokeDasharray="4 4"
          />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tick={EKSEN_YAZISI}
          />
          <YAxis
            type="category"
            dataKey="kisaAd"
            tickLine={false}
            axisLine={false}
            width={132}
            tick={{ fontSize: 12, fill: "#475569" }}
          />
          <Tooltip
            cursor={{ fill: "#f8fafc" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const sirket = payload[0].payload as SirketSatiri;
              return (
                <TooltipKutusu
                  baslik={sirket.ad}
                  satirlar={[
                    {
                      ad: "Fiyat verdiği oturum",
                      deger: sayiYaz(sirket.teklifOturumu),
                      renk: "#c7d2fe",
                    },
                    {
                      ad: "Kazandığı poliçe",
                      deger: sayiYaz(sirket.police),
                      renk: SERI_RENKLERI.talep,
                    },
                    { ad: "Kazanma oranı", deger: yuzdeYaz(sirket.kazanmaOrani) },
                    { ad: "Prim", deger: formatPrim(sirket.primTry, "TRY") },
                  ]}
                />
              );
            }}
          />
          <Bar
            dataKey="teklifOturumu"
            fill="#c7d2fe"
            radius={[0, 6, 6, 0]}
            maxBarSize={14}
          />
          <Bar
            dataKey="police"
            fill={SERI_RENKLERI.talep}
            radius={[0, 6, 6, 0]}
            maxBarSize={14}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
