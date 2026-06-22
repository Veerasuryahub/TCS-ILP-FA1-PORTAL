import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Terminal, KeyRound, Mail } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 40px)',
        padding: '20px',
        backgroundColor: '#f0f2f5'
      }}
    >
      <div
        className="glass"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '30px',
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          border: '1px solid #ced4da',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}
      >
        {/* Gov Portal Banner style Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '2px solid #002f6c', paddingBottom: '16px', marginBottom: '24px' }}>
          <div
            style={{
              height: '40px',
              width: '40px',
              backgroundColor: '#002f6c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px'
            }}
          >
            <Terminal size={22} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#002f6c', margin: 0 }}>
              TCS ILP FA1 PORTAL
            </h2>
            <p style={{ color: '#6c757d', fontSize: '12px', margin: 0 }}>
              Official assessment prep platform
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Email Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#212529' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                color="#6c757d"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="email"
                placeholder="student@fa1master.com or your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#212529' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound
                size={16}
                color="#6c757d"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              marginTop: '8px',
              padding: '12px',
              fontSize: '15px',
              borderRadius: '4px'
            }}
          >
            {isSubmitting ? 'Verifying Credentials...' : 'Sign In'}
          </button>
        </form>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13.5px', color: '#6c757d', borderTop: '1px solid #dee2e6', paddingTop: '15px' }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{
              color: '#002f6c',
              textDecoration: 'underline',
              fontWeight: 'bold'
            }}
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
