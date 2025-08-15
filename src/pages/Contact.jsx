import React, { useState } from "react";
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";
import ContactHeader from "../components/ContactHeader";

function ContactPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

     console.log("Form submit:", form);
    // Kiểm tra rỗng
    for (const key in form) {
      if (!form[key].trim()) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
      }
    }

    try {
      setLoading(true);
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        alert("Gửi liên hệ thành công!");
        setForm({
          full_name: "",
          email: "",
          phone: "",
          address: "",
          message: "",
        });
      } else {
        alert(data.error || "Gửi liên hệ thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi gửi liên hệ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mt-8 flex flex-col">
      <TopNavigation />
      <ContactHeader />

      <main className="flex-1 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-6 md:p-12 max-w-7xl mx-auto">
          {/* Bản đồ */}
          <div className="w-full h-[550px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4868.086271788683!2d106.70651917591793!3d10.814179189336869!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528971c1abe1f%3A0x41b605213a5e13c3!2zMTQwIMSQLiBOZ3V54buFbiBYw60sIFBoxrDhu51uZyAyNiwgQsOsbmggVGjhuqFuaCwgSOG7kyBDaMOtIE1pbmgsIFZp4buHdCBOYW0!5e1!3m2!1svi!2s!4v1755280383031!5m2!1svi!2s"
              width="100%"
              height="100%"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-md border border-gray-300"
            />
          </div>

          {/* Thông tin liên hệ + form */}
          <div>
            <h2 className="text-2xl font-bold text-yellow-700 mb-4">
              CONTACT US
            </h2>
            <div className="text-gray-800 space-y-2 mb-6">
              <p>
                <strong>Company:</strong> ALLXONE
              </p>
              <p>
                140 Nguyen Xi Street, Binh Thanh District, Ho Chi Minh City,
                Vietnam
              </p>
              <p>
                <strong>Mobile phone / Whatsapp:</strong> +84 383 655 628 (Ms.
                Amy) / +84 905 926 612 (Ms. Jenny)
              </p>
              <p>
                <strong>Email:</strong> info@allxone.com
              </p>
            </div>

            {/* Form liên lạc */}
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <input
                type="text"
                name="full_name"
                required
                placeholder="Full Name"
                value={form.full_name}
                onChange={handleChange}
                className="border px-4 py-2 rounded-md"
              />
              <input
                type="email"
                name="email"
                required
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="border px-4 py-2 rounded-md"
              />
              <input
                type="text"
                name="phone"
                required
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
                className="border px-4 py-2 rounded-md"
              />
              <input
                type="text"
                name="address"
                required
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
                className="border px-4 py-2 rounded-md"
              />
              <textarea
                name="message"
                placeholder="Message"
                required
                value={form.message}
                onChange={handleChange}
                className="border px-4 py-2 rounded-md sm:col-span-2"
                rows="4"
              ></textarea>
              <button
                type="submit"
                disabled={loading}
                className="sm:col-span-2 bg-yellow-600 cursor-pointer hover:bg-yellow-700 text-white font-bold py-2 rounded-md disabled:opacity-50"
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
