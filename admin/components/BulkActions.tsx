"use client";

interface Props {
  selectedCount: number;
  visibleCount: number;
  allSelected: boolean;
  busy: boolean;
  itemLabel: string;
  onToggleAll: () => void;
  onExport: () => void;
  onDelete: () => void;
}

export default function BulkActions({
  selectedCount,
  visibleCount,
  allSelected,
  busy,
  itemLabel,
  onToggleAll,
  onExport,
  onDelete,
}: Props) {
  return (
    <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
        <input
          type="checkbox"
          checked={allSelected}
          disabled={visibleCount === 0 || busy}
          onChange={onToggleAll}
          className="size-4 rounded border-slate-300 accent-sky-600"
        />
        Tümünü seç
      </label>

      <button
        type="button"
        onClick={onExport}
        disabled={visibleCount === 0 || busy}
        className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        CSV dışa aktar
      </button>

      <button
        type="button"
        onClick={onDelete}
        disabled={selectedCount === 0 || busy}
        className="rounded-xl border border-rose-200 px-3.5 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? "Siliniyor…" : "Seçilenleri sil"}
      </button>

      {selectedCount > 0 && (
        <span className="text-xs font-semibold text-sky-700">
          {selectedCount} {itemLabel} seçildi
        </span>
      )}
    </div>
  );
}
