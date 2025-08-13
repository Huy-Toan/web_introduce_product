import { jwtVerify } from "jose";

const enc = new TextEncoder();
const getKey = (secret) => enc.encode(secret);
const nowSec = () => Math.floor(Date.now() / 1000);
const bearer = (h) => (h?.startsWith("Bearer ") ? h.slice(7) : null);

export const auth = async (c, next) => {
    try {
        const token = bearer(c.req.header("Authorization"));
        if (!token) return c.json({ error: "Unauthorized" }, 401);
        if (!c.env.DB_AVAILABLE) return c.json({ error: "Database not available" }, 503);

        const { payload } = await jwtVerify(token, getKey(c.env.JWT_SECRET));
        const { jti } = payload;

        const row = await c.env.DB.prepare(
            "SELECT revoked, expires_at FROM sessions WHERE jti = ?"
        ).bind(jti).first();

        if (!row) return c.json({ error: "Invalid session. Please log in again." }, 401);
        if (row.revoked) return c.json({ error: "Token revoked. Please log in again." }, 401);
        if (!row.expires_at || row.expires_at < nowSec()) return c.json({ error: "Token expired. Please log in again." }, 401);

        c.set("user", payload);
        await next();
    } catch {
        return c.json({ error: "Invalid or expired token" }, 401);
    }
};

// chấp nhận 1 hoặc nhiều vai trò
export const requireAnyRole = (roles) => async (c, next) => {
    const user = c.get("user");
    const allow = Array.isArray(roles) ? roles : [roles];
    if (!user || !allow.includes(user.role)) {
        return c.json({ error: "Forbidden" }, 403);
    }
    await next();
};