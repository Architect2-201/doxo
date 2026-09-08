import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../common/Modal';
import { IconUser, IconMapPin, IconClock, IconShieldCheck } from '../common/Icons';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser, logout } = useAuth();
  const { language } = useLanguage();

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={language === 'ka' ? 'ჩემი პროფილი & პრეფერენციები' : 'Profile & Preferences'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* User Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src={user.avatarUrl}
            alt={user.firstName}
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{user.firstName} {user.lastName}</h3>
            <div className="metadata-text" style={{ color: 'var(--text-secondary)' }}>{user.email}</div>
            <div className="metadata-text" style={{ color: 'var(--text-muted)' }}>{user.city}, საქართველო</div>
          </div>
        </div>

        {/* AI Memory / Preferences section */}
        <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: 'var(--accent-primary)' }}>
            {language === 'ka' ? 'DOXO AI მეხსიერება & პრეფერენციები' : 'DOXO AI Memory'}
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {language === 'ka' ? 'სასურველი დრო:' : 'Preferred Time:'}
              </span>
              <strong>{language === 'ka' ? 'საღამო (18:00+)' : 'Evening (18:00+)'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {language === 'ka' ? 'კომუნიკაციის ფორმა:' : 'Communication:'}
              </span>
              <strong>{language === 'ka' ? 'მხოლოდ ჩატი (უშეცდომო)' : 'Chat Only (No calls)'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                {language === 'ka' ? 'ძირითადი მისამართი:' : 'Default Address:'}
              </span>
              <strong>ი. ჭავჭავაძის გამზ. 37 (ვაკე)</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="btn btn-secondary"
            style={{
              flex: 1,
              padding: '11px',
              color: 'var(--status-danger)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
            }}
          >
            {language === 'ka' ? 'გამოსვლა' : 'Sign Out'}
          </button>
          <button onClick={onClose} className="btn btn-primary" style={{ flex: 1, padding: '11px' }}>
            {language === 'ka' ? 'დახურვა' : 'Close'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
