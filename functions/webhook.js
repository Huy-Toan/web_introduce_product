export const onRequestGet = async (ctx) => {
    const { searchParams } = new URL(ctx.request.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");
    if (mode === "subscribe" && token === ctx.env.VERIFY_TOKEN) {
        return new Response(challenge, { status: 200 });
    }
    return new Response("Forbidden", { status:403 });
};

export const onRequestPost = async (ctx) => {
    const env = ctx.env;
    const payload = await ctx.request.json().catch(() => ({}));

    try {
        const entry = payload.entry?.[0];
        const change = entry?.changes?.[0];
        const value  = change?.value;
        const msg    = value?.messages?.[0];
        if (msg) {
            const from = (msg.from || "").replace(/\D/g, ""); // số khách
            const to   = env.BUSINESS_WA_E164 || "";
            const type = msg.type;
            const body = type === "text" ? (msg.text?.body || "") : `[${type}]`;
            const ts   = parseInt(msg.timestamp || (Date.now()/1000), 10) * 1000;

            await env.DB.prepare(
                "INSERT INTO messages(chat_id, direction, wa_from, wa_to, type, body, ts) VALUES (?,?,?,?,?,?,?)"
            ).bind(from, "in", from, to, type, body, ts).run();
        }
    } catch (e) {}

    return new Response("OK", { status:200 });
};
