import React from "react";
import { ArrowRight, Sprout } from "lucide-react";

export default function CTASection() {
  return (
    <section
      className="relative py-16 md:py-20 bg-center bg-cover"
      style={{ backgroundImage: "url('/assets/images/backgrounds/cta-one-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-green-900/60" />
      <div className="relative container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div className="flex items-center gap-4">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <Sprout className="w-6 h-6" />
            </span>
            <h3 className="text-2xl md:text-3xl font-bold leading-snug">
              We’re popular leader in agriculture <br className="hidden md:block" /> & Organic market.
            </h3>
          </div>
          <a
            href="/about"
            className="inline-flex items-center gap-2 rounded-full bg-white text-green-800 px-6 py-3 font-semibold hover:bg-green-50 transition"
          >
            Discover More <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
