import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DoxoStorage } from '../../lib/storage/db';
import { Booking } from '../../types/marketplace';
import { Modal } from '../common/Modal';
import { IconClock, IconCheck, IconCalendar } from '../common/Icons';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSuccess?: () => void;
}

const AVAILABLE_SLOTS = [
  'დღეს · 20:00–21:30',
  'ხვალ · 11:00–12:30',
  'ხვალ · 15:00–16:30',
  'ხვალ · 18:30–20:00',
  'ზეგ · 12:00–13:30',
];

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSuccess,
}) => {
  const { language } = useLanguage();
  const [selectedSlot, setSelectedSlot] = useState(AVAILABLE_SLOTS[1]);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !booking) return null;

  const handleConfirm = () => {
    DoxoStorage.rescheduleBooking(booking.bookingId, selectedSlot);
    setIsSuccess(true);
    setTimeout(() => {
      onSuccess?.();
      onClose();
      setIsSuccess(false);
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'ka' ? 'ვიზიტის დროის შეცვლა' : 'Reschedule Visit'}
      maxWidth="460px"
    >
      {isSuccess ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--status-success-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
            }}
          >
            <IconCheck size={26} />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>
            დრო წარმატებით შეიცვალა
          </h3>
          <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>
            ახალი დრო: <strong>{selectedSlot}</strong>. სპეციალისტი ინფორმირებულია.
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
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>მიმდინარე დრო:</div>
            <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {booking.scheduledStart}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              სპეციალისტი: {booking.providerNameKa}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
              რომელ დროს გადავიტანოთ? (სპეციალისტის თავისუფალი ფანჯრები)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {AVAILABLE_SLOTS.map(slot => (
                <div
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: selectedSlot === slot ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    background: selectedSlot === slot ? 'var(--accent-light)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '13.5px', fontWeight: selectedSlot === slot ? 700 : 500 }}>
                    {slot}
                  </span>
                  <input
                    type="radio"
                    name="reschedule_slot"
                    checked={selectedSlot === slot}
                    readOnly
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '10px' }}
            >
              გაუქმება
            </button>
            <button
              onClick={handleConfirm}
              className="btn btn-primary"
              style={{ flex: 2, padding: '10px' }}
            >
              ახალი დროის დადასტურება
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
