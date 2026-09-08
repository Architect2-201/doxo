import React, { useState } from 'react';
import { ApprovalActionItem } from '../../types/decision';
import { DecisionEngine } from '../../lib/decisions/decisionEngine';
import { IconShieldCheck, IconCheck, IconAlertCircle } from '../common/Icons';

interface ApprovalCenterProps {
  onRefresh?: () => void;
}

export const ApprovalCenter: React.FC<ApprovalCenterProps> = ({ onRefresh }) => {
  const [approvals, setApprovals] = useState<ApprovalActionItem[]>(() => DecisionEngine.getApprovals());

  const handleAction = (id: string, status: 'approved' | 'rejected') => {
    DecisionEngine.updateApprovalStatus(id, status);
    setApprovals(DecisionEngine.getApprovals());
    if (onRefresh) onRefresh();
  };

  const pending = approvals.filter(a => a.status === 'pending');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Policy Banner: Zero Autonomous Execution */}
      <div
        style={{
          backgroundColor: 'rgba(16, 185, 129, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <span style={{ color: 'var(--status-success)', marginTop: '2px' }}>
          <IconShieldCheck size={18} />
        </span>
        <div>
          <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
            მომხმარებლის მკაცრი კონტროლი (User Control Center)
          </h4>
          <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
            DOXO <strong>არასოდეს</strong> იღებს ფინანსურ ან ოპერაციულ გადაწყვეტილებას შენს ნაცვლად.
            ყოველი გადახდა, ჯავშანი, დროის შეცვლა ან შეტყობინების გაგზავნა მოითხოვს შენს პირად დადასტურებას.
          </p>
        </div>
      </div>

      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        დადასტურებას ელოდება ({pending.length})
      </div>

      {pending.length === 0 ? (
        <div
          style={{
            padding: '36px 20px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            fontSize: '13.5px',
          }}
        >
          ამ ეტაპზე დასადასტურებელი ქმედებები არ არის.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pending.map((appr) => (
            <div
              key={appr.id}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px',
              }}
            >
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: appr.riskLevel === 'HIGH' ? 'var(--status-error)' : 'var(--accent-primary)',
                      backgroundColor: 'var(--bg-tertiary)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {appr.riskLevel} RISK · {appr.type}
                  </span>
                  {appr.costKa && (
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {appr.costKa}
                    </span>
                  )}
                </div>

                <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {appr.titleKa}
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {appr.descriptionKa}
                </p>
              </div>

              {/* Action Buttons: [ დადასტურება ] [ უარი ] */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleAction(appr.id, 'rejected')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'transparent',
                    color: 'var(--status-error)',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  უარი
                </button>

                <button
                  type="button"
                  onClick={() => handleAction(appr.id, 'approved')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: 'var(--accent-primary)',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <IconCheck size={14} /> დადასტურება
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
