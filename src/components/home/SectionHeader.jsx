import React from "react";

export default function SectionHeader({ kicker, title, center = true, className = "" }) {
  return (
    <div className={`mb-8 ${center ? "text-center" : "text-left"} ${className}`}>
      {kicker && <p className="uppercase tracking-wide text-green-600 font-medium mb-2">{kicker}</p>}
      {title && <h2 className="text-2xl md:text-4xl font-bold leading-tight">{title}</h2>}
    </div>
  );
}
