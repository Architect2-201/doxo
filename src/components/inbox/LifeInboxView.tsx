import React, { useState, useRef } from 'react';
import { LifeInboxItem } from '../../types/inbox';
import { useLanguage } from '../../context/LanguageContext';
import { useTasks } from '../../context/TaskContext';
import { DoxoStorage } from '../../lib/storage/db';
import { AIService } from '../../lib/ai/aiService';
import { DOXOOrb } from '../common/DOXOOrb';
import { Toast } from '../common/Toast';
import {
  IconInbox,
  IconClock,
  IconCheck,
  IconCamera,
  IconX,
  IconSparkles,
  IconArrowRight,
  IconFileText,
  IconBell,
} from '../common/Icons';

type InboxCategory = 'all' | 'needs_attention' | 'waiting' | 'upcoming' | 'handled';

interface LifeInboxViewProps {
  onTaskCreated: () => void;
}

export const LifeInboxView: React.FC<LifeInboxViewProps> = ({ onTaskCreated }) => {
  const { language } = useLanguage();
  const { createTask } = useTasks();
  const [items, setItems] = useState<LifeInboxItem[]>(() => DoxoStorage.getInboxItems());
  const [activeCategory, setActiveCategory] = useState<InboxCategory>('all');
  const [newNote, setNewNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [scannedDoc, setScannedDoc] = useState<{
    fileName: string;
    vendor: string;
    amount: string;
    dueDate: string;
    suggestedAction: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleActionClick = (item: LifeInboxItem, action: 'reminder' | 'task' | 'dismiss') => {
    if (action === 'dismiss') {
      DoxoStorage.updateInboxStatus(item.id, 'archived');
      setItems(prev => prev.filter(i => i.id !== item.id));
      showToast(language === 'ka' ? 'ელემენტი დაარქივდა' : 'Item dismissed');
      return;
    }

    if (action === 'reminder') {
      DoxoStorage.updateInboxStatus(item.id, 'action_taken');
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'action_taken' } : i));
      showToast(language === 'ka' ? 'შეხსენება დაყენებულია საღამოსთვის!' : 'Reminder scheduled!');
      return;
    }

    if (action === 'task') {
      const intent = AIService.analyzeIntent(item.rawContent);
      createTask(item.rawContent, intent);
      DoxoStorage.updateInboxStatus(item.id, 'converted_to_task');
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'converted_to_task' } : i));
      showToast(language === 'ka' ? 'დავალება შეიქმნა და DOXO მუშაობს!' : 'Task created and DOXO is working!');
      onTaskCreated();
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate smart document understanding (OCR + NLP Extraction)
    setScannedDoc({
      fileName: file.name,
      vendor: 'სილქნეტი (Silknet) — ინტერნეტი & TV',
      amount: '58 ₾',
      dueDate: 'ხვალ · 23:59',
      suggestedAction: 'ინტერნეტის გადახდა',
    });

    showToast(language === 'ka' ? 'დოკუმენტი გაანალიზდა DOXO-ს მიერ!' : 'Document analyzed by DOXO!');
  };

  const handleCreateTaskFromDoc = () => {
    if (!scannedDoc) return;
    const prompt = `${scannedDoc.vendor} გადახდა ${scannedDoc.amount}`;
    const intent = AIService.analyzeIntent(prompt);
    createTask(prompt, intent);
    setScannedDoc(null);
    showToast(language === 'ka' ? 'დავალება შექმნილია!' : 'Task created from document!');
    onTaskCreated();
  };

  // Filter items based on activeCategory
  const filteredItems = items.filter(item => {
    if (activeCategory === 'handled') return item.status === 'converted_to_task' || item.status === 'action_taken';
    if (activeCategory === 'needs_attention') {
      return item.status === 'pending' && (item.itemType === 'photo' || item.title.toLowerCase().includes('leak') || item.titleKa.includes('ჟონავს') || item.titleKa.includes('ქვითარი'));
    }
    if (activeCategory === 'waiting') return item.status === 'action_taken';
    if (activeCategory === 'upcoming') return item.status === 'pending';
    return true; // 'all'
  });

  const categories = [
    { id: 'all' as InboxCategory, label: language === 'ka' ? 'ყველა' : 'All' },
    { id: 'needs_attention' as InboxCategory, label: language === 'ka' ? 'საჭიროებს ყურადღებას' : 'Needs attention' },
    { id: 'handled' as InboxCategory, label: language === 'ka' ? 'დამუშავებული' : 'Handled' },
    { id: 'waiting' as InboxCategory, label: language === 'ka' ? 'მოლოდინში' : 'Waiting' },
    { id: 'upcoming' as InboxCategory, label: language === 'ka' ? 'მომავალი' : 'Upcoming' },
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      {toastMessage && (
        <Toast message={toastMessage} type="info" onClose={() => setToastMessage(null)} />
      )}

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 className="page-title" style={{ fontSize: '26px', fontWeight: 600 }}>
          Life Inbox
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '14px' }}>
          {language === 'ka'
            ? 'ყველა შემოსული ფიქრი, ქვითარი და საქმე ერთ მშვიდ სივრცეში'
            : 'All incoming notes, bills, and errands in one calm space'}
        </p>
      </div>

      {/* Top AI Summary Card */}
      <div
        className="card"
        style={{
          marginBottom: '24px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <DOXOOrb size="sm" state="idle" />
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {language === 'ka' ? `დღეს ${items.length} რამ შემოვიდა.` : `${items.length} items incoming today.`}
            </h3>
            <p style={{ color: 'var(--text-secondary)', margin: '3px 0 0', fontSize: '13px' }}>
              {language === 'ka'
                ? 'DOXO აანალიზებს შემოსულ ინფორმაციას და გთავაზობს შესაბამის ნაბიჯებს.'
                : 'DOXO analyzes incoming documents and proposes actionable steps.'}
            </p>
          </div>
        </div>

        {/* Upload Document / Receipt Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*,.pdf"
            onChange={handleDocumentUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <IconFileText size={15} />
            <span>{language === 'ka' ? 'ქვითრის / საბუთის ატვირთვა' : 'Upload Bill / Doc'}</span>
          </button>
        </div>
      </div>

      {/* Smart Document Understanding Result Banner (If scanned) */}
      {scannedDoc && (
        <div
          className="card animate-fade-in"
          style={{
            marginBottom: '24px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--accent-border)',
            borderRadius: 'var(--radius-card)',
            padding: '18px 22px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                  SMART DOCUMENT SCANNER
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>•</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{scannedDoc.fileName}</span>
              </div>

              <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {scannedDoc.vendor} — {scannedDoc.amount}
              </h4>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                {language === 'ka'
                  ? `ამოცნობილი ვადა: ${scannedDoc.dueDate}. გინდა ამაზე დავალება შევქმნა?`
                  : `Detected deadline: ${scannedDoc.dueDate}. Would you like DOXO to create a task?`}
              </p>
            </div>

            <button onClick={() => setScannedDoc(null)} className="btn-ghost" style={{ padding: '4px' }}>
              <IconX size={15} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <button onClick={handleCreateTaskFromDoc} className="btn btn-primary btn-sm">
              <IconCheck size={14} />
              <span>{language === 'ka' ? 'დავალების შექმნა' : 'Create Task'}</span>
            </button>
            <button onClick={() => setScannedDoc(null)} className="btn btn-secondary btn-sm">
              <span>{language === 'ka' ? 'მოგვიანებით' : 'Later'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Dump Input */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <input
          type="text"
          placeholder={language === 'ka' ? 'ჩაწერე ნებისმიერი აზრი, დავალიანება ან საქმე...' : 'Type any thought, bill or errand...'}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newNote.trim()) {
              const item: LifeInboxItem = {
                id: `inbox_${Date.now()}`,
                title: newNote.trim(),
                titleKa: newNote.trim(),
                itemType: 'note',
                rawContent: newNote.trim(),
                aiInterpretation: {
                  summary: newNote.trim(),
                  summaryKa: newNote.trim(),
                  suggestedAction: 'schedule_service',
                },
                status: 'pending',
                createdAt: new Date().toISOString(),
              };
              DoxoStorage.addInboxItem(item);
              setItems(prev => [item, ...prev]);
              setNewNote('');
              showToast(language === 'ka' ? 'ჩაწერილია DOXO-ს მიერ' : 'Recorded by DOXO');
            }
          }}
          style={{
            flex: 1,
            padding: '12px 18px',
            borderRadius: 'var(--radius-btn)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <button
          disabled={!newNote.trim()}
          onClick={() => {
            if (!newNote.trim()) return;
            const item: LifeInboxItem = {
              id: `inbox_${Date.now()}`,
              title: newNote.trim(),
              titleKa: newNote.trim(),
              itemType: 'note',
              rawContent: newNote.trim(),
              aiInterpretation: {
                summary: newNote.trim(),
                summaryKa: newNote.trim(),
                suggestedAction: 'schedule_service',
              },
              status: 'pending',
              createdAt: new Date().toISOString(),
            };
            DoxoStorage.addInboxItem(item);
            setItems(prev => [item, ...prev]);
            setNewNote('');
            showToast(language === 'ka' ? 'ჩაწერილია DOXO-ს მიერ' : 'Recorded by DOXO');
          }}
          className="btn btn-primary"
          style={{ padding: '0 20px' }}
        >
          {language === 'ka' ? 'დამატება' : 'Add'}
        </button>
      </div>

      {/* Categories Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          background: 'var(--bg-surface)',
          padding: '4px',
          borderRadius: 'var(--radius-btn)',
          border: '1px solid var(--border-subtle)',
          width: 'fit-content',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeCategory === cat.id ? 'var(--accent-primary)' : 'transparent',
              color: activeCategory === cat.id ? '#FFFFFF' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--duration-fast) var(--ease-doxo)',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Inbox Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div
              key={item.id}
              className="card card-hoverable"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-card)',
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px', flex: 1 }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-elevated)',
                    color: item.status === 'converted_to_task' ? '#4ADE80' : '#A5B4FC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconInbox size={18} />
                </div>

                <div>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    {language === 'ka' ? item.titleKa : item.title}
                  </h4>
                  <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {language === 'ka' ? item.aiInterpretation.summaryKa : item.aiInterpretation.summary}
                  </p>
                </div>
              </div>

              {/* Action Buttons: [Remind me] [Handle] [Dismiss] */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => handleActionClick(item, 'reminder')}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <IconBell size={13} />
                  <span>{language === 'ka' ? 'შემახსენე' : 'Remind me'}</span>
                </button>

                <button
                  onClick={() => handleActionClick(item, 'task')}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <IconCheck size={13} />
                  <span>{language === 'ka' ? 'მიხედე' : 'Handle'}</span>
                </button>

                <button
                  onClick={() => handleActionClick(item, 'dismiss')}
                  className="btn-ghost"
                  style={{ padding: '6px 8px', fontSize: '12px' }}
                  title={language === 'ka' ? 'დაარქივება' : 'Dismiss'}
                >
                  <IconX size={15} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)' }}>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>
              {language === 'ka' ? 'ამ კატეგორიაში ელემენტები არ არის.' : 'No items in this category.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
