import React, { useState } from 'react';
import { Activity, AlertCircle, Bell } from 'lucide-react';

const API_URL = 'http://localhost:8080/api';

export default function Login({ onAuthSuccess, showNotificationMessage, showNotification, notification }) {
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/signup';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        onAuthSuccess(data.user);
        setEmail('');
        setPassword('');
        setAuthError('');
        showNotificationMessage(`Welcome ${data.user.email}!`, 'success');
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch (error) {
      setAuthError('Connection error. Please check your internet.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="background-animated"></div>
      
      <div className="login-container">
        <div className="login-card">
          <div className="login-glow"></div>
          <div className="login-header">
            <div className="icon-wrapper">
              <Activity size={56} strokeWidth={2.5} className="login-icon" />
            </div>
            <h1>MARKET<span className="gradient-text">PULSE</span></h1>
            <p className="tagline">Advanced Trading Intelligence</p>
          </div>

          <div className="auth-tabs">
            <button 
              className={authMode === 'login' ? 'active' : ''} 
              onClick={() => { setAuthMode('login'); setAuthError(''); }}
            >
              Sign In
            </button>
            <button 
              className={authMode === 'signup' ? 'active' : ''} 
              onClick={() => { setAuthMode('signup'); setAuthError(''); }}
            >
              Create Account
            </button>
            <div 
              className="tab-indicator" 
              style={{ transform: authMode === 'signup' ? 'translateX(100%)' : 'translateX(0)' }}
            ></div>
          </div>

          {authError && (
            <div className="auth-error">
              <AlertCircle size={18} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="your@email.com" 
                required 
                className={authError && authError.toLowerCase().includes('email') ? 'error' : ''} 
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                required 
                minLength={6} 
                className={authError && authError.toLowerCase().includes('password') ? 'error' : ''} 
              />
              {authMode === 'signup' && <span className="input-hint">Minimum 6 characters</span>}
            </div>

            <button type="submit" className="login-button" disabled={authLoading}>
              {authLoading ? (
                <>
                  <div className="spinner"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>{authMode === 'login' ? "Don't have an account?" : "Already registered?"}</p>
            <button 
              className="switch-mode" 
              onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); }}
            >
              {authMode === 'login' ? 'Create one now' : 'Sign in instead'}
            </button>
          </div>

          <div className="security-badge">
            <div className="badge-icon">🔒</div>
            <div className="badge-text">
              <strong>Secure & Encrypted</strong>
              <span>Your data is protected</span>
            </div>
          </div>
        </div>

        <style>{`
          .login-container {
            position: relative;
            z-index: 1;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }

          .login-card {
            position: relative;
            background: rgba(10, 14, 26, 0.95);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 28px;
            padding: 3.5rem;
            max-width: 480px;
            width: 100%;
            box-shadow: 
              0 20px 60px rgba(0, 0, 0, 0.6),
              0 0 0 1px rgba(16, 185, 129, 0.1) inset;
            backdrop-filter: blur(20px);
          }

          .login-glow {
            position: absolute;
            top: -100px;
            left: 50%;
            transform: translateX(-50%);
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
            pointer-events: none;
            animation: pulse 4s ease-in-out infinite;
          }

          @keyframes pulse {
            0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
            50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
          }

          .icon-wrapper {
            display: inline-flex;
            padding: 1rem;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
            border-radius: 20px;
            margin-bottom: 1.5rem;
            border: 1px solid rgba(16, 185, 129, 0.2);
          }

          .login-icon {
            color: #10b981;
            filter: drop-shadow(0 0 16px rgba(16, 185, 129, 0.6));
            animation: float 3s ease-in-out infinite;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }

          .login-header {
            text-align: center;
            margin-bottom: 2.5rem;
          }

          .login-header h1 {
            font-size: 2.25rem;
            font-weight: 900;
            color: #f1f5f9;
            margin-bottom: 0.75rem;
            letter-spacing: -0.02em;
          }

          .gradient-text {
            background: linear-gradient(135deg, #10b981, #059669, #10b981);
            background-size: 200% 200%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: gradientShift 3s ease infinite;
          }

          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          .tagline {
            color: #94a3b8;
            font-size: 0.95rem;
            font-weight: 500;
          }

          .auth-tabs {
            position: relative;
            display: flex;
            gap: 0.5rem;
            margin-bottom: 2rem;
            background: rgba(30, 41, 59, 0.4);
            padding: 0.4rem;
            border-radius: 14px;
            border: 1px solid rgba(30, 41, 59, 0.6);
          }

          .auth-tabs button {
            flex: 1;
            padding: 0.85rem;
            background: none;
            border: none;
            color: #64748b;
            font-weight: 700;
            font-family: inherit;
            cursor: pointer;
            border-radius: 10px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            z-index: 2;
            font-size: 0.95rem;
          }

          .auth-tabs button.active {
            color: #f1f5f9;
          }

          .tab-indicator {
            position: absolute;
            top: 0.4rem;
            left: 0.4rem;
            width: calc(50% - 0.4rem);
            height: calc(100% - 0.8rem);
            background: linear-gradient(135deg, #10b981, #059669);
            border-radius: 10px;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          }

          .auth-error {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 1.25rem;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            color: #ef4444;
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
            font-weight: 600;
            animation: slideDown 0.3s ease;
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
          }

          .form-group label {
            color: #cbd5e1;
            font-size: 0.9rem;
            font-weight: 600;
          }

          .form-group input {
            padding: 1rem;
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid #1e293b;
            border-radius: 10px;
            color: #f1f5f9;
            font-family: inherit;
            font-size: 1rem;
            transition: all 0.3s ease;
          }

          .form-group input:focus {
            outline: none;
            border-color: #10b981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
          }

          .form-group input::placeholder {
            color: #64748b;
          }

          .form-group input.error {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.05);
          }

          .form-group input.error:focus {
            box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
          }

          .input-hint {
            font-size: 0.8rem;
            color: #64748b;
            font-style: italic;
          }

          .login-button {
            width: 100%;
            padding: 1.15rem;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 800;
            font-size: 1.05rem;
            cursor: pointer;
            font-family: inherit;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            margin-top: 0.5rem;
            letter-spacing: 0.02em;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
          }

          .login-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
          }

          .login-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .spinner {
            width: 18px;
            height: 18px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .login-footer {
            margin-top: 2rem;
            text-align: center;
          }

          .login-footer p {
            color: #94a3b8;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
          }

          .switch-mode {
            background: none;
            border: none;
            color: #10b981;
            font-weight: 700;
            cursor: pointer;
            font-family: inherit;
            font-size: 0.95rem;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            transition: all 0.3s ease;
          }

          .switch-mode:hover {
            background: rgba(16, 185, 129, 0.1);
          }

          .security-badge {
            margin-top: 2.5rem;
            padding: 1.25rem;
            background: rgba(59, 130, 246, 0.05);
            border: 1px solid rgba(59, 130, 246, 0.2);
            border-radius: 12px;
            display: flex;
            gap: 1rem;
            align-items: flex-start;
          }

          .badge-icon {
            font-size: 1.75rem;
          }

          .badge-text {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }

          .badge-text strong {
            color: #3b82f6;
            font-size: 0.9rem;
            font-weight: 700;
          }

          .badge-text span {
            color: #64748b;
            font-size: 0.8rem;
            line-height: 1.4;
          }

          .background-animated {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #0a0e1a;
            z-index: 0;
            overflow: hidden;
          }

          .background-animated::before {
            content: '';
            position: absolute;
            width: 200%;
            height: 200%;
            background-image: 
              linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: gridMove 20s linear infinite;
          }

          @keyframes gridMove {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }
        `}</style>
      </div>

      {showNotification && notification && (
        <div className={`notification ${notification.type} ${showNotification ? 'show' : ''}`}>
          <Bell size={18} />
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
}