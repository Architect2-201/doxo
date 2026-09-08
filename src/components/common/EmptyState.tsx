import React from 'react';
import { DOXOOrb } from './DOXOOrb';
import { Button } from './Button';

export interface EmptyStateProps {
  type?: 'tasks' | 'inbox' | 'error' | 'custom';
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  lang?: 'ka' | 'en';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'tasks',
  title,
  subtitle,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  lang = 'ka',
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'inbox':
        return {
          title: lang === 'ka' ? 'აქ შეგიძლია ყველაფერი მომწერო.' : 'You can share anything with me here.',
          subtitle: lang === 'ka' ? 'ტექსტი, ხმოვანი ჩანაწერი ან ფოტო — DOXO გააანალიზებს.' : 'Text, voice note, or photo — DOXO will organize it.',
          orbState: 'idle' as const,
        };
      case 'error':
        return {
          title: lang === 'ka' ? 'ამჯერად ვერ მოვახერხე.' : "Couldn't complete this right now.",
          subtitle: lang === 'ka' ? 'შეგიძლია თავიდან სცადო ან სხვა ვარიანტი შევარჩიოთ.' : 'You can try again or we can explore another option.',
          orbState: 'thinking' as const,
        };
      case 'tasks':
      default:
        return {
          title: lang === 'ka' ? 'ჯერ არაფერი გაქვს მოსაგვარებელი.' : 'Nothing to handle right now.',
          subtitle: lang === 'ka' ? 'როცა რამე გამოჩნდება, აქ დაგხვდება.' : "When something comes up, you'll find it here.",
          orbState: 'idle' as const,
        };
    }
  };

  const defaults = getDefaultContent();
  const displayTitle = title || defaults.title;
  const displaySubtitle = subtitle || defaults.subtitle;

  return (
    <div
      className="doxo-empty-state"
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <DOXOOrb size="md" state={defaults.orbState} />
      </div>

      <h4
        style={{
          fontSize: '17px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '6px',
        }}
      >
        {displayTitle}
      </h4>

      {displaySubtitle && (
        <p
          className="body-sm"
          style={{
            maxWidth: '380px',
            margin: '0 auto',
            color: 'var(--text-secondary)',
          }}
        >
          {displaySubtitle}
        </p>
      )}

      {(onAction || onSecondaryAction || type === 'error') && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {type === 'error' && !onAction ? (
            <>
              <Button variant="primary" size="sm" onClick={onAction}>
                {lang === 'ka' ? 'თავიდან სცადე' : 'Try again'}
              </Button>
              <Button variant="secondary" size="sm" onClick={onSecondaryAction}>
                {lang === 'ka' ? 'სხვა ვარიანტი ვნახოთ' : 'See another option'}
              </Button>
            </>
          ) : (
            <>
              {actionLabel && onAction && (
                <Button variant="primary" size="sm" onClick={onAction}>
                  {actionLabel}
                </Button>
              )}
              {secondaryActionLabel && onSecondaryAction && (
                <Button variant="secondary" size="sm" onClick={onSecondaryAction}>
                  {secondaryActionLabel}
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
