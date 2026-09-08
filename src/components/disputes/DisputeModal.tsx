import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DoxoStorage } from '../../lib/storage/db';
import { Booking, Dispute } from '../../types/marketplace';
import { Modal } from '../common/Modal';
import { IconAlertCircle, IconCheck, IconShieldCheck } from '../common/Icons';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSuccess?: () => void;
}

const DISPUTE_REASONS: { id: Dispute['reason']; titleKa: string }[] = [
  { id: 'not_completed', titleKa: 'სამუშაო არ შესრულდა' },
  { id: 'quality_mismatch', titleKa: 'ხარისხი არ შეესაბამება შეთანხმებას' },
  { id: 'price_discrepancy', titleKa: 'ფასი განსხვავებულია შეთანხმებულისგან' },
  { id: 'no_show', titleKa: 'პროვაიდერი არ მოვიდა' },
  { id: 'other', titleKa: 'სხვა მიზეზი' },
];

export const DisputeModal: React.FC<DisputeModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSuccess,
}) => {
  const { language } = useLanguage();
  const [selectedReason, setSelectedReason] = useState<Dispute['reason']>('quality_mismatch');
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !booking) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const reasonObj = DISPUTE_REASONS.find(r => r.id === selectedReason);

    DoxoStorage.createDispute({
      bookingId: booking.bookingId,
      userId: booking.userId,
      userName: 'ნუკრი ჩაჩავა',
      providerId: booking.providerId,
      providerName: booking.providerNameKa,
      reason: selectedReason,
      reasonKa: reasonObj ? reasonObj.titleKa : 'სხვა მიზეზი',
      description: description.trim(),
    });

    // Also update booking status to disputed
    DoxoStorage.updateBookingStatus(
      booking.bookingId,
      'disputed',
      undefined,
      `დაფიქსირდა პრობლემა: ${reasonObj?.titleKa}`
    );

    setIsSubmitted(true);
    setTimeout(() => {
      onSuccess?.();
      onClose();
      setIsSubmitted(false);
      setDescription('');
    }, 1500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'ka' ? 'პრობლემის დაფიქსირება' : 'Report an Issue'}
      maxWidth="480px"
    >
      {isSubmitted ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--status-success-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <IconCheck size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            მოთხოვნა მიღებულია
          </h3>
          <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>
            სტატუსი: <strong>განხილვის პროცესშია</strong>. DOXO მხარდაჭერის გუნდი შეისწავლის შემთხვევას და დაგიკავშირდებათ.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              padding: '10px 14px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {booking.serviceTitleKa}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              სპეციალისტი: {booking.providerNameKa} · თანხა: {booking.price} ₾
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
              რა სახის პრობლემა შეიქმნა? *
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {DISPUTE_REASONS.map(r => (
                <label
                  key={r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: selectedReason === r.id ? 'var(--accent-light)' : 'transparent',
                    border: selectedReason === r.id ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: selectedReason === r.id ? 600 : 400,
                  }}
                >
                  <input
                    type="radio"
                    name="dispute_reason"
                    checked={selectedReason === r.id}
                    onChange={() => setSelectedReason(r.id)}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <span>{r.titleKa}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
              დეტალური აღწერა *
            </label>
            <textarea
              className="input"
              rows={3}
              placeholder="გთხოვთ აღწეროთ რა მოხდა..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ width: '100%', resize: 'none' }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '10px' }}
            >
              გაუქმება
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2, padding: '10px', background: 'var(--status-danger)' }}
              disabled={!description.trim()}
            >
              გაგზავნა
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
