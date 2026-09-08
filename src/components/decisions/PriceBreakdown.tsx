import React from 'react';
import { PriceBreakdownItem } from '../../types/decision';

interface PriceBreakdownProps {
  items: PriceBreakdownItem[];
  total: number | null;
  totalFormatted: string;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({ items, totalFormatted }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
        marginBottom: '16px',
      }}
    >
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
        ხარჯების გამჭვირვალე სტრუქტურა
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            <span>{item.labelKa}</span>
            <span style={{ fontWeight: 500, color: item.amount === null ? 'var(--status-warning)' : 'var(--text-primary)' }}>
              {item.amountFormatted}
            </span>
          </div>
        ))}

        <div
          style={{
            borderTop: '1px dashed var(--border-subtle)',
            paddingTop: '8px',
            marginTop: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>სულ (Total):</span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-primary)' }}>{totalFormatted}</span>
        </div>
      </div>
    </div>
  );
};
