import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DOXOOrb } from '../common/DOXOOrb';
import { IconCheck } from '../common/Icons';

interface AIProcessTimelineProps {
  onComplete: () => void;
}

export const AIProcessTimeline: React.FC<AIProcessTimelineProps> = ({ onComplete }) => {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 0,
      textKa: 'მოთხოვნა გავიგე',
      textEn: 'Request understood',
    },
    {
      id: 1,
      textKa: 'შესაბამის სერვისებს ვამოწმებ',
      textEn: 'Checking relevant verified services',
    },
    {
      id: 2,
      textKa: 'საუკეთესო ვარიანტებს ვადარებ...',
      textEn: 'Comparing and ranking best options...',
    },
  ];

  useEffect(() => {
    const t1 = setTimeout(() => setCurrentStep(1), 600);
    const t2 = setTimeout(() => setCurrentStep(2), 1400);
    const t3 = setTimeout(() => {
      setCurrentStep(3);
      onComplete();
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div
      className="card animate-fade-in"
      style={{
        marginBottom: '28px',
        padding: '24px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      {/* Header: Short, Confident "მივხედავ." */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
        <DOXOOrb size="md" state={currentStep >= 3 ? 'completed' : 'thinking'} />
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {language === 'ka' ? 'მივხედავ.' : "I'll handle this."}
          </h3>
          <p className="metadata-text" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
            {language === 'ka' ? 'DOXO არჩევს ოპტიმალურ გადაწყვეტას' : 'DOXO is identifying the optimal solution'}
          </p>
        </div>
      </div>

      {/* Sequential Progress Lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '4px' }}>
        {steps.map((step, idx) => {
          const isDone = currentStep > idx;
          const isCurrent = currentStep === idx;
          const isUpcoming = currentStep < idx;

          return (
            <div
              key={step.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                opacity: isUpcoming ? 0.35 : 1,
                transition: 'opacity 0.25s ease',
              }}
            >
              {/* Status node */}
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isDone
                    ? 'var(--status-success-bg)'
                    : isCurrent
                    ? 'var(--accent-light)'
                    : 'var(--bg-secondary)',
                  color: isDone ? 'var(--status-success)' : 'var(--accent-primary)',
                  flexShrink: 0,
                }}
              >
                {isDone ? (
                  <IconCheck size={12} />
                ) : isCurrent ? (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-primary)',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--text-muted)',
                    }}
                  />
                )}
              </div>

              <span
                style={{
                  fontSize: '15px',
                  fontWeight: isCurrent ? 600 : 500,
                  color: isCurrent ? 'var(--text-primary)' : isDone ? 'var(--text-secondary)' : 'var(--text-muted)',
                }}
              >
                {language === 'ka' ? step.textKa : step.textEn}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
