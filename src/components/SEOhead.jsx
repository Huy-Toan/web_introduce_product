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

function setLink(rel, href) {
  if (!href) return
  let el = document.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
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
  siteName = 'Website',
  noindex = false,
  publishedTime,     
  modifiedTime,      
  keywords = [],    
  ogType = 'article',
  twitterCard = 'summary_large_image',
  jsonLd,         
}) {
  const jsonLdRef = useRef(null)

  useEffect(() => {
    // Title
    if (title) document.title = clamp(title, 70)

    // Basic meta
    setMeta('description', clamp(description, 160))
    if (keywords.length) setMeta('keywords', keywords.join(', '))

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
    if (title) setOG('og:title', clamp(title, 70))
    if (description) setOG('og:description', clamp(description, 200))
    if (image) setOG('og:image', image)

    // Twitter
    setMeta('twitter:card', twitterCard)
    if (title) setMeta('twitter:title', clamp(title, 70))
    if (description) setMeta('twitter:description', clamp(description, 200))
    if (image) setMeta('twitter:image', image)

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
  }, [title, description, url, image, siteName, noindex, publishedTime, modifiedTime, keywords, ogType, twitterCard, jsonLd])

  return null
}

/** JSON-LD NewsArticle tiện dùng cho trang bài viết */
export function buildNewsArticleJsonLd({
  url,
  headline,
  images = [],
  datePublished,
  dateModified,
  authorName = 'HuyToan',
  publisherName = 'Website',
  publisherLogo, 
}) {
  const imgs = Array.isArray(images) ? images.filter(Boolean) : [images].filter(Boolean)
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline,
    mainEntityOfPage: url ? { '@type': 'WebPage', '@id': url } : undefined,
    image: imgs,
    datePublished,
    dateModified: dateModified || datePublished,
    author: [{ '@type': 'Person', name: authorName }],
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      logo: publisherLogo ? { '@type': 'ImageObject', url: publisherLogo } : undefined,
    },
  }
}
