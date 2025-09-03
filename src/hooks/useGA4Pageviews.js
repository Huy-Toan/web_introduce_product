// src/hooks/useGA4Pageviews.js
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const allowedHosts = (import.meta.env.VITE_GA_ALLOWED_HOSTS || "localhost,127.0.0.1")
    .split(",").map(s => s.trim());

export function useGA4Pageviews({ exclude = [] } = {}) {
    const loc = useLocation();
    const last = useRef({ path: "", t: 0 }); // chống double-fire dev/StrictMode

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!allowedHosts.includes(window.location.hostname)) return;
        if (!window.gtag) return;

        const path = loc.pathname + loc.search + loc.hash;

        // bỏ qua một số path (vd: admin)
        if (exclude.some(rule => typeof rule === "string" ? path.startsWith(rule) : rule.test(path))) {
            return;
        }

        // chống trùng khi StrictMode dev mount 2 lần
        const now = Date.now();
        if (last.current.path === path && now - last.current.t < 600) return;
        last.current = { path, t: now };

        const page_location = window.location.origin + path;
        const page_title = document.title || undefined;

        // fire
        window.gtag("event", "page_view", { page_title, page_path: path, page_location });
        if (import.meta.env.DEV) console.debug("[GA4] page_view", { page_title, path });
    }, [loc.pathname, loc.search, loc.hash, exclude]);
}
