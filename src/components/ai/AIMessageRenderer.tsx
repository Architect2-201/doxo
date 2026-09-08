import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { AIMessage, ClarificationOption } from '../../types/ai';
import { TaskPlanCard } from './TaskPlanCard';
import { ActionApprovalCard } from './ActionApprovalCard';
import { ProviderComparisonCard } from './ProviderComparisonCard';
import { DOXOOrb } from '../common/DOXOOrb';
import { IconCheck, IconX, IconSparkles, IconClock, IconRefreshCw } from '../common/Icons';

export interface AIMessageRendererProps {
  message: AIMessage;
  onSelectOption?: (option: ClarificationOption) => void;
  onApproveAction?: () => void;
  onModifyAction?: () => void;
  onConfirmPlan?: () => void;
  onViewVariants?: () => void;
  onSelectProvider?: (provider: any) => void;
  onRetry?: () => void;
}

export const AIMessageRenderer: React.FC<AIMessageRendererProps> = ({
  message,
  onSelectOption,
  onApproveAction,
  onModifyAction,
  onConfirmPlan,
  onViewVariants,
  onSelectProvider,
  onRetry,
}) => {
  const { language } = useLanguage();
  const isKa = language === 'ka';
  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          margin: '12px 0',
        }}
      >
        <div
          style={{
            maxWidth: '80%',
            background: 'var(--surface-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px 16px 4px 16px',
            padding: '12px 16px',
            color: 'var(--text-primary)',
            fontSize: '14.5px',
            lineHeight: 1.5,
          }}
        >
          {isKa ? message.contentKa : message.contentEn}
          <div
            style={{
              fontSize: '10.5px',
              color: 'var(--text-tertiary)',
              textAlign: 'right',
              marginTop: '4px',
            }}
          >
            {message.timestamp}
          </div>
        </div>
      </div>
    );
  }

  // DOXO Assistant Message
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        margin: '16px 0',
      }}
    >
      {/* Top DOXO Identifier & Text Bubble */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{ marginTop: '2px' }}>
          <DOXOOrb size="sm" state="idle" />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'inline-block',
              maxWidth: '90%',
              background: 'var(--surface-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px 16px 16px 4px',
              padding: '12px 16px',
              color: 'var(--text-primary)',
              fontSize: '14.5px',
              lineHeight: 1.5,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {isKa ? message.contentKa : message.contentEn}
            <div
              style={{
                fontSize: '10.5px',
                color: 'var(--text-tertiary)',
                marginTop: '4px',
              }}
            >
              {message.timestamp}
            </div>
          </div>
        </div>
      </div>

      {/* Structured Payload Rendering */}
      <div style={{ paddingLeft: '38px' }}>
        {/* 1. CLARIFICATION OPTIONS */}
        {message.type === 'CLARIFICATION' && message.clarificationPayload && (
          <div
            style={{
              background: 'var(--surface-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              marginTop: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {isKa
                ? message.clarificationPayload.questionKa
                : message.clarificationPayload.questionEn}
            </div>

            {message.clarificationPayload.contextReasonKa && (
              <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                {isKa
                  ? message.clarificationPayload.contextReasonKa
                  : message.clarificationPayload.contextReasonEn}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {message.clarificationPayload.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onSelectOption && onSelectOption(opt)}
                  className="btn-secondary"
                  style={{
                    height: '34px',
                    padding: '0 14px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    borderRadius: '20px',
                    background: opt.isRecommended ? 'rgba(98, 91, 255, 0.1)' : undefined,
                    borderColor: opt.isRecommended ? 'var(--accent-primary)' : undefined,
                    color: opt.isRecommended ? 'var(--accent-primary)' : undefined,
                  }}
                >
                  {isKa ? opt.labelKa : opt.labelEn}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. TASK_PLAN */}
        {message.type === 'TASK_PLAN' && message.planPayload && (
          <TaskPlanCard
            plan={message.planPayload}
            onViewVariants={onViewVariants || (() => {})}
            onConfirmPlan={onConfirmPlan || (() => {})}
          />
        )}

        {/* 3. PROVIDER_RECOMMENDATION & PRICE_COMPARISON */}
        {(message.type === 'PROVIDER_RECOMMENDATION' || message.type === 'PRICE_COMPARISON') &&
          message.providerPayload && (
            <ProviderComparisonCard
              providers={[
                message.providerPayload.primaryProvider,
                ...(message.providerPayload.alternativeProviders || []),
              ]}
              onSelect={onSelectProvider || (() => {})}
            />
          )}

        {/* 4. CONFIRMATION (ACTION APPROVAL) */}
        {message.type === 'CONFIRMATION' && message.approvalPayload && (
          <ActionApprovalCard
            titleKa={message.approvalPayload.taskTitleKa}
            provider={message.approvalPayload.provider}
            scheduledTime={message.approvalPayload.scheduledTime}
            location={message.approvalPayload.location}
            price={message.approvalPayload.price}
            currency={message.approvalPayload.currency}
            cancellationPolicyKa={message.approvalPayload.cancellationPolicyKa}
            onApprove={onApproveAction || (() => {})}
            onModify={onModifyAction || (() => {})}
          />
        )}

        {/* 5. PROGRESS */}
        {message.type === 'PROGRESS' && message.progressPayload && (
          <div
            style={{
              background: 'var(--surface-secondary)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid var(--accent-primary)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {isKa ? message.progressPayload.statusTextKa : message.progressPayload.statusTextEn}
            </span>
          </div>
        )}

        {/* 6. SUCCESS */}
        {message.type === 'SUCCESS' && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'var(--color-success)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconCheck size={14} />
            </div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {isKa ? 'დავალება წარმატებით შესრულდა' : 'Action successfully scheduled'}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {isKa ? 'სპეციალისტს ეცნობა და დეტალები შენახულია' : 'Provider notified, details recorded'}
              </div>
            </div>
          </div>
        )}

        {/* 7. ERROR WITH RECOVERY OPTIONS */}
        {message.type === 'ERROR' && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
              {isKa
                ? 'ამ დროს ზუსტი ვარიანტი ვერ ვიპოვე. როგორ გირჩევნია გავაგრძელოთ?'
                : 'Could not find exact match for this time. How would you like to proceed?'}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={onRetry}
                className="btn-secondary"
                style={{ height: '32px', padding: '0 12px', fontSize: '12px' }}
              >
                {isKa ? 'სხვა დრო' : 'Another time'}
              </button>
              <button
                onClick={onRetry}
                className="btn-secondary"
                style={{ height: '32px', padding: '0 12px', fontSize: '12px' }}
              >
                {isKa ? 'სხვა უბანი' : 'Another area'}
              </button>
              <button
                onClick={onRetry}
                className="btn-secondary"
                style={{ height: '32px', padding: '0 12px', fontSize: '12px' }}
              >
                <IconRefreshCw size={12} style={{ marginRight: '4px' }} />
                {isKa ? 'თავიდან ცდა' : 'Retry'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
