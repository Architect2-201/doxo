import React from 'react';
import { DOXOOrb } from './DOXOOrb';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const getPadding = () => {
    switch (size) {
      case 'sm':
        return '7px 14px';
      case 'lg':
        return '13px 24px';
      case 'md':
      default:
        return '10px 18px';
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return '13.5px';
      case 'lg':
        return '16px';
      case 'md':
      default:
        return '14.5px';
    }
  };

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--accent-primary)',
          color: '#FFFFFF',
          border: '1px solid transparent',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid transparent',
        };
      case 'danger':
        return {
          backgroundColor: 'var(--status-danger-bg)',
          color: 'var(--status-danger-text)',
          border: '1px solid rgba(217, 87, 87, 0.25)',
        };
      case 'secondary':
      default:
        return {
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xs)',
        };
    }
  };

  return (
    <button
      className={`doxo-btn doxo-btn-${variant} doxo-btn-${size} ${className}`}
      disabled={disabled || isLoading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: 'var(--radius-btn)',
        padding: getPadding(),
        fontSize: getFontSize(),
        fontWeight: 600,
        lineHeight: 1.2,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all var(--duration-fast) var(--ease-doxo)',
        userSelect: 'none',
        ...getVariantStyles(),
        ...style,
      }}
      {...props}
    >
      {isLoading ? (
        <DOXOOrb size="sm" state="thinking" />
      ) : (
        <>
          {leftIcon && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
