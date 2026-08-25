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
import { sayiYaz } from "@/lib/rapor/bicim";
import { SERI_RENKLERI } from "@/lib/rapor/renkler";
import type { SaatNoktasi } from "@/lib/rapor/ozet";

const EKSEN_YAZISI = { fontSize: 11, fill: SERI_RENKLERI.eksen };

export default function SaatGrafik({ saatler }: { saatler: SaatNoktasi[] }) {
  const hareketVar = saatler.some((nokta) => nokta.oturum || nokta.talep);
  if (!hareketVar) return <BosDurum mesaj="Bu aralıkta kayıt yok." />;

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={saatler}
          margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke={SERI_RENKLERI.izgara}
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="saat"
            tickLine={false}
            axisLine={false}
            tick={EKSEN_YAZISI}
            interval={1}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tick={EKSEN_YAZISI}
            width={36}
          />
          <Tooltip
            cursor={{ fill: "#f8fafc" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const nokta = payload[0].payload as SaatNoktasi;
              return (
                <TooltipKutusu
                  baslik={`${label}:00 - ${label}:59`}
                  satirlar={[
                    {
                      ad: "Teklif oturumu",
                      deger: sayiYaz(nokta.oturum),
                      renk: SERI_RENKLERI.oturum,
                    },
                    {
                      ad: "Callback talebi",
                      deger: sayiYaz(nokta.talep),
                      renk: SERI_RENKLERI.talep,
                    },
                  ]}
                />
              );
            }}
          />
          <Bar
            dataKey="oturum"
            stackId="hareket"
            fill={SERI_RENKLERI.oturum}
            maxBarSize={22}
          />
          <Bar
            dataKey="talep"
            stackId="hareket"
            fill={SERI_RENKLERI.talep}
            radius={[4, 4, 0, 0]}
            maxBarSize={22}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
