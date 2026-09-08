import React, { useState } from 'react';
import { Provider } from '../../types/provider';
import { useLanguage } from '../../context/LanguageContext';
import { MatchScore } from '../common/MatchScore';
import { PriceIndicator } from '../common/PriceIndicator';
import { IconStar, IconClock, IconShieldCheck, IconChevronRight, IconCheck } from '../common/Icons';

interface ProviderCardProps {
  provider: Provider;
  onSelect: (provider: Provider) => void;
  isRecommended?: boolean;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onSelect,
  isRecommended = false,
}) => {
  const { language, t } = useLanguage();
  const [isExpandedWhy, setIsExpandedWhy] = useState(false);

  const dummyQuote = {
    min: provider.pricing.min,
    max: provider.pricing.max,
    currency: '₾' as const,
    marketStatus: 'normal_range' as const,
    explanationText: 'საშუალო საბაზრო ფასის შესაბამისი',
  };

  const explanationPoints = [
    { ka: `შენს უბანში მუშაობს (${provider.serviceAreas[0] || 'თბილისი'})`, en: `Operates in your neighborhood (${provider.serviceAreas[0] || 'Tbilisi'})` },
    { ka: `დღეს თავისუფალია (მოვა დაახლ. ~${provider.estimatedArrivalMinutes} წთ-ში)`, en: `Available today (arrives in ~${provider.estimatedArrivalMinutes}m)` },
    { ka: `მსგავსი საქმეების 96% წარმატებით აქვს შესრულებული (${provider.completedJobs} დასრულებული)`, en: `96% success rate on similar tasks (${provider.completedJobs} completed)` },
  ];

  return (
    <div
      className="card card-hoverable animate-fade-in"
      style={{
        borderRadius: 'var(--radius-card)',
        border: isRecommended ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        padding: '20px',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Top Header: Photo, Name, Rating, Jobs & DOXO Match */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src={provider.avatarUrl}
            alt={provider.name}
            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h4 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {language === 'ka' ? provider.nameKa : provider.name}
              </h4>
              {provider.verificationBadge === 'verified' && (
                <span title={t.verifiedBadge} style={{ color: 'var(--status-info)', display: 'flex' }}>
                  <IconShieldCheck size={16} />
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#D99428', fontSize: '13px', fontWeight: 600 }}>
                <IconStar size={13} />
                <span>{provider.rating.toFixed(2)}</span>
              </div>
              <span className="metadata-text">•</span>
              <span className="metadata-text">
                {provider.completedJobs} {language === 'ka' ? 'შესრულებული' : 'jobs'}
              </span>
            </div>
          </div>
        </div>

        {/* DOXO Match Pill */}
        <MatchScore
          score={provider.matchScore || 96}
          rationaleKa={provider.matchRationaleKa}
          rationaleEn={provider.matchRationaleEn}
          lang={language}
        />
      </div>

      {/* "რატომ ეს?" Toggle Button */}
      <div style={{ marginTop: '14px' }}>
        <button
          type="button"
          onClick={() => setIsExpandedWhy(!isExpandedWhy)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13.5px',
            fontWeight: 600,
            color: 'var(--accent-primary)',
            padding: '4px 0',
          }}
        >
          <span>{language === 'ka' ? 'რატომ ეს?' : 'Why this specialist?'}</span>
          <IconChevronRight
            size={14}
            style={{
              transform: isExpandedWhy ? 'rotate(90deg)' : 'none',
              transition: 'transform var(--duration-fast) var(--ease-doxo)',
            }}
          />
        </button>

        {/* Expanded Explanation Points (Essential for AI Trust) */}
        {isExpandedWhy && (
          <div
            className="animate-fade-in"
            style={{
              marginTop: '8px',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {explanationPoints.map((pt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <IconCheck size={13} style={{ color: 'var(--status-success)', flexShrink: 0 }} />
                <span>{language === 'ka' ? pt.ka : pt.en}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Bar: Price Range, Availability & Book CTA */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {provider.pricing.min}₾ – {provider.pricing.max}₾
            </span>
            <PriceIndicator quote={dummyQuote} lang={language} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', color: 'var(--text-secondary)', fontSize: '12.5px' }}>
            <IconClock size={12} />
            <span>
              {language === 'ka' ? `მოვა ~${provider.estimatedArrivalMinutes} წუთში` : `Arrives in ~${provider.estimatedArrivalMinutes}m`}
            </span>
          </div>
        </div>

        {/* Recommendation CTA */}
        <button
          onClick={() => onSelect(provider)}
          className="btn btn-primary"
          style={{
            padding: '9px 18px',
            fontSize: '14px',
            borderRadius: 'var(--radius-btn)',
            backgroundColor: 'var(--accent-primary)',
          }}
        >
          <span>{language === 'ka' ? 'დავჯავშნო?' : 'Book'}</span>
        </button>
      </div>
    </div>
  );
};
