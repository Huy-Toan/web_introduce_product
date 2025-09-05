import React, { useEffect, useMemo, useState } from "react";
import { Library, Shapes, Newspaper, Activity, RotateCcw } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
  Title,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

// Đăng ký các thành phần Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
  Title
);

// Helpers
function formatDuration(seconds) {
  const s = Math.floor(Number(seconds || 0));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
function fmtDateYYYYMMDD(s) {
  // GA4 trả "YYYYMMDD" -> "YYYY-MM-DD"
  if (!s) return "";
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

export default function DashboardOverview({ products, parents, news }) {
  const [days, setDays] = useState(28);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // KPI
  const [kpi, setKpi] = useState(null);
  // Trend (theo ngày)
  const [trendRows, setTrendRows] = useState([]);
  // Top
  const [topProducts, setTopProducts] = useState([]);
  const [topNews, setTopNews] = useState([]);

  const metricLabels = useMemo(
    () => ({
      activeUsers: "Người dùng",
      newUsers: "Người dùng mới",
      screenPageViews: "Lượt xem",
      averageSessionDuration: "Thời lượng TB",
    }),
    []
  );

  async function loadData() {
    try {
      setError("");
      setLoading(true);

      // KPI tổng
      const kpiRes = await fetch("/api/ga4/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          query: {
            dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
            metrics: [
              { name: "activeUsers" },
              { name: "newUsers" },
              { name: "screenPageViews" },
              { name: "averageSessionDuration" },
            ],
          },
        }),
      });
      const kpiData = await kpiRes.json();
      if (!kpiRes.ok) throw new Error(kpiData?.error || "KPI request failed");
      setKpi(kpiData);

      // Trend theo ngày
      const trendRes = await fetch("/api/ga4/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          query: {
            dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
            dimensions: [{ name: "date" }],
            metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
            orderBys: [{ dimension: { dimensionName: "date" } }],
          },
        }),
      });
      const trendData = await trendRes.json();
      if (!trendRes.ok)
        throw new Error(trendData?.error || "Trend request failed");
      setTrendRows(trendData.rows || []);

      // Top sản phẩm / bài viết
      const [prodRes, newsRes] = await Promise.all([
        fetch(`/api/ga4/products-views?days=${days}&limit=5`),
        fetch(`/api/ga4/news-views?days=${days}&limit=5`),
      ]);
      const [prodData, newsData] = await Promise.all([
        prodRes.json(),
        newsRes.json(),
      ]);
      if (!prodRes.ok) throw new Error(prodData?.error || "Products failed");
      if (!newsRes.ok) throw new Error(newsData?.error || "News failed");
      setTopProducts(prodData.items || []);
      setTopNews(newsData.items || []);
    } catch (e) {
      console.error(e);
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  // ---------- Chart data ----------
  // Line: Views & Users theo ngày
  const lineData = useMemo(() => {
    const labels = (trendRows || []).map((r) => fmtDateYYYYMMDD(r.dimensionValues?.[0]?.value));
    const views = (trendRows || []).map((r) =>
      Number(r.metricValues?.[0]?.value || 0)
    );
    const users = (trendRows || []).map((r) =>
      Number(r.metricValues?.[1]?.value || 0)
    );
    return {
      labels,
      datasets: [
        {
          label: "Views",
          data: views,
          tension: 0.35,
          fill: true,
          backgroundColor: "rgba(99, 102, 241, 0.12)",  // indigo-500/12
          borderColor: "rgba(99, 102, 241, 1)",          // indigo-500
          pointRadius: 2,
        },
        {
          label: "Users",
          data: users,
          tension: 0.35,
          fill: false,
          borderColor: "rgba(16, 185, 129, 1)",         // emerald-500
          pointRadius: 2,
        },
      ],
    };
  }, [trendRows]);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "top" },
      title: { display: false },
      tooltip: { callbacks: { labelColor: () => ({ borderColor: "transparent" }) } },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  // Bar ngang: Top Sản phẩm
  const productsBarData = useMemo(() => {
    const labels = topProducts.map((x) => x.name);
    const data = topProducts.map((x) => x.views);
    return {
      labels,
      datasets: [
        {
          label: "Views",
          data,
          backgroundColor: "rgba(59, 130, 246, 0.65)", // blue-500
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  }, [topProducts]);

  const newsBarData = useMemo(() => {
    const labels = topNews.map((x) => x.name);
    const data = topNews.map((x) => x.views);
    return {
      labels,
      datasets: [
        {
          label: "Views",
          data,
          backgroundColor: "rgba(245, 158, 11, 0.75)", // amber-500
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  }, [topNews]);

  const barOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { callbacks: { label: (ctx) => `Views: ${ctx.parsed.x}` } },
    },
    scales: {
      x: { beginAtZero: true, ticks: { precision: 0 } },
      y: { ticks: { callback: (v) => (typeof v === "string" ? v.slice(0, 22) : v) } },
    },
  };

  // --------------------------------
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tổng quan</h2>

        <div className="flex items-center gap-2">
          <select
            className="border rounded px-3 py-2 bg-white text-sm"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>7 ngày</option>
            <option value={28}>28 ngày</option>
            <option value={90}>90 ngày</option>
          </select>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm"
            title="Làm mới"
          >
            <RotateCcw size={16} /> Làm mới
          </button>
        </div>
      </div>

      {/* 4 card hệ thống */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <Library className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Tổng số sản phẩm
              </h3>
              <p className="text-2xl font-bold text-blue-600">{products}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <Shapes className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Tổng số danh mục lớn
              </h3>
              <p className="text-2xl font-bold text-green-600">{parents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg mr-4">
              <Newspaper className="text-yellow-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Tin tức</h3>
              <p className="text-2xl font-bold text-yellow-600">{news}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <Activity className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Trạng thái</h3>
              <p className="text-2xl font-bold text-purple-600">Hoạt động</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI GA4 */}
      <h3 className="text-xl font-bold mb-4">Thống kê truy cập (GA4)</h3>
      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
          Lỗi tải dữ liệu: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {kpi?.rows?.[0]?.metricValues?.map((m, i) => {
          const name = kpi.metricHeaders[i].name;
          const value =
            name === "averageSessionDuration" ? formatDuration(m.value) : m.value;
          return (
            <div key={name} className="bg-white p-6 rounded-lg shadow border">
              <div className="text-gray-700 font-medium">
                {metricLabels[name] || name}
              </div>
              <div className="text-2xl font-bold text-indigo-600 mt-2">{value}</div>
              <div className="text-xs text-gray-400 mt-1">Trong {days} ngày</div>
            </div>
          );
        })}
      </div>

      {/* Line chart: Views & Users theo ngày */}
      <div className="bg-white rounded-lg shadow border p-4 mb-8">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">Views & Users theo ngày</h4>
        </div>
        <div style={{ height: 320 }}>
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      {/* 2 bar chart: Top sản phẩm / Top bài viết */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow border p-4">
          <h4 className="font-semibold mb-2">Top sản phẩm (theo Views)</h4>
          <div style={{ height: 280 }}>
            <Bar data={productsBarData} options={barOptions} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-4">
          <h4 className="font-semibold mb-2">Top bài viết (theo Views)</h4>
          <div style={{ height: 280 }}>
            <Bar data={newsBarData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
