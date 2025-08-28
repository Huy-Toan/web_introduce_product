const encoder = new TextEncoder();

export const isStrongPassword = (p = "") =>
    p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);

const toHex = (buffer) =>
    [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");

export async function hashPassword(password) {
    const salt = crypto.randomUUID();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return `${salt}$${toHex(hashBuffer)}`;
}

export async function verifyPassword(password, stored) {
    const [salt, hash] = stored.split("$");
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return toHex(hashBuffer) === hash;
}