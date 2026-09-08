import React from 'react';
import { DecisionOption } from '../../types/decision';
import { IconStar, IconCheck, IconClock, IconSparkles } from '../common/Icons';

interface ComparisonTableProps {
  options: DecisionOption[];
  selectedOptionId: string;
  onSelectOption: (optionId: string) => void;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  options,
  selectedOptionId,
  onSelectOption,
}) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
        ვარიანტების შედარება (Side-by-Side Comparison)
      </div>

      {/* Grid: 3 columns on desktop / tablet, stacked on small mobile */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px',
        }}
      >
        {options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          return (
            <div
              key={option.id}
              onClick={() => onSelectOption(option.id)}
              style={{
                position: 'relative',
                backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.05)' : 'var(--bg-secondary)',
                border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Badges: Best Value or Top Match */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                {option.isBestValue ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      color: '#ffffff',
                      backgroundColor: 'var(--accent-primary)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    <IconSparkles size={11} /> BEST VALUE
                  </span>
                ) : (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ვარიანტი</span>
                )}

                {/* Radio selection visual */}
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: isSelected ? '5px solid var(--accent-primary)' : '2px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-primary)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Title & Rating */}
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {option.titleKa}
                </h4>

                {option.rating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--status-warning)' }}>
                      <IconStar size={13} />
                    </span>
                    <span style={{ fontWeight: 600 }}>{option.rating}</span>
                    {option.reviewCount && <span style={{ color: 'var(--text-muted)' }}>({option.reviewCount})</span>}
                    {option.reliabilityScore && (
                      <span style={{ fontSize: '11px', color: 'var(--status-success)', marginLeft: '6px' }}>
                        · {option.reliabilityScore}% საიმედოობა
                      </span>
                    )}
                  </div>
                )}

                {/* Price */}
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {option.priceFormatted}
                </div>

                {/* Availability */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-primary)', marginBottom: '12px' }}>
                  <IconClock size={13} />
                  <span>{option.availableTimeKa}</span>
                </div>

                {/* Included items */}
                {option.includedServicesKa && option.includedServicesKa.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      შედის:
                    </div>
                    {option.includedServicesKa.map((inc, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                        <span style={{ color: 'var(--status-success)' }}><IconCheck size={11} /></span>
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Warranty */}
                {option.warrantyKa && (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '10px' }}>
                    🛡️ {option.warrantyKa}
                  </div>
                )}
              </div>

              {/* Selection Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectOption(option.id);
                }}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: isSelected ? '#ffffff' : 'var(--text-primary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {isSelected ? '✓ არჩეულია' : 'ამ ვარიანტის არჩევა'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
