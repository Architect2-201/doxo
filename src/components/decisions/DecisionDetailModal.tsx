import React, { useState } from 'react';
import { DecisionItem, DecisionPriorityPreference } from '../../types/decision';
import { DecisionEngine } from '../../lib/decisions/decisionEngine';
import { WhyThis } from './WhyThis';
import { TradeoffView } from './TradeoffView';
import { ComparisonTable } from './ComparisonTable';
import { PriceBreakdown } from './PriceBreakdown';
import { PriceInsight } from './PriceInsight';
import { ConflictAlert } from './ConflictAlert';
import { ChangeSummary } from './ChangeSummary';
import { DecisionSnapshot } from './DecisionSnapshot';
import { DocumentDecisionSupport } from './DocumentDecisionSupport';
import { IconCheck, IconSliders } from '../common/Icons';

interface DecisionDetailModalProps {
  decision: DecisionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDecisionResolved: (decisionId: string, selectedOptionId: string) => void;
}

export const DecisionDetailModal: React.FC<DecisionDetailModalProps> = ({
  decision,
  isOpen,
  onClose,
  onDecisionResolved,
}) => {
  if (!isOpen || !decision) return null;

  const [currentDecision, setCurrentDecision] = useState<DecisionItem>(decision);
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    decision.doxoRecommendation.recommendedOptionId || decision.options[0]?.id || ''
  );
  const [preference, setPreference] = useState<DecisionPriorityPreference>('quality');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Preference slider/buttons change
  const handlePreferenceChange = (pref: DecisionPriorityPreference) => {
    setPreference(pref);
    const recalculated = DecisionEngine.applyPreference(currentDecision, pref);
    setCurrentDecision(recalculated);
    if (recalculated.doxoRecommendation.recommendedOptionId) {
      setSelectedOptionId(recalculated.doxoRecommendation.recommendedOptionId);
    }
  };

  // Explicit user confirmation
  const handleConfirmChoice = () => {
    setIsConfirming(true);
    setTimeout(() => {
      DecisionEngine.resolveDecision(currentDecision.id, selectedOptionId);
      setIsConfirming(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onDecisionResolved(currentDecision.id, selectedOptionId);
        onClose();
      }, 900);
    }, 400);
  };

  const selectedOption = currentDecision.options.find(o => o.id === selectedOptionId) || currentDecision.options[0];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          animation: 'scaleUp 0.25s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-secondary)',
          }}
        >
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              DOXO DECISION CENTER
            </span>
            <h2 style={{ margin: '2px 0 0', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentDecision.titleKa}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* 1. Decision Snapshot Summary */}
          <DecisionSnapshot decision={currentDecision} />

          {/* 2. Schedule Conflict Alert (if applicable) */}
          {currentDecision.conflictDetails && (
            <ConflictAlert
              conflict={currentDecision.conflictDetails}
              selectedOptionId={selectedOptionId}
              onSelectSuggestion={(optId) => setSelectedOptionId(optId)}
            />
          )}

          {/* 3. Expiration / Missing Info Warning (if applicable) */}
          <ChangeSummary
            change={currentDecision.changeDetails}
            missingInformation={currentDecision.missingInformationKa}
          />

          {/* 4. Document Fact Extraction (if applicable) */}
          <DocumentDecisionSupport fact={currentDecision.documentFacts} />

          {/* 5. Preference Selector Slider (Section 9) */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconSliders size={16} />
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                რა არის შენთვის მთავარი?
              </span>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {(['price', 'time', 'quality'] as DecisionPriorityPreference[]).map((prefKey) => {
                const labels = {
                  price: 'ფასი (Price)',
                  time: 'დრო (Time)',
                  quality: 'ხარისხი (Quality)',
                };
                const active = preference === prefKey;
                return (
                  <button
                    key={prefKey}
                    type="button"
                    onClick={() => handlePreferenceChange(prefKey)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: active ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                      color: active ? '#ffffff' : 'var(--text-secondary)',
                      fontSize: '11.5px',
                      fontWeight: active ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {labels[prefKey]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Why This Progressive Explanation (Section 6) */}
          <WhyThis recommendation={currentDecision.doxoRecommendation} />

          {/* 7. Comparison Table / Cards (Section 3) */}
          <ComparisonTable
            options={currentDecision.options}
            selectedOptionId={selectedOptionId}
            onSelectOption={(optId) => setSelectedOptionId(optId)}
          />

          {/* 8. Trade-off View (Section 7) */}
          <TradeoffView
            options={currentDecision.options}
            tradeoffs={currentDecision.tradeoffs}
          />

          {/* 9. Price Breakdown & Market Context (Section 4 & 5) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {currentDecision.priceBreakdown && (
              <PriceBreakdown
                items={currentDecision.priceBreakdown.items}
                total={currentDecision.priceBreakdown.total}
                totalFormatted={currentDecision.priceBreakdown.totalFormatted}
              />
            )}
            {currentDecision.priceInsight && (
              <PriceInsight insight={currentDecision.priceInsight} />
            )}
          </div>
        </div>

        {/* Footer: Explicit Human Action Bar (Section 22 & 23) */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>შერჩეული ვარიანტი:</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {selectedOption?.titleKa} · <span style={{ color: 'var(--accent-primary)' }}>{selectedOption?.priceFormatted}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              გაუქმება
            </button>

            <button
              type="button"
              disabled={isConfirming || isSuccess}
              onClick={handleConfirmChoice}
              style={{
                padding: '9px 22px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: isSuccess ? 'var(--status-success)' : 'var(--accent-primary)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s ease',
              }}
            >
              {isSuccess ? (
                <>
                  <IconCheck size={16} /> დადასტურებულია!
                </>
              ) : isConfirming ? (
                'მუშავდება...'
              ) : (
                'არჩევანის დადასტურება (Confirm)'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
