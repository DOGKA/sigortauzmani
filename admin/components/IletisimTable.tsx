"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ILETISIM_ONCELIK_LABELS,
  ILETISIM_STATUS_LABELS,
  ILETISIM_STATUS_ORDER,
  type IletisimOncelik,
  type IletisimStatus,
  type IletisimTalep,
} from "@/lib/types";

const STATUS_STYLES: Record<IletisimStatus, string> = {
  yeni: "bg-sky-100 text-sky-700",
  inceleniyor: "bg-amber-100 text-amber-700",
  yanitlandi: "bg-emerald-100 text-emerald-700",
  kapatildi: "bg-slate-100 text-slate-600",
};

const PRIORITY_STYLES: Record<IletisimOncelik, string> = {
  normal: "bg-slate-100 text-slate-600",
  oncelikli: "bg-orange-100 text-orange-700",
  acil: "bg-rose-100 text-rose-700",
};

const ILETISIM_BUCKET = "iletisim-belgeleri";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function IletisimTable() {
  const [items, setItems] = useState<IletisimTalep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<IletisimStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] =
    useState<IletisimOncelik | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;
    const query = supabase
      .from("iletisim_talepleri")
      .select("*")
      .order("created_at", { ascending: false });
    void query.then(({ data, error: fetchError }) => {
      if (cancelled) return;
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setError(null);
        setItems((data as IletisimTalep[]) ?? []);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const updateStatus = async (id: string, status: IletisimStatus) => {
    const previous = items;
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    const { error: updateError } = await supabase
      .from("iletisim_talepleri")
      .update({ status })
      .eq("id", id);
    if (updateError) {
      setItems(previous);
      setError(`Durum güncellenemedi: ${updateError.message}`);
    }
  };

  const openDocument = async (path: string) => {
    const { data, error: signError } = await supabase.storage
      .from(ILETISIM_BUCKET)
      .createSignedUrl(path, 60 * 10);
    if (signError || !data?.signedUrl) {
      setError(`Belge açılamadı: ${signError?.message ?? "Bilinmeyen hata"}`);
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const filtered = items.filter(
    (item) =>
      (statusFilter === "all" || item.status === statusFilter) &&
      (priorityFilter === "all" || item.oncelik === priorityFilter),
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-4">
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as IletisimStatus | "all")
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
          aria-label="Duruma göre filtrele"
        >
          <option value="all">Tüm durumlar</option>
          {ILETISIM_STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {ILETISIM_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(event) =>
            setPriorityFilter(event.target.value as IletisimOncelik | "all")
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-400"
          aria-label="Önceliğe göre filtrele"
        >
          <option value="all">Tüm öncelikler</option>
          {(
            Object.keys(ILETISIM_ONCELIK_LABELS) as IletisimOncelik[]
          ).map((priority) => (
            <option key={priority} value={priority}>
              {ILETISIM_ONCELIK_LABELS[priority]}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs font-medium text-slate-400">
          {filtered.length} kayıt
        </span>
      </div>

      {error && (
        <div className="border-b border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="px-5 py-16 text-center text-sm text-slate-400">
          Mesajlar yükleniyor…
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-5 py-16 text-center text-sm text-slate-400">
          Bu filtrelere uygun iletişim mesajı bulunamadı.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Tarih / No</th>
                <th className="px-4 py-3.5">Gönderen</th>
                <th className="px-4 py-3.5">Konu</th>
                <th className="px-4 py-3.5">Öncelik</th>
                <th className="px-4 py-3.5">Durum</th>
                <th className="px-5 py-3.5 text-right">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <ContactRow
                  key={item.id}
                  item={item}
                  expanded={expandedId === item.id}
                  onToggle={() =>
                    setExpandedId((current) =>
                      current === item.id ? null : item.id,
                    )
                  }
                  onStatusChange={(status) => void updateStatus(item.id, status)}
                  onOpenDocument={() =>
                    item.belge_path && void openDocument(item.belge_path)
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ContactRow({
  item,
  expanded,
  onToggle,
  onStatusChange,
  onOpenDocument,
}: {
  item: IletisimTalep;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: IletisimStatus) => void;
  onOpenDocument: () => void;
}) {
  return (
    <>
      <tr
        className={`cursor-pointer ${expanded ? "bg-sky-50/40" : "hover:bg-slate-50/60"}`}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button, a, select, input, textarea, label")) return;
          onToggle();
        }}
      >
        <td className="px-5 py-4">
          <div className="font-medium text-slate-700">
            {formatDateTime(item.created_at)}
          </div>
          <div className="mt-1 font-mono text-xs text-slate-400">
            {item.iletisim_no}
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="font-semibold text-slate-800">{item.ad_soyad}</div>
          <a
            href={`mailto:${item.email}`}
            className="mt-1 block text-xs text-sky-600 hover:underline"
          >
            {item.email}
          </a>
        </td>
        <td className="max-w-[280px] px-4 py-4">
          <div className="truncate font-medium text-slate-700">{item.konu}</div>
        </td>
        <td className="px-4 py-4">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${PRIORITY_STYLES[item.oncelik]}`}
          >
            {ILETISIM_ONCELIK_LABELS[item.oncelik]}
          </span>
        </td>
        <td className="px-4 py-4">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[item.status]}`}
          >
            {ILETISIM_STATUS_LABELS[item.status]}
          </span>
        </td>
        <td className="px-5 py-4 text-right">
          <button
            type="button"
            onClick={onToggle}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100"
          >
            {expanded ? "Kapat" : "Görüntüle"}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} className="bg-slate-50/70 px-5 py-5">
            <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Mesaj
                </p>
                <div className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700">
                  {item.mesaj}
                </div>
              </div>
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Durum
                  </span>
                  <select
                    value={item.status}
                    onChange={(event) =>
                      onStatusChange(event.target.value as IletisimStatus)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-sky-400"
                  >
                    {ILETISIM_STATUS_ORDER.map((status) => (
                      <option key={status} value={status}>
                        {ILETISIM_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </label>
                <a
                  href={`mailto:${item.email}?subject=${encodeURIComponent(`Re: ${item.konu} (${item.iletisim_no})`)}`}
                  className="flex w-full items-center justify-center rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
                >
                  E-posta ile Yanıtla
                </a>
                {item.belge_path && (
                  <button
                    type="button"
                    onClick={onOpenDocument}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Belgeyi Aç
                  </button>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
