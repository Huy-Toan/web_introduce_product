import React from "react";
import SectionHeader from "./SectionHeader";
import { ArrowRight, Phone } from "lucide-react";

export default function ContactSection() {
  return (
    <section className="py-12 md:py-16 bg-neutral-50">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <SectionHeader center={false} kicker="Contact Now" title="Get in touch now" />
          <p className="text-neutral-600 mb-6">
            Lorem ipsum dolor sit amet, adipiscing elit. In hac habitasse platea dictumst.
            Duis porta quam ut finibus ultrices.
          </p>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700">
                <Phone className="w-4 h-4" />
              </span>
              <div>
                <p className="text-sm text-neutral-500">Have Question?</p>
                <a href="tel:+9288009850" className="font-semibold">Free +92 (8800)-9850</a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700">@</span>
              <div>
                <p className="text-sm text-neutral-500">Write Email</p>
                <a href="mailto:needhelp@company.com" className="font-semibold">needhelp@company.com</a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700">📍</span>
              <div>
                <p className="text-sm text-neutral-500">Visit Now</p>
                <p className="font-semibold">88 Broklyn Golden Street. USA</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Your Name" className="input" />
              <input type="email" placeholder="Email Address" className="input" />
              <textarea placeholder="Write a Message" rows={6} className="input md:col-span-2" />
              <div className="md:col-span-2">
                <button className="inline-flex items-center gap-2 rounded-full bg-green-600 text-white px-6 py-3 font-semibold hover:bg-green-700 transition">
                  Send a Message <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Tailwind input primitive */}
      <style>{`
        .input { @apply w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100; }
      `}</style>
    </section>
  );
}
