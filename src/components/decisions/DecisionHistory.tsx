import React from 'react';
import { DecisionItem } from '../../types/decision';
import { DecisionEngine } from '../../lib/decisions/decisionEngine';
import { IconCheck, IconStar } from '../common/Icons';

interface DecisionHistoryProps {
  decisions: DecisionItem[];
  onRefresh: () => void;
}

export const DecisionHistory: React.FC<DecisionHistoryProps> = ({ decisions, onRefresh }) => {
  const completed = decisions.filter(d => d.status === 'completed');

  const handleFeedback = (id: string, feedback: 'positive' | 'negative') => {
    DecisionEngine.setDecisionFeedback(id, feedback);
    onRefresh();
  };

  if (completed.length === 0) {
    return (
      <div
        style={{
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-muted)',
        }}
      >
        <p style={{ margin: 0, fontSize: '13.5px' }}>
          ჯერჯერობით გადაწყვეტილებების ისტორია ცარიელია.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {completed.map((item) => {
        const selectedOpt = item.options.find(o => o.id === item.userDecision?.selectedOptionId) || item.options[0];
        return (
          <div
            key={item.id}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--status-success)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  ✓ მიღებული გადაწყვეტილება
                </span>
                <h4 style={{ margin: '2px 0 0', fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {item.titleKa}
                </h4>
              </div>

              {item.userDecision?.decidedAt && (
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  {new Date(item.userDecision.decidedAt).toLocaleDateString('ka-GE', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: '12.5px' }}>
              <span style={{ color: 'var(--text-muted)' }}>არჩეულია: </span>
              <strong style={{ color: 'var(--text-primary)' }}>{selectedOpt.titleKa}</strong>
              <span style={{ color: 'var(--accent-primary)', marginLeft: '6px' }}>({selectedOpt.priceFormatted})</span>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                რატომ: {item.doxoRecommendation.whyKa[0]}
              </div>
            </div>

            {/* Optional Feedback Loop (Section 36) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '8px',
                fontSize: '11.5px',
                color: 'var(--text-muted)',
              }}
            >
              <span>გამოგადგა ეს არჩევანი?</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleFeedback(item.id, 'positive')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: item.userDecision?.feedback === 'positive' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    color: item.userDecision?.feedback === 'positive' ? 'var(--status-success)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  👍 დიახ
                </button>
                <button
                  type="button"
                  onClick={() => handleFeedback(item.id, 'negative')}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: item.userDecision?.feedback === 'negative' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                    color: item.userDecision?.feedback === 'negative' ? 'var(--status-error)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  👎 არა
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
