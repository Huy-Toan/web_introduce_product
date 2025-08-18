import { useNavigate } from "react-router";

function Banner() {
  const navigate = useNavigate();

  return (
    <section
      className="
        relative text-white
        bg-[url('/banner.jpg')] bg-cover bg-center bg-no-repeat
        min-h-[70vh]      
        md:min-h-screen 
        flex
      "
    >
      {/* lớp phủ làm tối ảnh nền cho dễ đọc chữ (tùy chọn) */}
      <div className="absolute inset-0 bg-black/30 md:bg-black/40" />

      <div className="container mx-auto px-4 relative z-10 flex-1 flex flex-col justify-center items-center text-center">
        {/* Thẻ nổi */}
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl !text-white font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
            PREMIUM VIETNAMESE FRUITS
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl !text-white mb-4 sm:mb-6 md:mb-8 leading-relaxed">
            Fresh, juicy, and naturally grown tropical fruits straight from
            Vietnam's finest farms to your table. Experience the real taste of
            nature!
          </p>
          <div className="flex justify-center">
            <button
              className="bg-white cursor-pointer text-green-800 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold transition-all duration-300 hover:transform hover:scale-105 group text-sm sm:text-base"
              onClick={() => navigate("/contact")}
            >
              <span className="flex items-center gap-2">
                Contact now
                <span className="transform transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </button>
          </div>
        </div>

        {/* Thống kê */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 lg:gap-8 mt-8 sm:mt-12 md:mt-16 w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-2">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">10+</div>
            <div className="text-green-200 text-xs sm:text-sm md:text-base">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">50+</div>
            <div className="text-green-200 text-xs sm:text-sm md:text-base">Countries Served</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">1000+</div>
            <div className="text-green-200 text-xs sm:text-sm md:text-base">Happy Customers</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Banner;
