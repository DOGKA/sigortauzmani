/**
 * Bot isteklerini sunucuda üretilen HTML'e (api/prerender) yönlendirir.
 *
 * Site bir React SPA olduğu için ham HTML boş bir kabuktur; başlık, açıklama,
 * canonical, yapılandırılmış veri ve gövde metni JavaScript çalıştıktan sonra
 * oluşur. Yapay zekâ tarayıcıları ve sosyal önizleme botları JavaScript
 * çalıştırmaz, bu yüzden onlara aynı içeriğin sunucuda üretilmiş sürümü
 * verilir. Yönlendirme rewrite olduğundan adres değişmez.
 *
 * vercel.json'daki "has" başlık koşullu rewrite'lar statik SPA çıktılarında
 * güvenilir çalışmadığı için bot tespiti burada, her istekte çalışan Routing
 * Middleware üzerinde yapılır. İnsan kullanıcılar etkilenmez.
 */

import { next, rewrite } from "@vercel/edge";

/**
 * API yolları, Vercel iç yolları ve uzantılı dosyalar (robots.txt, sitemap.xml,
 * görseller, bundle'lar) hariç tüm sayfa istekleri.
 *
 * Vercel bu nesneyi derlemeden önce AST üzerinden okur; okuyucusu özellik
 * atamalarına bağlanan JSDoc bloklarını çözemediği için nesnenin içine blok
 * yorum yazılmamalıdır (yalnızca satır yorumu güvenlidir).
 */
export const config = {
  matcher: ["/((?!api/|_vercel/|.*\\.[a-zA-Z0-9]+$).*)"],
};

/**
 * JavaScript çalıştırmayan tarayıcılar: yanıt motorları, LLM tarayıcıları ve
 * sosyal önizleme botları. Bunlar için sunucu HTML'i zorunludur.
 */
const AI_AND_SOCIAL_BOTS =
  /(GPTBot|OAI-SearchBot|ChatGPT-User|ClaudeBot|Claude-User|Claude-SearchBot|anthropic-ai|PerplexityBot|Perplexity-User|Amazonbot|DuckAssistBot|MistralAI-User|YouBot|cohere-ai|CCBot|Bytespider|Diffbot|Applebot|meta-externalagent|facebookexternalhit|Facebot|FacebookBot|Twitterbot|WhatsApp|Slackbot|LinkedInBot|TelegramBot|Discordbot|Pinterest|SkypeUriPreview|redditbot|vkShare|W3C_Validator)/i;

/**
 * JavaScript çalıştırabilen arama motorları.
 *
 * Bunlara da sunucu HTML'i sunulur: içerik, başlıklar ve bağlantılar gerçek
 * sayfayla aynı kaynaklardan üretildiği için eşitlik korunur, buna karşılık
 * render kuyruğu beklenmediğinden 68 blog yazısı ilk taramada tam metin
 * olarak görülür. Gerçek uygulamanın taranmasını tercih ederseniz aşağıdaki
 * sabiti `false` yapmak yeterlidir.
 */
const PRERENDER_FOR_SEARCH_ENGINES = true;

const SEARCH_ENGINE_BOTS =
  /(Googlebot|Google-InspectionTool|Storebot-Google|APIs-Google|AdsBot-Google|bingbot|BingPreview|Slurp|DuckDuckBot|YandexBot|YandexImages|Baiduspider|SeznamBot|Qwantify|PetalBot)/i;

function shouldPrerender(userAgent: string): boolean {
  if (AI_AND_SOCIAL_BOTS.test(userAgent)) return true;
  return PRERENDER_FOR_SEARCH_ENGINES && SEARCH_ENGINE_BOTS.test(userAgent);
}

export default function middleware(request: Request) {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (!shouldPrerender(userAgent)) return next();

  const url = new URL(request.url);
  const prerenderUrl = new URL("/api/prerender", url.origin);
  prerenderUrl.searchParams.set("path", url.pathname);
  return rewrite(prerenderUrl);
}
