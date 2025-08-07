import React from "react";
import TopNavigation from "../components/Navigation";
import Footer from "../components/Footer";

function ContactPage() {
  return (
    <div className="min-h-screen mt-8 flex flex-col">
      <TopNavigation />

      <main className="flex-1 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-6 md:p-12 max-w-7xl mx-auto">
          {/* Bản đồ */}
          <div className="w-full h-[550px]">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3765.875847108454!2d106.70612387485751!3d10.814355389336745!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752896e1d6ab59%3A0x5e91fd18b31c2a94!2zMTUwIMSQLiBOZ3V54buFbiBYw60sIFBoxrDhu51uZyAyNiwgQsOsbmggVGjhuqFuaCwgSOG7kyBDaMOtIE1pbmggNzAwMDAwLCBWaeG7h3QgTmFt!5e1!3m2!1svi!2s!4v1754471849594!5m2!1svi!2s"
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
            <h2 className="text-2xl font-bold text-yellow-700 mb-4">CONTACT US</h2>
            <div className="text-gray-800 space-y-2 mb-6">
              <p><strong>Company:</strong> TAKIMEX GLOBAL CO., LTD</p>
              <p>
                LAND PARCEL NO. 2635, MAP SHEET NO. 26, STREET DL14, THOI HOA
                WARD, BEN CAT TOWN, BINH DUONG PROVINCE, VIETNAM
              </p>
              <p>
                <strong>Mobile phone / Whatsapp:</strong> +84 383 655 628 (Ms.
                Amy) / +84 905 926 612 (Ms. Jenny)
              </p>
              <p><strong>Email:</strong> info@takimex.com</p>
            </div>

            {/* Form liên lạc */}
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                className="border px-4 py-2 rounded-md"
              />
              <input
                type="email"
                placeholder="Email"
                className="border px-4 py-2 rounded-md"
              />
              <input
                type="text"
                placeholder="Phone"
                className="border px-4 py-2 rounded-md"
              />
              <input
                type="text"
                placeholder="Address"
                className="border px-4 py-2 rounded-md"
              />
              <textarea
                placeholder="Message"
                className="border px-4 py-2 rounded-md sm:col-span-2"
                rows="4"
              ></textarea>
              <button
                type="submit"
                className="sm:col-span-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 rounded-md"
              >
                SEND
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
