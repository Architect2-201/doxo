import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { IconBrain, IconX, IconCheck } from '../common/Icons';

type MemoryCategory = 'preferences' | 'home' | 'providers' | 'routine' | 'communication' | 'locations';

interface MemoryItem {
  id: string;
  category: MemoryCategory;
  categoryKa: string;
  textKa: string;
  textEn: string;
  learnedAt: string;
}

interface AIMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIMemoryModal: React.FC<AIMemoryModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();

  const [activeCategory, setActiveCategory] = useState<MemoryCategory | 'all'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const [memories, setMemories] = useState<MemoryItem[]>([
    {
      id: 'mem_1',
      category: 'routine',
      categoryKa: 'რუტინა',
      textKa: 'საღამოს შეხვედრები მირჩევნია (18:00–20:00).',
      textEn: 'Prefers evening appointments (18:00–20:00).',
      learnedAt: '2026-08-28',
    },
    {
      id: 'mem_2',
      category: 'providers',
      categoryKa: 'ოსტატები',
      textKa: 'დასუფთავებისთვის ნინო ბერიძე მომწონს (ეკო-პროდუქტებით).',
      textEn: 'Prefers Nino Beridze for apartment cleaning.',
      learnedAt: '2026-08-30',
    },
    {
      id: 'mem_3',
      category: 'preferences',
      categoryKa: 'პრეფერენციები',
      textKa: 'მაღალი რეიტინგის (4.9+) და ვერიფიცირებულ სპეციალისტებს ვანიჭებ უპირატესობას.',
      textEn: 'Prioritizes verified partners with 4.9+ ratings.',
      learnedAt: '2026-09-01',
    },
    {
      id: 'mem_4',
      category: 'locations',
      categoryKa: 'ლოკაციები',
      textKa: 'ძირითადი მისამართი: ი. ჭავჭავაძის გამზ. 37, ვაკე (სადარბაზო 2, კოდი 45).',
      textEn: 'Primary address: 37 Chavchavadze Ave, Vake.',
      learnedAt: '2026-09-02',
    },
    {
      id: 'mem_5',
      category: 'home',
      categoryKa: 'სახლი',
      textKa: 'კონდიციონერი: Gree Inverter 18 BTU (მისაღებში). ფილტრები იცვლება 6 თვეში ერთხელ.',
      textEn: 'AC model: Gree Inverter 18 BTU in living room.',
      learnedAt: '2026-09-03',
    },
    {
      id: 'mem_6',
      category: 'communication',
      categoryKa: 'კომუნიკაცია',
      textKa: 'ზარებს მირჩევნია შეტყობინებით დადასტურება.',
      textEn: 'Prefers text confirmation over direct phone calls.',
      learnedAt: '2026-09-04',
    },
  ]);

  const [newMemoryText, setNewMemoryText] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('preferences');

  const handleDelete = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  const handleStartEdit = (item: MemoryItem) => {
    setEditingId(item.id);
    setEditText(language === 'ka' ? item.textKa : item.textEn);
  };

  const handleSaveEdit = (id: string) => {
    if (!editText.trim()) return;
    setMemories(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          textKa: language === 'ka' ? editText.trim() : m.textKa,
          textEn: language === 'en' ? editText.trim() : m.textEn,
        };
      }
      return m;
    }));
    setEditingId(null);
    setEditText('');
  };

  const handleAdd = () => {
    if (!newMemoryText.trim()) return;
    const categoryLabels: Record<MemoryCategory, string> = {
      preferences: 'პრეფერენციები',
      home: 'სახლი',
      providers: 'ოსტატები',
      routine: 'რუტინა',
      communication: 'კომუნიკაცია',
      locations: 'ლოკაციები',
    };

    const newItem: MemoryItem = {
      id: `mem_${Date.now()}`,
      category: newCategory,
      categoryKa: categoryLabels[newCategory],
      textKa: newMemoryText.trim(),
      textEn: newMemoryText.trim(),
      learnedAt: new Date().toISOString().split('T')[0],
    };
    setMemories(prev => [newItem, ...prev]);
    setNewMemoryText('');
  };

  const categories: { id: MemoryCategory | 'all'; labelKa: string; labelEn: string }[] = [
    { id: 'all', labelKa: 'ყველა', labelEn: 'All' },
    { id: 'preferences', labelKa: 'Preferences', labelEn: 'Preferences' },
    { id: 'home', labelKa: 'Home', labelEn: 'Home' },
    { id: 'providers', labelKa: 'Providers', labelEn: 'Providers' },
    { id: 'routine', labelKa: 'Routine', labelEn: 'Routine' },
    { id: 'communication', labelKa: 'Communication', labelEn: 'Communication' },
    { id: 'locations', labelKa: 'Locations', labelEn: 'Locations' },
  ];

  const filteredMemories = memories.filter(m => activeCategory === 'all' || m.category === activeCategory);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="sheet-grab-handle" />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-light)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconBrain size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {language === 'ka' ? 'რას იმახსოვრებს DOXO ჩემზე' : 'What DOXO Remembers About Me'}
              </h3>
              <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                {language === 'ka' ? 'სრული კონტროლი შენს პერსონალურ მეხსიერებაზე' : 'Complete control over your AI memory'}
              </span>
            </div>
          </div>

          <button onClick={onClose} className="btn-ghost" style={{ padding: '4px' }}>
            <IconX size={16} />
          </button>
        </div>

        {/* Category Pills (Section 22.E) */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            background: 'var(--bg-surface-elevated)',
            padding: '4px',
            borderRadius: 'var(--radius-btn)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '16px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeCategory === cat.id ? 'var(--accent-primary)' : 'transparent',
                color: activeCategory === cat.id ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all var(--duration-fast) var(--ease-doxo)',
              }}
            >
              {language === 'ka' ? cat.labelKa : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Add Memory Input */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
            style={{
              padding: '8px 10px',
              borderRadius: 'var(--radius-btn)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              outline: 'none',
            }}
          >
            <option value="preferences">Preferences</option>
            <option value="home">Home</option>
            <option value="providers">Providers</option>
            <option value="routine">Routine</option>
            <option value="communication">Communication</option>
            <option value="locations">Locations</option>
          </select>

          <input
            type="text"
            value={newMemoryText}
            onChange={(e) => setNewMemoryText(e.target.value)}
            placeholder={language === 'ka' ? 'დაამატე ახალი პრეფერენცია...' : 'Remember new preference...'}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-btn)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button onClick={handleAdd} disabled={!newMemoryText.trim()} className="btn btn-primary btn-sm">
            <span>{language === 'ka' ? 'დამახსოვრება' : 'Remember'}</span>
          </button>
        </div>

        {/* Memory Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
          {filteredMemories.map(m => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                gap: '10px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '10.5px', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {m.category}
                </span>

                {editingId === m.id ? (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--accent-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                      }}
                    />
                    <button onClick={() => handleSaveEdit(m.id)} className="btn btn-primary btn-sm" style={{ padding: '2px 8px' }}>
                      <IconCheck size={12} />
                    </button>
                  </div>
                ) : (
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {language === 'ka' ? m.textKa : m.textEn}
                  </p>
                )}
              </div>

              {/* Edit and Forget buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                {editingId !== m.id && (
                  <button
                    onClick={() => handleStartEdit(m)}
                    className="btn-ghost"
                    style={{ fontSize: '11px', padding: '4px 6px', color: 'var(--text-secondary)' }}
                  >
                    {language === 'ka' ? 'ჩასწორება' : 'Edit'}
                  </button>
                )}
                <button
                  onClick={() => handleDelete(m.id)}
                  className="btn-ghost"
                  title={language === 'ka' ? 'დავიწყება (წაშლა)' : 'Forget'}
                  style={{ padding: '4px', color: 'var(--status-danger)' }}
                >
                  <IconX size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
