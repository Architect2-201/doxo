import React from 'react';
import { ScheduleConflictData } from '../../types/decision';
import { IconAlertCircle, IconClock, IconMapPin } from '../common/Icons';

interface ConflictAlertProps {
  conflict: ScheduleConflictData;
  onSelectSuggestion?: (appliedOptionId: string) => void;
  selectedOptionId?: string;
}

export const ConflictAlert: React.FC<ConflictAlertProps> = ({
  conflict,
  onSelectSuggestion,
  selectedOptionId,
}) => {
  return (
    <div
      style={{
        backgroundColor: 'rgba(239, 68, 68, 0.04)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        marginBottom: '18px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ color: 'var(--status-error)' }}>
          <IconAlertCircle size={18} />
        </span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--status-error)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          დროითი კონფლიქტი აღმოჩენილია · {conflict.overlapDurationKa}
        </span>
      </div>

      {/* Two Overlapping Tasks */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
          marginBottom: '12px',
        }}
      >
        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>საქმე 1</div>
          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
            {conflict.taskA.titleKa}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: 'var(--accent-primary)', marginTop: '4px' }}>
            <IconClock size={12} /> {conflict.taskA.timeKa}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            <IconMapPin size={12} /> {conflict.taskA.locationKa}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>საქმე 2</div>
          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
            {conflict.taskB.titleKa}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: 'var(--accent-primary)', marginTop: '4px' }}>
            <IconClock size={12} /> {conflict.taskB.timeKa}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            <IconMapPin size={12} /> {conflict.taskB.locationKa}
          </div>
        </div>
      </div>

      {conflict.travelTimeEstimateKa && (
        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🚗</span>
          <span>{conflict.travelTimeEstimateKa} (ორივე ლოკაციაზე დასწრება ფიზიკურად შეუძლებელია).</span>
        </div>
      )}

      {/* Suggested Resolutions */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
          DOXO-ს შემოთავაზებული გამოსავალი (აირჩიე შენთვის მოსახერხებელი):
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {conflict.suggestions.map((sug) => {
            const isSelected = selectedOptionId === sug.appliedOptionId;
            return (
              <div
                key={sug.id}
                onClick={() => onSelectSuggestion && onSelectSuggestion(sug.appliedOptionId)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.08)' : 'var(--bg-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {sug.titleKa}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {sug.descriptionKa}
                  </div>
                </div>

                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: isSelected ? '5px solid var(--accent-primary)' : '2px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-primary)',
                    flexShrink: 0,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
