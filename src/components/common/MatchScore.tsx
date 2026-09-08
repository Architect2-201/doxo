import React, { useState } from 'react';
import { IconSparkles, IconChevronRight, IconX } from './Icons';
import { Language } from '../../types/user';

interface MatchScoreProps {
  score: number;
  rationaleKa?: string;
  rationaleEn?: string;
  lang?: Language;
}

export const MatchScore: React.FC<MatchScoreProps> = ({
  score,
  rationaleKa,
  rationaleEn,
  lang = 'ka',
}) => {
  const [showPopover, setShowPopover] = useState(false);

  const rationale = lang === 'ka' ? rationaleKa : rationaleEn;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        className="match-score-pill"
        onClick={(e) => {
          e.stopPropagation();
          setShowPopover(!showPopover);
        }}
        title={lang === 'ka' ? 'ნახე რატომ შეირჩა' : 'View match explanation'}
      >
        <IconSparkles size={14} />
        <span>{score}% DOXO Match</span>
        <IconChevronRight size={13} style={{ transform: showPopover ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {showPopover && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            width: '280px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            boxShadow: 'var(--shadow-md)',
            zIndex: 30,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)' }}>
              {lang === 'ka' ? 'რატომ ეს სპეციალისტი?' : 'Why this specialist?'}
            </span>
            <button
              onClick={() => setShowPopover(false)}
              style={{ color: 'var(--text-subtle)', padding: '2px' }}
            >
              <IconX size={14} />
            </button>
          </div>
          <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
            {rationale || (lang === 'ka' ? 'მაღალი რეიტინგი და შესაბამისი გამოცდილება' : 'High rating and verified local experience')}
          </p>
        </div>
      )}
    </div>
  );
};
