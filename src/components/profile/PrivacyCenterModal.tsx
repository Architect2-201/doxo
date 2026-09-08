import React, { useState } from 'react';
import { PrivacyService } from '../../lib/privacy/privacyService';
import { useLanguage } from '../../context/LanguageContext';

interface PrivacyCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyCenterModal: React.FC<PrivacyCenterModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [memoryEnabled, setMemoryEnabled] = useState(PrivacyService.isAIMemoryActive());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  const handleToggleMemory = () => {
    const next = !memoryEnabled;
    setMemoryEnabled(next);
    PrivacyService.setAIMemoryActive(next);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '580px', width: '92%', maxHeight: '88vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              {language === 'ka' ? 'კონფიდენციალურობა და მონაცემები' : 'Privacy & Data Center'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              {language === 'ka' ? 'აკონტროლეთ რა ახსოვს DOXO-ს თქვენს შესახებ' : 'Manage what DOXO remembers and stores about you'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* 1. AI Memory Section */}
        <div style={{ background: 'var(--surface-sunken)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {language === 'ka' ? 'DOXO AI მეხსიერება' : 'DOXO AI Memory'}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {language === 'ka'
                  ? 'იმახსოვრებს თქვენს ჩვევებს, უპირატესობებს და რჩეულ სპეციალისტებს'
                  : 'Remembers your preferences, habits, and favorite specialists'}
              </div>
            </div>
            <button
              onClick={handleToggleMemory}
              style={{
                background: memoryEnabled ? 'var(--accent-primary)' : 'var(--border-strong)',
                color: '#fff',
                border: 'none',
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {memoryEnabled ? (language === 'ka' ? 'აქტიურია' : 'Active') : (language === 'ka' ? 'გამორთულია' : 'Disabled')}
            </button>
          </div>
          {!memoryEnabled && (
            <div style={{ fontSize: '12px', color: 'var(--warning)', marginTop: '8px' }}>
              {language === 'ka'
                ? 'გამორთვის შემთხვევაში DOXO აღარ შეინახავს ახალ პრეფერენციებს თქვენი საუბრებიდან.'
                : 'When disabled, DOXO will not learn new preferences from your requests.'}
            </div>
          )}
        </div>

        {/* 2. Location & Address Sharing */}
        <div style={{ background: 'var(--surface-sunken)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {language === 'ka' ? 'მისამართის დაცვა და ლოკაცია' : 'Address Privacy & Location'}
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            {language === 'ka'
              ? 'სპეციალისტებს თქვენი ზუსტი მისამართი ეჩვენებათ მხოლოდ მას შემდეგ, რაც ჯავშანი ოფიციალურად დადასტურდება. მანამდე ჩანს მხოლოდ უბანი (მაგ. საბურთალო).'
              : 'Specialists only see your exact street address after a booking is officially confirmed. Before that, only the neighborhood is shared.'}
          </p>
        </div>

        {/* 3. Export Data */}
        <div style={{ background: 'var(--surface-sunken)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {language === 'ka' ? 'მონაცემების ექსპორტი (JSON)' : 'Export Data (JSON)'}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {language === 'ka'
                  ? 'ჩამოტვირთეთ თქვენი ყველა დავალება, ჯავშანი და პროფილი'
                  : 'Download a complete archive of your tasks, bookings, and profile'}
              </div>
            </div>
            <button
              onClick={() => PrivacyService.exportUserData()}
              style={{
                background: 'var(--surface-base)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {language === 'ka' ? 'ჩამოტვირთვა' : 'Export'}
            </button>
          </div>
        </div>

        {/* 4. Delete Account */}
        <div style={{ border: '1px solid var(--error-subtle, #ffcccc)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--error, #e53935)' }}>
            {language === 'ka' ? 'ანგარიშის და მონაცემების წაშლა' : 'Delete Account & Clear Data'}
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 12px', lineHeight: 1.4 }}>
            {language === 'ka'
              ? 'წაიშლება ყველა თქვენი დავალება, ჯავშანი, შეტყობინება და AI მეხსიერება. მოქმედება შეუქცევადია.'
              : 'Permanently deletes all tasks, bookings, messages, and AI memory. This action is irreversible.'}
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                background: 'transparent',
                color: 'var(--error, #e53935)',
                border: '1px solid var(--error, #e53935)',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {language === 'ka' ? 'ანგარიშის წაშლა' : 'Delete Account'}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => PrivacyService.deleteAccount()}
                style={{
                  background: 'var(--error, #e53935)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {language === 'ka' ? 'დიახ, წაშალე ყველაფერი' : 'Yes, Delete Everything'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  background: 'var(--surface-sunken)',
                  color: 'var(--text-primary)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {language === 'ka' ? 'გაუქმება' : 'Cancel'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
