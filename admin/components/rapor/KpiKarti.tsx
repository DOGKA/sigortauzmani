  import { formatPrim } from "@/lib/format";
import { sayiYaz, yuzdeYaz } from "@/lib/rapor/bicim";
import type { Kpi } from "@/lib/rapor/ozet";

function degerYaz(kpi: Kpi): string {
  if (kpi.bicim === "para") return formatPrim(kpi.deger, "TRY");
  if (kpi.bicim === "yuzde") return yuzdeYaz(kpi.deger);
  return sayiYaz(kpi.deger);
}

/**
 * Önceki dönemle karşılaştırma. Önceki dönem sıfırsa yüzde hesaplanamıyor;
 * bu durumda oran yerine "yeni" rozeti gösteriliyor.
 */
function degisim(kpi: Kpi): { metin: string; artis: boolean } | null {
  if (kpi.onceki === null) return null;
  if (kpi.onceki === 0) {
    return kpi.deger > 0 ? { metin: "yeni", artis: true } : null;
  }
  const oran = ((kpi.deger - kpi.onceki) / kpi.onceki) * 100;
  if (Math.abs(oran) < 0.05) return null;
  return {
    metin: `${oran > 0 ? "+" : "−"}${yuzdeYaz(Math.abs(oran)).slice(1)}`,
    artis: oran > 0,
  };
}

export default function KpiKarti({ kpi }: { kpi: Kpi }) {
  const fark = degisim(kpi);
  const iyi = fark ? (kpi.tersYon ? !fark.artis : fark.artis) : false;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-500">{kpi.etiket}</span>
        {fark && (
          <span
            className={`flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
              iyi ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            }`}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className={fark.artis ? "" : "rotate-180"}
            >
              <path
                d="M12 19V5M5 12l7-7 7 7"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {fark.metin}
          </span>
        )}
      </div>

      <p className="mt-2 text-2xl font-bold tabular-nums text-slate-800">
        {degerYaz(kpi)}
      </p>

      {kpi.altBilgi && (
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
          {kpi.altBilgi}
        </p>
      )}
    </div>
  );
}
