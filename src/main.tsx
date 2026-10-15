import React from "react";
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
import Home from "../HomePage/Home";
import Product from "../ProductPage/Product";
import Technology from "../TechnologyPage/Technology";
import About from "../AboutPage/About";
import Community from "../CommunityPage/Community";
import News from "../NewsPage/News";
import Partner from "../PartnerPage/Partner";
import Contact from "../ContactPage/Contact";
import SiteMotion from "./components/SiteMotion";
import SiteInformation from "./components/SiteInformation";
import Policy from "../PolicyPage/Policy";
import LanguageEffects from "./i18n/LanguageEffects";
import "./styles/global.css";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SiteMotion />
    <LanguageEffects />
    {window.location.pathname.replace(/\/$/, "") === "/chinh-sach-bao-mat" ? (
      <Policy type="privacy" />
    ) : window.location.pathname.replace(/\/$/, "") === "/dieu-khoan-su-dung" ? (
      <Policy type="terms" />
    ) : window.location.pathname.replace(/\/$/, "") === "/thong-tin" ? (
      <SiteInformation />
    ) : window.location.pathname.replace(/\/$/, "") === "/lien-he" ? (
      <Contact />
    ) : window.location.pathname.replace(/\/$/, "") === "/doi-tac" ? (
      <Partner />
    ) : window.location.pathname.replace(/\/$/, "") === "/tin-tuc" ? (
      <News />
    ) : window.location.pathname.replace(/\/$/, "") === "/cong-dong" ? (
      <Community />
    ) : window.location.pathname.replace(/\/$/, "") === "/ve-chung-toi" ? (
      <About />
    ) : window.location.pathname.replace(/\/$/, "") === "/cong-nghe" ? (
      <Technology />
    ) : window.location.pathname.replace(/\/$/, "") === "/san-pham" ? (
      <Product />
    ) : (
      <Home />
    )}
  </React.StrictMode>,
);
