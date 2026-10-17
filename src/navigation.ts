// Các trang và vị trí nội dung dùng chung trên website.
import pageRegistry from "./support/pages.json";
export { pageRegistry };
export const destinations = {
  home: pageRegistry.home.href,
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
export type Destination = keyof typeof destinations;
export function navigate(destination?: Destination) {
  const path = destination ? destinations[destination] : null;
  if (path) {
    window.location.assign(path);
    return;
  }
  window.dispatchEvent(new Event("seevia:unavailable"));
}
