import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DoxoStorage } from '../../lib/storage/db';
import { OperationalNotification } from '../../types/marketplace';
import { IconBell, IconCheck, IconClock, IconArrowRight } from '../common/Icons';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNotification?: (notif: OperationalNotification) => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  isOpen,
  onClose,
  onSelectNotification,
}) => {
  const { language } = useLanguage();
  if (!isOpen) return null;

  const notifications = DoxoStorage.getNotifications();

  return (
    <div
      style={{
        position: 'absolute',
        top: '52px',
        right: '70px',
        width: '320px',
        maxHeight: '400px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-elevation-high)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      onClick={e => e.stopPropagation()}
    >
      <div
        style={{
          padding: '12px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <IconBell size={15} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            შეტყობინებები
          </span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {notifications.filter(n => !n.read).length} ახალი
        </span>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '6px 0' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            შეტყობინებები არ არის
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => {
                DoxoStorage.markNotificationRead(notif.id);
                onSelectNotification?.(notif);
                onClose();
              }}
              style={{
                padding: '10px 14px',
                borderBottom: '1px solid var(--border-subtle)',
                background: notif.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {notif.titleKa}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '3px 0 0', lineHeight: 1.35 }}>
                {notif.messageKa}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
