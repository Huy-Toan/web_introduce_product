export function useWhatsAppLink() {
    const phone = (import.meta.env.VITE_WA_PHONE || "").trim();
    const baseMsg = import.meta.env.VITE_WA_BASEMSG || "Xin chào, tôi cần tư vấn/báo giá...";

    function build(msg) {
        const text = encodeURIComponent(msg || baseMsg);
        return `https://wa.me/${phone}?text=${text}`;
    }

    function isPhoneOk() {
        return /^\d{8,15}$/.test(phone);
    }

    return { build, isPhoneOk, phone };
}
