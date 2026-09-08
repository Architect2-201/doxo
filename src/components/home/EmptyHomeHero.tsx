import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DOXOOrb } from '../common/DOXOOrb';
import { IconSparkles, IconCheck } from '../common/Icons';

export interface EmptyHomeHeroProps {
  onTriggerPrompt: (prompt: string) => void;
}

export const EmptyHomeHero: React.FC<EmptyHomeHeroProps> = ({ onTriggerPrompt }) => {
  const { language } = useLanguage();
  const isKa = language === 'ka';

  const quickStarters = [
    {
      labelKa: 'ხვალ საღამოს ბინის დალაგება და მანქანის გარეცხვა',
      labelEn: 'Tomorrow evening home cleaning & car wash',
    },
    {
      labelKa: 'კონდიციონერის შემოწმება და ფილტრების წმენდა',
      labelEn: 'AC inspection and filter cleaning',
    },
    {
      labelKa: 'აბაზანაში ონკანი ჟონავს და სანტექნიკოსი მჭირდება',
      labelEn: 'Sink leak in bathroom, need plumber',
    },
  ];

  return (
    <div
      style={{
        background: 'var(--surface-primary)',
        borderRadius: 'var(--radius-xl)',
        padding: '36px 24px',
        textAlign: 'center',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '20px 0',
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <DOXOOrb size="md" state="idle" />
      </div>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(16, 185, 129, 0.08)',
          color: 'var(--color-success)',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 600,
          marginBottom: '12px',
        }}
      >
        <IconCheck size={14} />
        <span>{isKa ? 'დღეს ყველაფერი მშვიდადაა' : 'Everything is calm today'}</span>
      </div>

      <h2
        style={{
          fontSize: 'clamp(22px, 3.5vw, 30px)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 8px',
        }}
      >
        {isKa ? 'რა მოვაგვაროთ?' : 'What can we handle?'}
      </h2>

      <p
        style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          maxWidth: '440px',
          margin: '0 auto 24px',
          lineHeight: 1.5,
        }}
      >
        {isKa
          ? 'დაწერე ნებისმიერი საქმე ბუნებრივი ენით და DOXO იპოვის საუკეთესო შემსრულებლებს.'
          : 'Tell DOXO what you need and we will find and coordinate verified specialists.'}
      </p>

      {/* Suggested Quick Starts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '420px' }}>
        {quickStarters.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onTriggerPrompt(isKa ? item.labelKa : item.labelEn)}
            className="btn-secondary"
            style={{
              padding: '10px 14px',
              fontSize: '12.5px',
              fontWeight: 500,
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <span>{isKa ? item.labelKa : item.labelEn}</span>
            <IconSparkles size={13} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginLeft: '8px' }} />
          </button>
        ))}
      </div>
    </div>
  );
};
