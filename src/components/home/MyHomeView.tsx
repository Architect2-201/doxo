import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTasks } from '../../context/TaskContext';
import { DoxoStorage } from '../../lib/storage/db';
import { AIService } from '../../lib/ai/aiService';
import { Provider } from '../../types/provider';
import {
  IconWind,
  IconDroplets,
  IconZap,
  IconWrench,
  IconClock,
  IconCheck,
  IconSparkles,
  IconShieldCheck,
  IconRepeat,
} from '../common/Icons';

interface MyHomeViewProps {
  onScheduleService: () => void;
}

export const MyHomeView: React.FC<MyHomeViewProps> = ({ onScheduleService }) => {
  const { language } = useLanguage();
  const { createTask } = useTasks();
  const homeProfile = DoxoStorage.getHomeProfile();
  const favoriteProviders: Provider[] = DoxoStorage.getFavoriteProviders();

  const handleProactiveSchedule = (serviceName: string) => {
    const intent = AIService.analyzeIntent(serviceName);
    createTask(serviceName, intent);
    onScheduleService();
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 className="page-title" style={{ fontSize: '28px', fontWeight: 600 }}>
          {language === 'ka' ? '🏠 ჩემი სახლი' : '🏠 My Home'}
        </h2>
        <p className="body-sm" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
          {homeProfile.address} ({homeProfile.district}) · {homeProfile.squareMeters} მ² · {homeProfile.roomsCount} {language === 'ka' ? 'ოთახი' : 'rooms'}
        </p>
      </div>

      {/* 1. Upcoming Maintenance Timeline per Section 21 */}
      <div
        className="card"
        style={{
          marginBottom: '24px',
          background: 'var(--bg-surface)',
          padding: '20px',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
          {language === 'ka' ? 'მომავალი მოვლა & გეგმა' : 'UPCOMING MAINTENANCE'}
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginTop: '14px' }}>
          {/* Item 1 */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <span style={{ fontSize: '11.5px', color: 'var(--status-warning-text)', fontWeight: 600 }}>
                {language === 'ka' ? 'მომდევნო' : 'Next'}
              </span>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '2px 0 0' }}>
                {language === 'ka' ? 'კონდიციონერის შემოწმება' : 'AC System Check'}
              </h4>
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                {language === 'ka' ? '15 სექტემბერი' : 'September 15'}
              </span>
            </div>
            <button
              onClick={() => handleProactiveSchedule('კონდიციონერის შემოწმება')}
              className="btn btn-primary btn-sm"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <span>{language === 'ka' ? 'დაჯავშნა' : 'Book'}</span>
            </button>
          </div>

          {/* Item 2 */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {language === 'ka' ? 'შემდეგი' : 'Upcoming'}
              </span>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '2px 0 0' }}>
                {language === 'ka' ? 'ფილტრების შეცვლა' : 'Filter Replacement'}
              </h4>
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                {language === 'ka' ? '1 ოქტომბერი' : 'October 1'}
              </span>
            </div>
            <button
              onClick={() => handleProactiveSchedule('ფილტრების შეცვლა')}
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <span>{language === 'ka' ? 'დაჯავშნა' : 'Book'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Structured Home Systems: Plumbing, Electrical, Cleaning */}
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '14px', color: 'var(--text-primary)' }}>
        {language === 'ka' ? 'სისტემები და მოვლა' : 'Systems & Maintenance'}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {/* Plumbing */}
        <div className="card card-hoverable" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--status-info-bg)',
                  color: 'var(--status-info)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconDroplets size={18} />
              </div>
              <h4 style={{ fontSize: '15.5px', fontWeight: 600, margin: 0 }}>
                {language === 'ka' ? 'სანტექნიკა' : 'Plumbing'}
              </h4>
            </div>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11.5px',
                fontWeight: 600,
                color: 'var(--status-success-text)',
                backgroundColor: 'var(--status-success-bg)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
              }}
            >
              <IconCheck size={12} />
              <span>{language === 'ka' ? 'წესრიგშია' : 'Good'}</span>
            </span>
          </div>

          <p className="body-sm" style={{ color: 'var(--text-secondary)', marginBottom: '14px' }}>
            {language === 'ka' ? 'აბაზანა და სამზარეულოს მილები. ბოლო შემოწმება: 2 თვის წინ.' : 'Bathroom & kitchen plumbing. Checked 2 months ago.'}
          </p>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleProactiveSchedule('სანტექნიკის პროფილაქტიკური შემოწმება')}
            style={{ width: '100%' }}
          >
            <IconWrench size={14} />
            <span>{language === 'ka' ? 'სანტექნიკოსის მოწვევა' : 'Request plumber'}</span>
          </button>
        </div>

        {/* Electrical */}
        <div className="card card-hoverable" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--status-warning-bg)',
                  color: 'var(--status-warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconZap size={18} />
              </div>
              <h4 style={{ fontSize: '15.5px', fontWeight: 600, margin: 0 }}>
                {language === 'ka' ? 'ელექტროობა' : 'Electrical'}
              </h4>
            </div>

            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 600,
                color: 'var(--status-warning-text)',
                backgroundColor: 'var(--status-warning-bg)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
              }}
            >
              {language === 'ka' ? 'შესამოწმებელი' : 'Needs Check'}
            </span>
          </div>

          <p className="body-sm" style={{ color: 'var(--text-secondary)', marginBottom: '14px' }}>
            {language === 'ka' ? 'დერეფნის როზეტი და ფარი. რეკომენდებულია უსაფრთხოების ტესტი.' : 'Hallway outlet & fuse box. Safety inspection suggested.'}
          </p>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleProactiveSchedule('ელექტრიკოსის გამოძახება როზეტისთვის')}
            style={{ width: '100%' }}
          >
            <IconZap size={14} />
            <span>{language === 'ka' ? 'ელექტრიკოსის მოწვევა' : 'Request electrician'}</span>
          </button>
        </div>

        {/* Cleaning */}
        <div className="card card-hoverable" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--accent-light)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconSparkles size={18} />
              </div>
              <h4 style={{ fontSize: '15.5px', fontWeight: 600, margin: 0 }}>
                {language === 'ka' ? 'დასუფთავება' : 'Cleaning'}
              </h4>
            </div>

            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 600,
                color: 'var(--accent-primary)',
                backgroundColor: 'var(--accent-light)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
              }}
            >
              {language === 'ka' ? 'რეგულარული' : 'Bi-weekly'}
            </span>
          </div>

          <p className="body-sm" style={{ color: 'var(--text-secondary)', marginBottom: '14px' }}>
            {language === 'ka' ? 'გენერალური დალაგება ყოველ ორ კვირაში ერთხელ. მომდევნო: შაბათი.' : 'Deep cleaning every 2 weeks. Next scheduled: Saturday.'}
          </p>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleProactiveSchedule('ბინის გენერალური დალაგება')}
            style={{ width: '100%' }}
          >
            <IconSparkles size={14} />
            <span>{language === 'ka' ? 'დალაგების დაჯავშნა' : 'Book cleaning'}</span>
          </button>
        </div>
      </div>

      {/* 3. Favorite Providers Section per Section 21 & Section 22.D */}
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '14px', color: 'var(--text-primary)' }}>
        {language === 'ka' ? 'ჩემი რჩეული ოსტატები' : 'Favorite Providers'}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        {favoriteProviders.map(p => (
          <div
            key={p.id}
            className="card card-hoverable"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={p.avatarUrl}
                alt={p.name}
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    {p.name}
                  </h4>
                  <IconShieldCheck size={14} color="var(--status-info)" />
                </div>
                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  {p.serviceAreas[0]} · {p.rating}★
                </span>
              </div>
            </div>

            <button
              onClick={() => handleProactiveSchedule(`${p.name} გამოძახება`)}
              className="btn btn-primary btn-sm"
              style={{ padding: '6px 14px', fontSize: '12.5px' }}
            >
              <span>{language === 'ka' ? 'დაჯავშნა' : 'Book'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
