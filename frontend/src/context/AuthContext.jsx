import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('voice_iq_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem('voice_iq_user');
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('voice_iq_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const { access_token, user: userData } = res.data;
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('voice_iq_token', access_token);
      localStorage.setItem('voice_iq_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      throw new Error(err?.response?.data?.detail || 'Unable to sign in with the live backend.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/register`, { name, email, password });
      const { access_token, user: userData } = res.data;
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('voice_iq_token', access_token);
      localStorage.setItem('voice_iq_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      throw new Error(err?.response?.data?.detail || 'Unable to create your live account right now.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('voice_iq_token');
    localStorage.removeItem('voice_iq_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
