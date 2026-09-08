import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  IconSparkles,
  IconShieldCheck,
  IconCheck,
  IconClock,
  IconHome,
  IconBriefcase,
  IconBarChart,
  IconBookOpen,
} from './Icons';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [activeSection, setActiveSection] = useState<'flow' | 'ai' | 'pricing' | 'escrow' | 'features' | 'privacy'>('flow');

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-content animate-scale-in"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '740px',
          width: '94%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--radius-card, 16px)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--surface-sunken)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
              }}
            >
              <IconBookOpen size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {language === 'ka' ? 'DOXO ინსტრუქცია & ფუნქციების გზამკვლევი' : 'DOXO User Guide & Feature Manual'}
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                {language === 'ka' ? 'როგორ მუშაობს თქვენი პირადი ციფრული ოპერატორი' : 'How your personal life operator operates'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{ fontSize: '18px', color: 'var(--text-secondary)' }}
            title={language === 'ka' ? 'დახურვა' : 'Close'}
          >
            ✕
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            padding: '10px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            overflowX: 'auto',
            background: 'var(--surface-base)',
          }}
        >
          {[
            { id: 'flow', labelKa: 'როგორ მუშაობს', labelEn: 'How It Works' },
            { id: 'ai', labelKa: 'AI ბრძანებები', labelEn: 'AI Commands' },
            { id: 'pricing', labelKa: 'ფასწარმოქმნა', labelEn: 'Pricing Models' },
            { id: 'escrow', labelKa: 'გადახდა & დაცვა', labelEn: 'Escrow & Safety' },
            { id: 'features', labelKa: 'ფუნქციები & მოდულები', labelEn: 'Modules' },
            { id: 'privacy', labelKa: 'უსაფრთხოება & მისამართი', labelEn: 'Privacy' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className="btn btn-sm"
              style={{
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: activeSection === tab.id ? 700 : 500,
                background: activeSection === tab.id ? 'var(--accent-primary)' : 'transparent',
                color: activeSection === tab.id ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {language === 'ka' ? tab.labelKa : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
          {/* 1. HOW IT WORKS FLOW */}
          {activeSection === 'flow' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
                {language === 'ka' ? 'DOXO-ს მუშაობის 4 ძირითადი საფეხური' : 'DOXO 4-Step Operational Lifecycle'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '18px' }}>
                {language === 'ka'
                  ? 'DOXO არ არის უბრალო ჩატი. ის არის პირადი ოპერატორი, რომელიც რეალურ სამყაროში საქმეების შესრულებას კოორდინაციას უწევს.'
                  : 'DOXO is not a simple chatbot; it is a personal operator orchestrating real-world execution.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'var(--surface-sunken)', padding: '14px 16px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>1</span>
                    {language === 'ka' ? 'სურვილის გაგება (Intent)' : 'Intent Understanding'}
                  </div>
                  <p style={{ margin: '6px 0 0 30px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {language === 'ka'
                      ? 'მიუთითეთ რა გსურთ ბუნებრივი ქართულით — ტექსტით, ხმოვანი კარნახით ან ფოტოს მიმაგრებით. მაგ: "ხვალ საღამოს მინდა ბინის დალაგება და კონდიციონერის შემოწმება".'
                      : 'State your request naturally in Georgian or English. Attach voice commands or photos.'}
                  </p>
                </div>

                <div style={{ background: 'var(--surface-sunken)', padding: '14px 16px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--status-success-text)' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--status-success)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>2</span>
                    {language === 'ka' ? 'შერჩევა და შედარება (Matching)' : 'Smart Provider Matching'}
                  </div>
                  <p style={{ margin: '6px 0 0 30px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {language === 'ka'
                      ? 'ალგორითმი ამოწმებს ოსტატის რეალურ ხელმისაწვდომობას, უბანს, შეფასებებს, დასრულების მაჩვენებელს და გამჭვირვალედ გაჩვენებთ რეკომენდაციის მიზეზებს.'
                      : 'The matching engine filters providers by verified schedule, neighborhood, ratings, and displays transparent reasons.'}
                  </p>
                </div>

                <div style={{ background: 'var(--surface-sunken)', padding: '14px 16px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#F59E0B' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#F59E0B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>3</span>
                    {language === 'ka' ? 'დამტკიცება (Strict Approval)' : 'Explicit User Approval'}
                  </div>
                  <p style={{ margin: '6px 0 0 30px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {language === 'ka'
                      ? 'DOXO არასდროს ხარჯავს თქვენს ფულს და არ აფორმებს ჯავშანს თქვენი ნებართვის გარეშე. თქვენ ხედავთ ზუსტ ფასს, დროს, პირობებს და თავად ამტკიცებთ.'
                      : 'DOXO never spends money without explicit consent. You see exact price, duration, and tap Confirm.'}
                  </p>
                </div>

                <div style={{ background: 'var(--surface-sunken)', padding: '14px 16px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--status-info)' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--status-info)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>4</span>
                    {language === 'ka' ? 'კოორდინაცია & დასრულება (Execution)' : 'Execution & Completion'}
                  </div>
                  <p style={{ margin: '6px 0 0 30px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {language === 'ka'
                      ? 'თვალყური ადევნეთ სტატუსს (გზაშია -> ადგილზეა -> მუშაობს -> დასრულდა), ისარგებლეთ კონტექსტური ჩატით და შეაფასეთ შესრულებული სამუშაო.'
                      : 'Track the live lifecycle, communicate in booking-bound chat, and rate the completed job.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. AI COMMAND CENTER */}
          {activeSection === 'ai' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
                {language === 'ka' ? 'AI ბრძანებები და საუბრის შესაძლებლობები' : 'AI Commands & Conversation Flow'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {language === 'ka'
                  ? 'DOXO-ს ესმის რთული მრავალმიზნობრივი წინადადებები და ბუნებრივი შესწორებები.'
                  : 'DOXO understands complex multi-service statements and conversational edits.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                    {language === 'ka' ? '1. მრავალი საქმის ერთად დაგეგმვა (Multi-Task Intent)' : '1. Multi-Task Intent'}
                  </div>
                  <div style={{ background: 'var(--surface-sunken)', padding: '8px 12px', borderRadius: '6px', margin: '6px 0', fontFamily: 'monospace', fontSize: '12.5px' }}>
                    "ხვალ საღამოს მინდა ბინის დალაგება, მანქანის რეცხვა და კონდიციონერი"
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {language === 'ka'
                      ? 'DOXO ერთდროულად შექმნის 3-ნაწილიან სტრუქტურულ გეგმას, იპოვის შესაბამის ოსტატებს და შემოგთავაზებთ ერთობლივ ვიზიტს დროის დასაზოგად.'
                      : 'DOXO generates a 3-part structured plan with optimized time windows and estimated pricing.'}
                  </div>
                </div>

                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                    {language === 'ka' ? '2. გეგმის ბუნებრივი ცვლილება (Conversational Edits)' : '2. Conversational Edits'}
                  </div>
                  <ul style={{ margin: '6px 0 0 20px', padding: 0, fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    <li><strong>"დალაგება 1 საათით ადრე გადაიტანე"</strong> — განაახლებს დროს და მონიშნავს პულსირებადი ბეიჯით.</li>
                    <li><strong>"კონდიციონერი ამოიღე"</strong> — ამოშლის კონკრეტულ სერვისს და ხელახლა დაითვლის ჯამს.</li>
                    <li><strong>"ყველაფერი შაბათისთვის გადაიტანე"</strong> — მთლიან გეგმას გადაიტანს შაბათზე.</li>
                    <li><strong>"იგივე დამლაგებელი მინდა მომავალ კვირაშიც"</strong> — პრიორიტეტს მიანიჭებს თქვენს რჩეულ/ისტორიულ სპეციალისტს.</li>
                  </ul>
                </div>

                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                    {language === 'ka' ? '3. ცხელი კლავიშები (Keyboard Shortcuts)' : '3. Keyboard Shortcuts'}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    დააჭირეთ <strong>Cmd + K</strong> (ან <strong>Ctrl + K</strong>) ეკრანის ნებისმიერი წერტილიდან უნივერსალური ბრძანებათა პალიტრის გასახსნელად.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. PRICING MODELS */}
          {activeSection === 'pricing' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
                {language === 'ka' ? 'გამჭვირვალე ფასწარმოქმნის 4 მოდელი' : 'Transparent Pricing Models'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {language === 'ka'
                  ? 'DOXO-ში არ არსებობს ფარული საკომისიოები ან შეცდომაში შემყვანი ციფრები. ყველა სერვისი იყენებს 4-დან ერთ-ერთ ზუსტ მოდელს:'
                  : 'Zero hidden fees. Every service uses one of 4 explicit models:'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                <div style={{ background: 'var(--surface-sunken)', padding: '14px', borderRadius: '10px' }}>
                  <span className="brand-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-success-text)' }}>
                    {language === 'ka' ? 'ფიქსირებული ფასი' : 'Fixed Price'}
                  </span>
                  <div style={{ fontWeight: 700, margin: '8px 0 4px', fontSize: '15px' }}>70 ₾ ფიქსირებული</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    სტანდარტული სამუშაოები (მაგ. ბინის გენერალური დალაგება ან კონდიციონერის შემოწმება). ფასი უცვლელია.
                  </div>
                </div>

                <div style={{ background: 'var(--surface-sunken)', padding: '14px', borderRadius: '10px' }}>
                  <span className="brand-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)' }}>
                    {language === 'ka' ? 'საწყისი ფასი' : 'Starting From'}
                  </span>
                  <div style={{ fontWeight: 700, margin: '8px 0 4px', fontSize: '15px' }}>50 ₾-დან</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    საბაზისო გამოძახების და დიაგნოსტიკის ტარიფი. სამუშაოს მოცულობის მიხედვით შეიძლება დაკორექტირდეს.
                  </div>
                </div>

                <div style={{ background: 'var(--surface-sunken)', padding: '14px', borderRadius: '10px' }}>
                  <span className="brand-badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                    {language === 'ka' ? 'ფასის დიაპაზონი' : 'Price Range'}
                  </span>
                  <div style={{ fontWeight: 700, margin: '8px 0 4px', fontSize: '15px' }}>50–80 ₾</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    მინიმალური და მაქსიმალური ზღვარი ცნობილია წინასწარ.
                  </div>
                </div>

                <div style={{ background: 'var(--surface-sunken)', padding: '14px', borderRadius: '10px' }}>
                  <span className="brand-badge" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
                    {language === 'ka' ? 'შეთანხმებით (Quote Flow)' : 'Quote Required'}
                  </span>
                  <div style={{ fontWeight: 700, margin: '8px 0 4px', fontSize: '15px' }}>ფასი შეთანხმებით</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    რთული ან ინდივიდუალური საქმეები. სპეციალისტი გიგზავნით ოფიციალურ შეთავაზებას 24-საათიანი ტაიმერით.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. ESCROW & SAFETY */}
          {activeSection === 'escrow' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
                {language === 'ka' ? 'დეპოზიტური დაცვა (Escrow) და გაუქმების პოლიტიკა' : 'Escrow Deposit & Refund Policy'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {language === 'ka'
                  ? 'როგორ იცავს DOXO თქვენს ფულს და უფლებებს:'
                  : 'How DOXO safeguards your finances and guarantees resolution:'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'var(--surface-sunken)', padding: '14px', borderRadius: '10px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--status-success-text)' }}>
                    🛡️ თანხა რჩება დეპოზიტზე (Authorized Hold)
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    ჯავშნის დადასტურებისას თანხა არ ერიცხება ოსტატს პირდაპირ. ის ინახება დაცულ Escrow ანგარიშზე და ოსტატს გადაეცემა მხოლოდ მას შემდეგ, რაც სამუშაო დასრულდება და თქვენ დაადასტურებთ.
                  </div>
                </div>

                <div style={{ background: 'var(--surface-sunken)', padding: '14px', borderRadius: '10px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                    ⏱️ უფასო გაუქმება (Free Cancellation)
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    ვიზიტამდე 2 საათზე ადრე გაუქმების შემთხვევაში დეპოზიტი 100%-ით თავისუფლდება ყოველგვარი საკომისიოს გარეშე.
                  </div>
                </div>

                <div style={{ background: 'var(--surface-sunken)', padding: '14px', borderRadius: '10px' }}>
                  <div style={{ fontWeight: 700, color: '#F59E0B' }}>
                    🚨 პრობლემის დაფიქსირება & Dispute Flow
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    თუ სამუშაო არ შესრულდა ან ხარისხი არ შეესაბამება შეთანხმებას, შეგიძლიათ დააჭიროთ "პრობლემის დაფიქსირება". დეპოზიტი გაიყინება და ადმინისტრაცია პირადად მოაგვარებს საკითხს.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. MODULES */}
          {activeSection === 'features' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
                {language === 'ka' ? 'DOXO-ს ძირითადი მოდულები' : 'Main DOXO Modules'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {language === 'ka'
                  ? 'მარცხენა მენიუში ხელმისაწვდომია თქვენი ყოველდღიური ცხოვრების სამართავი ცენტრები:'
                  : 'Access all life management hubs from the left navigation bar:'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IconHome size={16} /> ჩემი სახლი (My Home)
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    ბინის ტექნიკის რეესტრი (კონდიციონერი, სარეცხი მანქანა), გარანტიის ვადები, მრიცხველები და საყოფაცხოვრებო ისტორია.
                  </div>
                </div>

                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📥 Life Inbox
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    ყოველდღიური ფიქრების, გადასახადების და რუტინული საქმეების ჩანიშვნის ადგილი. 1 დაწკაპუნებით გადააქციეთ DOXO-ს დავალებად.
                  </div>
                </div>

                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    👨‍👩‍👧 ოჯახი (Family Hub)
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    ოჯახის წევრებისთვის დავალებების გადანაწილება, ბავშვთა საჭიროებები და საერთო გეგმები.
                  </div>
                </div>

                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IconBriefcase size={16} /> ოსტატის რეჟიმი (Provider Mode)
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    სპეციალისტებისთვის განკუთვნილი სამუშაო პანელი: შემომავალი მოთხოვნები, გრაფიკი, ჯავშნები, ჩატი და შემოსავლის აღრიცხვა.
                  </div>
                </div>

                <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IconBarChart size={16} /> ადმინის პანელი (Admin & Telemetry)
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    სისტემური ჯანმრთელობის შემოწმება (/health), პროვაიდერების ვერიფიკაცია, აუდიტის ლოგი და ავტომატური E2E ტესტები.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. PRIVACY & ADDRESS */}
          {activeSection === 'privacy' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
                {language === 'ka' ? 'კონფიდენციალურობა, მისამართი და მონაცემთა დაცვა' : 'Privacy, Location & Data Security'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {language === 'ka'
                  ? 'DOXO შექმნილია პრინციპით: თქვენი მონაცემები ეკუთვნის მხოლოდ თქვენ.'
                  : 'DOXO is built on the principle: your data belongs entirely to you.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'var(--surface-sunken)', padding: '14px', borderRadius: '10px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                    📍 მისამართის დაცვა (Location Privacy Masking)
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    სპეციალისტებს ძიების და შეთავაზების ეტაპზე ეჩვენებათ მხოლოდ თქვენი უბანი (მაგ. ვაკე ან საბურთალო). თქვენი ზუსტი ქუჩის მისამართი და ბინის ნომერი იხსნება მხოლოდ ოფიციალურად დადასტურებული ჯავშნის შემდეგ.
                  </div>
                </div>

                <div style={{ background: 'var(--surface-sunken)', padding: '14px', borderRadius: '10px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--status-success-text)' }}>
                    🧠 AI მეხსიერების სრული კონტროლი
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    ჰედერში მდებარე ფარის ღილაკზე დაჭერით (Privacy Center) შეგიძლიათ ნებისმიერ დროს გამორთოთ AI მეხსიერება, წაშალოთ დამახსოვრებული პრეფერენციები ან ჩამოტვირთოთ თქვენი მონაცემების სრული ასლი JSON ფორმატში.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--surface-sunken)',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            DOXO OS v2.5 · Calm Intelligence
          </div>
          <button
            onClick={onClose}
            className="btn btn-primary btn-sm"
            style={{ padding: '8px 20px', borderRadius: 'var(--radius-btn)' }}
          >
            {language === 'ka' ? 'გავიგე, მადლობა' : 'Got it, thank you'}
          </button>
        </div>
      </div>
    </div>
  );
};
