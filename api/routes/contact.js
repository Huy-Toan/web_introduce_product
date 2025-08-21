// src/routes/ContactRouter.js
import { Hono } from "hono";
import { sendEmailResend } from "../../src/lib/email-resend";// <— THÊM

const contactRouter = new Hono();

const bad = (c, msg = "Bad Request", code = 400) =>
  c.json({ ok: false, error: msg }, code);
const ok = (c, data = {}, code = 200) =>
  c.json({ ok: true, ...data }, code);

const isEmail = (s = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const validStatus = (s = "") => ["new", "reviewed", "closed"].includes(s);

contactRouter.get("/", async (c) => {
  try {
    const result = await c.env.DB.prepare(
      "SELECT * FROM contact_messages ORDER BY created_at DESC"
    ).all();
    return ok(c, { items: result.results });
  } catch (e) {
    console.error(e);
    return bad(c, "Failed to fetch contacts", 500);
  }
});

// POST: tạo mới contact + gửi mail
contactRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const fullName = (body.full_name || "").trim();
    const email = (body.email || "").trim();
    const phone = (body.phone || "").trim();
    const address = (body.address || "").trim();
    const message = (body.message || "").trim();

    if (!fullName || !email || !message)
      return bad(c, "fullName, email, message are required");
    if (!isEmail(email)) return bad(c, "Invalid email");

    // Lưu DB
    const result = await c.env.DB.prepare(
      `INSERT INTO contact_messages (full_name, email, phone, address, message)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(fullName, email, phone, address, message).run();

    const newItem = await c.env.DB.prepare(
      "SELECT * FROM contact_messages WHERE id = ?"
    ).bind(result.meta.last_row_id).first();

    // Soạn mail
    const brand = c.env.BRAND_NAME || "Website";
    const admin = c.env.ADMIN_EMAIL || "admin@example.com";

    const adminHtml = `
      <div>
        <h2>New contact message</h2>
        <p><b>Name:</b> ${fullName}</p>
        <p><b>Email:</b> ${email}</p>
        ${phone ? `<p><b>Phone:</b> ${phone}</p>` : ""}
        ${address ? `<p><b>Address:</b> ${address}</p>` : ""}
        <p><b>Message:</b></p>
        <pre style="white-space:pre-wrap;">${message}</pre>
        <hr/>
        <p>Created at: ${newItem.created_at} — Status: ${newItem.status} — ID: ${newItem.id}</p>
      </div>
    `;
    const adminText =
      `New contact from ${fullName}
Email: ${email}
Phone: ${phone}
Address: ${address}

Message:
${message}`;

    const userHtml = `
      <div>
        <p>Chào ${fullName},</p>
        <p>Cảm ơn bạn đã liên hệ ${brand}. Chúng tôi đã nhận được tin nhắn và sẽ phản hồi sớm nhất.</p>
        <p><b>Nội dung bạn gửi:</b></p>
        <blockquote style="margin:0;padding-left:12px;border-left:3px solid #ddd;">
          ${message.replace(/\n/g, "<br/>")}
        </blockquote>
        <p>Trân trọng,<br/>${brand}</p>
      </div>
    `;
    const userText =
      `Chào ${fullName},
Cảm ơn bạn đã liên hệ ${brand}. Chúng tôi sẽ phản hồi sớm nhất.

Nội dung:
${message}`;

    // Gửi mail (không để lỗi mail làm fail API — vẫn trả 201)
    try {
      await Promise.all([
        sendEmailResend(c, {
          to: admin,
          subject: `[${brand}] New contact from ${fullName}`,
          html: adminHtml,
          text: adminText,
          replyTo: email, // Admin bấm Reply là trả lời thẳng người gửi
        }),
        sendEmailResend(c, {
          to: email,
          subject: `Cảm ơn bạn đã liên hệ ${brand}`,
          html: userHtml,
          text: userText,
        }),
      ]);
    } catch (mailErr) {
      console.error("Email error:", mailErr);
    }

    return ok(c, { item: newItem }, 201);
  } catch (e) {
    console.error(e);
    return bad(c, "Failed to create contact", 500);
  }
});

// PATCH: đổi trạng thái
contactRouter.patch("/:id/status", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  try {
    const { status } = await c.req.json();
    if (!validStatus(status))
      return bad(c, "Invalid status (new|reviewed|closed)");

    const res = await c.env.DB.prepare(
      "UPDATE contact_messages SET status = ? WHERE id = ?"
    ).bind(status, id).run();

    if ((res.meta?.changes || 0) === 0) return bad(c, "Not found", 404);
    const updated = await c.env.DB.prepare(
      "SELECT * FROM contact_messages WHERE id = ?"
    ).bind(id).first();
    return ok(c, { item: updated });
  } catch (e) {
    console.error(e);
    return bad(c, "Failed to update status", 500);
  }
});

// DELETE: xóa contact
contactRouter.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  try {
    const res = await c.env.DB.prepare(
      "DELETE FROM contact_messages WHERE id = ?"
    ).bind(id).run();
    if ((res.meta?.changes || 0) === 0) return bad(c, "Not found", 404);
    return ok(c, { deleted: true });
  } catch (e) {
    console.error(e);
    return bad(c, "Failed to delete contact", 500);
  }
});

export default contactRouter;
