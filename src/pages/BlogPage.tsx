import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BlogPageClient from "../components/blog/BlogPageClient";
import type { BlogSort } from "../components/blog/BlogFilterBar";
import { fetchBlogCards, type BlogCard } from "../lib/blog/api";
import { applyDocumentMeta } from "../lib/blog/meta";
import "../styles/blog.css";
import "../styles/blog-tokens.css";

const PAGE_TITLE = "Blog | Sigorta Uzmanı";
const PAGE_DESCRIPTION =
  "Sigorta ürünleri, teminatlar ve poliçe süreçleri üzerine uygulamaya dönük yazılar.";

export default function BlogPage() {
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      applyDocumentMeta({
        title: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        url: `${window.location.origin}/blog`,
        image: `${window.location.origin}/api/og`,
      }),
    [],
  );

  useEffect(() => {
    let active = true;
    fetchBlogCards().then((data) => {
      if (!active) return;
      setPosts(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

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
        <span className="blog-masthead__eyebrow">Sigorta Uzmanı Blog</span>
        <h1 className="blog-masthead__title">Sigorta, teminat ve poliçe rehberi</h1>
        <p className="blog-masthead__description">
          Trafik, kasko, sağlık ve konut sigortalarında doğru kararı vermenizi
          sağlayacak uygulamaya dönük yazılar.
        </p>
      </header>

      {loading ? (
        <div className="page-loader" role="status" aria-label="Yazılar yükleniyor">
          <span className="page-loader__spinner" />
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
