import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { DoxoStorage } from '../../lib/storage/db';
import { Booking, BookingStatus } from '../../types/marketplace';
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
  IconSparkles,
  IconUser,
  IconBell,
  IconBookOpen,
} from '../common/Icons';

type UserSection = 'overview' | 'bookings' | 'history' | 'spending' | 'notifications' | 'reviews' | 'addresses' | 'settings';

// Helper: Status badge
const StatusBadge: React.FC<{ status: BookingStatus; lang: string }> = ({ status, lang }) => {
  const map: Record<BookingStatus, { label: string; labelKa: string; color: string; bg: string }> = {
    requested:         { label: 'Requested',       labelKa: 'მოთხოვნილი',      color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
    awaiting_provider: { label: 'Awaiting',        labelKa: 'მოლოდინში',       color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    awaiting_user:     { label: 'Needs Your OK',   labelKa: 'თქვენი დადასტურება', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
    confirmed:         { label: 'Confirmed',        labelKa: 'დადასტურებული',   color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    rescheduling:      { label: 'Rescheduling',     labelKa: 'გადატანა',        color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    provider_on_way:   { label: 'On the Way',       labelKa: 'გზაშია',          color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
    arrived:           { label: 'Arrived',          labelKa: 'მივიდა',          color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
    in_progress:       { label: 'In Progress',      labelKa: 'მუშავდება',       color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
    completed:         { label: 'Completed',        labelKa: 'დასრულებული',     color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    cancelled:         { label: 'Cancelled',        labelKa: 'გაუქმებული',      color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
    disputed:          { label: 'Disputed',         labelKa: 'სადავო',          color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  };
  const cfg = map[status] || map.requested;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: 'var(--radius-full)',
      fontSize: '11.5px', fontWeight: 600,
      color: cfg.color, background: cfg.bg,
    }}>
      {lang === 'ka' ? cfg.labelKa : cfg.label}
    </span>
  );
};

// Booking card component
const BookingCard: React.FC<{
  booking: Booking;
  lang: string;
  onCancel: (id: string) => void;
  onReview: (b: Booking) => void;
}> = ({ booking, lang, onCancel, onReview }) => {
  const isActive = !['completed', 'cancelled'].includes(booking.bookingStatus);
  const isCompleted = booking.bookingStatus === 'completed';

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      transition: 'all 0.15s ease',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={booking.providerAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.providerName)}&background=6366F1&color=fff&size=40`}
            alt={booking.providerName}
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {lang === 'ka' ? booking.providerNameKa : booking.providerName}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {lang === 'ka' ? booking.serviceTitleKa : booking.category}
            </div>
          </div>
        </div>
        <StatusBadge status={booking.bookingStatus} lang={lang} />
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--accent-primary)', display: 'flex' }}><IconCalendar size={13} /></span>
          {booking.scheduledStart}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--accent-primary)', display: 'flex' }}><IconMapPin size={13} /></span>
          {booking.addressLabel} · {booking.location}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
            {lang === 'ka' ? 'ღირებულება:' : 'Price:'}
          </span>
          ₾{booking.price}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {isCompleted && (
          <button
            onClick={() => onReview(booking)}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--accent-primary)', background: 'transparent',
              color: 'var(--accent-primary)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
            }}
          >
            <IconStar size={13} />
            {lang === 'ka' ? 'შეფასება' : 'Leave Review'}
          </button>
        )}
        {isActive && (
          <button
            onClick={() => onCancel(booking.bookingId)}
            style={{
              padding: '8px 14px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)', background: 'transparent',
              color: 'var(--text-muted)', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
            }}
          >
            {lang === 'ka' ? 'გაუქმება' : 'Cancel'}
          </button>
        )}
        {booking.providerPhone && isActive && (
          <a
            href={`tel:${booking.providerPhone}`}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)',
              border: 'none', background: 'var(--accent-primary)',
              color: '#fff', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              textDecoration: 'none',
            }}
          >
            <IconMessageSquare size={13} />
            {lang === 'ka' ? 'დარეკვა' : 'Call'}
          </a>
        )}
      </div>
    </div>
  );
};

// Review modal
const ReviewModal: React.FC<{
  booking: Booking;
  lang: string;
  onClose: () => void;
  onSubmit: (bookingId: string, rating: number, text: string) => void;
}> = ({ booking, lang, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-xl)', padding: '28px',
          width: '100%', maxWidth: '420px',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {lang === 'ka' ? 'შეფასების დატოვება' : 'Leave a Review'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
            <IconX size={18} />
          </button>
        </div>

        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
            {lang === 'ka' ? booking.providerNameKa : booking.providerName}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setRating(n)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: n <= rating ? '#F59E0B' : 'var(--border-subtle)',
                  fontSize: '28px', padding: '2px', transition: 'color 0.15s ease',
                }}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={lang === 'ka' ? 'კომენტარი (არასავალდებულო)...' : 'Comment (optional)...'}
          style={{
            width: '100%', minHeight: '90px',
            background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)', padding: '10px 12px',
            fontSize: '13px', color: 'var(--text-primary)', resize: 'vertical',
            fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />

        <button
          onClick={() => { onSubmit(booking.bookingId, rating, text); onClose(); }}
          style={{
            marginTop: '14px', width: '100%', padding: '12px',
            background: 'var(--accent-primary)', color: '#fff',
            border: 'none', borderRadius: 'var(--radius-md)',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          {lang === 'ka' ? 'შეფასების გამოქვეყნება' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
};

// ============================================================
// Main User Dashboard
// ============================================================
export const UserDashboardView: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const lang = language;

  const [activeSection, setActiveSection] = useState<UserSection>('overview');
  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const currentUser = DoxoStorage.getUser();
  const allBookings = DoxoStorage.getBookings();
  const notifications = DoxoStorage.getNotifications();
  const quotes = DoxoStorage.getQuotes();

  // User's bookings
  const userBookings = allBookings.filter(b => !b.userId || b.userId === currentUser.id || b.userId === 'usr_nukri');
  const activeBookings = userBookings.filter(b => !['completed', 'cancelled'].includes(b.bookingStatus));
  const completedBookings = userBookings.filter(b => b.bookingStatus === 'completed');
  const cancelledBookings = userBookings.filter(b => b.bookingStatus === 'cancelled');

  // Spending calculation
  const totalSpent = completedBookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const pendingAmount = activeBookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const unreadNotifs = notifications.filter(n => !n.read && (n.targetRole === 'user' || !n.targetRole)).length;

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    completedBookings.forEach(b => {
      const cat = lang === 'ka' ? b.serviceTitleKa : b.category;
      map[cat] = (map[cat] || 0) + b.price;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [completedBookings, lang]);

  const handleCancel = (bookingId: string) => {
    DoxoStorage.updateBookingStatus(bookingId, 'cancelled');
    setActiveSection(s => s);
  };

  const handleSubmitReview = (bookingId: string, rating: number, text: string) => {
    // Log review via audit system
    DoxoStorage.logAuditEvent({
      eventType: 'review.created',
      entityId: bookingId,
      actorId: currentUser.id,
      actorRole: 'user',
      actorName: `${currentUser.firstName} ${currentUser.lastName}`,
      detailsKa: `შეფასება: ${rating}/5 — ${text || 'კომენტარი არ არის'}`,
    });
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  // Addresses
  const addresses = currentUser.preferences?.savedAddresses || [];

  // ---- NAV ----
  const navItems: { id: UserSection; label: string; labelKa: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview',      label: 'Overview',       labelKa: 'მიმოხილვა',       icon: <IconBarChart size={15} /> },
    { id: 'bookings',      label: 'Active Bookings', labelKa: 'აქტიური ჯავშნები', icon: <IconBriefcase size={15} />, badge: activeBookings.length },
    { id: 'history',       label: 'History',         labelKa: 'ისტორია',          icon: <IconClock size={15} /> },
    { id: 'spending',      label: 'Spending',         labelKa: 'ხარჯები',          icon: <span style={{ fontSize: '13px', fontWeight: 700 }}>₾</span> },
    { id: 'notifications', label: 'Notifications',   labelKa: 'შეტყობინებები',    icon: <IconBell size={15} />, badge: unreadNotifs },
    { id: 'reviews',       label: 'Reviews',          labelKa: 'შეფასებები',       icon: <IconStar size={15} /> },
    { id: 'addresses',     label: 'Addresses',        labelKa: 'მისამართები',      icon: <IconMapPin size={15} /> },
    { id: 'settings',      label: 'Account',          labelKa: 'ანგარიში',         icon: <IconUser size={15} /> },
  ];

  // ---- RENDER SECTION ----
  const renderSection = () => {
    switch (activeSection) {
      // ---- OVERVIEW ----
      case 'overview':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Welcome banner */}
            <div style={{
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, #8B5CF6 100%)',
              borderRadius: 'var(--radius-xl)', padding: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
            }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                  {lang === 'ka' ? 'მომხმარებლის პანელი' : 'User Dashboard'}
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: 0 }}>
                  {lang === 'ka'
                    ? `გამარჯობა, ${currentUser.firstName}!`
                    : `Hello, ${currentUser.firstName}!`}
                </h2>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', margin: '6px 0 0' }}>
                  {lang === 'ka'
                    ? 'ყველა შეკვეთა და სერვისი ერთ ადგილას.'
                    : 'All your orders and services in one place.'}
                </p>
              </div>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '22px', fontWeight: 700, flexShrink: 0,
              }}>
                {currentUser.firstName?.[0] || 'U'}
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              {[
                { label: lang === 'ka' ? 'აქტიური ჯავშნები' : 'Active Bookings', value: activeBookings.length, color: '#6366F1', icon: <IconBriefcase size={18} /> },
                { label: lang === 'ka' ? 'შესრულებული' : 'Completed', value: completedBookings.length, color: '#10B981', icon: <IconCheck size={18} /> },
                { label: lang === 'ka' ? 'სულ დახარჯული' : 'Total Spent', value: `₾${totalSpent}`, color: '#F59E0B', icon: <IconStar size={18} /> },
                { label: lang === 'ka' ? 'მომლოდინე' : 'Pending Pay', value: `₾${pendingAmount}`, color: '#8B5CF6', icon: <IconClock size={18} /> },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)', padding: '16px',
                }}>
                  <div style={{ color: stat.color, marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Active bookings preview */}
            {activeBookings.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {lang === 'ka' ? 'აქტიური ჯავშნები' : 'Active Bookings'}
                  </h3>
                  <button
                    onClick={() => setActiveSection('bookings')}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {lang === 'ka' ? 'ყველა →' : 'View All →'}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeBookings.slice(0, 2).map(b => (
                    <BookingCard key={b.bookingId} booking={b} lang={lang} onCancel={handleCancel} onReview={setReviewTarget} />
                  ))}
                </div>
              </div>
            )}

            {/* Recent notifications */}
            {unreadNotifs > 0 && (
              <div style={{
                background: 'rgba(139,92,246,0.06)',
                border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: 'var(--radius-lg)', padding: '14px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer',
              }} onClick={() => setActiveSection('notifications')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#8B5CF6' }}><IconBell size={16} /></span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {lang === 'ka' ? `${unreadNotifs} წაუკითხავი შეტყობინება` : `${unreadNotifs} unread notifications`}
                  </span>
                </div>
                <span style={{ color: 'var(--accent-primary)', fontSize: '12px', fontWeight: 600 }}>
                  {lang === 'ka' ? 'ნახვა →' : 'View →'}
                </span>
              </div>
            )}
          </div>
        );

      // ---- ACTIVE BOOKINGS ----
      case 'bookings':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
              {lang === 'ka' ? 'აქტიური ჯავშნები' : 'Active Bookings'}
            </h3>
            {activeBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
                <p>{lang === 'ka' ? 'აქტიური ჯავშნები არ გაქვთ' : 'No active bookings'}</p>
              </div>
            ) : (
              activeBookings.map(b => (
                <BookingCard key={b.bookingId} booking={b} lang={lang} onCancel={handleCancel} onReview={setReviewTarget} />
              ))
            )}
          </div>
        );

      // ---- HISTORY ----
      case 'history':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
              {lang === 'ka' ? 'შეკვეთების ისტორია' : 'Booking History'}
            </h3>
            {[...completedBookings, ...cancelledBookings].length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📜</div>
                <p>{lang === 'ka' ? 'ისტორია ცარიელია' : 'No history yet'}</p>
              </div>
            ) : (
              [...completedBookings, ...cancelledBookings]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(b => (
                  <BookingCard key={b.bookingId} booking={b} lang={lang} onCancel={handleCancel} onReview={setReviewTarget} />
                ))
            )}
          </div>
        );

      // ---- SPENDING ----
      case 'spending':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {lang === 'ka' ? 'ხარჯების ანალიზი' : 'Spending Analysis'}
            </h3>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: lang === 'ka' ? 'სულ დახარჯული' : 'Total Spent', value: `₾${totalSpent}`, sub: lang === 'ka' ? `${completedBookings.length} შეკვეთა` : `${completedBookings.length} orders`, color: '#10B981' },
                { label: lang === 'ka' ? 'საშუალო ღირებულება' : 'Avg Order Value', value: completedBookings.length ? `₾${Math.round(totalSpent / completedBookings.length)}` : '₾0', sub: lang === 'ka' ? 'სერვისზე' : 'per service', color: '#6366F1' },
                { label: lang === 'ka' ? 'მომლოდინე' : 'Pending', value: `₾${pendingAmount}`, sub: lang === 'ka' ? `${activeBookings.length} ჯავშანი` : `${activeBookings.length} bookings`, color: '#F59E0B' },
                { label: lang === 'ka' ? 'შენახული გეგმები' : 'Saved by DOXO', value: `₾${Math.round(totalSpent * 0.15)}`, sub: lang === 'ka' ? 'ოპტიმიზაციით' : 'est. optimization', color: '#8B5CF6' },
              ].map((c, i) => (
                <div key={i} style={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)', padding: '16px',
                }}>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>{c.label}</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: c.color }}>{c.value}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Category breakdown */}
            {categoryBreakdown.length > 0 && (
              <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)', padding: '18px',
              }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px' }}>
                  {lang === 'ka' ? 'კატეგორიების მიხედვით' : 'By Category'}
                </h4>
                {categoryBreakdown.map(([cat, amount], i) => {
                  const pct = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
                  const colors = ['#6366F1', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
                  return (
                    <div key={i} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{cat}</span>
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>₾{amount} ({pct}%)</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: colors[i % colors.length], borderRadius: 'var(--radius-full)', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Monthly spending table */}
            {completedBookings.length > 0 && (
              <div style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              }}>
                <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {lang === 'ka' ? 'ტრანზაქციები' : 'Transactions'}
                  </h4>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {completedBookings.map(b => (
                    <div key={b.bookingId} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 18px', borderBottom: '1px solid var(--border-subtle)',
                    }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {lang === 'ka' ? b.providerNameKa : b.providerName}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          {lang === 'ka' ? b.serviceTitleKa : b.category} · {b.scheduledStart}
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#10B981' }}>₾{b.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      // ---- NOTIFICATIONS ----
      case 'notifications':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {lang === 'ka' ? 'შეტყობინებები' : 'Notifications'}
              </h3>
              {unreadNotifs > 0 && (
                <span style={{
                  background: 'var(--accent-primary)', color: '#fff',
                  fontSize: '11px', fontWeight: 700,
                  padding: '2px 8px', borderRadius: 'var(--radius-full)',
                }}>
                  {unreadNotifs} {lang === 'ka' ? 'ახალი' : 'new'}
                </span>
              )}
            </div>

            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔔</div>
                <p>{lang === 'ka' ? 'შეტყობინებები არ გაქვთ' : 'No notifications'}</p>
              </div>
            ) : (
              notifications
                .filter(n => n.targetRole === 'user' || !n.targetRole)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(n => (
                  <div key={n.id} style={{
                    background: n.read ? 'var(--bg-surface)' : 'rgba(99,102,241,0.06)',
                    border: `1px solid ${n.read ? 'var(--border-subtle)' : 'rgba(99,102,241,0.2)'}`,
                    borderRadius: 'var(--radius-lg)', padding: '14px 16px',
                    display: 'flex', gap: '12px', alignItems: 'flex-start',
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: '5px',
                      background: n.read ? 'transparent' : 'var(--accent-primary)',
                      border: n.read ? '1.5px solid var(--border-subtle)' : 'none',
                    }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                        {n.titleKa}
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{n.messageKa}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {new Date(n.createdAt).toLocaleDateString(lang === 'ka' ? 'ka-GE' : 'en-US')}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        );

      // ---- REVIEWS ----
      case 'reviews':
        const reviewableBookings = completedBookings;
        const auditReviews = DoxoStorage.getAuditEvents().filter(a => a.eventType === 'review.created' && a.actorId === currentUser.id);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {lang === 'ka' ? 'შეფასებები' : 'Reviews'}
            </h3>

            {reviewSuccess && (
              <div style={{
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 'var(--radius-lg)', padding: '12px 16px',
                color: '#10B981', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <IconCheck size={16} />
                {lang === 'ka' ? 'შეფასება წარმატებით გაიგზავნა!' : 'Review submitted successfully!'}
              </div>
            )}

            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {lang === 'ka'
                ? `${auditReviews.length} შეფასება · ${reviewableBookings.length} შეგიძლიათ შეაფასოთ`
                : `${auditReviews.length} submitted · ${reviewableBookings.length} can be reviewed`}
            </div>

            {reviewableBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>⭐</div>
                <p>{lang === 'ka' ? 'შეფასების ველი ცარიელია' : 'No completed orders to review yet'}</p>
              </div>
            ) : (
              reviewableBookings.map(b => (
                <div key={b.bookingId} style={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)', padding: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={b.providerAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.providerName)}&background=6366F1&color=fff&size=36`}
                      alt={b.providerName}
                      style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {lang === 'ka' ? b.providerNameKa : b.providerName}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {lang === 'ka' ? b.serviceTitleKa : b.category}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setReviewTarget(b)}
                    style={{
                      padding: '7px 14px', borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--accent-primary)', background: 'transparent',
                      color: 'var(--accent-primary)', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
                      whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px',
                    }}
                  >
                    <IconStar size={13} />
                    {lang === 'ka' ? 'შეფასება' : 'Review'}
                  </button>
                </div>
              ))
            )}
          </div>
        );

      // ---- ADDRESSES ----
      case 'addresses':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {lang === 'ka' ? 'შენახული მისამართები' : 'Saved Addresses'}
            </h3>
            {addresses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📍</div>
                <p>{lang === 'ka' ? 'შენახული მისამართები არ გაქვთ' : 'No saved addresses'}</p>
              </div>
            ) : (
              addresses.map(addr => (
                <div key={addr.id} style={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)', padding: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 'var(--radius-md)',
                      background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--accent-primary)', flexShrink: 0,
                    }}>
                      <IconMapPin size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{addr.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{addr.district} · {addr.addressLine}</div>
                      {addr.notes && <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{addr.notes}</div>}
                    </div>
                  </div>
                  {addr.id === currentUser.preferences?.defaultAddressId && (
                    <span style={{
                      background: 'rgba(16,185,129,0.1)', color: '#10B981',
                      fontSize: '11px', fontWeight: 700, padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                    }}>
                      {lang === 'ka' ? 'ნაგულისხმევი' : 'Default'}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        );

      // ---- SETTINGS / ACCOUNT ----
      case 'settings':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {lang === 'ka' ? 'ანგარიშის მართვა' : 'Account Management'}
            </h3>

            {/* Profile card */}
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)', padding: '20px',
              display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, #8B5CF6 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '22px', fontWeight: 700, flexShrink: 0,
              }}>
                {currentUser.firstName?.[0] || 'U'}
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {currentUser.firstName} {currentUser.lastName}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{currentUser.email}</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{currentUser.phone}</div>
              </div>
            </div>

            {/* Settings list */}
            {[
              { icon: <IconShieldCheck size={16} />, label: lang === 'ka' ? 'კონფიდენციალურობა და მონაცემები' : 'Privacy & Data', sub: lang === 'ka' ? 'პერსონალური მონაცემების კონტროლი' : 'Control your personal data' },
              { icon: <IconBell size={16} />, label: lang === 'ka' ? 'შეტყობინებები' : 'Notifications', sub: lang === 'ka' ? 'Email და Push შეტყობინებები' : 'Email & Push preferences' },
              { icon: <IconBookOpen size={16} />, label: lang === 'ka' ? 'გადახდის მეთოდები' : 'Payment Methods', sub: lang === 'ka' ? 'ბარათები და ბალანსი' : 'Cards & wallet balance' },
              { icon: <IconSparkles size={16} />, label: lang === 'ka' ? 'AI პარამეტრები' : 'AI Preferences', sub: lang === 'ka' ? 'DOXO-ს გამოცდილება' : 'Personalize DOXO behavior' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)', padding: '14px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-md)',
                    background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent-primary)',
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.sub}</div>
                  </div>
                </div>
                <span style={{ color: 'var(--text-muted)' }}><IconArrowRight size={15} /></span>
              </div>
            ))}

            {/* Danger zone */}
            <div style={{
              background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: 'var(--radius-lg)', padding: '16px',
            }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                {lang === 'ka' ? 'სახიფათო ზონა' : 'Danger Zone'}
              </div>
              <button style={{
                padding: '9px 18px', borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(239,68,68,0.4)', background: 'transparent',
                color: '#EF4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}>
                {lang === 'ka' ? 'ანგარიშის გაუქმება' : 'Delete Account'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', height: '100%', minHeight: '80vh' }}>
      {/* Section nav tabs */}
      <div style={{
        display: 'flex', gap: '2px', overflowX: 'auto', paddingBottom: '16px',
        borderBottom: '1px solid var(--border-subtle)', marginBottom: '20px',
        scrollbarWidth: 'none',
      }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: 'var(--radius-full)',
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              fontSize: '12.5px', fontWeight: activeSection === item.id ? 700 : 500,
              background: activeSection === item.id ? 'var(--accent-primary)' : 'var(--bg-surface)',
              color: activeSection === item.id ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
              position: 'relative',
            }}
          >
            {item.icon}
            {lang === 'ka' ? item.labelKa : item.label}
            {item.badge !== undefined && item.badge > 0 && (
              <span style={{
                background: activeSection === item.id ? 'rgba(255,255,255,0.3)' : 'var(--accent-primary)',
                color: activeSection === item.id ? '#fff' : '#fff',
                borderRadius: 'var(--radius-full)',
                fontSize: '10px', fontWeight: 700,
                padding: '1px 5px', minWidth: '16px', textAlign: 'center',
              }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div style={{ flex: 1 }}>
        {renderSection()}
      </div>

      {/* Review modal */}
      {reviewTarget && (
        <ReviewModal
          booking={reviewTarget}
          lang={lang}
          onClose={() => setReviewTarget(null)}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
};
