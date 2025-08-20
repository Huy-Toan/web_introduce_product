import { useMemo, useState, lazy, Suspense } from "react";
import { useWhatsAppLink } from "../hooks/useWhatsAppLink";

const QRCodeCanvas = lazy(() =>
    import("qrcode.react").then(m => ({ default: m.QRCodeCanvas }))
);

export default function WhatsappCTA({ msg, position = "br" }) {
    const { build, isPhoneOk } = useWhatsAppLink();
    const url = useMemo(() => build(msg), [build, msg]);
    const [showQR, setShowQR] = useState(false);

    if (!isPhoneOk()) return null;

    const posClass = {
        br: "fixed right-5 bottom-24",
        bl: "fixed left-5 bottom-24",
        tr: "fixed right-5 top-5",
        tl: "fixed left-5 top-5",
    }[position];

    return (
        <div className={`${posClass} z-[9999]`}>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-2xl shadow bg-green-600 text-white font-semibold hover:opacity-90"
                onClick={() => {
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({ event: "wa_click", page: window.location.pathname, where: "cta_fab" });
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
