import { useEffect } from "react";
import { useLanguage, translate } from "./language";

const titles: Record<string, string> = {
  "/": "SeeVia — See a brighter way",
  "/san-pham": "Kính SeeVia — Một chiếc kính, nhiều cách nhìn thế giới",
  "/cong-nghe": "Công nghệ SeeVia — Từ điều nhìn thấy, đến điều nghe hiểu",
  "/ve-chung-toi": "Về chúng tôi — SeeVia",
  "/cong-dong": "Cộng đồng — SeeVia",
  "/tin-tuc": "Tin tức & Góc nhìn — SeeVia",
  "/doi-tac": "Đối tác & đồng hành — SeeVia",
  "/lien-he": "Liên hệ — SeeVia",
  "/chinh-sach-bao-mat": "Chính sách bảo mật — SeeVia",
  "/dieu-khoan-su-dung": "Điều khoản sử dụng — SeeVia",
  "/thong-tin": "Thông tin sử dụng website — SeeVia",
};
export default function LanguageEffects() {
  const language = useLanguage();
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active)
        document.title = translate(
          titles[location.pathname.replace(/\/$/, "") || "/"] ?? titles["/"],
          language,
        );
    });
    return () => {
      active = false;
    };
  }, [language]);
  return null;
}
