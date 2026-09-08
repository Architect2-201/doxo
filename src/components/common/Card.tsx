import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'normal' | 'large';
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  borderStyle?: 'subtle' | 'accent' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  size = 'normal',
  hoverable = false,
  padding = 'md',
  borderStyle = 'subtle',
  className = '',
  style,
  ...props
}) => {
  const getRadius = () => {
    return size === 'large' ? 'var(--radius-lg)' : 'var(--radius-card)'; // 24px vs 18px
  };

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return '0';
      case 'sm':
        return '14px 16px';
      case 'lg':
        return '24px 28px';
      case 'md':
      default:
        return '18px 22px';
    }
  };

  const getBorder = () => {
    switch (borderStyle) {
      case 'accent':
        return '1px solid var(--accent-primary)';
      case 'none':
        return 'none';
      case 'subtle':
      default:
        return '1px solid var(--border-subtle)';
    }
  };

  return (
    <div
      className={`doxo-card ${hoverable ? 'card-hoverable' : ''} ${className}`}
      style={{
        borderRadius: getRadius(),
        padding: getPadding(),
        border: getBorder(),
        backgroundColor: 'var(--bg-surface)',
        boxShadow: 'var(--shadow-xs)',
        transition: 'transform var(--duration-fast) var(--ease-doxo), box-shadow var(--duration-fast) var(--ease-doxo)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
