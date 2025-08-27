import React from "react";
import { Wheat, Sprout, Droplets, Leaf } from "lucide-react";

export default function StatsStrip() {
  const stats = [
    { icon: <Wheat className="w-6 h-6" />, value: 6420, label: "Agriculture Products" },
    { icon: <Sprout className="w-6 h-6" />, value: 8800, label: "Projects completed" },
    { icon: <Droplets className="w-6 h-6" />, value: 9360, label: "Satisfied customers" },
    { icon: <Leaf className="w-6 h-6" />, value: 1070, label: "Expert farmers" },
  ];
  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <li key={i} className="rounded-2xl bg-neutral-50 p-6 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
                {s.icon}
              </div>
              <div className="text-3xl font-bold tabular-nums">{s.value.toLocaleString()}</div>
              <p className="mt-1 text-sm text-neutral-600">{s.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
