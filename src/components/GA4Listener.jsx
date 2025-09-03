// src/components/GA4Listener.jsx
import { useGA4Pageviews } from "../hooks/useGA4Pageviews";
export default function GA4Listener() {
    // bỏ qua toàn bộ route admin để không lẫn dữ liệu public
    useGA4Pageviews({ exclude: ["/admin"] });
    return null;
}
