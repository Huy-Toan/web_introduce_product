import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import "./i18n.js";
import { TProvider } from "./context/TContext";

import LocaleSwitcherGT from "./components/LocaleSwitcherGT.jsx";
import TestTranslateBox from "./components/TestTranslate.jsx";
import HomePage from "./pages/Home";
import AboutPage from "./pages/AboutUs";
import FieldPage from "./pages/Field";
import ContactPage from "./pages/Contact";
import Products from "./pages/Product";
import AdminLogin from "./pages/admin/login";
import ProductDetailPage from "./pages/ProductDetail";
import News from "./pages/News";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ScrollToTop from "./components/ScrollTop";
import GlobalWhatsApp from "./components/GlobalWhatsApp";
import News_Detail from "./pages/NewsDetail";
import AdminRoute from "./pages/admin/components/AdminRoutes.jsx";
import UserChat from "./pages/UserChat";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <TProvider>
            <BrowserRouter>
                <LocaleSwitcherGT />
                <ScrollToTop />
                <GlobalWhatsApp />
                <Routes>
                    <Route path="/*" element={<HomePage />} />
                    <Route path="/news/news-detail/:slug" element={<News_Detail />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/what_we_do" element={<FieldPage />} />
                    <Route path="/product" element={<Products />} />
                    <Route path="/product/:parentSlug" element={<Products />} />
                    <Route path="/product/:parentSlug/:subSlug" element={<Products />} />
                    <Route path="/product/product-detail/:idOrSlug" element={<ProductDetailPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/chat" element={<UserChat />} />
                    <Route path="/api/admin/login" element={<AdminLogin />} />
                    <Route
                        path="/api/admin/dashboard"
                        element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </TProvider>
    </StrictMode>,
);