import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { NavTab } from './Sidebar';
import { ActivePortal } from './Header';
import { DOXOLogo } from '../common/DOXOLogo';
import {
  IconHome,
  IconTasks,
  IconInbox,
  IconWrench,
  IconUser,
  IconUsers,
  IconScale,
  IconBookOpen,
  IconShieldCheck,
  IconSparkles,
  IconSun,
  IconMoon,
  IconX,
  IconBriefcase,
  IconBarChart,
} from '../common/Icons';
import { DecisionEngine } from '../../lib/decisions/decisionEngine';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  activePortal: ActivePortal;
  setActivePortal: (portal: ActivePortal) => void;
  onOpenProfile: () => void;
  onOpenGuide: () => void;
  onOpenPrivacy: () => void;
  onOpenTrustModal: () => void;
  onGoHome: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  activePortal,
  setActivePortal,
  onOpenProfile,
  onOpenGuide,
  onOpenPrivacy,
  onOpenTrustModal,
  onGoHome,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, isSuperAdmin, isPendingVerification, isVerified, openAuthModal, logout, requirePermission } = useAuth();
  const { activeTasks } = useTasks();

  if (!isOpen) return null;

  const pendingDecisionsCount = DecisionEngine.getDecisions().filter(d => d.status === 'pending').length;

  const handleTabSelect = (tab: NavTab) => {
    setActiveTab(tab);
    onClose();
  };

  const handlePortalSelect = (portal: ActivePortal) => {
    if (portal === 'provider') {
      if (!requirePermission('canAccessProviderPortal', 'ოსტატის პორტალი შეზღუდულია', 'ოსტატის მართვის პანელზე წვდომა ეძლევა მხოლოდ ადმინისტრატორის მიერ დადასტურებულ სპეციალისტებს.')) {
        return;
      }
    }
    if (portal === 'admin') {
      if (!isSuperAdmin) {
        requirePermission('canAccessDecisionCenter', 'ადმინ პანელი შეზღუდულია', 'ადმინისტრატორის პანელზე წვდომა აქვს მხოლოდ მთავარ ადმინისტრატორს.');
        return;
      }
    }
    setActivePortal(portal);
    onClose();
  };

  const navItems = [
    { id: 'home' as NavTab, label: t.navHome, icon: IconHome },
    { id: 'decisions' as NavTab, label: t.navDecisions || 'გადაწყვეტილებები', icon: IconScale, badge: pendingDecisionsCount > 0 ? pendingDecisionsCount : undefined },
    { id: 'tasks' as NavTab, label: t.navTasks, icon: IconTasks, badge: activeTasks.length > 0 ? activeTasks.length : undefined },
    { id: 'inbox' as NavTab, label: t.navInbox, icon: IconInbox },
    { id: 'services' as NavTab, label: t.navServices, icon: IconWrench },
    { id: 'myhome' as NavTab, label: t.navMyHome, icon: IconHome },
    { id: 'family' as NavTab, label: t.navFamily, icon: IconUsers },
    { id: 'profile' as NavTab, label: t.navProfile, icon: IconUser },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        display: 'flex',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Drawer Body */}
      <div
        style={{
          position: 'relative',
          width: '85vw',
          maxWidth: '320px',
          height: '100%',
          backgroundColor: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          animation: 'slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <DOXOLogo
            size="sm"
            showWordmark={true}
            onClick={() => {
              onGoHome();
              onClose();
            }}
          />
          <button
            onClick={onClose}
            className="btn-icon"
            style={{ width: '36px', height: '36px' }}
            aria-label="Close menu"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* User Card */}
        <div
          style={{
            padding: '14px 16px',
            margin: '12px 14px 4px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {isAuthenticated && user ? (
            <div
              onClick={() => {
                onOpenProfile();
                onClose();
              }}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={user.avatarUrl}
                  alt={user.firstName}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.firstName} {user.lastName}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isSuperAdmin ? (
                  <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#F59E0B', color: '#1E293B', padding: '2px 8px', borderRadius: '10px' }}>
                    👑 SUPER ADMIN
                  </span>
                ) : isPendingVerification ? (
                  <span style={{ fontSize: '10.5px', fontWeight: 700, background: 'rgba(234, 179, 8, 0.15)', color: '#EAB308', padding: '2px 8px', borderRadius: '10px' }}>
                    ⏳ მოლოდინში
                  </span>
                ) : isVerified ? (
                  <span style={{ fontSize: '10.5px', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '2px 8px', borderRadius: '10px' }}>
                    ✓ ვერიფიცირებული
                  </span>
                ) : null}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  openAuthModal('signin');
                  onClose();
                }}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, fontWeight: 600 }}
              >
                {language === 'ka' ? 'შესვლა' : 'Sign In'}
              </button>
              <button
                onClick={() => {
                  openAuthModal('signup');
                  onClose();
                }}
                className="btn btn-primary btn-sm"
                style={{ flex: 1, fontWeight: 600 }}
              >
                {language === 'ka' ? 'რეგისტრაცია' : 'Sign Up'}
              </button>
            </div>
          )}
        </div>

        {/* Portal Switcher */}
        <div style={{ padding: '8px 14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.04em' }}>
            {language === 'ka' ? 'პანელის გადართვა' : 'Switch Portal'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <button
              onClick={() => handlePortalSelect('customer')}
              className={`btn btn-sm ${activePortal === 'customer' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', fontSize: '12px', padding: '6px 10px', height: '34px' }}
            >
              <IconUser size={14} />
              <span>{language === 'ka' ? 'მთავარი' : 'Home'}</span>
            </button>
            <button
              onClick={() => handlePortalSelect('user')}
              className={`btn btn-sm ${activePortal === 'user' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', fontSize: '12px', padding: '6px 10px', height: '34px' }}
            >
              <IconSparkles size={14} />
              <span>{language === 'ka' ? 'ჩემი პანელი' : 'My Panel'}</span>
            </button>
            <button
              onClick={() => handlePortalSelect('provider')}
              className={`btn btn-sm ${activePortal === 'provider' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', fontSize: '12px', padding: '6px 10px', height: '34px' }}
            >
              <IconBriefcase size={14} />
              <span>{language === 'ka' ? 'ოსტატი' : 'Provider'}</span>
            </button>
            {isSuperAdmin && (
              <button
                onClick={() => handlePortalSelect('admin')}
                className={`btn btn-sm ${activePortal === 'admin' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start', fontSize: '12px', padding: '6px 10px', height: '34px' }}
              >
                <IconBarChart size={14} />
                <span>{language === 'ka' ? 'ადმინი' : 'Admin'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <div style={{ padding: '8px 14px', flex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.04em' }}>
            {language === 'ka' ? 'ნავიგაცია' : 'Navigation'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabSelect(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-btn)',
                    backgroundColor: isActive ? 'var(--accent-light)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '13.5px',
                    border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  <Icon size={18} style={{ color: isActive ? 'var(--accent-primary)' : 'inherit', flexShrink: 0 }} />
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                  {item.badge !== undefined && (
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: 'var(--accent-primary)',
                        color: '#fff',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* System & Tools */}
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={() => {
                onOpenGuide();
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-btn)',
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <IconBookOpen size={16} />
              <span>{language === 'ka' ? 'ინსტრუქცია & გზამკვლევი' : 'Guide & Manual'}</span>
            </button>

            <button
              onClick={() => {
                onOpenTrustModal();
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-btn)',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <IconSparkles size={16} />
              <span>{language === 'ka' ? 'როგორ მუშაობს DOXO' : 'How DOXO Works'}</span>
            </button>

            <button
              onClick={() => {
                onOpenPrivacy();
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-btn)',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <IconShieldCheck size={16} />
              <span>{language === 'ka' ? 'კონფიდენციალურობა' : 'Privacy Center'}</span>
            </button>
          </div>
        </div>

        {/* Footer: Theme & Language */}
        <div
          style={{
            padding: '12px 14px max(14px, env(safe-area-inset-bottom))',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setLanguage(language === 'ka' ? 'en' : 'ka')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '12px', fontWeight: 700 }}
            >
              {language === 'ka' ? '🇬🇪 KA' : '🇺🇸 EN'}
            </button>
            <button
              onClick={toggleTheme}
              className="btn btn-secondary btn-sm"
              title="Theme"
            >
              {theme === 'light' ? <IconMoon size={14} /> : <IconSun size={14} />}
              <span style={{ fontSize: '12px', marginLeft: '4px' }}>
                {theme === 'light' ? 'Dark' : 'Light'}
              </span>
            </button>
          </div>

          {isAuthenticated && (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--status-danger)', fontSize: '12px' }}
            >
              {language === 'ka' ? 'გასვლა' : 'Sign Out'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
