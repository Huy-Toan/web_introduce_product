import { useState, useCallback } from 'react'
import { getToken } from '../../../../api/admin/auth';
const slugify = (str = '') =>
  str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const useNewsForm = (form, setForm) => {
  const [isGenerating, setIsGenerating] = useState(false)

    const authHeaders = () => {
        const token = getToken()
        return token ? { Authorization: `Bearer ${token}` } : {}
    }
  // ====== LEGACY PARSER (fallback nếu backend trả raw_responses) ======
  const legacyParser = useCallback((rawResponses, type = 'content') => {
    const cleanText = (text) => {
      if (!text) return ''
      return text
        .replace(/^\s*[-*•]\s*/gm, '')
        .replace(/^\s*\d+\.\s*/gm, '')
        .trim()
    }

    const extractValue = (text, label) => {
      const patterns = [
        new RegExp(`${label}\\s*[:：]\\s*(.+?)(?:\\n[A-Z]|\\n\\n|$)`, 'i'),
        new RegExp(`${label}\\s*[:：]\\s*(.+?)(?:\\n|$)`, 'i'),
        new RegExp(`${label}[^:：]*[:：]\\s*(.+?)(?:\\n[A-Z]|\\n\\n|$)`, 'i')
      ]
      for (const pattern of patterns) {
        const match = text.match(pattern)
        if (match && match[1]) return cleanText(match[1])
      }
      return ''
    }

    const extractKeywords = (text, label) => {
      const patterns = [
        new RegExp(`${label}\\s*[:：]\\s*([\\s\\S]+?)(?:\\n[A-Z][A-Z]|\\n\\n|$)`, 'i'),
        new RegExp(`${label}[^:：]*[:：]\\s*([\\s\\S]+?)(?:\\n[A-Z][A-Z]|\\n\\n|$)`, 'i')
      ]
      for (const pattern of patterns) {
        const match = text.match(pattern)
        if (match && match[1]) {
          return match[1]
            .split('\n')
            .map(line => cleanText(line))
            .filter(Boolean)
            .slice(0, 5)
        }
      }
      return []
    }

    if (type === 'content') {
      const planning = rawResponses.planning || ''
      const part1 = rawResponses.part1 || ''
      const part2 = rawResponses.part2 || ''

      const title = extractValue(planning, 'TIÊU ĐỀ|tiêu đề')
      const meta = extractValue(planning, 'META DESCRIPTION|meta description|mô tả meta|META DESC')
      const keywords = extractKeywords(planning, 'TỪ KHÓA PHỤ|từ khóa phụ|từ khóa|keywords')

      return {
        title: title || '',
        meta: meta || '',
        content: (part1 + '\n\n' + part2).trim(),
        keywords: Array.isArray(keywords) ? keywords.join(', ') : ''
      }
    } else {
      const seoElements = rawResponses.seo_elements || ''
      const title = extractValue(seoElements, 'TIÊU ĐỀ SEO|tiêu đề seo|tiêu đề')
      const meta = extractValue(seoElements, 'META DESCRIPTION|meta description|META DESC')
      const keywordsArr = extractKeywords(seoElements, 'TỪ KHÓA CHÍNH|từ khóa chính|từ khóa|keywords')
      const slug = extractValue(seoElements, 'URL SLUG|url slug|slug')

      return {
        title: title || '',
        meta: meta || '',
        keywords: Array.isArray(keywordsArr) ? keywordsArr.join(', ') : '',
        slug: slug || ''
      }
    }
  }, [])

  // ====== API V2 PARSER (mặc định) ======
  const parseNewContentResponse = useCallback((data, keywordFallback = '') => {
    const d = data?.data || {}
    return {
      title: d.title || keywordFallback || '',
      meta: d.meta || '',
      content: d.content || '',
      keywords: typeof d.keywords === 'string' ? d.keywords : (Array.isArray(d.keywords) ? d.keywords.join(', ') : ''),
      slug: d.slug || (d.title ? slugify(d.title) : '')
    }
  }, [])

  const parseNewSEOResponse = useCallback((data) => {
    const d = data?.data || {}
    return {
      title: d.title || '',
      meta: d.meta || '',
      keywords: typeof d.keywords === 'string' ? d.keywords : (Array.isArray(d.keywords) ? d.keywords.join(', ') : ''),
      slug: d.slug || (d.title ? slugify(d.title) : '')
    }
  }, [])

  // ====== Upload ảnh ======
  const uploadImage = useCallback(
    async (file, opts = { forEditor: false }) => {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd, headers: authHeaders() });
      if (!res.ok) throw new Error('Upload ảnh thất bại');
      const data = await res.json();

      // Dùng trong editor -> trả URL string để nhét vào ![](url)
      if (opts.forEditor) {
        return data.displayUrl || data.url; 
      }

      // Dùng làm cover -> trả key + preview
      return {
        image_key: data.image_key,
        previewUrl: data.displayUrl || data.url,
      };
    },
    []
  );


  // ====== Cách 1: Keyword -> Full content ======
  const generateContentFromKeyword = useCallback(async () => {
    if (!form.keyword.trim()) return alert('Nhập từ khóa trước!')
    setIsGenerating(true)
    try {
      const res = await fetch('/api/seo/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: form.keyword.trim() })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Tạo nội dung thất bại')

      let parsed = parseNewContentResponse(data, form.keyword)
      if ((!parsed.title && !parsed.meta && !parsed.content) && data.raw_responses) {
        const legacy = legacyParser(data.raw_responses, 'content')
        parsed = {
          title: legacy.title,
          meta: legacy.meta,
          content: legacy.content,
          keywords: legacy.keywords,
          slug: legacy.title ? slugify(legacy.title) : slugify(form.keyword)
        }
      }

      setForm(prev => ({
        ...prev,
        title: parsed.title,
        meta: parsed.meta,
        content: parsed.content,
        keywords: parsed.keywords,
        slug: parsed.slug || prev.slug
      }))

      alert('Tạo nội dung thành công!')
    } catch (err) {
      console.error('Generate content error:', err)
      alert(`Lỗi tạo nội dung`)
    } finally {
      setIsGenerating(false)
    }
  }, [form.keyword, legacyParser, parseNewContentResponse, setForm])

  // ====== Cách 2: Content -> SEO ======
  const generateSEOFromContent = useCallback(async () => {
    if (!form.content.trim()) return alert('Nhập nội dung trước!')
    setIsGenerating(true)
    try {
      const res = await fetch('/api/seo/generate-seo', {
        method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ content: form.content.trim() })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Tạo SEO thất bại')

      // Ưu tiên schema mới
      let parsed = parseNewSEOResponse(data)
      // Fallback legacy
      if ((!parsed.title && !parsed.meta && !parsed.keywords && !parsed.slug) && data.raw_responses) {
        const legacy = legacyParser(data.raw_responses, 'seo')
        parsed = {
          title: legacy.title,
          meta: legacy.meta,
          keywords: legacy.keywords,
          slug: legacy.slug || (legacy.title ? slugify(legacy.title) : '')
        }
      }

      setForm(prev => ({
        ...prev,
        title: parsed.title || prev.title,
        meta: parsed.meta || prev.meta,
        keywords: parsed.keywords || prev.keywords,
        slug: parsed.slug || prev.slug
      }))

      alert('Tạo SEO thành công!')
    } catch (err) {
      console.error('Generate SEO error:', err)
      alert(`Lỗi tạo SEO`)
    } finally {
      setIsGenerating(false)
    }
  }, [form.content, legacyParser, parseNewSEOResponse, setForm])

  return { isGenerating, uploadImage, generateContentFromKeyword, generateSEOFromContent }
}

export default useNewsForm
