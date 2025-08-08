import React from 'react';
import { useNavigate } from "react-router";

function Banner() {
  const navigate = useNavigate();
  return (
    <section className="bg-[url('https://thietkekhainguyen.com/wp-content/uploads/2018/10/sach-anh-du-lich7-788x445.jpg')] bg-cover bg-center text-white py-20 mt-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-6">CHOOSE US – CHOOSE QUALITY</h1>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          Premium Vietnamese agricultural products delivered worldwide. 
          From our farm to your doorstep with nearly 10 years of export experience.
        </p>
        <div className="flex justify-center space-x-4">
          <button 
            className="bg-white text-green-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            onClick={() => navigate("/contact")}
          >
            Contact now
          </button>
        </div>
        
        {/* Optional: Statistics section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">10+</div>
            <div className="text-green-200">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">50+</div>
            <div className="text-green-200">Countries Served</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">1000+</div>
            <div className="text-green-200">Happy Customers</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Banner;