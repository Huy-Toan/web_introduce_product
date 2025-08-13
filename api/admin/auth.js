// src/utils/auth.js

const ACCESS_TOKEN_KEY = 'access_token';
const USER_KEY = 'user';

export function getToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || '';
}

export function setAuth({ token, user }) {
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Decode base64url an toàn
function b64urlDecode(str) {
  try {
    const pad = '='.repeat((4 - (str.length % 4)) % 4);
    const base64 = (str + pad).replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return decodeURIComponent([...json].map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''));
  } catch {
    return '';
  }
}

// Lấy payload từ JWT (không verify signature – chỉ để đọc exp/name/role)
export function getJwtPayload(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const json = b64urlDecode(parts[1]);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isTokenStillValid(token) {
  const payload = getJwtPayload(token);
  if (!payload || !payload.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return Number(payload.exp) > now;
}
