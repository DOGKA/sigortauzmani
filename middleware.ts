/**
 * Sosyal paylaşım botlarını /blog/:slug isteklerinde /api/share'e yönlendirir.
 *
 * vercel.json'daki "has" header koşullu rewrite'lar statik SPA çıktılarında
 * güvenilir çalışmadığı için (bkz. Vercel dokümantasyonu / community
 * tartışmaları) bot tespiti burada, her istekte çalışan Routing
 * Middleware üzerinden yapılır. İnsan kullanıcılar etkilenmez.
 */

import { next, rewrite } from "@vercel/edge";

export const config = {
  matcher: "/blog/:slug",
};

const BOT_USER_AGENT =
  /(facebookexternalhit|Facebot|Twitterbot|WhatsApp|Slackbot|LinkedInBot|TelegramBot|Discordbot|Pinterest|SkypeUriPreview|redditbot|Applebot|vkShare|W3C_Validator)/i;

export default function middleware(request: Request) {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (!BOT_USER_AGENT.test(userAgent)) return next();

  const url = new URL(request.url);
  const slug = url.pathname.replace(/^\/blog\//, "");
  if (!slug) return next();

  const shareUrl = new URL("/api/share", url.origin);
  shareUrl.searchParams.set("slug", slug);
  return rewrite(shareUrl);
}
