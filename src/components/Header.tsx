import { useEffect, useRef, useState } from "react";
import { navigate, pageRegistry, type Destination } from "../navigation";
import "./Header.css";
import { useLanguage, setLanguage } from "../i18n/language";
import Sparkles from "../../HomePage/components/Sparkles";
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
  const language = useLanguage();
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const dismiss = () => {
    setOpen(false);
    toggle.current?.focus();
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
        navigate(to);
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
      <a className="logo" href="/" aria-label="SeeVia — Trang chủ">
        <img src="/images/260.png" alt="SeeVia" />
      </a>
      <nav aria-label="Điều hướng chính" className="main-nav">
        <button
          aria-current={active === "home" ? "page" : undefined}
          onClick={() => navigate("home")}
        >
          Trang chủ
        </button>
        {item("Sản phẩm", "productPage")}
        {item("Công nghệ", "technology")}
        {item("Về chúng tôi", "about")}
      </nav>
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
          onClick={() => setOpen(!open)}
        >
          <span aria-hidden="true">☰</span>
        </button>
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
