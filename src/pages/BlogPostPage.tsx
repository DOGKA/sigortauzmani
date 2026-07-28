import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BlogHeader from "../components/blog/BlogHeader";
import BlogContent from "../components/blog/BlogContent";
import BlogShare from "../components/blog/BlogShare";
import BlogToc from "../components/blog/BlogToc";
import BlogReadingProgress from "../components/blog/BlogReadingProgress";
import BlogPostNav from "../components/blog/BlogPostNav";
import BlogPostRow from "../components/blog/BlogPostRow";
import BlogPopularList from "../components/blog/BlogPopularList";
import {
  fetchBlogCards,
  fetchBlogPost,
  trackBlogView,
  type BlogCard,
  type BlogPostDetail,
} from "../lib/blog/api";
import {
  calculateReadingTime,
  createExcerpt,
  prepareBlogContent,
} from "../lib/blog/content";
import { applyDocumentMeta, blogOgImageUrl } from "../lib/blog/meta";
import "../styles/blog.css";
import "../styles/blog-tokens.css";

const RELATED_LIMIT = 3;

export default function BlogPostPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [cards, setCards] = useState<BlogCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([fetchBlogPost(slug), fetchBlogCards()]).then(([detail, list]) => {
      if (!active) return;
      setPost(detail);
      setCards(list);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [slug]);

  // Sayaç anon anahtarla güncellenemediği için RPC üzerinden artırılır.
  useEffect(() => {
    if (!post) return;
    void trackBlogView(post.slug);
  }, [post]);

  useEffect(() => {
    if (!post) return;
    return applyDocumentMeta({
      title: `${post.title} | Sigorta Uzmanı`,
      description: post.excerpt ?? createExcerpt(post.content, 155),
      url: `${window.location.origin}/blog/${post.slug}`,
      image: blogOgImageUrl(post.slug),
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    });
  }, [post]);

  const prepared = useMemo(
    () =>
      post ? prepareBlogContent(post.content, post.title) : { html: "", headings: [] },
    [post],
  );

  const { previous, next } = useMemo(() => {
    const index = cards.findIndex((card) => card.slug === slug);
    if (index === -1) return { previous: null, next: null };
    // Kartlar yayın tarihine göre yeniden eskiye sıralı.
    const older = cards[index + 1];
    const newer = cards[index - 1];
    return {
      previous: older
        ? { slug: older.slug, title: older.title, category: older.category }
        : null,
      next: newer
        ? { slug: newer.slug, title: newer.title, category: newer.category }
        : null,
    };
  }, [cards, slug]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    const others = cards.filter((card) => card.slug !== post.slug);
    const sameCategory = post.category
      ? others.filter((card) => card.category === post.category)
      : [];
    // Aynı kategoride yeterli yazı yoksa en yeni yazılarla tamamla.
    const fillers = others.filter((card) => !sameCategory.includes(card));
    return [...sameCategory, ...fillers].slice(0, RELATED_LIMIT);
  }, [cards, post]);

  if (loading) {
    return (
      <main className="blog-shell">
        <div className="page-loader" role="status" aria-label="Yazı yükleniyor">
          <span className="page-loader__spinner" />
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="blog-shell">
        <div className="blog-empty">
          <h1 className="blog-empty__title">Yazı bulunamadı</h1>
          <p className="blog-empty__text">
            Aradığınız yazı kaldırılmış veya bağlantı hatalı olabilir.
          </p>
          <Link to="/blog" className="blog-empty__reset">
            Tüm yazılar
          </Link>
        </div>
      </main>
    );
  }

  const publishedAt = post.publishedAt ?? new Date().toISOString();
  const readingTime = calculateReadingTime(post.content);
  const pageUrl = `${window.location.origin}/blog/${post.slug}`;

  return (
    <>
      <main className="blog-shell">
        <div className="blog-detail">
          <article className="blog-article">
            <BlogHeader
              title={post.title}
              publishedAt={publishedAt}
              updatedAt={post.updatedAt ?? undefined}
              category={post.category ?? undefined}
              readingTime={readingTime}
              viewCount={post.viewCount}
              author={post.authorName ?? undefined}
            />

            {/* İçindekiler rayı gövdeyle aynı satırda: masaüstünde metnin
                başladığı hizada, mobilde başlığın hemen altında görünür. */}
            <div className="blog-article__layout">
              <div className="blog-article__body">
                <BlogContent html={prepared.html} />
                <BlogShare title={post.title} url={pageUrl} />
              </div>

              <aside className="blog-article__rail">
                <BlogToc headings={prepared.headings} />
              </aside>
            </div>
          </article>

          <BlogPostNav previous={previous} next={next} />

          {relatedPosts.length > 0 && (
            <section className="blog-related">
              <h2 className="blog-related__title">İlgili Yazılar</h2>
              <div className="blog-rows blog-rows--compact">
                {relatedPosts.map((related) => (
                  <BlogPostRow
                    key={related.id}
                    slug={related.slug}
                    title={related.title}
                    excerpt={related.excerpt}
                    publishedAt={related.publishedAt}
                    category={related.category}
                    readingTime={related.readingTime}
                  />
                ))}
              </div>
            </section>
          )}

          <BlogPopularList
            posts={cards.map((card) => ({
              slug: card.slug,
              title: card.title,
              category: card.category,
              viewCount: card.viewCount,
            }))}
            excludeSlug={post.slug}
            className="blog-detail__popular"
          />
        </div>
      </main>

      <BlogReadingProgress />
    </>
  );
}
