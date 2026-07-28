import { useEffect } from "react";
import type { JsonLd } from "./schema";

/**
 * JSON-LD grafiğini <head>'e ekler ve rota değişiminde temizler.
 * Veri hazır değilse `null` geçilebilir.
 */
export function useJsonLd(data: JsonLd | null): void {
  const serialized = data ? JSON.stringify(data) : null;

  useEffect(() => {
    if (!serialized || typeof document === "undefined") return;

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo-jsonld", "");
    script.textContent = serialized;
    document.head.appendChild(script);

    return () => script.remove();
  }, [serialized]);
}
