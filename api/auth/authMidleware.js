import { jwtVerify } from "jose";
import { getCookie } from "hono/cookie";
const enc = new TextEncoder();
const getKey = (secret) => enc.encode(secret);
const nowSec = () => Math.floor(Date.now() / 1000);
const bearer = (h) => (h?.startsWith("Bearer ") ? h.slice(7) : null);

export const auth = async (c, next) => {
    try {
        const token =
            bearer(c.req.header("Authorization")) || getCookie(c, "token");
        if (!token) return c.json({ error: "Unauthorized" }, 401);
        if (!c.env.DB_AVAILABLE)
            return c.json({ error: "Database not available" }, 503);

        const { payload } = await jwtVerify(token, getKey(c.env.JWT_SECRET));
        const { jti } = payload;

        const row = await c.env.DB.prepare(
            "SELECT revoked, expires_at FROM sessions WHERE jti = ?"
        )
            .bind(jti)
            .first();

        if (!row)
            return c.json({ error: "Invalid session. Please log in again." }, 401);
        if (row.revoked)
            return c.json({ error: "Token revoked. Please log in again." }, 401);
        if (!row.expires_at || row.expires_at < nowSec())
            return c.json({ error: "Token expired. Please log in again." }, 401);

        c.set("user", payload);
        await next();
    } catch {
        return c.json({ error: "Invalid or expired token" }, 401);
    }
};

// Mapping role -> permissions
const rolePermissions = {
    superadmin: ["users.manage"],
    admin: ["users.manage"],
    user_manager: ["users.manage"],
};

// Require authenticated admin (non-"user" role)
export const requireAdminAuth = async (c, next) => {
    await auth(c, async () => {
        const user = c.get("user");
        if (!user || !user.role || user.role === "user") {
            return c.json({ error: "Forbidden" }, 403);
        }
        await next();
    });
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

// Require one or many permissions
export const requirePerm = (perms) => async (c, next) => {
    const user = c.get("user");
    const needed = Array.isArray(perms) ? perms : [perms];
    const permsOfRole = rolePermissions[user?.role] || [];
    const ok = needed.every((p) => permsOfRole.includes(p));
    if (!ok) return c.json({ error: "Forbidden" }, 403);
    await next();
};