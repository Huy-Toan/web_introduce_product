// api/routes/auth.js
import { Hono } from "hono";
import { SignJWT } from "jose";
import { auth } from "../auth/authMidleware";

const enc = new TextEncoder();
const getKey = (secret) => enc.encode(secret);
const nowSec = () => Math.floor(Date.now() / 1000);

const authRouter = new Hono();

authRouter.post("/login", async (c) => {
    try {
        console.log("Login attempt started");

        // Kiểm tra database availability
        if (!c.env.DB_AVAILABLE) {
            console.error("Database not available");
            return c.json({ error: "Database not available" }, 503);
        }

        // Kiểm tra JWT_SECRET
        if (!c.env.JWT_SECRET) {
            console.error("JWT_SECRET not configured");
            return c.json({ error: "Server configuration error" }, 500);
        }

        const { email, password } = await c.req.json();
        console.log("Login data received:", { email, hasPassword: !!password });

        if (!email || !password) {
            console.log("Missing email or password");
            return c.json({ error: "Missing email/password" }, 400);
        }

        // lấy user theo email
        console.log("Querying user from database...");
        const user = await c.env.DB.prepare(
            "SELECT id, name, email, password, role FROM users WHERE email = ?"
        ).bind(email).first();

        console.log("User query result:", user ? { id: user.id, email: user.email, role: user.role } : "No user found");

        if (!user) {
            console.log("User not found for email:", email);
            return c.json({ error: "Invalid credentials" }, 401);
        }

        // so sánh mật khẩu (hiện đang plaintext theo seed)
        console.log("Comparing passwords...");
        console.log("Input password:", password);
        console.log("Stored password:", user.password);

        if (password !== user.password) {
            console.log("Password mismatch");
            return c.json({ error: "Invalid credentials" }, 401);
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

        console.log("Login successful for user:", user.email);
        return c.json({
            access_token: token,
            token_type: "Bearer",
            expires_in: maxAgeSec,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (e) {
        console.error("Login error:", e);
        console.error("Error name:", e.name);
        console.error("Error message:", e.message);
        console.error("Error stack:", e.stack);

        // Trả về lỗi cụ thể hơn cho development
        return c.json({
            error: "Login failed",
            details: e.message,
            type: e.name
        }, 500);
    }
});

// Alias để tương thích frontend cũ
authRouter.post("/admin/login", async (c) => {
    try {
        // Gọi lại chính route /login nội bộ
        const url = new URL("/api/auth/login", c.req.url); // URL tuyệt đối đến route login thật
        const res = await fetch(url.toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: await c.req.text(), // giữ nguyên body FE gửi lên
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            return c.json({ message: data?.error || data?.message || "Login failed" }, res.status);
        }

        // Trả về theo format cũ { token }
        return c.json({ token: data.access_token }, 200);

    } catch (err) {
        console.error("Alias /admin/login error:", err);
        return c.json({ message: "Internal server error" }, 500);
    }
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