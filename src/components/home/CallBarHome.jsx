import React from "react";
import { Phone } from "lucide-react";

function CallBarHome({ phone = "", subtitle = "" }) {
  return (
    <section className="py-6 bg-green-600 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-xl md:text-2xl font-bold">Healthy products</h3>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
              <Phone className="w-5 h-5" />
            </span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-white/80 text-sm">{subtitle}</p>
            <a
              href={`tel:${phone.replace(/[^+0-9]/g, "")}`}
              className="font-semibold underline underline-offset-4"
            >
              {phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CallBarHome;
