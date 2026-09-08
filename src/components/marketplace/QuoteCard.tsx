import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Quote } from '../../types/marketplace';
import { IconCheck, IconClock, IconMessageSquare, IconShieldCheck, IconX } from '../common/Icons';

interface QuoteCardProps {
  quote: Quote;
  onAccept: (quote: Quote) => void;
  onDecline: (quote: Quote) => void;
  onChat: (quote: Quote) => void;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  onAccept,
  onDecline,
  onChat,
}) => {
  const { language } = useLanguage();

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        border: '1.5px solid var(--accent-primary)',
        background: 'var(--bg-surface)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={quote.providerAvatarUrl}
            alt={quote.providerNameKa}
            style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {quote.providerNameKa}
              </span>
              <span style={{ color: 'var(--status-info)', display: 'flex' }}>
                <IconShieldCheck size={14} />
              </span>
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              ოფიციალური შეთავაზება
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-primary)' }}>
            {quote.price} ₾
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {quote.pricingModel === 'fixed' ? 'ფიქსირებული' : 'ინდივიდუალური'}
          </span>
        </div>
      </div>

      {/* Service Details */}
      <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>სამუშაო:</div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
          {quote.serviceTitleKa}
        </div>
        {quote.notesKa && (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            "{quote.notesKa}"
          </p>
        )}
      </div>

      {/* Meta timings */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <IconClock size={13} /> მოსალოდნელი დრო: <strong>{quote.expectedDurationHours} სთ</strong>
        </span>
        <span>შემოთავაზება მოქმედებს: <strong>{quote.expiresAt}</strong></span>
      </div>

      {/* Actions */}
      {quote.status === 'pending' ? (
        <div style={{ display: 'flex', gap: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => onDecline(quote)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '8px 12px' }}
          >
            <IconX size={14} />
            <span>უარი</span>
          </button>
          <button
            onClick={() => onChat(quote)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '8px 12px' }}
          >
            <IconMessageSquare size={14} />
            <span>კითხვა</span>
          </button>
          <button
            onClick={() => onAccept(quote)}
            className="btn btn-primary btn-sm"
            style={{ flex: 1, padding: '8px 16px' }}
          >
            <IconCheck size={14} />
            <span>მიღება</span>
          </button>
        </div>
      ) : (
        <div style={{ padding: '8px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '12.5px', fontWeight: 600 }}>
          {quote.status === 'accepted' ? '✓ შეთავაზება მიღებულია' : 'უარყოფილია'}
        </div>
      )}
    </div>
  );
};
