import React from "react";
import { Leaf, Tractor, Sprout } from "lucide-react";

function FeaturesStrip() {
  const items = [
    { icon: <Leaf className="w-7 h-7" />, title: "The Best Quality Standards" },
    { icon: <Tractor className="w-7 h-7" />, title: "Smart Organic Services" },
    { icon: <Sprout className="w-7 h-7" />, title: "Natural Healthy Products" },
  ];
  return (
    <section className="py-8 md:py-12 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-700">
                {it.icon}
              </div>
              <h3 className="font-semibold text-lg">{it.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesStrip;
