import React from 'react';
import { DecisionItem } from '../../types/decision';
import { IconSparkles, IconClock, IconAlertCircle, IconScale } from '../common/Icons';

interface DecisionCardProps {
  decision: DecisionItem;
  onClick: () => void;
}

export const DecisionCard: React.FC<DecisionCardProps> = ({ decision, onClick }) => {
  const getCategoryBadge = () => {
    switch (decision.category) {
      case 'provider_choice':
        return { label: 'პროვაიდერის არჩევანი', color: 'var(--accent-primary)' };
      case 'schedule_conflict':
        return { label: 'დროითი კონფლიქტი', color: 'var(--status-error)' };
      case 'quote_comparison':
        return { label: 'შეთავაზებების შედარება', color: 'var(--status-warning)' };
      default:
        return { label: 'რეკომენდაცია', color: 'var(--accent-primary)' };
    }
  };

  const badge = getCategoryBadge();

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 20px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-primary)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div>
        {/* Top Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: badge.color,
              backgroundColor: 'var(--bg-tertiary)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {badge.label}
          </span>

          {decision.deadlineKa && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: 'var(--status-warning)', fontWeight: 500 }}>
              <IconClock size={12} /> {decision.deadlineKa}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{ margin: '0 0 6px', fontSize: '15.5px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.4' }}>
          {decision.titleKa}
        </h3>

        {/* Context */}
        <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          {decision.contextKa}
        </p>

        {/* DOXO Recommendation Sneak Peek */}
        <div
          style={{
            backgroundColor: 'rgba(139, 92, 246, 0.05)',
            borderLeft: '3px solid var(--accent-primary)',
            padding: '8px 12px',
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
            marginBottom: '14px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <IconSparkles size={12} /> DOXO:
          </div>
          <div style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '2px' }}>
            {decision.doxoRecommendation.whatKa}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {decision.doxoRecommendation.whyKa[0]}
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '12px',
        }}
      >
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {decision.options.length} ვარიანტი
        </div>

        <button
          type="button"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: '7px 14px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <IconScale size={13} /> შედარება & არჩევა
        </button>
      </div>
    </div>
  );
};
