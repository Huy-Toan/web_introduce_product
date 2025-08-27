import React from "react";
import SectionHeader from "./SectionHeader";

export default function ProjectsGrid({ items = [] }) {
  const data = (items || []).slice(0, 4).map((p, i) => ({
    title: p?.title || `Project ${i + 1}`,
    href: p?.slug ? `/products/${p.slug}` : "#",
    tag: ["healthy", "farming", "organic", "solution"][i % 4],
    img: p?.image_url || `/assets/images/project/project-one-${(i % 4) + 1}.jpg`,
  }));
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <SectionHeader center kicker="Our Latest Projects" title="Recently completed Projects" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((card, idx) => (
            <article key={idx} className="group relative overflow-hidden rounded-2xl shadow-sm">
              <img src={card.img} alt={card.title} className="h-56 w-full object-cover transition group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <span className="text-xs uppercase tracking-wide text-green-300">{card.tag}</span>
                <h3 className="text-lg font-semibold leading-tight">
                  <a href={card.href} className="hover:underline">{card.title}</a>
                </h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
