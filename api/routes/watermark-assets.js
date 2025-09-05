// api/routes/watermark-assets.js
export default function mountWatermarkAssetsRoute(app) {
    app.post('/api/watermark', async (c) => {
        const { IMAGES, IMGPROC, ASSETS } = c.env;

        const url = new URL(c.req.url);
        const pos = (url.searchParams.get('pos') || 'br').toLowerCase(); // tl|tr|bl|br
        const logoWidth = parseInt(url.searchParams.get('logoWidth') || '160', 10);
        const opacity = clamp01(parseFloat(url.searchParams.get('opacity') || '0.95'));
        const LOGO_PATH = url.searchParams.get('logo') || '/itxeasy-logo.png'; // từ public/

        const body = await c.req.json().catch(() => ({}));
        const key = (body?.key || '').toString().trim();
        if (!key) return c.json({ ok: false, error: 'Missing key' }, 400);

        const src = await IMAGES.get(key);
        if (!src?.body) return c.json({ ok: false, error: 'Source not found' }, 404);

        // lấy logo từ ASSETS (dist/client)
        const logoRes = await ASSETS.fetch(new URL(LOGO_PATH, c.req.url));
        if (!logoRes.ok || !logoRes.body) return c.json({ ok: false, error: 'Logo not found in ASSETS' }, 500);

        const overlay = IMGPROC.input(await logoRes.arrayBuffer()).resize({ width: logoWidth });
        const anchor = toAnchor(pos);
        const margin = 16;

        const out = await IMGPROC
            .input(src.body)
            .draw(overlay, {
                opacity,
                ...anchor,
                top: anchor.top !== undefined ? margin : undefined,
                right: anchor.right !== undefined ? margin : undefined,
                bottom: anchor.bottom !== undefined ? margin : undefined,
                left: anchor.left !== undefined ? margin : undefined,
            })
            .output({ format: toOutFormat(key) })
            .blob();

        const wmKey = withWatermarkKey(key);
        await IMAGES.put(wmKey, out, { httpMetadata: { contentType: mimeFromKey(key) } });

        return c.json({ ok: true, key: wmKey });
    });
}

function clamp01(n) { if (!Number.isFinite(n)) return 0.95; return Math.max(0, Math.min(1, n)); }
function toAnchor(p) { return p === 'tl' ? { top: 0, left: 0 } : p === 'tr' ? { top: 0, right: 0 } : p === 'bl' ? { bottom: 0, left: 0 } : { bottom: 0, right: 0 }; }
function withWatermarkKey(k) { const i = k.lastIndexOf('.'); return i < 0 ? `${k}-wm` : `${k.slice(0, i)}-wm${k.slice(i)}`; }
function mimeFromKey(k) {
    const ext = (k.toLowerCase().match(/\.(jpe?g|png|webp|avif|gif)$/)?.[1] || 'jpg').replace('jpeg', 'jpg');
    return ext === 'jpg' ? 'image/jpeg' : ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'avif' ? 'image/avif' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
}
function toOutFormat(k) { const m = mimeFromKey(k); return m.includes('jpeg') ? 'jpeg' : m.includes('png') ? 'png' : m.includes('webp') ? 'webp' : m.includes('avif') ? 'avif' : m.includes('gif') ? 'gif' : 'jpeg'; }
