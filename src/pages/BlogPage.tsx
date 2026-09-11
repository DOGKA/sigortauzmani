import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BlogIndexSkeleton from "../components/blog/BlogIndexSkeleton";
import BlogPageClient from "../components/blog/BlogPageClient";
import type { BlogSort } from "../components/blog/BlogFilterBar";
import { fetchBlogCards, type BlogCard } from "../lib/blog/api";
import { blogListNode } from "../lib/seo/nodes/blog";
import { useStaticPageSeo } from "../lib/seo/useStaticPageSeo";
import { useLocale } from "../lib/i18n/context";
import TurkishContentNotice from "../components/TurkishContentNotice";
import "../styles/blog.css";
import "../styles/blog-tokens.css";

export default function BlogPage() {
  const { href } = useLocale();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBlogCards();
      setPosts(data);
    } catch {
      setError("Yazılar yüklenemedi, yeniden deneyin.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  // Liste yüklendikçe ItemList düğümü de güncellenir; yazılar gelmeden
  // yalnızca temel sayfa grafiği yayınlanır.
  useStaticPageSeo(href("blog"), {
    extra: posts.length ? [blogListNode(posts)] : undefined,
  });

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((post) => {
      if (post.category) counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [posts]);

  const rawCat = searchParams.get("cat");
  const initialCategory =
    rawCat && categories.some((category) => category.name === rawCat) ? rawCat : null;
  const initialQuery = (searchParams.get("q") ?? "").slice(0, 80);
  const initialSort: BlogSort = searchParams.get("sort") === "popular" ? "popular" : "recent";
  const parsedPage = Number.parseInt(searchParams.get("page") ?? "", 10);
  const initialPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  return (
    <main className="blog-shell">
      <header className="blog-masthead">
        <TurkishContentNotice />
        <span className="blog-masthead__eyebrow">Sigorta Uzmanı Blog</span>
        <h1 className="blog-masthead__title">Sigorta, teminat ve poliçe rehberi</h1>
        <p className="blog-masthead__description">
          Trafik, kasko, sağlık ve konut sigortalarında doğru kararı vermenizi
          sağlayacak uygulamaya dönük yazılar.
        </p>
      </header>

      {loading ? (
        <BlogIndexSkeleton />
      ) : error ? (
        <div className="blog-empty blog-empty--error" role="alert">
          <h2 className="blog-empty__title">{error}</h2>
          <button type="button" className="blog-empty__reset" onClick={() => void loadPosts()}>
            Yeniden dene
          </button>
        </div>
      ) : (
        <BlogPageClient
          posts={posts}
          categories={categories}
          initialCategory={initialCategory}
          initialQuery={initialQuery}
          initialSort={initialSort}
          initialPage={initialPage}
        />
      )}
    </main>
  );
}
