// src/seo/SEO.js
import { useEffect, useRef } from 'react'

function setMeta(name, content) {
  if (!content) return
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setOG(property, content) {
  if (!content) return
  let el = document.querySelector(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel, href, extra = {}) {
  if (!href) return
  let el = document.querySelector(`link[rel="${rel}"]${extra.hreflang ? `[hreflang="${extra.hreflang}"]` : ''}`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    if (extra.hreflang) el.setAttribute('hreflang', extra.hreflang)
    if (extra.as) el.setAttribute('as', extra.as)
    if (extra.type) el.setAttribute('type', extra.type)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

const clamp = (s = '', n) => (s && s.length > n ? s.slice(0, n - 1).trim() + '…' : s || '')
export const stripMd = (md = '') =>
  md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/[#>*_~\-`]+/g, ' ')
    .replace(/<\/?[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export default function SEO({
  title,
  description,
  url,
  image,
  imageWidth,       // mới
  imageHeight,      // mới
  siteName = 'Website',
  noindex = false,
  publishedTime,    // ISO string
  modifiedTime,     // ISO string
  keywords = [],
  ogType = 'article',
  ogLocale = 'vi_VN',     // mới
  twitterCard = 'summary_large_image',
  twitterSite,            // @username (mới)
  hreflangs = [],         // [{ lang: 'vi', href: 'https://…' }, { lang: 'en', href: 'https://…' }]
  preloads = [],          // [{ href, as, type }]
  preconnects = [],       // ['https://cdn.example.com']
  icons = {},             // { icon, apple, manifest }
  themeColor,             // '#ffffff'
  jsonLd,
}) {
  const jsonLdRef = useRef(null)

  useEffect(() => {
    // Title
    if (title) document.title = clamp(title, 70)

    // Basic meta
    setMeta('description', clamp(description, 160))
    if (keywords.length) setMeta('keywords', keywords.join(', '))
    if (themeColor) setMeta('theme-color', themeColor)

    // Robots
    setMeta('robots', noindex
      ? 'noindex, nofollow'
      : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
    )

    // Canonical
    if (url) setLink('canonical', url)

    // Open Graph
    setOG('og:type', ogType)
    if (url) setOG('og:url', url)
    setOG('og:site_name', siteName)
    setOG('og:locale', ogLocale)
    if (title) setOG('og:title', clamp(title, 70))
    if (description) setOG('og:description', clamp(description, 200))
    if (image) {
      setOG('og:image', image)
      if (imageWidth) setOG('og:image:width', String(imageWidth))
      if (imageHeight) setOG('og:image:height', String(imageHeight))
    }
    if (publishedTime) setOG('article:published_time', publishedTime)
    if (modifiedTime || publishedTime) setOG('article:modified_time', modifiedTime || publishedTime)
    if (modifiedTime || publishedTime) setOG('og:updated_time', modifiedTime || publishedTime)
    // article:tag từ keywords
    if (Array.isArray(keywords)) {
      keywords.slice(0, 10).forEach(tag => setOG('article:tag', tag))
    }

    // Twitter
    setMeta('twitter:card', twitterCard)
    if (twitterSite) setMeta('twitter:site', twitterSite) // @brand
    if (title) setMeta('twitter:title', clamp(title, 70))
    if (description) setMeta('twitter:description', clamp(description, 200))
    if (image) setMeta('twitter:image', image)

    // hreflang
    hreflangs.forEach(({ lang, href }) => {
      if (lang && href) setLink('alternate', href, { hreflang: lang })
    })

    // icons/manifest
    if (icons.icon) setLink('icon', icons.icon)
    if (icons.apple) setLink('apple-touch-icon', icons.apple)
    if (icons.manifest) setLink('manifest', icons.manifest)

    // resource hints
    preconnects.forEach(href => setLink('preconnect', href))
    preloads.forEach(p => setLink('preload', p.href, { as: p.as, type: p.type }))

    // JSON-LD
    if (jsonLdRef.current) {
      jsonLdRef.current.remove()
      jsonLdRef.current = null
    }
    if (jsonLd) {
      const s = document.createElement('script')
      s.type = 'application/ld+json'
      s.text = JSON.stringify(jsonLd)
      document.head.appendChild(s)
      jsonLdRef.current = s
    }

    return () => {
      if (jsonLdRef.current) {
        jsonLdRef.current.remove()
        jsonLdRef.current = null
      }
    }
  }, [
    title, description, url, image, imageWidth, imageHeight, siteName, noindex,
    publishedTime, modifiedTime, keywords, ogType, ogLocale, twitterCard, twitterSite,
    hreflangs, preloads, preconnects, icons, themeColor, jsonLd
  ])

  return null
}

/** JSON-LD builders */
export function buildNewsArticleJsonLd({
  url,
  headline,
  images = [],
  datePublished,
  dateModified,
  authorName = 'HuyToan',
  publisherName = 'Website',
  publisherLogo,
  section,            // mới: chuyên mục
  keywords = [],      // mới: schema.org 'keywords'
}) {
  const imgs = Array.isArray(images) ? images.filter(Boolean) : [images].filter(Boolean)
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: url ? { '@type': 'WebPage', '@id': url } : undefined,
    headline,
    image: imgs,
    datePublished,
    dateModified: dateModified || datePublished,
    author: [{ '@type': 'Person', name: authorName }],
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      logo: publisherLogo ? { '@type': 'ImageObject', url: publisherLogo } : undefined,
    },
    articleSection: section,
    keywords: Array.isArray(keywords) ? keywords.join(', ') : keywords,
  }
}

export function buildWebSiteJsonLd({ siteName, siteUrl, searchUrlPattern }) {
  // Hiển thị hộp tìm kiếm sitelinks trên Google nếu có search nội bộ
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    potentialAction: searchUrlPattern ? {
      '@type': 'SearchAction',
      target: `${searchUrlPattern}{search_term_string}`,
      'query-input': 'required name=search_term_string'
    } : undefined
  }
}

export function buildOrganizationJsonLd({ name, url, logo, sameAs = [] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name, url,
    logo: logo ? { '@type': 'ImageObject', url: logo } : undefined,
    sameAs
  }
}

export function buildBreadcrumbJsonLd(items = []) {
  // items: [{ name: 'Trang chủ', url: '…' }, { name: 'Tin tức', url: '…' }, { name: 'Bài viết', url: '…' }]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url
    }))
  }
}

export function buildFAQJsonLd(faq = []) {
  // faq: [{ q: '...', a: '...' }]
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(x => ({
      '@type': 'Question',
      name: x.q,
      acceptedAnswer: { '@type': 'Answer', text: x.a }
    }))
  }
}
