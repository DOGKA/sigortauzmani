export default function RaporKarti({
  baslik,
  aciklama,
  sag,
  govdeSinifi,
  children,
  className,
}: {
  baslik: string;
  aciklama?: string;
  sag?: React.ReactNode;
  govdeSinifi?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex flex-col rounded-2xl border border-slate-200 bg-white ${className ?? ""}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-700">{baslik}</h2>
          {aciklama && (
            <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
              {aciklama}
            </p>
          )}
        </div>
        {sag}
      </header>
      <div className={govdeSinifi ?? "flex-1 p-5"}>{children}</div>
    </section>
  );
}

export function BosDurum({ mesaj }: { mesaj: string }) {
  return (
    <div className="flex h-full min-h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
      {mesaj}
    </div>
  );
}

export function GrafikLegend({
  ogeler,
}: {
  ogeler: { ad: string; renk: string; kesikli?: boolean }[];
}) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {ogeler.map((oge) => (
        <li
          key={oge.ad}
          className="flex items-center gap-1.5 text-xs text-slate-500"
        >
          <span
            className="h-0.5 w-4 rounded-full"
            style={{
              background: oge.kesikli
                ? `repeating-linear-gradient(90deg, ${oge.renk} 0 4px, transparent 4px 7px)`
                : oge.renk,
            }}
          />
          {oge.ad}
        </li>
      ))}
    </ul>
  );
}
