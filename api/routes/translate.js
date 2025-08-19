// api/route/translate.js
import { Hono } from 'hono';

const translateRouter = new Hono();

translateRouter.post('/', async (c) => {
    try {
        if (!c.env?.AI) {
            return c.json({ error: 'AI binding not available' }, 500);
        }

        const body = await c.req.json().catch(() => ({}));
        const { text, source = 'vi', target = 'en' } = body || {};
        if (!text || !target) {
            return c.json({ error: 'Missing "text" or "target"' }, 400);
        }

        // Model khuyến nghị (nhanh/nhẹ). Có thể đổi '@cf/meta/nllb-200-3.3b'
        const model = '@cf/meta/m2m100-1.2b';

        const out = await c.env.AI.run(model, {
            text,
            source_lang: source,
            target_lang: target,
        });

        const translated =
            out?.translated_text || out?.translation || out?.text || '';

        return c.json({ ok: true, translated });
    } catch (e) {
        console.error('translate error:', e);
        return c.json({ error: 'Translate failed' }, 500);
    }
});

<<<<<<< HEAD
export default translateRouter;
=======
export default translateRouter;
>>>>>>> feature/lead
