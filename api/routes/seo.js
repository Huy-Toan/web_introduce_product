import { Hono } from 'hono'
import { cleanText } from '../../src/utils/textClean'

const seoApp = new Hono()

// Hàm 1: Keyword → Full Content (Multi-call với context tự nhiên)
seoApp.post('/generate-content', async (c) => {
  try {
    const { keyword } = await c.req.json()
    const ai = c.env.AI

    // Conversation để duy trì context
    const conversation = [
      { 
        role: 'system', 
        content: 'Bạn là content creator chuyên nghiệp, viết nội dung SEO chất lượng cao bằng tiếng Việt.' 
      }
    ]
    
    // Call 1: Lập kế hoạch
    console.log('Call 1: Planning...')
    conversation.push({
      role: 'user',
      content: `Tôi cần viết bài về "${keyword}". 

Trước tiên hãy tạo:
TIÊU ĐỀ: (tối đa 60 ký tự)
META DESCRIPTION: (tối đa 160 ký tự)  
TỪ KHÓA PHỤ: 
1. từ khóa 1
2. từ khóa 2  
3. từ khóa 3
4. từ khóa 4
5. từ khóa 5
OUTLINE: Danh sách các mục chính cho bài viết 1000+ từ

Trình bày rõ ràng từng mục theo format trên.`
    })
    
    const planResult = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: conversation,
      max_tokens: 1536,
      temperature: 0.7
    })
    
    conversation.push({ role: 'assistant', content: planResult.response })
    
    // Call 2: Viết phần đầu
    console.log('Call 2: Writing introduction and first sections...')
    conversation.push({
      role: 'user', 
      content: `Tuyệt! Bây giờ dựa vào plan vừa tạo, hãy bắt đầu viết bài:

1. Phần mở đầu hấp dẫn (hook reader)
2. 2-3 section đầu tiên theo outline
3. Viết chi tiết, khoảng 500-600 từ

Đảm bảo:
- Sử dụng từ khóa "${keyword}" tự nhiên
- Nội dung có giá trị thực tế
- Dễ đọc, mạch lạc

Viết ngay, không cần format đặc biệt.`
    })
    
    const part1Result = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: conversation,
      max_tokens: 2560,
      temperature: 0.7
    })
    
    conversation.push({ role: 'assistant', content: part1Result.response })
    
    // Call 3: Hoàn thiện bài viết
    console.log('Call 3: Completing article...')
    conversation.push({
      role: 'user',
      content: `Tuyệt vời! Tiếp tục hoàn thành bài viết:

1. Viết tiếp các section còn lại trong outline
2. Phần kết luận mạnh mẽ với call-to-action
3. Thêm 400-500 từ nữa để đủ 1000+ từ tổng

Yêu cầu:
- Kết nối mượt mà với phần trước
- Giữ tone và style nhất quán  
- Kết thúc ấn tượng

Viết tiếp, không lặp lại phần đã viết.`
    })
    
    const part2Result = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: conversation,
      max_tokens: 2560,
      temperature: 0.7
    })
    
    // ✅ Clean tất cả responses trước khi trả về
    const response = {
      success: true,
      raw_responses: {
        planning: cleanText(planResult.response),
        part1: cleanText(part1Result.response),
        part2: cleanText(part2Result.response)
      },
      full_conversation: conversation,
      keyword: keyword,
      generated_at: new Date().toISOString()
    }

    console.log('Content generation completed')
    return c.json(response)
    
  } catch (err) {
    console.error('Content generation error:', err)
    return c.json({ 
      success: false,
      error: 'Content generation failed',
      details: err.message 
    }, 500)
  }
})

// Hàm 2: Content → SEO Analysis (Multi-step analysis)
seoApp.post('/generate-seo', async (c) => {
  try {
    const { content } = await c.req.json()
    const ai = c.env.AI
    
    const conversation = [
      { 
        role: 'system', 
        content: 'Bạn là chuyên gia phân tích SEO và content marketing.' 
      }
    ]
    
    // Call 1: Phân tích nội dung
    console.log('Call 1: Content analysis...')
    conversation.push({
      role: 'user',
      content: `Phân tích nội dung này và cho tôi biết:

"""${content.substring(0, 2000)}"""

Hãy phân tích:
1. Chủ đề chính là gì?
2. Điểm mạnh của nội dung
3. Từ khóa tiềm năng (5-10 từ)
4. Tone và style 
5. Đối tượng mục tiêu

Trình bày dễ hiểu.`
    })
    
    const analysisResult = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: conversation,
      max_tokens: 1536,
      temperature: 0.5
    })
    
    conversation.push({ role: 'assistant', content: analysisResult.response })
    
    // Call 2: Tạo SEO elements
    console.log('Call 2: Creating SEO elements...')
    conversation.push({
      role: 'user',
      content: `Dựa vào phân tích vừa rồi, hãy tạo bộ SEO tối ưu:

TIÊU ĐỀ SEO: (≤60 ký tự)
META DESCRIPTION: (≤160 ký tự)
TỪ KHÓA CHÍNH:
1. từ khóa quan trọng nhất
2. từ khóa thứ 2
3. từ khóa thứ 3
4. từ khóa thứ 4
5. từ khóa thứ 5
URL SLUG: slug-than-thien-seo
ĐIỂM MẠNH SEO: Tóm tắt các ưu điểm SEO

Trình bày theo format trên.`
    })
    
    const seoResult = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: conversation,
      max_tokens: 1536,
      temperature: 0.6
    })
    
    conversation.push({ role: 'assistant', content: seoResult.response })
    
    // Call 3: Recommendations
    console.log('Call 3: SEO recommendations...')
    conversation.push({
      role: 'user',
      content: `Cuối cùng, đưa ra:

1. Đánh giá SEO score (1-10) cho nội dung này
2. 3-5 gợi ý cải thiện cụ thể
3. Từ khóa nào nên focus nhất
4. Chiến lược distribution content

Tư vấn chuyên nghiệp.`
    })
    
    const recommendResult = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: conversation,
      max_tokens: 1024,
      temperature: 0.4
    })
    
    // ✅ Clean tất cả responses
    const response = {
      success: true,
      raw_responses: {
        analysis: cleanText(analysisResult.response),
        seo_elements: cleanText(seoResult.response),
        recommendations: cleanText(recommendResult.response)
      },
      full_conversation: conversation,
      content_length: content.length,
      generated_at: new Date().toISOString()
    }
    
    return c.json(response)
    
  } catch (err) {
    console.error('SEO analysis error:', err)
    return c.json({ 
      success: false,
      error: 'SEO analysis failed',
      details: err.message 
    }, 500)
  }
})

// Helper endpoint để test
seoApp.get('/test', (c) => {
  return c.json({ 
    message: 'SEO API working',
    endpoints: [
      'POST /generate-content - keyword → full content',
      'POST /generate-seo - content → SEO analysis'
    ],
    timestamp: new Date().toISOString()
  })
})

export default seoApp
