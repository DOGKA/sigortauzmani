/**
 * Bilgi ikonlu açıklama satırı.
 *
 * Alan altındaki "sigorta şirketleri istiyor" tipi kısa notlar müşteriye
 * verinin neden istendiğini anlatmıyordu. Bunun yerine kartın altında,
 * verinin hangi amaçla işlendiğini tek seferde açıklayan bir not duruyor.
 */

import type { ReactNode } from "react";

export default function BilgiNotu({ children }: { children: ReactNode }) {
  return (
    <p className="flow__bilgi">
      <svg
        className="flow__bilgi-ikon"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 16v-4M12 8h.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span>{children}</span>
    </p>
  );
}
