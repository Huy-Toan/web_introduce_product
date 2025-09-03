// src/lib/ga.js
const allowed = (import.meta.env.VITE_GA_ALLOWED_HOSTS || "localhost,127.0.0.1")
    .split(",").map(s => s.trim());

export function gaEvent(name, params = {}) {
    if (typeof window === "undefined") return;
    if (!allowed.includes(location.hostname)) return;
    if (!window.gtag) return;
    window.gtag("event", name, { ...params, ...(import.meta.env.DEV ? { debug_mode: true } : {}) });
    if (import.meta.env.DEV) console.debug("[GA4] event:", name, params);
}

export function trackViewItem(product) {
    if (!product) return;
    const id = String(product.id ?? product.slug ?? product.product_slug ?? "");
    const name = product.title || product.name || "";
    gaEvent("view_item", {
        currency: "VND",
        value: Number(product.price) || 0,
        items: [{
            item_id: id,
            item_name: name,
            item_category: product.parent_name ?? product.parent?.name ?? undefined,
            item_category2: product.subcategory_name ?? product.subcategory?.name ?? undefined,
            price: Number(product.price) || undefined,
        }],
    });
}

export function trackSelectItem(item, listName = "related_products") {
    if (!item) return;
    const id = String(item.id ?? item.slug ?? item.product_slug ?? "");
    const name = item.title || item.name || "";
    gaEvent("select_item", { item_list_name: listName, items: [{ item_id: id, item_name: name }] });
}

// (Tùy chọn) Bài viết
export function trackViewArticle(article) {
    if (!article) return;
    gaEvent("view_article", {
        article_id: String(article.id ?? article.slug ?? ""),
        article_title: article.title,
        page_path: location.pathname,
    });
}

// (tuỳ chọn) khi chọn bài viết từ danh sách/Sidebar
export function trackSelectArticle(article, listName = "news_sidebar") {
    if (!article) return;
    gaEvent("select_article", {
        article_id: String(article.id ?? article.slug ?? ""),
        article_title: article.title,
        item_list_name: listName, // biết event đến từ danh sách nào
    });
}

