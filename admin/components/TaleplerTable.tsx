"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  STATUS_LABELS,
  STATUS_ORDER,
  type Talep,
  type TalepStatus,
} from "@/lib/types";
import { formatPrim, paraKodu } from "@/lib/format";
import { useVurgu, VURGU_SATIR_SINIFI } from "@/lib/bildirim/useVurgu";
import { buildTalepWhatsAppUrl } from "@/lib/whatsapp";
import BulkActions from "@/components/BulkActions";
import { deleteBulk, downloadCsv } from "@/lib/bulk-actions";
import { useBulkSelection } from "@/lib/useBulkSelection";

const STATUS_STYLES: Record<TalepStatus, string> = {
  yeni: "bg-sky-100 text-sky-700",
  arandi: "bg-amber-100 text-amber-700",
  teklif_verildi: "bg-violet-100 text-violet-700",
  tamamlandi: "bg-emerald-100 text-emerald-700",
  iptal: "bg-red-100 text-red-600",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}

function contactPrefText(talep: Talep) {
  if (talep.contact_pref === "tarihli" && talep.contact_date) {
    return `${formatDate(talep.contact_date)} ${talep.contact_time ?? ""}`.trim();
  }
  return "Hemen";
}

export default function TaleplerTable() {
  const [talepler, setTalepler] = useState<Talep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TalepStatus | "all">("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const { vurguId, vurguRef } = useVurgu(setExpandedId);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("talepler")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setError(null);
      setTalepler((data as Talep[]) ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (id: string, status: TalepStatus) => {
    setTalepler((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t)),
    );
    const { error: updateError } = await supabase
      .from("talepler")
      .update({ status })
      .eq("id", id);
    if (updateError) {
      setError(`Durum güncellenemedi: ${updateError.message}`);
      void load();
    }
  };

  const productTitles = useMemo(
    () => Array.from(new Set(talepler.map((t) => t.product_title))).sort(),
    [talepler],
  );

  const filtered = talepler.filter(
    (t) =>
      (statusFilter === "all" || t.status === statusFilter) &&
      (productFilter === "all" || t.product_title === productFilter),
  );
  const selection = useBulkSelection(filtered.map((talep) => talep.id));

  const exportCsv = () => {
    const rows = selection.selectedCount
      ? filtered.filter((talep) => selection.selectedIds.has(talep.id))
      : filtered;
    downloadCsv(
      "talepler",
      [
        { key: "talep_no", label: "Talep No" },
        { key: "product_title", label: "Sigorta Türü" },
        { key: "sirket_adi", label: "Şirket" },
        { key: "entity_type", label: "Sigortalı Türü" },
        { key: "tckn", label: "T.C. Kimlik No" },
        { key: "vergi_no", label: "Vergi No" },
        { key: "phone", label: "Telefon" },
        { key: "birth_date", label: "Doğum Tarihi" },
        { key: "plate", label: "Plaka" },
        { key: "gosterilen_prim", label: "Gösterilen Prim" },
        { key: "contact_pref", label: "İletişim Tercihi" },
        { key: "contact_date", label: "İletişim Tarihi" },
        { key: "contact_time", label: "İletişim Saati" },
        { key: "status", label: "Durum" },
        { key: "created_at", label: "Oluşturulma Tarihi" },
      ],
      rows,
    );
  };

  const deleteSelected = async () => {
    const ids = selection.selectedVisibleIds;
    if (
      !ids.length ||
      !window.confirm(
        `${ids.length} talep kalıcı olarak silinecek. Bu işlem geri alınamaz. Devam edilsin mi?`,
      )
    ) {
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      await deleteBulk("talepler", ids);
      setTalepler((current) => current.filter((item) => !ids.includes(item.id)));
      selection.remove(ids);
      if (expandedId && ids.includes(expandedId)) setExpandedId(null);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Talepler silinemedi.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      {/* Filtreler */}
      <div className="flex items-center gap-3 overflow-x-auto border-b border-slate-200 px-5 py-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TalepStatus | "all")}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-sky-400"
        >
          <option value="all">Tüm Durumlar</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-sky-400"
        >
          <option value="all">Tüm Sigorta Türleri</option>
          {productTitles.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <button
          onClick={() => void load()}
          className="ml-auto flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M21 12a9 9 0 1 1-2.6-6.3M21 3v5h-5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Yenile
        </button>

        <span className="text-sm text-slate-400">
          {filtered.length} talep
        </span>
        <div className="shrink-0">
          <BulkActions
            selectedCount={selection.selectedCount}
            visibleCount={filtered.length}
            allSelected={selection.allSelected}
            busy={deleting}
            itemLabel="talep"
            onToggleAll={selection.toggleAll}
            onExport={exportCsv}
            onDelete={() => void deleteSelected()}
          />
        </div>
      </div>

      {error && (
        <div className="mx-5 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Tablo */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <th className="w-10 px-3 py-3.5" />
              <th className="px-5 py-3.5 font-semibold">Talep No</th>
              <th className="px-4 py-3.5 font-semibold">Sigorta Türü</th>
              <th className="px-4 py-3.5 font-semibold">Şirket</th>
              <th className="px-4 py-3.5 font-semibold">Telefon</th>
              <th className="px-4 py-3.5 font-semibold">İletişim Tercihi</th>
              <th className="px-4 py-3.5 font-semibold">Durum</th>
              <th className="px-4 py-3.5 font-semibold">Tarih</th>
              <th className="px-4 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-5 py-14 text-center text-slate-400">
                  Yükleniyor...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-14 text-center text-slate-400">
                  Gösterilecek talep yok.
                </td>
              </tr>
            ) : (
              filtered.map((talep) => (
                <TalepRow
                  key={talep.id}
                  talep={talep}
                  expanded={expandedId === talep.id}
                  vurgulu={vurguId === talep.id}
                  satirRef={vurguId === talep.id ? vurguRef : undefined}
                  onToggle={() =>
                    setExpandedId((id) => (id === talep.id ? null : talep.id))
                  }
                  onStatusChange={(s) => void updateStatus(talep.id, s)}
                  selected={selection.selectedIds.has(talep.id)}
                  onSelect={() => selection.toggle(talep.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TalepRow({
  talep,
  expanded,
  vurgulu,
  satirRef,
  onToggle,
  onStatusChange,
  selected,
  onSelect,
}: {
  talep: Talep;
  expanded: boolean;
  vurgulu: boolean;
  satirRef?: (dugum: HTMLTableRowElement | null) => void;
  onToggle: () => void;
  onStatusChange: (status: TalepStatus) => void;
  selected: boolean;
  onSelect: () => void;
}) {
  const whatsappUrl = buildTalepWhatsAppUrl(talep);

  return (
    <>
      <tr
        ref={satirRef}
        className={`cursor-pointer border-b border-slate-100 transition hover:bg-slate-50 ${
          vurgulu ? VURGU_SATIR_SINIFI : ""
        }`}
        onClick={onToggle}
      >
        <td className="w-10 px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            aria-label={`${talep.talep_no} talebini seç`}
            className="size-4 rounded border-slate-300 accent-sky-600"
          />
        </td>
        <td className="px-5 py-3.5 font-mono text-[13px] font-semibold text-sky-600">
          {talep.talep_no}
        </td>
        <td className="px-4 py-3.5 font-medium text-slate-700">
          {talep.product_title}
        </td>
        <td className="px-4 py-3.5 text-slate-600">
          {talep.sirket_adi ?? "-"}
        </td>
        <td className="px-4 py-3.5 text-slate-600">{talep.phone ?? "-"}</td>
        <td className="px-4 py-3.5 text-slate-600">
          {talep.contact_pref === "tarihli" ? (
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
                <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
              {contactPrefText(talep)}
            </span>
          ) : (
            <span className="font-medium text-emerald-600">Hemen</span>
          )}
        </td>
        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
          <select
            value={talep.status}
            onChange={(e) => onStatusChange(e.target.value as TalepStatus)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold outline-none ${STATUS_STYLES[talep.status]}`}
          >
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </td>
        <td className="px-4 py-3.5 whitespace-nowrap text-slate-500">
          {formatDateTime(talep.created_at)}
        </td>
        <td className="px-4 py-3.5 text-slate-400">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </td>
      </tr>

      {expanded && (
        <tr className="border-b border-slate-100 bg-slate-50/60">
          <td colSpan={9} className="px-5 py-4">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3 lg:grid-cols-4">
              <DetailItem label="Şirket" value={talep.sirket_adi ?? null} />
              <DetailItem
                label="Görünen fiyat"
                value={
                  talep.gosterilen_prim != null
                    ? formatPrim(
                        talep.gosterilen_prim,
                        paraKodu(undefined, talep.product_slug),
                      )
                    : null
                }
              />
              <DetailItem
                label="Sigortalı Türü"
                value={
                  talep.entity_type === "sirket"
                    ? "Şirket"
                    : talep.entity_type === "sahis"
                      ? "Şahıs"
                      : null
                }
              />
              <DetailItem label="T.C. Kimlik No" value={talep.tckn} />
              <DetailItem label="Vergi No" value={talep.vergi_no} />
              <DetailItem label="Doğum Tarihi" value={formatDate(talep.birth_date)} />
              <DetailItem label="Sigortalanacak Kişi" value={talep.insured_for} />
              <DetailItem label="Plaka" value={talep.plate} />
              <DetailItem label="Belge Seri No" value={talep.document_serial} />
              <DetailItem label="Motor No" value={talep.motor_no} />
              <DetailItem label="Şasi No" value={talep.sasi_no} />
              {/* Rıza yoksa sağlık beyanı istenemez; ekip bunu aramadan
                  önce görmeli. */}
              <DetailItem
                label="Sağlık Verisi Açık Rızası"
                value={
                  talep.saglik_acik_riza == null
                    ? null
                    : talep.saglik_acik_riza
                      ? "Verildi"
                      : "Verilmedi"
                }
              />
              {/* Hangi aydınlatma metninin gösterildiği KVKK başvurularında
                  kanıt olarak isteniyor. */}
              <DetailItem
                label="KVKK Metin Sürümü"
                value={
                  talep.kvkk_surum
                    ? talep.kvkk_gosterildi_at
                      ? `${talep.kvkk_surum} · ${new Date(
                          talep.kvkk_gosterildi_at,
                        ).toLocaleString("tr-TR")}`
                      : talep.kvkk_surum
                    : null
                }
              />
              <DetailItem label="İletişim Tercihi" value={contactPrefText(talep)} />
              {talep.phone && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    WhatsApp
                  </dt>
                  <dd className="mt-0.5">
                    {whatsappUrl ? (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-emerald-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Mesaj gönder
                      </a>
                    ) : (
                      <span className="text-slate-500">{talep.phone}</span>
                    )}
                    <p className="mt-1 max-w-xs text-xs text-slate-400">
                      Müşteri siteden WhatsApp ile yazmadıysa mesaj istekler
                      klasörüne düşebilir; mümkünse önce müşterinin yazmasını
                      bekleyin.
                    </p>
                  </dd>
                </div>
              )}
            </dl>
          </td>
        </tr>
      )}
    </>
  );
}

function DetailItem({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium text-slate-700">{value}</dd>
    </div>
  );
}
