import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface PermissionGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
  featureDescription?: string;
  onRequestAccess?: () => void;
}

export const PermissionGateModal: React.FC<PermissionGateModalProps> = ({
  isOpen,
  onClose,
  featureTitle = 'ფუნქცია შეზღუდულია',
  featureDescription = 'ამ ფუნქციის გამოსაყენებლად საჭიროა ადმინისტრატორის მიერ თქვენი პროფილის ვერიფიკაცია და შესაბამისი უფლების მინიჭება.',
  onRequestAccess,
}) => {
  const [requested, setRequested] = React.useState(false);

  const handleRequest = () => {
    setRequested(true);
    if (onRequestAccess) {
      onRequestAccess();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔒 წვდომის შეზღუდვა">
      <div style={{ textAlign: 'center', padding: '12px 4px 20px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'rgba(234, 179, 8, 0.12)',
            border: '1px solid rgba(234, 179, 8, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            margin: '0 auto 16px',
          }}
        >
          🛡️
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
          {featureTitle}
        </h3>

        <p
          style={{
            fontSize: '0.92rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
            marginBottom: '20px',
            maxWidth: '420px',
            margin: '0 auto 20px',
          }}
        >
          {featureDescription}
        </p>

        <div
          style={{
            background: 'var(--surface-sunken)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '14px 16px',
            textAlign: 'left',
            marginBottom: '24px',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: 'var(--color-warning)' }}>
            <span style={{ fontSize: '1rem' }}>⏳</span>
            <strong style={{ color: 'var(--text-primary)' }}>ვერიფიკაციის პროცედურა</strong>
          </div>
          უსაფრთხოების მიზნით, DOXO-ს ყველა ახალი მომხმარებელი გადის ადმინისტრატორის გადამოწმებას. ადმინისტრატორი განიხილავს თქვენს ანგარიშს და გაგიაქტიურებთ შესაბამის მოდულებს.
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <Button variant="secondary" onClick={onClose}>
            დახურვა
          </Button>
          <Button
            variant="primary"
            onClick={handleRequest}
            disabled={requested}
          >
            {requested ? '✓ მოთხოვნა გაგზავნილია' : '📨 მოთხოვნის გაგზავნა ადმინს'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
