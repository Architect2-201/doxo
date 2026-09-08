import React from 'react';
import { DOXOOrb } from './DOXOOrb';

export interface LoadingStateProps {
  message?: string;
  lang?: 'ka' | 'en';
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  lang = 'ka',
  size = 'md',
}) => {
  const defaultMessage = lang === 'ka' ? 'მივხედავ...' : 'Handling...';

  return (
    <div
      className="doxo-loading-state"
      style={{
        padding: '36px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
      }}
    >
      <DOXOOrb size={size} state="thinking" />
      <span
        style={{
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--text-secondary)',
          letterSpacing: '-0.01em',
        }}
      >
        {message || defaultMessage}
      </span>
    </div>
  );
};
