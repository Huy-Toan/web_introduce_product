import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import AboutPage from "./pages/AboutUs";
import ContactPage from "./pages/Contact";
import LibraryPage from "./pages/Library";
import AdminLogin from "./pages/admin/login";
import News from "./pages/News";
import AdminDashboard from "./pages/admin/AdminDashboard";
// import AdminDashboard from "./pages/admin/home";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<LibraryPage />} />
        <Route path="/genre/:genreId" element={<LibraryPage />} />
        <Route path="/book/:bookId" element={<LibraryPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/news" element={<News />} />
        <Route path="/api/admin/login" element={<AdminLogin />} />
        <Route path="/api/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
