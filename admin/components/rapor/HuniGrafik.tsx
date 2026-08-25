"use client";

import { Cell, Funnel, FunnelChart, ResponsiveContainer, Tooltip } from "recharts";
import TooltipKutusu from "@/components/rapor/TooltipKutusu";
import { BosDurum } from "@/components/rapor/RaporKarti";
import { sayiYaz, yuzdeYaz } from "@/lib/rapor/bicim";
import { HUNI_RENKLERI } from "@/lib/rapor/renkler";
import type { HuniAdimi } from "@/lib/rapor/ozet";

export default function HuniGrafik({ adimlar }: { adimlar: HuniAdimi[] }) {
  if (!adimlar[0]?.deger) {
    return <BosDurum mesaj="Bu aralıkta teklif akışı başlatılmamış." />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const adim = payload[0].payload as HuniAdimi;
                return (
                  <TooltipKutusu
                    baslik={adim.ad}
                    satirlar={[
                      { ad: "Oturum", deger: sayiYaz(adim.deger) },
                      { ad: "Başlangıca göre", deger: yuzdeYaz(adim.oran) },
                      { ad: "Bir önceki adımdan", deger: yuzdeYaz(adim.gecis) },
                    ]}
                  />
                );
              }}
            />
            <Funnel
              dataKey="deger"
              nameKey="ad"
              data={adimlar}
              lastShapeType="rectangle"
              stroke="#ffffff"
              strokeWidth={2}
            >
              {adimlar.map((adim, index) => (
                <Cell
                  key={adim.ad}
                  fill={HUNI_RENKLERI[index % HUNI_RENKLERI.length]}
                />
              ))}
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>

      <ol className="space-y-3">
        {adimlar.map((adim, index) => (
          <li key={adim.ad}>
            <div className="flex items-baseline gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 translate-y-px rounded-full"
                style={{
                  background: HUNI_RENKLERI[index % HUNI_RENKLERI.length],
                }}
              />
              <span className="text-sm font-medium text-slate-700">
                {adim.ad}
              </span>
              <span className="ml-auto text-sm font-semibold tabular-nums text-slate-800">
                {sayiYaz(adim.deger)}
              </span>
              <span className="w-14 text-right text-xs tabular-nums text-slate-400">
                {yuzdeYaz(adim.oran)}
              </span>
            </div>
            <div className="mt-1.5 ml-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${Math.max(adim.oran, adim.deger ? 1.5 : 0)}%`,
                  background: HUNI_RENKLERI[index % HUNI_RENKLERI.length],
                }}
              />
            </div>
            <p className="mt-1 ml-5 text-xs text-slate-400">
              {adim.aciklama}
              {index > 0 && (
                <span className="text-slate-500">
                  {" · "}
                  önceki adımdan {yuzdeYaz(adim.gecis)}
                </span>
              )}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
