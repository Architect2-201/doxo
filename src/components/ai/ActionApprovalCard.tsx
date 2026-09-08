import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Provider } from '../../types/provider';
import { IconShieldCheck, IconClock, IconMapPin, IconCheck, IconX, IconLock } from '../common/Icons';

export interface ActionApprovalCardProps {
  titleKa: string;
  titleEn?: string;
  provider: Provider;
  scheduledTime: string;
  location: string;
  price: number;
  currency?: string;
  cancellationPolicyKa?: string;
  onApprove: () => void;
  onModify: () => void;
  isLoading?: boolean;
}

export const ActionApprovalCard: React.FC<ActionApprovalCardProps> = ({
  titleKa,
  titleEn,
  provider,
  scheduledTime,
  location,
  price,
  currency = '₾',
  cancellationPolicyKa = 'უფასო გაუქმება ვიზიტამდე 2 საათით ადრე',
  onApprove,
  onModify,
  isLoading = false,
}) => {
  const { language } = useLanguage();
  const isKa = language === 'ka';

  return (
    <div
      style={{
        background: 'var(--surface-primary)',
        border: '1px solid var(--accent-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        boxShadow: '0 8px 24px -4px rgba(98, 91, 255, 0.12)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Accent Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              animation: 'pulse 2s infinite',
            }}
          />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--accent-primary)',
            }}
          >
            {isKa ? 'დაჯავშნამდე საჭიროა დადასტურება' : 'Approval required before booking'}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: 'var(--text-tertiary)',
          }}
        >
          <IconLock size={12} />
          <span>{isKa ? 'უსაფრთხო ნაბიჯი' : 'Secure step'}</span>
        </div>
      </div>

      {/* Main Task Info */}
      <div style={{ marginBottom: '16px' }}>
        <h3
          style={{
            fontSize: '17px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 4px 0',
          }}
        >
          {isKa ? titleKa : titleEn || titleKa}
        </h3>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {isKa ? 'შემსრულებელი:' : 'Provider:'}{' '}
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {isKa ? provider.nameKa || provider.name : provider.name}
          </span>
          <span style={{ marginLeft: '6px', color: '#F59E0B', fontSize: '12.5px' }}>
            ★ {provider.rating}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div
        style={{
          background: 'var(--surface-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          marginBottom: '16px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <IconClock size={15} />
            <span>{isKa ? 'დრო:' : 'Time:'}</span>
          </div>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{scheduledTime}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
            <IconMapPin size={15} />
            <span>{isKa ? 'მისამართი:' : 'Location:'}</span>
          </div>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{location}</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '14px',
            paddingTop: '6px',
            borderTop: '1px dashed var(--border-subtle)',
            marginTop: '2px',
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {isKa ? 'სრული ღირებულება:' : 'Total Cost:'}
          </span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-primary)' }}>
            {price} {currency}
          </span>
        </div>
      </div>

      {/* Transparency Note */}
      <div
        style={{
          fontSize: '11.5px',
          color: 'var(--text-tertiary)',
          lineHeight: 1.4,
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <IconShieldCheck size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
        <span>{isKa ? cancellationPolicyKa : 'Free cancellation up to 2 hours before scheduled visit.'}</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onApprove}
          disabled={isLoading}
          className="btn-primary"
          style={{
            flex: 1,
            height: '44px',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {isLoading ? (
            <span>{isKa ? 'მუშავდება...' : 'Processing...'}</span>
          ) : (
            <>
              <IconCheck size={16} />
              <span>{isKa ? 'დადასტურება' : 'Confirm'}</span>
            </>
          )}
        </button>

        <button
          onClick={onModify}
          disabled={isLoading}
          className="btn-secondary"
          style={{
            height: '44px',
            padding: '0 18px',
            fontSize: '13.5px',
            fontWeight: 500,
          }}
        >
          {isKa ? 'შეცვლა' : 'Change'}
        </button>
      </div>
    </div>
  );
};
