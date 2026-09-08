import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DoxoStorage } from '../../lib/storage/db';
import { Booking } from '../../types/marketplace';
import { Modal } from '../common/Modal';
import { IconAlertCircle, IconCheck } from '../common/Icons';

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSuccess?: () => void;
}

const CANCEL_REASONS = [
  'დრო აღარ მაწყობს',
  'ფასი შეიცვალა',
  'სხვა ვარიანტი ვიპოვე',
  'სხვა მიზეზი',
];

export const CancellationModal: React.FC<CancellationModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSuccess,
}) => {
  const { language } = useLanguage();
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [isCancelled, setIsCancelled] = useState(false);

  if (!isOpen || !booking) return null;

  const handleConfirm = () => {
    DoxoStorage.cancelBooking(booking.bookingId, selectedReason);
    setIsCancelled(true);
    setTimeout(() => {
      onSuccess?.();
      onClose();
      setIsCancelled(false);
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'ka' ? 'ჯავშნის გაუქმება' : 'Cancel Booking'}
      maxWidth="440px"
    >
      {isCancelled ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--status-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
            }}
          >
            <IconCheck size={26} />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>
            ჯავშანი გაუქმებულია
          </h3>
          <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>
            პროვაიდერი ინფორმირებულია. გაუქმების საკომისიო არ დაგრიცხვიათ.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              padding: '10px 14px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '13.5px', fontWeight: 700 }}>{booking.serviceTitleKa}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              სპეციალისტი: {booking.providerNameKa} · დრო: {booking.scheduledStart}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
              რატომ აუქმებ?
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {CANCEL_REASONS.map(reason => (
                <label
                  key={reason}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: selectedReason === reason ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                    border: selectedReason === reason ? '1.5px solid var(--status-danger)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: selectedReason === reason ? 600 : 400,
                  }}
                >
                  <input
                    type="radio"
                    name="cancel_reason"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    style={{ accentColor: 'var(--status-danger)' }}
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cancellation Policy Note */}
          <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            ✓ <strong>გაუქმების პოლიტიკა:</strong> ვიზიტამდე 2 საათით ადრე გაუქმება სრულიად უფასოა და არ აკისრებს ჯარიმას.
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '10px' }}
            >
              უკან დაბრუნება
            </button>
            <button
              onClick={handleConfirm}
              className="btn btn-primary"
              style={{ flex: 1.5, padding: '10px', background: 'var(--status-danger)' }}
            >
              გაუქმების დადასტურება
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
