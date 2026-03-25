import { useEffect, useRef } from 'react';

/**
 * Handles the redirect back from Google OAuth.
 * Backend redirects to /auth/callback#token=<jwt>&role=<role>
 *
 * Uses window.location.replace instead of React navigate to avoid
 * the React state timing race where PrivateRoute reads stale user state.
 */
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return {};
  }
}

export default function AuthCallback() {
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.hash.substring(1));
    const token  = params.get('token');
    const role   = params.get('role');
    const error  = params.get('error');

    if (error) {
      window.location.replace(`/login?error=${error}`);
      return;
    }

    if (!token) {
      window.location.replace('/login?error=missing_token');
      return;
    }

    // Decode JWT to get email/id for richer user object
    const claims = decodeJwt(token);
    const user = {
      token,
      role: role || claims.role || 'user',
      email: claims.email || '',
      id: claims.id || '',
    };

    // Write to localStorage BEFORE navigating so PrivateRoute always finds the user
    localStorage.setItem('user', JSON.stringify(user));

    // Full page replace — no React state timing issue
    window.location.replace(user.role === 'admin' ? '/admin' : '/');
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      color: '#6b7280',
      fontSize: 15,
    }}>
      Signing you in…
    </div>
  );
}
