// src/lib/siteUrl.js
export function getSiteOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }
  const raw = (import.meta?.env?.VITE_SITE_URL || "https://itxeasy.com");
  return raw.replace(/\/+$/, "");
}

export function getCanonicalBase() {
  const CANON_HOST = (import.meta?.env?.VITE_CANONICAL_HOST || "").replace(/\/+$/, "");
  if (CANON_HOST) return `https://${CANON_HOST}`;
  return getSiteOrigin();
}

export function isNonCanonicalHost() {
  const CANON_HOST = (import.meta?.env?.VITE_CANONICAL_HOST || "").replace(/\/+$/, "");
  if (!CANON_HOST) return false;
  if (typeof window === "undefined") return false;
  return window.location.host !== CANON_HOST;
}
