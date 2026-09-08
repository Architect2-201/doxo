import React from 'react';

export interface DOXOLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showWordmark?: boolean;
  showSubtitle?: boolean;
  variant?: 'squircle' | 'emblem' | 'square';
  className?: string;
  onClick?: () => void;
}

export const DOXOLogo: React.FC<DOXOLogoProps> = ({
  size = 'md',
  showWordmark = true,
  showSubtitle = false,
  variant = 'squircle',
  className = '',
  onClick,
}) => {
  // Dimensions for the exact neon logo
  const getSymbolSize = () => {
    switch (size) {
      case 'sm':
        return 38;
      case 'lg':
        return 58;
      case 'xl':
        return 76;
      case 'hero':
        return 112;
      case 'md':
      default:
        return 46;
    }
  };

  const getWordmarkSize = () => {
    switch (size) {
      case 'sm':
        return '18px';
      case 'lg':
        return '28px';
      case 'xl':
        return '36px';
      case 'hero':
        return '52px';
      case 'md':
      default:
        return '22px';
    }
  };

  const getSubtitleSize = () => {
    switch (size) {
      case 'sm':
        return '10px';
      case 'lg':
      case 'xl':
        return '13px';
      case 'hero':
        return '16px';
      case 'md':
      default:
        return '11.5px';
    }
  };

  const symbolDim = getSymbolSize();
  const wordmarkFontSize = getWordmarkSize();
  const subtitleFontSize = getSubtitleSize();

  // Pick the asset path
  // doxo-icon-trans.png is the exact squircle icon with soft neon outer transparency
  const imageSrc = variant === 'emblem' 
    ? '/doxo-emblem-trans.png'
    : '/doxo-icon-trans.png';

  return (
    <div
      className={`doxo-neon-brand ${className}`}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'sm' ? '11px' : size === 'hero' ? '22px' : '14px',
        userSelect: 'none',
        cursor: onClick ? 'pointer' : 'default',
        textDecoration: 'none',
      }}
    >
      {/* 
        ========================================================================
        EXACT DOXO NEON LOGO
        Renders the user's exact uploaded 3D artwork with dynamic neon treatment:
        1. Multi-layered electric cyan + purple atmospheric neon aura
        2. Breathing glow pulse and drop-shadows
        3. High-res crisp rendering with smooth responsive scaling
        ========================================================================
      */}
      <div
        className="doxo-neon-symbol-container"
        style={{
          width: `${symbolDim}px`,
          height: `${symbolDim}px`,
        }}
      >
        {/* Living atmospheric ambient neon aura */}
        <div className="doxo-neon-aura" />

        {/* Exact Logo Artwork */}
        <img
          src={imageSrc}
          alt="DOXO Logo"
          className="doxo-neon-img"
          draggable={false}
          loading="eager"
        />
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Main DOXO Title */}
          <span
            className="doxo-neon-wordmark"
            style={{
              fontSize: wordmarkFontSize,
            }}
          >
            DOXO
          </span>
        </div>
      )}
    </div>
  );
};
