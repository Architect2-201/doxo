import React, { useState } from 'react';
import { Provider } from '../../types/provider';
import { AnalyzedIntent } from '../../lib/ai/aiService';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import {
  IconShieldCheck,
  IconMapPin,
  IconClock,
  IconStar,
  IconCheck,
  IconAlertCircle,
  IconSparkles,
} from '../common/Icons';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingDetails: {
    selectedAddress: string;
    addressLabel: string;
    scheduledTime: string;
    finalPrice: number;
  }) => void;
  provider: Provider | null;
  intent: AnalyzedIntent | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  provider,
  intent,
}) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const savedAddresses = user?.preferences?.savedAddresses || [
    { id: 'addr_home', label: 'ჩემი ბინა', addressLine: 'ი. ჭავჭავაძის გამზ. 37, ვაკე', district: 'ვაკე' },
    { id: 'addr_office', label: 'ოფისი', addressLine: 'ვაჟა-ფშაველას გამზ. 71, საბურთალო', district: 'საბურთალო' },
  ];

  const [selectedAddressId, setSelectedAddressId] = useState(savedAddresses[0]?.id || 'addr_home');
  const [scheduledTime, setScheduledTime] = useState(intent?.preferredTime || 'დღეს · 18:30');
  const [isEditingTime, setIsEditingTime] = useState(false);

  if (!provider || !intent) return null;

  const currentAddress = savedAddresses.find(a => a.id === selectedAddressId) || savedAddresses[0];
  const calculatedPrice = provider.pricing.min;

  const handleConfirmClick = () => {
    onConfirm({
      selectedAddress: currentAddress.addressLine,
      addressLabel: currentAddress.label,
      scheduledTime,
      finalPrice: calculatedPrice,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'ka' ? 'დაჯავშნამდე' : 'Confirm Before Booking'}
      maxWidth="500px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>
          {language === 'ka'
            ? 'გადაამოწმე ყველა დეტალი. DOXO უზრუნველყოფს გარანტიას და უსაფრთხო ანგარიშსწორებას.'
            : 'Review booking parameters. DOXO protects your execution with escrow and insurance.'}
        </p>

        {/* 1. Service Item */}
        <div
          style={{
            padding: '12px 14px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="brand-badge">{intent.category.toUpperCase()}</span>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                {language === 'ka' ? intent.suggestedTitleKa : intent.suggestedTitleEn}
              </h4>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>სერვისი</span>
          </div>
        </div>

        {/* 2. Provider Snapshot Card */}
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            border: '1.5px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={provider.avatarUrl}
                alt={provider.name}
                style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {language === 'ka' ? provider.nameKa : provider.name}
                  </span>
                  {provider.verificationStatus === 'verified' && (
                    <span style={{ color: 'var(--status-info)', display: 'flex' }} title="ვერიფიცირებული პროფილი">
                      <IconShieldCheck size={16} />
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F59E0B', fontSize: '12px', fontWeight: 700, marginTop: '2px' }}>
                  <IconStar size={13} />
                  <span>{provider.rating.toFixed(2)}</span>
                  <span className="metadata-text">•</span>
                  <span className="metadata-text">{provider.completedJobs} საქმე</span>
                </div>
              </div>
            </div>
            <span className="brand-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-success-text)' }}>
              {provider.completionRate}% შესრულება
            </span>
          </div>

          {/* Transparent Match Reasons */}
          {provider.matchReasons && provider.matchReasons.length > 0 && (
            <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {provider.matchReasons.map((reason, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-full)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  ✓ {reason}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 3. Address Selector */}
        <div>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
            მისამართი
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {savedAddresses.map(addr => (
              <label
                key={addr.id}
                onClick={() => setSelectedAddressId(addr.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: selectedAddressId === addr.id ? 'var(--accent-light)' : 'var(--bg-surface)',
                  border: selectedAddressId === addr.id ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconMapPin size={14} style={{ color: 'var(--accent-primary)' }} />
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {addr.label}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                      {addr.addressLine}
                    </span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="booking_address"
                  checked={selectedAddressId === addr.id}
                  readOnly
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
              </label>
            ))}
          </div>
        </div>

        {/* 4. Time Window */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
              ვიზიტის დრო
            </label>
            <button
              type="button"
              onClick={() => setIsEditingTime(!isEditingTime)}
              style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
            >
              {isEditingTime ? 'შენახვა' : 'შეცვლა'}
            </button>
          </div>
          {isEditingTime ? (
            <input
              type="text"
              className="input"
              value={scheduledTime}
              onChange={e => setScheduledTime(e.target.value)}
              style={{ width: '100%' }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '13.5px', fontWeight: 600 }}>
              <IconClock size={15} style={{ color: 'var(--accent-primary)' }} />
              <span>{scheduledTime}</span>
            </div>
          )}
        </div>

        {/* 5. Pricing & Honest Payment Model */}
        <div
          style={{
            padding: '14px 16px',
            background: 'var(--accent-light)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--accent-primary)', display: 'block' }}>
                ღირებულება
              </span>
              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                {provider.pricingModel === 'fixed'
                  ? 'ფიქსირებული ტარიფი'
                  : provider.pricingModel === 'price_range'
                  ? `დიაპაზონი: ${provider.pricing.min}₾ – ${provider.pricing.max}₾`
                  : `საწყისი ფასი: ${provider.pricing.min}₾-დან`}
              </span>
            </div>
            <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-primary)' }}>
              {provider.pricing.min} ₾
            </span>
          </div>

          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(99, 102, 241, 0.15)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            🔒 <strong>გადახდის წესი:</strong> თანხა ავტორიზდება ბარათზე. ჩამოჭრა მოხდება <em>მხოლოდ სამუშაოს დასრულების შემდეგ</em>, თქვენი დადასტურებით.
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ flex: 1, padding: '12px' }}
          >
            {t.cancelButton}
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
            className="btn btn-primary"
            style={{ flex: 2, padding: '12px' }}
          >
            <IconCheck size={16} />
            <span>{t.confirmButton}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
