import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DoxoStorage } from '../../lib/storage/db';
import { Booking, ChatMessage } from '../../types/marketplace';
import { Modal } from '../common/Modal';
import {
  IconClock,
  IconMapPin,
  IconSend,
  IconShieldCheck,
  IconCheck,
} from '../common/Icons';

interface ContextualChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  currentUserRole?: 'user' | 'provider';
}

export const ContextualChatModal: React.FC<ContextualChatModalProps> = ({
  isOpen,
  onClose,
  booking,
  currentUserRole = 'user',
}) => {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (booking) {
      setMessages(DoxoStorage.getChatMessages(booking.bookingId));
    }
  }, [booking, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !booking) return null;

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const senderName = currentUserRole === 'user' ? 'ნუკრი' : booking.providerNameKa;
    const newMsg = DoxoStorage.sendChatMessage({
      bookingId: booking.bookingId,
      senderId: currentUserRole === 'user' ? booking.userId : booking.providerId,
      senderRole: currentUserRole,
      senderName,
      text: text.trim(),
    });

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
  };

  const handleQuickAction = (actionTitle: string) => {
    if (actionTitle === 'მისამართის გაგზავნა') {
      handleSendMessage(`ზუსტი მისამართია: ${booking.location}. კოდი: 124, სართული 4.`);
    } else if (actionTitle === 'დროის დაზუსტება') {
      handleSendMessage(`გამარჯობა, ვიზიტის დაწყების დრო ხომ ძალაშია (${booking.scheduledStart})?`);
    } else if (actionTitle === 'კითხვა') {
      handleSendMessage(`დამატებითი მასალები ან ინსტრუმენტები ხომ არ დამჭირდება?`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={currentUserRole === 'user' ? booking.providerNameKa : 'კლიენტთან მიმოწერა'}
      maxWidth="520px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '480px' }}>
        {/* Context Top Header Banner */}
        <div
          style={{
            padding: '10px 14px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {booking.serviceTitleKa}
            </span>
            <span className="brand-badge">{booking.price} ₾</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <IconClock size={12} style={{ color: 'var(--accent-primary)' }} />
              <span>{booking.scheduledStart}</span>
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <IconMapPin size={12} style={{ color: 'var(--accent-primary)' }} />
              <span>{booking.location}</span>
            </span>
          </div>
        </div>

        {/* Quick Action Chips */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '8px' }}>
          {['მისამართის გაგზავნა', 'დროის დაზუსტება', 'კითხვა'].map(chip => (
            <button
              key={chip}
              onClick={() => handleQuickAction(chip)}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '11.5px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              + {chip}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '8px 4px',
          }}
        >
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)', fontSize: '13px' }}>
              პირდაპირი უსაფრთხო ჩატი. მიწერე სპეციალისტს ნებისმიერი დეტალის დასაზუსტებლად.
            </div>
          ) : (
            messages.map(msg => {
              const isMe = msg.senderRole === currentUserRole;
              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '82%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                  }}
                >
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginBottom: '2px', padding: '0 4px' }}>
                    {msg.senderName}
                  </span>
                  <div
                    style={{
                      padding: '9px 13px',
                      borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      background: isMe ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: isMe ? '#FFFFFF' : 'var(--text-primary)',
                      fontSize: '13.5px',
                      lineHeight: '1.4',
                      border: isMe ? 'none' : '1px solid var(--border-subtle)',
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Box */}
        <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
          <input
            type="text"
            className="input"
            placeholder="დაწერე შეტყობინება..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            style={{ flex: 1 }}
          />
          <button
            onClick={() => handleSendMessage()}
            className="btn btn-primary"
            style={{ padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            disabled={!inputText.trim()}
          >
            <IconSend size={15} />
          </button>
        </div>
      </div>
    </Modal>
  );
};
