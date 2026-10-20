"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BLOG_CATEGORIES,
  BLOG_STATUS_LABEL,
  siteAsset,
  sitePostUrl,
  slugify,
  type BlogPost,
  type BlogPostInput,
  type BlogStatus,
} from "@/lib/blog/shared";
import RichEditor from "./RichEditor";

const EMPTY: BlogPostInput = {
  slug: "",
  title: "",
  category: null,
  status: "DRAFT",
  featured_image: null,
  content: "",
  excerpt: null,
  meta_title: null,
  meta_description: null,
};

const input =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:ring-3 focus:ring-sky-100";
const label = "mb-1.5 block text-sm font-medium text-slate-700";
const card = "rounded-2xl border border-slate-200 bg-white p-5";
const ghostButton =
  "rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50";

function pick(post: BlogPost): BlogPostInput {
  return {
    slug: post.slug,
    title: post.title,
    category: post.category,
    status: post.status,
    featured_image: post.featured_image,
    content: post.content ?? "",
    excerpt: post.excerpt,
    meta_title: post.meta_title,
    meta_description: post.meta_description,
  };
}

export default function BlogEditor({ id }: { id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<BlogPostInput | null>(id ? null : EMPTY);
  const [saved, setSaved] = useState<BlogPostInput | null>(id ? null : EMPTY);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const response = await fetch(`/api/blog/${id}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setMessage({ type: "error", text: data.error ?? "Yazı alınamadı." });
        return;
      }
      const loaded = pick(data.post);
      setForm(loaded);
      setSaved(loaded);
      setPublishedAt(data.post.published_at);
    })();
  }, [id]);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!form) {
    return message ? (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{message.text}</p>
    ) : (
      <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />
    );
  }

  const update = (patch: Partial<BlogPostInput>) => setForm((current) => (current ? { ...current, ...patch } : current));

  async function save(status: BlogStatus) {
    if (!form) return;
    setSaving(true);
    setMessage(null);
    const body = { ...form, status };
    const response = await fetch(id ? `/api/blog/${id}` : "/api/blog", {
      method: id ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setMessage({ type: "error", text: data.error ?? "Kaydedilemedi." });
      return;
    }
    setForm(body);
    setSaved(body);
    if (status === "PUBLISHED" && !publishedAt) setPublishedAt(new Date().toISOString());
    setMessage({
      type: "ok",
      text: status === "PUBLISHED" ? "Yazı yayında." : "Taslak kaydedildi.",
    });
    if (!id) router.replace(`/blog/${data.id}`);
  }

  async function remove() {
    if (!id || !form) return;
    if (!window.confirm(`"${form.title}" kalıcı olarak silinsin mi?`)) return;
    const response = await fetch(`/api/blog/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setMessage({ type: "error", text: data.error ?? "Silinemedi." });
      return;
    }
    setSaved(form);
    router.push("/blog");
  }

  const published = saved?.status === "PUBLISHED";
  const categories = form.category && !(BLOG_CATEGORIES as readonly string[]).includes(form.category)
    ? [...BLOG_CATEGORIES, form.category]
    : BLOG_CATEGORIES;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <div className={`${card} space-y-4`}>
          <label className="block">
            <span className={label}>Başlık</span>
            <input
              value={form.title}
              onChange={(event) => {
                const title = event.target.value;
                update(slugTouched ? { title } : { title, slug: slugify(title) });
              }}
              placeholder="Örn. Kasko hasarsızlık indirimi nasıl korunur?"
              className={`${input} text-base font-semibold`}
            />
          </label>
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
            <label className="block">
              <span className={label}>Adres</span>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 pl-3.5 text-sm text-slate-400 focus-within:border-sky-400 focus-within:ring-3 focus-within:ring-sky-100">
                /blog/
                <input
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    update({ slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") });
                  }}
                  onBlur={() => update({ slug: slugify(form.slug) })}
                  className="w-full rounded-r-xl bg-white px-1.5 py-2.5 text-slate-800 outline-none"
                />
              </div>
              {published && saved && form.slug !== saved.slug && (
                <span className="mt-1 block text-xs text-amber-600">
                  Yayındaki yazının adresi değişirse eski bağlantılar çalışmaz.
                </span>
              )}
            </label>
            <label className="block">
              <span className={label}>Kategori</span>
              <select
                value={form.category ?? ""}
                onChange={(event) => update({ category: event.target.value || null })}
                className={input}
              >
                <option value="">Kategori seçin</option>
                {categories.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className={label}>
              Kısa özet
              <span className="ml-2 text-xs font-normal text-slate-400">
                Listede ve paylaşımlarda görünür. Boş bırakılırsa içerikten alınır. ({form.excerpt?.length ?? 0}/400)
              </span>
            </span>
            <textarea
              value={form.excerpt ?? ""}
              onChange={(event) => update({ excerpt: event.target.value || null })}
              rows={2}
              maxLength={400}
              className={`${input} leading-6`}
            />
          </label>
        </div>

        <div>
          <span className={label}>İçerik</span>
          <RichEditor
            key={id ?? "yeni"}
            value={form.content}
            onChange={(content) => update({ content })}
          />
        </div>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
        <div className={`${card} space-y-4`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">Yayın</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                published
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-amber-50 text-amber-700 ring-amber-200"
              }`}
            >
              {saved ? BLOG_STATUS_LABEL[saved.status] : "Taslak"}
            </span>
          </div>
          {dirty && <p className="text-xs text-amber-600">Kaydedilmemiş değişiklikler var.</p>}
          {message && (
            <p className={`text-sm ${message.type === "ok" ? "text-emerald-600" : "text-red-600"}`}>{message.text}</p>
          )}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => save("PUBLISHED")}
              className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-50"
            >
              {saving ? "Kaydediliyor…" : published ? "Güncelle" : "Yayınla"}
            </button>
            <button type="button" disabled={saving} onClick={() => save("DRAFT")} className={ghostButton}>
              {published ? "Yayından kaldır (taslağa al)" : "Taslak olarak kaydet"}
            </button>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
            {id && published && saved ? (
              <a href={sitePostUrl(saved.slug)} target="_blank" rel="noreferrer" className="font-semibold text-sky-700 hover:underline">
                Sitede gör ↗
              </a>
            ) : (
              <Link href="/blog" className="font-semibold text-slate-500 hover:underline">
                ← Listeye dön
              </Link>
            )}
            {id && (
              <button type="button" onClick={remove} className="font-semibold text-red-500 hover:underline">
                Yazıyı sil
              </button>
            )}
          </div>
        </div>

        <CoverCard
          value={form.featured_image}
          title={form.title}
          content={form.content}
          category={form.category}
          onChange={(featured_image) => update({ featured_image })}
        />

        <details className={card}>
          <summary className="cursor-pointer text-sm font-semibold text-slate-800">SEO (isteğe bağlı)</summary>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className={label}>SEO başlığı</span>
              <input
                value={form.meta_title ?? ""}
                onChange={(event) => update({ meta_title: event.target.value || null })}
                placeholder={form.title}
                maxLength={120}
                className={input}
              />
            </label>
            <label className="block">
              <span className={label}>SEO açıklaması ({form.meta_description?.length ?? 0}/160)</span>
              <textarea
                value={form.meta_description ?? ""}
                onChange={(event) => update({ meta_description: event.target.value || null })}
                rows={3}
                maxLength={300}
                className={`${input} leading-6`}
              />
            </label>
          </div>
        </details>
      </aside>
    </div>
  );
}

function CoverCard({
  value,
  title,
  content,
  category,
  onChange,
}: {
  value: string | null;
  title: string;
  content: string;
  category: string | null;
  onChange: (src: string | null) => void;
}) {
  const [candidate, setCandidate] = useState<string | null>(null);
  const [busy, setBusy] = useState<"generate" | "upload" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const attempt = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);

  async function generate() {
    setBusy("generate");
    setError(null);
    const response = await fetch("/api/blog/kapak", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, content, category, attempt: attempt.current }),
    });
    const data = await response.json();
    setBusy(null);
    attempt.current += 1;
    if (!response.ok) {
      setError(data.error ?? "Kapak oluşturulamadı.");
      return;
    }
    setCandidate(data.src);
  }

  async function upload(file: File) {
    setBusy("upload");
    setError(null);
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/blog/kapak", { method: "POST", body: form });
    const data = await response.json();
    setBusy(null);
    if (!response.ok) {
      setError(data.error ?? "Görsel yüklenemedi.");
      return;
    }
    setCandidate(data.src);
  }

  const shown = candidate ?? value;

  return (
    <div className={`${card} space-y-3`}>
      <span className="text-sm font-semibold text-slate-800">Kapak görseli</span>

      <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-100">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={siteAsset(shown) ?? ""} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center px-6 text-center text-xs text-slate-400">
            Kapak yok. Başlık ve içerikten üretebilir ya da kendi görselinizi yükleyebilirsiniz.
          </span>
        )}
        {candidate && (
          <span className="absolute left-2 top-2 rounded-full bg-slate-900/75 px-2.5 py-1 text-[11px] font-semibold text-white">
            Önizleme
          </span>
        )}
        {busy === "generate" && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 text-xs font-semibold text-slate-600">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
            Görsel üretiliyor, 20–40 sn sürebilir…
          </span>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {candidate ? (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => {
              onChange(candidate);
              setCandidate(null);
            }}
            className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Kullan
          </button>
          <button type="button" disabled={busy !== null} onClick={generate} className={ghostButton}>
            Yeniden üret
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => setCandidate(null)}
            className="col-span-2 text-xs font-semibold text-slate-500 hover:underline disabled:opacity-50"
          >
            Vazgeç, {value ? "mevcut kapakta kal" : "kapaksız kalsın"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={busy !== null}
            onClick={generate}
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {value ? "Yeni kapak üret" : "Kapak üret"}
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => fileRef.current?.click()}
            className={ghostButton}
          >
            {busy === "upload" ? "Yükleniyor…" : "Görsel yükle"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="col-span-2 text-xs font-semibold text-red-500 hover:underline"
            >
              Kapağı kaldır
            </button>
          )}
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void upload(file);
        }}
      />
      <p className="text-xs leading-5 text-slate-400">
        Üretim başlık, kategori ve içerik metninden yapılır; görsel başına yaklaşık 0,13 $. Seçilen kapak
        yazıyı kaydedince yayına girer.
      </p>
    </div>
  );
}
