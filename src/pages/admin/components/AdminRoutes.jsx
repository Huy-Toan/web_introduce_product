import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken, isTokenStillValid, clearAuth } from '../../../../api/admin/auth';

async function verifyOnServer(token) {
    try {
        const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return null;
        const data = await res.json().catch(() => ({}));
        return data.user;
    } catch {
        return null;
    }
}

export default function AdminRoute({ children, roles = ['superadmin', 'admin', 'content_manager', 'user_manager', 'moderator', 'editor', 'finance', 'auditor'] }) {
    const location = useLocation();
    const [status, setStatus] = useState('checking');

    useEffect(() => {
        (async () => {
            const token = getToken();
            if (!token || !isTokenStillValid(token)) {
                clearAuth();
                setStatus('fail');
                return;
            }
            const user = await verifyOnServer(token);
            if (!user || (roles.length && !roles.includes(user.role))) {
                clearAuth();
                setStatus('fail');
                return;
            }
            setStatus('ok');
        })();
    }, [location.pathname, roles]);

    if (status === 'checking') {
        return (
            <div className="w-full min-h-[40vh] flex items-center justify-center text-gray-600">
                Đang kiểm tra phiên đăng nhập…
            </div>
        );
    }

    if (status === 'fail') {
        return <Navigate to="/admin/login" replace state={{ from: location }} />;
    }

    return children;
}

AdminRoute.propTypes = {
    children: PropTypes.node,
    roles: PropTypes.arrayOf(PropTypes.string),
};