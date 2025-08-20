//CTA toàn site + ẩn ở admin + prefill theo trang – JSX

import { useLocation } from "react-router-dom";
import WhatsappCTA from "./WhatsappCTA";

export default function GlobalWhatsApp() {
    const { pathname } = useLocation();

    // Ẩn CTA ở khu vực admin
    if (pathname.startsWith("/api/admin")) return null;

    // Prefill theo trang
    let msg;

    if (pathname.startsWith("/product/product-detail")) {
        const m = pathname.match(/\/product\/product-detail\/([^/]+)/);
        const slugOrId = m && m[1] ? m[1].replace(/-/g, " ") : "";
        msg = `Tôi muốn hỏi báo giá & vận chuyển cho sản phẩm: ${slugOrId}.`;
    } else if (pathname === "/contact") {
        msg = "Xin chào, vui lòng tư vấn tuyến/cước cho lô hàng của tôi.";
    } else if (pathname === "/what_we_do") {
        msg = "Tôi quan tâm dịch vụ XNK, cho tôi biết quy trình và chi phí.";
    }

    return <WhatsappCTA msg={msg} />;
}
