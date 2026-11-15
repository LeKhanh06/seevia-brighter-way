// Các trang và vị trí nội dung dùng chung trên website.
import pageRegistry from "./support/pages.json";
export { pageRegistry };
export const destinations = {
  home: pageRegistry.home.href,
  overview: pageRegistry.overview.href,
  information: pageRegistry.information.href,
  product: pageRegistry.productPage.href,
  productPage: pageRegistry.productPage.href,
  technology: pageRegistry.technology.href,
  about: pageRegistry.about.href,
  community: pageRegistry.community.href,
  news: pageRegistry.news.href,
  partnership: pageRegistry.partnership.href,
  contact: pageRegistry.contact.href,
  capabilities: "/#capabilities",
  faq: pageRegistry.faq.href,
  feedback: "/lien-he#letter",
  design: "/san-pham#design",
  colors: "/san-pham#colors",
  founders: "/ve-chung-toi#founders",
  story: "/ve-chung-toi#story",
  mission: "/ve-chung-toi#mission",
  privacy: pageRegistry.privacy.href,
  terms: pageRegistry.terms.href,
} as const;
export const pageOrder: string[] = [
  destinations.home,
  destinations.overview,
  destinations.productPage,
  destinations.technology,
  destinations.about,
  destinations.community,
  destinations.news,
  destinations.partnership,
  destinations.contact,
];
export type Destination = keyof typeof destinations;
type NavigationOptions = { instant?: boolean };
export function navigateTo(path: string, options: NavigationOptions = {}) {
  const href = new URL(path, window.location.href);
  if (href.origin !== window.location.origin) return;
  const request = new CustomEvent("seevia:navigate", {
    cancelable: true,
    detail: { href: href.href, instant: options.instant },
  });
  // The client router handles this event; the fallback keeps navigation usable.
  if (window.dispatchEvent(request)) window.location.assign(href.href);
}
export function navigate(destination?: Destination, options: NavigationOptions = {}) {
  const path = destination ? destinations[destination] : null;
  if (path) {
    navigateTo(path, options);
    return;
  }
  window.dispatchEvent(new Event("seevia:unavailable"));
}
