import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Check, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";

const SHEET_ID = "blog-filter-sheet";
const CATEGORY_LABEL_ID = "blog-filter-category-label";
const CATEGORY_BUTTON_ID = "blog-filter-category-button";
const CATEGORY_LIST_ID = "blog-filter-category-list";
const categoryOptionId = (index: number) => `blog-filter-category-option-${index}`;
/** blog.css'teki bottom sheet kırılımıyla birebir aynı kalmalı. */
const SHEET_QUERY = "(max-width: 1023px)";

export type BlogSort = "recent" | "popular";

interface BlogFilterBarProps {
  categories: { name: string; count: number }[];
  totalCount: number;
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  query: string;
  onQueryChange: (query: string) => void;
  sort: BlogSort;
  onSortChange: (sort: BlogSort) => void;
  resultCount: number;
}

export default function BlogFilterBar({
  categories,
  totalCount,
  activeCategory,
  onCategoryChange,
  query,
  onQueryChange,
  sort,
  onSortChange,
  resultCount,
}: BlogFilterBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    setPickerOpen(false);
  }, []);

  // "/" ile aramaya odaklan — metin ağırlıklı sayfada en sık kullanılan aksiyon.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target?.isContentEditable) return;
      event.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Panel mobilde bottom sheet olur: arkadaki sayfa kaymamalı, Escape kapatmalı
  // ve odak panelin içine taşınmalı.
  useEffect(() => {
    if (!sheetOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeSheet();
    }

    // Tetikleyici hiç sökülmüyor; temizlikte okumak yerine burada yakalamak
    // effect'in kendi anlık görüntüsüyle çalışmasını sağlıyor.
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
  }, [sheetOpen, closeSheet]);

  // Masaüstü genişliğinde panel zaten satır içi; açık kalması odağı tuzaklardı.
  useEffect(() => {
    const media = window.matchMedia(SHEET_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (!event.matches) closeSheet();
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [closeSheet]);

  const trimmedQuery = query.trim();
  const isFiltered = !!activeCategory || trimmedQuery.length > 0;
  const hasActiveFilters = isFiltered || sort !== "recent";

  const triggerSummary = activeCategory
    ? activeCategory
    : trimmedQuery
      ? `“${trimmedQuery}”`
      : "Tüm kategoriler";

  const resetFilters = useCallback(() => {
    onQueryChange("");
    onCategoryChange(null);
    onSortChange("recent");
  }, [onQueryChange, onCategoryChange, onSortChange]);

  const categoryOptions = useMemo(
    () => [
      { value: null as string | null, label: "Tümü", count: totalCount },
      ...categories.map((category) => ({
        value: category.name as string | null,
        label: category.name,
        count: category.count,
      })),
    ],
    [categories, totalCount],
  );

  const selectedIndex = Math.max(
    0,
    categoryOptions.findIndex((option) => option.value === activeCategory),
  );
  const selectedOption = categoryOptions[selectedIndex];

  // Liste bir katman olarak değil, yerinde açılıyor: hem bottom sheet hem de
  // yapışkan sağ sütun kaydırılabilir kaplar, mutlak konumlu menü kırpılırdı.
  const [highlightIndex, setHighlightIndex] = useState(selectedIndex);
  const pickerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const openPicker = useCallback((index: number) => {
    setHighlightIndex(index);
    setPickerOpen(true);
  }, []);

  const chooseCategory = useCallback(
    (index: number) => {
      onCategoryChange(categoryOptions[index].value);
      setHighlightIndex(index);
      setPickerOpen(false);
    },
    [categoryOptions, onCategoryChange],
  );

  function onPickerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    const lastIndex = categoryOptions.length - 1;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (!pickerOpen) return openPicker(selectedIndex);
        return setHighlightIndex((index) => Math.min(index + 1, lastIndex));
      case "ArrowUp":
        event.preventDefault();
        if (!pickerOpen) return openPicker(selectedIndex);
        return setHighlightIndex((index) => Math.max(index - 1, 0));
      case "Home":
        if (!pickerOpen) return;
        event.preventDefault();
        return setHighlightIndex(0);
      case "End":
        if (!pickerOpen) return;
        event.preventDefault();
        return setHighlightIndex(lastIndex);
      case "Enter":
      case " ":
        event.preventDefault();
        return pickerOpen ? chooseCategory(highlightIndex) : openPicker(selectedIndex);
      case "Escape":
        if (!pickerOpen) return;
        // Panel de Escape dinliyor; önce yalnızca liste kapansın.
        event.preventDefault();
        event.stopPropagation();
        return setPickerOpen(false);
      case "Tab":
        return setPickerOpen(false);
      default:
        return;
    }
  }

  // Dışarı tıklama listeyi kapatır.
  useEffect(() => {
    if (!pickerOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (pickerRef.current?.contains(event.target as Node)) return;
      setPickerOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [pickerOpen]);

  // Klavyeyle gezinirken vurgulanan seçenek görünür kalsın.
  useEffect(() => {
    if (!pickerOpen) return;
    optionsRef.current
      ?.querySelector<HTMLElement>("[data-highlighted='true']")
      ?.scrollIntoView({ block: "nearest" });
  }, [pickerOpen, highlightIndex]);

  return (
    <div className={`blog-filters ${sheetOpen ? "blog-filters--sheet-open" : ""}`}>
      {/* Sağ sütunda "En Çok Okunanlar" ile aynı başlık ritmini kurar. */}
      <h2 className="blog-filters__aside-heading">
        <SlidersHorizontal aria-hidden="true" />
        Keşfet
      </h2>

      {/* Mobilde yapışkan alanda yalnızca bu satır durur; sıralama ve kategori
          panele iner, arama ise en sık kullanılan aksiyon olduğu için burada
          kalır ve masaüstünde de sütunun tepesinde durur. */}
      <div className="blog-filters__bar">
        <button
          ref={triggerRef}
          type="button"
          className="blog-filters__trigger"
          onClick={() => setSheetOpen(true)}
          aria-expanded={sheetOpen}
          aria-controls={SHEET_ID}
          aria-label={`Keşfet: ${triggerSummary}, ${resultCount} yazı`}
        >
          <SlidersHorizontal className="blog-filters__trigger-icon" aria-hidden="true" />
          <span className="blog-filters__trigger-label">
            Keşfet
            {hasActiveFilters && (
              <span className="blog-filters__trigger-dot" aria-hidden="true" />
            )}
          </span>
        </button>

        <div className="blog-filters__search">
          <Search className="blog-filters__search-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape" && query) {
                event.preventDefault();
                onQueryChange("");
              }
            }}
            placeholder="Yazılarda ara"
            aria-label="Blog yazılarında ara"
            className="blog-filters__input"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                onQueryChange("");
                inputRef.current?.focus();
              }}
              className="blog-filters__clear"
              aria-label="Aramayı temizle"
            >
              <X aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Sayı aşağıdaki canlı bölgede duyuruluyor; burada yalnızca görsel. */}
        <span className="blog-filters__count" aria-hidden="true">
          {resultCount}
        </span>
      </div>

      <div className="blog-filters__overlay" onClick={closeSheet} aria-hidden="true" />

      <div
        id={SHEET_ID}
        className="blog-filters__panel"
        role={sheetOpen ? "dialog" : undefined}
        aria-modal={sheetOpen ? true : undefined}
        aria-label={sheetOpen ? "Keşfet" : undefined}
      >
        <div className="blog-filters__sheet-head">
          <span className="blog-filters__sheet-title">Keşfet</span>
          <button
            ref={closeRef}
            type="button"
            className="blog-filters__sheet-close"
            onClick={closeSheet}
            aria-label="Keşfet panelini kapat"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        {/* Kaydırma yalnızca burada: yapışkan alt şerit picker'ın kenarını ezmesin. */}
        <div className="blog-filters__sheet-body">
          <div className="blog-filters__group">
            <span className="blog-filters__group-label">Sıralama</span>
            <div className="blog-filters__sort" role="group" aria-label="Sıralama">
              <button
                type="button"
                className={`blog-filters__sort-option ${sort === "recent" ? "is-active" : ""}`}
                onClick={() => onSortChange("recent")}
                aria-pressed={sort === "recent"}
              >
                En yeni
              </button>
              <button
                type="button"
                className={`blog-filters__sort-option ${sort === "popular" ? "is-active" : ""}`}
                onClick={() => onSortChange("popular")}
                aria-pressed={sort === "popular"}
              >
                En çok okunan
              </button>
            </div>
          </div>

          {/* Onbirden fazla kategori çip olarak dört satıra taşıyordu; kapalıyken
              tek satır kalan bu liste hem yerden kazandırıyor hem de sayıları
              koruyor. */}
          <div className="blog-filters__group blog-filters__picker" ref={pickerRef}>
            <span className="blog-filters__group-label" id={CATEGORY_LABEL_ID}>
              Kategori
            </span>

            <button
              type="button"
              id={CATEGORY_BUTTON_ID}
              className="blog-filters__picker-button"
              role="combobox"
              aria-haspopup="listbox"
              aria-expanded={pickerOpen}
              aria-controls={CATEGORY_LIST_ID}
              aria-labelledby={`${CATEGORY_LABEL_ID} ${CATEGORY_BUTTON_ID}`}
              aria-activedescendant={
                pickerOpen ? categoryOptionId(highlightIndex) : undefined
              }
              data-active={activeCategory !== null}
              onClick={() =>
                pickerOpen ? setPickerOpen(false) : openPicker(selectedIndex)
              }
              onKeyDown={onPickerKeyDown}
            >
              <span className="blog-filters__picker-dot" aria-hidden="true" />
              <span className="blog-filters__picker-value">{selectedOption.label}</span>
              <span className="blog-filters__picker-count">{selectedOption.count}</span>
              <ChevronDown className="blog-filters__picker-chevron" aria-hidden="true" />
            </button>

            {pickerOpen && (
              <div
                id={CATEGORY_LIST_ID}
                ref={optionsRef}
                role="listbox"
                aria-labelledby={CATEGORY_LABEL_ID}
                className="blog-filters__picker-list"
                // Seçenekler odaklanamaz; tıklarken odak butonda kalmalı.
                onMouseDown={(event) => event.preventDefault()}
              >
                {categoryOptions.map((option, index) => (
                  <div
                    key={option.value ?? "__all"}
                    id={categoryOptionId(index)}
                    role="option"
                    aria-selected={index === selectedIndex}
                    data-highlighted={index === highlightIndex}
                    className="blog-filters__picker-option"
                    onClick={() => chooseCategory(index)}
                    onMouseMove={() => setHighlightIndex(index)}
                  >
                    <span className="blog-filters__picker-dot" aria-hidden="true" />
                    <span className="blog-filters__picker-value">{option.label}</span>
                    <span className="blog-filters__picker-count">{option.count}</span>
                    <Check className="blog-filters__picker-check" aria-hidden="true" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="blog-filters__sheet-foot">
          {hasActiveFilters && (
            <button
              type="button"
              className="blog-filters__sheet-reset"
              onClick={resetFilters}
            >
              Sıfırla
            </button>
          )}
          <button type="button" className="blog-filters__sheet-apply" onClick={closeSheet}>
            {resultCount > 0 ? `${resultCount} yazıyı göster` : "Sonuç yok"}
          </button>
        </div>
      </div>

      {/* Sonuç sayısı yalnızca ekran okuyucuya duyurulur; sayı görsel olarak
          tetikleyicide ve panel butonunda zaten yazıyor. */}
      <p className="sr-only" role="status" aria-live="polite">
        {isFiltered ? `${resultCount} yazı bulundu` : `Toplam ${totalCount} yazı`}
      </p>
    </div>
  );
}
