// src/routes/UserRouter.js
import { Hono } from "hono";
import { requireAdminAuth, requirePerm } from "../auth/authMidleware.js";


const userRouter = new Hono();

// Require authenticated admin with proper permission for all user routes
userRouter.use("*", requireAdminAuth);
userRouter.use("*", requirePerm("users.manage"));

const bad = (c, msg = "Bad Request", code = 400) =>
  c.json({ ok: false, error: msg }, code);
const ok = (c, data = {}, code = 200) =>
  c.json({ ok: true, ...data }, code);

const isEmail = (s = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

// GET: tất cả user
userRouter.get("/", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    ).all();
    return ok(c, { items: results });
  } catch (e) {
    console.error(e);
    return bad(c, "Failed to fetch users", 500);
  }
});

// GET: chi tiết user
userRouter.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  try {
    const user = await c.env.DB.prepare(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?"
    ).bind(id).first();
    if (!user) return bad(c, "Not found", 404);
    return ok(c, { item: user });
  } catch (e) {
    console.error(e);
    return bad(c, "Failed to fetch user", 500);
  }
});

// POST: tạo user mới
userRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const password = (body.password || "").trim(); // Có thể hash ở đây
    const role = (body.role || "user").trim();

    if (!name || !email || !password)
      return bad(c, "name, email, password are required");
    if (!isEmail(email)) return bad(c, "Invalid email");

    const result = await c.env.DB.prepare(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`
    ).bind(name, email, password, role).run();

    const newUser = await c.env.DB.prepare(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?"
    ).bind(result.meta.last_row_id).first();

    return ok(c, { item: newUser }, 201);
  } catch (e) {
    console.error(e);
    return bad(c, "Failed to create user", 500);
  }
});

// PUT: cập nhật user
userRouter.put("/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  try {
    const body = await c.req.json();
    const fields = [];
    const binds = [];

    if (body.name) {
      fields.push("name = ?");
      binds.push(body.name.trim());
    }
    if (body.email) {
      if (!isEmail(body.email.trim())) return bad(c, "Invalid email");
      fields.push("email = ?");
      binds.push(body.email.trim());
    }
    if (body.password) {
      fields.push("password = ?");
      binds.push(body.password.trim()); // Có thể hash ở đây
    }
    if (body.role) {
      fields.push("role = ?");
      binds.push(body.role.trim());
    }

    if (!fields.length) return bad(c, "No fields to update");

    const res = await c.env.DB.prepare(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`
    ).bind(...binds, id).run();

    if ((res.meta?.changes || 0) === 0) return bad(c, "Not found", 404);

    const updated = await c.env.DB.prepare(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?"
    ).bind(id).first();

    return ok(c, { item: updated });
  } catch (e) {
    console.error(e);
    return bad(c, "Failed to update user", 500);
  }
});

// DELETE: xóa user
userRouter.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  try {
    const res = await c.env.DB.prepare(
      "DELETE FROM users WHERE id = ?"
    ).bind(id).run();
    if ((res.meta?.changes || 0) === 0) return bad(c, "Not found", 404);
    return ok(c, { deleted: true });
  } catch (e) {
    console.error(e);
    return bad(c, "Failed to delete user", 500);
  }
});

export default userRouter;
