import { useEffect, useRef, useState } from "react";
import { navigate, navigateTo, pageRegistry, type Destination } from "../navigation";
import "./Header.css";
import { useLanguage, setLanguage } from "../i18n/language";
import Sparkles from "../../HomePage/components/Sparkles";

const searchPages = Object.values(pageRegistry);
const searchText = (value: string) =>
  value.toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").trim();

export default function Header({
  active = "home",
}: {
  active?:
    | "home"
    | "overview"
    | "product"
    | "technology"
    | "about"
    | "community"
    | "news"
    | "partnership"
    | "contact"
    | "privacy"
    | "terms";
}) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const language = useLanguage();
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const searchToggle = useRef<HTMLButtonElement>(null);
  const normalizedQuery = searchText(searchQuery);
  const searchResults = normalizedQuery
    ? searchPages.filter((page) =>
        searchText(`${page.title} ${page.description} ${page.aliases.join(" ")}`).includes(normalizedQuery),
      ).slice(0, 6)
    : searchPages.filter((page) => ["/san-pham", "/cong-nghe", "/tin-tuc", "/lien-he"].includes(page.href));
  const visitSearchResult = (href: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigateTo(href);
  };
  const dismiss = () => {
    setOpen(false);
    if (open) toggle.current?.focus({ preventScroll: true });
  };
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
      if (event.key === "Tab") {
        const items = Array.from(
          panel.current!.querySelectorAll<HTMLElement>("button, a"),
        );
        const first = items[0],
          last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    const outside = (e: PointerEvent) => {
      if (
        !panel.current?.contains(e.target as Node) &&
        !toggle.current?.contains(e.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  useEffect(() => {
    if (!searchOpen) return;
    const outside = (event: PointerEvent) => {
      if (!search.current?.contains(event.target as Node)) setSearchOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSearchOpen(false);
      if (window.matchMedia("(max-width: 640px)").matches) searchToggle.current?.focus();
      else searchInput.current?.focus();
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [searchOpen]);
  const item = (label: string, to?: Destination, arrow = false) => (
    <button
      key={label}
      aria-current={
        to === active || (to === "productPage" && active === "product")
          ? "page"
          : undefined
      }
      onClick={() => {
        dismiss();
        navigate(to, { instant: true });
      }}
    >
      {to && Object.hasOwn(pageRegistry, to)
        ? pageRegistry[to as keyof typeof pageRegistry].title
        : label}
      {arrow && (
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M2 30L30 2M7 2H30V25" />
        </svg>
      )}
    </button>
  );
  return (
    <header className="header">
      <div className="header-menu">
        <div className="header-brand">
          <a className="logo" href="/" aria-label="SeeVia — Trang chủ" data-nav-top>
            <img src="/images/260.png" alt="SeeVia" />
          </a>
        </div>
        <nav aria-label="Điều hướng chính" className="main-nav">
          <button
            aria-current={active === "home" ? "page" : undefined}
            onClick={() => navigate("home", { instant: true })}
          >
            Trang chủ
          </button>
          {item("Sản phẩm", "productPage")}
          {item("Công nghệ", "technology")}
          {item("Về chúng tôi", "about")}
        </nav>
        <div className={`site-search${searchOpen ? " is-open" : ""}`} ref={search}>
          <button
            ref={searchToggle}
            className="site-search-toggle"
            type="button"
            aria-label={searchOpen ? "Đóng tìm kiếm" : "Mở tìm kiếm"}
            aria-expanded={searchOpen}
            aria-controls="site-search-panel"
            onClick={() => {
              setOpen(false);
              setSearchOpen((current) => !current);
              if (!searchOpen) requestAnimationFrame(() => searchInput.current?.focus());
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.5" />
              <path d="m16 16 5 5" />
            </svg>
          </button>
          <div className="site-search-panel" id="site-search-panel">
            <form
              className="site-search-form"
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                if (!normalizedQuery) {
                  setSearchOpen(true);
                  searchInput.current?.focus();
                  return;
                }
                if (searchResults[0]) visitSearchResult(searchResults[0].href);
                else setSearchOpen(true);
              }}
            >
              <button className="site-search-submit" type="submit" aria-label="Tìm kiếm">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="10.8" cy="10.8" r="6.5" />
                  <path d="m16 16 5 5" />
                </svg>
              </button>
              <label className="site-search-label" htmlFor="site-search-input">Tìm trên SeeVia</label>
              <input
                ref={searchInput}
                id="site-search-input"
                type="search"
                value={searchQuery}
                placeholder="Tìm kiếm"
                autoComplete="off"
                onFocus={() => { setOpen(false); setSearchOpen(true); }}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </form>
            {searchOpen && (
              <div className="site-search-results" aria-label="Kết quả tìm kiếm">
                <p>{normalizedQuery ? "KẾT QUẢ TÌM KIẾM" : "TRANG THƯỜNG XEM"}</p>
                {searchResults.length ? searchResults.map((result) => (
                  <button key={result.href} type="button" onClick={() => visitSearchResult(result.href)}>
                    <span>{result.title}</span>
                    <small>{result.description}</small>
                  </button>
                )) : <span className="site-search-empty">Không tìm thấy trang phù hợp.</span>}
              </div>
            )}
          </div>
        </div>
        <div className="header-tools">
          <button
            lang="vi"
            aria-label="Tiếng Việt"
            translate="no"
            aria-pressed={language === "vi"}
            onClick={() => setLanguage("vi")}
          >
            VI
          </button>
          <span aria-hidden="true">|</span>
          <button
            lang="en"
            aria-label="English"
            translate="no"
            aria-pressed={language === "en"}
            onClick={() => setLanguage("en")}
          >
            EN
          </button>
          <button
            ref={toggle}
            className="menu-toggle"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            aria-expanded={open}
            aria-controls="extra-menu"
            onClick={() => { setSearchOpen(false); setOpen(!open); }}
          >
            <span aria-hidden="true">☰</span>
          </button>
        </div>
      </div>
      {open && (
        <>
          <div className="menu-backdrop" aria-hidden="true" onClick={dismiss} />
          <div
            ref={panel}
            className="extra-menu"
            id="extra-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Khám phá thêm"
          >
            <Sparkles tone="dark" density={22} />
            <div className="drawer-top">
              <img src="/images/260.png" alt="SeeVia" />
              <button
                className="drawer-close"
                aria-label="Đóng menu"
                onClick={dismiss}
              >
                <svg viewBox="0 0 32 32" aria-hidden="true">
                  <path d="M3 3L29 29M29 3L3 29" />
                </svg>
              </button>
            </div>
            <p className="drawer-label">KHÁM PHÁ THÊM</p>
            <nav className="drawer-links" aria-label="Khám phá thêm">
              <div className="mobile-nav">
                {item("Trang chủ", "home")}
                {item("Sản phẩm", "productPage")}
                {item("Công nghệ", "technology")}
                {item("Về chúng tôi", "about")}
              </div>
              {item("Tổng quan nhanh", "overview", true)}
              {item("Cộng đồng", "community", true)}
              {item("Tin tức", "news", true)}
              {item("Đối tác", "partnership", true)}
              {item("Liên hệ", "contact", true)}
            </nav>
            <div className="drawer-footer">SEE A BRIGHTER WAY</div>
          </div>
        </>
      )}
    </header>
  );
}
