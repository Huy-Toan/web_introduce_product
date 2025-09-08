// src/hooks/useGoogleTranslate.js
import { useEffect, useRef, useState } from "react";

export const LANG_LABELS = {
  vi: "Tiếng Việt",
  en: "English",
  ja: "日本語",
  ko: "한국어",
  "zh-CN": "中文(简体)",
  "zh-TW": "中文(繁體)",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
  pt: "Português",
  it: "Italiano",
  nl: "Nederlands",
  ru: "Русский",
  ar: "العربية",
  hi: "हिन्दी",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  th: "ไทย",
  tr: "Türkçe",
};

<<<<<<< HEAD
const GOOGLE_LANG_MAP = { fil: "tl" };
const normalizeForGoogle = (code) => GOOGLE_LANG_MAP[code] || code;

=======
>>>>>>> b5f4e15 (fix gg translates)
export function useGoogleTranslate(options = {}) {
  const {
    pageLanguage = "vi",
    initialLangs = [
<<<<<<< HEAD
      "vi","en","ja","ko","zh-CN","zh-TW",
      "fr","de","es","pt","it","nl",
      "ru","ar","hi","id","ms","th","tr" 
=======
      "vi", "en", "ja", "ko", "zh-CN", "zh-TW",
      "fr", "de", "es", "pt", "it", "nl",
      "ru", "ar", "hi", "id", "ms", "th", "fil", "tr"
>>>>>>> b5f4e15 (fix gg translates)
    ],
    persistKey = "gt_lang",
    mountId = "google_translate_element",
  } = options;

  const [langs] = useState(initialLangs);
<<<<<<< HEAD
  const [current, setCurrent] = useState(() => {
    const raw = localStorage.getItem(persistKey) || pageLanguage;
    return normalizeForGoogle(raw);
  });
=======
  const [current, setCurrent] = useState(
    () => {
      try { return localStorage.getItem(persistKey) || pageLanguage; }
      catch { return pageLanguage; }
    }
  );
>>>>>>> b5f4e15 (fix gg translates)

  const scriptAdded = useRef(false);
  const inited = useRef(false);
  const cssInjected = useRef(false);

<<<<<<< HEAD
=======
  // ===== helpers =====
  function rootHost() {
    return location.hostname.replace(/^www\./, "");
  }

  function eraseGoogTransCookies() {
    const host = rootHost();
    // xóa ở cả scope hiện tại & root-domain
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = `googtrans=; domain=.${host}; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }

  function setGoogTransCookie(source, target) {
    const cookie = `googtrans=/${source}/${target}`;
    const host = rootHost();
    // set ở cả hai scope để chắc ăn
    document.cookie = `${cookie}; path=/`;
    document.cookie = `${cookie}; domain=.${host}; path=/`;
  }

  // ===== CSS: ẩn banner/branding nhưng KHÔNG display:none iframe =====
>>>>>>> b5f4e15 (fix gg translates)
  function addGlobalCss() {
    if (cssInjected.current) return;
    const css = `
      .goog-te-banner-frame.skiptranslate,
      .goog-te-banner-frame,
<<<<<<< HEAD
      .goog-te-banner { height:0 !important; visibility:hidden !important; opacity:0 !important; }

      #goog-gt-tt, .goog-tooltip, .goog-te-balloon-frame { display:none !important; }
      .goog-te-gadget-icon, .goog-te-gadget img, .goog-logo-link, .goog-te-gadget span { display:none !important; }
      #${mountId} { display:none !important; }

      iframe.skiptranslate,
      iframe[src*="translate.google"],
      iframe[src*="translate.googleapis"] {
        position:absolute !important;
        width:1px !important;
        height:1px !important;
        opacity:0 !important;
        pointer-events:none !important;
        border:0 !important;
        clip:rect(0 0 0 0) !important;
        clip-path:inset(50%) !important;
        overflow:hidden !important;
      }

      html, body, html.translated-ltr body, html.translated-rtl body {
        top:0 !important; position:static !important;
      }
=======
      .goog-te-banner { display: none !important; }
      #goog-gt-tt, .goog-tooltip, .goog-te-balloon-frame { display: none !important; }
      .goog-te-gadget-icon, .goog-te-gadget img, .goog-logo-link, .goog-te-gadget span { display: none !important; }
      #${mountId} { display: none !important; } /* ẩn widget gốc */
      html, body, html.translated-ltr body, html.translated-rtl body { top: 0 !important; position: static !important; }

      /* Đẩy iframe ra ngoài màn hình để vẫn hoạt động */
      iframe.skiptranslate,
      iframe[src*="translate.google"],
      iframe[src*="translate.googleapis"] {
        position: fixed !important;
        top: -10000px !important;
        left: -10000px !important;
        width: 1px !important;
        height: 1px !important;
        opacity: 0 !important;
        pointer-events: none !important;
        border: 0 !important;
        visibility: hidden !important;
      }
      .goog-te-spinner-pos { display: none !important; }
>>>>>>> b5f4e15 (fix gg translates)
    `;
    const style = document.createElement("style");
    style.setAttribute("data-gt-css", "1");
    style.textContent = css;
    document.head.appendChild(style);
    cssInjected.current = true;
  }

  function ensureMount() {
    let el = document.getElementById(mountId);
    if (!el) {
      el = document.createElement("div");
      el.id = mountId;
      el.style.position = "fixed";
      el.style.right = "12px";
      el.style.bottom = "12px";
      el.style.zIndex = "2147483647";
      el.style.background = "#fff";
      el.style.padding = "6px 8px";
      el.style.borderRadius = "8px";
      el.style.boxShadow = "0 2px 10px rgba(0,0,0,.12)";
      document.body.appendChild(el);
    }
    return el;
  }

  function waitUntil(fn, maxMs = 10000, step = 120) {
    return new Promise((resolve) => {
      const t0 = Date.now();
      const timer = setInterval(() => {
        try { if (fn()) { clearInterval(timer); resolve(true); return; } } catch { }
        if (Date.now() - t0 > maxMs) { clearInterval(timer); resolve(false); }
      }, step);
    });
  }

<<<<<<< HEAD
  function getApexDomain(hostname = location.hostname) {
    const parts = hostname.split('.');
    if (parts.length >= 2) return `.${parts.slice(-2).join('.')}`;
    return `.${hostname}`;
  }

  function deleteCookieAllVariants(name = "googtrans") {
    const host = location.hostname.replace(/^www\./, "");
    const apex = getApexDomain(host);
    const paths = ["/", location.pathname || "/"];
    const domains = [host, `.${host}`, apex, location.hostname];

    for (const d of new Set(domains)) {
      for (const p of new Set(paths)) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${p}; domain=${d}`;
      }
    }
    for (const p of new Set(paths)) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${p}`;
    }
  }

  function findTopCookieDomain() {
    const host = location.hostname;
    const parts = host.split('.');
    for (let i = 0; i <= parts.length - 2; i++) {
      const candidate = '.' + parts.slice(i).join('.');
      const testName = `__gt_test_${Math.random().toString(36).slice(2)}`;
      document.cookie = `${testName}=1; path=/; domain=${candidate}`;
      const ok = document.cookie.includes(`${testName}=1`);
      document.cookie = `${testName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${candidate}`;
      if (ok) return candidate;
    }
    return host;
  }

  function setGoogTransCookie(source, target) {
    deleteCookieAllVariants("googtrans");
    const topDomain = findTopCookieDomain();
    const value = `/${source}/${target}`;
    const expires = new Date(Date.now() + 365*24*60*60*1000).toUTCString();
    document.cookie = `googtrans=${value}; expires=${expires}; path=/; domain=${topDomain}`;
  }

  async function initWidget() {
=======
  async function initWidget(included) {
>>>>>>> b5f4e15 (fix gg translates)
    if (inited.current) return;
    ensureMount();
    addGlobalCss();

    const ok = await waitUntil(
      () => !!(window.google && window.google.translate && window.google.translate.TranslateElement),
      15000
    );
    if (!ok) { console.error("[GT] google.translate.TranslateElement not ready"); return; }

    try {
      const includedNormalized = Array.from(
        new Set(langs.map(normalizeForGoogle))
      ).join(",");

      new window.google.translate.TranslateElement(
        {
          pageLanguage,
          includedLanguages: includedNormalized,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        mountId
      );
      inited.current = true;

<<<<<<< HEAD
=======
      // nếu có ngôn ngữ đã lưu → áp dụng ngay (không reload)
>>>>>>> b5f4e15 (fix gg translates)
      if (current && current !== pageLanguage) {
        const ok2 = await waitUntil(() => !!document.querySelector(".goog-te-combo"), 8000);
        if (ok2) {
          eraseGoogTransCookies();
          setGoogTransCookie(pageLanguage, current);
          const combo = document.querySelector(".goog-te-combo");
          combo.value = current; // current đã là mã normalized
          combo.dispatchEvent(new Event("change", { bubbles: true }));
          // lần 2 cho chắc timing
          setTimeout(() => {
            combo.value = current;
            combo.dispatchEvent(new Event("change", { bubbles: true }));
          }, 50);
        }
      }
    } catch (e) {
      console.error("[GT] init error:", e);
    }
  }

  useEffect(() => {
    ensureMount();
    addGlobalCss();

<<<<<<< HEAD
    if (window.google?.translate?.TranslateElement) {
      initWidget();
=======
    const included = langs.join(",");

    if (window.google?.translate?.TranslateElement) {
      initWidget(included);
>>>>>>> b5f4e15 (fix gg translates)
      return;
    }

    if (scriptAdded.current) {
      (async () => {
        const ok = await waitUntil(
          () => !!(window.google && window.google.translate && window.google.translate.TranslateElement),
          15000
        );
        if (ok) initWidget(included);
      })();
      return;
    }
    scriptAdded.current = true;

    // dùng callback để chắc chắn init sau khi tải xong
    const CB = "__gtInit__" + Math.random().toString(36).slice(2);
    window[CB] = () => initWidget(included);

    const base = "https://translate.google.com/translate_a/element.js";
    const src = `${base}?cb=${CB}`;

    if (!document.querySelector(`script[src*="translate_a/element.js"]`)) {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
<<<<<<< HEAD
      s.onload = () => initWidget();
      s.onerror = (e) => console.error("[GT] script load error", e);
=======
      s.onerror = (e) => {
        console.error("[GT] script load error", e);
        // Fallback: chờ lib rồi init nếu cb không gọi được
        (async () => {
          const ok = await waitUntil(
            () => !!(window.google && window.google.translate && window.google.translate.TranslateElement),
            15000
          );
          if (ok) initWidget(included);
        })();
      };
>>>>>>> b5f4e15 (fix gg translates)
      document.head.appendChild(s);
    } else {
      (async () => {
        const ok = await waitUntil(
          () => !!(window.google && window.google.translate && window.google.translate.TranslateElement),
          15000
        );
<<<<<<< HEAD
        if (ok) initWidget();
=======
        if (ok) initWidget(included);
>>>>>>> b5f4e15 (fix gg translates)
      })();
    }

    return () => { try { delete window[CB]; } catch { } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

<<<<<<< HEAD
  const setLang = (code) => {
    const gCode = normalizeForGoogle(code);
    setCurrent(gCode);
    localStorage.setItem(persistKey, gCode);
    setGoogTransCookie(pageLanguage, gCode);
    try { document.documentElement.lang = gCode; } catch {}
    window.location.reload();
  };
=======
  // Thêm (nếu chưa có) helper xóa cookie cũ ở trên file:
  function rootHost() { return location.hostname.replace(/^www\./, ""); }
  function eraseGoogTransCookies() {
    const host = rootHost();
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = `googtrans=; domain=.${host}; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
>>>>>>> b5f4e15 (fix gg translates)

  // GIỮ nguyên hàm setGoogTransCookie bạn đang có.
  // --- Thay thế nguyên hàm setLang hiện tại bằng bản luôn reload ---
  // trong hook
  const setLang = (code) => {
    try { localStorage.setItem(persistKey, code); } catch { }
    eraseGoogTransCookies();
    setGoogTransCookie(pageLanguage, code);
    window.location.reload(); // 👈 sạch & ngắn nhất
  };
  return { langs, current, setLang, mountId, pageLanguage };
}