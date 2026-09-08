import React from 'react';
import { ProductivitySummary } from '../../types/decision';
import { IconSparkles, IconClock, IconCheck, IconScale } from '../common/Icons';

interface ProductivityDashboardProps {
  summary: ProductivitySummary;
}

export const ProductivityDashboard: React.FC<ProductivityDashboardProps> = ({ summary }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            კვირის მიმოხილვა · PRODUCTIVITY DASHBOARD
          </span>
          <h3 style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            ამ კვირაში DOXO დაგეხმარა
          </h3>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--status-success)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          <IconClock size={13} /> დაზოგილი დრო: ~{summary.estimatedHoursSavedFormatted}
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>გადაწყვეტილებაში</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '2px' }}>
            {summary.weekDecisionsCount}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>შეკვეთაში</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            {summary.weekBookingsCount}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>შედარებაში</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            {summary.weekComparisonsCount}
          </div>
        </div>
      </div>

      {/* Smart Insights (Section 40) */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
          ჭკვიანი ინსაითები (Smart Insights)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {summary.insightsKa.map((insight, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--accent-primary)', marginTop: '1px' }}>•</span>
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
