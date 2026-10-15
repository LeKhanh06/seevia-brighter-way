import { useEffect } from "react";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import privacy from "./privacy.html?raw";
import terms from "./terms.html?raw";
import "./Policy.css";

export default function Policy({ type }: { type: "privacy" | "terms" }) {
  useEffect(() => {
    document.title = `${type === "privacy" ? "Chính sách bảo mật" : "Điều khoản sử dụng"} — SeeVia`;
  }, [type]);
  return (
    <div className="policy-page" id="top">
      <a className="skip-link" href="#policy-main">
        Đến nội dung chính
      </a>
      <Header active={type} />
      <main
        className="policy-document"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest(".print-button"))
            window.print();
        }}
        dangerouslySetInnerHTML={{
          __html: type === "privacy" ? privacy : terms,
        }}
      />
      <Footer />
    </div>
  );
}
