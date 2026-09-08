import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTasks } from '../../context/TaskContext';
import { DOXOLogo } from '../common/DOXOLogo';
import { TimeSavedCard } from '../common/TimeSavedCard';
import {
  IconHome,
  IconTasks,
  IconInbox,
  IconWrench,
  IconUser,
  IconUsers,
  IconChevronLeft,
  IconChevronRight,
  IconBookOpen,
  IconScale,
} from '../common/Icons';
import { DecisionEngine } from '../../lib/decisions/decisionEngine';

export type NavTab = 'home' | 'decisions' | 'tasks' | 'inbox' | 'services' | 'myhome' | 'family' | 'profile';

export interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onNewTaskClick?: () => void;
  onGoHome?: () => void;
  onOpenGuide?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onGoHome,
  onOpenGuide,
  isCollapsed: externalCollapsed,
  onToggleCollapse,
}) => {
  const { language, t } = useLanguage();
  const { activeTasks, completedTasks } = useTasks();

  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('doxo_sidebar_collapsed') === 'true';
  });

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const handleToggle = () => {
    const next = !isCollapsed;
    setInternalCollapsed(next);
    localStorage.setItem('doxo_sidebar_collapsed', String(next));
    if (onToggleCollapse) onToggleCollapse(next);
  };

  const pendingDecisionsCount = DecisionEngine.getDecisions().filter(d => d.status === 'pending').length;

  const navItems = [
    { id: 'home' as NavTab, label: t.navHome, icon: IconHome },
    { id: 'decisions' as NavTab, label: t.navDecisions || 'გადაწყვეტილებები', icon: IconScale, badge: pendingDecisionsCount > 0 ? pendingDecisionsCount : undefined },
    { id: 'tasks' as NavTab, label: t.navTasks, icon: IconTasks, badge: activeTasks.length > 0 ? activeTasks.length : undefined },
    { id: 'inbox' as NavTab, label: t.navInbox, icon: IconInbox },
    { id: 'services' as NavTab, label: t.navServices, icon: IconWrench },
    { id: 'myhome' as NavTab, label: t.navMyHome, icon: IconHome },
    { id: 'family' as NavTab, label: t.navFamily, icon: IconUsers },
    { id: 'profile' as NavTab, label: t.navProfile, icon: IconUser },
  ];

  const handledCount = completedTasks.length;
  const totalMinutesSaved = completedTasks.reduce((acc, t) => acc + (t.timeSavedMinutes || 0), 0);
  const timeSavedDisplay = totalMinutesSaved > 0
    ? (language === 'ka'
        ? `${Math.floor(totalMinutesSaved / 60)}სთ ${totalMinutesSaved % 60}წთ`
        : `${Math.floor(totalMinutesSaved / 60)}h ${totalMinutesSaved % 60}m`)
    : (language === 'ka' ? '0წთ' : '0m');

  return (
    <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div>
        {/* Header: DOXO Logo + Collapse Toggle */}
        <div
          style={{
            padding: isCollapsed ? '4px 0 16px' : '4px 4px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            gap: '8px',
          }}
        >
          <DOXOLogo
            size="md"
            showWordmark={!isCollapsed}
            onClick={onGoHome || (() => setActiveTab('home'))}
          />

          {!isCollapsed && (
            <button
              onClick={handleToggle}
              className="sidebar-collapse-btn"
              title={language === 'ka' ? 'მენიუს ჩაკეცვა' : 'Collapse sidebar'}
              aria-label="Collapse sidebar"
            >
              <IconChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                title={isCollapsed ? item.label : undefined}
                style={{
                  height: '46px',
                  minHeight: '46px',
                  boxSizing: 'border-box',
                }}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                {!isCollapsed && (
                  <span
                    style={{
                      fontSize: '13.5px',
                      lineHeight: '18px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      flex: 1,
                      textAlign: 'left',
                    }}
                  >
                    {item.label}
                  </span>
                )}
                {item.badge !== undefined && (
                  <span className="sidebar-link-badge">{item.badge}</span>
                )}
              </button>
            );
          })}

          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="sidebar-link"
              title={isCollapsed ? (language === 'ka' ? 'ინსტრუქცია & გზამკვლევი' : 'Guide & Manual') : undefined}
              style={{
                height: '42px',
                minHeight: '42px',
                marginTop: '10px',
                borderTop: '1px solid var(--border-subtle)',
                color: 'var(--accent-primary)',
              }}
            >
              <IconBookOpen size={18} />
              {!isCollapsed && (
                <span style={{ fontSize: '13.5px', fontWeight: 600 }}>
                  {language === 'ka' ? 'ინსტრუქცია' : 'Guide & Manual'}
                </span>
              )}
            </button>
          )}
        </nav>
      </div>

      {/* Footer Area: Quiet Time Saved Widget */}
      <div>
        {isCollapsed ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleToggle}
              className="sidebar-collapse-btn"
              title={language === 'ka' ? 'მენიუს გაშლა' : 'Expand sidebar'}
              aria-label="Expand sidebar"
            >
              <IconChevronRight size={16} />
            </button>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-light)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--accent-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
              }}
              title={language === 'ka' ? `დაზოგილი დრო: ${timeSavedDisplay}` : `Time saved: ${timeSavedDisplay}`}
            >
              {totalMinutesSaved > 0 ? `${(totalMinutesSaved / 60).toFixed(1)}h` : '0h'}
            </div>
          </div>
        ) : (
          <TimeSavedCard
            timeSavedText={timeSavedDisplay}
            tasksCount={handledCount}
            periodLabel={language === 'ka' ? 'დღეს' : 'Today'}
            lang={language}
          />
        )}
      </div>
    </aside>
  );
};
