import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'subtle' | 'ghost' | 'accent';
  'aria-label': string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  size = 'md',
  variant = 'default',
  'aria-label': ariaLabel,
  className = '',
  style,
  disabled,
  ...props
}) => {
  const getDimension = () => {
    switch (size) {
      case 'sm':
        return 32;
      case 'lg':
        return 44;
      case 'md':
      default:
        return 38;
    }
  };

  const dim = getDimension();

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'accent':
        return {
          backgroundColor: 'var(--accent-light)',
          color: 'var(--accent-primary)',
          border: '1px solid var(--accent-border)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid transparent',
        };
      case 'subtle':
        return {
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-secondary)',
          border: '1px solid transparent',
        };
      case 'default':
      default:
        return {
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xs)',
        };
    }
  };

  return (
    <button
      className={`doxo-icon-btn ${className}`}
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={disabled}
      style={{
        width: `${dim}px`,
        height: `${dim}px`,
        borderRadius: 'var(--radius-btn)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all var(--duration-fast) var(--ease-doxo)',
        flexShrink: 0,
        userSelect: 'none',
        ...getVariantStyles(),
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
};
