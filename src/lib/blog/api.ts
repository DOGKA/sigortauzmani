import { getSupabase } from "../supabase";

/** Liste, ilgili yazılar ve en çok okunanlar için gövdesiz kart verisi. */
export interface BlogCard {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string | null;
  viewCount: number;
  publishedAt: string;
  readingTime: number;
}

export interface BlogPostDetail {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  category: string | null;
  viewCount: number;
  publishedAt: string | null;
  updatedAt: string | null;
  authorName: string | null;
  /** İçerik üretiminde yazılan SEO başlığı; yoksa `title` kullanılır. */
  metaTitle: string | null;
  /** SEO açıklaması; yoksa `excerpt`e düşülür. */
  metaDescription: string | null;
  tags: string[];
}

interface BlogCardRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  view_count: number;
  published_at: string | null;
  reading_time: number | null;
}

interface BlogPostRowData {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  category: string | null;
  view_count: number;
  published_at: string | null;
  updated_at: string | null;
  author_name: string | null;
  meta_title: string | null;
  meta_description: string | null;
  tags: string[] | null;
}

function toCard(row: BlogCardRow): BlogCard {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    category: row.category,
    viewCount: row.view_count ?? 0,
    publishedAt: row.published_at ?? new Date().toISOString(),
    readingTime: row.reading_time ?? 1,
  };
}

export async function fetchBlogCards(): Promise<BlogCard[]> {
  const client = getSupabase();
  if (!client) return [];

  const { data, error } = await client
    .from("blog_post_cards")
    .select("id, slug, title, excerpt, category, view_count, published_at, reading_time")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("Blog yazıları alınamadı:", error.message);
    return [];
  }
  return (data as BlogCardRow[]).map(toCard);
}

export async function fetchBlogPost(slug: string): Promise<BlogPostDetail | null> {
  const client = getSupabase();
  if (!client) return null;

  const { data, error } = await client
    .from("blog_posts")
    .select(
      "id, slug, title, content, excerpt, category, view_count, published_at, updated_at, author_name, meta_title, meta_description, tags",
    )
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .maybeSingle();

  if (error) {
    console.error("Blog yazısı alınamadı:", error.message);
    return null;
  }
  if (!data) return null;

  const row = data as BlogPostRowData;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    content: row.content,
    excerpt: row.excerpt,
    category: row.category,
    viewCount: row.view_count ?? 0,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    authorName: row.author_name,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    tags: row.tags ?? [],
  };
}

/** Anon anahtar tabloyu güncelleyemez; sayaç RPC üzerinden artırılır. */
export async function trackBlogView(slug: string): Promise<void> {
  const client = getSupabase();
  if (!client) return;

  const { error } = await client.rpc("increment_blog_view", { p_slug: slug });
  if (error) console.error("Görüntülenme kaydedilemedi:", error.message);
}
