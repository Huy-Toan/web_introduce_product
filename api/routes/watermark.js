// api/routes/watermark-r2.js
import { Hono } from 'hono';
const router = new Hono();

router.post('/', async (c) => {
    const { IMAGES, IMGPROC } = c.env;
    const url = new URL(c.req.url);
    const pos = (url.searchParams.get('pos') || 'br').toLowerCase(); // tl|tr|bl|br
    const logoWidth = parseInt(url.searchParams.get('logoWidth') || '160', 10);
    const opacity = clamp01(parseFloat(url.searchParams.get('opacity') || '0.95'));
    const logoKey = url.searchParams.get('logoKey') || c.env.LOGO_KEY || 'itxeasy-logo.png';

    const body = await c.req.json().catch(() => ({}));
    const srcKey = String(body?.key || body?.imageKey || '').trim();
    if (!srcKey) return c.json({ ok: false, error: 'Missing key' }, 400);

    const srcObj = await IMAGES.get(srcKey);
    if (!srcObj?.body) return c.json({ ok: false, error: `Source not found: ${srcKey}` }, 404);
    const logoObj = await IMAGES.get(logoKey);
    if (!logoObj?.body) return c.json({ ok: false, error: `Logo not found in R2: ${logoKey}` }, 500);

    const logoBuf = await logoObj.arrayBuffer();
    const overlay = IMGPROC.input(logoBuf).transform({ width: logoWidth });

    const anchor = toAnchor(pos);
    const margin = 16;
    const outMime = mimeFromKey(srcKey);

    const out = await IMGPROC
        .input(srcObj.body)
        .draw(overlay, {
            opacity,
            ...anchor,
            top: anchor.top !== undefined ? margin : undefined,
            right: anchor.right !== undefined ? margin : undefined,
            bottom: anchor.bottom !== undefined ? margin : undefined,
            left: anchor.left !== undefined ? margin : undefined,
        })
        .output({ format: outMime })
        .blob();

    const wmKey = withWatermarkKey(srcKey);
    await IMAGES.put(wmKey, out, {
        httpMetadata: { contentType: outMime, cacheControl: 'public, max-age=31536000, immutable' }
    });

    return c.json({ ok: true, key: wmKey, original: srcKey });
});

export default router;

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
