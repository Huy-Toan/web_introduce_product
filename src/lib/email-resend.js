// src/lib/email-resend.js
import { Resend } from "resend";

export async function sendEmailResend(c, { to, subject, html, text, replyTo }) {
    const apiKey = c.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("Missing RESEND_API_KEY");

    const resend = new Resend(apiKey);
    const from = c.env.FROM_EMAIL || "onboarding@resend.dev";

    const payload = {
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(text ? { text } : {}),
        ...(replyTo ? { reply_to: Array.isArray(replyTo) ? replyTo : [replyTo] } : {}),
    };

    const { data, error } = await resend.emails.send(payload);
    if (error) throw new Error(error.message || "Resend failed");
    return data;
}
