// api/routes/auth.js
import { Hono } from "hono";
import { SignJWT } from "jose";
import { setCookie } from "hono/cookie";
import { verifyPassword, hashPassword } from "../utils/password.js";
import { auth } from "../auth/authMidleware";

const enc = new TextEncoder();
const getKey = (secret) => enc.encode(secret);
const nowSec = () => Math.floor(Date.now() / 1000);

const authRouter = new Hono();

async function performLogin(c, body) {
    try {
        console.log("Login attempt started");

        // Kiểm tra database availability
        if (!c.env.DB_AVAILABLE) {
            console.error("Database not available");
            return { error: "Database not available", code: 503 };
        }

        // Kiểm tra JWT_SECRET
        if (!c.env.JWT_SECRET) {
            console.error("JWT_SECRET not configured");
            return c.json({ error: "Server configuration error" }, 500);
        }

        const { email, password } = body;
        console.log("Login data received:", { email, hasPassword: !!password });

        if (!email || !password) {
            console.log("Missing email or password");
            return { error: "Missing email/password", code: 400 };
        }

        // lấy user theo email
        console.log("Querying user from database...");
        const user = await c.env.DB.prepare(
            "SELECT id, name, email, password, role FROM users WHERE email = ?"
        ).bind(email).first();

        console.log("User query result:", user ? { id: user.id, email: user.email, role: user.role } : "No user found");

        if (!user) {
            console.log("User not found for email:", email);
            return { error: "Invalid credentials", code: 401 };
        }

        // so sánh mật khẩu đã băm
        console.log("Comparing passwords...");
        let valid = false;
        if (user.password.includes("$")) {
            valid = await verifyPassword(password, user.password);
        } else {
            valid = user.password === password;
            if (valid) {
                // Nâng cấp mật khẩu plaintext lên dạng băm
                const newHash = await hashPassword(password);
                await c.env.DB.prepare("UPDATE users SET password = ? WHERE id = ?")
                    .bind(newHash, user.id)
                    .run();
                user.password = newHash;
            }
        }
        if (!valid) {
            console.log("Password mismatch");
            return { error: "Invalid credentials", code: 401 };
        }

        console.log("Password match successful, generating JWT...");
        const maxAgeSec = Number(c.env.JWT_EXPIRES_IN ?? 900);
        const jti = crypto.randomUUID();
        const iat = nowSec();
        const exp = iat + maxAgeSec;

        console.log("JWT config:", { maxAgeSec, jti, iat, exp });

        // Đảm bảo bảng sessions tồn tại trước khi insert
        console.log("Ensuring sessions table exists...");
        await c.env.DB.prepare(`
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                jti TEXT NOT NULL UNIQUE,
                expires_at INTEGER NOT NULL,
                revoked INTEGER DEFAULT 0,
                created_at INTEGER DEFAULT (strftime('%s','now'))
            )
        `).run();

        console.log("Inserting session...");
        const sessionResult = await c.env.DB.prepare(
            "INSERT INTO sessions (user_id, jti, expires_at, revoked) VALUES (?, ?, ?, 0)"
        ).bind(user.id, jti, exp).run();

        console.log("Session insert result:", sessionResult);

        console.log("Creating JWT token...");
        const token = await new SignJWT({
            sub: String(user.id),
            email: user.email,
            role: user.role,      // ← role lấy từ DB
            name: user.name,
            jti
        })
            .setProtectedHeader({ alg: "HS256", typ: "JWT" })
            .setIssuedAt(iat)
            .setExpirationTime(exp)
            .sign(getKey(c.env.JWT_SECRET));
        setCookie(c, "token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "Lax",
            path: "/",
            maxAge: maxAgeSec,
        });

        console.log("Login successful for user:", user.email);
        return {
            token,
            maxAgeSec,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        };
    } catch (e) {
        console.error("Login error:", e);
        return { error: "Login failed", code: 500, details: e.message };
    }
}

authRouter.post("/login", async (c) => {
    const body = await c.req.json();
    const result = await performLogin(c, body);
    if (result.error) return c.json({ error: result.error }, result.code);
    return c.json({
        access_token: result.token,
        token_type: "Bearer",
        expires_in: result.maxAgeSec,
        user: result.user,
    });
});

// Alias để tương thích frontend cũ
authRouter.post("/admin/login", async (c) => {
    const body = await c.req.json();
    const result = await performLogin(c, body);
    if (result.error) return c.json({ message: result.error }, result.code);
    return c.json({ token: result.token }, 200);
});

authRouter.get("/me", auth, (c) => {
    return c.json({ authenticated: true, user: c.get("user") });
});

authRouter.post("/logout", auth, async (c) => {
    try {
        const { jti } = c.get("user");
        await c.env.DB.prepare("UPDATE sessions SET revoked = 1 WHERE jti = ?")
            .bind(jti).run();
        return c.json({ success: true });
    } catch (e) {
        console.error("Logout error:", e);
        return c.json({ error: "Logout failed" }, 500);
    }
});

export default authRouter;