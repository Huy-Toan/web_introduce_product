// src/components/WhatsappCTA.tsx
import { useMemo, useState, lazy, Suspense } from "react";

const QRCodeCanvas = lazy(() =>
    import("qrcode.react").then(m => ({ default: m.QRCodeCanvas }))
);

function WhatsappCTA() {
    const phone   = (import.meta.env.VITE_WA_PHONE || "").trim(); // ví dụ: 84123456789
    const prefill = import.meta.env.VITE_WA_BASEMSG || "Xin chào, tôi cần tư vấn/báo giá...";
    const utm     = import.meta.env.VITE_WA_UTM || "";            // ví dụ: ?utm_source=website...

    const url = useMemo(() =>
            `https://wa.me/${phone}?text=${encodeURIComponent(prefill)}`,
        [phone, prefill]
    );

    const [showQR, setShowQR] = useState(false);

    // Nếu chưa cấu hình phone, không render nút (tránh link hỏng)
    if (!/^\d{8,15}$/.test(phone)) return null;

    return (
        <div className="fixed bottom-24 right-8 z-50">
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-2xl shadow bg-green-600 text-white font-semibold hover:opacity-90"
                onClick={() => {
                    // GA/Zaraz
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({
                        event: "wa_click",
                        page: window.location.pathname,
                    });
                }}
            >
                Chat WhatsApp
            </a>


            <button
                onClick={() => setShowQR(v => !v)}
                className="mt-2 block text-xs text-gray-700"
                aria-expanded={showQR}
            >
                {showQR ? "Ẩn mã QR" : "Hoặc quét QR"}
            </button>

            {showQR && (
                <div className="mt-2 p-3 bg-white rounded-2xl shadow">
                    <Suspense fallback={<div style={{ width: 164, height: 164 }} />}>
                        <QRCodeCanvas value={url} size={164} />
                    </Suspense>
                </div>
            )}
        </div>
    );
}

export default WhatsappCTA;
