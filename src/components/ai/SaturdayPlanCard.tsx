import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { AnalyzedIntent } from '../../lib/ai/aiService';
import { IconSparkles, IconCheck, IconClock, IconArrowRight } from '../common/Icons';

interface SaturdayPlanCardProps {
  intent: AnalyzedIntent;
  onExecutePlan: () => void;
}

export const SaturdayPlanCard: React.FC<SaturdayPlanCardProps> = ({ intent, onExecutePlan }) => {
  const { language, t } = useLanguage();

  return (
    <div className="transformation-card animate-fade-in" style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div className="transformation-badge">
          <IconSparkles size={14} />
          <span>{language === 'ka' ? 'შაბათის სრული გეგმა' : 'SATURDAY LIFE PLAN'}</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--status-success-bg)',
            color: 'var(--status-success-text)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '12.5px',
            fontWeight: 700,
          }}
        >
          <IconClock size={13} />
          <span>{language === 'ka' ? 'დაზოგილი დრო: ~4 საათი' : 'Estimated time saved: ~4 hours'}</span>
        </div>
      </div>

      <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
        {language === 'ka' ? intent.suggestedTitleKa : intent.suggestedTitleEn}
      </h3>
      <p className="body-sm" style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
        {language === 'ka'
          ? 'არეული მოთხოვნა გარდაიქმნა 3 სრულყოფილ, კოორდინირებულ დავალებად:'
          : 'Your messy human request was transformed into 3 coordinated real-world tasks:'}
      </p>

      {/* 3 Coordinated Plan Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
        {intent.multiIntentItems?.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--status-success)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconCheck size={14} />
              </div>
              <div>
                <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {language === 'ka' ? item.titleKa : item.titleEn}
                </div>
                <div className="metadata-text" style={{ color: 'var(--text-muted)' }}>
                  {language === 'ka' ? 'შესრულების დრო: ' : 'Scheduled at: '}{item.estimatedTime}
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--accent-primary)',
                background: 'var(--accent-light)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {language === 'ka' ? 'დადასტურებულია' : 'Ready to handle'}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="metadata-text">{language === 'ka' ? 'საერთო სავარაუდო ღირებულება:' : 'Estimated total:'}</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
            150₾ – 220₾
          </div>
        </div>

        <button onClick={onExecutePlan} className="btn btn-primary" style={{ padding: '12px 24px' }}>
          <span>{language === 'ka' ? 'დამიდასტურე და მომიგვარე' : 'Confirm & Handle Plan'}</span>
          <IconArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
