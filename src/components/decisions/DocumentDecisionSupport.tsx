import React from 'react';
import { DocumentExtractedFact } from '../../types/decision';
import { IconCamera, IconAlertCircle } from '../common/Icons';

interface DocumentDecisionSupportProps {
  fact?: DocumentExtractedFact;
}

export const DocumentDecisionSupport: React.FC<DocumentDecisionSupportProps> = ({ fact }) => {
  if (!fact) return null;

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ color: 'var(--accent-primary)' }}>
          <IconCamera size={16} />
        </span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          დოკუმენტიდან / შეთავაზებიდან ამოღებული ფაქტები
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '10px' }}>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>სერვისი:</span>
          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{fact.serviceTitleKa}</div>
        </div>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ძირითადი ფასი:</span>
          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{fact.basePriceKa}</div>
        </div>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>დამატებითი ხარჯი:</span>
          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--status-warning)' }}>{fact.extraFeesKa}</div>
        </div>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ვადა:</span>
          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{fact.termDaysKa}</div>
        </div>
      </div>

      {fact.missingPointsKa.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
          <span style={{ color: 'var(--status-warning)', marginTop: '2px' }}><IconAlertCircle size={14} /></span>
          <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            ყურადღება: {fact.missingPointsKa.join(', ')}
          </span>
        </div>
      )}

      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>
        {fact.confidenceDisclaimerKa}
      </div>
    </div>
  );
};
