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
  fil: "Filipino",
  tr: "Türkçe",
};


export function useGoogleTranslate(options = {}) {
  const {
    pageLanguage = "vi",
    initialLangs = [
      "vi","en","ja","ko","zh-CN","zh-TW",
      "fr","de","es","pt","it","nl",
      "ru","ar","hi","id","ms","th","fil","tr"
    ],
    persistKey = "gt_lang",
    mountId = "google_translate_element",
  } = options;

  const [langs] = useState(initialLangs);
  const [current, setCurrent] = useState(
    () => localStorage.getItem(persistKey) || pageLanguage
  );

  const scriptAdded = useRef(false);
  const inited = useRef(false);
  const cssInjected = useRef(false);

  // ===== CSS: Ẩn banner/tooltip/branding của Google =====
  function addGlobalCss() {
    if (cssInjected.current) return;
    const css = `
        .goog-te-banner-frame.skiptranslate,
        .goog-te-banner-frame,
        .goog-te-banner { display: none !important; }
        #goog-gt-tt, .goog-tooltip, .goog-te-balloon-frame { display: none !important; }
        .goog-te-gadget-icon, .goog-te-gadget img, .goog-logo-link, .goog-te-gadget span { display: none !important; }
        #${mountId} { display: none !important; } /* ẩn toàn bộ widget gốc */
        html, body, html.translated-ltr body, html.translated-rtl body { top: 0 !important; position: static !important; }
        iframe.skiptranslate,
        iframe[src*="translate.google"],
        iframe[src*="translate.googleapis"] { display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; width: 0 !important; border: 0 !important; }
        .goog-te-spinner-pos { display: none !important; }
    `;

    const style = document.createElement("style");
    style.setAttribute("data-gt-css", "1");
    style.textContent = css;
    document.head.appendChild(style);
    cssInjected.current = true;
    
  }

  // đảm bảo có mount trong DOM
  function ensureMount() {
    let el = document.getElementById(mountId);
    if (!el) {
      el = document.createElement("div");
      el.id = mountId;
      el.style.position = "fixed";
      el.style.right = "12px";
      el.style.bottom = "12px";
      el.style.zIndex = "99999";
      el.style.background = "#fff";
      el.style.padding = "6px 8px";
      el.style.borderRadius = "8px";
      el.style.boxShadow = "0 2px 10px rgba(0,0,0,.12)";
      document.body.appendChild(el);
    }
    return el;
  }

  // helper: poll một điều kiện
  function waitUntil(fn, maxMs = 10000, step = 120) {
    return new Promise((resolve) => {
      const t0 = Date.now();
      const timer = setInterval(() => {
        try { if (fn()) { clearInterval(timer); resolve(true); return; } } catch {}
        if (Date.now() - t0 > maxMs) { clearInterval(timer); resolve(false); }
      }, step);
    });
  }

  function setGoogTransCookie(source, target) {
    const cookie = `googtrans=/${source}/${target}`;
    document.cookie = `${cookie}; path=/`;
    const host = location.hostname.replace(/^www\./, "");
    document.cookie = `${cookie}; domain=.${host}; path=/`;
  }

  async function initWidget(included) {
    if (inited.current) return;
    ensureMount();
    addGlobalCss(); // << chèn CSS ẩn widget

    const ok = await waitUntil(
      () => !!(window.google && window.google.translate && window.google.translate.TranslateElement),
      15000
    );
    if (!ok) { console.error("[GT] google.translate.TranslateElement not ready"); return; }

    try {
      new window.google.translate.TranslateElement(
        {
          pageLanguage,
          includedLanguages: included,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false, // không bật banner
        },
        mountId
      );
      inited.current = true;
      // nếu có ngôn ngữ đã lưu → áp dụng ngay
      if (current && current !== pageLanguage) {
        const ok2 = await waitUntil(() => !!document.querySelector(".goog-te-combo"), 8000);
        if (ok2) {
          const combo = document.querySelector(".goog-te-combo");
          combo.value = current;
          combo.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    } catch (e) {
      console.error("[GT] init error:", e);
    }
  }

  // nạp script nếu chưa có
  useEffect(() => {
    ensureMount();
    addGlobalCss();
    
    if (window.google?.translate?.TranslateElement) {
      initWidget(langs.join(","));
      return;
    }

    if (scriptAdded.current) return;
    scriptAdded.current = true;

    const src = "https://translate.google.com/translate_a/element.js";
    if (!document.querySelector(`script[src^="${src}"]`)) {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => initWidget(langs.join(","));
      s.onerror = (e) => console.error("[GT] script load error", e);
      document.head.appendChild(s);
    } else {
      (async () => {
        const ok = await waitUntil(
          () => !!(window.google && window.google.translate && window.google.translate.TranslateElement),
          15000
        );
        if (ok) initWidget(langs.join(","));
      })();
    }
  }, []);

  const setLang = (code) => {
    setCurrent(code);
    localStorage.setItem(persistKey, code);
    setGoogTransCookie(pageLanguage, code);
    window.location.replace(window.location.href);
  };

  return { langs, current, setLang, mountId, pageLanguage };
}
