"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  IPTAL_BRANS_LABELS,
  IPTAL_STATUS_LABELS,
  IPTAL_STATUS_ORDER,
  type IptalStatus,
  type IptalTalep,
} from "@/lib/types";

const STATUS_STYLES: Record<IptalStatus, string> = {
  islemde: "bg-sky-100 text-sky-700",
  belge_eksik: "bg-amber-100 text-amber-700",
  tamamlandi: "bg-emerald-100 text-emerald-700",
};

const IPTAL_BUCKET = "iptal-belgeleri";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `0${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
  }
  if (digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
  }
  return phone;
}

export default function IptalTalepleriTable() {
  const [items, setItems] = useState<IptalTalep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<IptalStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("iptal_talepleri")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setError(null);
      setItems((data as IptalTalep[]) ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (id: string, status: IptalStatus) => {
    setItems((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t)),
    );
    const { error: updateError } = await supabase
      .from("iptal_talepleri")
      .update({ status })
      .eq("id", id);
    if (updateError) {
      setError(`Durum güncellenemedi: ${updateError.message}`);
      void load();
    }
  };

  const saveNote = async (id: string, admin_note: string) => {
    setItems((prev) =>
      prev.map((t) => (t.id === id ? { ...t, admin_note } : t)),
    );
    const { error: updateError } = await supabase
      .from("iptal_talepleri")
      .update({ admin_note: admin_note || null })
      .eq("id", id);
    if (updateError) {
      setError(`Not kaydedilemedi: ${updateError.message}`);
      void load();
      return false;
    }
    return true;
  };

  const openBelge = async (path: string) => {
    const { data, error: signError } = await supabase.storage
      .from(IPTAL_BUCKET)
      .createSignedUrl(path, 60 * 10);
    if (signError || !data?.signedUrl) {
      setError(`Belge açılamadı: ${signError?.message ?? "Bilinmeyen hata"}`);
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const filtered = items.filter(
    (t) => statusFilter === "all" || t.status === statusFilter,
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-4">
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as IptalStatus | "all")
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-sky-400"
        >
          <option value="all">Tüm Durumlar</option>
          {IPTAL_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {IPTAL_STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <button
          onClick={() => void load()}
          className="ml-auto flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Yenile
        </button>

        <span className="text-sm text-slate-400">{filtered.length} talep</span>
      </div>

      {error && (
        <div className="mx-5 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3.5 font-semibold">İptal No</th>
              <th className="px-4 py-3.5 font-semibold">Branş</th>
              <th className="px-4 py-3.5 font-semibold">Ad Soyad</th>
              <th className="px-4 py-3.5 font-semibold">Plaka</th>
              <th className="px-4 py-3.5 font-semibold">Durum</th>
              <th className="px-4 py-3.5 font-semibold">Tarih</th>
              <th className="px-4 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-14 text-center text-slate-400">
                  Yükleniyor...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-14 text-center text-slate-400">
                  Gösterilecek iptal talebi yok.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <IptalRow
                  key={item.id}
                  item={item}
                  expanded={expandedId === item.id}
                  onToggle={() =>
                    setExpandedId((id) => (id === item.id ? null : item.id))
                  }
                  onStatusChange={(s) => void updateStatus(item.id, s)}
                  onSaveNote={(note) => saveNote(item.id, note)}
                  onOpenBelge={() => void openBelge(item.belge_path)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IptalRow({
  item,
  expanded,
  onToggle,
  onStatusChange,
  onSaveNote,
  onOpenBelge,
}: {
  item: IptalTalep;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: IptalStatus) => void;
  onSaveNote: (note: string) => Promise<boolean>;
  onOpenBelge: () => void;
}) {
  const [note, setNote] = useState(item.admin_note ?? "");
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    setNote(item.admin_note ?? "");
  }, [item.admin_note]);

  const handleSaveNote = async () => {
    setSavingNote(true);
    setNoteSaved(false);
    const ok = await onSaveNote(note.trim());
    setSavingNote(false);
    if (ok) setNoteSaved(true);
  };

  return (
    <>
      <tr className="border-b border-slate-100 hover:bg-slate-50/70">
        <td className="px-5 py-3.5 font-semibold text-slate-800">
          {item.iptal_no}
        </td>
        <td className="px-4 py-3.5 text-slate-600">
          {IPTAL_BRANS_LABELS[item.brans]}
        </td>
        <td className="px-4 py-3.5 text-slate-700">{item.ad_soyad}</td>
        <td className="px-4 py-3.5 font-medium tracking-wide text-slate-700">
          {item.plate}
        </td>
        <td className="px-4 py-3.5">
          <select
            value={item.status}
            onChange={(e) => onStatusChange(e.target.value as IptalStatus)}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none ${STATUS_STYLES[item.status]}`}
          >
            {IPTAL_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {IPTAL_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </td>
        <td className="px-4 py-3.5 text-slate-500">
          {formatDateTime(item.created_at)}
        </td>
        <td className="px-4 py-3.5 text-right">
          <button
            type="button"
            onClick={onToggle}
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-50"
          >
            {expanded ? "Gizle" : "Detay"}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-slate-100 bg-slate-50/80">
          <td colSpan={7} className="px-5 py-5">
            <div className="grid gap-4 md:grid-cols-2">
              <dl className="grid grid-cols-[140px_1fr] gap-y-2 text-sm">
                <dt className="text-slate-400">Telefon</dt>
                <dd className="font-medium text-slate-700">
                  {formatPhone(item.phone)}
                </dd>
                <dt className="text-slate-400">
                  {item.vergi_no ? "Vergi No" : "TCKN"}
                </dt>
                <dd className="font-medium text-slate-700">
                  {item.vergi_no || item.tckn || "-"}
                </dd>
                <dt className="text-slate-400">Belge</dt>
                <dd>
                  <button
                    type="button"
                    onClick={onOpenBelge}
                    className="font-semibold text-sky-600 hover:underline"
                  >
                    Noter satış belgesini aç
                  </button>
                </dd>
                <dt className="text-slate-400">Güncelleme</dt>
                <dd className="text-slate-600">
                  {formatDateTime(item.updated_at)}
                </dd>
              </dl>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Admin Notu
                </label>
                <textarea
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value);
                    setNoteSaved(false);
                  }}
                  rows={4}
                  placeholder="İç not ekleyin…"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-sky-400"
                />
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void handleSaveNote()}
                    disabled={savingNote}
                    className="rounded-xl bg-sky-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
                  >
                    {savingNote ? "Kaydediliyor…" : "Notu Kaydet"}
                  </button>
                  {noteSaved && (
                    <span className="text-sm text-emerald-600">Kaydedildi</span>
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
