import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('app-theme') || 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // Inject .env colour overrides once
  useEffect(() => {
    const root = document.documentElement;
    const map = {
      '--clr-primary':    process.env.REACT_APP_PRIMARY_COLOR,
      '--clr-accent':     process.env.REACT_APP_ACCENT_COLOR,
      '--clr-teal':       process.env.REACT_APP_TEAL_COLOR,
      '--clr-sidebar-bg': process.env.REACT_APP_SIDEBAR_COLOR,
    };
    Object.entries(map).forEach(([prop, val]) => {
      if (val) root.style.setProperty(prop, val);
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light') }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
