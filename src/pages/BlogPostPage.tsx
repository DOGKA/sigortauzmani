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
import { ROBOTS_NOINDEX, absoluteUrl, ogImageUrl } from "../lib/seo/config";
import { ROUTES } from "../lib/seo/routes";
import { articleSchema, pageGraph } from "../lib/seo/schema";
import { useJsonLd } from "../lib/seo/useJsonLd";
import { useSeo } from "../lib/seo/useSeo";
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

  const seo = useMemo(() => {
    if (!post) return null;
    return {
      path: ROUTES.blogPost(post.slug),
      title: post.metaTitle ?? post.title,
      description:
        post.metaDescription ?? post.excerpt ?? createExcerpt(post.content, 155),
      image: ogImageUrl(post.slug),
      readingMinutes: calculateReadingTime(post.content),
    };
  }, [post]);

  useSeo(
    seo && post
      ? {
          title: seo.title,
          description: seo.description,
          path: seo.path,
          image: seo.image,
          imageAlt: post.title,
          type: "article",
          keywords: post.tags,
          tags: post.tags,
          section: post.category,
          publishedTime: post.publishedAt,
          modifiedTime: post.updatedAt,
        }
      : loading
        ? null
        : { title: "Yazı bulunamadı", description: "", path: ROUTES.blog, robots: ROBOTS_NOINDEX },
  );

  useJsonLd(
    seo && post
      ? pageGraph({
          path: seo.path,
          name: seo.title,
          description: seo.description,
          type: "WebPage",
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          primaryImage: seo.image,
          speakableSelectors: [".blog-header__title", ".blog-content p"],
          breadcrumb: [
            { name: "Ana Sayfa", path: ROUTES.home },
            { name: "Blog", path: ROUTES.blog },
            { name: post.title },
          ],
          extra: [
            articleSchema({
              path: seo.path,
              headline: post.title,
              description: seo.description,
              image: seo.image,
              datePublished: post.publishedAt,
              dateModified: post.updatedAt,
              authorName: post.authorName,
              section: post.category,
              keywords: post.tags,
              readingMinutes: seo.readingMinutes,
            }),
          ],
        })
      : null,
  );

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
  const pageUrl = absoluteUrl(ROUTES.blogPost(post.slug));
  const shareUrl = absoluteUrl(`/api/share?slug=${encodeURIComponent(post.slug)}`);

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
                <BlogShare title={post.title} url={pageUrl} shareUrl={shareUrl} />
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
