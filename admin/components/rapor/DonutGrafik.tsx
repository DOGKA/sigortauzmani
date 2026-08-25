"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import TooltipKutusu from "@/components/rapor/TooltipKutusu";
import { BosDurum } from "@/components/rapor/RaporKarti";
import { sayiYaz, yuzdeYaz } from "@/lib/rapor/bicim";
import type { Dilim } from "@/lib/rapor/ozet";

export default function DonutGrafik({
  dilimler,
  merkezEtiketi,
  bosMesaji = "Bu aralıkta kayıt yok.",
}: {
  dilimler: Dilim[];
  merkezEtiketi: string;
  bosMesaji?: string;
}) {
  const toplam = dilimler.reduce((t, dilim) => t + dilim.deger, 0);

  if (!toplam) return <BosDurum mesaj={bosMesaji} />;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="relative h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dilimler}
              dataKey="deger"
              nameKey="ad"
              innerRadius="64%"
              outerRadius="100%"
              paddingAngle={dilimler.length > 1 ? 2 : 0}
              stroke="none"
            >
              {dilimler.map((dilim) => (
                <Cell key={dilim.anahtar} fill={dilim.renk} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const dilim = payload[0].payload as Dilim;
                return (
                  <TooltipKutusu
                    baslik={dilim.ad}
                    satirlar={[
                      { ad: "Adet", deger: sayiYaz(dilim.deger), renk: dilim.renk },
                      {
                        ad: "Pay",
                        deger: yuzdeYaz((dilim.deger / toplam) * 100),
                      },
                    ]}
                  />
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums text-slate-800">
            {sayiYaz(toplam)}
          </span>
          <span className="mt-0.5 text-[11px] text-slate-400">
            {merkezEtiketi}
          </span>
        </div>
      </div>

      <ul className="w-full min-w-0 space-y-2">
        {dilimler.map((dilim) => (
          <li key={dilim.anahtar} className="flex items-center gap-2.5 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: dilim.renk }}
            />
            <span className="truncate text-slate-600">{dilim.ad}</span>
            <span className="ml-auto shrink-0 font-semibold tabular-nums text-slate-700">
              {sayiYaz(dilim.deger)}
            </span>
            <span className="w-14 shrink-0 text-right text-xs tabular-nums text-slate-400">
              {yuzdeYaz((dilim.deger / toplam) * 100)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
