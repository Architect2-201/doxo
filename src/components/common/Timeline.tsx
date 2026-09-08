import React from 'react';

export interface TimelineEvent {
  time: string;
  title: string;
  titleKa?: string;
  description?: string;
  descriptionKa?: string;
  isCompleted?: boolean;
  isCurrent?: boolean;
}

export interface TimelineProps {
  events?: TimelineEvent[];
  lang?: 'ka' | 'en';
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  events = [
    { time: '10:02', title: 'Request created', titleKa: 'მოთხოვნა შეიქმნა', isCompleted: true },
    { time: '10:04', title: '3 specialists found', titleKa: 'მოიძებნა 3 სპეციალისტი', isCompleted: true },
    { time: '10:06', title: 'Giorgi selected', titleKa: 'არჩეულია გიორგი', isCompleted: true },
    { time: '10:35', title: 'On the way', titleKa: 'ტექნიკოსი გზაშია', isCompleted: true, isCurrent: true },
    { time: '10:48', title: 'Arrived', titleKa: 'ადგილზე მივიდა', isCompleted: false },
  ],
  lang = 'ka',
  className = '',
}) => {
  return (
    <div className={`doxo-timeline ${className}`} style={{ display: 'flex', flexDirection: 'column' }}>
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const title = lang === 'ka' && event.titleKa ? event.titleKa : event.title;
        const desc = lang === 'ka' && event.descriptionKa ? event.descriptionKa : event.description;

        return (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              position: 'relative',
              minHeight: isLast ? 'auto' : '44px',
            }}
          >
            {/* Left Column: Timestamp */}
            <div
              style={{
                width: '54px',
                flexShrink: 0,
                fontSize: '13px',
                fontWeight: 500,
                color: event.isCurrent ? 'var(--accent-primary)' : 'var(--text-muted)',
                lineHeight: 1.4,
                paddingTop: '1px',
              }}
            >
              {event.time}
            </div>

            {/* Middle Column: Thin Line and Small Node */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                margin: '0 12px',
                position: 'relative',
              }}
            >
              {/* Small Node */}
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  marginTop: '5px',
                  backgroundColor: event.isCurrent
                    ? 'var(--accent-primary)'
                    : event.isCompleted
                    ? 'var(--text-primary)'
                    : 'var(--border-subtle)',
                  boxShadow: event.isCurrent ? '0 0 0 3px var(--accent-light)' : 'none',
                  flexShrink: 0,
                  zIndex: 2,
                }}
              />

              {/* Thin Vertical Line */}
              {!isLast && (
                <div
                  style={{
                    position: 'absolute',
                    top: '13px',
                    bottom: '-4px',
                    width: '1px',
                    backgroundColor: event.isCompleted ? 'var(--border-medium)' : 'var(--border-subtle)',
                    zIndex: 1,
                  }}
                />
              )}
            </div>

            {/* Right Column: Title and details */}
            <div style={{ flex: 1, paddingBottom: isLast ? '0' : '16px' }}>
              <div
                style={{
                  fontSize: '14.5px',
                  fontWeight: event.isCurrent ? 600 : 500,
                  color: event.isCurrent ? 'var(--text-primary)' : event.isCompleted ? 'var(--text-secondary)' : 'var(--text-muted)',
                  lineHeight: 1.4,
                }}
              >
                {title}
              </div>
              {desc && (
                <div className="metadata-text" style={{ marginTop: '2px', color: 'var(--text-muted)' }}>
                  {desc}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
