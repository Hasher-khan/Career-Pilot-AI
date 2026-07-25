import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles, 
  X, 
  CheckCircle,
  ArrowRight,
  User,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignInModal({ isOpen, onClose, onAuthSuccess, forceOpen = false }) {
  const { signUpWithEmail, signInWithEmail, signInWithGoogle, resetPassword, getAuthErrorMessage } = useAuth();

  const [activeTab, setActiveTab]         = useState('login');
  const [displayName, setDisplayName]     = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage]   = useState('');
  const [resetSent, setResetSent]         = useState(false);

  if (!isOpen && !forceOpen) return null;

  const clearMessages = () => { setErrorMessage(''); setSuccessMessage(''); };

  // ── Email / Password Submit ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (activeTab === 'register' && password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (activeTab === 'register' && password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      let user;
      if (activeTab === 'register') {
        const name = displayName.trim() || email.split('@')[0];
        user = await signUpWithEmail(email, password, name);
        setSuccessMessage(`Account created! Welcome, ${user.displayName || name}!`);
      } else {
        user = await signInWithEmail(email, password);
        const friendlyName = user.displayName || user.email.split('@')[0];
        setSuccessMessage(`Welcome back, ${friendlyName}!`);
      }

      setTimeout(() => {
        setSuccessMessage('');
        if (onAuthSuccess) onAuthSuccess(user);
        if (onClose && !forceOpen) onClose();
      }, 800);
    } catch (err) {
      console.warn('Auth Submit Error:', err);
      setErrorMessage(getAuthErrorMessage(err.code, err.message));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Google Sign In ──────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    clearMessages();
    setIsGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      setSuccessMessage(`Welcome, ${user.displayName || 'User'}!`);
      setTimeout(() => {
        setSuccessMessage('');
        if (onAuthSuccess) onAuthSuccess(user);
        if (onClose && !forceOpen) onClose();
      }, 800);
    } catch (err) {
      console.warn('Google Sign In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Google Sign-In cancelled.');
      } else {
        setErrorMessage(getAuthErrorMessage(err.code, err.message));
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ── Forgot Password ─────────────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMessage('Enter your email address first, then click Forgot Password.');
      return;
    }
    clearMessages();
    try {
      await resetPassword(email);
      setResetSent(true);
      setSuccessMessage(`Password reset email sent to ${email}`);
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err.code, err.message));
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      backgroundColor: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      {/* Background Radial Glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '30%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        backgroundColor: 'rgba(37, 99, 235, 0.15)',
        filter: 'blur(100px)',
        pointerEvents: 'none'
      }} />

      {/* Auth Card */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#ffffff',
        color: '#0b1c30',
        borderRadius: '20px',
        padding: 'clamp(20px, 5vw, 36px) clamp(16px, 5vw, 32px)',
        boxShadow: '0 25px 50px -12px rgba(0, 74, 198, 0.25)',
        position: 'relative',
        fontFamily: "'Inter', var(--font-primary)",
        boxSizing: 'border-box'
      }}>
        {/* Close Button — hidden when forced */}
        {!forceOpen && onClose && (
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close"
          >
            <X size={20} />
          </button>
        )}

        {/* Branding Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Sparkles size={24} color="#2563eb" />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb', letterSpacing: '-0.5px', margin: 0 }}>
              CareerPilot AI
            </h2>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Sign in to access your personalized career workspace.
          </p>
        </div>


        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
          {['login', 'register'].map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => { setActiveTab(tab); clearMessages(); setResetSent(false); }}
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '0.95rem',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2.5px solid #2563eb' : '2.5px solid transparent',
                color: activeTab === tab ? '#2563eb' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '11px',
            backgroundColor: isGoogleLoading ? '#f1f5f9' : '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#1e293b',
            cursor: isGoogleLoading ? 'wait' : 'pointer',
            transition: 'background-color 0.15s ease',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            marginBottom: '16px',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Display Name — Register only */}
          {activeTab === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Alex Morgan"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Password</label>
              {activeTab === 'login' && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '42px', paddingRight: '42px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password — Register only */}
          {activeTab === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <ShieldCheck size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div style={bannerStyle('#fef2f2', '#fca5a5', '#dc2626')}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} /> <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div style={bannerStyle('rgba(16,185,129,0.1)', 'rgba(16,185,129,0.3)', '#10b981')}>
              <CheckCircle size={16} style={{ flexShrink: 0 }} /> <span>{successMessage}</span>
            </div>
          )}

          {/* Reset email confirmation */}
          {resetSent && !successMessage && (
            <div style={bannerStyle('rgba(59,130,246,0.1)', 'rgba(59,130,246,0.3)', '#3b82f6')}>
              <CheckCircle size={16} style={{ flexShrink: 0 }} /> <span>Check your inbox for the reset link.</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            style={{
              width: '100%',
              padding: '13px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: isLoading ? 'wait' : 'pointer',
              marginTop: '4px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              transition: 'transform 0.15s ease, opacity 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: isLoading || isGoogleLoading ? 0.7 : 1
            }}
          >
            {isLoading
              ? 'Authenticating...'
              : activeTab === 'login' ? 'Sign In' : 'Create Account'}
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
          By continuing, you agree to our{' '}
          <a href="#" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>Terms of Service</a>
          {' '}and{' '}
          <a href="#" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
}

// ── Shared inline styles ──────────────────────────────────────────────────────
const inputStyle = {
  width: '100%',
  padding: '11px 14px 11px 42px',
  backgroundColor: '#f8fafc',
  border: '1px solid #cbd5e1',
  borderRadius: '12px',
  fontSize: '0.9rem',
  color: '#0b1c30',
  outline: 'none',
  boxSizing: 'border-box'
};

function bannerStyle(bg, border, color) {
  return {
    padding: '10px 14px',
    backgroundColor: bg,
    border: `1px solid ${border}`,
    borderRadius: '10px',
    color,
    fontSize: '0.85rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    lineHeight: 1.4
  };
}
