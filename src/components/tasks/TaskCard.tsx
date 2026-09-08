import React from 'react';
import { Task, TaskStatus } from '../../types/task';
import { useLanguage } from '../../context/LanguageContext';
import { DoxoStorage } from '../../lib/storage/db';
import {
  IconChevronRight,
  IconWrench,
  IconDroplets,
  IconWind,
  IconPackage,
  IconZap,
  IconRepeat,
  IconCheck,
} from '../common/Icons';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  onQuickComplete?: (taskId: string, e: React.MouseEvent) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onQuickComplete }) => {
  const { language } = useLanguage();
  const provider = task.providerId ? DoxoStorage.getProviderById(task.providerId) : null;

  const getStatusInfo = (status: TaskStatus) => {
    switch (status) {
      case 'provider_on_way':
        return {
          label: language === 'ka' ? 'ტექნიკოსი გზაშია' : 'On the way',
          color: 'var(--status-info-text)',
          bg: 'var(--status-info-bg)',
          border: 'rgba(76, 141, 255, 0.25)',
        };
      case 'arrived':
      case 'in_progress':
        return {
          label: language === 'ka' ? 'მიმდინარეობს' : 'In progress',
          color: 'var(--accent-primary)',
          bg: 'var(--accent-light)',
          border: 'var(--accent-border)',
        };
      case 'booked':
        return {
          label: language === 'ka' ? 'დადასტურებულია' : 'Confirmed',
          color: 'var(--status-success-text)',
          bg: 'var(--status-success-bg)',
          border: 'rgba(40, 166, 111, 0.25)',
        };
      case 'completed':
        return {
          label: language === 'ka' ? 'შესრულებულია' : 'Completed',
          color: 'var(--text-muted)',
          bg: 'var(--bg-surface-elevated)',
          border: 'var(--border-subtle)',
        };
      default:
        return {
          label: language === 'ka' ? 'დაგეგმილი' : 'Scheduled',
          color: 'var(--status-warning-text)',
          bg: 'var(--status-warning-bg)',
          border: 'rgba(217, 148, 40, 0.25)',
        };
    }
  };

  const getCategoryIcon = () => {
    switch (task.category) {
      case 'plumbing':
        return <IconDroplets size={18} />;
      case 'ac_heating':
        return <IconWind size={18} />;
      case 'electrician':
        return <IconZap size={18} />;
      case 'courier':
        return <IconPackage size={18} />;
      case 'cleaning':
      default:
        return <IconWrench size={18} />;
    }
  };

  const status = getStatusInfo(task.status);
  const title = language === 'ka' ? task.titleKa : task.title;

  return (
    <div
      className="card card-hoverable"
      onClick={() => onClick(task)}
      style={{
        cursor: 'pointer',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '10px',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        minHeight: 'auto',
      }}
    >
      {/* Left: Icon + Content Hierarchy */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', minWidth: 0, flex: 1 }}>
        {/* Category Icon Container */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface-elevated)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid var(--border-subtle)',
            marginTop: '2px',
          }}
        >
          {getCategoryIcon()}
        </div>

        {/* Text Container: Title -> Status/Time -> Provider -> Match/Price */}
        <div style={{ minWidth: 0, flex: 1 }}>
          {/* Title */}
          <h4
            style={{
              fontSize: '15.5px',
              fontWeight: 600,
              lineHeight: '22px',
              color: 'var(--text-primary)',
              margin: '0 0 4px',
              wordBreak: 'break-word',
            }}
          >
            {title}
          </h4>

          {/* Time & Provider line */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              fontSize: '13px',
              lineHeight: '18px',
              color: 'var(--text-secondary)',
            }}
          >
            <span>{task.preferredTime || (language === 'ka' ? 'დღეს · 18:30' : 'Today · 18:30')}</span>

            {provider && (
              <>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                  {provider.name} · {provider.rating}★
                </span>
              </>
            )}

            {task.isRecurring && (
              <>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '11px',
                    color: 'var(--accent-primary)',
                  }}
                >
                  <IconRepeat size={11} />
                  <span>{language === 'ka' ? 'განმეორებადი' : 'Recurring'}</span>
                </span>
              </>
            )}

            {task.estimatedPrice && (
              <>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {task.estimatedPrice.min}–{task.estimatedPrice.max} ₾
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Status Badge & Chevron */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {/* Status Badge */}
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: status.color,
            background: status.bg,
            border: `1px solid ${status.border}`,
            padding: '4px 10px',
            borderRadius: 'var(--radius-pill)',
            whiteSpace: 'nowrap',
          }}
        >
          {status.label}
        </span>

        {/* Quick Complete Checkbox (if applicable) */}
        {onQuickComplete && task.status !== 'completed' && (
          <button
            onClick={(e) => onQuickComplete(task.id, e)}
            className="btn-icon"
            title={language === 'ka' ? 'დასრულებულად მონიშვნა' : 'Mark completed'}
            style={{ width: '30px', height: '30px', background: 'var(--bg-surface-elevated)' }}
          >
            <IconCheck size={14} />
          </button>
        )}

        <IconChevronRight size={16} color="var(--text-muted)" />
      </div>
    </div>
  );
};
