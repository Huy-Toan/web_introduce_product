import React from "react";
import { ArrowRight } from "lucide-react";

export default function ParallaxCTA() {
  return (
    <section
      className="relative py-20 bg-fixed bg-center bg-cover"
      style={{ backgroundImage: "url('/assets/images/backgrounds/unbeatable-one-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-green-900/50" />
      <div className="relative container mx-auto px-4 text-center text-white">
        <p className="text-sm md:text-base mb-2">We’re Selling Healthy Products</p>
        <h3 className="text-3xl md:text-5xl font-bold mb-6">
          Unbeatable Organic and <br className="hidden md:block" /> Agriculture Services
        </h3>
        <a
          href="/about"
          className="inline-flex items-center gap-2 rounded-full bg-white text-green-800 px-6 py-3 font-semibold hover:bg-green-50 transition"
        >
          Discover More <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}
