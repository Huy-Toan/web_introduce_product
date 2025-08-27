import React from "react";
import SectionHeader from "./SectionHeader";
import { Quote } from "lucide-react";

export default function Testimonials() {
  const items = [
    { name: "Sarah Albert", role: "Customer", img: "/assets/images/testimonial/testimonial-1-1.jpg", text: "Lorem ipsum is simply free text dolor sit amet, consect notted adipisicing elit sed do eiusmod tempor incididunt." },
    { name: "Kevin Martin", role: "Customer", img: "/assets/images/testimonial/testimonial-1-2.jpg", text: "Free text dolor sit amet, adipisicing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { name: "Aleesha Brown", role: "Customer", img: "/assets/images/testimonial/testimonial-1-3.jpg", text: "Consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  ];
  return (
    <section className="py-12 md:py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        <SectionHeader kicker="Our Testimonials" title="What They’re talking about" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((t, idx) => (
            <article key={idx} className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-neutral-700">{t.text}</p>
              <div className="mt-6 flex items-center gap-4">
                <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-semibold">{t.name}</h4>
                  <p className="text-sm text-neutral-500">{t.role}</p>
                </div>
                <div className="ml-auto text-green-600"><Quote className="w-6 h-6" /></div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
