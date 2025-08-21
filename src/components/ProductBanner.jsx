function ProductHeaderBanner() {
  return (
    <div className="relative h-48 md:h-64 bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/banner_header.jpg')",
        }}
      >
        {/* Dark Overlay */}
       
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-wider">
            PRODUCTS
          </h1>
          
          {/* Breadcrumb */}
          <div className="flex items-center justify-center space-x-3 text-lg">
            <a 
              href="/" 
              className="text-gray-300 hover:text-white transition-colors duration-300"
            >
              Home
            </a>
            <span className="text-yellow-400 text-xl">/</span>
            <span className="text-yellow-400 font-semibold">PRODUCTS</span>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 w-16 h-16 border-2 border-yellow-400 opacity-20 rotate-45"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 border-2 border-yellow-400 opacity-20 rotate-12"></div>
    </div>
  );
}

export default ProductHeaderBanner;