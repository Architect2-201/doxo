import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTasks } from '../../context/TaskContext';
import { DoxoStorage } from '../../lib/storage/db';
import {
  IconShieldCheck,
  IconCommand,
  IconClock,
} from '../common/Icons';

interface ContextPanelProps {
  onOpenCommandPalette: () => void;
  onSelectTask?: (task: any) => void;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({
  onOpenCommandPalette,
  onSelectTask,
}) => {
  const { language } = useLanguage();
  const { activeTasks, completedTasks, totalTimeSavedHours } = useTasks();

  // Find active in-flight or booked task
  const activeSpecialistTask = activeTasks.find(
    t => t.status === 'provider_on_way' || t.status === 'in_progress' || t.status === 'booked'
  );

  const provider = activeSpecialistTask?.providerId
    ? DoxoStorage.getProviderById(activeSpecialistTask.providerId)
    : null;

  const progressPercent = Math.round(
    (completedTasks.length / Math.max(activeTasks.length + completedTasks.length, 1)) * 100
  );

  return (
    <aside className="app-context-panel" aria-label="DOXO Context Panel">
      {/* 1. DOXO Autonomous System Status */}
      <div
        className="card"
        style={{
          padding: '16px 18px',
          background: 'var(--bg-surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            DOXO STATUS
          </span>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--status-success)',
              }}
            />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--status-success-text)' }}>
              {language === 'ka' ? 'მზადყოფნაში' : 'Active'}
            </span>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
          {language === 'ka'
            ? 'DOXO აკონტროლებს შენს დავალებებს და მზადაა ახალი მოთხოვნისთვის.'
            : 'DOXO is monitoring your tasks and ready for new requests.'}
        </p>

        {/* Command shortcut prompt */}
        <button
          onClick={onOpenCommandPalette}
          style={{
            marginTop: '12px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            color: 'var(--text-secondary)',
            fontSize: '12.5px',
            cursor: 'pointer',
            transition: 'all var(--duration-fast) var(--ease-doxo)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <IconCommand size={14} />
            <span>{language === 'ka' ? 'ბრძანებების პალიტრა' : 'Commands'}</span>
          </span>
          <span className="command-palette-shortcut">⌘K</span>
        </button>
      </div>

      {/* 2. Active Provider Status (if task is active) */}
      {activeSpecialistTask && provider ? (
        <div
          className="card card-hoverable"
          onClick={() => onSelectTask && onSelectTask(activeSpecialistTask)}
          style={{
            padding: '16px',
            border: '1px solid var(--accent-border)',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
              {language === 'ka' ? 'აქტიური ოსტატი' : 'ACTIVE SPECIALIST'}
            </span>
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 600,
                color: 'var(--status-info-text)',
                background: 'var(--status-info-bg)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
              }}
            >
              {activeSpecialistTask.status === 'provider_on_way'
                ? (language === 'ka' ? 'მოვა ~18 წთ' : 'ETA ~18m')
                : (language === 'ka' ? 'დადასტურებულია' : 'Confirmed')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={provider.avatarUrl}
              alt={provider.name}
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {provider.name}
                </span>
                <IconShieldCheck size={14} color="var(--status-info)" />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {language === 'ka' ? activeSpecialistTask.titleKa : activeSpecialistTask.title}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* 3. Today's Progress & Time Saved */}
      <div
        className="card"
        style={{
          padding: '16px 18px',
          background: 'var(--bg-surface)',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          {language === 'ka' ? 'დღის პროგრესი და დრო' : "TODAY'S PROGRESS"}
        </span>

        {/* Progress bar */}
        <div style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            <span>{language === 'ka' ? 'შესრულებული საქმეები' : 'Completed tasks'}</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{progressPercent}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'var(--accent-primary)',
                borderRadius: 'var(--radius-pill)',
                transition: 'width var(--duration-normal) var(--ease-doxo)',
              }}
            />
          </div>
        </div>

        {/* Time Saved Metric */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
          <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {language === 'ka' ? 'აქტიური' : 'Active'}
            </span>
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              {activeTasks.length}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {language === 'ka' ? 'დაზოგილი' : 'Saved'}
            </span>
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--accent-primary)', marginTop: '2px' }}>
              {totalTimeSavedHours}სთ
            </div>
          </div>
        </div>
      </div>

      {/* 4. Verified Specialists Guarantee */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 14px',
          borderRadius: 'var(--radius-card)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <IconShieldCheck size={18} color="var(--accent-primary)" />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          {language === 'ka'
            ? 'DOXO-ს ყველა შემსრულებელი ვერიფიცირებულია პირადობისა და კვალიფიკაციის მიხედვით.'
            : 'All DOXO service partners are identity- and qualification-verified.'}
        </span>
      </div>
    </aside>
  );
};
