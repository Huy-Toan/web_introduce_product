function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12 text-sm text-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="text-lg font-semibold text-yellow-700 mb-2">AllXone</h3>
          <p className="mb-1">123 Street, Hanoi, Vietnam</p>
          <p className="mb-1">Tel: +84 123 456 789</p>
          <p>Email: support@allxone.com</p>
        </div>

        {/* Services */}
        <div>
          <h4 className="font-semibold text-yellow-700 mb-2">Service</h4>
          <ul className="space-y-1">
            <li><a href="#" className="hover:text-blue-600">Home</a></li>
            <li><a href="#" className="hover:text-blue-600">About Us</a></li>
            <li><a href="#" className="hover:text-blue-600">Products</a></li>
            <li><a href="#" className="hover:text-blue-600">Contact</a></li>
          </ul>
        </div>

        {/* Products */}
        <div>
          <h4 className="font-semibold text-yellow-700 mb-2">Products</h4>
          <ul className="space-y-1">
            <li><a href="#" className="hover:text-blue-600">Fiction</a></li>
            <li><a href="#" className="hover:text-blue-600">Non-fiction</a></li>
            <li><a href="#" className="hover:text-blue-600">Children</a></li>
            <li><a href="#" className="hover:text-blue-600">Others</a></li>
          </ul>
        </div>

        {/* Register */}
        <div>
          <h4 className="font-semibold text-yellow-700 mb-2">Register</h4>
          <p className="mb-2">Subscribe for updates</p>
          <div className="flex items-center border rounded overflow-hidden">
            <input
              type="email"
              placeholder="Email..."
              className="px-3 py-2 w-full outline-none text-sm"
            />
            <button className="bg-yellow-600 text-white px-3 py-2 hover:bg-yellow-700">
              ➤
            </button>
          </div>

          <div className="flex space-x-3 mt-4">
            <a href="#"><img src="/icons/facebook.svg" alt="Facebook" className="w-5 h-5" /></a>
            <a href="#"><img src="/icons/instagram.svg" alt="Instagram" className="w-5 h-5" /></a>
            <a href="#"><img src="/icons/youtube.svg" alt="YouTube" className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
