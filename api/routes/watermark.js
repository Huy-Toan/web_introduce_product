// api/routes/watermark-assets.js
export default function mountWatermarkAssetsRoute(app) {
    app.post('/api/watermark', async (c) => {
        const { IMAGES, IMGPROC, ASSETS } = c.env; // IMAGES=R2, IMGPROC=Cloudflare Images, ASSETS=static
        const url = new URL(c.req.url);

        // ====== params tuỳ chọn ======
        const pos = (url.searchParams.get('pos') || 'br').toLowerCase();    // tl|tr|bl|br
        const logoWidth = parseInt(url.searchParams.get('logoWidth') || '160', 10);
        const opacity = clamp01(parseFloat(url.searchParams.get('opacity') || '0.95'));
        const LOGO_PATH = '/itxeasy-logo.png'; // file nằm ở public/image/logo.png

        // Body JSON: { "key": "products/abc.jpg" }
        const body = await c.req.json().catch(() => ({}));
        const key = (body?.key || '').toString().trim();
        if (!key) return c.json({ ok: false, error: 'Missing key' }, 400);

        // ====== 1) Ảnh gốc từ R2 ======
        const src = await IMAGES.get(key);
        if (!src?.body) return c.json({ ok: false, error: 'Source not found' }, 404);

        // ====== 2) Lấy logo từ ASSETS (public/) ======
        // Tạo URL tuyệt đối tới /image/logo.png trên cùng origin
        const assetUrl = new URL(LOGO_PATH, c.req.url);
        const logoRes = await ASSETS.fetch(new Request(assetUrl.toString(), { method: 'GET' }));
        if (!logoRes.ok || !logoRes.body) {
            return c.json({ ok: false, error: 'Logo not found in ASSETS (/public)' }, 500);
        }

        // ====== 3) Scale logo + chọn vị trí ======
        const overlay = IMGPROC.input(logoRes.body).resize({ width: logoWidth });
        const anchor = toAnchor(pos);
        const margin = 16;

        // ====== 4) Dán logo và xuất ======
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
            .output({ format: mimeFromKey(key) })
            .blob();

        // ====== 5) Ghi R2 với hậu tố -wm ======
        const wmKey = withWatermarkKey(key);
        await IMAGES.put(wmKey, out, { httpMetadata: { contentType: mimeFromKey(key) } });

        return c.json({ ok: true, key: wmKey });
    });
}

function clamp01(n) { if (!Number.isFinite(n)) return 0.95; return Math.max(0, Math.min(1, n)); }
function toAnchor(pos) { switch (pos) { case 'tl': return { top: 0, left: 0 }; case 'tr': return { top: 0, right: 0 }; case 'bl': return { bottom: 0, left: 0 }; case 'br': default: return { bottom: 0, right: 0 }; } }
function mimeFromKey(k) {
    const ext = (k.toLowerCase().match(/\.(jpe?g|png|webp|avif|gif)$/)?.[1] || 'jpg').replace('jpeg', 'jpg');
    switch (ext) { case 'jpg': return 'image/jpeg'; case 'png': return 'image/png'; case 'webp': return 'image/webp'; case 'avif': return 'image/avif'; case 'gif': return 'image/gif'; default: return 'image/jpeg'; }
}
function withWatermarkKey(k) { const i = k.lastIndexOf('.'); return i < 0 ? `${k}-wm` : `${k.slice(0, i)}-wm${k.slice(i)}`; }
