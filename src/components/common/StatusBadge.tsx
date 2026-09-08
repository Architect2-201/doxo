import React from 'react';

export type DOXOStatus = 'confirmed' | 'on_the_way' | 'working' | 'completed' | 'analyzing';

export interface StatusBadgeProps {
  status: DOXOStatus;
  lang?: 'ka' | 'en';
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  lang = 'ka',
  className = '',
  size = 'md',
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'on_the_way':
        return {
          labelKa: 'გზაშია',
          labelEn: 'On the way',
          dotColor: 'var(--accent-primary)',
          pulse: true,
        };
      case 'working':
        return {
          labelKa: 'მუშაობს',
          labelEn: 'Working',
          dotColor: 'var(--status-info)',
          pulse: true,
        };
      case 'confirmed':
        return {
          labelKa: 'დადასტურებულია',
          labelEn: 'Confirmed',
          dotColor: 'var(--status-success)',
          pulse: false,
        };
      case 'completed':
        return {
          labelKa: 'შესრულებულია',
          labelEn: 'Completed',
          dotColor: 'var(--text-muted)',
          pulse: false,
        };
      case 'analyzing':
      default:
        return {
          labelKa: 'მივხედავ',
          labelEn: 'Handling',
          dotColor: 'var(--status-warning)',
          pulse: false,
        };
    }
  };

  const config = getStatusConfig();
  const label = lang === 'ka' ? config.labelKa : config.labelEn;

  return (
    <span
      className={`doxo-status-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: size === 'sm' ? '12px' : '13px',
        fontWeight: 500,
        color: 'var(--text-secondary)',
        lineHeight: 1,
      }}
    >
      <span
        className={config.pulse ? 'status-dot-pulse' : ''}
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.dotColor,
          flexShrink: 0,
        }}
      />
      <span>{label}</span>
    </span>
  );
};
