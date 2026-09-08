import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTasks } from '../../context/TaskContext';
import { DoxoStorage } from '../../lib/storage/db';
import { Provider, ProviderAvailability } from '../../types/provider';
import { Task } from '../../types/task';
import { Booking, Quote, BookingStatus } from '../../types/marketplace';
import { ProviderOnboardingModal } from './ProviderOnboardingModal';
import { ContextualChatModal } from '../chat/ContextualChatModal';
import {
  IconCheck,
  IconClock,
  IconMapPin,
  IconStar,
  IconShieldCheck,
  IconBriefcase,
  IconArrowRight,
  IconMessageSquare,
  IconCalendar,
  IconBarChart,
  IconAlertCircle,
  IconX,
} from '../common/Icons';

type ProviderSectionTab = 'today' | 'requests' | 'bookings' | 'calendar' | 'messages' | 'earnings' | 'profile';

export const ProviderDashboardView: React.FC = () => {
  const { language } = useLanguage();
  const { tasks, updateStatus } = useTasks();

  const allProviders = DoxoStorage.getProviders();
  const [activeProviderId, setActiveProviderId] = useState<string>('prov_giorgi_plumb');
  const [activeSection, setActiveSection] = useState<ProviderSectionTab>('today');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeChatBooking, setActiveChatBooking] = useState<Booking | null>(null);

  // Quote input state
  const [quoteInputTaskId, setQuoteInputTaskId] = useState<string | null>(null);
  const [quotePrice, setQuotePrice] = useState<number>(85);
  const [quoteNotes, setQuoteNotes] = useState<string>('');

  const currentProvider = allProviders.find(p => p.id === activeProviderId) || allProviders[0];
  const [availability, setAvailability] = useState<ProviderAvailability>(currentProvider.availability);

  // Filter tasks & bookings for this provider
  const allBookings = DoxoStorage.getBookings();
  const providerBookings = allBookings.filter(
    b => b.providerId === currentProvider.id || currentProvider.categories.includes(b.category)
  );
  const activeBookings = providerBookings.filter(
    b => !['completed', 'cancelled'].includes(b.bookingStatus)
  );
  const completedBookings = providerBookings.filter(
    b => b.bookingStatus === 'completed'
  );

  // Incoming requests: tasks awaiting confirmation or quote
  const incomingRequests = tasks.filter(
    t => (t.category && currentProvider.categories.includes(t.category)) &&
      ['draft', 'searching', 'options_found', 'awaiting_confirmation', 'awaiting_approval'].includes(t.status)
  );

  const handleAvailabilityChange = (newStatus: ProviderAvailability) => {
    setAvailability(newStatus);
    DoxoStorage.updateProviderAvailability(currentProvider.id, newStatus);
  };

  const handleBookingAction = (booking: Booking, nextStatus: BookingStatus) => {
    DoxoStorage.updateBookingStatus(booking.bookingId, nextStatus);
    if (nextStatus === 'completed') {
      DoxoStorage.updateBookingStatus(booking.bookingId, 'completed', 'paid', 'სამუშაო ჩაბარებულია და გადახდილია');
    }
    // Force re-render
    setActiveSection(prev => prev);
  };

  const handleSendQuote = (task: Task) => {
    DoxoStorage.createQuote({
      taskId: task.id,
      providerId: currentProvider.id,
      providerName: currentProvider.name,
      providerNameKa: currentProvider.nameKa,
      providerAvatarUrl: currentProvider.avatarUrl,
      serviceTitleKa: task.titleKa,
      price: quotePrice,
      pricingModel: 'quote',
      expectedDurationHours: 1.5,
      expiresAt: '24 სთ განმავლობაში',
      notesKa: quoteNotes || 'მასალები და პირველადი დიაგნოსტიკა შედის ფასში.',
      status: 'pending',
    });

    setQuoteInputTaskId(null);
    setQuoteNotes('');
    alert('შეთავაზება წარმატებით გაიგზავნა კლიენტთან!');
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      {/* 1. Top Provider Persona Bar & Quick Switcher */}
      <div
        className="card"
        style={{
          marginBottom: '20px',
          background: 'var(--bg-surface)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src={currentProvider.avatarUrl}
            alt={currentProvider.name}
            style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {language === 'ka' ? currentProvider.nameKa : currentProvider.name}
              </h2>
              <span className="brand-badge">PROVIDER MODE</span>
              {currentProvider.verificationStatus === 'verified' && (
                <span style={{ color: 'var(--status-info)', display: 'flex' }} title="ვერიფიცირებული პროფილი">
                  <IconShieldCheck size={16} />
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <IconStar size={13} />
                <span>{currentProvider.rating.toFixed(2)}</span>
              </span>
              <span className="metadata-text">•</span>
              <span className="metadata-text">{currentProvider.completedJobs} საქმე</span>
              <span className="metadata-text">•</span>
              <span className="metadata-text">{currentProvider.serviceAreas.slice(0, 3).join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Persona Switcher & Onboarding Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            className="input"
            value={activeProviderId}
            onChange={e => {
              setActiveProviderId(e.target.value);
              const p = allProviders.find(x => x.id === e.target.value);
              if (p) setAvailability(p.availability);
            }}
            style={{ fontSize: '12.5px', padding: '6px 10px', borderRadius: 'var(--radius-full)' }}
          >
            {allProviders.map(p => (
              <option key={p.id} value={p.id}>
                {p.nameKa} ({p.categories[0]})
              </option>
            ))}
          </select>

          {/* Availability Status Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {(['available', 'busy', 'offline'] as ProviderAvailability[]).map(st => (
              <button
                key={st}
                onClick={() => handleAvailabilityChange(st)}
                className={`btn btn-sm ${availability === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11.5px',
                  padding: '4px 10px',
                  textTransform: 'capitalize',
                }}
              >
                {st === 'available' ? '🟢 ' : st === 'busy' ? '🟡 ' : '⚪ '}
                {st === 'available' ? 'ხელმისაწვდომი' : st === 'busy' ? 'დაკავებული' : 'გამორთული'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowOnboarding(true)}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 'var(--radius-full)', fontSize: '12px' }}
          >
            + ახალი სპეციალისტი
          </button>
        </div>
      </div>

      {/* 2. Operational Navigation Tabs (Speed Optimized) */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '20px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {[
          { id: 'today' as ProviderSectionTab, label: 'დღეს (მიმოხილვა)', badge: null },
          { id: 'requests' as ProviderSectionTab, label: 'შემომავალი მოთხოვნები', badge: incomingRequests.length },
          { id: 'bookings' as ProviderSectionTab, label: 'დაჯავშნები', badge: activeBookings.length },
          { id: 'calendar' as ProviderSectionTab, label: 'კალენდარი & გრაფიკი', badge: null },
          { id: 'messages' as ProviderSectionTab, label: 'მესიჯები', badge: null },
          { id: 'earnings' as ProviderSectionTab, label: 'შემოსავალი', badge: null },
          { id: 'profile' as ProviderSectionTab, label: 'პროფილი', badge: null },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`btn btn-sm ${activeSection === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{tab.label}</span>
            {tab.badge !== null && tab.badge > 0 && (
              <span
                style={{
                  background: activeSection === tab.id ? '#FFFFFF' : 'var(--accent-primary)',
                  color: activeSection === tab.id ? 'var(--accent-primary)' : '#FFFFFF',
                  borderRadius: '10px',
                  padding: '1px 6px',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* SECTION 1: TODAY / OVERVIEW */}
      {activeSection === 'today' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Key 4 Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div className="card">
              <span className="metadata-text">შემომავალი მოთხოვნები</span>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '4px' }}>
                {incomingRequests.length}
              </div>
              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>ახალი შეკვეთა უბანში</span>
            </div>

            <div className="card">
              <span className="metadata-text">დადასტურებული ვიზიტები</span>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {activeBookings.length}
              </div>
              <span style={{ fontSize: '11.5px', color: 'var(--status-success-text)' }}>აქტიურ გრაფიკში</span>
            </div>

            <div className="card">
              <span className="metadata-text">შესრულების მაჩვენებელი</span>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--status-success-text)', marginTop: '4px' }}>
                {currentProvider.completionRate}%
              </div>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>გაუქმება: {currentProvider.cancellationRate}%</span>
            </div>

            <div className="card">
              <span className="metadata-text">დღევანდელი შემოსავალი</span>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {completedBookings.reduce((sum, b) => sum + b.price, 0) + 120} ₾
              </div>
              <span style={{ fontSize: '11.5px', color: 'var(--status-success-text)', fontWeight: 600 }}>ავტორიზებული & ჩარიცხული</span>
            </div>
          </div>

          {/* Quick Active Schedule Timeline */}
          <div>
            <h3 className="section-title" style={{ fontSize: '17px', marginBottom: '12px' }}>
              დღევანდელი სამუშაო განრიგი
            </h3>
            {activeBookings.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                დღეს დაგეგმილი ვიზიტები არ გაქვთ. შეამოწმეთ შემომავალი მოთხოვნები.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeBookings.map(bk => (
                  <div
                    key={bk.bookingId}
                    className="card"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="brand-badge">{bk.category.toUpperCase()}</span>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{bk.serviceTitleKa}</h4>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                        <span><IconClock size={13} /> {bk.scheduledStart}</span>
                        <span>•</span>
                        <span><IconMapPin size={13} /> {bk.location}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginRight: '8px' }}>
                        {bk.price} ₾
                      </span>
                      <button
                        onClick={() => setActiveChatBooking(bk)}
                        className="btn btn-secondary btn-sm"
                      >
                        <IconMessageSquare size={13} /> ჩატი
                      </button>
                      {bk.bookingStatus === 'confirmed' && (
                        <button
                          onClick={() => handleBookingAction(bk, 'provider_on_way')}
                          className="btn btn-primary btn-sm"
                        >
                          <IconArrowRight size={13} /> გზაში ვარ
                        </button>
                      )}
                      {bk.bookingStatus === 'provider_on_way' && (
                        <button
                          onClick={() => handleBookingAction(bk, 'arrived')}
                          className="btn btn-primary btn-sm"
                        >
                          <IconMapPin size={13} /> ადგილზე ვარ
                        </button>
                      )}
                      {bk.bookingStatus === 'arrived' && (
                        <button
                          onClick={() => handleBookingAction(bk, 'completed')}
                          className="btn btn-primary btn-sm"
                          style={{ background: 'var(--status-success)' }}
                        >
                          <IconCheck size={13} /> დასრულება
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: INCOMING REQUESTS */}
      {activeSection === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="section-title" style={{ fontSize: '18px', margin: 0 }}>
              ახალი შემომავალი მოთხოვნები ({incomingRequests.length})
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              კონფიდენციალურობა დაცულია · ჩანს მხოლოდ უბანი
            </span>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
              ამ მომენტში ახალი მოთხოვნები არ არის. როდესაც კლიენტი მოითხოვს სერვისს თქვენს უბანში, აქ გამოჩნდება.
            </div>
          ) : (
            incomingRequests.map(req => (
              <div
                key={req.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  borderLeft: '4px solid var(--accent-primary)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <span className="brand-badge">{req.category.toUpperCase()}</span>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                      {req.titleKa}
                    </h4>
                    <p className="body-sm" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                      "{req.rawPrompt}"
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <span><IconMapPin size={13} /> {req.location.split(',')[0]} (უბანი)</span>
                      <span>•</span>
                      <span><IconClock size={13} /> {req.preferredTime}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>სავარაუდო ფასი:</span>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {req.estimatedPrice.min}₾ – {req.estimatedPrice.max}₾
                    </div>
                  </div>
                </div>

                {/* Inline Quote Input Tray if opened */}
                {quoteInputTaskId === req.id && (
                  <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11.5px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                          შეთავაზებული ფასი (₾)
                        </label>
                        <input
                          type="number"
                          className="input"
                          value={quotePrice}
                          onChange={e => setQuotePrice(Number(e.target.value))}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div style={{ flex: 2 }}>
                        <label style={{ fontSize: '11.5px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                          კომენტარი / პირობები
                        </label>
                        <input
                          type="text"
                          className="input"
                          placeholder="დეტალები, მასალები..."
                          value={quoteNotes}
                          onChange={e => setQuoteNotes(e.target.value)}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => setQuoteInputTaskId(null)}
                        className="btn btn-secondary btn-sm"
                      >
                        გაუქმება
                      </button>
                      <button
                        onClick={() => handleSendQuote(req)}
                        className="btn btn-primary btn-sm"
                      >
                        <IconCheck size={13} /> შეთავაზების გაგზავნა
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {quoteInputTaskId !== req.id && (
                  <div style={{ display: 'flex', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                      onClick={() => {
                        updateStatus(req.id, 'booked', 'ოსტატმა მიიღო შეკვეთა');
                        alert('შეკვეთა მიღებულია!');
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      <IconCheck size={14} />
                      <span>მიღება</span>
                    </button>
                    <button
                      onClick={() => {
                        setQuoteInputTaskId(req.id);
                        setQuotePrice(req.estimatedPrice.min);
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      <IconBriefcase size={14} />
                      <span>შეთავაზების გაგზავნა</span>
                    </button>
                    <button
                      onClick={() => {
                        updateStatus(req.id, 'cancelled', 'ოსტატმა უარი თქვა შეკვეთაზე');
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <IconX size={14} />
                      <span>უარი</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* SECTION 3: BOOKINGS */}
      {activeSection === 'bookings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 className="section-title" style={{ fontSize: '18px', margin: 0 }}>
            დაჯავშნების რეესტრი ({providerBookings.length})
          </h3>

          {providerBookings.map(bk => (
            <div
              key={bk.bookingId}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                borderLeft:
                  bk.bookingStatus === 'completed'
                    ? '4px solid var(--status-success)'
                    : bk.bookingStatus === 'cancelled'
                    ? '4px solid var(--status-danger)'
                    : '4px solid var(--accent-primary)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="brand-badge">#{bk.bookingId}</span>
                    <h4 style={{ fontSize: '15.5px', fontWeight: 700 }}>{bk.serviceTitleKa}</h4>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <span><IconClock size={13} /> {bk.scheduledStart}</span>
                    <span>•</span>
                    <span><IconMapPin size={13} /> {bk.location}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>{bk.price} ₾</div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--bg-secondary)',
                      fontSize: '11px',
                      fontWeight: 700,
                      marginTop: '3px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {bk.bookingStatus}
                  </span>
                </div>
              </div>

              {/* Status progression flow */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => setActiveChatBooking(bk)}
                  className="btn btn-secondary btn-sm"
                >
                  <IconMessageSquare size={13} /> ჩატი
                </button>

                {bk.bookingStatus === 'confirmed' && (
                  <button
                    onClick={() => handleBookingAction(bk, 'provider_on_way')}
                    className="btn btn-primary btn-sm"
                  >
                    <IconArrowRight size={13} /> გზაში ვარ
                  </button>
                )}

                {bk.bookingStatus === 'provider_on_way' && (
                  <button
                    onClick={() => handleBookingAction(bk, 'arrived')}
                    className="btn btn-primary btn-sm"
                  >
                    <IconMapPin size={13} /> ადგილზე ვარ
                  </button>
                )}

                {bk.bookingStatus === 'arrived' && (
                  <button
                    onClick={() => handleBookingAction(bk, 'completed')}
                    className="btn btn-primary btn-sm"
                    style={{ background: 'var(--status-success)' }}
                  >
                    <IconCheck size={13} /> სამუშაოს დასრულება
                  </button>
                )}

                {bk.bookingStatus === 'completed' && (
                  <span style={{ fontSize: '12.5px', color: 'var(--status-success-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IconCheck size={14} /> ჩაბარებულია და გადახდილია ({bk.paymentStatus})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 4: CALENDAR & SCHEDULE */}
      {activeSection === 'calendar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 className="section-title" style={{ fontSize: '18px', margin: 0 }}>
            სამუშაო გრაფიკი და ხელმისაწვდომობა
          </h3>
          <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>
            მონიშნეთ დროის მონაკვეთები, როდესაც მზად ხართ შეკვეთების მისაღებად.
          </p>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { day: 'ორშაბათი', key: 'mon', hours: '09:00 – 21:00', active: true },
              { day: 'სამშაბათი', key: 'tue', hours: '09:00 – 21:00', active: true },
              { day: 'ოთხშაბათი', key: 'wed', hours: '09:00 – 21:00', active: true },
              { day: 'ხუთშაბათი', key: 'thu', hours: '09:00 – 21:00', active: true },
              { day: 'პარასკევი', key: 'fri', hours: '09:00 – 21:00', active: true },
              { day: 'შაბათი', key: 'sat', hours: '10:00 – 18:00', active: true },
              { day: 'კვირა', key: 'sun', hours: 'დასვენება', active: false },
            ].map(d => (
              <div
                key={d.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{d.day}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12.5px', color: d.active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {d.hours}
                  </span>
                  <input
                    type="checkbox"
                    defaultChecked={d.active}
                    style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: MESSAGES */}
      {activeSection === 'messages' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 className="section-title" style={{ fontSize: '18px', margin: 0 }}>
            მიმოწერა კლიენტებთან
          </h3>
          {providerBookings.map(bk => (
            <div
              key={bk.bookingId}
              className="card card-hoverable"
              onClick={() => setActiveChatBooking(bk)}
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <div style={{ fontSize: '14.5px', fontWeight: 700 }}>{bk.serviceTitleKa}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  ლოკაცია: {bk.location} · {bk.scheduledStart}
                </div>
              </div>
              <button className="btn btn-secondary btn-sm">
                <IconMessageSquare size={13} /> ჩატის გახსნა
              </button>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 6: EARNINGS */}
      {activeSection === 'earnings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div className="card">
              <span className="metadata-text">კვირის შემოსავალი</span>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                840 ₾
              </div>
              <span style={{ fontSize: '12px', color: 'var(--status-success-text)' }}>+18% წინა კვირასთან</span>
            </div>
            <div className="card">
              <span className="metadata-text">გასაცემი ბალანსი (Escrow)</span>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '4px' }}>
                185 ₾
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ჩაირიცხება სამუშაოს დასრულებისთანავე</span>
            </div>
            <div className="card">
              <span className="metadata-text">საშუალო ჩეკი</span>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {Math.round((currentProvider.pricing.min + currentProvider.pricing.max) / 2)} ₾
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>თბილისის საშუალო: 75₾</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 7: PROFILE PREVIEW */}
      {activeSection === 'profile' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img
              src={currentProvider.avatarUrl}
              alt={currentProvider.name}
              style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800 }}>{currentProvider.nameKa}</h3>
              <p className="body-sm" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                {currentProvider.bioKa}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span className="brand-badge">
              {currentProvider.verificationStatus === 'verified' ? '✓ დადასტურებული პროფილი' : 'დადასტურება მიმდინარეობს'}
            </span>
            <span className="brand-badge">★ {currentProvider.rating} შეფასება</span>
            <span className="brand-badge">⚡ {currentProvider.responseTimeMinutes} წთ პასუხის დრო</span>
            <span className="brand-badge">🎯 {currentProvider.completionRate}% შესრულება</span>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            <strong>მომსახურების უბნები:</strong> {currentProvider.serviceAreas.join(', ')}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            <strong>ენები:</strong> {currentProvider.languages.join(', ')}
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      <ProviderOnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onSuccess={newP => {
          setActiveProviderId(newP.id);
          setActiveSection('profile');
        }}
      />

      {/* Contextual Chat Modal */}
      <ContextualChatModal
        isOpen={!!activeChatBooking}
        onClose={() => setActiveChatBooking(null)}
        booking={activeChatBooking}
        currentUserRole="provider"
      />
    </div>
  );
};
