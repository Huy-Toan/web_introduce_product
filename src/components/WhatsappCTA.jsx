import { useMemo, useState, lazy, Suspense } from "react";
import PropTypes from "prop-types";
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
        br: "fixed right-8 bottom-24 flex flex-col items-end space-y-2",
        bl: "fixed left-8 bottom-24 flex flex-col items-start space-y-2",
        tr: "fixed right-8 top-5 flex flex-col items-end space-y-2",
        tl: "fixed left-8 top-5 flex flex-col items-start space-y-2",
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
                className="block text-xs text-gray-700"
                aria-expanded={showQR}
            >
                {showQR ? "Ẩn mã QR" : "Hoặc quét QR"}
            </button>

            {showQR && (
                <div className="p-3 bg-white rounded-2xl shadow">
                    <Suspense fallback={<div style={{ width: 164, height: 164 }} />}>
                        <QRCodeCanvas value={url} size={164} />
                    </Suspense>
                </div>
            )}
        </div>
    );
}


WhatsappCTA.propTypes = {
    msg: PropTypes.string,
    position: PropTypes.oneOf(["br", "bl", "tr", "tl"])
};
