import React, { useState } from 'react';
import { DoxoRecommendation } from '../../types/decision';
import { IconCheck, IconChevronDown, IconChevronUp, IconSparkles } from '../common/Icons';

interface WhyThisProps {
  recommendation: DoxoRecommendation;
  isExpandedDefault?: boolean;
}

export const WhyThis: React.FC<WhyThisProps> = ({
  recommendation,
  isExpandedDefault = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(isExpandedDefault);

  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        backgroundColor: 'rgba(139, 92, 246, 0.04)',
        padding: '16px 18px',
        marginBottom: '18px',
      }}
    >
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconSparkles size={14} />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              DOXO-ს რეკომენდაცია · {recommendation.confidenceTextKa}
            </span>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              {recommendation.whatKa}
            </div>
          </div>
        </div>

        <button
          type="button"
          aria-label="Toggle explanation"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {isExpanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
        </button>
      </div>

      {isExpanded && (
        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(139, 92, 246, 0.12)' }}>
          {/* WHY Section */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
              რატომ ეს? (WHY)
            </div>
            <ul style={{ margin: 0, paddingLeft: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {recommendation.whyKa.map((point, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                  <span style={{ color: 'var(--status-success)', marginTop: '1px', flexShrink: 0 }}>
                    <IconCheck size={14} />
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* TRADEOFF Section */}
          <div style={{ marginBottom: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
              კომპრომისი (TRADE-OFF)
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
              {recommendation.tradeoffKa}
            </div>
          </div>

          {/* NEXT STEP & MANDATORY DISCLAIMER */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              <strong>შემდეგი ნაბიჯი:</strong> {recommendation.nextStepKa}
            </div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--accent-primary)',
                fontStyle: 'italic',
                paddingTop: '4px',
              }}
            >
              „{recommendation.disclaimerKa}“
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
