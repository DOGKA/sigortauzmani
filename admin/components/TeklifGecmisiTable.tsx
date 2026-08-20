"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  formatDate,
  formatDateTime,
  formatPrim,
  maskKimlikNo,
  maskPhone,
} from "@/lib/format";
import {
  BRANS_LABELS,
  OTURUM_STATUS_LABELS,
  OTURUM_STATUS_ORDER,
  type OturumStatus,
  type TeklifFiyati,
  type TeklifOturumu,
} from "@/lib/types";

const STATUS_STYLES: Record<OturumStatus, string> = {
  baslatildi: "bg-slate-100 text-slate-600",
  sorgu_tamam: "bg-sky-100 text-sky-700",
  teklif_calisti: "bg-violet-100 text-violet-700",
  secildi: "bg-amber-100 text-amber-700",
  satin_alindi: "bg-emerald-100 text-emerald-700",
  hata: "bg-rose-100 text-rose-700",
};

function bransAdi(bransNo: number) {
  return BRANS_LABELS[bransNo] ?? `Branş ${bransNo}`;
}

function kimlikNoOf(oturum: TeklifOturumu) {
  return oturum.entity_type === "sirket" ? oturum.vergi_no : oturum.tckn;
}

export default function TeklifGecmisiTable() {
  const [oturumlar, setOturumlar] = useState<TeklifOturumu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OturumStatus | "all">("all");
  const [bransFilter, setBransFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("teklif_oturumlari")
      .select("*")
      .order("created_at", { ascending: false })
      // Terk edilmiş oturumlar da tutulduğu için tablo hızla büyüyor;
      // panel son işlemleri gösteriyor.
      .limit(500);

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setError(null);
      setOturumlar((data as TeklifOturumu[]) ?? []);
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
      Array.from(new Set(oturumlar.map((o) => o.brans_no))).sort(
        (a, b) => a - b,
      ),
    [oturumlar],
  );

  const filtered = oturumlar.filter(
    (o) =>
      (statusFilter === "all" || o.status === statusFilter) &&
      (bransFilter === "all" || String(o.brans_no) === bransFilter),
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      {/* Filtreler */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-4">
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as OturumStatus | "all")
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-sky-400"
        >
          <option value="all">Tüm Durumlar</option>
          {OTURUM_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {OTURUM_STATUS_LABELS[s]}
            </option>
          ))}
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

        <span className="text-sm text-slate-400">{filtered.length} oturum</span>
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
              <th className="px-5 py-3.5 font-semibold">İşlem No</th>
              <th className="px-4 py-3.5 font-semibold">Branş</th>
              <th className="px-4 py-3.5 font-semibold">Sigortalı</th>
              <th className="px-4 py-3.5 font-semibold">Kimlik No</th>
              <th className="px-4 py-3.5 font-semibold">Telefon</th>
              <th className="px-4 py-3.5 font-semibold">Durum</th>
              <th className="px-4 py-3.5 font-semibold">Tarih</th>
              <th className="px-4 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-14 text-center text-slate-400"
                >
                  Yükleniyor...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-14 text-center text-slate-400"
                >
                  Gösterilecek oturum yok.
                </td>
              </tr>
            ) : (
              filtered.map((oturum) => (
                <OturumRow
                  key={oturum.id}
                  oturum={oturum}
                  expanded={expandedId === oturum.id}
                  onToggle={() =>
                    setExpandedId((id) => (id === oturum.id ? null : oturum.id))
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

function OturumRow({
  oturum,
  expanded,
  onToggle,
}: {
  oturum: TeklifOturumu;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50"
        onClick={onToggle}
      >
        <td className="px-5 py-3.5 font-mono text-[13px] font-semibold text-sky-600">
          {oturum.oturum_no}
        </td>
        <td className="px-4 py-3.5 font-medium text-slate-700">
          {bransAdi(oturum.brans_no)}
        </td>
        <td className="px-4 py-3.5 text-slate-600">{oturum.ad_soyad ?? "-"}</td>
        <td className="px-4 py-3.5 font-mono text-[13px] text-slate-500">
          {maskKimlikNo(kimlikNoOf(oturum))}
        </td>
        <td className="px-4 py-3.5 font-mono text-[13px] text-slate-500">
          {maskPhone(oturum.phone)}
        </td>
        <td className="px-4 py-3.5">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[oturum.status]}`}
          >
            {OTURUM_STATUS_LABELS[oturum.status]}
          </span>
        </td>
        <td className="px-4 py-3.5 whitespace-nowrap text-slate-500">
          {formatDateTime(oturum.created_at)}
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
          <td colSpan={8} className="px-5 py-4">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3 lg:grid-cols-4">
              <DetailItem
                label="Sigortalı Türü"
                value={
                  oturum.entity_type === "sirket"
                    ? "Şirket"
                    : oturum.entity_type === "yabanci"
                      ? "Yabancı Uyruklu"
                      : "Şahıs"
                }
              />
              <DetailItem
                label={
                  oturum.entity_type === "sirket"
                    ? "Vergi Kimlik No"
                    : oturum.entity_type === "yabanci"
                      ? "Yabancı Kimlik No"
                      : "T.C. Kimlik No"
                }
                value={kimlikNoOf(oturum)}
              />
              <DetailItem label="Telefon" value={oturum.phone} />
              <DetailItem
                label="Doğum Tarihi"
                value={formatDate(oturum.birth_date)}
              />
              <DetailItem label="Plaka" value={oturum.plate} />
              <DetailItem label="Adres Kodu" value={oturum.adres_kodu} />
              <DetailItem label="Ürün" value={oturum.product_slug} />
              <DetailItem label="Son Güncelleme" value={formatDateTime(oturum.updated_at)} />
              {oturum.hata_mesaji && (
                <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Hata
                  </dt>
                  <dd className="mt-0.5 font-medium text-rose-600">
                    {oturum.hata_mesaji}
                  </dd>
                </div>
              )}
            </dl>

            <FormVerisi formData={oturum.form_data} />
            <Fiyatlar oturumId={oturum.id} />
          </td>
        </tr>
      )}
    </>
  );
}

/**
 * Adım verisi ürün başına farklı alanlar taşıdığı (ve IO'ya gönderilen ham
 * gövdeyi de içerdiği) için kolonlara açılmıyor. Katmanlı bir yapı olduğu
 * için biçimli JSON olarak gösteriliyor; tek satıra sıkıştırmak okunmaz
 * oluyordu. Kart bilgisi bu alana hiç yazılmıyor.
 */
function FormVerisi({ formData }: { formData: Record<string, unknown> }) {
  const [acik, setAcik] = useState(false);
  if (!formData || !Object.keys(formData).length) return null;

  return (
    <div className="mt-4 border-t border-slate-200 pt-4">
      <button
        onClick={() => setAcik((onceki) => !onceki)}
        className="text-xs font-semibold uppercase tracking-wide text-slate-400 transition hover:text-slate-600"
      >
        Girilen Bilgiler {acik ? "▾" : "▸"}
      </button>
      {acik && (
        <pre className="mt-2 max-h-80 overflow-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs leading-relaxed text-slate-600">
          {JSON.stringify(formData, null, 2)}
        </pre>
      )}
    </div>
  );
}

/** Şirket fiyatları satır açıldığında çekiliyor; liste sorgusunu şişirmesin. */
function Fiyatlar({ oturumId }: { oturumId: string }) {
  const [fiyatlar, setFiyatlar] = useState<TeklifFiyati[] | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let iptal = false;
    void (async () => {
      const { data, error } = await supabase
        .from("teklif_fiyatlari")
        .select("*")
        .eq("oturum_id", oturumId)
        .order("prim", { ascending: true });
      if (iptal) return;
      if (error) setHata(error.message);
      else setFiyatlar((data as TeklifFiyati[]) ?? []);
    })();
    return () => {
      iptal = true;
    };
  }, [oturumId, supabase]);

  return (
    <div className="mt-4 border-t border-slate-200 pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Gelen Teklifler
      </p>
      {hata ? (
        <p className="mt-2 text-sm text-red-600">
          Fiyatlar yüklenemedi: {hata}
        </p>
      ) : fiyatlar === null ? (
        <p className="mt-2 text-sm text-slate-400">Yükleniyor...</p>
      ) : fiyatlar.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">
          Bu oturumda şirket teklifi kaydedilmemiş.
        </p>
      ) : (
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {fiyatlar.map((fiyat) => (
            <li
              key={fiyat.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <span className="text-sm font-medium text-slate-700">
                {fiyat.sirket_adi ?? fiyat.sirket_kodu}
                {fiyat.brans_no !== undefined && (
                  <span className="ml-1.5 text-xs text-slate-400">
                    {bransAdi(fiyat.brans_no)}
                  </span>
                )}
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {formatPrim(fiyat.prim)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
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
