"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import TooltipKutusu from "@/components/rapor/TooltipKutusu";
import { BosDurum } from "@/components/rapor/RaporKarti";
import { formatPrim } from "@/lib/format";
import { kisaTutar, sayiYaz } from "@/lib/rapor/bicim";
import { SERI_RENKLERI } from "@/lib/rapor/renkler";
import type { ZamanNoktasi } from "@/lib/rapor/ozet";

const EKSEN_YAZISI = { fontSize: 11, fill: SERI_RENKLERI.eksen };

export default function TrendGrafik({ noktalar }: { noktalar: ZamanNoktasi[] }) {
  const hareketVar = noktalar.some(
    (nokta) => nokta.oturum || nokta.police || nokta.talep || nokta.primTry,
  );

  if (!hareketVar) {
    return <BosDurum mesaj="Seçilen aralıkta hareket kaydedilmemiş." />;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={noktalar}
          margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke={SERI_RENKLERI.izgara}
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="etiket"
            tickLine={false}
            axisLine={false}
            tick={EKSEN_YAZISI}
            minTickGap={18}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="adet"
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tick={EKSEN_YAZISI}
            width={40}
          />
          <YAxis
            yAxisId="prim"
            orientation="right"
            tickLine={false}
            axisLine={false}
            tick={EKSEN_YAZISI}
            tickFormatter={kisaTutar}
            width={52}
          />
          <Tooltip
            cursor={{ fill: "#f8fafc" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const nokta = payload[0].payload as ZamanNoktasi;
              return (
                <TooltipKutusu
                  baslik={String(label)}
                  satirlar={[
                    {
                      ad: "Teklif oturumu",
                      deger: sayiYaz(nokta.oturum),
                      renk: SERI_RENKLERI.oturum,
                    },
                    {
                      ad: "Poliçe",
                      deger: sayiYaz(nokta.police),
                      renk: SERI_RENKLERI.police,
                    },
                    {
                      ad: "Callback talebi",
                      deger: sayiYaz(nokta.talep),
                      renk: SERI_RENKLERI.talep,
                    },
                    {
                      ad: "Yazılan prim",
                      deger: formatPrim(nokta.primTry, "TRY"),
                      renk: "#38bdf8",
                    },
                  ]}
                />
              );
            }}
          />
          <Bar
            yAxisId="prim"
            dataKey="primTry"
            fill={SERI_RENKLERI.prim}
            radius={[6, 6, 0, 0]}
            maxBarSize={26}
          />
          <Line
            yAxisId="adet"
            type="monotone"
            dataKey="oturum"
            stroke={SERI_RENKLERI.oturum}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            yAxisId="adet"
            type="monotone"
            dataKey="police"
            stroke={SERI_RENKLERI.police}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            yAxisId="adet"
            type="monotone"
            dataKey="talep"
            stroke={SERI_RENKLERI.talep}
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
