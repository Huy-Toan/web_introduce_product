import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";

function Footer() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/parent_categories");
        const data = await res.json();
        setCategories(data.parents || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="bg-white border-t border-gray-200 mt-12 text-sm text-gray-700 leading-relaxed">
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Company Info */}
        <div>
          <div
            className="flex items-center space-x-2 cursor-pointer mb-4"
            onClick={() => handleNavigation("/")}
          >
            <img
              src="https://allxone.vn/wp-content/uploads/2022/08/cropped-logo1-150x31.png"
              alt="AllXone Logo"
              className="h-10 w-auto"
            />
          </div>
          <p className="mb-2">140 Nguyen Xi Street, Binh Thanh District, Ho Chi Minh City, Vietnam</p>
          <p className="mb-2">Tel: +84 383 655 628</p>
          <p>Email: support@allxone.com</p>
        </div>

        {/* Services */}
        <div>
          <h4 className="font-semibold text-yellow-700 mb-3">Service</h4>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => handleNavigation("/")}
                className="hover:text-blue-600 cursor-pointer"
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/about")}
                className="hover:text-blue-600 cursor-pointer"
              >
                About Us
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigation("/product")}
                className="hover:text-blue-600 cursor-pointer"
              >
                Products
              </button>
            </li>

            <li>
              <button
                onClick={() => handleNavigation("/news")}
                className="hover:text-blue-600 cursor-pointer"
              >
                News
              </button>
            </li>

            <li>
              <button
                onClick={() => handleNavigation("/contact")}
                className="hover:text-blue-600 cursor-pointer"
              >
                Contact
              </button>
            </li>

          </ul>
        </div>

        {/* Products */}
        <div>
          <h4 className="font-semibold text-yellow-700 mb-3">Products</h4>
          <ul className="space-y-2">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => handleNavigation(`/product/${cat.slug}`)}
                    className="hover:text-blue-600 cursor-pointer"
                  >
                    {cat.name}
                  </button>
                </li>
              ))
            ) : (
              <li className="text-gray-500 italic">Loading...</li>
            )}
          </ul>
        </div>

        {/* Register */}
        <div>
          <h4 className="font-semibold text-yellow-700 mb-3">Register</h4>
          <p className="mb-3">Subscribe for updates</p>
          <div className="flex items-center border rounded overflow-hidden mb-4">
            <input
              type="email"
              placeholder="Email..."
              className="px-3 py-3 w-full outline-none text-sm"
            />
            <button className="bg-yellow-600 cursor-pointer text-white px-4 py-3 hover:bg-yellow-700">
              ➤
            </button>
          </div>

          <div className="flex space-x-4 text-2xl text-gray-600">
            <a href="https://facebook.com" className="hover:text-blue-600">
              <FaFacebook />
            </a>
            <a href="https://instagram.com" className="hover:text-pink-500">
              <FaInstagram />
            </a>
            <a href="https://youtube.com" className="hover:text-red-600">
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
