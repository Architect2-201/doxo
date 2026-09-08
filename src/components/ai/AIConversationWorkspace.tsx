import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { Provider } from '../../types/provider';
import { Task, ServiceCategory } from '../../types/task';
import { AIMessage, StructuredPlan, ClarificationOption } from '../../types/ai';
import { AIService } from '../../lib/ai/aiService';
import { DoxoStorage } from '../../lib/storage/db';
import { AIMessageRenderer } from './AIMessageRenderer';
import { TaskPlanCard } from './TaskPlanCard';
import { TrustModal } from './TrustModal';
import { DOXOOrb } from '../common/DOXOOrb';
import {
  IconSend,
  IconMic,
  IconCamera,
  IconX,
  IconShieldCheck,
  IconCheck,
  IconSparkles,
  IconArrowRight,
  IconLayers,
  IconLock,
} from '../common/Icons';

interface AIConversationWorkspaceProps {
  initialPrompt?: string;
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
}

export const AIConversationWorkspace: React.FC<AIConversationWorkspaceProps> = ({
  initialPrompt = '',
  onClose,
  onTaskCreated,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { createTask, bookTask } = useTasks();
  const isKa = language === 'ka';

  const [inputVal, setInputVal] = useState(initialPrompt);
  const [isRecording, setIsRecording] = useState(false);
  const [showTrustModal, setShowTrustModal] = useState(false);
  const [activePlan, setActivePlan] = useState<StructuredPlan | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isContextCollapsed, setIsContextCollapsed] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initial Conversation Thread
  const [messages, setMessages] = useState<AIMessage[]>(() => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!initialPrompt) {
      return [
        {
          id: 'msg_welcome',
          sender: 'doxo',
          type: 'TEXT',
          contentKa: 'გამარჯობა. რა შემიძლია მოვაგვარო დღეს შენთვის?',
          contentEn: 'Hello. What can I handle for you today?',
          timestamp: timeStr,
        },
      ];
    }

    // Process initial prompt
    return [
      {
        id: 'msg_initial_user',
        sender: 'user',
        type: 'TEXT',
        contentKa: initialPrompt,
        contentEn: initialPrompt,
        timestamp: timeStr,
      },
    ];
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activePlan, selectedProvider]);

  // Execute Initial Prompt on Mount if provided
  useEffect(() => {
    if (initialPrompt) {
      processUserQuery(initialPrompt);
    }
  }, []);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const processUserQuery = (queryText: string) => {
    setIsProcessing(true);
    const timeStr = getCurrentTime();

    // 1. Natural Language Plan Edit Check if plan already exists
    if (activePlan) {
      const isEditCommand =
        queryText.includes('ადრე') ||
        queryText.includes('ამოიღ') ||
        queryText.includes('წაშალ') ||
        queryText.includes('შაბათ') ||
        queryText.includes('გადაიტანე');

      if (isEditCommand) {
        setTimeout(() => {
          const { updatedPlan, changeDescriptionKa, changeDescriptionEn } = AIService.editPlan(activePlan, queryText);
          setActivePlan(updatedPlan);

          setMessages((prev) => [
            ...prev,
            {
              id: `msg_${Date.now()}`,
              sender: 'doxo',
              type: 'TASK_PLAN',
              contentKa: `მივხვდი. ${changeDescriptionKa}`,
              contentEn: `Understood. ${changeDescriptionEn}`,
              timestamp: getCurrentTime(),
              planPayload: updatedPlan,
            },
          ]);
          setIsProcessing(false);
        }, 600);
        return;
      }
    }

    // 2. Structured Multi-Intent Check
    const plan = AIService.buildStructuredPlan(queryText);
    if (plan) {
      setTimeout(() => {
        setActivePlan(plan);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}`,
            sender: 'doxo',
            type: 'TASK_PLAN',
            contentKa: `მივხვდი. ${plan.targetDate}სთვის ${plan.items.length} საქმეა:`,
            contentEn: `Understood. Found ${plan.items.length} tasks for ${plan.targetDate}:`,
            timestamp: getCurrentTime(),
            planPayload: plan,
          },
        ]);
        setIsProcessing(false);
      }, 700);
      return;
    }

    // 3. Single Intent / Specific Service Matching
    setTimeout(() => {
      const intent = AIService.analyzeIntent(queryText, user?.preferences);
      const rankedProviders = AIService.rankProvidersForTask(
        intent.category,
        intent.location,
        intent.urgency,
        user?.preferences
      );

      if (rankedProviders.length > 0) {
        const top = rankedProviders[0];
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}`,
            sender: 'doxo',
            type: 'PROVIDER_RECOMMENDATION',
            contentKa: 'ვიპოვე საუკეთესო ვარიანტები:',
            contentEn: 'Found verified providers:',
            timestamp: getCurrentTime(),
            providerPayload: {
              primaryProvider: top,
              alternativeProviders: rankedProviders.slice(1, 3),
              matchConfidencePercent: top.matchScore || 96,
              matchRationaleBulletsKa: AIService.getWhyThisExplanation(top, intent.location).bulletsKa,
              matchRationaleBulletsEn: AIService.getWhyThisExplanation(top, intent.location).bulletsEn,
            },
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}`,
            sender: 'doxo',
            type: 'ERROR',
            contentKa: 'ამ დროისთვის შესაბამისი თავისუფალი ვარიანტი ვერ ვიპოვე.',
            contentEn: 'Could not find matching verified specialist for this exact time.',
            timestamp: getCurrentTime(),
          },
        ]);
      }
      setIsProcessing(false);
    }, 600);
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    const timeStr = getCurrentTime();
    setMessages((prev) => [
      ...prev,
      {
        id: `user_${Date.now()}`,
        sender: 'user',
        type: 'TEXT',
        contentKa: text,
        contentEn: text,
        timestamp: timeStr,
      },
    ]);

    setInputVal('');
    processUserQuery(text);
  };

  // Voice Interaction Mock (Fast structured voice input)
  const handleToggleVoice = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        const voiceQuery = isKa
          ? 'ხვალ საღამოს მინდა ბინის დალაგება, მანქანის გარეცხვა და კონდიციონერის შემოწმება'
          : 'Tomorrow evening need home cleaning, mobile car wash, and AC check';
        handleSend(voiceQuery);
      }, 2400);
    } else {
      setIsRecording(false);
    }
  };

  // Camera / Photo to Task (Honest OCR & Object detection)
  const handlePhotoUpload = () => {
    const timeStr = getCurrentTime();
    setMessages((prev) => [
      ...prev,
      {
        id: `user_photo_${Date.now()}`,
        sender: 'user',
        type: 'TEXT',
        contentKa: '📷 [ატვირთულია ფოტო: საოჯახო ტექნიკა]',
        contentEn: '📷 [Uploaded photo: Home Appliance]',
        timestamp: timeStr,
      },
      {
        id: `doxo_photo_resp_${Date.now()}`,
        sender: 'doxo',
        type: 'CLARIFICATION',
        contentKa: 'მივხვდი. როგორც ჩანს, ეს არის კონდიციონერის გარე ბლოკი.',
        contentEn: 'Understood. Looks like an AC outdoor compressor unit.',
        timestamp: getCurrentTime(),
        clarificationPayload: {
          questionKa: 'გინდა შემოწმებისა და წმენდის ტექნიკოსი ვიპოვო?',
          questionEn: 'Would you like me to find an AC technician?',
          contextReasonKa: 'ვიზუალური ანალიზით დაზიანება ან ფილტრის დაბინძურება შეინიშნება.',
          contextReasonEn: 'Visual diagnostic detects potential filter clogging.',
          options: [
            { id: 'opt_find_ac', labelKa: 'ტექნიკოსის პოვნა', labelEn: 'Find Technician', value: 'ac', isRecommended: true },
            { id: 'opt_cancel', labelKa: 'არა, სხვა რამ მინდა', labelEn: 'Not now', value: 'cancel' },
          ],
        },
      },
    ]);
  };

  // Clarification Selection
  const handleSelectOption = (opt: ClarificationOption) => {
    if (opt.value === 'ac') {
      handleSend(isKa ? 'კონდიციონერის შემოწმება მინდა' : 'Need AC inspection');
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_opt_cancel_${Date.now()}`,
          sender: 'doxo',
          type: 'TEXT',
          contentKa: 'გასაგებია. რა შემიძლია სხვა მოვაგვარო?',
          contentEn: 'Understood. What else can I handle?',
          timestamp: getCurrentTime(),
        },
      ]);
    }
  };

  // Provider Selected -> Triggers Approval Step
  const handleSelectProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    const timeStr = getCurrentTime();

    setMessages((prev) => [
      ...prev,
      {
        id: `msg_approval_${Date.now()}`,
        sender: 'doxo',
        type: 'CONFIRMATION',
        contentKa: 'ერთი დეტალი მჭირდება. შეგიძლია დაადასტურო?',
        contentEn: 'One detail needed. Can you confirm?',
        timestamp: timeStr,
        approvalPayload: {
          taskTitleKa: isKa ? 'ბინის დალაგება და მოწესრიგება' : 'Home Cleaning',
          provider,
          scheduledTime: 'ხვალ · 18:00',
          location: 'ი. ჭავჭავაძის გამზ. 37, ვაკე',
          price: provider.pricing.min,
          currency: '₾',
          cancellationPolicyKa: 'უფასო გაუქმება ვიზიტამდე 2 საათით ადრე. თანხა წინასწარ არ ჩამოგეჭრება.',
        },
      },
    ]);
  };

  // Explicit User Approval Execution
  const handleApproveAction = () => {
    if (!selectedProvider) return;

    const newTask = createTask('ბინის დასუფთავება', {
      category: 'cleaning',
      urgency: 'medium',
      suggestedTitleKa: 'ბინის დალაგება',
      suggestedTitleEn: 'Home Cleaning',
      location: 'ი. ჭავჭავაძის გამზ. 37, ვაკე',
      preferredTime: 'ხვალ · 18:00',
      estimatedPrice: {
        min: selectedProvider.pricing.min,
        max: selectedProvider.pricing.max,
        currency: '₾',
        marketStatus: 'normal_range',
        explanationText: 'საბაზრო ნორმა',
      },
      timeSavedMinutes: 180,
    }, selectedProvider.id);

    bookTask(newTask.id, selectedProvider.id);

    setMessages((prev) => [
      ...prev,
      {
        id: `msg_success_${Date.now()}`,
        sender: 'doxo',
        type: 'SUCCESS',
        contentKa: 'მზადაა. დაჯავშნილია. ნინო ბერიძეს დავუკავშირდი და ხვალ 18:00-ზე მოვა.',
        contentEn: 'All set! Booked. Nino Beridze confirmed for tomorrow at 18:00.',
        timestamp: getCurrentTime(),
      },
    ]);

    setTimeout(() => {
      onTaskCreated(newTask);
    }, 1200);
  };

  // Plan Execution: Schedules multi-intent tasks
  const handleConfirmPlan = () => {
    if (!activePlan) return;

    const providers = DoxoStorage.getProviders();
    const cleanProvider = providers.find(p => p.id === 'prov_nino_clean') || providers[2];

    const masterTask = createTask(activePlan.summaryKa, {
      category: 'cleaning',
      urgency: 'medium',
      suggestedTitleKa: activePlan.summaryKa,
      suggestedTitleEn: activePlan.summaryEn,
      location: 'ი. ჭავჭავაძის გამზ. 37, ვაკე',
      preferredTime: `${activePlan.targetDate} · 18:00`,
      estimatedPrice: {
        min: activePlan.totalPriceRange.min,
        max: activePlan.totalPriceRange.max,
        currency: '₾',
        marketStatus: 'normal_range',
        explanationText: 'ჯგუფირებული 3 სერვისის პაკეტი',
      },
      timeSavedMinutes: activePlan.bundleSavingsMinutes * activePlan.items.length,
    }, cleanProvider.id);

    bookTask(masterTask.id, cleanProvider.id);

    setMessages((prev) => [
      ...prev,
      {
        id: `msg_plan_confirmed_${Date.now()}`,
        sender: 'doxo',
        type: 'SUCCESS',
        contentKa: 'მზადაა. 3 საქმე წარმატებით დავგეგმე 1 გაერთიანებულ ვიზიტად.',
        contentEn: 'All set. 3 tasks successfully scheduled as 1 coordinated visit.',
        timestamp: getCurrentTime(),
      },
    ]);

    setTimeout(() => {
      onTaskCreated(masterTask);
    }, 1400);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1050,
        background: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 1. Top Bar */}
      <div
        style={{
          height: '60px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--surface-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <DOXOOrb size="sm" state={isProcessing ? 'thinking' : isRecording ? 'listening' : 'idle'} />
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isKa ? 'DOXO ოპერატორი' : 'DOXO Life Operator'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              {isKa ? 'პირადი ასისტენტი & შემსრულებელი' : 'AI Agent & Real-world Executor'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowTrustModal(true)}
            className="btn-secondary"
            style={{
              height: '32px',
              padding: '0 10px',
              fontSize: '12px',
              fontWeight: 600,
              gap: '6px',
            }}
          >
            <IconShieldCheck size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>{isKa ? 'როგორ მუშაობს?' : 'How it works'}</span>
          </button>

          <button
            onClick={onClose}
            className="icon-button"
            style={{ width: '34px', height: '34px', borderRadius: '8px' }}
            aria-label="Close"
          >
            <IconX size={18} />
          </button>
        </div>
      </div>

      {/* 2. 3-Panel Desktop Workspace Layout / Stacked Mobile Layout */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 1fr) minmax(360px, 1.2fr) minmax(260px, 0.8fr)',
          overflow: 'hidden',
          background: 'var(--bg-app)',
        }}
        className="doxo-workspace-grid"
      >
        {/* PANEL 1: Conversation Stream (Chat) */}
        <div
          style={{
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            background: 'var(--surface-primary)',
          }}
          className="doxo-chat-panel"
        >
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {messages.map((msg) => (
              <AIMessageRenderer
                key={msg.id}
                message={msg}
                onSelectOption={handleSelectOption}
                onApproveAction={handleApproveAction}
                onModifyAction={() => handleSend(isKa ? 'სხვა დრო მინდა' : 'Need different time')}
                onConfirmPlan={handleConfirmPlan}
                onViewVariants={() => handleSend(isKa ? 'ვარიანტები მაჩვენე' : 'Show options')}
                onSelectProvider={handleSelectProvider}
                onRetry={() => handleSend(isKa ? 'თავიდან სცადე' : 'Retry search')}
              />
            ))}
            {isProcessing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 38px' }}>
                <DOXOOrb size="sm" state="thinking" />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {isKa ? 'ვარჩევ საუკეთესო ვარიანტს...' : 'Finding best match...'}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Pills */}
          <div
            style={{
              padding: '8px 16px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              background: 'var(--surface-secondary)',
            }}
          >
            <button
              onClick={() => handleSend(isKa ? 'დალაგება ერთი საათით ადრე გადაიტანე' : 'Move cleaning 1 hr earlier')}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface-primary)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {isKa ? '⏱ დალაგება 1 სთ ადრე' : '⏱ Clean 1 hr earlier'}
            </button>
            <button
              onClick={() => handleSend(isKa ? 'კონდიციონერი ამოიღე' : 'Remove AC')}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface-primary)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {isKa ? '✕ კონდიციონერი ამოიღე' : '✕ Remove AC'}
            </button>
            <button
              onClick={() => handleSend(isKa ? 'ყველაფერი შაბათისთვის გადაიტანე' : 'Move all to Saturday')}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--surface-primary)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {isKa ? '📅 შაბათისთვის გადატანა' : '📅 Move to Saturday'}
            </button>
          </div>

          {/* Natural Language Prompt Input Bar */}
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--surface-primary)',
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '4px 8px',
              }}
            >
              <button
                type="button"
                onClick={handlePhotoUpload}
                title={isKa ? 'ფოტოს ატვირთვა' : 'Attach photo'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <IconCamera size={18} />
              </button>

              <button
                type="button"
                onClick={handleToggleVoice}
                title={isKa ? 'ხმოვანი შეყვანა' : 'Voice command'}
                style={{
                  background: isRecording ? 'var(--color-error)' : 'none',
                  border: 'none',
                  color: isRecording ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  animation: isRecording ? 'pulse 1s infinite' : 'none',
                }}
              >
                <IconMic size={18} />
              </button>

              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={
                  isRecording
                    ? (isKa ? 'გისმენ...' : 'Listening...')
                    : (isKa ? 'უთხარი DOXO-ს რა გჭირდება...' : 'Tell DOXO what you need...')
                }
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  padding: '8px 4px',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />

              <button
                type="submit"
                disabled={!inputVal.trim() || isProcessing}
                className="btn-primary"
                style={{
                  width: '34px',
                  height: '34px',
                  padding: 0,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconSend size={15} />
              </button>
            </form>
          </div>
        </div>

        {/* PANEL 2: Interactive Plan / Actions Inspector */}
        <div
          style={{
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            borderRight: '1px solid var(--border-subtle)',
          }}
          className="doxo-actions-panel"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {isKa ? 'გეგმა და მოქმედებები' : 'Plan & Actions'}
            </h2>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--accent-primary)',
                background: 'rgba(98, 91, 255, 0.08)',
                padding: '3px 8px',
                borderRadius: '12px',
              }}
            >
              {isKa ? 'რეალური დრო' : 'Live Sync'}
            </span>
          </div>

          {activePlan ? (
            <TaskPlanCard
              plan={activePlan}
              onViewVariants={() => handleSend(isKa ? 'ვარიანტები მაჩვენე' : 'Show options')}
              onConfirmPlan={handleConfirmPlan}
            />
          ) : (
            <div
              style={{
                background: 'var(--surface-primary)',
                border: '1px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px 20px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              <IconLayers size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '10px' }} />
              <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {isKa ? 'აქ გამოჩნდება შედგენილი გეგმა' : 'Structured plan will appear here'}
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', maxWidth: '280px', margin: '6px auto 0' }}>
                {isKa
                  ? 'შეიყვანე ერთი ან რამდენიმე საქმე და DOXO შეადგენს ოპტიმალურ გრაფიკს.'
                  : 'Enter one or more tasks to have DOXO generate an optimized schedule.'}
              </p>
            </div>
          )}

          {/* Transparent Cost Guarantee Note */}
          <div
            style={{
              background: 'var(--surface-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <IconLock size={16} style={{ color: 'var(--accent-primary)', marginTop: '2px', flexShrink: 0 }} />
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {isKa ? 'DOXO-ს დაცვა: ' : 'DOXO Protection: '}
              </span>
              {isKa
                ? 'არცერთი ქმედება ან გადახდა არ ხდება შენი ნებართვის გარეშე.'
                : 'No action or payment happens without your explicit approval.'}
            </div>
          </div>
        </div>

        {/* PANEL 3: Context & Knowledge Drawer */}
        <div
          style={{
            overflowY: 'auto',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            background: 'var(--surface-secondary)',
          }}
          className="doxo-context-panel"
        >
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
              {isKa ? 'კონტექსტი & AI მეხსიერება' : 'Context & AI Memory'}
            </h3>
            <p style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', margin: 0 }}>
              {isKa ? 'რას ეყრდნობა DOXO გადაწყვეტილებისას' : 'Information DOXO relies on'}
            </p>
          </div>

          {/* User Preferences Item */}
          <div
            style={{
              background: 'var(--surface-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
              {isKa ? 'შენახული პრეფერენსები' : 'Saved Preferences'}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
              {isKa ? 'საღამოს ვიზიტები (18:00+)' : 'Evening visits (18:00+)'}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              {isKa ? 'ჩუმი რეჟიმი (ზარების გარეშე)' : 'Silent mode (no calls)'}
            </div>
          </div>

          {/* Address Item */}
          <div
            style={{
              background: 'var(--surface-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              {isKa ? 'ძირითადი ლოკაცია' : 'Primary Location'}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
              ვაკე, ჭავჭავაძის 37
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              {isKa ? 'კოდი: 124, სართული 4' : 'Code: 124, Floor 4'}
            </div>
          </div>

          {/* Favorite Providers */}
          <div
            style={{
              background: 'var(--surface-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              {isKa ? 'რჩეული პროვაიდერები' : 'Favorite Providers'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>ნინო ბერიძე</span>
                <span style={{ color: '#F59E0B' }}>★ 4.98</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>ბათა კვარაცხელია</span>
                <span style={{ color: '#F59E0B' }}>★ 4.92</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Transparency Modal */}
      <TrustModal isOpen={showTrustModal} onClose={() => setShowTrustModal(false)} />
    </div>
  );
};
