import { useState } from "react";
import { useWhatsAppLink } from "../hooks/useWhatsAppLink";

export default function WhatsappWidget({ defaultMsg, showButton = false }) {
    const { build, isPhoneOk } = useWhatsAppLink();
    const [open, setOpen] = useState(!showButton);
    const [form, setForm] = useState({ name: "", cargo: "", from: "", to: "" });

    if (!isPhoneOk()) return null;

    const msg =
        `Xin chào, tôi là ${form.name || "(khách)"}.
${defaultMsg ? defaultMsg + "\n" : ""}Hàng hóa/HS: ${form.cargo || "-"}
Tuyến: ${form.from || "-"} → ${form.to || "-"}
Vui lòng tư vấn/báo giá.`;

    const url = build(msg);

    const continueToWA = async () => {
        try {
            // (Tuỳ chọn) log lead:
            // await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, page: location.pathname }) });
        } catch (_) {}
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: "wa_click", page: window.location.pathname, where: "widget" });

        window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <div className="w-full max-w-md rounded-2xl border border-gray-200 p-4 bg-white shadow">
            {showButton && (
                <button
                    onClick={() => setOpen(v => !v)}
                    className="mb-2 text-sm text-gray-600 underline"
                >
                    {open ? "Ẩn form tư vấn nhanh" : "Tư vấn nhanh qua WhatsApp"}
                </button>
            )}

            {open && (
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <input className="border rounded-lg px-3 py-2" placeholder="Tên của bạn"
                               value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/>
                        <input className="border rounded-lg px-3 py-2" placeholder="Hàng hóa / HS code"
                               value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })}/>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <input className="border rounded-lg px-3 py-2" placeholder="POL (cảng đi)"
                               value={form.from} onChange={e => setForm({ ...form, from: e.target.value })}/>
                        <input className="border rounded-lg px-3 py-2" placeholder="POD (cảng đến)"
                               value={form.to} onChange={e => setForm({ ...form, to: e.target.value })}/>
                    </div>

                    <button onClick={continueToWA}
                            className="w-full px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:opacity-90">
                        Tiếp tục trên WhatsApp
                    </button>
                </div>
            )}
        </div>
    );
}
