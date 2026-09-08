import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DoxoStorage } from '../../lib/storage/db';
import { Provider, WeeklySchedule, DaySchedule } from '../../types/provider';
import { PricingModel } from '../../types/marketplace';
import { ServiceCategory } from '../../types/task';
import { Modal } from '../common/Modal';
import {
  IconCheck,
  IconShieldCheck,
  IconClock,
  IconMapPin,
  IconSparkles,
  IconBriefcase,
  IconArrowRight,
  IconAlertCircle,
} from '../common/Icons';

interface ProviderOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newProvider: Provider) => void;
}

const ALL_DISTRICTS = [
  'ვაკე',
  'საბურთალო',
  'ვერა',
  'მთაწმინდა',
  'დიდუბე',
  'ისანი',
  'გლდანი',
  'ჩუღურეთი',
  'დიღომი',
  'ნუცუბიძე',
  'ბაგები',
];

const CATEGORIES_LIST: { id: ServiceCategory; titleKa: string }[] = [
  { id: 'cleaning', titleKa: 'დასუფთავება & დალაგება' },
  { id: 'plumbing', titleKa: 'სანტექნიკა & გაჟონვა' },
  { id: 'electrician', titleKa: 'ელექტრიკოსი & უსაფრთხოება' },
  { id: 'ac_heating', titleKa: 'კონდიციონერი & გათბობა' },
  { id: 'courier', titleKa: 'კურიერი & დავალებები' },
  { id: 'car_wash', titleKa: 'მობილური ავტორეცხვა' },
];

const PRICING_MODELS: { id: PricingModel; titleKa: string; descKa: string }[] = [
  { id: 'fixed', titleKa: 'ფიქსირებული ფასი', descKa: 'მკაფიო, უცვლელი ტარიფი თითო სამუშაოზე' },
  { id: 'starting_from', titleKa: 'ფასი იწყება (დან)', descKa: 'მინიმალური საწყისი ფასი, ზუსტდება ადგილზე' },
  { id: 'price_range', titleKa: 'ფასის დიაპაზონი', descKa: 'მაგალითად: 60₾ – 90₾ სირთულის მიხედვით' },
  { id: 'quote_required', titleKa: 'შეთავაზებით / შეთანხმებით', descKa: 'თითოეულ შეკვეთაზე ინდივიდუალური შეთავაზების გაგზავნა' },
];

export const ProviderOnboardingModal: React.FC<ProviderOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { language } = useLanguage();
  const [step, setStep] = useState(1);

  // Form State
  const [nameKa, setNameKa] = useState('');
  const [phone, setPhone] = useState('+995 ');
  const [bioKa, setBioKa] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  );
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategory[]>(['plumbing']);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(['ვაკე', 'საბურთალო']);
  const [pricingModel, setPricingModel] = useState<PricingModel>('price_range');
  const [minPrice, setMinPrice] = useState<number>(60);
  const [maxPrice, setMaxPrice] = useState<number>(90);
  const [baseCalloutFee, setBaseCalloutFee] = useState<number>(25);
  const [languages, setLanguages] = useState<string[]>(['ქართული']);
  const [docIdUploaded, setDocIdUploaded] = useState(false);
  const [docCertUploaded, setDocCertUploaded] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleDistrict = (district: string) => {
    setSelectedDistricts(prev =>
      prev.includes(district) ? prev.filter(d => d !== district) : [...prev, district]
    );
  };

  const toggleCategory = (cat: ServiceCategory) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? (prev.length > 1 ? prev.filter(c => c !== cat) : prev) : [...prev, cat]
    );
  };

  const toggleLanguage = (lang: string) => {
    setLanguages(prev =>
      prev.includes(lang) ? (prev.length > 1 ? prev.filter(l => l !== lang) : prev) : [...prev, lang]
    );
  };

  const handleSubmit = () => {
    const newProv: Provider = {
      id: `prov_custom_${Date.now()}`,
      name: nameKa || 'ახალი სპეციალისტი',
      nameKa: nameKa || 'ახალი სპეციალისტი',
      avatarUrl: avatarUrl,
      phone: phone,
      categories: selectedCategories,
      serviceAreas: selectedDistricts,
      rating: 5.0,
      reviewCount: 0,
      completedJobs: 0,
      verificationBadge: docIdUploaded ? 'verified' : 'fast_response',
      verificationStatus: docIdUploaded ? 'pending' : 'unverified',
      documentsStatus: docIdUploaded ? 'pending_review' : 'not_submitted',
      completionRate: 100,
      cancellationRate: 0,
      responseTimeMinutes: 5,
      pricingModel: pricingModel,
      availability: 'available',
      estimatedArrivalMinutes: 30,
      pricing: {
        min: minPrice,
        max: maxPrice,
        baseCalloutFee: baseCalloutFee,
        unit: 'სამუშაოზე',
      },
      languages: languages,
      bio: bioKa || 'პროფესიონალი სპეციალისტი DOXO ქსელში.',
      bioKa: bioKa || 'პროფესიონალი სპეციალისტი DOXO ქსელში.',
      specialties: selectedDistricts.slice(0, 3),
      specialtiesKa: selectedDistricts.slice(0, 3),
      completedSimilarTasksCount: 0,
      matchScore: 90,
      matchReasons: ['ახლად რეგისტრირებული პროვაიდერი', 'ხელმისაწვდომია შერჩეულ უბნებში'],
      matchRationaleKa: 'ახალი პროვაიდერი DOXO ქსელში გადამოწმების პროცესში.',
      matchRationaleEn: 'New provider in DOXO network under verification.',
      isFavorite: false,
    };

    DoxoStorage.addProvider(newProv);
    setSubmittedStatus('დადასტურება მიმდინარეობს');
    setTimeout(() => {
      onSuccess(newProv);
      onClose();
    }, 1200);
  };

  const stepsHeaders = [
    'ძირითადი ინფორმაცია',
    'სერვისები',
    'მომსახურების არეალი',
    'ტარიფები და ფასწარმოქმნა',
    'ხელმისაწვდომობა',
    'ენები',
    'ვერიფიკაცია და საბუთები',
    'გადახედვა და გაგზავნა',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={language === 'ka' ? 'სპეციალისტის რეგისტრაცია' : 'Provider Onboarding'}
      maxWidth="560px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Step Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
              ნაბიჯი {step} / 8 — {stepsHeaders[step - 1]}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: step === 8 ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-secondary)',
                color: step === 8 ? 'var(--status-success-text)' : 'var(--text-secondary)',
              }}
            >
              {step === 8 ? 'პროფილი მომზადებულია' : `${Math.round((step / 8) * 100)}%`}
            </span>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${(step / 8) * 100}%`,
                height: '100%',
                background: 'var(--accent-primary)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* STEP 1: Basic Information */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                სახელი და გვარი *
              </label>
              <input
                type="text"
                className="input"
                placeholder="მაგ: გიორგი ბერიძე"
                value={nameKa}
                onChange={e => setNameKa(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                ტელეფონის ნომერი (პირადი / სამუშაო) *
              </label>
              <input
                type="tel"
                className="input"
                placeholder="+995 5xx xx xx xx"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                მოკლე ინფორმაცია გამოცდილების შესახებ
              </label>
              <textarea
                className="input"
                rows={3}
                placeholder="რამდენი წლის გამოცდილება გაქვს, რა ინსტრუმენტებით მუშაობ..."
                value={bioKa}
                onChange={e => setBioKa(e.target.value)}
                style={{ width: '100%', resize: 'none' }}
              />
            </div>
          </div>
        )}

        {/* STEP 2: Services */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>
              აირჩიე მიმართულებები, რომლებშიც გსურს შეკვეთების მიღება:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              {CATEGORIES_LIST.map(cat => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <div
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'var(--accent-light)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {cat.titleKa}
                    </span>
                    <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: 'var(--accent-primary)' }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Service Area */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>
              თბილისის რომელი უბნების მომსახურება შეგიძლია?
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ALL_DISTRICTS.map(dist => {
                const isSelected = selectedDistricts.includes(dist);
                return (
                  <button
                    type="button"
                    key={dist}
                    onClick={() => toggleDistrict(dist)}
                    className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ borderRadius: 'var(--radius-full)', padding: '6px 14px' }}
                  >
                    <IconMapPin size={12} />
                    <span>{dist}</span>
                  </button>
                );
              })}
            </div>
            {selectedDistricts.length === 0 && (
              <span style={{ fontSize: '12px', color: 'var(--status-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <IconAlertCircle size={14} /> მინიმუმ 1 უბანი უნდა იყოს არჩეული
              </span>
            )}
          </div>
        )}

        {/* STEP 4: Pricing Model */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
              ფასწარმოქმნის მოდელი:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {PRICING_MODELS.map(pm => {
                const isSelected = pricingModel === pm.id;
                return (
                  <div
                    key={pm.id}
                    onClick={() => setPricingModel(pm.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'var(--accent-light)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {pm.titleKa}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {pm.descKa}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>მინ. ფასი (₾)</label>
                <input
                  type="number"
                  className="input"
                  value={minPrice}
                  onChange={e => setMinPrice(Number(e.target.value))}
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>მაქს. ფასი (₾)</label>
                <input
                  type="number"
                  className="input"
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Availability */}
        {step === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>
              სტანდარტული სამუშაო დრო. ნებისმიერ მომენტში შეგეძლება გრაფიკის შეცვლა პროვაიდერის პანელიდან.
            </p>
            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 600 }}>ორშაბათი – პარასკევი</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)' }}>09:00 – 21:00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 600 }}>შაბათი</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)' }}>10:00 – 18:00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 600 }}>კვირა</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>დასვენება</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="sameDayCheck" defaultChecked style={{ accentColor: 'var(--accent-primary)' }} />
              <label htmlFor="sameDayCheck" style={{ fontSize: '13px', cursor: 'pointer' }}>
                მზად ვარ იმავე დღის ექსპრეს შეკვეთებისთვის
              </label>
            </div>
          </div>
        )}

        {/* STEP 6: Languages */}
        {step === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>
              რომელ ენებზე შეგიძლია კლიენტებთან კომუნიკაცია?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['ქართული', 'English', 'Russian'].map(lang => {
                const isSelected = languages.includes(lang);
                return (
                  <div
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'var(--accent-light)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{lang}</span>
                    <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: 'var(--accent-primary)' }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 7: Verification */}
        {step === 7 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconShieldCheck size={16} /> DOXO Trust & Verification
              </span>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                ვერიფიცირებული პროვაიდერები 3-ჯერ მეტ შეკვეთას იღებენ. ატვირთე პირადობის მოწმობა და სერტიფიკატი.
              </p>
            </div>

            {/* Document 1: ID */}
            <div
              style={{
                border: '1.5px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'center',
                background: docIdUploaded ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface)',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                პირადობის მოწმობა / პასპორტი
              </span>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '4px 0 10px' }}>
                {docIdUploaded ? '✓ ატვირთულია (id_card_front.jpg)' : 'PDF ან JPG (ორივე მხარე)'}
              </p>
              <button
                type="button"
                onClick={() => setDocIdUploaded(!docIdUploaded)}
                className={`btn btn-sm ${docIdUploaded ? 'btn-secondary' : 'btn-primary'}`}
              >
                {docIdUploaded ? 'წაშლა' : 'ფაილის არჩევა'}
              </button>
            </div>

            {/* Document 2: Certificate */}
            <div
              style={{
                border: '1.5px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                textAlign: 'center',
                background: docCertUploaded ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface)',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                კვალიფიკაციის სერტიფიკატი (არასავალდებულო)
              </span>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '4px 0 10px' }}>
                {docCertUploaded ? '✓ ატვირთულია (certificate_2026.pdf)' : 'დიპლომი, ტექნიკური სერტიფიკატი'}
              </p>
              <button
                type="button"
                onClick={() => setDocCertUploaded(!docCertUploaded)}
                className={`btn btn-sm ${docCertUploaded ? 'btn-secondary' : 'btn-primary'}`}
              >
                {docCertUploaded ? 'წაშლა' : 'ფაილის არჩევა'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 8: Review and Submit */}
        {step === 8 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>სპეციალისტი:</span>
                <span style={{ fontSize: '13.5px', fontWeight: 700 }}>{nameKa || 'ახალი სპეციალისტი'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>სერვისები:</span>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{selectedCategories.join(', ')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>უბნები:</span>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{selectedDistricts.join(', ')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>ტარიფი:</span>
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                  {minPrice}₾ – {maxPrice}₾
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>ვერიფიკაციის სტატუსი:</span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: docIdUploaded ? 'var(--status-success-text)' : '#F59E0B',
                  }}
                >
                  {docIdUploaded ? 'დადასტურება მიმდინარეობს' : 'არავერიფიცირებული'}
                </span>
              </div>
            </div>

            {submittedStatus && (
              <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--status-success-text)', fontWeight: 700 }}>
                ✓ {submittedStatus} — პროფილი წარმატებით გადაიგზავნა!
              </div>
            )}
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '10px' }}>
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="btn btn-secondary"
              style={{ padding: '10px 18px' }}
            >
              უკან
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '10px 18px' }}
            >
              გაუქმება
            </button>
          )}

          {step < 8 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="btn btn-primary"
              style={{ padding: '10px 24px' }}
              disabled={step === 1 && !nameKa.trim()}
            >
              <span>შემდეგი</span>
              <IconArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="btn btn-primary"
              style={{ padding: '10px 28px', background: 'var(--status-success)' }}
              disabled={!!submittedStatus}
            >
              <IconCheck size={16} />
              <span>პროფილის გაგზავნა</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
