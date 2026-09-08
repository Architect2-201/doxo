import React from 'react';
import { PriceInsightData } from '../../types/decision';
import { IconSparkles, IconHelpCircle } from '../common/Icons';

interface PriceInsightProps {
  insight?: PriceInsightData;
}

export const PriceInsight: React.FC<PriceInsightProps> = ({ insight }) => {
  if (!insight) return null;

  const getBadgeStyle = () => {
    switch (insight.level) {
      case 'low':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-success)', label: 'დაბალი ფასი' };
      case 'average':
        return { bg: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', label: 'საშუალო საბაზრო' };
      case 'high':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--status-warning)', label: 'საშუალოზე მაღალი' };
      default:
        return { bg: 'var(--bg-tertiary)', color: 'var(--text-muted)', label: 'მონაცემები მწირია' };
    }
  };

  const badge = getBadgeStyle();

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
      }}
    >
      <div style={{ marginTop: '2px', color: badge.color }}>
        {insight.hasSufficientData ? <IconSparkles size={16} /> : <IconHelpCircle size={16} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            ფასის ანალიზი (Price Intelligence)
          </span>
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: badge.bg,
              color: badge.color,
            }}
          >
            {badge.label}
          </span>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          {insight.hasSufficientData ? insight.textKa : 'ფასთან დაკავშირებით საკმარისი ისტორიული მონაცემი არ მაქვს.'}
        </div>
      </div>
    </div>
  );
};
