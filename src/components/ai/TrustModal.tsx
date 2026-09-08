import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { IconShieldCheck, IconCheck, IconX, IconLock } from '../common/Icons';

interface TrustModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrustModal: React.FC<TrustModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  if (!isOpen) return null;

  const isKa = language === 'ka';

  const steps = [
    {
      num: '1',
      titleKa: 'DOXO იგებს შენს საჭიროებას',
      titleEn: 'DOXO understands your need',
      descKa: 'ბუნებრივი ენით დაწერილი მოთხოვნიდან განსაზღვრავს კატეგორიას, ლოკაციას, დროს და დეტალებს.',
      descEn: 'Understands service category, location, timing, and nuances directly from natural requests.',
    },
    {
      num: '2',
      titleKa: 'DOXO პოულობს საუკეთესო ვარიანტებს',
      titleEn: 'DOXO finds verified options',
      descKa: 'ამოწმებს შემოწმებული სპეციალისტების ხელმისაწვდომობას, ფასებს და რეალურ რეიტინგს.',
      descEn: 'Scans verified providers, live availability, realistic pricing, and genuine track records.',
    },
    {
      num: '3',
      titleKa: 'შენ ამტკიცებ გადაწყვეტილებას',
      titleEn: 'You approve the decision',
      descKa: 'სანამ რაიმე დაიჯავშნება ან გადაიხდება, იღებ სრულ, გამჭვირვალე ინფორმაციას და ადასტურებ.',
      descEn: 'Before anything is booked or paid, you receive complete details and explicitly approve.',
    },
    {
      num: '4',
      titleKa: 'DOXO ასრულებს და აკონტროლებს',
      titleEn: 'DOXO executes and tracks',
      descKa: 'მართავს კომუნიკაციას, აკონტროლებს შესრულების ეტაპებს და გაწვდის რეალურ სტატუსს.',
      descEn: 'Coordinates execution, tracks each milestone, and provides transparent status updates.',
    },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px', padding: '28px 24px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(98, 91, 255, 0.1)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconShieldCheck size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {isKa ? 'როგორ მუშაობს DOXO' : 'How DOXO Works'}
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                {isKa ? 'გამჭვირვალობისა და უსაფრთხოების გარანტია' : 'Transparency & Safety Guarantee'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="icon-button"
            style={{ width: '32px', height: '32px', borderRadius: '8px' }}
            aria-label="Close"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Safety Callout */}
        <div
          style={{
            background: 'var(--surface-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '20px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <div style={{ color: 'var(--accent-primary)', marginTop: '2px' }}>
            <IconLock size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {isKa ? 'თანხის ჩამოჭრისა და შეუქცევადი ქმედებების პოლიტიკა' : 'Financial & Irreversible Action Policy'}
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {isKa
                ? 'DOXO არასდროს ხარჯავს შენს თანხას და არასდროს იღებს შეუქცევად გადაწყვეტილებას შენი პირდაპირი თანხმობის გარეშე. ყოველი ჯავშანი მოითხოვს წინასწარ დამტკიცებას.'
                : 'DOXO never spends your money or makes irreversible decisions without your explicit prior approval.'}
            </div>
          </div>
        </div>

        {/* 4 Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          {steps.map((step) => (
            <div
              key={step.num}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-primary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: 'var(--accent-primary)',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {step.num}
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {isKa ? step.titleKa : step.titleEn}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.45 }}>
                  {isKa ? step.descKa : step.descEn}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Button */}
        <button
          onClick={onClose}
          className="btn-primary"
          style={{ width: '100%', height: '44px', fontSize: '14px', fontWeight: 600 }}
        >
          {isKa ? 'გასაგებია' : 'Understood'}
        </button>
      </div>
    </div>
  );
};
