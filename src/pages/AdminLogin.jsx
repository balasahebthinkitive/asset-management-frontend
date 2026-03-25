// src/pages/AdminLogin.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import './AdminLogin.css';

export default function AdminLogin() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Already logged in as admin → go straight to portal
  useEffect(() => {
    if (user?.role === 'admin') navigate('/admin', { replace: true });
  }, [user, navigate]);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(form.email, form.password);
      if (u.role !== 'admin') {
        setError('This account does not have admin access. Contact your IT administrator.');
        setLoading(false);
        return;
      }
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-login-page">

      {/* ── Left panel ── */}
      <div className="adm-login-left">
        <div className="adm-login-left-inner">

          {/* Brand */}
          <div className="adm-login-brand">
            <div className="adm-login-brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span className="adm-login-brand-name">Admin Portal</span>
          </div>

          {/* Hero */}
          <div className="adm-login-hero">
            <h1 className="adm-login-hero-title">
              Full control over<br />users &amp; assets
            </h1>
            <p className="adm-login-hero-sub">
              Manage roles, review audit logs, configure system settings
              and oversee all IT assets across every office.
            </p>
          </div>

          {/* Feature list */}
          <ul className="adm-login-features">
            {[
              'Assign &amp; revoke user roles',
              'Full audit log with filters',
              'System-wide settings &amp; notifications',
              'Location &amp; office management',
            ].map((f, i) => (
              <li key={i}>
                <span className="adm-login-feature-dot" />
                <span dangerouslySetInnerHTML={{ __html: f }} />
              </li>
            ))}
          </ul>

          <p className="adm-login-left-footer">
            © 2026 Thinkitive Technologies Pvt. Ltd.
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="adm-login-right">
        <div className="adm-login-form-wrap">

          {/* Shield badge */}
          <div className="adm-login-shield-badge">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>

          <h2 className="adm-login-title">Admin sign in</h2>
          <p className="adm-login-subtitle">Access restricted to administrators only</p>

          {/* Access notice */}
          <div className="adm-login-notice">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Admin-level credentials required
          </div>

          {/* Error */}
          {error && (
            <div className="adm-login-error">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="adm-login-form">
            <div className="adm-login-field">
              <label>Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@thinkitive.com"
                required
                autoFocus
              />
            </div>

            <div className="adm-login-field">
              <div className="adm-login-field-header">
                <label>Password</label>
                <button
                  type="button"
                  className="adm-login-show-pass"
                  onClick={() => setShowPass(v => !v)}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="adm-login-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="adm-login-spinner" />
                  Signing in…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  Sign in to Admin Portal
                </>
              )}
            </button>
          </form>

          {/* Back link */}
          <div className="adm-login-back">
            <button className="adm-login-back-btn" onClick={() => navigate('/login')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Back to main login
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
