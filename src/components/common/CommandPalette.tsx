import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { NavTab } from '../layout/Sidebar';
import {
  IconSearch,
  IconCommand,
  IconHome,
  IconTasks,
  IconInbox,
  IconWrench,
  IconBrain,
  IconPackage,
  IconUser,
  IconX,
  IconBookOpen,
  IconScale,
} from '../common/Icons';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
  onTriggerAI: (prompt: string) => void;
  onOpenMemory: () => void;
  onOpenErrand: () => void;
  onOpenGuide?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onTriggerAI,
  onOpenMemory,
  onOpenErrand,
  onOpenGuide,
}) => {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands = [
    {
      id: 'home',
      label: language === 'ka' ? 'მთავარ გვერდზე გადასვლა' : 'Go to Home',
      category: 'Navigation',
      icon: IconHome,
      action: () => onNavigate('home'),
    },
    {
      id: 'decisions',
      label: language === 'ka' ? 'გადაწყვეტილებების ცენტრი (Decision Center)' : 'Decision Center',
      category: 'Intelligence',
      icon: IconScale,
      action: () => onNavigate('decisions'),
    },
    {
      id: 'tasks',
      label: language === 'ka' ? 'დავალებების სია' : 'View all tasks',
      category: 'Navigation',
      icon: IconTasks,
      action: () => onNavigate('tasks'),
    },
    {
      id: 'inbox',
      label: language === 'ka' ? 'Life Inbox გახსნა' : 'Open Life Inbox',
      category: 'Navigation',
      icon: IconInbox,
      action: () => onNavigate('inbox'),
    },
    {
      id: 'clean',
      label: language === 'ka' ? 'დასუფთავების დაგეგმვა' : 'Schedule cleaning',
      category: 'Quick Action',
      icon: IconWrench,
      action: () => onTriggerAI(language === 'ka' ? 'ხვალ ბინის დალაგება მინდა' : 'Apartment cleaning tomorrow'),
    },
    {
      id: 'plumb',
      label: language === 'ka' ? 'სანტექნიკოსის გამოძახება' : 'Find plumber',
      category: 'Quick Action',
      icon: IconWrench,
      action: () => onTriggerAI(language === 'ka' ? 'აბაზანაში წყალი ჟონავს და მინდა სანტექნიკოსი' : 'Need plumber for bathroom leak'),
    },
    {
      id: 'errand',
      label: language === 'ka' ? 'Errand Mode (რამდენიმე წერტილიდან მოტანა)' : 'Errand Mode (Multi-stop delivery)',
      category: 'Features',
      icon: IconPackage,
      action: () => onOpenErrand(),
    },
    {
      id: 'memory',
      label: language === 'ka' ? 'AI Memory (რას იმახსოვრებს DOXO?)' : 'AI Memory Center',
      category: 'Intelligence',
      icon: IconBrain,
      action: () => onOpenMemory(),
    },
    {
      id: 'guide',
      label: language === 'ka' ? 'ინსტრუქცია & ფუნქციების განმარტებები' : 'User Guide & Documentation',
      category: 'Help',
      icon: IconBookOpen,
      action: () => onOpenGuide && onOpenGuide(),
    },
    {
      id: 'profile',
      label: language === 'ka' ? 'პროფილის პარამეტრები' : 'Profile Settings',
      category: 'Settings',
      icon: IconUser,
      action: () => onNavigate('profile'),
    },
  ];

  const filtered = commands.filter(c => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="command-palette-backdrop" onClick={onClose}>
      <div className="command-palette-card" onClick={(e) => e.stopPropagation()}>
        {/* Search Header */}
        <div className="command-palette-input-wrapper">
          <IconSearch size={18} color="var(--text-muted)" />
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            placeholder={language === 'ka' ? 'რა გინდა გააკეთო? (დაწერე ან აირჩიე...)' : 'What do you need? (Type or select...)'}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <span className="command-palette-shortcut">ESC</span>
        </div>

        {/* Results List */}
        <div className="command-palette-results">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`command-palette-item ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                      <Icon size={18} />
                    </div>
                    <span style={{ fontWeight: isSelected ? 600 : 400 }}>
                      {item.label}
                    </span>
                  </div>

                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {item.category}
                  </span>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px' }}>
              {language === 'ka' ? 'ბრძანება არ მოიძებნა' : 'No matching commands'}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11.5px',
            color: 'var(--text-muted)',
          }}
        >
          <span>DOXO Universal Command</span>
          <span>↑↓ ნავიგაცია • Enter შესრულება</span>
        </div>
      </div>
    </div>
  );
};
