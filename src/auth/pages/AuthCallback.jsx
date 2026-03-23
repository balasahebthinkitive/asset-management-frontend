import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Handles the redirect back from Google OAuth.
 * The backend redirects to /auth/callback#token=<jwt>&role=<role>
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUserFromToken } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.hash.substring(1));
    const token  = params.get('token');
    const role   = params.get('role');
    const error  = params.get('error');

    if (error) {
      navigate(`/login?error=${error}`, { replace: true });
      return;
    }

    if (token) {
      setUserFromToken(token, role);
      navigate(role === 'admin' ? '/' : '/assets', { replace: true });
    } else {
      navigate('/login?error=missing_token', { replace: true });
    }
  }, [navigate, setUserFromToken]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      color: '#6b7280',
    }}>
      Signing you in…
    </div>
  );
}
