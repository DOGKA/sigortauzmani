"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BLOG_CATEGORIES,
  BLOG_STATUS_LABEL,
  coverThumb,
  sitePostUrl,
  type BlogListItem,
  type BlogStatus,
} from "@/lib/blog/shared";

const STATUS_STYLE: Record<BlogStatus, string> = {
  PUBLISHED: "text-slate-400",
  DRAFT: "text-amber-600",
  ARCHIVED: "text-slate-400",
};

const FILTERS: { value: BlogStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tümü" },
  { value: "PUBLISHED", label: "Yayında" },
  { value: "DRAFT", label: "Taslak" },
  { value: "ARCHIVED", label: "Arşiv" },
];

const DATE = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" });

const SELECT_CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2394a3b8' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")";

function fold(value: string): string {
  return value.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function fetchPosts(): Promise<{ posts: BlogListItem[] } | { error: string }> {
  const response = await fetch("/api/blog", { cache: "no-store" });
  const data = await response.json();
  return response.ok ? { posts: data.posts } : { error: data.error ?? "Yazılar alınamadı." };
}

export default function BlogListe() {
  const [posts, setPosts] = useState<BlogListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<BlogStatus | "ALL">("ALL");
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const apply = useCallback((result: Awaited<ReturnType<typeof fetchPosts>>) => {
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setPosts(result.posts);
    setError(null);
  }, []);

  const load = useCallback(async () => apply(await fetchPosts()), [apply]);

  useEffect(() => {
    let active = true;
    fetchPosts().then((result) => {
      if (active) apply(result);
    });
    return () => {
      active = false;
    };
  }, [apply]);

  const counts = useMemo(() => {
    const result: Record<string, number> = { ALL: posts?.length ?? 0 };
    for (const post of posts ?? []) result[post.status] = (result[post.status] ?? 0) + 1;
    return result;
  }, [posts]);

  const visible = useMemo(() => {
    const needle = fold(query.trim());
    return (posts ?? []).filter(
      (post) =>
        (filter === "ALL" || post.status === filter) &&
        (!category || post.category === category) &&
        (!needle || fold(post.title).includes(needle) || post.slug.includes(needle)),
    );
  }, [posts, filter, category, query]);

  async function setStatus(post: BlogListItem, status: BlogStatus) {
    setBusy(post.id);
    const response = await fetch(`/api/blog/${post.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    setBusy(null);
    if (!response.ok) {
      setError(data.error ?? "Durum değiştirilemedi.");
      return;
    }
    await load();
  }

  async function remove(post: BlogListItem) {
    if (!window.confirm(`"${post.title}" kalıcı olarak silinsin mi?`)) return;
    setBusy(post.id);
    const response = await fetch(`/api/blog/${post.id}`, { method: "DELETE" });
    const data = await response.json();
    setBusy(null);
    if (!response.ok) {
      setError(data.error ?? "Yazı silinemedi.");
      return;
    }
    setPosts((current) => current?.filter((item) => item.id !== post.id) ?? null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-slate-200 bg-white p-1">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === item.value ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {item.label}
              <span className={`ml-1.5 text-xs ${filter === item.value ? "text-white/70" : "text-slate-400"}`}>
                {counts[item.value] ?? 0}
              </span>
            </button>
          ))}
        </div>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="appearance-none rounded-xl border border-slate-200 bg-white bg-[length:16px_16px] bg-[position:right_14px_center] bg-no-repeat py-2.5 pl-3.5 pr-11 text-sm"
          style={{ backgroundImage: SELECT_CHEVRON }}
        >
          <option value="">Tüm kategoriler</option>
          {BLOG_CATEGORIES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Başlıkta ara…"
          className="min-w-56 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-sky-400 focus:ring-3 focus:ring-sky-100"
        />
        <Link
          href="/blog/yeni"
          className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
        >
          + Yeni yazı
        </Link>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {posts === null ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">Bu filtreye uyan yazı yok.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {visible.map((post) => {
              const thumb = coverThumb(post.featured_image);
              const date = post.published_at ?? post.updated_at;
              return (
                <li key={post.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60">
                  <Link href={`/blog/${post.id}`} className="shrink-0">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" className="h-14 w-24 rounded-lg object-cover" loading="lazy" />
                    ) : (
                      <span className="flex h-14 w-24 items-center justify-center rounded-lg bg-slate-100 text-[11px] text-slate-400">
                        Kapak yok
                      </span>
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/blog/${post.id}`}
                      className="line-clamp-1 text-sm font-semibold text-slate-800 hover:text-sky-700"
                    >
                      {post.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <span className={STATUS_STYLE[post.status]}>
                        {BLOG_STATUS_LABEL[post.status]}
                      </span>
                      {post.category && <span>{post.category}</span>}
                      {date && <span>{DATE.format(new Date(date))}</span>}
                      <span>{post.view_count.toLocaleString("tr-TR")} görüntülenme</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {post.status === "PUBLISHED" ? (
                      <>
                        <a
                          href={sitePostUrl(post.slug)}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Sitede gör
                        </a>
                        <button
                          type="button"
                          disabled={busy === post.id}
                          onClick={() => setStatus(post, "DRAFT")}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Yayından kaldır
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={busy === post.id}
                        onClick={() => setStatus(post, "PUBLISHED")}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Yayınla
                      </button>
                    )}
                    <Link
                      href={`/blog/${post.id}`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Düzenle
                    </Link>
                    <button
                      type="button"
                      disabled={busy === post.id}
                      onClick={() => remove(post)}
                      className="rounded-lg px-2 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
                    >
                      Sil
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
