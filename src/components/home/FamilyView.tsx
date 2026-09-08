import React, { useState } from 'react';
import { FamilyMember } from '../../types/home';
import { useLanguage } from '../../context/LanguageContext';
import { useTasks } from '../../context/TaskContext';
import { AIService } from '../../lib/ai/aiService';
import { IconUsers, IconPlus, IconArrowRight, IconCheck } from '../common/Icons';

interface FamilyViewProps {
  onTaskCreated: () => void;
}

export const FamilyView: React.FC<FamilyViewProps> = ({ onTaskCreated }) => {
  const { language, t } = useLanguage();
  const { createTask } = useTasks();

  const [members] = useState<FamilyMember[]>([
    {
      id: 'fam_me',
      name: 'ნუკრი (მე)',
      relationship: 'Self',
      relationshipKa: 'მე',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      assignedTasksCount: 2,
    },
    {
      id: 'fam_mom',
      name: 'დედა',
      relationship: 'Mother',
      relationshipKa: 'დედა',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      assignedTasksCount: 1,
    },
    {
      id: 'fam_partner',
      name: 'პარტნიორი',
      relationship: 'Partner',
      relationshipKa: 'პარტნიორი',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      assignedTasksCount: 0,
    },
  ]);

  const handleDelegateMomAC = () => {
    const prompt = 'დედას სახლში კონდიციონერი შეამოწმე და გაწმინდე';
    const intent = AIService.analyzeIntent(prompt);
    createTask(prompt, intent);
    onTaskCreated();
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <IconUsers size={22} style={{ color: 'var(--accent-primary)' }} />
          <h2 className="hero-title" style={{ fontSize: '26px' }}>{t.familyTitle}</h2>
        </div>
        <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>
          {t.familySubtitle}
        </p>
      </div>

      {/* Delegation Quick Action Card */}
      <div
        className="card"
        style={{
          background: 'var(--accent-light)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          padding: '20px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div>
          <span className="brand-badge">{language === 'ka' ? 'სწრაფი დელეგირება' : 'Quick Delegation'}</span>
          <h4 style={{ fontSize: '16.5px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            {language === 'ka' ? '"დედას სახლში კონდიციონერი შეამოწმე"' : '"Inspect Mom\'s AC unit"'}
          </h4>
          <p className="body-sm" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
            {language === 'ka'
              ? 'DOXO თავად შეათანხმებს დროს და გააგზავნის სანდო სპეციალისტს.'
              : 'DOXO will coordinate the time and send a verified specialist directly.'}
          </p>
        </div>

        <button onClick={handleDelegateMomAC} className="btn btn-primary btn-sm">
          <span>{language === 'ka' ? 'დავალების შექმნა' : 'Create Task'}</span>
          <IconArrowRight size={14} />
        </button>
      </div>

      {/* Members Grid */}
      <h3 className="section-title" style={{ fontSize: '18px', marginBottom: '14px' }}>
        {language === 'ka' ? 'ოჯახის წევრები' : 'Family Members'}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {members.map(member => (
          <div key={member.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src={member.avatarUrl}
              alt={member.name}
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{member.name}</h4>
              <div className="metadata-text" style={{ color: 'var(--text-muted)' }}>
                {language === 'ka' ? member.relationshipKa : member.relationship} • {member.assignedTasksCount} {language === 'ka' ? 'აქტიური საქმე' : 'tasks'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
