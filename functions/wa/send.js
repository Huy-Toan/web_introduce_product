const GRAPH = "https://graph.facebook.com/v20.0";

export const onRequestPost = async (ctx) => {
    const env = ctx.env;
    const { to, body, template } = await ctx.request.json().catch(() => ({}));
    const dest = (to || "").replace(/\D/g, "");
    const hasTemplate = !!template;
    const text = (body || "").toString();

    if (!env.PHONE_NUMBER_ID || !env.WHATSAPP_TOKEN)
        return new Response(
            JSON.stringify({ ok: false, error: "Missing PHONE_NUMBER_ID or WHATSAPP_TOKEN" }),
            { status: 500 }
        );
    if (!dest || (!text && !hasTemplate))
        return new Response(JSON.stringify({ ok: false, error: "Missing to/body" }), { status: 400 });

    let payload;
    let dbType;
    let dbBody;
    if (hasTemplate) {
        payload = { messaging_product: "whatsapp", to: dest, type: "template", template };
        dbType = "template";
        dbBody = `[template:${template?.name || ""}]`;
    } else {
        payload = { messaging_product: "whatsapp", to: dest, type: "text", text: { body: text } };
        dbType = "text";
        dbBody = text;
    }

    const res = await fetch(`${GRAPH}/${env.PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
        return new Response(JSON.stringify({ ok: false, error: data.error || data }), { status: res.status });

    // lưu D1 (không bắt buộc nhưng nên có)
    let dbInserted = false;
    try {
        await env.DB.prepare(
            "INSERT INTO messages(chat_id, direction, wa_from, wa_to, type, body, ts) VALUES (?,?,?,?,?,?,?)"
        )
            .bind(dest, "out", env.BUSINESS_WA_E164 || "", dest, dbType, dbBody, Date.now())
            .run();
        dbInserted = true;
    } catch {
        /* ignore */
    }

    return new Response(JSON.stringify({ ok: true, data, dbInserted }), {
        headers: { "Content-Type": "application/json" },
    });
};
