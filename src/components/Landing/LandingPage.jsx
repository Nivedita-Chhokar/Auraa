import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Target, CheckCircle, Flame, Sparkles, User, Lock, ArrowRight, Mail } from 'lucide-react';

export const LandingPage = () => {
  const { login, signup } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(username, password);
      } else {
        result = await signup(email, username, password);
      }

      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError(err?.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setUsername('');
    setPassword('');
    setError('');
  };

  return (
    <div className="landing-layout">
      {/* Left side: Premium Landing Context */}
      <div className="landing-hero">
        <div className="hero-content">
          <div className="brand-logo">
            <Sparkles size={24} className="brand-icon-sparkle" />
            <span className="brand-name">AURA</span>
          </div>
          
          <h1 className="hero-title">
            Compound your daily efforts.
          </h1>
          <p className="hero-subtitle">
            A minimalist tracker designed to align your daily tasks and recurring habits with your long-term life goals.
          </p>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Target size={18} />
              </div>
              <div>
                <h4>Goal Alignment</h4>
                <p>Map your habits and checklist items to grand objectives.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Flame size={18} />
              </div>
              <div>
                <h4>Habit Consistency</h4>
                <p>Track streaks, log histories, and view progress charts.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <CheckCircle size={18} />
              </div>
              <div>
                <h4>Intention Checklist</h4>
                <p>Start each day with clear focus. Keep productivity simple.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="hero-footer">
          <span>Auraa © 2026. Aesthetic & Minimalist.</span>
        </div>
      </div>

      {/* Right side: Authentication Card Panel */}
      <div className="landing-auth">
        <div className="auth-form-container">
          <div className="auth-header">
            <h2>{isLogin ? 'Welcome back' : 'Create account'}</h2>
            <p>{isLogin ? 'Enter your credentials to access your spaces.' : 'Start tracking your habits and goals today.'}</p>
          </div>

          {error && (
            <div className="auth-error">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input
                    id="email"
                    type="email"
                    placeholder="e.g., alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="username">
                {isLogin ? 'Username or Email' : 'Username'}
              </label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  id="username"
                  type="text"
                  placeholder={isLogin ? 'e.g., alex or alex@example.com' : 'e.g., alex'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="btn-btn btn-primary auth-submit" disabled={loading}>
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <span>{isLogin ? 'Access Aura' : 'Register Account'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="auth-toggle">
            <span>
              {isLogin ? "Don't have an account?" : 'Already using Aura?'}
            </span>
            <button onClick={toggleAuthMode} disabled={loading} className="auth-toggle-link">
              {isLogin ? 'Sign up for free' : 'Log in here'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .landing-layout {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background-color: var(--bg-primary);
        }
        
        .landing-hero {
          flex: 1.2;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 64px;
          background-color: #0c0e12;
          border-right: 1px solid var(--border-color);
          position: relative;
          overflow: hidden;
        }

        .landing-hero::before {
          content: "";
          position: absolute;
          top: -20%;
          left: -20%;
          width: 60%;
          height: 60%;
          background: radial-gradient(circle, rgba(142, 148, 242, 0.04) 0%, transparent 70%);
          pointer-events: none;
        }
        
        .hero-content {
          max-width: 520px;
          margin-top: 40px;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 60px;
        }

        .brand-icon-sparkle {
          color: var(--accent-primary);
        }

        .brand-name {
          font-size: 1.2rem;
          font-weight: 700;
          letter-spacing: 0.25em;
          color: #ffffff;
        }

        .hero-title {
          font-size: 2.8rem;
          font-weight: 700;
          line-height: 1.15;
          margin-bottom: 20px;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #ffffff 0%, #a2a7f5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 1.05rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 48px;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .feature-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .feature-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: var(--border-radius-sm);
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--accent-primary);
          flex-shrink: 0;
        }

        .feature-item h4 {
          font-size: 0.95rem;
          margin-bottom: 4px;
          color: var(--text-primary);
        }

        .feature-item p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .hero-footer {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Right panel auth styling */
        .landing-auth {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background-color: var(--bg-primary);
        }

        .auth-form-container {
          width: 100%;
          max-width: 360px;
          display: flex;
          flex-direction: column;
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .auth-header {
          margin-bottom: 32px;
        }

        .auth-header h2 {
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .auth-header p {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .auth-error {
          background-color: rgba(224, 122, 95, 0.1);
          border: 1px solid rgba(224, 122, 95, 0.2);
          color: var(--accent-danger);
          padding: 12px 16px;
          border-radius: var(--border-radius-sm);
          font-size: 0.85rem;
          margin-bottom: 24px;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .input-with-icon input {
          padding-left: 42px;
        }

        .auth-submit {
          margin-top: 10px;
          padding: 12px;
          font-size: 0.95rem;
          cursor: pointer;
        }

        .auth-toggle {
          margin-top: 24px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .auth-toggle-link {
          color: var(--accent-primary);
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-size: 0.85rem;
        }

        .auth-toggle-link:hover {
          color: var(--accent-primary-hover);
          text-decoration: underline;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #ffffff;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 900px) {
          .landing-layout {
            flex-direction: column;
          }
          
          .landing-hero {
            padding: 40px 24px;
            border-right: none;
            border-bottom: 1px solid var(--border-color);
          }

          .brand-logo {
            margin-bottom: 30px;
          }

          .hero-title {
            font-size: 2.2rem;
          }

          .hero-subtitle {
            margin-bottom: 30px;
          }

          .landing-auth {
            padding: 60px 24px;
          }
        }
      `}</style>
    </div>
  );
};
