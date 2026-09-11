"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ALL_PRODUCT_SLUGS,
  DEFAULT_SITE_SETTINGS,
  type LegalLocale,
  type SiteSettings,
} from "../../shared/site-settings";

type Tab = "notifications" | "analytics" | "legal" | "company" | "products";
type LegalVersion = {
  id: string;
  version: number;
  status: "draft" | "published" | "unpublished";
  content: unknown;
  published_at: string | null;
};
type LegalDocument = {
  id: string;
  slug: string;
  locale: LegalLocale;
  title: string;
  description: string;
  versions: LegalVersion[];
};

const TABS: { id: Tab; label: string; description: string }[] = [
  { id: "notifications", label: "Bildirimler", description: "E-posta alıcıları ve gönderim kanalları" },
  { id: "analytics", label: "Analitik", description: "GA4 veya Google Tag Manager" },
  { id: "legal", label: "Yasal Belgeler", description: "Diller, taslaklar ve yayımlanan sürümler" },
  { id: "company", label: "Kurumsal Bilgiler", description: "İletişim ve yasal şirket bilgileri" },
  { id: "products", label: "Ürün ve Akış", description: "Ürün görünürlüğü ve bakım modu" },
];

const PRODUCT_NAMES: Record<string, string> = {
  "trafik-sigortasi": "Trafik Sigortası",
  kasko: "Kasko",
  "kisa-sureli-trafik": "Kısa Süreli Trafik",
  "tamamlayici-saglik": "Tamamlayıcı Sağlık",
  "seyahat-saglik": "Seyahat Sağlık",
  imm: "İMM",
  "ozel-saglik": "Özel Sağlık",
  dask: "DASK",
  "yesil-kart": "Yeşil Kart",
  konut: "Konut",
};

/** Uç nokta beklenmeyen bir hatada gövdesiz yanıt verebilir; parse hatası ekranı kilitlemesin. */
async function readJson<T = object>(
  response: Response,
): Promise<Partial<T> & { error?: string }> {
  return (await response.json().catch(() => ({}))) as Partial<T> & { error?: string };
}

export default function AyarlarPanel() {
  const [tab, setTab] = useState<Tab>("notifications");
  const [settings, setSettings] = useState<SiteSettings>(structuredClone(DEFAULT_SITE_SETTINGS));
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  // Yükleme hatası her sekmede görünür; kaydetme sonucu yalnızca alt çubukta.
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [settingsResponse, legalResponse] = await Promise.all([
        fetch("/api/ayarlar"),
        fetch("/api/ayarlar/yasal"),
      ]);
      const settingsBody = await readJson<{ settings: SiteSettings }>(settingsResponse);
      const legalBody = await readJson<{ documents: LegalDocument[] }>(legalResponse);

      if (settingsResponse.ok && settingsBody.settings) setSettings(settingsBody.settings);
      else setLoadError(settingsBody.error ?? "Ayarlar alınamadı.");

      if (legalResponse.ok) setDocuments(legalBody.documents ?? []);
      else setLoadError(legalBody.error ?? "Yasal belgeler alınamadı.");
    } catch {
      setLoadError("Sunucuya ulaşılamadı. Bağlantıyı kontrol edin.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setSaving(true);
    setMessage(null);
    const response = await fetch("/api/ayarlar", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(settings),
    });
    const body = await readJson<{ settings: SiteSettings }>(response);
    if (response.ok && body.settings) {
      setSettings(body.settings);
      setMessage({ kind: "ok", text: "Ayarlar kaydedildi." });
    } else setMessage({ kind: "error", text: body.error ?? "Kaydedilemedi." });
    setSaving(false);
  }

  if (loading) {
    return <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[270px_minmax(0,1fr)]">
      <nav className="h-fit rounded-2xl border border-slate-200 bg-white p-2" aria-label="Ayar bölümleri">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`w-full rounded-xl px-3.5 py-3 text-left transition ${
              tab === item.id ? "bg-sky-50 text-sky-800" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="block text-sm font-semibold">{item.label}</span>
            <span className="mt-0.5 block text-xs leading-5 text-slate-400">{item.description}</span>
          </button>
        ))}
      </nav>

      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white">
        <header className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-800">{TABS.find((item) => item.id === tab)?.label}</h2>
          <p className="mt-1 text-sm text-slate-500">{TABS.find((item) => item.id === tab)?.description}</p>
        </header>
        <div className="space-y-5 p-6">
          {loadError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
              <p className="font-semibold">Sunucu ayarları okuyamadı</p>
              <p className="mt-1">{loadError}</p>
              <p className="mt-2 text-xs text-red-600">
                Bu ortamda <code>SUPABASE_SERVICE_ROLE_KEY</code> tanımlı değilse veya{" "}
                <code>schema_settings.sql</code> çalıştırılmadıysa bu hata görülür.
              </p>
              <button
                type="button"
                onClick={() => void load()}
                className="mt-3 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-sm font-semibold text-red-700"
              >
                Yeniden dene
              </button>
            </div>
          )}
          {tab === "notifications" && <Notifications settings={settings} setSettings={setSettings} />}
          {tab === "analytics" && <Analytics settings={settings} setSettings={setSettings} />}
          {tab === "legal" && <Legal documents={documents} reload={load} />}
          {tab === "company" && <Company settings={settings} setSettings={setSettings} />}
          {tab === "products" && <Products settings={settings} setSettings={setSettings} />}
        </div>
        {tab !== "legal" && (
          <footer className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-6 py-4">
            {message && (
              <p className={`text-sm ${message.kind === "ok" ? "text-emerald-600" : "text-red-600"}`}>
                {message.text}
              </p>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="ml-auto rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
            >
              {saving ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
            </button>
          </footer>
        )}
      </section>
    </div>
  );
}

function Field({ label, value, onChange, placeholder = "", type = "text" }: {
  label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:ring-3 focus:ring-sky-100"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, hint, rows = 5, placeholder = "" }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm leading-6 outline-none transition focus:border-sky-400 focus:ring-3 focus:ring-sky-100"
      />
      {hint && <span className="mt-1 block text-xs leading-5 text-slate-400">{hint}</span>}
    </label>
  );
}

function Switch({ checked, onChange, label, description }: {
  checked: boolean; onChange: (value: boolean) => void; label: string; description: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-5 rounded-xl border border-slate-200 p-4">
      <span>
        <strong className="block text-sm text-slate-700">{label}</strong>
        <span className="mt-1 block text-xs leading-5 text-slate-400">{description}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-sky-600" />
    </label>
  );
}

function Notifications({ settings, setSettings }: PanelProps) {
  const update = (patch: Partial<SiteSettings["notifications"]>) =>
    setSettings((current) => ({ ...current, notifications: { ...current.notifications, ...patch } }));
  const [testRecipient, setTestRecipient] = useState(settings.notifications.recipients[0] ?? "");
  const [testMessage, setTestMessage] = useState("");
  async function sendTest() {
    setTestMessage("Gönderiliyor…");
    const response = await fetch("/api/ayarlar/test-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ recipient: testRecipient }),
    });
    const body = await readJson(response);
    setTestMessage(
      response.ok
        ? "Test e-postası gönderildi."
        : (body.error ?? "Test gönderilemedi."),
    );
  }
  return (
    <>
      <Switch checked={settings.notifications.enabled} onChange={(enabled) => update({ enabled })} label="E-posta bildirimleri" description="Tüm operasyon bildirimleri için ana anahtar." />
      <Field
        label="Alıcılar"
        value={settings.notifications.recipients.join(", ")}
        placeholder="operasyon@example.com, destek@example.com"
        onChange={(value) => update({ recipients: value.split(",").map((item) => item.trim()).filter(Boolean) })}
      />
      <p className="-mt-3 text-xs text-slate-400">Birden fazla adresi virgülle ayırın. Bu alan public API’ye hiçbir zaman gönderilmez.</p>
      <div className="grid gap-3 md:grid-cols-3">
        <Switch checked={settings.notifications.talepEnabled} onChange={(talepEnabled) => update({ talepEnabled })} label="Yeni talepler" description="Teklif ve callback talepleri." />
        <Switch checked={settings.notifications.iptalEnabled} onChange={(iptalEnabled) => update({ iptalEnabled })} label="İptal talepleri" description="Poliçe iptal başvuruları." />
        <Switch checked={settings.notifications.iletisimEnabled} onChange={(iletisimEnabled) => update({ iletisimEnabled })} label="İletişim" description="İletişim formu mesajları." />
      </div>
      <div className="rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-700">Gönderimi test et</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input value={testRecipient} onChange={(event) => setTestRecipient(event.target.value)} className="min-w-64 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm" />
          <button type="button" onClick={() => void sendTest()} className="rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700">Test gönder</button>
        </div>
        {testMessage && <p className="mt-2 text-xs text-slate-500">{testMessage}</p>}
      </div>
    </>
  );
}

type PanelProps = {
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
};

function Analytics({ settings, setSettings }: PanelProps) {
  const update = (patch: Partial<SiteSettings["analytics"]>) =>
    setSettings((current) => ({ ...current, analytics: { ...current.analytics, ...patch } }));
  return (
    <>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Sağlayıcı</span>
        <select
          value={settings.analytics.provider}
          onChange={(event) => update({
            provider: event.target.value as SiteSettings["analytics"]["provider"],
            ga4MeasurementId: event.target.value === "ga4" ? settings.analytics.ga4MeasurementId : "",
            gtmContainerId: event.target.value === "gtm" ? settings.analytics.gtmContainerId : "",
          })}
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
        >
          <option value="none">Kapalı</option><option value="ga4">Google Analytics 4</option><option value="gtm">Google Tag Manager</option>
        </select>
      </label>
      {settings.analytics.provider === "ga4" && <Field label="GA4 ölçüm kimliği" value={settings.analytics.ga4MeasurementId} placeholder="G-XXXXXXXXXX" onChange={(ga4MeasurementId) => update({ ga4MeasurementId })} />}
      {settings.analytics.provider === "gtm" && <Field label="GTM kapsayıcı kimliği" value={settings.analytics.gtmContainerId} placeholder="GTM-XXXXXXX" onChange={(gtmContainerId) => update({ gtmContainerId })} />}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">GA4 ve GTM birbirini dışlar. Public uygulama, zorunlu olmayan analitik kodunu yalnızca çerez onayıyla yüklemelidir.</div>
    </>
  );
}

function Company({ settings, setSettings }: PanelProps) {
  const update = (key: keyof SiteSettings["company"], value: string) =>
    setSettings((current) => ({ ...current, company: { ...current.company, [key]: value } }));
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Ticari unvan" value={settings.company.legalName} onChange={(v) => update("legalName", v)} />
      <Field label="Marka adı" value={settings.company.brandName} onChange={(v) => update("brandName", v)} />
      <Field label="E-posta" type="email" value={settings.company.email} onChange={(v) => update("email", v)} />
      <Field label="Telefon (E.164)" value={settings.company.phone} onChange={(v) => update("phone", v)} />
      <Field label="Görünen telefon" value={settings.company.phoneDisplay} onChange={(v) => update("phoneDisplay", v)} />
      <Field label="KEP" value={settings.company.kep} onChange={(v) => update("kep", v)} />
      <Field label="Vergi dairesi" value={settings.company.taxOffice} onChange={(v) => update("taxOffice", v)} />
      <Field label="Vergi numarası" value={settings.company.taxNumber} onChange={(v) => update("taxNumber", v)} />
      <Field label="MERSİS numarası" value={settings.company.mersisNumber} onChange={(v) => update("mersisNumber", v)} />
      <div className="md:col-span-2"><Field label="Adres" value={settings.company.address} onChange={(v) => update("address", v)} /></div>
    </div>
  );
}

function Products({ settings, setSettings }: PanelProps) {
  const enabled = new Set(settings.products.enabledSlugs);
  function toggle(slug: string) {
    const next = new Set(enabled);
    if (next.has(slug)) next.delete(slug); else next.add(slug);
    setSettings((current) => ({ ...current, products: { enabledSlugs: [...next] } }));
  }
  const maintenance = (patch: Partial<SiteSettings["maintenance"]>) =>
    setSettings((current) => ({ ...current, maintenance: { ...current.maintenance, ...patch } }));
  return (
    <>
      <div className="grid gap-2 sm:grid-cols-2">
        {ALL_PRODUCT_SLUGS.map((slug) => (
          <label key={slug} className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" checked={enabled.has(slug)} onChange={() => toggle(slug)} className="h-4 w-4 accent-sky-600" />
            {PRODUCT_NAMES[slug]}
          </label>
        ))}
      </div>
      <div className="border-t border-slate-100 pt-5">
        <Switch checked={settings.maintenance.enabled} onChange={(value) => maintenance({ enabled: value })} label="Bakım modu" description="Yasal sayfalar ve iletişim açık kalır; diğer sayfalarda bakım mesajı gösterilir." />
        <div className="mt-4 grid gap-4">
          <Field label="Bakım başlığı" value={settings.maintenance.title} onChange={(title) => maintenance({ title })} />
          <Field label="Bakım mesajı" value={settings.maintenance.message} onChange={(message) => maintenance({ message })} />
        </div>
      </div>
    </>
  );
}

/**
 * Sürüm içeriği veritabanında JSON tutulur; panelde düz metin olarak düzenlenir.
 * Paragraflar boş satırla, madde listeleri satır sonuyla ayrılır.
 */
type SectionDraft = {
  heading: string;
  paragraphs: string;
  items: string;
  closing: string;
};

type ContentDraft = {
  h1: string;
  eyebrow: string;
  updatedAt: string;
  summary: string;
  intro: string;
  sections: SectionDraft[];
  /** Formda karşılığı olmayan alanlar kaydederken kaybolmasın. */
  extra: Record<string, unknown>;
};

const EMPTY_SECTION: SectionDraft = { heading: "", paragraphs: "", items: "", closing: "" };

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asParagraphText(value: unknown) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string").join("\n\n") : "";
}

function asLineText(value: unknown) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string").join("\n") : "";
}

/** Boş satırla ayrılmış metni paragraf listesine çevirir; paragraf içi satır sonu boşluk olur. */
function toParagraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((block) => block.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

function toLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function toDraft(content: unknown): ContentDraft {
  const raw = (content && typeof content === "object" ? content : {}) as Record<string, unknown>;
  const { h1, eyebrow, updatedAt, summary, intro, sections, ...extra } = raw;
  return {
    h1: asText(h1),
    eyebrow: asText(eyebrow),
    updatedAt: asText(updatedAt),
    summary: asText(summary),
    intro: asParagraphText(intro),
    sections: (Array.isArray(sections) ? sections : []).map((section) => {
      const item = (section && typeof section === "object" ? section : {}) as Record<string, unknown>;
      return {
        heading: asText(item.heading),
        paragraphs: asParagraphText(item.paragraphs),
        items: asLineText(item.items),
        closing: asParagraphText(item.closing),
      };
    }),
    extra,
  };
}

function toContent(draft: ContentDraft) {
  return {
    ...draft.extra,
    h1: draft.h1.trim(),
    eyebrow: draft.eyebrow.trim(),
    updatedAt: draft.updatedAt.trim(),
    summary: draft.summary.trim(),
    intro: toParagraphs(draft.intro),
    sections: draft.sections
      .filter((section) => Object.values(section).some((value) => value.trim()))
      .map((section) => {
        const paragraphs = toParagraphs(section.paragraphs);
        const items = toLines(section.items);
        const closing = toParagraphs(section.closing);
        return {
          heading: section.heading.trim(),
          ...(paragraphs.length ? { paragraphs } : {}),
          ...(items.length ? { items } : {}),
          ...(closing.length ? { closing } : {}),
        };
      }),
  };
}

function Legal({ documents, reload }: { documents: LegalDocument[]; reload: () => Promise<void> }) {
  const [selectedId, setSelectedId] = useState(documents[0]?.id ?? "");
  const selected = documents.find((item) => item.id === selectedId) ?? documents[0];
  const latest = selected?.versions.slice().sort((a, b) => b.version - a.version)[0];
  const latestContent = JSON.stringify(latest?.content ?? {});
  const [draft, setDraft] = useState<ContentDraft>(() => toDraft(latest?.content));
  const [status, setStatus] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newDocument, setNewDocument] = useState({
    slug: "",
    locale: "tr" as LegalLocale,
    title: "",
    description: "",
  });
  // Sürüm kimliği değişmeden içerik güncellenebildiği için (yerinde güncelleme)
  // form içeriğin kendisine bağlanır.
  useEffect(() => setDraft(toDraft(JSON.parse(latestContent))), [latestContent]);

  const updateSection = (index: number, patch: Partial<SectionDraft>) =>
    setDraft((current) => ({
      ...current,
      sections: current.sections.map((section, position) =>
        position === index ? { ...section, ...patch } : section,
      ),
    }));

  const moveSection = (index: number, delta: number) =>
    setDraft((current) => {
      const target = index + delta;
      if (target < 0 || target >= current.sections.length) return current;
      const sections = [...current.sections];
      [sections[index], sections[target]] = [sections[target], sections[index]];
      return { ...current, sections };
    });

  async function createDocument() {
    const response = await fetch("/api/ayarlar/yasal", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...newDocument,
        content: { intro: [], sections: [] },
      }),
    });
    const body = await readJson<{ id: string }>(response);
    setStatus(
      response.ok
        ? "Yeni belge taslağı oluşturuldu."
        : (body.error ?? "Belge oluşturulamadı."),
    );
    if (response.ok) {
      setShowCreate(false);
      setNewDocument({ slug: "", locale: "tr", title: "", description: "" });
      await reload();
      if (body.id) setSelectedId(body.id);
    }
  }

  async function deleteDocument() {
    if (!selected || !window.confirm(`“${selected.title}” ve tüm sürümleri silinsin mi?`)) return;
    const response = await fetch(`/api/ayarlar/yasal?id=${encodeURIComponent(selected.id)}`, {
      method: "DELETE",
    });
    const body = await readJson(response);
    setStatus(response.ok ? "Belge silindi." : (body.error ?? "Belge silinemedi."));
    if (response.ok) {
      setSelectedId("");
      await reload();
    }
  }

  async function action(nextStatus: "draft" | "published" | "unpublished") {
    if (!selected) return;
    try {
      const response = await fetch("/api/ayarlar/yasal", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          documentId: selected.id,
          versionId: latest?.id,
          status: nextStatus,
          content: toContent(draft),
        }),
      });
      const body = await readJson(response);
      setStatus(
        response.ok
          ? "Belge sürümü güncellendi."
          : (body.error ?? "Sürüm güncellenemedi."),
      );
      if (response.ok) await reload();
    } catch {
      setStatus("Sunucuya ulaşılamadı. Bağlantıyı kontrol edin.");
    }
  }
  return (
    <>
      <div className="flex items-center gap-2">
        <div className="flex flex-1 flex-wrap gap-2">
          {documents.map((doc) => (
            <button key={doc.id} type="button" onClick={() => setSelectedId(doc.id)} className={`rounded-xl border px-3 py-2 text-sm ${selected?.id === doc.id ? "border-sky-300 bg-sky-50 text-sky-700" : "border-slate-200 text-slate-600"}`}>
              {doc.title} · {doc.locale.toUpperCase()}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setShowCreate((value) => !value)} className="shrink-0 rounded-xl bg-sky-600 px-3.5 py-2 text-sm font-semibold text-white">
          Yeni belge
        </button>
      </div>
      {showCreate && (
        <div className="grid gap-3 rounded-xl border border-sky-100 bg-sky-50/50 p-4 md:grid-cols-2">
          <Field label="Slug" value={newDocument.slug} placeholder="acik-riza-metni" onChange={(slug) => setNewDocument((current) => ({ ...current, slug }))} />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Dil</span>
            <select value={newDocument.locale} onChange={(event) => setNewDocument((current) => ({ ...current, locale: event.target.value as LegalLocale }))} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm">
              <option value="tr">Türkçe</option><option value="en">English</option><option value="ar">العربية</option><option value="fa">فارسی</option>
            </select>
          </label>
          <Field label="Başlık" value={newDocument.title} onChange={(title) => setNewDocument((current) => ({ ...current, title }))} />
          <Field label="Açıklama" value={newDocument.description} onChange={(description) => setNewDocument((current) => ({ ...current, description }))} />
          <button type="button" onClick={() => void createDocument()} className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white md:col-span-2">Taslak oluştur</button>
        </div>
      )}
      {!selected ? <p className="text-sm text-slate-500">Önce schema_settings.sql dosyasını çalıştırın veya yeni belge oluşturun.</p> : (
        <>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
            <div><p className="text-sm font-semibold text-slate-700">{selected.title}</p><p className="text-xs text-slate-400">/{selected.slug} · Sürüm {latest?.version ?? 0} · {latest?.status ?? "—"}</p></div>
            <span className="ml-auto rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500">{selected.locale.toUpperCase()}</span>
            <button type="button" onClick={() => void deleteDocument()} className="text-xs font-semibold text-red-500">Sil</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Sayfa başlığı" value={draft.h1} onChange={(h1) => setDraft((current) => ({ ...current, h1 }))} />
            <Field label="Üst etiket" value={draft.eyebrow} placeholder="Yasal metinler" onChange={(eyebrow) => setDraft((current) => ({ ...current, eyebrow }))} />
            <Field label="Güncellenme tarihi" value={draft.updatedAt} placeholder="11 Eylül 2026" onChange={(updatedAt) => setDraft((current) => ({ ...current, updatedAt }))} />
          </div>
          <TextArea
            label="Özet"
            value={draft.summary}
            rows={3}
            hint="Arama sonuçlarında ve sayfa girişinde görünen kısa açıklama."
            onChange={(summary) => setDraft((current) => ({ ...current, summary }))}
          />
          <TextArea
            label="Giriş paragrafları"
            value={draft.intro}
            rows={4}
            hint="Bölümlerden önce gösterilir. Paragrafları boş satırla ayırın. Boş bırakabilirsiniz."
            onChange={(intro) => setDraft((current) => ({ ...current, intro }))}
          />

          <div className="space-y-4 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-slate-700">Bölümler</p>
              <span className="text-xs text-slate-400">{draft.sections.length} bölüm</span>
              <button
                type="button"
                onClick={() => setDraft((current) => ({ ...current, sections: [...current.sections, EMPTY_SECTION] }))}
                className="ml-auto rounded-xl border border-sky-200 px-3.5 py-2 text-sm font-semibold text-sky-700"
              >
                Bölüm ekle
              </button>
            </div>

            {draft.sections.map((section, index) => (
              <div key={index} className="space-y-3 rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">{index + 1}. bölüm</span>
                  <button type="button" onClick={() => moveSection(index, -1)} disabled={index === 0} className="ml-auto text-xs font-semibold text-slate-500 disabled:opacity-30">Yukarı</button>
                  <button type="button" onClick={() => moveSection(index, 1)} disabled={index === draft.sections.length - 1} className="text-xs font-semibold text-slate-500 disabled:opacity-30">Aşağı</button>
                  <button
                    type="button"
                    onClick={() => setDraft((current) => ({ ...current, sections: current.sections.filter((_, position) => position !== index) }))}
                    className="text-xs font-semibold text-red-500"
                  >
                    Sil
                  </button>
                </div>
                <Field label="Başlık" value={section.heading} onChange={(heading) => updateSection(index, { heading })} />
                <TextArea
                  label="Paragraflar"
                  value={section.paragraphs}
                  rows={6}
                  hint="Paragrafları boş satırla ayırın."
                  onChange={(paragraphs) => updateSection(index, { paragraphs })}
                />
                <TextArea
                  label="Madde listesi"
                  value={section.items}
                  rows={4}
                  hint="Her satır bir madde olarak listelenir. Gerekmiyorsa boş bırakın."
                  onChange={(items) => updateSection(index, { items })}
                />
                {(section.items.trim() || section.closing.trim()) && (
                  <TextArea
                    label="Madde sonrası paragraflar"
                    value={section.closing}
                    rows={3}
                    hint="Madde listesinin altında gösterilir."
                    onChange={(closing) => updateSection(index, { closing })}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void action("draft")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Yeni taslak sürüm</button>
            <button type="button" onClick={() => void action("published")} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Yayımla</button>
            <button type="button" onClick={() => void action("unpublished")} className="rounded-xl border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700">Yayından kaldır</button>
          </div>
          {status && <p className="text-sm text-slate-500">{status}</p>}
          <p className="text-xs leading-5 text-slate-400">Her dil bağımsız bir belge ve sürüm geçmişi olarak tutulur. Yayımlama aynı belgenin önceki yayımlanmış sürümünü otomatik olarak yayından kaldırır.</p>
        </>
      )}
    </>
  );
}
