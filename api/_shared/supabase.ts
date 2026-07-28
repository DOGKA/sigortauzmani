/**
 * Supabase REST erişimi (Edge ve Node runtime'larının ikisinde de çalışır).
 *
 * supabase-js yerine doğrudan REST kullanılır; Edge fonksiyonlarında bundle
 * boyutunu küçük tutar ve anon anahtarla salt okuma için yeterlidir.
 */

export function readEnv(name: string): string | undefined {
  const env = (
    globalThis as {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process?.env;
  return env?.[name];
}

function credentials(): { url: string; key: string } | null {
  const url = readEnv("VITE_SUPABASE_URL") ?? readEnv("SUPABASE_URL");
  const key = readEnv("VITE_SUPABASE_ANON_KEY") ?? readEnv("SUPABASE_ANON_KEY");
  if (!url || !key) return null;
  return { url, key };
}

/** `table?query` biçiminde tek bir REST sorgusu. Hata durumunda null döner. */
export async function restQuery<T>(
  table: string,
  query: string,
): Promise<T[] | null> {
  const creds = credentials();
  if (!creds) return null;

  try {
    const response = await fetch(`${creds.url}/rest/v1/${table}?${query}`, {
      headers: { apikey: creds.key, Authorization: `Bearer ${creds.key}` },
    });
    if (!response.ok) return null;
    return (await response.json()) as T[];
  } catch {
    return null;
  }
}

export interface PostCard {
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  published_at: string | null;
  reading_time: number | null;
}

export interface PostSitemapRow {
  slug: string;
  published_at: string | null;
  updated_at: string | null;
}

export interface PostFull {
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  category: string | null;
  published_at: string | null;
  updated_at: string | null;
  author_name: string | null;
  meta_title: string | null;
  meta_description: string | null;
  tags: string[] | null;
}

const CARD_FIELDS = "slug,title,excerpt,category,published_at,reading_time";
const FULL_FIELDS =
  "slug,title,content,excerpt,category,published_at,updated_at,author_name,meta_title,meta_description,tags";

export async function fetchPostCards(limit = 500): Promise<PostCard[]> {
  const rows = await restQuery<PostCard>(
    "blog_post_cards",
    `select=${CARD_FIELDS}&order=published_at.desc.nullslast&limit=${limit}`,
  );
  return rows ?? [];
}

export async function fetchPostSlugs(limit = 2000): Promise<PostSitemapRow[]> {
  const rows = await restQuery<PostSitemapRow>(
    "blog_posts",
    `select=slug,published_at,updated_at&status=eq.PUBLISHED` +
      `&order=published_at.desc.nullslast&limit=${limit}`,
  );
  return rows ?? [];
}

export type PostResult =
  | { status: "ok"; post: PostFull }
  | { status: "missing" }
  | { status: "error" };

/**
 * Yazıyı getirir ve "bulunamadı" ile "sorgu başarısız" durumlarını ayırır.
 * Prerender, veri kaynağı hatasında 404 yerine 503 dönebilmek için buna
 * ihtiyaç duyar; aksi hâlde geçici bir arıza yazıyı dizinden düşürebilir.
 */
export async function fetchPostResult(slug: string): Promise<PostResult> {
  const rows = await restQuery<PostFull>(
    "blog_posts",
    `select=${FULL_FIELDS}&slug=eq.${encodeURIComponent(slug)}` +
      `&status=eq.PUBLISHED&limit=1`,
  );
  if (rows === null) return { status: "error" };
  const post = rows[0];
  return post ? { status: "ok", post } : { status: "missing" };
}

export async function fetchPost(slug: string): Promise<PostFull | null> {
  const result = await fetchPostResult(slug);
  return result.status === "ok" ? result.post : null;
}

export async function fetchPostsWithContent(limit = 200): Promise<PostFull[]> {
  const rows = await restQuery<PostFull>(
    "blog_posts",
    `select=${FULL_FIELDS}&status=eq.PUBLISHED` +
      `&order=published_at.desc.nullslast&limit=${limit}`,
  );
  return rows ?? [];
}
