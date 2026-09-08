import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

type PeriodTab = 'today' | 'week' | 'month';

export const TimeSavedWidget: React.FC = () => {
  const { language } = useLanguage();
  const [period, setPeriod] = useState<PeriodTab>('week');

  const periodData = {
    today: {
      total: language === 'ka' ? '2სთ 15წთ' : '2h 15m',
      periodLabel: language === 'ka' ? 'დღეს' : 'Today',
      breakdown: [
        { category: language === 'ka' ? 'დასუფთავება' : 'Cleaning', time: '1h 30m', pct: 65, color: 'var(--accent-primary)' },
        { category: language === 'ka' ? 'მოძიება / შეთანხმება' : 'Scheduling', time: '45m', pct: 35, color: 'var(--status-info)' },
      ],
    },
    week: {
      total: language === 'ka' ? '6სთ 42წთ' : '6h 42m',
      periodLabel: language === 'ka' ? 'ამ კვირაში' : 'This week',
      breakdown: [
        { category: language === 'ka' ? 'დასუფთავება' : 'Cleaning', time: '1h 30m', pct: 25, color: 'var(--accent-primary)' },
        { category: language === 'ka' ? 'დავალებები / მიტანა' : 'Errands', time: '2h 00m', pct: 30, color: 'var(--status-info)' },
        { category: language === 'ka' ? 'სპეციალისტის მოძიება' : 'Research', time: '1h 12m', pct: 18, color: 'var(--status-success)' },
        { category: language === 'ka' ? 'ორგანიზება & დაჯავშნა' : 'Scheduling', time: '2h 00m', pct: 27, color: 'var(--status-warning)' },
      ],
    },
    month: {
      total: language === 'ka' ? '24სთ 10წთ' : '24h 10m',
      periodLabel: language === 'ka' ? 'ამ თვეში' : 'This month',
      breakdown: [
        { category: language === 'ka' ? 'დასუფთავება' : 'Cleaning', time: '8h 00m', pct: 33, color: 'var(--accent-primary)' },
        { category: language === 'ka' ? 'დავალებები / მიტანა' : 'Errands', time: '7h 30m', pct: 31, color: 'var(--status-info)' },
        { category: language === 'ka' ? 'კონდიციონერი / ხელოსნები' : 'Maintenance', time: '4h 40m', pct: 19, color: 'var(--status-success)' },
        { category: language === 'ka' ? 'ორგანიზება & დაჯავშნა' : 'Scheduling', time: '4h 00m', pct: 17, color: 'var(--status-warning)' },
      ],
    },
  };

  const current = periodData[period];

  return (
    <section aria-label="Time Saved Analytics" className="card" style={{ marginBottom: '24px' }}>
      {/* Header: Title + Period Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {language === 'ka' ? 'დაზოგილი დროის ანალიტიკა' : 'TIME SAVED INSIGHT'}
          </span>
          <h4 style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {language === 'ka'
              ? `${current.periodLabel} ${current.total} დაგიზოგე.`
              : `Saved you ${current.total} ${current.periodLabel.toLowerCase()}.`}
          </h4>
        </div>

        {/* Period Switcher Pills */}
        <div style={{ display: 'inline-flex', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-pill)', padding: '3px', border: '1px solid var(--border-subtle)' }}>
          {(['today', 'week', 'month'] as PeriodTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setPeriod(tab)}
              style={{
                background: period === tab ? 'var(--accent-primary)' : 'transparent',
                color: period === tab ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--duration-fast) var(--ease-doxo)',
              }}
            >
              {tab === 'today'
                ? (language === 'ka' ? 'დღეს' : 'Today')
                : tab === 'week'
                ? (language === 'ka' ? 'კვირა' : 'Week')
                : (language === 'ka' ? 'თვე' : 'Month')}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bars Breakdown */}
      <div style={{ display: 'flex', height: '6px', borderRadius: 'var(--radius-pill)', overflow: 'hidden', gap: '2px', marginBottom: '16px' }}>
        {current.breakdown.map((item, i) => (
          <div
            key={i}
            style={{
              width: `${item.pct}%`,
              backgroundColor: item.color,
              transition: 'width var(--duration-normal) var(--ease-doxo)',
            }}
            title={`${item.category}: ${item.time}`}
          />
        ))}
      </div>

      {/* Categories Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        {current.breakdown.map((item, i) => (
          <div
            key={i}
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.category}
              </span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '3px' }}>
              {item.time}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
