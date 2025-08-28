// src/lib/email-resend.js
import { Resend } from "resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendEmailResend(
    c,
    { to, subject, html, text, replyTo }
) {
    const apiKey = c.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("Missing RESEND_API_KEY");

    // Enforce from no-reply@itxeasy.com (domain đã verify)
    const configuredFrom = c.env.FROM_EMAIL || "no-reply@itxeasy.com";
    const from =
        /@itxeasy\.com$/i.test(configuredFrom)
            ? `ITXEASY <${configuredFrom}>`
            : "ITXEASY <no-reply@itxeasy.com>";

    // Chuẩn hoá inputs
    const toArr = Array.isArray(to) ? to : [to].filter(Boolean);
    if (!toArr.length || !subject || !(html || text)) {
        throw new Error("Missing to/subject/body");
    }
    // Nếu bạn cho phép client gửi 'to', nên validate:
    toArr.forEach((mail) => {
        if (!EMAIL_RE.test(String(mail))) {
            throw new Error(`Invalid recipient: ${mail}`);
        }
    });

    const resend = new Resend(apiKey);

    const payload = {
        from,
        to: toArr,
        subject,
        html,
        ...(text ? { text } : {}),
        // mặc định reply_to là info@itxeasy.com
        reply_to: Array.isArray(replyTo)
            ? replyTo
            : [replyTo || "info@itxeasy.com"],
        // headers tuỳ chọn
        // headers: { 'List-Unsubscribe': '<mailto:unsubscribe@itxeasy.com>' },
    };

    const { data, error } = await resend.emails.send(payload);
    if (error) throw new Error(error.message || "Resend failed");
    return data;
}