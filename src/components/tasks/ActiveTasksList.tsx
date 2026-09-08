import React, { useState, useMemo } from 'react';
import { Task, ServiceCategory } from '../../types/task';
import { useLanguage } from '../../context/LanguageContext';
import { useTasks } from '../../context/TaskContext';
import { TaskCard } from './TaskCard';
import { EmptyState } from '../common/EmptyState';
import { IconSearch, IconChevronRight } from '../common/Icons';

type TaskFilterTab = 'all' | 'in_progress' | 'booked' | 'completed';

interface ActiveTasksListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onViewAllClick: () => void;
  maxDisplay?: number;
}

export const ActiveTasksList: React.FC<ActiveTasksListProps> = ({
  tasks,
  onTaskClick,
  onViewAllClick,
  maxDisplay = 3,
}) => {
  const { language, t } = useLanguage();
  const { updateStatus } = useTasks();

  const [activeTab, setActiveTab] = useState<TaskFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');

  const isFullView = maxDisplay > 3;

  // Filter tasks per Section 18: ყველა, მიმდინარე, დადასტურებული, შესრულებული
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // 1. Tab filter
      if (activeTab === 'in_progress') {
        if (!['in_progress', 'arrived', 'provider_on_way'].includes(task.status)) return false;
      } else if (activeTab === 'booked') {
        if (task.status !== 'booked') return false;
      } else if (activeTab === 'completed') {
        if (task.status !== 'completed') return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q) || task.titleKa.toLowerCase().includes(q);
        const matchesPrompt = task.rawPrompt.toLowerCase().includes(q);
        const matchesLocation = task.location.toLowerCase().includes(q);
        if (!matchesTitle && !matchesPrompt && !matchesLocation) return false;
      }

      return true;
    });
  }, [tasks, activeTab, selectedCategory, searchQuery]);

  const displayedTasks = isFullView ? filteredTasks : tasks.filter(t => t.status !== 'completed').slice(0, maxDisplay);

  const handleQuickComplete = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateStatus(taskId, 'completed', 'Completed by quick action');
  };

  if (tasks.length === 0) {
    return (
      <div
        className="card"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          marginBottom: '24px',
        }}
      >
        <EmptyState
          type="tasks"
          title={t.noActiveTasksTitle}
          subtitle={t.noActiveTasksSub}
          lang={language}
        />
      </div>
    );
  }

  return (
    <section aria-label="Active Tasks" style={{ marginBottom: '24px' }}>
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <h3 className="section-title" style={{ margin: 0 }}>
          {isFullView ? (language === 'ka' ? 'დღევანდელი საქმეები' : "Today's Tasks") : t.activeTasksTitle}
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '8px' }}>
            ({isFullView ? filteredTasks.length : tasks.length})
          </span>
        </h3>

        {!isFullView && tasks.length > maxDisplay && (
          <button
            onClick={onViewAllClick}
            className="btn btn-ghost btn-sm"
            style={{ fontWeight: 600, color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <span>{t.viewAllTasks} ({tasks.length})</span>
            <IconChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Filter Tabs & Search Controls in Full Tasks View */}
      {isFullView && (
        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Filters: ყველა, მიმდინარე, დადასტურებული, შესრულებული */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              background: 'var(--bg-surface)',
              padding: '4px',
              borderRadius: 'var(--radius-btn)',
              border: '1px solid var(--border-subtle)',
              width: 'fit-content',
              flexWrap: 'wrap',
            }}
          >
            {[
              { id: 'all' as TaskFilterTab, label: language === 'ka' ? 'ყველა' : 'All' },
              { id: 'in_progress' as TaskFilterTab, label: language === 'ka' ? 'მიმდინარე' : 'In Progress' },
              { id: 'booked' as TaskFilterTab, label: language === 'ka' ? 'დადასტურებული' : 'Confirmed' },
              { id: 'completed' as TaskFilterTab, label: language === 'ka' ? 'შესრულებული' : 'Completed' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--duration-fast) var(--ease-doxo)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar & Category select */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div
              style={{
                flex: 1,
                minWidth: '220px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-btn)',
                padding: '8px 14px',
              }}
            >
              <IconSearch size={16} color="var(--text-muted)" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ka' ? 'ძიება დავალებებში...' : 'Search tasks...'}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '13.5px',
                  width: '100%',
                }}
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              style={{
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-btn)',
                padding: '8px 14px',
                fontSize: '13px',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="all">{language === 'ka' ? 'ყველა სერვისი' : 'All services'}</option>
              <option value="cleaning">{language === 'ka' ? 'დასუფთავება' : 'Cleaning'}</option>
              <option value="plumbing">{language === 'ka' ? 'სანტექნიკა' : 'Plumbing'}</option>
              <option value="electrician">{language === 'ka' ? 'ელექტრიკოსი' : 'Electrician'}</option>
              <option value="ac_heating">{language === 'ka' ? 'კონდიციონერი' : 'AC & Heating'}</option>
              <option value="courier">{language === 'ka' ? 'კურიერი' : 'Courier'}</option>
            </select>
          </div>
        </div>
      )}

      {/* Task List Items */}
      {displayedTasks.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {displayedTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={onTaskClick}
              onQuickComplete={handleQuickComplete}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: '32px',
            textAlign: 'center',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-card)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>
            {language === 'ka' ? 'არჩეული ფილტრით დავალებები არ მოიძებნა' : 'No tasks match selected filter'}
          </p>
        </div>
      )}
    </section>
  );
};
