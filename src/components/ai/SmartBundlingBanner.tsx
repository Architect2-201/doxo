import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { IconSparkles, IconX } from '../common/Icons';

interface SmartBundlingBannerProps {
  location?: string;
  tasksCount?: number;
  onBundleConfirm: () => void;
  onDismiss: () => void;
}

export const SmartBundlingBanner: React.FC<SmartBundlingBannerProps> = ({
  location = 'საბურთალო',
  tasksCount = 3,
  onBundleConfirm,
  onDismiss,
}) => {
  const { language } = useLanguage();

  return (
    <div
      className="card animate-fade-in"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--accent-border)',
        borderRadius: 'var(--radius-card)',
        padding: '14px 18px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-light)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconSparkles size={16} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: 'var(--accent-primary)',
                textTransform: 'uppercase',
              }}
            >
              ✨ SMART BUNDLING
            </span>
          </div>

          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.4 }}>
            {language === 'ka'
              ? `${tasksCount} საქმე გაქვს ${location}ზე. გინდა ერთ ვიზიტად დავაჯგუფო?`
              : `You have ${tasksCount} tasks in ${location}. Bundle into one visit?`}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={onBundleConfirm}
          className="btn btn-primary btn-sm"
          style={{ padding: '6px 14px', fontSize: '13px' }}
        >
          <span>{language === 'ka' ? 'დაჯგუფება' : 'Bundle'}</span>
        </button>

        <button
          onClick={onDismiss}
          className="btn-ghost"
          style={{ width: '32px', height: '32px', padding: 0 }}
          aria-label={language === 'ka' ? 'დახურვა' : 'Close'}
        >
          <IconX size={15} />
        </button>
      </div>
    </div>
  );
};
