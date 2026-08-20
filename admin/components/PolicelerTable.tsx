"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime, formatPrim, maskKimlikNo } from "@/lib/format";
import { BRANS_LABELS, type SatinAlmaKaydi } from "@/lib/types";

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
  const supabase = useMemo(() => createClient(), []);

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

  const toplamPrim = filtered
    .filter((k) => k.status === "basarili")
    .reduce((toplam, k) => toplam + (Number(k.prim) || 0), 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      {/* Filtreler */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-4">
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
          {filtered.length} poliçe · {formatPrim(toplamPrim)}
        </span>
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
                  colSpan={9}
                  className="px-5 py-14 text-center text-slate-400"
                >
                  Yükleniyor...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
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
                  onToggle={() =>
                    setExpandedId((id) => (id === kayit.id ? null : kayit.id))
                  }
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
  onToggle,
}: {
  kayit: SatinAlmaKaydi;
  expanded: boolean;
  onToggle: () => void;
}) {
  const oturum = kayit.teklif_oturumlari;

  return (
    <>
      <tr
        className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50"
        onClick={onToggle}
      >
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
          {formatPrim(kayit.prim)}
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
          <td colSpan={9} className="px-5 py-4">
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

            {(kayit.police_pdf_url || kayit.makbuz_pdf_url) && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
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
                {kayit.makbuz_pdf_url && (
                  <a
                    href={kayit.makbuz_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Makbuzu Görüntüle
                  </a>
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
