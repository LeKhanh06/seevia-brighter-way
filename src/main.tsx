import { navigateTo, pageOrder, pageRegistry } from "./navigation";
import React, { useLayoutEffect, useRef, useState } from "react";
import "@fontsource/be-vietnam-pro/latin-400.css";
import "@fontsource/be-vietnam-pro/vietnamese-400.css";
import "@fontsource/be-vietnam-pro/latin-500.css";
import "@fontsource/be-vietnam-pro/vietnamese-500.css";
import "@fontsource/be-vietnam-pro/latin-600.css";
import "@fontsource/be-vietnam-pro/vietnamese-600.css";
import "@fontsource/be-vietnam-pro/latin-700.css";
import "@fontsource/be-vietnam-pro/vietnamese-700.css";
import "@fontsource/be-vietnam-pro/latin-400-italic.css";
import "@fontsource/be-vietnam-pro/vietnamese-400-italic.css";
import "@fontsource/lora/latin-400.css";
import "@fontsource/lora/vietnamese-400.css";
import "@fontsource/lora/latin-500-italic.css";
import "@fontsource/lora/vietnamese-500-italic.css";
import "@fontsource/lora/latin-400-italic.css";
import "@fontsource/lora/vietnamese-400-italic.css";
import "@fontsource/lora/latin-600.css";
import "@fontsource/lora/vietnamese-600.css";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import Home from "../HomePage/Home";
import QuickOverview from "../OverviewPage/QuickOverview";
import Product from "../ProductPage/Product";
import Technology from "../TechnologyPage/Technology";
import About from "../AboutPage/About";
import Community from "../CommunityPage/Community";
import News from "../NewsPage/News";
import Partner from "../PartnerPage/Partner";
import Contact from "../ContactPage/Contact";
import SiteMotion, { getPageLenis } from "./components/SiteMotion";
import { getLenis } from "../HomePage/useHomeMotion";
import SiteInformation from "./components/SiteInformation";
import Policy from "../PolicyPage/Policy";
import LanguageEffects from "./i18n/LanguageEffects";
import SeeViaSupport from "./components/SeeViaSupport";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/retained-typography.css";
import "./styles/iridescent-theme.css";
import "../HomePage/styles/motion.css";
import "./styles/brand-finish.css";
import "./styles/layout-balance.css";
import "./styles/page-rhythm.css";

const routePath = () => window.location.pathname.replace(/\/$/, "") || "/";
const entryKey = () =>
  (window.history.state as { seeviaKey?: string } | null)?.seeviaKey;
const entryIndex = () =>
  (window.history.state as { seeviaIndex?: number } | null)?.seeviaIndex;
const newEntryKey = () => crypto.randomUUID();
if (!entryKey() || entryIndex() === undefined) {
  window.history.replaceState(
    {
      ...window.history.state,
      seeviaKey: entryKey() ?? newEntryKey(),
      seeviaIndex: entryIndex() ?? 0,
    },
    "",
    window.location.href,
  );
}

function Page({ path }: { path: string }) {
  return path === pageRegistry.overview.href ? (
    <QuickOverview />
  ) : path === pageRegistry.privacy.href ? (
    <Policy type="privacy" />
  ) : path === pageRegistry.terms.href ? (
    <Policy type="terms" />
  ) : path === pageRegistry.information.href ? (
    <SiteInformation />
  ) : path === pageRegistry.contact.href ? (
    <Contact />
  ) : path === pageRegistry.partnership.href ? (
    <Partner />
  ) : path === pageRegistry.news.href ? (
    <News />
  ) : path === pageRegistry.community.href ? (
    <Community />
  ) : path === pageRegistry.about.href ? (
    <About />
  ) : path === pageRegistry.technology.href ? (
    <Technology />
  ) : path === pageRegistry.productPage.href ? (
    <Product />
  ) : (
    <Home />
  );
}

function App() {
  const [path, setPath] = useState(routePath);
  const activeKey = useRef(entryKey()!);
  const activeIndex = useRef(entryIndex() ?? 0);
  const scrollPositions = useRef(new Map<string, [number, number]>());
  const navigationId = useRef(0);
  const activeTransition = useRef<ViewTransition | null>(null);

  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveScroll = () => {
      scrollPositions.current.set(activeKey.current, [
        window.scrollX,
        window.scrollY,
      ]);
    };
    const focusTarget = (target: HTMLElement) => {
      if (!target.hasAttribute("tabindex")) {
        target.tabIndex = -1;
        target.addEventListener(
          "blur",
          () => target.removeAttribute("tabindex"),
          { once: true },
        );
      }
      target.focus({ preventScroll: true });
    };
    const restorePosition = (position: [number, number] | undefined) => {
      if (window.location.hash) {
        const id = decodeURIComponent(window.location.hash.slice(1));
        const target = document.getElementById(id);
        if (target) {
          focusTarget(target);
          target.scrollIntoView();
        }
      } else {
        const left = position?.[0] ?? 0;
        const top = position?.[1] ?? 0;
        const lenis = getLenis() ?? getPageLenis();
        if (lenis) {
          const wasStopped = lenis.isStopped;
          lenis.stop();
          if (!wasStopped) lenis.start();
          lenis.scrollTo(top, { immediate: true, force: true });
          if (left !== window.scrollX)
            window.scrollTo({ left, top, behavior: "instant" });
        } else {
          window.scrollTo({ left, top, behavior: "instant" });
        }
      }
    };
    const commit = (
      position?: [number, number],
      direction: "forward" | "back" = "forward",
      instant = false,
    ) => {
      const id = ++navigationId.current;
      activeTransition.current?.skipTransition();
      document.documentElement.dataset.routeDirection = direction;
      const update = () => {
        if (id !== navigationId.current) return;
        document.documentElement.classList.add("site-client-route");
        flushSync(() => setPath(routePath()));
        const heading = document.querySelector<HTMLElement>("main h1");
        if (heading && !window.location.hash) focusTarget(heading);
        restorePosition(position);
        document
          .querySelectorAll<HTMLImageElement>("main img")
          .forEach((image) => {
            if (image.complete) return;
            image.classList.add("site-media-loading");
            const ready = () => {
              image.classList.remove("site-media-loading");
              image.removeEventListener("load", ready);
              image.removeEventListener("error", ready);
            };
            image.addEventListener("load", ready);
            image.addEventListener("error", ready);
          });
      };
      if (document.startViewTransition && !motion.matches && !instant) {
        const transition = document.startViewTransition(update);
        activeTransition.current = transition;
        // Browsers reject `ready` when a newer navigation skips this transition.
        void transition.ready.catch(() => undefined);
        const clearTransition = () => {
          if (activeTransition.current === transition)
            activeTransition.current = null;
        };
        void transition.finished.then(clearTransition, clearTransition);
      } else {
        update();
      }
    };
    const onNavigate = (event: Event) => {
      const request = event as CustomEvent<{ href?: string; instant?: boolean }>;
      if (!request.detail?.href) return;
      const url = new URL(request.detail.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      request.preventDefault();
      if (url.href === window.location.href) {
        if (request.detail.instant) activeTransition.current?.skipTransition();
        restorePosition(undefined);
        return;
      }
      const previousPath = routePath();
      saveScroll();
      const key = newEntryKey();
      const nextIndex = activeIndex.current + 1;
      window.history.pushState(
        { ...window.history.state, seeviaKey: key, seeviaIndex: nextIndex },
        "",
        url.href,
      );
      activeKey.current = key;
      activeIndex.current = nextIndex;
      if (routePath() === previousPath) {
        restorePosition(undefined);
        window.dispatchEvent(new Event("hashchange"));
      } else {
        const from = pageOrder.indexOf(previousPath);
        const to = pageOrder.indexOf(routePath());
        commit(undefined, from >= 0 && to >= 0 && to < from ? "back" : "forward", request.detail.instant);
      }
    };
    const onPopState = () => {
      saveScroll();
      let key = entryKey();
      const nextIndex = entryIndex() ?? 0;
      const direction = nextIndex < activeIndex.current ? "back" : "forward";
      if (!key) {
        key = newEntryKey();
        window.history.replaceState(
          { ...window.history.state, seeviaKey: key, seeviaIndex: nextIndex },
          "",
          window.location.href,
        );
      }
      activeKey.current = key;
      activeIndex.current = nextIndex;
      commit(scrollPositions.current.get(activeKey.current), direction);
    };
    const onLinkClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (
        !link ||
        link.hasAttribute("download") ||
        // Standalone pages outside the React app (e.g. /mo-phong/) need a real page load.
        link.hasAttribute("data-full-load") ||
        (link.target && link.target !== "_self")
      )
        return;
      const url = new URL(link.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        (url.href === window.location.href && !link.hasAttribute("data-nav-top"))
      )
        return;
      event.preventDefault();
      navigateTo(url.href, { instant: link.hasAttribute("data-nav-top") });
    };
    window.addEventListener("seevia:navigate", onNavigate);
    window.addEventListener("popstate", onPopState);
    document.addEventListener("click", onLinkClick, true);
    return () => {
      navigationId.current += 1;
      activeTransition.current?.skipTransition();
      window.history.scrollRestoration = previousRestoration;
      window.removeEventListener("seevia:navigate", onNavigate);
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onLinkClick, true);
    };
  }, []);

  return (
    <>
      <SiteMotion routeKey={path} />
      <LanguageEffects path={path} />
      <Page path={path} />
      <SeeViaSupport />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
