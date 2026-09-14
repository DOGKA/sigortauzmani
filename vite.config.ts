import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { localApiPlugin } from "./scripts/vite-local-api.ts";

function inlineEntryCss(): Plugin {
  return {
    name: "inline-entry-css",
    apply: "build",
    enforce: "post",
    generateBundle(_, bundle) {
      const html = bundle["index.html"];
      if (!html || html.type !== "asset") return;

      html.source = String(html.source).replace(
        /<link rel="stylesheet" crossorigin href="\/([^"]+\.css)">/g,
        (tag, fileName: string) => {
          const css = bundle[fileName];
          return css?.type === "asset"
            ? `<style>${String(css.source)}</style>`
            : tag;
        },
      );
    },
  };
}

/**
 * `npm run dev` varsayılan olarak `api/` fonksiyonlarını Vite içinde
 * çalıştırır (kök `.env`'deki IO token'ı ile). Canlı siteye proxy için:
 * `VITE_IO_PROXY_TARGET=https://sigortauzmani.vercel.app npm run dev`
 *
 * Canlı `Set-Cookie` Secure bayrağı taşıyor; HTTP localhost'ta tarayıcı o
 * çerezi saklamaz. Proxy kullanıldığında Secure düşürülür.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }

  const proxyTarget = process.env.VITE_IO_PROXY_TARGET;

  return {
    plugins: [
      react(),
      inlineEntryCss(),
      ...(proxyTarget ? [] : [localApiPlugin()]),
    ],
    build: {
      // Görselleri JS içine base64 olarak gömmek ana paketi ve parse süresini
      // büyütür; ayrı dosyalar tarayıcı önbelleği ve lazy-loading kullanır.
      assetsInlineLimit: 0,
    },
    server: {
      port: 5173,
      // Port doluysa üst porta kaçma; hata ver ki eski süreç fark edilsin.
      strictPort: true,
      proxy: proxyTarget
        ? {
            "/api": {
              target: proxyTarget,
              changeOrigin: true,
              configure(proxy) {
                proxy.on("proxyRes", (proxyRes) => {
                  const cookies = proxyRes.headers["set-cookie"];
                  if (!cookies) return;
                  proxyRes.headers["set-cookie"] = cookies.map((cookie) =>
                    cookie.replace(/;\s*Secure/gi, ""),
                  );
                });
              },
            },
          }
        : undefined,
    },
  };
});
