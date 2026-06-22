import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Setup Axios defaults when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Load user profile on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.data.success) {
          setUser(res.data);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Session validation failed', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Register Trainee
  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/register`, userData);
      if (res.data.success) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data);
        showToast('Account registered successfully! Welcome to FA1 MASTER.');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      showToast(msg, 'error');
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Login User (Trainee or Mentor)
  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.success) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        // Set basic info first, useEffect will fetch complete profile with streaks
        setUser({
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role
        });
        showToast(`Logged in successfully! Welcome back, ${res.data.name}.`);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      showToast(msg, 'error');
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Logout Session
  const logout = () => {
    setToken('');
    setUser(null);
    showToast('Logged out successfully.');
  };

  // Refresh profile details (to get updated streak/badges)
  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/auth/profile`);
      if (res.data.success) {
        setUser(res.data);
      }
    } catch (err) {
      console.error('Error refreshing profile', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        toasts,
        register,
        login,
        logout,
        showToast,
        removeToast,
        refreshProfile,
        apiUrl: API_URL
      }}
    >
      {children}
      
      {/* Dynamic Glassmorphic Toast Notifications Container */}
      <div
        className="toasts-container no-print"
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          pointerEvents: 'none'
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${
                toast.type === 'error'
                  ? 'rgba(239, 68, 68, 0.4)'
                  : toast.type === 'warning'
                  ? 'rgba(245, 158, 11, 0.4)'
                  : 'rgba(56, 189, 248, 0.4)'
              }`,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              minWidth: '280px',
              maxWidth: '400px',
              cursor: 'pointer',
              pointerEvents: 'auto',
              animation: 'fadeIn 0.3s ease-out forwards',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor:
                    toast.type === 'error'
                      ? '#ef4444'
                      : toast.type === 'warning'
                      ? '#f59e0b'
                      : '#38bdf8',
                  boxShadow: `0 0 8px ${
                    toast.type === 'error'
                      ? '#ef4444'
                      : toast.type === 'warning'
                      ? '#f59e0b'
                      : '#38bdf8'
                  }`,
                }}
              />
              <span>{toast.message}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '16px',
                lineHeight: 1
              }}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
