import React from 'react';
import { ChangeSummaryData } from '../../types/decision';
import { IconClock, IconAlertCircle } from '../common/Icons';

interface ChangeSummaryProps {
  change?: ChangeSummaryData;
  missingInformation?: string[];
}

export const ChangeSummary: React.FC<ChangeSummaryProps> = ({
  change,
  missingInformation,
}) => {
  if (!change && (!missingInformation || missingInformation.length === 0)) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
      {/* Expiration or Modification Notice */}
      {change && (
        <div
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.06)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ color: 'var(--status-warning)', flexShrink: 0 }}>
            <IconClock size={16} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--status-warning)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              რა შეიცვალა? (What Changed)
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              <strong>{change.oldValueKa}</strong> → <span style={{ color: 'var(--status-warning)', fontWeight: 600 }}>{change.newValueKa}</span>
              {' · '}{change.reasonKa}
            </div>
          </div>
        </div>
      )}

      {/* Missing Information Notice */}
      {missingInformation && missingInformation.length > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <span style={{ color: 'var(--status-error)', marginTop: '2px', flexShrink: 0 }}>
            <IconAlertCircle size={16} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--status-error)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ნაკლული ინფორმაცია (Missing Information)
            </div>
            <ul style={{ margin: '4px 0 0', paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {missingInformation.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '2px' }}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
