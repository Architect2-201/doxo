import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTasks } from '../../context/TaskContext';
import { NavTab } from './Sidebar';
import { DOXOOrb } from '../common/DOXOOrb';
import { IconHome, IconTasks, IconInbox, IconUser, IconScale } from '../common/Icons';
import { DecisionEngine } from '../../lib/decisions/decisionEngine';

interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onAiTrigger: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onAiTrigger,
}) => {
  const { t } = useLanguage();
  const { activeTasks } = useTasks();
  const pendingDecisionsCount = DecisionEngine.getDecisions().filter(d => d.status === 'pending').length;

  return (
    <nav className="mobile-bottom-nav">
      <button
        onClick={() => setActiveTab('home')}
        className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`}
        aria-label={t.navHome}
      >
        <IconHome size={20} />
        <span>{t.navHome}</span>
      </button>

      <button
        onClick={() => setActiveTab('decisions')}
        className={`bottom-nav-item ${activeTab === 'decisions' ? 'active' : ''}`}
        style={{ position: 'relative' }}
        aria-label={t.navDecisions || 'გადაწყვეტილებები'}
      >
        <IconScale size={20} />
        <span>{t.navDecisions || 'არჩევანი'}</span>
        {pendingDecisionsCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '10px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-primary)',
            }}
          />
        )}
      </button>

      {/* Subtle Elevated DOXO Orb Action */}
      <button
        onClick={onAiTrigger}
        style={{
          transform: 'translateY(-10px)',
          padding: '5px',
          borderRadius: '50%',
          background: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer',
        }}
        title="DOXO AI"
        aria-label="DOXO AI Command"
      >
        <DOXOOrb size="md" state="idle" />
      </button>

      <button
        onClick={() => setActiveTab('tasks')}
        className={`bottom-nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
        style={{ position: 'relative' }}
        aria-label={t.navTasks}
      >
        <IconTasks size={20} />
        <span>{t.navTasks}</span>
        {activeTasks.length > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '12px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-primary)',
            }}
          />
        )}
      </button>

      <button
        onClick={() => setActiveTab('inbox')}
        className={`bottom-nav-item ${activeTab === 'inbox' ? 'active' : ''}`}
        aria-label={t.navInbox}
      >
        <IconInbox size={20} />
        <span>{t.navInbox}</span>
      </button>
    </nav>
  );
};
