// src/components/RequireAuth.jsx
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken, isTokenStillValid, clearAuth } from '../../../../api/admin/auth';

// Gọi backend để xác thực token có bị revoke hay không
async function verifyOnServer(token) {
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => ({}));
    return !!data?.authenticated;
  } catch {
    return false;
  }
}

export default function RequireAuth({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState('checking'); // 'checking' | 'ok' | 'fail'

  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token || !isTokenStillValid(token)) {
        clearAuth();
        setStatus('fail');
        return;
      }
      // Token còn hạn → xác minh với server (phòng trường hợp jti đã bị revoke)
      const ok = await verifyOnServer(token);
      setStatus(ok ? 'ok' : 'fail');
      if (!ok) clearAuth();
    })();
  }, [location.pathname]);

  if (status === 'checking') {
    return (
      <div className="w-full min-h-[40vh] flex items-center justify-center text-gray-600">
        Đang kiểm tra phiên đăng nhập…
      </div>
    );
  }

  if (status === 'fail') {
    // Ghi nhớ nơi user đang vào để login xong quay lại
      return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
}
