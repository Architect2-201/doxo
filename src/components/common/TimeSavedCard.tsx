import React from 'react';

export interface TimeSavedCardProps {
  timeSavedText?: string;
  tasksCount?: number;
  periodLabel?: string;
  lang?: 'ka' | 'en';
  className?: string;
}

export const TimeSavedCard: React.FC<TimeSavedCardProps> = ({
  timeSavedText = '2სთ 40წთ',
  tasksCount = 3,
  periodLabel,
  lang = 'ka',
  className = '',
}) => {
  const period = periodLabel || (lang === 'ka' ? 'დღეს' : 'Today');
  const verb = lang === 'ka' ? 'დაგიზოგე.' : 'saved for you.';
  const tasksLabel = lang === 'ka' ? `${tasksCount} საქმე მოგვარდა` : `${tasksCount} tasks handled`;

  return (
    <div
      className={`time-saved-card ${className}`}
      style={{
        borderRadius: 'var(--radius-card)',
        padding: '16px 18px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xs)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span
          className="metadata-text"
          style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text-muted)',
            fontWeight: 600,
          }}
        >
          {period}
        </span>
        <span
          style={{
            fontSize: '12px',
            color: 'var(--accent-primary)',
            backgroundColor: 'var(--accent-light)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
            fontWeight: 600,
          }}
        >
          {tasksLabel}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', marginTop: '8px' }}>
        <span
          style={{
            fontSize: '21px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
          }}
        >
          {timeSavedText}
        </span>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
          }}
        >
          {verb}
        </span>
      </div>
    </div>
  );
};
