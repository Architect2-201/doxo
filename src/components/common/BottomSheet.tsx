import React, { useEffect } from 'react';
import { IconX } from './Icons';
import { IconButton } from './IconButton';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(23, 24, 28, 0.4)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Sheet Surface */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--bg-surface)',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          borderBottom: 'none',
          boxShadow: 'var(--shadow-modal)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.28s var(--ease-doxo)',
          zIndex: 2,
        }}
      >
        {/* Drag Pill Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 6px' }}>
          <div
            style={{
              width: '36px',
              height: '4px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--border-medium)',
            }}
          />
        </div>

        {/* Header */}
        {title && (
          <div
            style={{
              padding: '12px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {title}
            </h3>
            <IconButton aria-label="Close" size="sm" variant="ghost" onClick={onClose}>
              <IconX size={16} />
            </IconButton>
          </div>
        )}

        {/* Body Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
};
