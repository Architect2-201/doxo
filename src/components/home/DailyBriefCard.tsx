import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Task } from '../../types/task';
import { IconChevronRight } from '../common/Icons';

interface DailyBriefCardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onViewAllClick: () => void;
}

export const DailyBriefCard: React.FC<DailyBriefCardProps> = ({
  tasks,
  onTaskClick,
  onViewAllClick,
}) => {
  const { language } = useLanguage();

  // Filter up to 3 active / prioritized tasks
  const activeList = tasks.filter(t => !['completed', 'cancelled'].includes(t.status));
  const displayTasks = activeList.slice(0, 3);
  const totalCount = activeList.length || 4;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'provider_on_way':
        return language === 'ka' ? 'გზაშია' : 'On the way';
      case 'in_progress':
      case 'arrived':
        return language === 'ka' ? 'მუშაობს' : 'In progress';
      case 'booked':
        return language === 'ka' ? 'დადასტურებულია' : 'Confirmed';
      default:
        return language === 'ka' ? 'დაგეგმილი' : 'Scheduled';
    }
  };

  const getStatusStyle = (status: string) => {
    if (status === 'provider_on_way') {
      return {
        background: 'var(--status-info-bg)',
        color: 'var(--status-info-text)',
      };
    }
    if (status === 'booked') {
      return {
        background: 'var(--status-success-bg)',
        color: 'var(--status-success-text)',
      };
    }
    return {
      background: 'var(--bg-surface-elevated)',
      color: 'var(--text-secondary)',
    };
  };

  return (
    <section aria-label="Daily Brief" className="card" style={{ marginBottom: '24px' }}>
      {/* Header: Label + Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--accent-primary)',
          }}
        >
          DOXO DAILY BRIEF
        </span>

        <button
          onClick={onViewAllClick}
          className="btn-ghost"
          style={{
            fontSize: '13px',
            fontWeight: 500,
            padding: '4px 8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>{language === 'ka' ? 'ყველას ნახვა' : 'View all'}</span>
          <IconChevronRight size={14} />
        </button>
      </div>

      {/* Subtitle / Headline */}
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: '0 0 16px',
          lineHeight: '24px',
        }}
      >
        {language === 'ka'
          ? `დღეს შენთვის ${totalCount} მნიშვნელოვანი საქმეა`
          : `You have ${totalCount} important tasks today`}
      </h3>

      {/* Structured Task List (1. Task / Time / Status) */}
      {displayTasks.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {displayTasks.map((t, idx) => {
            const statusStyle = getStatusStyle(t.status);
            return (
              <div
                key={t.id}
                onClick={() => onTaskClick(t)}
                className="card-hoverable"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  gap: '12px',
                }}
              >
                {/* Left: Number + Task Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      width: '16px',
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}.
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {language === 'ka' ? t.titleKa : t.title}
                  </span>
                </div>

                {/* Right: Time + Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {t.preferredTime}
                  </span>
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      ...statusStyle,
                    }}
                  >
                    {getStatusLabel(t.status)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0 }}>
          {language === 'ka' ? 'დღეს აქტიური საქმეები არ არის.' : 'No active tasks scheduled for today.'}
        </p>
      )}
    </section>
  );
};
