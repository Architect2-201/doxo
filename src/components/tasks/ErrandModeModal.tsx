import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { IconPackage, IconPlus, IconX, IconCheck, IconMapPin, IconClock } from '../common/Icons';

interface StopPoint {
  id: string;
  type: 'pickup' | 'delivery';
  address: string;
  itemDescription: string;
}

interface ErrandModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmErrand: (title: string, stops: StopPoint[]) => void;
}

export const ErrandModeModal: React.FC<ErrandModeModalProps> = ({
  isOpen,
  onClose,
  onConfirmErrand,
}) => {
  const { language } = useLanguage();

  const [stops, setStops] = useState<StopPoint[]>([
    { id: '1', type: 'pickup', address: 'აფთიაქი PSP, ვაჟა-ფშაველას 16', itemDescription: 'მედიკამენტები' },
    { id: '2', type: 'pickup', address: 'სუპერმარკეტი აგროჰაბი', itemDescription: 'საჭმელი და პროდუქტები' },
    { id: '3', type: 'delivery', address: 'ი. ჭავჭავაძის გამზ. 37, ვაკე', itemDescription: 'სახლში მიტანა' },
  ]);

  const [newAddress, setNewAddress] = useState('');
  const [newItem, setNewItem] = useState('');

  const handleAddStop = () => {
    if (!newAddress.trim() || !newItem.trim()) return;
    const newStop: StopPoint = {
      id: String(Date.now()),
      type: 'pickup',
      address: newAddress.trim(),
      itemDescription: newItem.trim(),
    };
    // Insert before final delivery
    setStops(prev => [newStop, ...prev]);
    setNewAddress('');
    setNewItem('');
  };

  const handleRemoveStop = (id: string) => {
    setStops(prev => prev.filter(s => s.id !== id));
  };

  const handleExecute = () => {
    const title = language === 'ka' ? 'კომბინირებული საკურიერო დავალება (Errand Mode)' : 'Multi-stop Errand Route';
    onConfirmErrand(title, stops);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div className="sheet-grab-handle" />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#A5B4FC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconPackage size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {language === 'ka' ? 'DOXO Errand Mode' : 'DOXO Errand Mode'}
              </h3>
              <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                {language === 'ka' ? 'რამდენიმე წერტილიდან მოტანის ოპტიმიზებული მარშრუტი' : 'Multi-stop pickup & delivery workflow'}
              </span>
            </div>
          </div>

          <button onClick={onClose} className="btn-ghost" style={{ padding: '4px' }}>
            <IconX size={18} />
          </button>
        </div>

        {/* Explanation */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            marginBottom: '18px',
            fontSize: '12.5px',
            color: 'var(--text-secondary)',
            lineHeight: 1.45,
          }}
        >
          {language === 'ka'
            ? 'მიუთითეთ რა ნივთებია ასაღები და სად. DOXO დააჯგუფებს მარშრუტს და კურიერს ერთიან დავალებად გადასცემს.'
            : 'Specify what to pick up and where. DOXO coordinates the stops into a single optimized run.'}
        </div>

        {/* Stops List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
          {stops.map((stop, idx) => (
            <div
              key={stop.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: stop.type === 'delivery' ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-surface-elevated)',
                border: '1px solid',
                borderColor: stop.type === 'delivery' ? 'rgba(34, 197, 94, 0.25)' : 'var(--border-subtle)',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: stop.type === 'delivery' ? '#22C55E' : 'var(--accent-primary)',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {stop.type === 'delivery' ? '✓' : idx + 1}
                </span>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {stop.itemDescription}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IconMapPin size={12} />
                    <span>{stop.address}</span>
                  </div>
                </div>
              </div>

              {stop.type !== 'delivery' && (
                <button
                  onClick={() => handleRemoveStop(stop.id)}
                  className="btn-ghost"
                  style={{ padding: '4px', color: 'var(--text-muted)' }}
                >
                  <IconX size={15} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add New Stop Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder={language === 'ka' ? 'რა ნივთია? (მაგ: ყავა)...' : 'Item description...'}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <input
            type="text"
            placeholder={language === 'ka' ? 'მისამართი / ლოკაცია...' : 'Address / location...'}
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button
            onClick={handleAddStop}
            disabled={!newAddress.trim() || !newItem.trim()}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0 12px' }}
          >
            <IconPlus size={16} />
          </button>
        </div>

        {/* Summary & Action */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {language === 'ka' ? 'სავარაუდო ტარიფი' : 'Estimated Fare'}
            </span>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              35–50 ₾ (3 წერტილი)
            </div>
          </div>

          <button onClick={handleExecute} className="btn btn-primary">
            <IconCheck size={16} />
            <span>{language === 'ka' ? 'დავალების შექმნა' : 'Confirm Errand'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
