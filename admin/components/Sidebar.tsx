"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/talepler",
    label: "Talepler",
    icon: (
      <svg {...iconProps}>
        <path d="M8 6h13M8 12h13M8 18h13" />
        <circle cx="4" cy="6" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: "/iptal-talepleri",
    label: "İptal Talepleri",
    icon: (
      <svg {...iconProps}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
        <path d="M14 2v6h6M9.5 15.5 14.5 10.5M9.5 10.5l5 5" />
      </svg>
    ),
  },
  {
    href: "/policeler",
    label: "Poliçeler",
    icon: (
      <svg {...iconProps}>
        <path d="M12 3 5 6v5c0 4.4 3 8.4 7 9.6 4-1.2 7-5.2 7-9.6V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    href: "/musteriler",
    label: "Müşteriler",
    icon: (
      <svg {...iconProps}>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
        <path d="M16 4.5a3.5 3.5 0 0 1 0 7M17.5 14a6.5 6.5 0 0 1 4 6" />
      </svg>
    ),
  },
  {
    href: "/yenilemeler",
    label: "Yenilemeler",
    icon: (
      <svg {...iconProps}>
        <path d="M21 12a9 9 0 1 1-2.6-6.3" />
        <path d="M21 3v5h-5" />
      </svg>
    ),
  },
  {
    href: "/hasar-dosyalari",
    label: "Hasar Dosyaları",
    icon: (
      <svg {...iconProps}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
        <path d="M14 2v6h6M12 11v4M12 18h.01" />
      </svg>
    ),
  },
  {
    href: "/teklif-gecmisi",
    label: "Teklif Geçmişi",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    href: "/acenteler",
    label: "Acenteler / Partnerler",
    icon: (
      <svg {...iconProps}>
        <path d="M3 21h18M5 21V8l7-5 7 5v13" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),
  },
  {
    href: "/raporlar",
    label: "Raporlar",
    icon: (
      <svg {...iconProps}>
        <path d="M3 3v18h18" />
        <path d="M7 15v3M12 10v8M17 6v12" />
      </svg>
    ),
  },
  {
    href: "/ayarlar",
    label: "Ayarlar",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-white/10 bg-[#0b1a30] text-white">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <Link href="/talepler" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">
            <Image
              src="/logo.svg"
              alt="Sigorta Uzmanı"
              width={28}
              height={28}
              className="h-7 w-7"
              priority
            />
          </span>
          <span className="text-[15px] font-bold tracking-tight">
            Sigorta Uzmanı
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/35">
          Yönetim
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-gradient-to-r from-sky-500/20 to-blue-600/10 text-sky-300"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4 text-[11px] leading-relaxed text-white/35">
        Sigorta Uzmanı Yönetim Paneli
      </div>
    </aside>
  );
}
