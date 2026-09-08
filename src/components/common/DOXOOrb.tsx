import React from 'react';
import { IconCheck } from './Icons';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'searching' | 'executing' | 'completed';

interface DOXOOrbProps {
  state?: OrbState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
}

export const DOXOOrb: React.FC<DOXOOrbProps> = ({
  state = 'idle',
  size = 'md',
  onClick,
  className = '',
}) => {
  return (
    <div
      className={`doxo-orb-container doxo-orb-${state} ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      title={`DOXO AI: ${state}`}
    >
      <div className={`doxo-orb doxo-orb-${size}`}>
        {/* Executing Ring */}
        {state === 'executing' && <span className="doxo-orb-ring" />}

        {/* Minimal Organic Core */}
        <div className="doxo-orb-core">
          {state === 'completed' ? (
            <IconCheck size={size === 'sm' ? 12 : size === 'lg' ? 22 : size === 'xl' ? 32 : 16} />
          ) : null}
        </div>
      </div>
    </div>
  );
};
