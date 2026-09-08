import React from 'react';
import { DecisionItem } from '../../types/decision';

interface DecisionSnapshotProps {
  decision: DecisionItem;
}

export const DecisionSnapshot: React.FC<DecisionSnapshotProps> = ({ decision }) => {
  const minPrice = Math.min(...decision.options.map(o => o.price).filter(p => p > 0));
  const maxPrice = Math.max(...decision.options.map(o => o.price));
  const priceRange = minPrice > 0 ? `${minPrice}–${maxPrice} ₾` : 'უფასო გადატანა';

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 16px',
        marginBottom: '18px',
      }}
    >
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
        DECISION SNAPSHOT
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>რა გვჭირდება?</div>
          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
            {decision.titleKa}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ვარიანტები</div>
          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
            {decision.options.length} ალტერნატივა
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ფასების დიაპაზონი</div>
          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--accent-primary)', marginTop: '2px' }}>
            {priceRange}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>რეკომენდაცია</div>
          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--status-success)', marginTop: '2px' }}>
            {decision.doxoRecommendation.whatKa.split('(')[0].replace('მე ', '').replace(' გირჩევ.', '')}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>შემდეგი ნაბიჯი</div>
          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
            დადასტურება
          </div>
        </div>
      </div>
    </div>
  );
};
