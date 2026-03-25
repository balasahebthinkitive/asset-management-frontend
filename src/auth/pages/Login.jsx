import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Check for Google OAuth error in URL
  const urlError = new URLSearchParams(window.location.search).get('error');

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/assets');
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    const api = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    window.location.href = `${api}/auth/google`;
  };

  return (
    <div className="login-page">

      {/* ── Left Panel ─────────────────────────────────── */}
      <div className="login-left">

        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            </svg>
          </div>
          <span className="login-brand-name">Asset Tracker</span>
        </div>

        {/* Hero text */}
        <div className="login-hero">
          <h1 className="login-hero-title">
            Manage all company assets<br />in one place
          </h1>
          <p className="login-hero-sub">
            Track laptops, mobiles, RAM, keyboards and mice
            across ABIL · Teerth · Ambrosia offices.
          </p>

          {/* Stats grid */}
          <div className="login-stats">
            {[
              { val: '622',  lbl: 'Total assets'     },
              { val: '457',  lbl: 'Laptops tracked'  },
              { val: '88%',  lbl: 'Utilisation rate' },
              { val: '3',    lbl: 'Office locations' },
            ].map((s) => (
              <div key={s.lbl} className="login-stat-box">
                <div className="login-stat-val">{s.val}</div>
                <div className="login-stat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="login-left-footer">
          © 2026 Thinkitive Technologies Pvt. Ltd.
        </div>
      </div>

      {/* ── Right Panel ────────────────────────────────── */}
      <div className="login-right">
        <div className="login-form-wrap">

          <h2 className="login-title">Welcome back</h2>
          <p className="login-subtitle">Sign in to your account to continue</p>

          {/* Domain badge */}
          <div className="login-domain-badge">
            <span className="login-domain-dot" />
            @thinkitive.com accounts only
          </div>

          {/* Error message */}
          {(error || urlError) && (
            <div className="login-error">
              {error ||
                (urlError === 'unauthorized'
                  ? 'Only @thinkitive.com accounts are allowed.'
                  : 'Sign in failed. Please try again.')}
            </div>
          )}

          {/* Google button */}
          <button className="login-google-btn" onClick={handleGoogle}>
            <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google Workspace
          </button>

          {/* Divider */}
          <div className="login-divider">
            <div className="login-divider-line" />
            <span className="login-divider-text">or sign in with email</span>
            <div className="login-divider-line" />
          </div>

          {/* Email / Password form */}
          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label>Email address</label>
              <input
                type="email" name="email"
                value={form.email} onChange={handleChange}
                placeholder="you@thinkitive.com"
                required autoFocus
              />
            </div>

            <div className="login-field">
              <div className="login-field-header">
                <label>Password</label>
                <button
                  type="button"
                  className="login-show-pass"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password} onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="login-footer-note">
            By signing in you agree to Thinkitive's IT asset usage policy.
          </p>

          <div className="login-admin-link">
            <a href="/admin-login">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Admin Portal sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
