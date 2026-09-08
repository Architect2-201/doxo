import React, { useState, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DOXOOrb, OrbState } from '../common/DOXOOrb';
import { IconMic, IconCamera, IconSend, IconX } from '../common/Icons';

interface AIHeroInputProps {
  onSubmit: (text: string, media?: { type: 'photo' | 'voice'; url?: string }) => void;
  isAnalyzing: boolean;
}

export const AIHeroInput: React.FC<AIHeroInputProps> = ({ onSubmit, isAnalyzing }) => {
  const { language, t } = useLanguage();
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachedMedia, setAttachedMedia] = useState<{ name: string; url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Determine Orb State
  const orbState: OrbState = isAnalyzing
    ? 'thinking'
    : isListening
    ? 'listening'
    : prompt.length > 0
    ? 'executing'
    : isFocused
    ? 'listening'
    : 'idle';

  const handleTextSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!prompt.trim() && !attachedMedia) || isAnalyzing) return;
    
    const submitText = prompt.trim() || (attachedMedia ? 'გთხოვთ ამ ფოტოს მიხედვით გააანალიზოთ დავალება' : '');
    onSubmit(submitText, attachedMedia ? { type: 'photo', url: attachedMedia.url } : undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    setIsListening(true);
    setTimeout(() => {
      const sample = language === 'ka'
        ? 'აბაზანაში წყალი ჟონავს და დღეს მინდა ხელოსანი'
        : 'Bathroom sink is leaking and I need a plumber today';
      setPrompt(sample);
      setIsListening(false);
      if (textareaRef.current) textareaRef.current.focus();
    }, 1500);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachedMedia({
      name: file.name,
      url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80',
    });

    if (!prompt) {
      setPrompt(
        language === 'ka'
          ? 'აბაზანის ნიჟარის ქვეშ მილიდან წყალი ჟონავს (ფოტო მიმაგრებულია)'
          : 'Water is leaking under the bathroom sink (photo attached)'
      );
    }
  };

  const chips = [
    {
      id: 'home',
      label: t.chipHome,
      query: language === 'ka'
        ? 'ხვალ საღამოს ბინის დალაგება და კონდიციონერის შემოწმება მინდა'
        : 'Tomorrow evening apartment cleaning and AC check',
    },
    {
      id: 'auto',
      label: t.chipAuto,
      query: language === 'ka'
        ? 'მანქანის ადგილზე რეცხვა და დიაგნოსტიკა მინდა'
        : 'Need mobile car wash and quick diagnostic',
    },
    {
      id: 'cleaning',
      label: t.chipCleaning,
      query: language === 'ka'
        ? 'ხვალ დილით ბინის გენერალური დალაგება მინდა'
        : 'Need full apartment cleaning tomorrow morning',
    },
    {
      id: 'errand',
      label: t.chipErrand,
      query: language === 'ka'
        ? 'საბუთებია სასწრაფოდ გადასატანი ვაკიდან საბურთალოზე'
        : 'Urgent documents need to be delivered from Vake to Saburtalo',
    },
    {
      id: 'other',
      label: t.chipOther,
      query: language === 'ka'
        ? 'აბაზანაში წყალი ჟონავს და დღეს მინდა სანტექნიკოსი'
        : 'Bathroom sink is leaking and I need a plumber today',
    },
  ];

  return (
    <section aria-label="DOXO AI Command Center" style={{ marginBottom: '24px', width: '100%' }}>
      {/* Visual Center Header: Headline + Subtext */}
      <div style={{ marginBottom: '16px' }}>
        <h2
          style={{
            fontSize: 'clamp(24px, 3.5vw, 32px)',
            lineHeight: 'clamp(30px, 4vw, 38px)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
            letterSpacing: '-0.015em',
          }}
        >
          {t.heroPrompt}
        </h2>
        <p
          style={{
            fontSize: '15px',
            lineHeight: '22px',
            color: 'var(--text-secondary)',
            margin: '6px 0 0',
          }}
        >
          {t.heroSubPrompt}
        </p>
      </div>

      {/* AI Command Center Input Container (24px radius, spacious, clear) */}
      <div
        className={`ai-hero-card ${isFocused ? 'focused' : ''}`}
        style={{
          minHeight: '144px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRadius: 'var(--radius-input)',
          padding: '16px 20px',
        }}
      >
        {/* Top area inside input: Subtle Orb + Textarea */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{ paddingTop: '2px', flexShrink: 0 }}>
            <DOXOOrb size="md" state={orbState} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <textarea
              ref={textareaRef}
              className="ai-hero-textarea"
              placeholder={t.heroPlaceholder}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              disabled={isAnalyzing}
              rows={2}
              style={{
                width: '100%',
                minHeight: '64px',
                fontSize: '15.5px',
                lineHeight: 1.5,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                resize: 'none',
                outline: 'none',
              }}
            />

            {/* Attached media tag */}
            {attachedMedia && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--status-info-bg)',
                  border: '1px solid rgba(76, 141, 255, 0.25)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '3px 10px',
                  fontSize: '12px',
                  color: 'var(--status-info-text)',
                  marginTop: '4px',
                }}
              >
                <IconCamera size={13} />
                <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {attachedMedia.name}
                </span>
                <button
                  type="button"
                  onClick={() => setAttachedMedia(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--status-info-text)', cursor: 'pointer', padding: 0 }}
                  aria-label="Remove media"
                >
                  <IconX size={13} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Toolbar inside input card */}
        <div className="ai-hero-toolbar">
          <div className="ai-input-media-actions">
            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={toggleVoice}
              className="btn-icon"
              title={isListening ? (language === 'ka' ? 'გისმენ...' : 'Listening...') : (language === 'ka' ? 'ხმოვანი შეყვანა' : 'Voice input')}
              aria-label="Voice input"
              style={{
                color: isListening ? '#FFFFFF' : 'var(--text-secondary)',
                backgroundColor: isListening ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
                borderColor: isListening ? 'var(--accent-primary)' : 'var(--border-subtle)',
              }}
            >
              <IconMic size={17} />
            </button>

            {/* Photo Attachment Button */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handlePhotoUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-icon"
              title={language === 'ka' ? 'ფოტოს ატვირთვა' : 'Attach photo'}
              aria-label="Attach photo"
              style={{ background: 'var(--bg-surface-elevated)' }}
            >
              <IconCamera size={17} />
            </button>

            <span className="hide-mobile" style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '4px' }}>
              {isListening
                ? (language === 'ka' ? 'გისმენთ...' : 'Listening...')
                : (language === 'ka' ? 'Enter-ით გაგზავნა' : 'Press Enter')}
            </span>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={() => handleTextSubmit()}
            disabled={(!prompt.trim() && !attachedMedia) || isAnalyzing}
            className="btn btn-primary"
            style={{
              padding: '8px 20px',
              height: '38px',
              borderRadius: 'var(--radius-btn)',
              opacity: (!prompt.trim() && !attachedMedia) || isAnalyzing ? 0.5 : 1,
            }}
          >
            <span>{t.ctaHandleIt}</span>
            <IconSend size={15} />
          </button>
        </div>
      </div>

      {/* 5 Focused Quick Action Chips (horizontal scroll on mobile only) */}
      <div className="chip-group" role="group" aria-label="Quick action chips">
        {chips.map(chip => (
          <button
            key={chip.id}
            type="button"
            className="chip"
            onClick={() => {
              setPrompt(chip.query);
              if (textareaRef.current) {
                textareaRef.current.focus();
              }
            }}
          >
            <span>{chip.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
};
