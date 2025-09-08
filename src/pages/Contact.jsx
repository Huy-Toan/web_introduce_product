// src/pages/ContactPage.jsx
import React, { useState, useMemo } from "react";
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import ContactHeader from "../components/ContactHeader";
import Breadcrumbs from "../components/Breadcrumbs";
import { getSiteOrigin, getCanonicalBase, isNonCanonicalHost } from "../lib/siteUrl";
import SEO from "../components/SEOhead";

function ContactPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    message: "",
    website: "", // honeypot
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const items = useMemo(() => [{ label: "Contact", to: "/contact" }], []);

  /* =================== SEO cho Contact =================== */
  const SITE_URL = getSiteOrigin();
  const BRAND = import.meta.env.VITE_BRAND_NAME || "ITXEASY";
    const canonical = `${getCanonicalBase()}/contact`;

  const pageTitle = `Contact | ${BRAND}`;
  const pageDesc =
    `Liên hệ ${BRAND}: địa chỉ, email, số điện thoại, WhatsApp. ` +
    `Gửi yêu cầu báo giá/đối tác về xuất khẩu nông sản Việt Nam.`;

  // Nếu có banner cho Contact, điền URL vào đây
  const ogImage = undefined;

  const keywords = [
    "Contact",
    "Liên hệ",
    BRAND,
    "xuất khẩu nông sản",
    "Vietnam export",
    "address",
    "email",
    "phone",
    "whatsapp",
  ];

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Contact", item: canonical },
    ],
  };

  const contactPageLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: pageTitle,
    description: pageDesc,
    url: canonical,
    isPartOf: { "@type": "WebSite", name: BRAND, url: SITE_URL },
  };

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-512.png`,
    email: "info@allxone.com",
    telephone: "+84 383 655 628",
    address: {
      "@type": "PostalAddress",
      streetAddress: "140 Nguyen Xi Street",
      addressLocality: "Binh Thanh District",
      addressRegion: "Ho Chi Minh City",
      addressCountry: "VN",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+84 7755 68646",
        contactType: "customer service",
        areaServed: ["VN", "Global"],
        availableLanguage: ["vi", "en"],
      },
    ],
  };
  /* ====================================================== */

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorMsg("");
    setSuccessMsg("");
  };

  const isEmail = (s = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Honeypot: nếu bot điền vào field ẩn => bỏ qua (trả về giống thành công)
    if (form.website.trim()) {
      setSuccessMsg("Gửi liên hệ thành công!");
      return;
    }

    // Bắt buộc các trường chính
    if (!form.full_name.trim() || !form.email.trim() || !form.message.trim()) {
      setErrorMsg("Vui lòng nhập Họ tên, Email và Nội dung.");
      return;
    }
    if (!isEmail(form.email.trim())) {
      setErrorMsg("Email không hợp lệ.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          message: form.message.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSuccessMsg("Gửi liên hệ thành công!");
        setForm({
          full_name: "",
          email: "",
          phone: "",
          address: "",
          message: "",
          website: "",
        });
      } else {
        setErrorMsg(data.error || "Gửi liên hệ thất bại.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Có lỗi xảy ra khi gửi liên hệ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* SEO đặt đầu trang để Browser Rendering “thấy” sớm */}
      <SEO
        title={pageTitle}
        description={pageDesc}
        url={canonical}
        image={ogImage}
        siteName={BRAND}
        keywords={keywords}
        ogType="website"
        twitterCard="summary_large_image"
        jsonLd={[breadcrumbLd, contactPageLd, organizationLd]}
      />

      <TopNavigation />
      <Breadcrumbs items={items} className="mt-16" />
      <ContactHeader />

      <main className="flex-1 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-6 md:p-12 max-w-7xl mx-auto">
          {/* Bản đồ */}
          <div className="w-full h-[550px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3765.875847108454!2d106.70612387485751!3d10.814355389336745!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752896e1d6ab59%3A0x5e91fd18b31c2a94!2zMTUwIMSQLiBOZ3V54buFbiBYw60sIFBoxrDhu51uZyAyNiwgQsOsbmggVGjhuqFuaCwgSOG7kyBDaMOtIE1pbmggNzAwMDAwLCBWaeG7h3QgTmFt!5e1!3m2!1svi!2s!4v1757319100387!5m2!1svi!2s"
              width="100%"
              height="100%"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-md border border-gray-300"
              title="ITXEASY Location"
            />
          </div>

          {/* Thông tin liên hệ + form */}
          <div>
            <h2 className="text-2xl font-bold text-yellow-700 mb-4">CONTACT US</h2>
            <div className="text-gray-800 space-y-2 mb-6">
              <p>
                <strong>Company:</strong> {BRAND}
              </p>
              <p>150 Nguyen Xi Street, Binh Thanh District, Ho Chi Minh City, Vietnam</p>
              <p>
                <strong>Mobile phone / Whatsapp:</strong> +84 7755 68646
              </p>
              <p>
                <strong>Email:</strong> info@itxeasy.com
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Honeypot hidden */}
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={handleChange}
                autoComplete="off"
                className="hidden"
                tabIndex={-1}
              />

              <input
                type="text"
                name="full_name"
                required
                placeholder="Full Name"
                value={form.full_name}
                onChange={handleChange}
                className="border px-4 py-2 rounded-md"
                maxLength={120}om
                autoComplete="name"
              />
              <input
                type="email"
                name="email"
                required
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="border px-4 py-2 rounded-md"
                maxLength={254}
                autoComplete="email"
                inputMode="email"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
                className="border px-4 py-2 rounded-md"
                maxLength={30}
                autoComplete="tel"
                inputMode="tel"
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
                className="border px-4 py-2 rounded-md"
                maxLength={255}
                autoComplete="street-address"
              />
              <textarea
                name="message"
                placeholder="Message"
                required
                value={form.message}
                onChange={handleChange}
                className="border px-4 py-2 rounded-md sm:col-span-2"
                rows={4}
                maxLength={5000}
              />

              {errorMsg && (
                <div className="sm:col-span-2 text-red-600 text-sm">{errorMsg}</div>
              )}
              {successMsg && (
                <div className="sm:col-span-2 text-green-600 text-sm">{successMsg}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="sm:col-span-2 bg-yellow-600 cursor-pointer hover:bg-yellow-700 text-white font-bold py-2 rounded-md disabled:opacity-50"
                aria-busy={loading}
              >
                {loading ? "Đang gửi..." : "SEND"}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ContactPage;
