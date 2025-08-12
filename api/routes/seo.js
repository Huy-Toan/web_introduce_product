import { Hono } from 'hono'
import { cleanText } from '../../src/utils/textClean'

const seoApp = new Hono()

/* ---------- Utils ---------- */
const slugify = (str = '') =>
  (str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const safeJSONParse = (raw) => {
  try {
    return { ok: true, data: JSON.parse(raw) }
  } catch (e) {
    return { ok: false, error: e?.message || 'JSON parse error' }
  }
}

const tryExtractPlanningFromText = (txt = '') => {
  // Fallback tách Title/Meta/Keywords/Outline khi model trả text thường
  const title = (txt.match(/TIÊU ĐỀ\s*:?\s*(.+)/i)?.[1] || '').trim()
  const meta = (txt.match(/META DESCRIPTION\s*:?\s*([\s\S]*?)(?:\n|$)/i)?.[1] || '').trim()
  const keywordsBlock = txt.match(/TỪ KHÓA[^\n]*\s*:\s*([\s\S]*?)(?:OUTLINE|$)/i)?.[1] || ''
  const keywords = keywordsBlock
    .split('\n')
    .map(l => l.replace(/^\s*\d+\.\s*/, '').trim())
    .filter(Boolean)
  const outlineBlock = txt.match(/OUTLINE\s*:\s*([\s\S]*)$/i)?.[1] || ''
  const outline = outlineBlock
    .split('\n')
    .map(l => l.replace(/^\s*[-*•]\s*/, '').trim())
    .filter(Boolean)
  return { title, meta_description: meta, keywords, outline }
}

/* ============================================================
 * 1) Keyword → Full Content
 *    Trả về { title, meta, keywords, slug, content, outline }
 * ============================================================ */
seoApp.post('/generate-content', async (c) => {
  try {
    const { keyword } = await c.req.json()
    const ai = c.env.AI
    if (!keyword || typeof keyword !== 'string' || !keyword.trim()) {
      return c.json({ success: false, error: 'Thiếu keyword' }, 400)
    }

    // ----- Call 1: Planning (JSON only) -----
    const planningMessages = [
      { role: 'system', content: 'Bạn là content creator chuyên nghiệp, trả lời đúng định dạng yêu cầu.' },
      {
        role: 'user',
        content: `Tôi cần viết bài về "${keyword}".

Hãy trả lời CHỈ DẠNG JSON HỢP LỆ (không thêm chữ nào ngoài JSON):
{
  "title": "tiêu đề <= 60 ký tự, tự nhiên, không nhồi nhét",
  "meta_description": "mô tả <= 160 ký tự, hấp dẫn, tự nhiên",
  "keywords": ["5 từ khóa phụ, ngắn gọn", "..." ],
  "outline": ["Danh sách mục chính để viết bài 1000+ từ"]
}`
      }
    ]

    const planResult = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: planningMessages,
      max_tokens: 1400,
      temperature: 0.6
    })

    let planningJSON
    {
      const parsed = safeJSONParse(planResult.response)
      if (parsed.ok) {
        planningJSON = parsed.data
      } else {
        // fallback parse text thường
        const fallback = tryExtractPlanningFromText(planResult.response || '')
        planningJSON = fallback
      }
    }

    const title = (planningJSON?.title || '').trim()
    const metaRaw = (planningJSON?.meta_description || '').trim()
    const meta = metaRaw.length > 160 ? metaRaw.slice(0, 159) : metaRaw
    const keywordsArr = Array.isArray(planningJSON?.keywords) ? planningJSON.keywords : []
    const outline = Array.isArray(planningJSON?.outline) ? planningJSON.outline : []

    // ----- Call 2: phần mở đầu + 2-3 section đầu -----
    const part1Messages = [
      ...planningMessages,
      { role: 'assistant', content: JSON.stringify(planningJSON) },
      {
        role: 'user',
        content: `Dựa vào JSON planning ở trên, hãy viết phần mở đầu hấp dẫn và 2-3 section đầu theo outline (~500-600 từ).
Yêu cầu:
- Dùng từ khóa "${keyword}" tự nhiên
- Giọng văn rõ ràng, hữu ích
- Trả về CHỈ DẠNG MARKDOWN (không JSON, không tiêu đề trùng lặp với title).`
      }
    ]

    const part1Result = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: part1Messages,
      max_tokens: 2400,
      temperature: 0.7
    })

    // ----- Call 3: phần còn lại + kết luận -----
    const part2Messages = [
      ...part1Messages,
      { role: 'assistant', content: part1Result.response },
      {
        role: 'user',
        content: `Viết tiếp các section còn lại theo outline và phần kết luận có call-to-action (~400-500 từ).
Yêu cầu:
- Kết nối mượt với phần trước
- Giữ cùng tone/style
- Trả về CHỈ DẠNG MARKDOWN.`
      }
    ]

    const part2Result = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: part2Messages,
      max_tokens: 2400,
      temperature: 0.7
    })

    const clean = (s) => cleanText(s || '')
    const contentMarkdown = [clean(part1Result.response), clean(part2Result.response)]
      .filter(Boolean)
      .join('\n\n')

    const response = {
      success: true,
      data: {
        title: title || keyword,
        meta,
        keywords: keywordsArr.join(', '),
        slug: slugify(title || keyword),
        content: contentMarkdown,
        outline
      },
      raw_responses: {
        planning: planningJSON,
        part1: clean(part1Result.response),
        part2: clean(part2Result.response)
      },
      generated_at: new Date().toISOString()
    }

    console.log('Content generation response:', response)
    return c.json(response)
  } catch (err) {
    console.error('Content generation error:', err)
    return c.json({
      success: false,
      error: 'Content generation failed',
      details: err?.message || String(err)
    }, 500)
  }
})

/* ============================================================
 * 2) Content → SEO Analysis
 *    Trả về { title, meta, keywords, slug, score, tips, focus_keyword, distribution }
 * ============================================================ */
seoApp.post('/generate-seo', async (c) => {
  try {
    const { content } = await c.req.json()
    const ai = c.env.AI
    if (!content || typeof content !== 'string' || !content.trim()) {
      return c.json({ success: false, error: 'Thiếu content' }, 400)
    }

    const truncated = content.length > 8000 ? content.slice(0, 8000) : content

    // Gộp phân tích + tạo SEO trong 1 lần gọi để tiết kiệm latency
    const prompt = [
      { role: 'system', content: 'Bạn là chuyên gia SEO. Luôn trả lời đúng JSON schema khi được yêu cầu.' },
      {
        role: 'user',
        content: `Phân tích nội dung sau và trả lời CHỈ DẠNG JSON HỢP LỆ (không thêm chữ nào ngoài JSON).
---CONTENT---
${truncated}
---YÊU CẦU---
{
  "title": "tiêu đề <= 60 ký tự, súc tích, tự nhiên",
  "meta_description": "mô tả <= 160 ký tự, hấp dẫn, không nhồi nhét",
  "keywords": ["5-8 keyword ngắn gọn"],
  "focus_keyword": "từ khóa trọng tâm",
  "score": 7,
  "tips": ["3-5 gợi ý cải thiện cụ thể, ngắn gọn"],
  "distribution": ["các kênh phân phối nội dung gợi ý, 2-4 mục"]
}`
      }
    ]

    const aiRes = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: prompt,
      max_tokens: 1200,
      temperature: 0.5
    })

    let extracted
    {
      const parsed = safeJSONParse(aiRes.response)
      if (parsed.ok) {
        extracted = parsed.data
      } else {
        // fallback thô nếu model không về JSON (hạn chế)
        const txt = aiRes.response || ''
        const title = (txt.match(/TIÊU ĐỀ[^\n]*:\s*(.+)/i)?.[1] || '').trim()
        const meta = (txt.match(/META DESCRIPTION[^\n]*:\s*([\s\S]*?)(?:\n|$)/i)?.[1] || '').trim()
        const kwBlock = txt.match(/TỪ KHÓA[^\n]*:\s*([\s\S]*?)(?:\n\n|URL|$)/i)?.[1] || ''
        const keywords = kwBlock.split('\n').map(l => l.replace(/^\s*\d+\.\s*/, '').trim()).filter(Boolean)
        extracted = {
          title, meta_description: meta, keywords,
          focus_keyword: keywords?.[0] || '',
          score: 7, tips: [], distribution: []
        }
      }
    }

    const title = (extracted?.title || '').trim()
    const metaRaw = (extracted?.meta_description || '').trim()
    const meta = metaRaw.length > 160 ? metaRaw.slice(0, 159) : metaRaw
    const keywordsArr = Array.isArray(extracted?.keywords) ? extracted.keywords : []
    const focus_keyword = (extracted?.focus_keyword || keywordsArr[0] || '').trim()
    const score = Number.isFinite(extracted?.score) ? Math.max(1, Math.min(10, Math.round(extracted.score))) : 7
    const tips = Array.isArray(extracted?.tips) ? extracted.tips : []
    const distribution = Array.isArray(extracted?.distribution) ? extracted.distribution : []

    const response = {
      success: true,
      data: {
        title,
        meta,
        keywords: keywordsArr.join(', '),
        slug: slugify(title),
        focus_keyword,
        score,
        tips,
        distribution
      },
      raw_responses: {
        model_raw: cleanText(aiRes.response)
      },
      content_length: content.length,
      generated_at: new Date().toISOString()
    }

    return c.json(response)
  } catch (err) {
    console.error('SEO analysis error:', err)
    return c.json({
      success: false,
      error: 'SEO analysis failed',
      details: err?.message || String(err)
    }, 500)
  }
})

/* Helper endpoint để test */
seoApp.get('/test', (c) => {
  return c.json({
    message: 'SEO API working',
    endpoints: [
      'POST /generate-content - keyword → full content (title/meta/keywords/slug/content)',
      'POST /generate-seo - content → SEO (title/meta/keywords/slug + score/tips)'
    ],
    timestamp: new Date().toISOString()
  })
})

export default seoApp
