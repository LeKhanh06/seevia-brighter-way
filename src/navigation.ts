// Các trang và vị trí nội dung dùng chung trên website.
export const destinations = {
  home: "/",
  product: "/san-pham",
  productPage: "/san-pham",
  technology: "/cong-nghe",
  about: "/ve-chung-toi",
  community: "/cong-dong",
  news: "/tin-tuc",
  partnership: "/doi-tac",
  contact: "/lien-he",
  capabilities: "/#capabilities",
  faq: "/san-pham#product-faq",
  feedback: "/lien-he#letter",
  design: "/san-pham#design",
  colors: "/san-pham#colors",
  founders: "/ve-chung-toi#founders",
  story: "/ve-chung-toi#story",
  mission: "/ve-chung-toi#mission",
  privacy: "/chinh-sach-bao-mat",
  terms: "/dieu-khoan-su-dung",
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
