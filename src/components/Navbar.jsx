import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/Thinkitive-logo.svg';

// Static data sources for global search
import laptopsData from '../data/laptopsData';
import mobilesData from '../data/mobilesData';
import mouseData from '../data/mouseData';
import ramData from '../data/ramData';
import keyboardData from '../data/keyboardData';
import monitorsData from '../data/monitorsData';
import hddData from '../data/hddData';
import pendriveData from '../data/pendriveData';
import converterData from '../data/converterData';
import extraEquipData from '../data/extraEquipData';

const SOURCES = [
  { label: 'Laptops',        to: '/laptops',        data: laptopsData,    keys: ['brand','model','serial','assigned'] },
  { label: 'Mobiles',        to: '/mobiles',        data: mobilesData,    keys: ['brand','model','serial','assigned'] },
  { label: 'Mouse',          to: '/mouse',          data: mouseData,      keys: ['brand','model','serial','assigned'] },
  { label: 'RAM',            to: '/ram',            data: ramData,        keys: ['brand','type','serial','assigned'] },
  { label: 'Keyboard',       to: '/keyboard',       data: keyboardData,   keys: ['brand','model','serial','assigned'] },
  { label: 'Monitors',       to: '/monitors',       data: monitorsData,   keys: ['brand','model','serial','assigned'] },
  { label: 'HDD & SSD',      to: '/hdd-storage',    data: hddData,        keys: ['brand','type','serial','assigned'] },
  { label: 'Pendrive',       to: '/pendrive',       data: pendriveData,   keys: ['brand','serial','assigned'] },
  { label: 'Converters',     to: '/converters',     data: converterData,  keys: ['type','brand','serial','assigned'] },
  { label: 'Extra Equip',    to: '/extra-equipment',data: extraEquipData, keys: ['category','brand','model','assigned'] },
];

function globalSearch(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const results = [];
  for (const src of SOURCES) {
    if (!src.data?.length) continue;
    const matches = src.data.filter(item =>
      src.keys.some(k => item[k]?.toLowerCase().includes(q))
    ).slice(0, 3);
    if (matches.length) {
      results.push({ category: src.label, to: src.to, items: matches, keys: src.keys });
    }
    if (results.length >= 5) break;
  }
  return results;
}

function ResultRow({ item, keys }) {
  const primary = keys.slice(0, 2).map(k => item[k]).filter(Boolean).join(' · ');
  const secondary = item.assigned || item.status || '';
  return (
    <div className="gs-result-row">
      <span className="gs-result-primary">{primary || '—'}</span>
      {secondary && <span className="gs-result-secondary">{secondary}</span>}
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  function handleLogout() {
    setDropdownOpen(false);
    logout();
    navigate('/login', { replace: true });
  }

  function handleSearchChange(e) {
    const val = e.target.value;
    setSearchQuery(val);
    setSearchResults(globalSearch(val));
    setSearchOpen(val.length >= 2);
  }

  function handleResultClick(to) {
    setSearchQuery('');
    setSearchResults([]);
    setSearchOpen(false);
    navigate(to);
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchQuery('');
    }
  }

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target))
        setSearchOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.name || user?.email || 'User';
  const email = user?.email || '';
  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="Thinkitive Technologies" className="navbar-logo" />
      </div>

      {/* Global Search */}
      {user && (
        <div className="navbar-center" ref={searchRef}>
          <div className="gs-wrap">
            <span className="gs-icon">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              className="gs-input"
              placeholder="Search assets, serials, people…"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => searchQuery.length >= 2 && setSearchOpen(true)}
              autoComplete="off"
            />
            {searchQuery && (
              <button className="gs-clear" onClick={() => { setSearchQuery(''); setSearchResults([]); setSearchOpen(false); }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}

            {searchOpen && (
              <div className="gs-dropdown">
                {searchResults.length === 0 ? (
                  <div className="gs-no-results">No results for "{searchQuery}"</div>
                ) : (
                  searchResults.map(group => (
                    <div key={group.category} className="gs-group">
                      <div className="gs-group-label">{group.category}</div>
                      {group.items.map(item => (
                        <button key={item.id} className="gs-result-btn" onClick={() => handleResultClick(group.to)}>
                          <ResultRow item={item} keys={group.keys} />
                        </button>
                      ))}
                    </div>
                  ))
                )}
                <div className="gs-footer">
                  Press <kbd>Esc</kbd> to close
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {user && (
        <div className="navbar-right">
          {/* Light / Dark toggle */}
          <button className="navbar-theme-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}>
            {theme === 'dark' ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* Notification Bell */}
          <div className="navbar-notif-wrap">
            <button className="navbar-notif-btn" title="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="navbar-notif-badge">3</span>
            </button>
          </div>

          <div className="navbar-profile-wrap" ref={dropdownRef}>
            <button
              className="navbar-profile-trigger"
              onClick={() => setDropdownOpen(o => !o)}
              aria-expanded={dropdownOpen}
            >
              <div className="navbar-avatar">{initials}</div>
              <span className="navbar-username">{displayName}</span>
              <svg className={`navbar-chevron${dropdownOpen ? ' open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {dropdownOpen && (
              <div className="navbar-dropdown">
                <div className="nd-user-header">
                  <div className="nd-avatar-lg">{initials}</div>
                  <div className="nd-user-info">
                    <div className="nd-user-name">{displayName}</div>
                    {email && (
                      <div className="nd-user-email">
                        <span className="nd-email-label">Email: </span>{email}
                      </div>
                    )}
                  </div>
                </div>

                <div className="nd-divider" />

                <button className="nd-item" disabled>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  My Profile
                </button>

                <button className="nd-item" disabled>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                  My Transaction History
                </button>

                <button className="nd-item" disabled>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="15" r="1"/><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                  </svg>
                  Change Password
                </button>

                <div className="nd-divider" />

                <button className="nd-item nd-item-logout" onClick={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
