import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { setAuth, getToken, isTokenStillValid } from "../../../api/admin/auth";
function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  // Đường cần quay lại sau khi login
    const from = location.state?.from?.pathname || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ thêm

    useEffect(() => {
        const token = getToken();
        if (token && isTokenStillValid(token)) {
            navigate("/admin/dashboard", { replace: true });
        }
    }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // ✅ bật loading
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const ct = res.headers.get("content-type") || "";
      const payload = ct.includes("application/json")
        ? await res.json()
        : await res.text();

      if (!res.ok) {
        const msg = typeof payload === "string" ? payload : payload?.error || payload?.message;
        throw new Error(msg || `Login failed (HTTP ${res.status})`);
      }

      setAuth({ token: payload.access_token, user: payload.user });
      navigate(from, { replace: true }); // ✅ dùng 'from' cho thống nhất
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false); // ✅ tắt loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">


        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-2 rounded ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-600 hover:bg-yellow-700 text-white"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Đang đăng nhập...
              </span>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
