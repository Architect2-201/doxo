import React from 'react';
import { DOXOOrb } from './DOXOOrb';
import { IconCheck, IconX } from './Icons';

export interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'error';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
}) => {
  return (
    <div
      className="doxo-toast animate-fade-in"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 300,
        backgroundColor: 'var(--bg-surface)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-btn)',
        boxShadow: 'var(--shadow-md)',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '380px',
      }}
    >
      {type === 'success' ? (
        <span
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'var(--status-success-bg)',
            color: 'var(--status-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconCheck size={12} />
        </span>
      ) : type === 'error' ? (
        <span
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'var(--status-danger-bg)',
            color: 'var(--status-danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconX size={12} />
        </span>
      ) : (
        <DOXOOrb size="sm" state="idle" />
      )}

      <span style={{ fontSize: '14px', fontWeight: 500, flex: 1 }}>
        {message}
      </span>

      {onClose && (
        <button
          onClick={onClose}
          style={{
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px',
          }}
          aria-label="Close toast"
        >
          <IconX size={14} />
        </button>
      )}
    </div>
  );
};
