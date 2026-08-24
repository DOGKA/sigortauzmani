import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { localApiPlugin } from "./scripts/vite-local-api.ts";

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
    plugins: [react(), ...(proxyTarget ? [] : [localApiPlugin()])],
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
