
import { Hono } from 'hono'

// UUID v4 (nếu cần)
function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

// Slug tiếng Việt -> không dấu, chữ thường, thay khoảng trắng bằng -
function toSlug(s = '', maxLen = 80) {
  return String(s)
    .toLowerCase()
    .normalize('NFD').replace(/[^\p{Letter}\p{Number}\s\-_.]/gu, '') // bỏ dấu & ký tự lạ
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[\-.]+|[\-.]+$/g, '')
    .slice(0, maxLen)
    .replace(/[\-.]+$/g, '')
}

function sanitizePrefix(input = '') {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9\/_-]+/g, '')
    .replace(/\.{2,}/g, '')
    .replace(/\/{2,}/g, '/')
    .replace(/^\/+|\/+$/g, '')
}

const EXT_BY_MIME = {
  'image/jpeg': 'jpg',
  'image/jpg':  'jpg',
  'image/png':  'png',
  'image/gif':  'gif',
  'image/webp': 'webp',
}

const uploadImageRouter = new Hono()

// --- DIAGNOSTIC ENDPOINT (tạm thời; dùng xong có thể xoá) ---
uploadImageRouter.get('/__diag', async (c) => {
  const env = c.env || {}
  const hasIMAGES = !!env.IMAGES
  const hasPUBLIC = !!env.PUBLIC_R2_URL
  const hasINTERNAL = !!env.INTERNAL_R2_URL
  const addId = String(env.ADD_RANDOM_ID || '').toLowerCase() === 'true'

  let putOk = false, headOk = false, err = null
  try {
    if (hasIMAGES) {
      await env.IMAGES.put('healthcheck.txt', 'ok', { httpMetadata: { contentType: 'text/plain' } })
      const head = await env.IMAGES.head('healthcheck.txt')
      putOk = true
      headOk = !!head
    }
  } catch (e) { err = String(e) }

  return c.json({
    service: 'upload-image',
    hasIMAGES, hasPUBLIC, hasINTERNAL, addId,
    putOk, headOk, err,
    now: new Date().toISOString(),
  })
})

// --- MAIN UPLOAD ---
uploadImageRouter.post('/', async (c) => {
  try {
    // 0) Check binding + env cơ bản
    if (!c.env?.IMAGES) {
      const msg = 'R2 binding IMAGES chưa được cấu hình trên service đang chạy.'
      console.error('Upload error:', msg)
      return c.json({ code: 'IMAGES_BINDING_MISSING', error: msg }, 500)
    }

    // 1) Đọc multipart form
    let formData
    try {
      formData = await c.req.formData()
    } catch (e) {
      console.error('formData() failed. Có thể bạn đang gửi Content-Type=application/json', e)
      return c.json({ code: 'BAD_MULTIPART', error: 'Không thể đọc FormData. Hãy gửi multipart/form-data và KHÔNG tự set Content-Type.' }, 400)
    }

    const file = formData.get('image')
    if (!file || typeof file === 'string') {
      return c.json({ code: 'NO_FILE', error: 'Không có file nào được upload (thiếu field "image").' }, 400)
    }

    // 2) Validate
    const allowedTypes = Object.keys(EXT_BY_MIME)
    if (!allowedTypes.includes(file.type)) {
      return c.json({ code: 'UNSUPPORTED_TYPE', error: 'Chỉ chấp nhận ảnh JPEG, PNG, GIF, WebP.' }, 400)
    }
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ code: 'FILE_TOO_BIG', error: 'Kích thước ảnh không được vượt quá 5MB.' }, 400)
    }

    const urlObj = new URL(c.req.url)

    // 3) Xây key
    const rawSeoName = formData.get('seoName') || urlObj.searchParams.get('seoName') || (file.name ? file.name.replace(/\.[^.]+$/, '') : 'image')
    const baseSlug = toSlug(rawSeoName) || 'image'

    const rawFolder = formData.get('folder') || urlObj.searchParams.get('folder') || c.env.R2_PREFIX || ''
    const prefix = sanitizePrefix(rawFolder)

    const extFromName = (file.name && file.name.includes('.')) ? file.name.split('.').pop() : ''
    const ext = (extFromName || EXT_BY_MIME[file.type] || 'jpg').toLowerCase()

    const addId = String(c.env.ADD_RANDOM_ID || '').toLowerCase() === 'true'
    const shortId = Math.random().toString(36).slice(2, 8)

    const buildKey = (slug, withId) => {
      const name = withId ? `${slug}-${shortId}.${ext}` : `${slug}.${ext}`
      return prefix ? `${prefix}/${name}` : name
    }

    let key = buildKey(baseSlug, addId)

    // 4) Nếu không add ngẫu nhiên -> kiểm tra trùng tối đa 3 lần
    if (!addId) {
      let tries = 0
      while (tries < 3) {
        const head = await c.env.IMAGES.head(key)
        if (!head) break
        const suffix = Math.random().toString(36).slice(2, 6)
        key = buildKey(`${baseSlug}-${suffix}`, false)
        tries++
      }
    }

    // 5) Ghi vào R2
    try {
      await c.env.IMAGES.put(key, await file.arrayBuffer(), {
        httpMetadata: {
          contentType: file.type,
          cacheControl: 'public, max-age=31536000, immutable',
          contentDisposition: `inline; filename="${key.split('/').pop()}"`,
        },
      })
    } catch (err) {
      console.error('R2 put() failed:', err)
      return c.json({ code: 'R2_PUT_FAILED', error: 'Lỗi khi ghi file vào R2', details: String(err) }, 500)
    }

    // 6) Tạo URL hiển thị
    if (!c.env.INTERNAL_R2_URL && !c.env.PUBLIC_R2_URL) {
      const msg = 'Thiếu biến môi trường INTERNAL_R2_URL hoặc PUBLIC_R2_URL để dựng URL hiển thị.'
      console.error('Upload error:', msg)
      return c.json({ code: 'MISSING_R2_URL', error: msg, key }, 500)
    }

    const storageBase = (c.env.INTERNAL_R2_URL || c.env.PUBLIC_R2_URL).replace(/\/+$/, '')
    const displayBase = (c.env.PUBLIC_R2_URL || storageBase).replace(/\/+$/, '')

    const storageUrl = `${storageBase}/${key}`
    const displayUrl = `${displayBase}/${key}`

    // 7) Done
    return c.json({
      success: true,
      image_key: key,
      displayUrl,
      storageUrl,
      fileName: key.split('/').pop(),
      mime: file.type,
      size: file.size,
      alt: baseSlug,
      prefix,
    })
  } catch (error) {
    console.error('Upload error (unhandled):', error, error?.stack)
    return c.json({
      code: 'UNHANDLED',
      error: 'Có lỗi xảy ra khi upload ảnh',
      name: error?.name || null,
      message: error?.message || String(error),
      stack: error?.stack || null,
    }, 500)
  }
})

export default uploadImageRouter
