import React, { useState, useEffect } from 'react';
import { DecisionItem, DecisionPriorityPreference } from '../../types/decision';
import { DecisionEngine } from '../../lib/decisions/decisionEngine';
import { DecisionCard } from './DecisionCard';
import { DecisionDetailModal } from './DecisionDetailModal';
import { DecisionHistory } from './DecisionHistory';
import { ApprovalCenter } from './ApprovalCenter';
import { ProductivityDashboard } from './ProductivityDashboard';
import { IconScale, IconSparkles, IconClock, IconShieldCheck, IconCheck } from '../common/Icons';

type TabView = 'pending' | 'approvals' | 'history' | 'productivity';

export const DecisionCenterView: React.FC = () => {
  const [decisions, setDecisions] = useState<DecisionItem[]>(() => DecisionEngine.getDecisions());
  const [activeTab, setActiveTab] = useState<TabView>('pending');
  const [selectedDecision, setSelectedDecision] = useState<DecisionItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterLabel, setActiveFilterLabel] = useState<string | null>(null);

  const refreshDecisions = () => {
    setDecisions(DecisionEngine.getDecisions());
  };

  const pendingDecisions = decisions.filter(d => d.status === 'pending');
  const completedDecisions = decisions.filter(d => d.status === 'completed');
  const approvalsCount = DecisionEngine.getApprovals().filter(a => a.status === 'pending').length;

  // Natural Language filtering (Section 8)
  const filteredDecisions = pendingDecisions.filter(d => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();

    // Natural language filters
    if (q.includes('იაფი') || q.includes('cheap')) {
      return d.options.some(o => o.price < 80);
    }
    if (q.includes('სანდო') || q.includes('reliable') || q.includes('ხარისხი')) {
      return d.options.some(o => (o.rating || 0) >= 4.9 || (o.reliabilityScore || 0) >= 95);
    }
    if (q.includes('დღეს') || q.includes('today')) {
      return d.options.some(o => o.availableTimeKa.includes('დღეს'));
    }

    return (
      d.titleKa.toLowerCase().includes(q) ||
      d.contextKa.toLowerCase().includes(q) ||
      d.doxoRecommendation.whatKa.toLowerCase().includes(q)
    );
  });

  const handleApplyQuickFilter = (label: string, query: string) => {
    setSearchQuery(query);
    setActiveFilterLabel(label);
  };

  const handleClearFilter = () => {
    setSearchQuery('');
    setActiveFilterLabel(null);
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* 1. Header Banner */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconScale size={16} />
          </div>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            DOXO DECISION CENTER · გადაწყვეტილებები
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(22px, 3.2vw, 30px)', fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0 6px' }}>
          {pendingDecisions.length > 0
            ? `დღეს ${pendingDecisions.length} გადაწყვეტილება გაქვს მოსაგვარებელი.`
            : 'ყველა გადაწყვეტილება მოგვარებულია.'}
        </h1>

        <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-secondary)', maxWidth: '680px', lineHeight: '1.5' }}>
          შედარება, კონტექსტი, ფასების ანალიზი და რეკომენდაციები. DOXO არასოდეს იღებს გადაწყვეტილებას შენს ნაცვლად — <strong>საბოლოო არჩევანი შენია</strong>.
        </p>
      </div>

      {/* 2. Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '12px',
          marginBottom: '20px',
          overflowX: 'auto',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            border: activeTab === 'pending' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
            backgroundColor: activeTab === 'pending' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
            color: activeTab === 'pending' ? '#ffffff' : 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: activeTab === 'pending' ? 600 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
          }}
        >
          <span>მოსაგვარებელი</span>
          {pendingDecisions.length > 0 && (
            <span
              style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: activeTab === 'pending' ? 'rgba(255, 255, 255, 0.25)' : 'var(--accent-primary)',
                color: '#ffffff',
                fontWeight: 700,
              }}
            >
              {pendingDecisions.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('approvals')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            border: activeTab === 'approvals' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
            backgroundColor: activeTab === 'approvals' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
            color: activeTab === 'approvals' ? '#ffffff' : 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: activeTab === 'approvals' ? 600 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
          }}
        >
          <span>დადასტურებას ელოდება</span>
          {approvalsCount > 0 && (
            <span
              style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: activeTab === 'approvals' ? 'rgba(255, 255, 255, 0.25)' : 'var(--status-error)',
                color: '#ffffff',
                fontWeight: 700,
              }}
            >
              {approvalsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            border: activeTab === 'history' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
            backgroundColor: activeTab === 'history' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
            color: activeTab === 'history' ? '#ffffff' : 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: activeTab === 'history' ? 600 : 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          ისტორია ({completedDecisions.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('productivity')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            border: activeTab === 'productivity' ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
            backgroundColor: activeTab === 'productivity' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
            color: activeTab === 'productivity' ? '#ffffff' : 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: activeTab === 'productivity' ? 600 : 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          კვირის მიმოხილვა
        </button>
      </div>

      {/* 3. Main Content Views */}
      {activeTab === 'pending' && (
        <>
          {/* Smart Natural Language Filter Input (Section 8) */}
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '12px 16px',
              marginBottom: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ჭკვიანი ფილტრი: მაგ. 'ყველაზე იაფი', 'ყველაზე სანდო', 'დღესვე'..."
                style={{
                  flex: 1,
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '9px 12px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearFilter}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    padding: '6px 10px',
                  }}
                >
                  გასუფთავება
                </button>
              )}
            </div>

            {/* Quick Filter Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                სწრაფი ფილტრები:
              </span>
              <button
                type="button"
                onClick={() => handleApplyQuickFilter('ფასი ≤ 80 ₾', 'იაფი')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-secondary)',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                }}
              >
                ყველაზე იაფი
              </button>

              <button
                type="button"
                onClick={() => handleApplyQuickFilter('მაღალი რეიტინგი 4.9★', 'სანდო')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-secondary)',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                }}
              >
                ყველაზე სანდო
              </button>

              <button
                type="button"
                onClick={() => handleApplyQuickFilter('დღევანდელი ვიზიტები', 'დღეს')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-secondary)',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                }}
              >
                დღესვე
              </button>

              {activeFilterLabel && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '11px',
                    color: 'var(--accent-primary)',
                    backgroundColor: 'rgba(139, 92, 246, 0.08)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600,
                  }}
                >
                  ფილტრი: {activeFilterLabel}
                </span>
              )}
            </div>
          </div>

          {/* Decision Cards List */}
          {filteredDecisions.length === 0 ? (
            <div
              style={{
                padding: '48px 20px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
              }}
            >
              <p style={{ margin: 0, fontSize: '14px' }}>
                მოცემული ფილტრით გადაწყვეტილებები არ მოიძებნა.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '16px',
              }}
            >
              {filteredDecisions.map((dec) => (
                <DecisionCard
                  key={dec.id}
                  decision={dec}
                  onClick={() => setSelectedDecision(dec)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'approvals' && (
        <ApprovalCenter onRefresh={refreshDecisions} />
      )}

      {activeTab === 'history' && (
        <DecisionHistory decisions={decisions} onRefresh={refreshDecisions} />
      )}

      {activeTab === 'productivity' && (
        <ProductivityDashboard summary={DecisionEngine.getProductivitySummary()} />
      )}

      {/* Decision Resolution Detail Modal */}
      {selectedDecision && (
        <DecisionDetailModal
          decision={selectedDecision}
          isOpen={Boolean(selectedDecision)}
          onClose={() => setSelectedDecision(null)}
          onDecisionResolved={(decisionId, selectedOptId) => {
            refreshDecisions();
            setSelectedDecision(null);
          }}
        />
      )}
    </div>
  );
};
