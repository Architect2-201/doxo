import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Provider } from '../../types/provider';
import { AIService } from '../../lib/ai/aiService';
import {
  IconStar,
  IconShieldCheck,
  IconClock,
  IconChevronDown,
  IconChevronUp,
  IconCheck,
  IconSparkles,
} from '../common/Icons';

export interface ProviderComparisonCardProps {
  providers: Provider[];
  onSelect: (provider: Provider) => void;
  userDistrict?: string;
}

export const ProviderComparisonCard: React.FC<ProviderComparisonCardProps> = ({
  providers,
  onSelect,
  userDistrict = 'ვაკე',
}) => {
  const { language } = useLanguage();
  const isKa = language === 'ka';

  const [expandedWhyId, setExpandedWhyId] = useState<string | null>(providers[0]?.id || null);

  if (providers.length === 0) return null;

  const topProvider = providers[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* Header Prompt / Recommendation intro */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 2px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              background: 'rgba(98, 91, 255, 0.12)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconSparkles size={13} />
          </span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {isKa
              ? `ვიპოვე ${providers.length} ვარიანტი. მე პირველს გირჩევ:`
              : `Found ${providers.length} options. I recommend the top match:`}
          </span>
        </div>
      </div>

      {/* Provider List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {providers.map((p, index) => {
          const isTop = index === 0;
          const isExpanded = expandedWhyId === p.id;
          const matchPercent = p.matchScore || (isTop ? 96 : index === 1 ? 91 : 88);
          const whyRationale = AIService.getWhyThisExplanation(p, userDistrict);

          return (
            <div
              key={p.id}
              style={{
                background: 'var(--surface-primary)',
                border: isTop ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                position: 'relative',
                boxShadow: isTop ? '0 4px 16px -2px rgba(98, 91, 255, 0.08)' : 'none',
              }}
            >
              {isTop && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '16px',
                    background: 'var(--accent-primary)',
                    color: '#fff',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '2px 8px',
                    borderRadius: '10px',
                  }}
                >
                  {isKa ? 'საუკეთესო არჩევანი' : 'Top Choice'}
                </div>
              )}

              {/* Main Card Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                {/* Left: Avatar & Info */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img
                    src={p.avatarUrl}
                    alt={p.name}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--surface-primary)',
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {isKa ? p.nameKa || p.name : p.name}
                      </span>
                      {p.verificationBadge && (
                        <IconShieldCheck size={14} style={{ color: 'var(--color-success)' }} />
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12.5px', color: '#F59E0B', fontWeight: 600 }}>
                        <IconStar size={13} fill="#F59E0B" />
                        <span>{p.rating}</span>
                      </div>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>•</span>
                      <span
                        style={{
                          fontSize: '11.5px',
                          color: isTop ? 'var(--accent-primary)' : 'var(--text-secondary)',
                          fontWeight: 600,
                        }}
                      >
                        {isKa ? `მაღალი შესაბამისობა · ${matchPercent}%` : `${matchPercent}% Match`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Pricing & CTA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {p.pricing.min}–{p.pricing.max} ₾
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {p.estimatedArrivalMinutes ? `~${p.estimatedArrivalMinutes} წთ-ში` : 'დღეს'}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelect(p)}
                    className={isTop ? 'btn-primary' : 'btn-secondary'}
                    style={{
                      height: '36px',
                      padding: '0 14px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {isKa ? 'არჩევა' : 'Select'}
                  </button>
                </div>
              </div>

              {/* "რატომ ეს?" Accordion Button */}
              <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                <button
                  onClick={() => setExpandedWhyId(isExpanded ? null : p.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px 0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--accent-primary)',
                  }}
                >
                  <span>{isKa ? 'რატომ ეს სპეციალისტი?' : 'Why this specialist?'}</span>
                  {isExpanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                </button>

                {/* Expandable Rationale Bullets */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: '8px',
                      background: 'var(--surface-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {(isKa ? whyRationale.bulletsKa : whyRationale.bulletsEn).map((bullet, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IconCheck size={13} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
