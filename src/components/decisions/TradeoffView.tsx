import React from 'react';
import { DecisionOption, TradeoffRule } from '../../types/decision';
import { IconCheck, IconAlertCircle } from '../common/Icons';

interface TradeoffViewProps {
  options: DecisionOption[];
  tradeoffs?: TradeoffRule[];
}

export const TradeoffView: React.FC<TradeoffViewProps> = ({ options, tradeoffs }) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
          რა იცვლება თითოეულ ვარიანტში? (Trade-offs)
        </h4>
      </div>

      {/* 1. Pros & Cons per Option */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        {options.map((opt) => (
          <div
            key={opt.id}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {opt.titleKa}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {opt.priceFormatted}
              </span>
            </div>

            {/* Pros */}
            {opt.prosKa.length > 0 && (
              <div style={{ marginBottom: '6px' }}>
                {opt.prosKa.map((pro, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--status-success)', marginBottom: '3px' }}>
                    <IconCheck size={12} />
                    <span>{pro}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Cons */}
            {opt.consKa.length > 0 && (
              <div>
                {opt.consKa.map((con, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                    <span style={{ color: 'var(--status-warning)' }}>–</span>
                    <span>{con}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 2. Conditional Decision Rules */}
      {tradeoffs && tradeoffs.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderLeft: '3px solid var(--accent-primary)',
            borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            გადაწყვეტის წესი:
          </div>
          {tradeoffs.map((t, i) => (
            <div key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>•</span>
              <span>{t.ruleKa}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
