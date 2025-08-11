import { useState, useCallback } from 'react'

const useNewsForm = (form, setForm) => {
  const [isGenerating, setIsGenerating] = useState(false)

  // Helper parse function for AI response
  const parseAIResponse = useCallback((rawResponses, type = 'content') => {
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
        if (match && match[1]) {
          return cleanText(match[1])
        }
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
            .filter(line => line.length > 0)
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
        keywords
      }
    } else {
      const analysis = rawResponses.analysis || ''
      const seoElements = rawResponses.seo_elements || ''
      const recommendations = rawResponses.recommendations || ''

      const title = extractValue(seoElements, 'TIÊU ĐỀ SEO|tiêu đề seo|tiêu đề')
      const meta = extractValue(seoElements, 'META DESCRIPTION|meta description|META DESC')
      const keywords = extractKeywords(seoElements, 'TỪ KHÓA CHÍNH|từ khóa chính|từ khóa|keywords')
      const slug = extractValue(seoElements, 'URL SLUG|url slug|slug')

      return {
        title: title || '',
        meta: meta || '',
        keywords,
        slug: slug || '',
        analysis,
        recommendations
      }
    }
  }, [])

  const uploadImage = useCallback(async (file) => {
    const fd = new FormData()
    fd.append('image', file)
    const res = await fetch('/api/upload-image', { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Upload ảnh thất bại')
    const data = await res.json()
    return data.url
  }, [])

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
      if (!data.success || !data.raw_responses) {
        throw new Error('AI response không hợp lệ')
      }

      const result = parseAIResponse(data.raw_responses, 'content')

      setForm(prev => ({
        ...prev,
        title: result.title || prev.title,
        meta: result.meta || prev.meta,
        content: result.content || prev.content,
        keywords: Array.isArray(result.keywords) ? result.keywords.join(', ') : result.keywords || ''
      }))

      alert('Tạo nội dung thành công!')
    } catch (err) {
      console.error('Generate content error:', err)
      alert(`Lỗi tạo nội dung: ${err.message}`)
    } finally {
      setIsGenerating(false)
    }
  }, [form.keyword, parseAIResponse, setForm])

  const generateSEOFromContent = useCallback(async () => {
    if (!form.content.trim()) return alert('Nhập nội dung trước!')
    setIsGenerating(true)
    try {
      const res = await fetch('/api/seo/generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: form.content.trim() })
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      if (!data.success || !data.raw_responses) {
        throw new Error('AI response không hợp lệ')
      }

      const result = parseAIResponse(data.raw_responses, 'seo')

      setForm(prev => ({
        ...prev,
        title: result.title || prev.title,
        meta: result.meta || prev.meta,
        keywords: result.keywords.join(', '),
        slug: result.slug || prev.slug
      }))

      alert('Tạo SEO thành công!')
    } catch (err) {
      console.error('Generate SEO error:', err)
      alert(`Lỗi tạo SEO: ${err.message}`)
    } finally {
      setIsGenerating(false)
    }
  }, [form.content, parseAIResponse, setForm])

  return { isGenerating, uploadImage, generateContentFromKeyword, generateSEOFromContent }
}

export default useNewsForm
