"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import MakbuzButonu from "@/components/MakbuzButonu";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime, formatPrim, maskKimlikNo, paraKodu } from "@/lib/format";
import { useVurgu, VURGU_SATIR_SINIFI } from "@/lib/bildirim/useVurgu";
import { BRANS_LABELS, type SatinAlmaKaydi } from "@/lib/types";
import BulkActions from "@/components/BulkActions";
import { deleteBulk, downloadCsv } from "@/lib/bulk-actions";
import { useBulkSelection } from "@/lib/useBulkSelection";

const STATUS_STYLES: Record<SatinAlmaKaydi["status"], string> = {
  basarili: "bg-emerald-100 text-emerald-700",
  basarisiz: "bg-rose-100 text-rose-700",
};

const STATUS_LABELS: Record<SatinAlmaKaydi["status"], string> = {
  basarili: "Başarılı",
  basarisiz: "Başarısız",
};

function bransAdi(bransNo: number) {
  return BRANS_LABELS[bransNo] ?? `Branş ${bransNo}`;
}

function kimlikNoOf(kayit: SatinAlmaKaydi) {
  const oturum = kayit.teklif_oturumlari;
  if (!oturum) return null;
  return oturum.entity_type === "sirket" ? oturum.vergi_no : oturum.tckn;
}

export default function PolicelerTable() {
  const [kayitlar, setKayitlar] = useState<SatinAlmaKaydi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    SatinAlmaKaydi["status"] | "all"
  >("all");
  const [bransFilter, setBransFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const { vurguId, vurguRef } = useVurgu(setExpandedId);

  const load = useCallback(async () => {
    setLoading(true);
    // Sigortalı bilgisi oturum tablosunda; poliçe listesi onsuz okunamıyor.
    const { data, error: fetchError } = await supabase
      .from("satin_almalar")
      .select(
        `*, teklif_oturumlari (
          oturum_no, product_slug, entity_type, tckn, vergi_no,
          ad_soyad, phone, plate
        )`,
      )
      .order("created_at", { ascending: false })
      .limit(500);

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setError(null);
      setKayitlar((data as SatinAlmaKaydi[]) ?? []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  const bransNolar = useMemo(
    () =>
      Array.from(new Set(kayitlar.map((k) => k.brans_no))).sort(
        (a, b) => a - b,
      ),
    [kayitlar],
  );

  const filtered = kayitlar.filter(
    (k) =>
      (statusFilter === "all" || k.status === statusFilter) &&
      (bransFilter === "all" || String(k.brans_no) === bransFilter),
  );
  const selection = useBulkSelection(filtered.map((kayit) => kayit.id));

  const basarili = filtered.filter((k) => k.status === "basarili");
  const toplamTry = basarili
    .filter((k) => paraKodu(k.brans_no) === "TRY")
    .reduce((toplam, k) => toplam + (Number(k.prim) || 0), 0);
  const toplamEur = basarili
    .filter((k) => paraKodu(k.brans_no) === "EUR")
    .reduce((toplam, k) => toplam + (Number(k.prim) || 0), 0);
  const toplamMetin = [
    `${filtered.length} poliçe`,
    toplamTry ? formatPrim(toplamTry, "TRY") : null,
    toplamEur ? formatPrim(toplamEur, "EUR") : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const exportCsv = () => {
    const rows = selection.selectedCount
      ? filtered.filter((kayit) => selection.selectedIds.has(kayit.id))
      : filtered;
    downloadCsv(
      "policeler",
      [
        { key: "police_no", label: "Poliçe No" },
        { key: "brans_no", label: "Branş No" },
        { key: "sirket_adi", label: "Şirket" },
        { key: "sirket_kodu", label: "Şirket Kodu" },
        { key: "sigortali", label: "Sigortalı" },
        { key: "kimlik_no", label: "Kimlik No" },
        { key: "telefon", label: "Telefon" },
        { key: "plaka", label: "Plaka" },
        { key: "teklif_no", label: "Teklif No" },
        { key: "prim", label: "Prim" },
        { key: "taksit", label: "Taksit" },
        { key: "kart_sahibi", label: "Kart Sahibi" },
        { key: "kart_son4", label: "Kart Son 4" },
        { key: "uc_d_secure", label: "3D Secure" },
        { key: "status", label: "Durum" },
        { key: "hata_mesaji", label: "Hata Mesajı" },
        { key: "police_pdf_url", label: "Poliçe Belgesi" },
        { key: "makbuz_pdf_url", label: "Makbuz Belgesi" },
        { key: "created_at", label: "Oluşturulma Tarihi" },
      ],
      rows.map((kayit) => ({
        ...kayit,
        sigortali: kayit.teklif_oturumlari?.ad_soyad,
        telefon: kayit.teklif_oturumlari?.phone,
        kimlik_no: kimlikNoOf(kayit),
        plaka: kayit.teklif_oturumlari?.plate,
      })),
    );
  };

  const deleteSelected = async () => {
    const ids = selection.selectedVisibleIds;
    if (
      !ids.length ||
      !window.confirm(
        `${ids.length} poliçe/satın alma kaydı kalıcı olarak silinecek. Bu işlem geri alınamaz. Devam edilsin mi?`,
      )
    ) {
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      await deleteBulk("policeler", ids);
      setKayitlar((current) =>
        current.filter((item) => !ids.includes(item.id)),
      );
      selection.remove(ids);
      if (expandedId && ids.includes(expandedId)) setExpandedId(null);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Poliçe kayıtları silinemedi.",
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
          onChange={(e) =>
            setStatusFilter(
              e.target.value as SatinAlmaKaydi["status"] | "all",
            )
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-sky-400"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="basarili">Başarılı</option>
          <option value="basarisiz">Başarısız</option>
        </select>

        <select
          value={bransFilter}
          onChange={(e) => setBransFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-sky-400"
        >
          <option value="all">Tüm Branşlar</option>
          {bransNolar.map((b) => (
            <option key={b} value={String(b)}>
              {bransAdi(b)}
            </option>
          ))}
        </select>

        <button
          onClick={() => void load()}
          className="ml-auto flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
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
          {toplamMetin}
        </span>
        <div className="shrink-0">
          <BulkActions
            selectedCount={selection.selectedCount}
            visibleCount={filtered.length}
            allSelected={selection.allSelected}
            busy={deleting}
            itemLabel="poliçe"
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
              <th className="px-5 py-3.5 font-semibold">Poliçe No</th>
              <th className="px-4 py-3.5 font-semibold">Branş</th>
              <th className="px-4 py-3.5 font-semibold">Şirket</th>
              <th className="px-4 py-3.5 font-semibold">Sigortalı</th>
              <th className="px-4 py-3.5 font-semibold">Kimlik No</th>
              <th className="px-4 py-3.5 font-semibold">Prim</th>
              <th className="px-4 py-3.5 font-semibold">Durum</th>
              <th className="px-4 py-3.5 font-semibold">Tarih</th>
              <th className="px-4 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-5 py-14 text-center text-slate-400"
                >
                  Yükleniyor...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-5 py-14 text-center text-slate-400"
                >
                  Gösterilecek poliçe yok.
                </td>
              </tr>
            ) : (
              filtered.map((kayit) => (
                <PoliceRow
                  key={kayit.id}
                  kayit={kayit}
                  expanded={expandedId === kayit.id}
                  vurgulu={vurguId === kayit.id}
                  satirRef={vurguId === kayit.id ? vurguRef : undefined}
                  onToggle={() =>
                    setExpandedId((id) => (id === kayit.id ? null : kayit.id))
                  }
                  selected={selection.selectedIds.has(kayit.id)}
                  onSelect={() => selection.toggle(kayit.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PoliceRow({
  kayit,
  expanded,
  vurgulu,
  satirRef,
  onToggle,
  selected,
  onSelect,
}: {
  kayit: SatinAlmaKaydi;
  expanded: boolean;
  vurgulu: boolean;
  satirRef?: (dugum: HTMLTableRowElement | null) => void;
  onToggle: () => void;
  selected: boolean;
  onSelect: () => void;
}) {
  const oturum = kayit.teklif_oturumlari;

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
            aria-label={`${kayit.police_no ?? "Poliçe"} kaydını seç`}
            className="size-4 rounded border-slate-300 accent-sky-600"
          />
        </td>
        <td className="px-5 py-3.5 font-mono text-[13px] font-semibold text-sky-600">
          {kayit.police_no ?? "-"}
        </td>
        <td className="px-4 py-3.5 font-medium text-slate-700">
          {bransAdi(kayit.brans_no)}
        </td>
        <td className="px-4 py-3.5 text-slate-600">
          {kayit.sirket_adi ?? kayit.sirket_kodu}
        </td>
        <td className="px-4 py-3.5 text-slate-600">
          {oturum?.ad_soyad ?? "-"}
        </td>
        <td className="px-4 py-3.5 font-mono text-[13px] text-slate-500">
          {maskKimlikNo(kimlikNoOf(kayit))}
        </td>
        <td className="px-4 py-3.5 font-semibold whitespace-nowrap text-slate-800">
          {formatPrim(kayit.prim, paraKodu(kayit.brans_no))}
        </td>
        <td className="px-4 py-3.5">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[kayit.status]}`}
          >
            {STATUS_LABELS[kayit.status]}
          </span>
        </td>
        <td className="px-4 py-3.5 whitespace-nowrap text-slate-500">
          {formatDateTime(kayit.created_at)}
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
            <path
              d="m6 9 6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </td>
      </tr>

      {expanded && (
        <tr className="border-b border-slate-100 bg-slate-50/60">
          <td colSpan={10} className="px-5 py-4">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3 lg:grid-cols-4">
              <DetailItem label="İşlem No" value={oturum?.oturum_no ?? null} />
              <DetailItem label="Ürün" value={oturum?.product_slug ?? null} />
              <DetailItem
                label={
                  oturum?.entity_type === "sirket"
                    ? "Vergi Kimlik No"
                    : oturum?.entity_type === "yabanci"
                      ? "Yabancı Kimlik No"
                      : "T.C. Kimlik No"
                }
                value={kimlikNoOf(kayit)}
              />
              <DetailItem label="Telefon" value={oturum?.phone ?? null} />
              <DetailItem label="Plaka" value={oturum?.plate ?? null} />
              <DetailItem label="Teklif No" value={kayit.teklif_no} />
              <DetailItem label="Taksit" value={kayit.taksit} />
              <DetailItem label="Kart Sahibi" value={kayit.kart_sahibi} />
              <DetailItem
                label="Kart"
                value={kayit.kart_son4 ? `**** ${kayit.kart_son4}` : null}
              />
              <DetailItem
                label="3D Secure"
                value={kayit.uc_d_secure ? "Evet" : "Hayır"}
              />
              {kayit.hata_mesaji && (
                <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Hata
                  </dt>
                  <dd className="mt-0.5 font-medium text-rose-600">
                    {kayit.hata_mesaji}
                  </dd>
                </div>
              )}
            </dl>

            {/* Makbuz düğmesi adres boşken de duruyor: belge satın alma anında
                hazır olmadığı için kayıt genelde boş kalıyor ve tıklandığında
                IO'dan o an isteniyor. */}
            {(kayit.police_pdf_url || kayit.status === "basarili") && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
                {kayit.police_pdf_url && (
                  <a
                    href={kayit.police_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Poliçeyi Görüntüle
                  </a>
                )}
                {kayit.status === "basarili" && (
                  <MakbuzButonu
                    key={kayit.id}
                    satinAlmaId={kayit.id}
                    mevcutUrl={kayit.makbuz_pdf_url}
                  />
                )}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
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
