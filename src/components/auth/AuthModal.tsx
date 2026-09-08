import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { DOXOLogo } from '../common/DOXOLogo';
import { IconX, IconCheck, IconEye, IconEyeOff } from '../common/Icons';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    login,
    register,
    loginWithGoogle,
  } = useAuth();
  const { language } = useLanguage();

  // Sign In Form State
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Google Prompt State
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleName, setGoogleName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const res = await login({
      emailOrPhone: signInIdentifier,
      password: signInPassword,
    });

    setIsLoading(false);
    if (res.success) {
      setSuccessMessage(language === 'ka' ? 'წარმატებით შეხვედით!' : 'Successfully signed in!');
      setTimeout(() => setSuccessMessage(null), 2000);
    } else if (res.error) {
      setErrorMessage(res.error);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const res = await register({
      fullName: signUpName,
      email: signUpEmail,
      phone: signUpPhone,
      password: signUpPassword,
    });

    setIsLoading(false);
    if (res.success) {
      setSuccessMessage(
        language === 'ka'
          ? 'რეგისტრაცია წარმატებით დასრულდა! თქვენი ანგარიში შექმნილია და ელოდება ადმინისტრატორის ვერიფიკაციას.'
          : 'Registration successful! Your account is created and awaiting admin verification.'
      );
      setTimeout(() => setSuccessMessage(null), 3500);
    } else if (res.error) {
      setErrorMessage(res.error);
    }
  };

  const handleGoogleClick = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    const res = await loginWithGoogle();
    setIsLoading(false);
    if (!res.success) {
      if (res.error === 'DIRECT_PROMPT_REQUIRED') {
        setShowGooglePrompt(true);
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    }
  };

  const handleGooglePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim()) {
      setErrorMessage(language === 'ka' ? 'გთხოვთ მიუთითოთ Google ელ.ფოსტა.' : 'Please enter your Google email.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    const res = await loginWithGoogle({
      fullName: googleName.trim() || 'Google მომხმარებელი',
      email: googleEmail.trim(),
    });
    setIsLoading(false);
    if (res.success) {
      setShowGooglePrompt(false);
      setSuccessMessage(language === 'ka' ? 'წარმატებით გაიარეთ ავტორიზაცია Google ანგარიშით!' : 'Signed in with Google!');
      setTimeout(() => setSuccessMessage(null), 2500);
    } else if (res.error) {
      setErrorMessage(res.error);
    }
  };

  return (
    <div
      className="auth-modal-overlay animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(8, 9, 14, 0.85)',
        backdropFilter: 'blur(12px)',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div
        className="auth-modal-card animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-modal)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-modal)',
          padding: '28px 24px',
          position: 'relative',
          color: 'var(--text-primary)',
          overflow: 'hidden',
        }}
      >

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            color: '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          aria-label="Close"
        >
          <IconX size={16} />
        </button>

        {/* Header with DOXO Neon Logo matching the user's photo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', marginBottom: '10px' }}>
            <DOXOLogo size="md" showWordmark={true} showSubtitle={true} />
          </div>
          <p style={{ fontSize: '13.5px', color: '#94A3B8', marginTop: '6px' }}>
            {authModalMode === 'signin'
              ? language === 'ka'
                ? 'შედი შენს პირად სივრცეში'
                : 'Sign in to your personal workspace'
              : language === 'ka'
              ? 'შექმენი ანგარიში და მიანდე ყოველდღიური საქმეები DOXO-ს'
              : 'Create an account and let DOXO handle life'}
          </p>
        </div>

        {/* If Google Prompt Active */}
        {showGooglePrompt ? (
          <form onSubmit={handleGooglePromptSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                backgroundColor: 'rgba(66, 133, 244, 0.08)',
                border: '1px solid rgba(66, 133, 244, 0.25)',
                borderRadius: '14px',
                padding: '16px',
                textAlign: 'center',
                marginBottom: '4px',
              }}
            >
              <div style={{ display: 'inline-flex', marginBottom: '8px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: '#FFFFFF' }}>
                {language === 'ka' ? 'Google ანგარიშით დაკავშირება' : 'Connect with Google'}
              </h4>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
                {language === 'ka'
                  ? 'შეიყვანეთ თქვენი რეალური Google (Gmail) ელ.ფოსტა და სახელი:'
                  : 'Enter your genuine Google (Gmail) address and full name:'}
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px' }}>
                {language === 'ka' ? 'თქვენი სახელი და გვარი' : 'Full Name'}
              </label>
              <input
                type="text"
                required
                placeholder={language === 'ka' ? 'მაგ: ნუკრი ჩაჩავა' : 'John Doe'}
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px' }}>
                {language === 'ka' ? 'Google ელ.ფოსტა (Gmail)' : 'Google Email (Gmail)'}
              </label>
              <input
                type="email"
                required
                placeholder="user@gmail.com"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '6px',
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-btn)',
                background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '14px',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? (language === 'ka' ? 'მიმდინარეობს...' : 'Connecting...') : (language === 'ka' ? '✓ Google ანგარიშით გაგრძელება' : 'Continue with Google')}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowGooglePrompt(false);
                setErrorMessage(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'center',
                padding: '6px',
              }}
            >
              ← {language === 'ka' ? 'უკან დაბრუნება (სტანდარტული ფორმა)' : 'Back to standard sign in'}
            </button>
          </form>
        ) : (
          <>
            {/* Segmented Tab Switcher */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: '4px',
                borderRadius: '14px',
                marginBottom: '22px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  openAuthModal('signin');
                }}
                style={{
                  padding: '9px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  backgroundColor: authModalMode === 'signin' ? 'var(--accent-primary)' : 'transparent',
                  color: authModalMode === 'signin' ? '#FFFFFF' : 'var(--text-secondary)',
                  boxShadow: authModalMode === 'signin' ? 'var(--shadow-xs)' : 'none',
                  transition: 'all var(--duration-fast) var(--ease-doxo)',
                }}
              >
                {language === 'ka' ? 'შესვლა' : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  openAuthModal('signup');
                }}
                style={{
                  padding: '9px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  backgroundColor: authModalMode === 'signup' ? 'var(--accent-primary)' : 'transparent',
                  color: authModalMode === 'signup' ? '#FFFFFF' : 'var(--text-secondary)',
                  boxShadow: authModalMode === 'signup' ? 'var(--shadow-xs)' : 'none',
                  transition: 'all var(--duration-fast) var(--ease-doxo)',
                }}
              >
                {language === 'ka' ? 'რეგისტრაცია' : 'Sign Up'}
              </button>
            </div>

        {/* Error / Success Alerts */}
        {errorMessage && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '16px',
            }}
          >
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#4ADE80',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <IconCheck size={14} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ===================================================================
            TAB 1: SIGN IN (შესვლა)
            =================================================================== */}
        {authModalMode === 'signin' ? (
          <form onSubmit={handleSignInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#94A3B8', marginBottom: '6px' }}>
                {language === 'ka' ? 'ელ.ფოსტა ან მობილური' : 'Email or Phone'}
              </label>
              <input
                type="text"
                required
                placeholder={language === 'ka' ? 'მაგ: user@doxo.ge ან 599...' : 'name@example.com'}
                value={signInIdentifier}
                onChange={(e) => setSignInIdentifier(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#94A3B8' }}>
                  {language === 'ka' ? 'პაროლი' : 'Password'}
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(language === 'ka' ? 'აღდგენის ინსტრუქცია გაიგზავნა მითითებულ მისამართზე' : 'Password reset link sent');
                  }}
                  style={{ fontSize: '12px', color: '#A855F7', textDecoration: 'none' }}
                >
                  {language === 'ka' ? 'დაგავიწყდა?' : 'Forgot?'}
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showSignInPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 40px 11px 14px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  {showSignInPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '2px 0' }}>
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#6366F1', cursor: 'pointer' }}
              />
              <label htmlFor="remember" style={{ fontSize: '12.5px', color: '#94A3B8', cursor: 'pointer' }}>
                {language === 'ka' ? 'დამიმახსოვრე' : 'Remember me'}
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '6px',
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-btn)',
                background: 'var(--accent-primary)',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '14.5px',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all var(--duration-fast) var(--ease-doxo)',
              }}
            >
              {isLoading ? (language === 'ka' ? 'შესვლა...' : 'Signing in...') : (language === 'ka' ? 'შესვლა' : 'Sign In')}
            </button>
          </form>
        ) : (
          /* ===================================================================
             TAB 2: SIGN UP / REGISTRATION (რეგისტრაცია)
             =================================================================== */
          <form onSubmit={handleSignUpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '4px' }}>
                {language === 'ka' ? 'სახელი და გვარი' : 'Full Name'}
              </label>
              <input
                type="text"
                required
                placeholder={language === 'ka' ? 'მაგ: ნუკრი ჩაჩავა' : 'John Doe'}
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '4px' }}>
                {language === 'ka' ? 'ელ.ფოსტა' : 'Email Address'}
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '4px' }}>
                {language === 'ka' ? 'ტელეფონის ნომერი' : 'Phone Number'}
              </label>
              <input
                type="tel"
                required
                placeholder="+995 5xx xx xx xx"
                value={signUpPhone}
                onChange={(e) => setSignUpPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '4px' }}>
                {language === 'ka' ? 'პაროლი (მინ. 6 სიმბოლო)' : 'Password (min 6 characters)'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showSignUpPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 14px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  {showSignUpPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '6px',
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-btn)',
                background: 'var(--accent-primary)',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '14.5px',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all var(--duration-fast) var(--ease-doxo)',
              }}
            >
              {isLoading ? (language === 'ka' ? 'რეგისტრაცია...' : 'Registering...') : (language === 'ka' ? 'რეგისტრაცია' : 'Create Account')}
            </button>
          </form>
        )}

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '20px 0',
            color: '#64748B',
            fontSize: '12.5px',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
          <span>{language === 'ka' ? 'ან' : 'or'}</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />
        </div>

        {/* Google OAuth One-Click Simulation */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '11px',
            borderRadius: '14px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#FFFFFF',
            fontSize: '13.5px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          {/* Google SVG Icon */}
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>
            {authModalMode === 'signin'
              ? language === 'ka'
                ? 'Google-ით შესვლა'
                : 'Sign in with Google'
              : language === 'ka'
              ? 'Google-ით რეგისტრაცია'
              : 'Sign up with Google'}
          </span>
        </button>
        </>
        )}

        {/* Footer Note */}
        <p style={{ textAlign: 'center', fontSize: '11.5px', color: '#64748B', marginTop: '18px', lineHeight: 1.4 }}>
          {language === 'ka'
            ? 'ავტორიზაციით თქვენ ეთანხმებით DOXO-ს მომსახურების წესებს და კონფიდენციალურობის პოლიტიკას.'
            : 'By proceeding, you agree to DOXO Terms of Service and Privacy Policy.'}
        </p>
      </div>
    </div>
  );
};
