import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import "./pages/i18n"
import {TProvider} from "./context/TContext";

import HomePage from "./pages/Home";
import AboutPage from "./pages/AboutUs";
import ContactPage from "./pages/Contact";
import Products from "./pages/Product";
import AdminLogin from "./pages/admin/login";
import ProductDetailPage from "./pages/ProductDetail";
import News from "./pages/News";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ScrollToTop from "./components/ScrollTop";
import News_Detail from "./pages/NewsDetail";
import RequireAuth from "./pages/admin/components/RequireAuth";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <TProvider>
    <BrowserRouter>
    <ScrollToTop />
      <Routes>
        <Route path="/*" element={<HomePage />} />
        <Route path="/genre/:genreId" element={<Products />} />
        <Route path="/product/product-detail/:idOrSlug" element={<ProductDetailPage />} />
        <Route path="/news/news-detail/:slug" element={<News_Detail />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/product" element={<Products />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/news" element={<News />} />
        <Route path="/api/admin/login" element={<AdminLogin />} />
        <Route
          path="/api/admin/dashboard"
          element={
            <RequireAuth>
              <AdminDashboard />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
    </TProvider>
  </StrictMode>,
);
