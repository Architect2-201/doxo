import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { DoxoStorage } from '../../lib/storage/db';
import { DOXOLogo } from '../common/DOXOLogo';
import { NotificationsDropdown } from './NotificationsDropdown';
import { IconSun, IconMoon, IconBell, IconBriefcase, IconBarChart, IconUser, IconShieldCheck, IconSparkles, IconBookOpen, IconScale } from '../common/Icons';
import { DecisionEngine } from '../../lib/decisions/decisionEngine';

export type ActivePortal = 'customer' | 'user' | 'provider' | 'admin';

interface HeaderProps {
  activePortal: ActivePortal;
  setActivePortal: (portal: ActivePortal) => void;
  onOpenProfile: () => void;
  onOpenLanding: () => void;
  onOpenTrustModal?: () => void;
  onOpenPrivacy?: () => void;
  onOpenGuide?: () => void;
  onOpenDecisions?: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePortal,
  setActivePortal,
  onOpenProfile,
  onOpenLanding,
  onOpenTrustModal,
  onOpenPrivacy,
  onOpenGuide,
  onOpenDecisions,
  onGoHome,
}) => {
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const unreadCount = DoxoStorage.getNotifications().filter(n => !n.read).length;

  // Track real online/offline network transitions
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


  return (
    <header className="app-header">
      {/* Brand Logo (hidden on desktop where left sidebar logo is already visible) */}
      <div className="brand-logo-group hide-desktop" onClick={onGoHome || onOpenLanding} title="DOXO Home">
        <DOXOLogo size="sm" showWordmark={true} />
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        {/* Role Switcher Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--bg-surface-elevated)',
            padding: '3px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border-subtle)',
            height: '36px',
            boxSizing: 'border-box',
          }}
        >
          <button
            onClick={() => setActivePortal('customer')}
            className={`btn btn-sm ${activePortal === 'customer' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              borderRadius: 'var(--radius-pill)',
              padding: '0 12px',
              height: '28px',
              minHeight: '28px',
              fontSize: '12.5px',
              fontWeight: activePortal === 'customer' ? 600 : 500,
            }}
            title="Customer View"
          >
            <IconUser size={13} />
            <span className="hide-mobile">{language === 'ka' ? 'მთავარი' : 'Home'}</span>
          </button>
          <button
            onClick={() => setActivePortal('user')}
            className={`btn btn-sm ${activePortal === 'user' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              borderRadius: 'var(--radius-pill)',
              padding: '0 12px',
              height: '28px',
              minHeight: '28px',
              fontSize: '12.5px',
              fontWeight: activePortal === 'user' ? 600 : 500,
            }}
            title="My Dashboard"
          >
            <IconSparkles size={13} />
            <span className="hide-mobile">{language === 'ka' ? 'ჩემი პანელი' : 'My Panel'}</span>
          </button>
          <button
            onClick={() => setActivePortal('provider')}
            className={`btn btn-sm ${activePortal === 'provider' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              borderRadius: 'var(--radius-pill)',
              padding: '0 12px',
              height: '28px',
              minHeight: '28px',
              fontSize: '12.5px',
              fontWeight: activePortal === 'provider' ? 600 : 500,
            }}
            title="Provider Portal"
          >
            <IconBriefcase size={13} />
            <span className="hide-mobile">{language === 'ka' ? 'ოსტატი' : 'Provider'}</span>
          </button>
          <button
            onClick={() => setActivePortal('admin')}
            className={`btn btn-sm ${activePortal === 'admin' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              borderRadius: 'var(--radius-pill)',
              padding: '0 12px',
              height: '28px',
              minHeight: '28px',
              fontSize: '12.5px',
              fontWeight: activePortal === 'admin' ? 600 : 500,
            }}
            title="Admin KPIs"
          >
            <IconBarChart size={13} />
            <span className="hide-mobile">{language === 'ka' ? 'ადმინი' : 'Admin'}</span>
          </button>
        </div>

        {/* Notification Bell Icon */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-icon"
            title={language === 'ka' ? 'შეტყობინებები' : 'Notifications'}
            style={{ position: 'relative' }}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <IconBell size={16} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-primary)',
                }}
              />
            )}
          </button>

          <NotificationsDropdown
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>


        {/* Network Offline Indicator (Section 54) */}
        {!isOnline && (
          <div
            className="brand-badge"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--status-danger)',
              border: '1px solid var(--status-danger)',
            }}
            title="ინტერნეტ კავშირი გაწყვეტილია. ლოკალური მონაცემები შენახულია."
          >
            ● {language === 'ka' ? 'ოფლაინ რეჟიმი' : 'Offline Mode'}
          </div>
        )}

        {/* Privacy Center Button */}
        {onOpenPrivacy && (
          <button
            onClick={onOpenPrivacy}
            className="btn-icon"
            title={language === 'ka' ? 'კონფიდენციალურობა და მონაცემები' : 'Privacy Center'}
          >
            <IconShieldCheck size={16} />
          </button>
        )}

        {/* User Guide & Manual Button */}
        {onOpenGuide && (
          <button
            onClick={onOpenGuide}
            className="btn-icon"
            title={language === 'ka' ? 'ინსტრუქცია & ფუნქციების განმარტება' : 'User Guide & Manual'}
            style={{ color: 'var(--accent-primary)' }}
          >
            <IconBookOpen size={16} />
          </button>
        )}

        {/* Decision Center Quick Button */}
        {onOpenDecisions && (
          <button
            onClick={onOpenDecisions}
            className="btn-icon"
            title={language === 'ka' ? 'გადაწყვეტილებების ცენტრი' : 'Decision Center'}
            style={{ position: 'relative', color: 'var(--accent-primary)' }}
          >
            <IconScale size={16} />
            {DecisionEngine.getDecisions().filter(d => d.status === 'pending').length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-primary)',
                }}
              />
            )}
          </button>
        )}

        {/* Trust & Transparency Button */}
        {onOpenTrustModal && (
          <button
            onClick={onOpenTrustModal}
            className="btn-icon"
            title={language === 'ka' ? 'როგორ მუშაობს DOXO' : 'How DOXO Works'}
            style={{ color: 'var(--accent-primary)' }}
          >
            <IconSparkles size={16} />
          </button>
        )}

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'ka' ? 'en' : 'ka')}
          className="btn-icon"
          title={language === 'ka' ? 'Switch to English' : 'გადართე ქართულზე'}
          style={{ fontSize: '12px', fontWeight: 600 }}
        >
          {language === 'ka' ? 'EN' : 'GE'}
        </button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="btn-icon"
          title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        >
          {theme === 'light' ? <IconMoon size={16} /> : <IconSun size={16} />}
        </button>

        {/* User Auth Section: Login / Register OR Profile Avatar */}
        {isAuthenticated && user ? (
          <div
            onClick={onOpenProfile}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              height: '36px',
              padding: '0 12px 0 6px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--bg-surface)',
              border: (user.email?.toLowerCase() === 'nukrichachava9@gmail.com' || user.role === 'admin')
                ? '1.5px solid #F59E0B'
                : '1px solid var(--border-subtle)',
              transition: 'border-color var(--duration-fast) var(--ease-doxo)',
            }}
            title={`${user.firstName} ${user.lastName} (${user.email})`}
          >
            <img
              src={user.avatarUrl}
              alt={user.firstName}
              style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }} className="hide-mobile">
              {user.firstName}
            </span>
            {(user.email?.toLowerCase() === 'nukrichachava9@gmail.com' || user.role === 'admin') && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  background: '#F59E0B',
                  color: '#1E293B',
                  borderRadius: '10px',
                  padding: '1px 6px',
                }}
              >
                ADMIN
              </span>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => openAuthModal('signin')}
              className="btn btn-ghost btn-sm"
              style={{ height: '36px', fontSize: '13px', fontWeight: 600, padding: '0 12px' }}
            >
              {language === 'ka' ? 'შესვლა' : 'Sign In'}
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="btn btn-primary btn-sm"
              style={{
                height: '36px',
                fontSize: '13px',
                fontWeight: 600,
                padding: '0 16px',
                borderRadius: 'var(--radius-btn)',
              }}
            >
              {language === 'ka' ? 'რეგისტრაცია' : 'Sign Up'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
