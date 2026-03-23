import { createContext, useCallback, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  async function login(email, password) {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    if (apiUrl) {
      const { data } = await axios.post(`${apiUrl}/auth/login`, { email, password });
      const merged = { ...data.user, token: data.token };
      setUser(merged);
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    }
    // Fallback for local dev without a backend
    if (email === 'admin@thinkitive.com' && password === 'admin123') {
      const mockUser = { email, role: 'admin', name: 'Admin' };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      return mockUser;
    }
    const err = new Error('Invalid credentials');
    err.response = { data: { msg: 'Invalid email or password.' } };
    throw err;
  }

  const setUserFromToken = useCallback((token, role) => {
    const decoded = { token, role };
    setUser(decoded);
    localStorage.setItem('user', JSON.stringify(decoded));
  }, []);

  function logout() {
    setUser(null);
    localStorage.removeItem('user');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, setUserFromToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
