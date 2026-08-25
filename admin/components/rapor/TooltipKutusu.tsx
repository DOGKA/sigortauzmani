"use client";

/** Recharts tooltip'lerinin ortak kutusu; panelin kart diliyle aynı görünür. */
export default function TooltipKutusu({
  baslik,
  satirlar,
}: {
  baslik?: string;
  satirlar: { ad: string; deger: string; renk?: string }[];
}) {
  return (
    <div className="min-w-40 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg shadow-slate-900/5">
      {baslik && (
        <p className="mb-1.5 text-xs font-semibold text-slate-600">{baslik}</p>
      )}
      <ul className="space-y-1">
        {satirlar.map((satir) => (
          <li
            key={satir.ad}
            className="flex items-center gap-2 text-xs text-slate-500"
          >
            {satir.renk && (
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: satir.renk }}
              />
            )}
            <span>{satir.ad}</span>
            <span className="ml-auto font-semibold tabular-nums text-slate-700">
              {satir.deger}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
