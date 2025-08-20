const GRAPH = "https://graph.facebook.com/v20.0";

export const onRequestPost = async (ctx) => {
    const env = ctx.env;
    const { to, body } = await ctx.request.json().catch(() => ({}));
    const dest = (to || "").replace(/\D/g, "");
    if (!dest || !body) return new Response(JSON.stringify({ ok:false, error:"Missing to/body" }), { status:400 });

    const res = await fetch(`${GRAPH}/${env.PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to: dest, type: "text", text: { body } })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return new Response(JSON.stringify({ ok:false, error: data.error || data }), { status: res.status });

    // lưu D1 (không bắt buộc nhưng nên có)
    try {
        await env.DB.prepare(
            "INSERT INTO messages(chat_id, direction, wa_from, wa_to, type, body, ts) VALUES (?,?,?,?,?,?,?)"
        ).bind(dest, "out", env.BUSINESS_WA_E164 || "", dest, "text", body, Date.now()).run();
    } catch (e) {}

    return new Response(JSON.stringify({ ok:true, data }), { headers: { "Content-Type":"application/json" } });
};
