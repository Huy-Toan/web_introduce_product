import { Hono } from 'hono';

const router = new Hono();

router.post('/', async (c) => {
    const stage = { at: 'start' };
    try {
        const { IMAGES, IMGPROC, ASSETS } = c.env;

        if (!IMAGES) return c.json({ ok: false, error: 'Missing IMAGES binding' }, 500);
        if (!IMGPROC) return c.json({ ok: false, error: 'Missing IMGPROC binding' }, 500);
        if (!ASSETS) return c.json({ ok: false, error: 'Missing ASSETS binding' }, 500);

        const url = new URL(c.req.url);
        const pos = (url.searchParams.get('pos') || 'br').toLowerCase(); // tl|tr|bl|br
        const logoWidth = parseInt(url.searchParams.get('logoWidth') || '160', 10);
        const opacity = clamp01(parseFloat(url.searchParams.get('opacity') || '0.95'));
        const LOGO_PATH = url.searchParams.get('logo') || '/itxeasy-logo.png';

        stage.at = 'parse body';
        const body = await c.req.json().catch(() => ({}));
        const key = (body?.key || '').toString().trim();
        if (!key) return c.json({ ok: false, error: 'Missing key' }, 400);

        stage.at = 'get source';
        const src = await IMAGES.get(key);
        if (!src?.body) return c.json({ ok: false, error: `Source not found: ${key}` }, 404);

        stage.at = 'fetch logo';
        const logoRes = await ASSETS.fetch(new URL(LOGO_PATH, c.req.url));
        if (!logoRes.ok) {
            return c.json({ ok: false, error: `Logo not found in ASSETS: ${LOGO_PATH}`, status: logoRes.status }, 500);
        }
        const logoBuf = await logoRes.arrayBuffer();

        stage.at = 'compose';
        const overlay = IMGPROC.input(logoBuf).resize({ width: logoWidth });
        const anchor = toAnchor(pos);
        const margin = 16;

        const outFormat = toOutFormatFromKey(key); // "jpeg" | "png" | "webp" | "avif" | "gif"
        const out = await IMGPROC
            .input(src.body) // stream/buffer từ R2
            .draw(overlay, {
                opacity,
                ...anchor,
                top: anchor.top !== undefined ? margin : undefined,
                right: anchor.right !== undefined ? margin : undefined,
                bottom: anchor.bottom !== undefined ? margin : undefined,
                left: anchor.left !== undefined ? margin : undefined,
            })
            .output({ format: outFormat })
            .blob();

        stage.at = 'put result';
        const wmKey = withWatermarkKey(key);
        await IMAGES.put(wmKey, out, {
            httpMetadata: { contentType: mimeFromKey(key), cacheControl: 'public, max-age=31536000, immutable' }
        });

        return c.json({ ok: true, key: wmKey });

    } catch (e) {
        console.error('[watermark] failed at', stage.at, e);
        return c.json({ ok: false, error: String(e?.message || e), stage: stage.at }, 500);
    }
});

export default router;

// ===== Helpers =====
function clamp01(n) { if (!Number.isFinite(n)) return 0.95; return Math.max(0, Math.min(1, n)); }
function toAnchor(p) { return p === 'tl' ? { top: 0, left: 0 } : p === 'tr' ? { top: 0, right: 0 } : p === 'bl' ? { bottom: 0, left: 0 } : { bottom: 0, right: 0 }; }
function withWatermarkKey(k) { const i = k.lastIndexOf('.'); return i < 0 ? `${k}-wm` : `${k.slice(0, i)}-wm${k.slice(i)}`; }
function mimeFromKey(k) {
    const ext = (k.toLowerCase().match(/\.(jpe?g|png|webp|avif|gif)$/)?.[1] || 'jpg');
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    if (ext === 'png') return 'image/png';
    if (ext === 'webp') return 'image/webp';
    if (ext === 'avif') return 'image/avif';
    if (ext === 'gif') return 'image/gif';
    return 'image/jpeg';
}
function toOutFormatFromKey(k) {
    const m = mimeFromKey(k);
    if (m.includes('jpeg')) return 'jpeg';
    if (m.includes('png')) return 'png';
    if (m.includes('webp')) return 'webp';
    if (m.includes('avif')) return 'avif';
    if (m.includes('gif')) return 'gif';
    return 'jpeg';
}
