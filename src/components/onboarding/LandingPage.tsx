import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { DOXOLogo } from '../common/DOXOLogo';
import { DOXOOrb } from '../common/DOXOOrb';
import { DoxoAntiGravityOrb } from '../common/DoxoAntiGravityOrb';
import { IconSparkles, IconArrowRight, IconCheck, IconShieldCheck, IconClock, IconStar } from '../common/Icons';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { language, t } = useLanguage();
  const { openAuthModal } = useAuth();
  const [demoStep, setDemoStep] = useState<'input' | 'processing' | 'transformed'>('input');

  const handleSimulateTransform = () => {
    setDemoStep('processing');
    setTimeout(() => {
      setDemoStep('transformed');
    }, 1200);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto', padding: '16px 20px 64px' }}>
      {/* Top Navbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 0 32px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '36px',
        }}
      >
        <DOXOLogo size="md" showWordmark={true} showSubtitle={true} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => openAuthModal('signin')}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '13.5px', fontWeight: 600 }}
          >
            {language === 'ka' ? 'შესვლა' : 'Sign In'}
          </button>
          <button
            onClick={() => openAuthModal('signup')}
            className="btn btn-primary btn-sm"
            style={{
              fontSize: '13.5px',
              fontWeight: 600,
              padding: '6px 16px',
            }}
          >
            {language === 'ka' ? 'რეგისტრაცია' : 'Sign Up'}
          </button>
        </div>
      </div>
      {/* Brand & Hero */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', marginBottom: '16px' }}>
          <DoxoAntiGravityOrb
            size="xl"
            state={demoStep === 'processing' ? 'processing' : demoStep === 'transformed' ? 'completed' : 'idle'}
          />
        </div>

        <h1 className="hero-title" style={{ fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: '14px', lineHeight: 1.15 }}>
          {language === 'ka' ? (
            <>
              შენ თქვი რა გჭირდება.<br />
              დანარჩენს <span style={{ color: 'var(--accent-primary)' }}>DOXO</span> მიხედავს.
            </>
          ) : (
            <>
              Tell DOXO what you need.<br />
              <span style={{ color: 'var(--accent-primary)' }}>DOXO gets it done.</span>
            </>
          )}
        </h1>

        <p className="body-text" style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto 28px', color: 'var(--text-secondary)' }}>
          {language === 'ka'
            ? 'AI, რომელიც ყოველდღიურ საქმეებს შენ მაგივრად აგვარებს.'
            : 'AI that handles your everyday chores and tasks for you.'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button onClick={onGetStarted} className="btn btn-primary btn-lg" style={{ padding: '14px 32px' }}>
            <span>{t.ctaGetStarted}</span>
            <IconArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Interactive Transformation Showcase Demo */}
      <div
        className="card"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '56px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="brand-badge">{language === 'ka' ? 'ინტერაქტიული დემო' : 'Interactive Demo'}</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
              {language === 'ka' ? 'როგორ გარდაქმნის DOXO თქვენს თხოვნას' : 'How DOXO transforms messy requests'}
            </span>
          </div>

          <button
            onClick={() => setDemoStep('input')}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '12.5px' }}
          >
            {language === 'ka' ? 'თავიდან ჩვენება' : 'Reset'}
          </button>
        </div>

        {/* The Natural Language Messy Input */}
        <div
          style={{
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-card)',
            padding: '18px 22px',
            marginBottom: '18px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span className="metadata-text" style={{ color: 'var(--text-muted)' }}>
            {language === 'ka' ? 'მომხმარებლის მოთხოვნა:' : 'User request:'}
          </span>
          <div style={{ fontSize: '16.5px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
            "{language === 'ka' ? 'ხვალ ბინის დალაგება მინდა და კონდიციონერიც შესამოწმებელია.' : 'I want apartment cleaning tomorrow and the air conditioner needs checking.'}"
          </div>
        </div>

        {demoStep === 'input' && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <button
              onClick={handleSimulateTransform}
              className="btn btn-primary"
              style={{ padding: '12px 28px', borderRadius: 'var(--radius-btn)' }}
            >
              <IconSparkles size={16} />
              <span>{language === 'ka' ? 'ნახე როგორ გარდაქმნის DOXO გეგმად' : 'See how DOXO handles it'}</span>
            </button>
          </div>
        )}

        {demoStep === 'processing' && (
          <div style={{ textAlign: 'center', padding: '28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <DOXOOrb size="md" state="thinking" />
            <span style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--accent-primary)' }}>
              {language === 'ka' ? 'მივხედავ. ვქმნი 2 დავალებას...' : "I'll handle this. Structuring 2 tasks..."}
            </span>
          </div>
        )}

        {demoStep === 'transformed' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', color: 'var(--status-success)', fontSize: '13.5px', fontWeight: 600 }}>
              <IconCheck size={16} />
              <span>{language === 'ka' ? 'შედეგი: 2 ორგანიზებული დავალება' : 'Result: 2 organized tasks'}</span>
            </div>

            {/* Exactly 2 tasks transformed per spec */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '18px' }}>
              {/* Task 1: Cleaning / Tomorrow */}
              <div style={{ background: 'var(--bg-primary)', padding: '16px 18px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)' }}>
                <span className="brand-badge" style={{ marginBottom: '6px' }}>
                  {language === 'ka' ? 'დასუფთავება' : 'Cleaning'}
                </span>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {language === 'ka' ? 'ბინის გენერალური დალაგება' : 'Apartment Cleaning'}
                </div>
                <div className="metadata-text" style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
                  {language === 'ka' ? 'ხვალ · 10:00' : 'Tomorrow · 10:00'}
                </div>
              </div>

              {/* Task 2: AC Service / Tomorrow */}
              <div style={{ background: 'var(--bg-primary)', padding: '16px 18px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)' }}>
                <span className="brand-badge" style={{ marginBottom: '6px' }}>
                  {language === 'ka' ? 'კონდიციონერი' : 'AC Service'}
                </span>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {language === 'ka' ? 'კონდიციონერის შემოწმება & წმენდა' : 'AC Service & Inspection'}
                </div>
                <div className="metadata-text" style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
                  {language === 'ka' ? 'ხვალ · 14:30' : 'Tomorrow · 14:30'}
                </div>
              </div>
            </div>

            {/* Signature Time Saved banner */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--accent-light)',
                border: '1px solid var(--accent-border)',
                padding: '14px 20px',
                borderRadius: 'var(--radius-card)',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <span className="metadata-text" style={{ color: 'var(--accent-primary)', fontWeight: 600, textTransform: 'uppercase' }}>
                  {language === 'ka' ? 'დაზოგილი დრო' : 'Time Saved'}
                </span>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {language === 'ka' ? 'დაახლოებით 3სთ 20წთ დაგიზოგე.' : 'Saved you approx 3h 20m.'}
                </div>
              </div>

              <button onClick={onGetStarted} className="btn btn-primary btn-sm">
                <span>{language === 'ka' ? 'დაიწყე DOXO-სთან' : 'Start with DOXO'}</span>
                <IconArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3 Core Value Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div className="card">
          <div style={{ color: 'var(--accent-primary)', marginBottom: '10px' }}><IconSparkles size={24} /></div>
          <h4 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>
            {language === 'ka' ? 'არავითარი ძიება' : 'No More Searching'}
          </h4>
          <p className="body-sm">
            {language === 'ka'
              ? 'არ გჭირდება ათობით კატეგორიაში ქექვა და ხელოსნებზე რეკვა. DOXO იგებს რა გჭირდება და თავად აგვარებს.'
              : 'Never dig through endless service listings. Just describe your problem and DOXO matches and schedules the best option.'}
          </p>
        </div>

        <div className="card">
          <div style={{ color: 'var(--accent-primary)', marginBottom: '10px' }}><IconShieldCheck size={24} /></div>
          <h4 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>
            {language === 'ka' ? 'შენ აკონტროლებ' : 'Human in the Loop'}
          </h4>
          <p className="body-sm">
            {language === 'ka'
              ? 'DOXO გეგმავს ავტონომიურად, მაგრამ თანხის გადახდა ან დაჯავშნა ხდება მხოლოდ შენი დადასტურების შემდეგ.'
              : 'DOXO plans autonomously, but never spends money or finalizes bookings without your clear confirmation.'}
          </p>
        </div>

        <div className="card">
          <div style={{ color: 'var(--accent-primary)', marginBottom: '10px' }}><IconClock size={24} /></div>
          <h4 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>
            {language === 'ka' ? 'დაზოგილი დრო' : 'Time Returned to You'}
          </h4>
          <p className="body-sm">
            {language === 'ka'
              ? 'ჩვენი ჩრდილოეთის ვარსკვლავია შენი დაზოგილი დრო. ყოველი დავალება გიზოგავს საშუალოდ 2-4 საათს.'
              : 'Our North Star is the hours returned to your life. Each handled request saves an average of 2 to 4 hours.'}
          </p>
        </div>
      </div>
    </div>
  );
};
