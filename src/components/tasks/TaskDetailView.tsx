import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types/task';
import { useLanguage } from '../../context/LanguageContext';
import { useTasks } from '../../context/TaskContext';
import { DoxoStorage } from '../../lib/storage/db';
import { DOXOOrb } from '../common/DOXOOrb';
import { StatusBadge } from '../common/StatusBadge';
import { Timeline, TimelineEvent } from '../common/Timeline';
import { Booking } from '../../types/marketplace';
import { ContextualChatModal } from '../chat/ContextualChatModal';
import { RescheduleModal } from './RescheduleModal';
import { CancellationModal } from './CancellationModal';
import { DisputeModal } from '../disputes/DisputeModal';
import {
  IconArrowRight,
  IconClock,
  IconMapPin,
  IconShieldCheck,
  IconStar,
  IconCheck,
  IconChevronRight,
  IconRepeat,
  IconBell,
  IconX,
  IconMessageSquare,
  IconCalendar,
  IconAlertCircle,
} from '../common/Icons';


interface TaskDetailViewProps {
  task: Task;
  onBack: () => void;
}

export const TaskDetailView: React.FC<TaskDetailViewProps> = ({ task, onBack }) => {
  const { language, t } = useLanguage();
  const { updateStatus, submitReview } = useTasks();
  
  const [selectedRating, setSelectedRating] = useState(task.review?.rating || 5);
  const [selectedTags, setSelectedTags] = useState<string[]>(task.review?.tags || ['Professional', 'Fast']);
  const [reviewNote, setReviewNote] = useState(task.review?.feedbackText || '');
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(Boolean(task.review));
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(task.reminderSetting || 'evening');
  const [isRecurring, setIsRecurring] = useState(Boolean(task.isRecurring));

  // Marketplace Modals State
  const [showChatModal, setShowChatModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  const provider = task.providerId ? DoxoStorage.getProviderById(task.providerId) : null;

  // Resolve active booking
  const allBookings = DoxoStorage.getBookings();
  const existingBooking = allBookings.find(b => b.taskId === task.id);
  const activeBooking: Booking = existingBooking || {
    bookingId: `bk_${task.id}`,
    taskId: task.id,
    userId: task.userId,
    providerId: task.providerId || 'prov_giorgi_plumb',
    providerName: provider?.name || 'სპეციალისტი',
    providerNameKa: provider?.nameKa || 'სპეციალისტი',
    providerAvatarUrl: provider?.avatarUrl || '',
    providerPhone: provider?.phone,
    serviceId: `srv_${task.category}`,
    serviceTitleKa: task.titleKa,
    category: task.category,
    scheduledStart: task.preferredTime,
    scheduledEnd: '20:00',
    location: task.location,
    addressLabel: 'ჩემი ბინა',
    price: task.estimatedPrice.min,
    pricingModel: 'price_range',
    paymentStatus: task.status === 'completed' ? 'paid' : 'authorized',
    bookingStatus: (task.status as any) || 'confirmed',
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };


  const handleAdvanceStatus = () => {
    if (task.status === 'booked') {
      updateStatus(task.id, 'provider_on_way', 'სპეციალისტი დაიძრა შენი მისამართისკენ');
    } else if (task.status === 'provider_on_way') {
      updateStatus(task.id, 'arrived', 'სპეციალისტი ადგილზეა');
    } else if (task.status === 'arrived') {
      updateStatus(task.id, 'in_progress', 'სამუშაოები მიმდინარეობს');
    } else if (task.status === 'in_progress') {
      updateStatus(task.id, 'completed', 'სამუშაო წარმატებით დასრულდა');
    }
  };

  const handleCancelTask = () => {
    updateStatus(task.id, 'cancelled', 'დავალება გაუქმდა მომხმარებლის მიერ');
    setShowCancelConfirm(false);
    onBack();
  };

  const reviewTags = [
    { id: 'Fast', label: language === 'ka' ? 'სწრაფი' : 'Fast' },
    { id: 'Professional', label: language === 'ka' ? 'პროფესიონალი' : 'Professional' },
    { id: 'Friendly', label: language === 'ka' ? 'თავაზიანი' : 'Friendly' },
    { id: 'Good value', label: language === 'ka' ? 'კარგი ფასი' : 'Good value' },
    { id: 'Would recommend', label: language === 'ka' ? 'რეკომენდაციას ვუწევ' : 'Would recommend' },
  ];

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(t => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSendReview = () => {
    submitReview(task.id, selectedRating, reviewNote);
    setIsReviewSubmitted(true);
  };

  // Progress Steps Calculation
  const steps: { key: TaskStatus; label: string }[] = [
    { key: 'booked', label: language === 'ka' ? 'დადასტურებულია' : 'Booked' },
    { key: 'provider_on_way', label: language === 'ka' ? 'გზაშია' : 'On the way' },
    { key: 'arrived', label: language === 'ka' ? 'ადგილზეა' : 'Arrived' },
    { key: 'in_progress', label: language === 'ka' ? 'მუშაობს' : 'In progress' },
    { key: 'completed', label: language === 'ka' ? 'დასრულდა' : 'Completed' },
  ];

  const currentStepIdx = steps.findIndex(s => s.key === task.status);

  const mapBadgeStatus = (s: TaskStatus) => {
    switch (s) {
      case 'provider_on_way': return 'on_the_way';
      case 'in_progress':
      case 'arrived': return 'working';
      case 'completed': return 'completed';
      case 'booked': return 'confirmed';
      default: return 'analyzing';
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '48px' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={onBack}
          className="btn btn-ghost btn-sm"
          style={{ paddingLeft: '4px', gap: '6px' }}
        >
          <IconChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
          <span>{language === 'ka' ? 'დავალებებში დაბრუნება' : 'Back to tasks'}</span>
        </button>

        {/* Live Simulator Quick Advance Action */}
        {task.status !== 'completed' && task.status !== 'cancelled' && (
          <button
            onClick={handleAdvanceStatus}
            className="btn btn-secondary btn-sm"
            style={{ borderColor: 'var(--accent-primary)', color: '#A5B4FC', fontWeight: 600 }}
            title="Simulator action to progress provider lifecycle"
          >
            <span>{language === 'ka' ? 'სტატუსის წინ წაწევა (სიმულაცია)' : 'Advance Status (Simulate)'}</span>
          </button>
        )}
      </div>

      {/* Main Task Header Card */}
      <div
        className="card"
        style={{
          marginBottom: '20px',
          background: 'var(--surface-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <StatusBadge status={mapBadgeStatus(task.status)} lang={language} />
              {task.urgency === 'urgent' && (
                <span className="badge-priority-urgent" style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>
                  {language === 'ka' ? 'სასწრაფო' : 'Urgent'}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {language === 'ka' ? task.titleKa : task.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', color: 'var(--text-secondary)', fontSize: '13.5px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <IconClock size={15} />
                {task.preferredTime}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <IconMapPin size={15} />
                {task.location}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {language === 'ka' ? 'ღირებულება' : 'Price'}
            </span>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '2px' }}>
              {task.estimatedPrice.min}–{task.estimatedPrice.max} ₾
            </div>
          </div>
        </div>

        {/* Structured WHAT, WHO, WHEN, WHERE, PRICE Matrix */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {/* WHAT */}
          <div style={{ background: 'var(--surface-secondary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              {language === 'ka' ? 'რა (WHAT)' : 'WHAT'}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
              {language === 'ka' ? task.titleKa : task.title}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {task.rawPrompt}
            </div>
          </div>

          {/* WHO */}
          <div style={{ background: 'var(--surface-secondary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              {language === 'ka' ? 'ვინ (WHO)' : 'WHO'}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
              {provider ? (language === 'ka' ? provider.nameKa || provider.name : provider.name) : (language === 'ka' ? 'შერჩევის პროცესში' : 'Matching')}
            </div>
            {provider && (
              <div style={{ fontSize: '11.5px', color: '#F59E0B', marginTop: '2px' }}>
                ★ {provider.rating} ({provider.completedJobs} {language === 'ka' ? 'საქმე' : 'jobs'})
              </div>
            )}
          </div>

          {/* WHEN */}
          <div style={{ background: 'var(--surface-secondary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              {language === 'ka' ? 'როდის (WHEN)' : 'WHEN'}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
              {task.preferredTime}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {language === 'ka' ? 'სავარაუდო ხანგრძლივობა: 2სთ' : 'Estimated: 2 hrs'}
            </div>
          </div>

          {/* WHERE */}
          <div style={{ background: 'var(--surface-secondary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              {language === 'ka' ? 'სად (WHERE)' : 'WHERE'}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
              {task.location}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {language === 'ka' ? 'ვაკე, თბილისი' : 'Vake, Tbilisi'}
            </div>
          </div>

          {/* PRICE */}
          <div style={{ background: 'var(--surface-secondary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              {language === 'ka' ? 'ფასი (PRICE)' : 'PRICE'}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '4px' }}>
              {task.estimatedPrice.min}–{task.estimatedPrice.max} ₾
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--color-success)', marginTop: '2px' }}>
              {language === 'ka' ? 'გამჭვირვალე ფასი' : 'No hidden fees'}
            </div>
          </div>
        </div>

        {/* Live Execution Timeline (Section 8) */}
        {task.status !== 'cancelled' && (
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.04em' }}>
              {language === 'ka' ? 'შესრულების ქრონოლოგია' : 'Execution Timeline'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
              {[
                { key: 'draft', label: language === 'ka' ? 'დავალება შეიქმნა' : 'Task created', time: '14:10' },
                { key: 'options_found', label: language === 'ka' ? 'პროვაიდერი შეირჩა' : 'Provider matched', time: '14:12' },
                { key: 'booked', label: language === 'ka' ? 'დაჯავშნილია' : 'Booked', time: '14:15' },
                { key: 'provider_on_way', label: language === 'ka' ? 'გზაშია' : 'On the way', time: task.status === 'provider_on_way' || task.status === 'in_progress' || task.status === 'completed' ? '17:45' : undefined },
                { key: 'in_progress', label: language === 'ka' ? 'მუშაობს' : 'Working', time: task.status === 'in_progress' || task.status === 'completed' ? '18:10' : undefined },
                { key: 'completed', label: language === 'ka' ? 'შესრულებულია' : 'Completed', time: task.status === 'completed' ? '20:00' : undefined },
              ].map((step, idx, arr) => {
                const isPassed =
                  (step.key === 'draft') ||
                  (step.key === 'options_found' && task.status !== 'draft') ||
                  (step.key === 'booked' && task.status !== 'draft' && task.status !== 'options_found') ||
                  (step.key === 'provider_on_way' && (task.status === 'provider_on_way' || task.status === 'arrived' || task.status === 'in_progress' || task.status === 'completed')) ||
                  (step.key === 'in_progress' && (task.status === 'in_progress' || task.status === 'completed')) ||
                  (step.key === 'completed' && task.status === 'completed');

                return (
                  <div
                    key={step.key}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      zIndex: 2,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: isPassed ? 'var(--accent-primary)' : 'var(--surface-secondary)',
                        color: isPassed ? '#fff' : 'var(--text-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                        border: '2px solid',
                        borderColor: isPassed ? 'var(--accent-primary)' : 'var(--border-subtle)',
                      }}
                    >
                      {isPassed ? <IconCheck size={12} /> : idx + 1}
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        marginTop: '6px',
                        textAlign: 'center',
                        color: isPassed ? 'var(--text-primary)' : 'var(--text-tertiary)',
                        fontWeight: isPassed ? 600 : 400,
                        lineHeight: 1.2,
                      }}
                    >
                      {step.label}
                    </span>
                    {step.time && (
                      <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        {step.time}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Provider Details Card */}
      {provider && (
        <div
          className="card"
          style={{
            marginBottom: '20px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img
                src={provider.avatarUrl}
                alt={provider.name}
                style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {provider.name}
                  </h4>
                  <IconShieldCheck size={16} color="#38BDF8" />
                  <span style={{ fontSize: '11.5px', color: '#38BDF8', fontWeight: 600 }}>
                    {language === 'ka' ? 'ვერიფიცირებული' : 'Verified'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#FBBF24' }}>
                    <IconStar size={13} />
                    {provider.rating}
                  </span>
                  <span>•</span>
                  <span>{provider.completedJobs} {language === 'ka' ? 'სამუშაო' : 'jobs'}</span>
                  <span>•</span>
                  <span>{provider.phone}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowChatModal(true)}
                className="btn btn-primary btn-sm"
              >
                <IconMessageSquare size={13} />
                <span>{language === 'ka' ? 'ჩატი' : 'Chat'}</span>
              </button>

              <button
                onClick={() => setShowRescheduleModal(true)}
                className="btn btn-secondary btn-sm"
              >
                <IconClock size={13} />
                <span>{language === 'ka' ? 'დროის შეცვლა' : 'Reschedule'}</span>
              </button>

              <a
                href={`tel:${provider.phone}`}
                className="btn btn-secondary btn-sm"
                style={{ textDecoration: 'none' }}
              >
                <span>{language === 'ka' ? 'დარეკვა' : 'Call'}</span>
              </a>
            </div>
          </div>


          {/* Why DOXO recommends */}
          <div
            style={{
              marginTop: '16px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(99, 102, 241, 0.06)',
              border: '1px solid rgba(99, 102, 241, 0.15)',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {language === 'ka' ? 'რატომ გირჩევთ DOXO' : 'WHY DOXO RECOMMENDS'}
            </span>
            <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              {language === 'ka' ? provider.matchRationaleKa : provider.matchRationaleEn}
            </p>
          </div>
        </div>
      )}

      {/* Smart Reminders & Recurrence Card */}
      <div
        className="card"
        style={{
          marginBottom: '20px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: '20px',
        }}
      >
        <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>
          {language === 'ka' ? 'ჭკვიანი შეხსენება & განმეორება' : 'Smart Reminders & Recurrence'}
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {/* Reminder Options */}
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {language === 'ka' ? 'შეხსენების დრო' : 'Reminder time'}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
              {[
                { id: 'before_leaving', label: language === 'ka' ? 'სანამ სახლიდან გავალ' : 'Before leaving home' },
                { id: 'evening', label: language === 'ka' ? 'საღამოს' : 'In the evening' },
                { id: 'day_before', label: language === 'ka' ? 'ერთი დღით ადრე' : '1 day before' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedReminder(opt.id as any)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    borderColor: selectedReminder === opt.id ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    background: selectedReminder === opt.id ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-surface-elevated)',
                    color: selectedReminder === opt.id ? '#A5B4FC' : 'var(--text-secondary)',
                    textAlign: 'left',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recurrence Toggle */}
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {language === 'ka' ? 'განმეორებადი დავალება' : 'Recurring Life'}
            </span>
            <div style={{ marginTop: '6px' }}>
              <button
                onClick={() => setIsRecurring(!isRecurring)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid',
                  borderColor: isRecurring ? '#22C55E' : 'var(--border-subtle)',
                  background: isRecurring ? 'rgba(34, 197, 94, 0.12)' : 'var(--bg-surface-elevated)',
                  color: isRecurring ? '#4ADE80' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconRepeat size={16} />
                  <span>{language === 'ka' ? 'ყოველკვირეულად გამეორება' : 'Repeat weekly'}</span>
                </span>
                <span>{isRecurring ? 'ჩართულია' : 'გამორთული'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Review Section (After completion) */}
      {task.status === 'completed' && (
        <div
          className="card"
          style={{
            marginBottom: '20px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
            padding: '22px',
          }}
        >
          <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>
            {language === 'ka' ? 'როგორი იყო მომსახურება?' : 'How was the service?'}
          </h4>

          {isReviewSubmitted ? (
            <div style={{ padding: '14px', background: 'rgba(74, 222, 128, 0.12)', borderRadius: 'var(--radius-sm)', color: '#4ADE80', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconCheck size={16} />
              <span>{language === 'ka' ? 'მადლობა! შენი შეფასება შენახულია.' : 'Thank you! Your feedback is recorded.'}</span>
            </div>
          ) : (
            <div>
              {/* Star Rating */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setSelectedRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: star <= selectedRating ? '#FBBF24' : 'var(--border-medium)', padding: '2px' }}
                  >
                    <IconStar size={24} />
                  </button>
                ))}
              </div>

              {/* Quick Tags */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {reviewTags.map(tag => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-pill)',
                        border: '1px solid',
                        borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
                        background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface-elevated)',
                        color: isSelected ? '#A5B4FC' : 'var(--text-secondary)',
                        fontSize: '12.5px',
                        cursor: 'pointer',
                      }}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>

              {/* Optional Text Review */}
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder={language === 'ka' ? 'დამატებითი კომენტარი (არასავალდებულო)...' : 'Additional feedback (optional)...'}
                rows={2}
                style={{
                  width: '100%',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  resize: 'none',
                  outline: 'none',
                  marginBottom: '12px',
                }}
              />

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                <button onClick={handleSendReview} className="btn btn-primary btn-sm">
                  <span>{language === 'ka' ? 'შეფასების გაგზავნა' : 'Submit Review'}</span>
                </button>
                <button
                  onClick={() => setShowDisputeModal(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--status-danger)' }}
                >
                  <IconAlertCircle size={14} />
                  <span>{language === 'ka' ? 'პრობლემის დაფიქსირება' : 'Report Issue'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Danger Zone: Cancel Action */}
      {task.status !== 'completed' && task.status !== 'cancelled' && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
          <button
            onClick={() => setShowDisputeModal(true)}
            className="btn-ghost"
            style={{ color: 'var(--text-secondary)', fontSize: '13px' }}
          >
            {language === 'ka' ? 'პრობლემის დაფიქსირება' : 'Report issue'}
          </button>
          <button
            onClick={() => setShowCancellationModal(true)}
            className="btn-ghost"
            style={{ color: '#F87171', fontSize: '13px' }}
          >
            {language === 'ka' ? 'დავალების გაუქმება' : 'Cancel task'}
          </button>
        </div>
      )}

      {/* 1. Contextual Chat Modal */}
      <ContextualChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        booking={activeBooking}
        currentUserRole="user"
      />

      {/* 2. Reschedule Modal */}
      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        booking={activeBooking}
      />

      {/* 3. Cancellation Modal */}
      <CancellationModal
        isOpen={showCancellationModal}
        onClose={() => setShowCancellationModal(false)}
        booking={activeBooking}
        onSuccess={() => onBack()}
      />

      {/* 4. Dispute Modal */}
      <DisputeModal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        booking={activeBooking}
      />
    </div>
  );
};

