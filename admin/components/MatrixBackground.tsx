"use client";

import { useEffect, useState } from "react";

const KATAKANA_START = 0x30a0;
const COLUMN_COUNT = 40;
const CHARS_PER_COLUMN = 36;

interface Column {
  left: number;
  duration: number;
  delay: number;
  opacity: number;
  chars: string[];
}

function buildColumns(): Column[] {
  return Array.from({ length: COLUMN_COUNT }, (_, i) => ({
    left: (i / COLUMN_COUNT) * 100 + Math.random() * 1.5,
    duration: 10 + Math.random() * 18,
    delay: -Math.random() * 20,
    opacity: 0.12 + Math.random() * 0.3,
    chars: Array.from({ length: CHARS_PER_COLUMN }, () =>
      String.fromCharCode(KATAKANA_START + Math.floor(Math.random() * 96)),
    ),
  }));
}

export default function MatrixBackground() {
  // Hydration uyuşmazlığını önlemek için kolonlar yalnızca istemcide üretilir.
  const [columns, setColumns] = useState<Column[]>([]);

  useEffect(() => {
    setColumns(buildColumns());
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Koyu zemin gradyanı */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#04101f] via-[#071a33] to-[#03080f]" />

      {/* Katakana kolonları */}
      {columns.map((col, i) => (
        <div
          key={i}
          className="matrix-column absolute top-0 flex flex-col text-[11px] leading-[18px] font-mono text-sky-400/80 select-none"
          style={{
            left: `${col.left}%`,
            opacity: col.opacity,
            animationDuration: `${col.duration}s`,
            animationDelay: `${col.delay}s`,
          }}
        >
          {col.chars.map((ch, j) => (
            <span key={j}>{ch}</span>
          ))}
        </div>
      ))}

      {/* Tarama çizgisi */}
      <div className="scan-line absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-sky-400/10 to-transparent" />

      {/* Glow efektleri */}
      <div className="glow-pulse absolute -top-32 -left-32 h-96 w-96 rounded-full bg-sky-500/20 blur-[120px]" />
      <div
        className="glow-pulse absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-blue-600/20 blur-[140px]"
        style={{ animationDelay: "3s" }}
      />
      <div className="absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[100px]" />

      {/* Vinyet */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(2,8,16,0.85)_100%)]" />
    </div>
  );
}
