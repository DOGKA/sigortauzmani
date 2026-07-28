import { useCallback, useEffect, useRef, useState } from "react";
import { List, X } from "lucide-react";
import type { BlogHeading } from "../../lib/blog/content";

const SHEET_ID = "blog-toc-sheet";
/** blog.css'teki bottom sheet kırılımıyla birebir aynı kalmalı. */
const SHEET_QUERY = "(max-width: 1199px)";

interface BlogTocProps {
  headings: BlogHeading[];
}

export default function BlogToc({ headings }: BlogTocProps) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Panel kapanıp gövde kilidi kalkmadan hedefe kaydırma çalışmaz.
  const pendingTargetRef = useRef<string | null>(null);

  const closeSheet = useCallback(() => setSheetOpen(false), []);

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    // Üst şeridi görünür alanın tepesine yakın tutarak "şu an okunan başlık"
    // hissini yakalar; alt sınır ekranın ortasında.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
          return;
        }

        // Hiçbiri bantta değilse, tepenin üstünde kalan son başlık aktiftir.
        const above = elements.filter(
          (element) => element.getBoundingClientRect().top < 140,
        );
        if (above.length > 0) setActiveId(above[above.length - 1].id);
      },
      { rootMargin: "-120px 0px -55% 0px", threshold: 0 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headings]);

  // Panel mobilde bottom sheet olur: arkadaki sayfa kaymamalı, Escape kapatmalı
  // ve odak panelin içine taşınmalı.
  useEffect(() => {
    if (!sheetOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setSheetOpen(false);
    }

    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [sheetOpen]);

  // Kilit kalktıktan sonra çalışır: bu effect'in gövdesi, yukarıdaki
  // temizlikten sonraki sırada.
  useEffect(() => {
    if (sheetOpen) return;
    const targetId = pendingTargetRef.current;
    if (!targetId) return;
    pendingTargetRef.current = null;

    const target = document.getElementById(targetId);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${targetId}`);
  }, [sheetOpen]);

  // Masaüstü genişliğinde panel zaten satır içi; açık kalması odağı tuzaklardı.
  useEffect(() => {
    const media = window.matchMedia(SHEET_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (!event.matches) setSheetOpen(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  if (headings.length < 2) return null;

  const activeHeading = headings.find((heading) => heading.id === activeId);

  return (
    <nav
      className={`blog-toc ${sheetOpen ? "blog-toc--sheet-open" : ""}`}
      aria-label="İçindekiler"
    >
      {/* Dar ekranda yapışkan şeritte yalnızca bu satır durur; liste panele iner. */}
      <button
        ref={triggerRef}
        type="button"
        className="blog-toc__toggle"
        onClick={() => setSheetOpen(true)}
        aria-expanded={sheetOpen}
        aria-controls={SHEET_ID}
        aria-label={`İçindekiler: ${headings.length} başlık`}
      >
        <List className="blog-toc__toggle-icon" aria-hidden="true" />
        <span className="blog-toc__toggle-label">İçindekiler</span>
        <span className="blog-toc__toggle-summary">{activeHeading?.text ?? ""}</span>
        <span className="blog-toc__count">{headings.length}</span>
      </button>

      <div className="blog-toc__overlay" onClick={closeSheet} aria-hidden="true" />

      <div
        id={SHEET_ID}
        className="blog-toc__panel"
        role={sheetOpen ? "dialog" : undefined}
        aria-modal={sheetOpen ? true : undefined}
        aria-label={sheetOpen ? "İçindekiler" : undefined}
      >
        <div className="blog-toc__sheet-head">
          <span className="blog-toc__sheet-title">İçindekiler</span>
          <button
            ref={closeRef}
            type="button"
            className="blog-toc__sheet-close"
            onClick={closeSheet}
            aria-label="İçindekiler panelini kapat"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <p className="blog-toc__heading">İçindekiler</p>

        <ol className="blog-toc__list">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={`blog-toc__item blog-toc__item--h${heading.level}`}
            >
              <a
                href={`#${heading.id}`}
                className={`blog-toc__link ${activeId === heading.id ? "is-active" : ""}`}
                aria-current={activeId === heading.id ? "location" : undefined}
                onClick={(event) => {
                  if (!sheetOpen) return;
                  event.preventDefault();
                  pendingTargetRef.current = heading.id;
                  setSheetOpen(false);
                }}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
