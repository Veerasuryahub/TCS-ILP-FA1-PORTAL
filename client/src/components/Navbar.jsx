import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal } from 'lucide-react';

export const Navbar = () => {
  const { user } = useAuth();

  return (
    <header
      className="navbar"
      style={{
        backgroundColor: '#002f6c',
        color: '#ffffff',
        height: '70px',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '4px',
        borderBottom: '4px solid #f59e0b', // Indian Gov style orange accent stripe
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}
    >
      {/* Brand logo & tagline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            height: '40px',
            width: '40px',
            borderRadius: '4px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Terminal size={22} color="#002f6c" />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              margin: 0,
              color: '#ffffff'
            }}
          >
            TCS ILP FA1 PREPARATION PORTAL
          </h1>
          <p
            style={{
              fontSize: '11px',
              color: '#f8f9fa',
              margin: 0
            }}
          >
            Official Assessment Practice Environment
          </p>
        </div>
      </div>

      {/* Right side stats/actions */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user.role === 'admin' ? (
            <span
              style={{
                fontSize: '12px',
                fontWeight: 'bold',
                background: '#dc3545',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '4px'
              }}
            >
              MENTOR / FACULTY
            </span>
          ) : (
            <span
              style={{
                fontSize: '12px',
                fontWeight: 'bold',
                background: '#198754',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '4px'
              }}
            >
              TRAINEE MODE
            </span>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
