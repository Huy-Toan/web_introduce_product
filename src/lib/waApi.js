const API_BASE = import.meta.env.VITE_API_BASE_URL || "";


export async function sendMessage(to, body) {
    const r = await fetch(`${API_BASE}/wa/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, body })
    });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || "Send failed");
    return j;
}
export async function fetchHistory(chat, limit=50) {
    const r = await fetch(`${API_BASE}/wa/history?chat=${encodeURIComponent(chat)}&limit=${limit}`);
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || "History failed");
    return j.messages || [];
}
