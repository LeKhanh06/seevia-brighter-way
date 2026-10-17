import { pageRegistry } from "./navigation";
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
import SeeViaSupport from "./components/SeeViaSupport";
import "./styles/global.css";

import "./styles/retained-typography.css";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SiteMotion />
    <LanguageEffects />
    {window.location.pathname.replace(/\/$/, "") ===
    pageRegistry.privacy.href ? (
      <Policy type="privacy" />
    ) : window.location.pathname.replace(/\/$/, "") ===
      pageRegistry.terms.href ? (
      <Policy type="terms" />
    ) : window.location.pathname.replace(/\/$/, "") ===
      pageRegistry.information.href ? (
      <SiteInformation />
    ) : window.location.pathname.replace(/\/$/, "") ===
      pageRegistry.contact.href ? (
      <Contact />
    ) : window.location.pathname.replace(/\/$/, "") ===
      pageRegistry.partnership.href ? (
      <Partner />
    ) : window.location.pathname.replace(/\/$/, "") ===
      pageRegistry.news.href ? (
      <News />
    ) : window.location.pathname.replace(/\/$/, "") ===
      pageRegistry.community.href ? (
      <Community />
    ) : window.location.pathname.replace(/\/$/, "") ===
      pageRegistry.about.href ? (
      <About />
    ) : window.location.pathname.replace(/\/$/, "") ===
      pageRegistry.technology.href ? (
      <Technology />
    ) : window.location.pathname.replace(/\/$/, "") ===
      pageRegistry.productPage.href ? (
      <Product />
    ) : (
      <Home />
    )}
    <SeeViaSupport />
  </React.StrictMode>,
);
