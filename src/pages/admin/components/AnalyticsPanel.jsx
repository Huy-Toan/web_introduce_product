import React, { useEffect, useState } from 'react';

export default function AnalyticsPanel() {
    const [overview, setOverview] = useState(null);
    const [products, setProducts] = useState([]);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);

                // KPI tổng
                const ovRes = await fetch('/api/ga4/report', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                        query: {
                            dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
                            metrics: [
                                { name: 'totalUsers' },
                                { name: 'newUsers' },
                                { name: 'screenPageViews' },
                                { name: 'averageSessionDuration' }
                            ]
                        }
                    })
                });
                const ovData = await ovRes.json();
                setOverview(ovData);

                // Top sản phẩm
                const prodRes = await fetch('/api/ga4/products-views?days=28&limit=10');
                const prodData = await prodRes.json();
                setProducts(prodData.items || []);

                // Top bài viết
                const newsRes = await fetch('/api/ga4/news-views?days=28&limit=10');
                const newsData = await newsRes.json();
                setNews(newsData.items || []);
            } catch (err) {
                console.error('Fetch GA4 error', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) return <p>Đang tải thống kê...</p>;

    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold">Thống kê GA4</h2>

            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {overview?.rows?.[0]?.metricValues?.map((m, i) => (
                    <div key={i} className="bg-white p-4 rounded shadow">
                        <h3 className="font-medium">
                            {overview.metricHeaders[i].name}
                        </h3>
                        <p className="text-2xl">{m.value}</p>
                    </div>
                ))}
            </div>

            {/* Top sản phẩm */}
            <div>
                <h3 className="font-semibold mb-2">Top sản phẩm (28 ngày)</h3>
                <table className="min-w-full bg-white border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 text-left">Sản phẩm</th>
                            <th className="p-2 text-right">Views</th>
                            <th className="p-2 text-right">Users</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p) => (
                            <tr key={p.slug} className="border-t">
                                <td className="p-2">{p.slug}</td>
                                <td className="p-2 text-right">{p.views}</td>
                                <td className="p-2 text-right">{p.users}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Top bài viết */}
            <div>
                <h3 className="font-semibold mb-2">Top bài viết (28 ngày)</h3>
                <table className="min-w-full bg-white border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 text-left">Bài viết</th>
                            <th className="p-2 text-right">Views</th>
                            <th className="p-2 text-right">Users</th>
                        </tr>
                    </thead>
                    <tbody>
                        {news.map((n) => (
                            <tr key={n.slug} className="border-t">
                                <td className="p-2">{n.slug}</td>
                                <td className="p-2 text-right">{n.views}</td>
                                <td className="p-2 text-right">{n.users}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
