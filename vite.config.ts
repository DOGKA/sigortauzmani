import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Yerel Vite (`npm run dev`) `api/` altındaki Vercel fonksiyonlarını
 * çalıştırmaz. `/api/io/mernis` 404'ü bundan: tarayıcı 5173'e gidiyor, orada
 * o rota yok. Geliştirirken istekler canlı siteye yönlendiriliyor.
 *
 * Canlı `Set-Cookie` Secure bayrağı taşıyor; HTTP localhost'ta tarayıcı o
 * çerezi saklamaz. Proxy Secure'u düşürüyor ki oturum yerel akışta da
 * tutulsun.
 */
const IO_PROXY_HEDEF =
  process.env.VITE_IO_PROXY_TARGET ?? "https://sigortauzmani.vercel.app";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Port doluysa üst porta kaçma; hata ver ki eski süreç fark edilsin.
    strictPort: true,
    proxy: {
      "/api": {
        target: IO_PROXY_HEDEF,
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
    },
  },
});
