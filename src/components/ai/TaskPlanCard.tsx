import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { StructuredPlan, PlanSubItem } from '../../types/ai';
import { IconClock, IconCheck, IconSparkles, IconLayers, IconArrowRight } from '../common/Icons';

export interface TaskPlanCardProps {
  plan: StructuredPlan;
  onViewVariants: () => void;
  onConfirmPlan: () => void;
  onEditItem?: (item: PlanSubItem) => void;
}

export const TaskPlanCard: React.FC<TaskPlanCardProps> = ({
  plan,
  onViewVariants,
  onConfirmPlan,
  onEditItem,
}) => {
  const { language } = useLanguage();
  const isKa = language === 'ka';

  const itemsCount = plan.items.length;
  const uniqueProvidersCount = new Set(plan.items.map(i => i.providerCandidate?.id || i.category)).size;

  return (
    <div
      style={{
        background: 'var(--surface-primary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--accent-primary)',
              marginBottom: '4px',
            }}
          >
            <IconSparkles size={12} />
            <span>{isKa ? 'შედგენილი გეგმა' : 'Structured Plan'}</span>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {isKa ? `${plan.targetDate}სთვის ${itemsCount} საქმეა:` : `${itemsCount} tasks for ${plan.targetDate}:`}
          </h3>
        </div>

        {/* Grouped badge */}
        {plan.canBundle && (
          <div
            style={{
              background: 'rgba(98, 91, 255, 0.08)',
              color: 'var(--accent-primary)',
              borderRadius: '20px',
              padding: '4px 10px',
              fontSize: '11.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <IconLayers size={13} />
            <span>{isKa ? '1 ჯგუფირებული ვიზიტი' : '1 Bundled Visit'}</span>
          </div>
        )}
      </div>

      {/* Task Plan Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {plan.items.map((item, index) => (
          <div
            key={item.id}
            style={{
              background: 'var(--surface-secondary)',
              border: item.isUpdated ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              transition: 'all 0.3s ease',
              animation: item.isUpdated ? 'highlightPulse 1.5s ease' : 'none',
              position: 'relative',
            }}
          >
            {/* Left info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'var(--surface-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {index + 1}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {isKa ? item.titleKa : item.titleEn}
                  </span>
                  {item.isUpdated && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        background: 'var(--accent-primary)',
                        color: '#fff',
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {isKa ? 'განახლებულია' : 'Updated'}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    marginTop: '2px',
                  }}
                >
                  <IconClock size={13} />
                  <span>{item.timeWindow}</span>
                  {item.providerCandidate && (
                    <>
                      <span>•</span>
                      <span>{isKa ? item.providerCandidate.nameKa || item.providerCandidate.name : item.providerCandidate.name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right price */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                ~{item.estimatedPrice.min}–{item.estimatedPrice.max} {item.estimatedPrice.currency}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grouping & Savings Note */}
      {plan.canBundle && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12.5px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
            <IconCheck size={16} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {isKa ? 'შემიძლია ყველაფერი ერთ ვიზიტად დავაჯგუფო' : 'Can bundle into 1 coordinated visit'}
            </span>
          </div>
          <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
            {isKa ? `დაზოგვა: ${plan.bundleSavingsMinutes} წთ` : `Saved: ${plan.bundleSavingsMinutes} min`}
          </span>
        </div>
      )}

      {/* Plan Summary Section (Section 13) */}
      <div
        style={{
          background: 'var(--surface-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '12px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{isKa ? 'საქმეები:' : 'Tasks:'}</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {itemsCount} {isKa ? 'საქმე' : 'tasks'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{isKa ? 'სპეციალისტები:' : 'Providers:'}</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {uniqueProvidersCount} {isKa ? 'პროვაიდერი' : 'providers'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{isKa ? 'ვიზიტები:' : 'Visits:'}</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
            1 {isKa ? 'ვიზიტი' : 'visit'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{isKa ? 'ჯამური ფასი:' : 'Est. Price:'}</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-primary)' }}>
            {plan.totalPriceRange.min}–{plan.totalPriceRange.max} {plan.totalPriceRange.currency}
          </div>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
        <button
          onClick={onConfirmPlan}
          className="btn-primary"
          style={{
            flex: 1,
            height: '42px',
            fontSize: '13.5px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <span>{isKa ? 'დაგეგმვა' : 'Schedule All'}</span>
          <IconArrowRight size={15} />
        </button>

        <button
          onClick={onViewVariants}
          className="btn-secondary"
          style={{
            height: '42px',
            padding: '0 16px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          {isKa ? 'ვარიანტების ნახვა' : 'View Options'}
        </button>
      </div>
    </div>
  );
};
