import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import ProductCard from "./ProductCard";

const SUPPORTED = ["vi", "en"];
const DEFAULT_LOCALE = "vi";

function resolveLocale(propLocale, search) {
    const fromProp = (propLocale || "").toLowerCase();
    const urlLc = new URLSearchParams(search).get("locale")?.toLowerCase() || "";
    const lsLc = (localStorage.getItem("locale") || "").toLowerCase();

    if (SUPPORTED.includes(fromProp)) return fromProp;
    if (SUPPORTED.includes(urlLc)) return urlLc;
    if (SUPPORTED.includes(lsLc)) return lsLc;
    return DEFAULT_LOCALE;
}

export default function IntroduceProductsSection({ products: productsProp = [], locale: localeProp }) {
    const navigate = useNavigate();
    const location = useLocation();

    const locale = useMemo(
        () => resolveLocale(localeProp, location.search),
        [localeProp, location.search]
    );

    const t = useMemo(
        () =>
            locale === "vi"
                ? {
                    subtitle: "Tốt nhất dành cho bạn",
                    heading: "Giới thiệu sản phẩm mới",
                    empty: "Chưa có sản phẩm.",
                }
                : {
                    subtitle: "Best for all of you",
                    heading: "Introduce New Products",
                    empty: "No products yet.",
                },
        [locale]
    );

    const [items, setItems] = useState(productsProp);
    const [loading, setLoading] = useState(productsProp.length === 0);

    useEffect(() => {
        setItems(productsProp);
        setLoading(productsProp.length === 0);
    }, [productsProp]);

    useEffect(() => {
        if (productsProp.length > 0) return;
        const ac = new AbortController();
        (async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/products?locale=${encodeURIComponent(locale)}`, {
                    signal: ac.signal,
                });
                const data = await res.json();
                const list = (data.products || data.items || data || []).map((p) => ({
                    id: p.id,
                    title: p.title || p.name,
                    slug: p.slug || p.id,
                    image_url: p.image_url,
                }));
                setItems(list);
            } catch (err) {
                console.error("Failed to load products:", err);
                setItems([]);
            } finally {
                setLoading(false);
            }
        })();
        return () => ac.abort();
    }, [locale, productsProp]);

    const goDetail = (p) => {
        if (!p?.slug) return;
        navigate(`/product/product-detail/${encodeURIComponent(p.slug)}`);
    };

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4 max-w-7xl">
                <div className="text-center mb-10">
                    <p className="text-sm font-semibold tracking-widest uppercase text-yellow-600">
                        {t.subtitle}
                    </p>
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold text-green-600">
                        {t.heading}
                    </h2>
                </div>

                {loading ? (
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center text-gray-500">{t.empty}</div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {items.map((p) => (
                            <ProductCard key={p.id || p.slug} product={p} onClick={() => goDetail(p)} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

IntroduceProductsSection.propTypes = {
    products: PropTypes.array,
    locale: PropTypes.string,
};