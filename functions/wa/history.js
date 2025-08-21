export const onRequestGet = async (ctx) => {
    const env = ctx.env;
    const { searchParams } = new URL(ctx.request.url);
    const chat = (searchParams.get("chat") || "").replace(/\D/g, "");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    if (!chat) return new Response(JSON.stringify({ ok:false, error:"Missing chat" }), { status:400 });

    let rows = [];
    try {
        const rs = await env.DB.prepare(
            "SELECT id, chat_id, direction, wa_from, wa_to, type, body, ts FROM messages WHERE chat_id = ? ORDER BY ts DESC LIMIT ?"
        ).bind(chat, limit).all();
        rows = (rs?.results || []).reverse();
    } catch (e) {}

    return new Response(JSON.stringify({ ok:true, messages: rows }), { headers: { "Content-Type":"application/json" } });
};
