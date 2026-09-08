import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DoxoStorage } from '../../lib/storage/db';
import { ServiceCategory } from '../../types/task';
import { ServiceCatalogItem, PricingModel } from '../../types/marketplace';
import {
  IconWrench,
  IconDroplets,
  IconWind,
  IconPackage,
  IconZap,
  IconSparkles,
  IconSearch,
  IconClock,
  IconMapPin,
  IconShieldCheck,
  IconArrowRight,
} from '../common/Icons';

interface ServicesCatalogViewProps {
  onCategorySelect: (category: ServiceCategory) => void;
  onServiceSelect?: (service: ServiceCatalogItem) => void;
}

export const ServicesCatalogView: React.FC<ServicesCatalogViewProps> = ({
  onCategorySelect,
  onServiceSelect,
}) => {
  const { language } = useLanguage();
  const services = DoxoStorage.getServices();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPricingModel, setSelectedPricingModel] = useState<string>('all');

  const categories = [
    { id: 'all', titleKa: 'ყველა' },
    { id: 'cleaning', titleKa: 'დასუფთავება' },
    { id: 'plumbing', titleKa: 'სანტექნიკა' },
    { id: 'electrician', titleKa: 'ელექტრიკოსი' },
    { id: 'ac_heating', titleKa: 'კონდიციონერი & გათბობა' },
    { id: 'courier', titleKa: 'კურიერი' },
  ];

  const pricingModels: { id: string; titleKa: string }[] = [
    { id: 'all', titleKa: 'ყველა ტარიფი' },
    { id: 'fixed', titleKa: 'ფიქსირებული' },
    { id: 'starting_from', titleKa: 'დან...' },
    { id: 'price_range', titleKa: 'დიაპაზონი' },
    { id: 'quote_required', titleKa: 'შეთავაზებით' },
  ];

  const futureCategories = [
    'ავტო მომსახურება (Car Service)',
    'გადაზიდვა (Moving)',
    'IT დამხმარე (IT Support)',
    'შინაური ცხოველები (Pet Care)',
    'სილამაზე & მოვლა (Beauty)',
    'რეპეტიტორები (Tutors)',
    'საყოფაცხოვრებო ტექნიკის შეკეთება (Appliance Repair)',
    'ავეჯის აწყობა (Furniture Assembly)',
    'სამღებრო სამუშაოები (Painting)',
    'ფოტოგრაფია & გადაღება (Photography)',
  ];

  // Filter logic
  const filteredServices = services.filter(s => {
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesModel = selectedPricingModel === 'all' || s.pricingModel === selectedPricingModel;
    const matchesSearch =
      !searchQuery ||
      s.nameKa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.descriptionKa.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesModel && matchesSearch;
  });

  const getPriceBadge = (service: ServiceCatalogItem) => {
    if (service.pricingModel === 'fixed') {
      return (
        <span className="brand-badge" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--status-success-text)' }}>
          {service.basePrice} ₾ ფიქსირებული
        </span>
      );
    }
    if (service.pricingModel === 'starting_from') {
      return (
        <span className="brand-badge" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-primary)' }}>
          {service.basePrice || service.priceRange?.min} ₾-დან
        </span>
      );
    }
    if (service.pricingModel === 'price_range' && service.priceRange) {
      return (
        <span className="brand-badge" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-primary)' }}>
          {service.priceRange.min}₾ – {service.priceRange.max}₾
        </span>
      );
    }
    return (
      <span className="brand-badge" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#D97706' }}>
        ფასი შეთანხმებით / შეთავაზებით
      </span>
    );
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '22px' }}>
        <h2 className="hero-title" style={{ fontSize: '26px' }}>
          {language === 'ka' ? 'სერვისების კატალოგი' : 'Service Catalog'}
        </h2>
        <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>
          {language === 'ka'
            ? 'DOXO თავად გიკავშირებს შემოწმებულ ოსტატებს. აირჩიე სერვისი ან პირდაპირ მისწერე AI-ს.'
            : 'DOXO automatically finds verified specialists. Choose a service or tell AI what you need.'}
        </p>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="input"
            placeholder="მოძებნე სერვისი (მაგ: ონკანი, ფანჯრები, კონდიციონერი)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '38px' }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <IconSearch size={16} />
          </span>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)', padding: '5px 14px', whiteSpace: 'nowrap' }}
            >
              {cat.titleKa}
            </button>
          ))}
        </div>

        {/* Pricing Model Filter */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
          {pricingModels.map(pm => (
            <button
              key={pm.id}
              onClick={() => setSelectedPricingModel(pm.id)}
              className={`btn btn-sm ${selectedPricingModel === pm.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '4px 10px',
                fontSize: '11.5px',
                whiteSpace: 'nowrap',
              }}
            >
              {pm.titleKa}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '16px', marginBottom: '36px' }}>
        {filteredServices.map(service => (
          <div
            key={service.id}
            className="card card-hoverable"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span className="brand-badge">{service.category.toUpperCase()}</span>
                {getPriceBadge(service)}
              </div>

              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {service.nameKa}
              </h4>
              <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>
                {service.descriptionKa}
              </p>

              {/* Service Meta Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconClock size={13} style={{ color: 'var(--accent-primary)' }} />
                  <span>ხანგრძლივობა: ~{service.durationHours} სთ</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconMapPin size={13} style={{ color: 'var(--accent-primary)' }} />
                  <span>უბნები: {service.serviceAreas.slice(0, 3).join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Action Bottom */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--status-success-text)', fontWeight: 600 }}>
                {service.availabilityNoteKa}
              </span>
              <button
                onClick={() => {
                  if (onServiceSelect) {
                    onServiceSelect(service);
                  } else {
                    onCategorySelect(service.category);
                  }
                }}
                className="btn btn-primary btn-sm"
              >
                <span>დაჯავშნა</span>
                <IconArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Future Categories Section */}
      <div style={{ marginTop: '30px' }}>
        <h3 className="section-title" style={{ fontSize: '17px', marginBottom: '12px' }}>
          {language === 'ka' ? 'მალე დაემატება (Future Categories in Tbilisi)' : 'Coming Soon'}
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {futureCategories.map((item, idx) => (
            <span
              key={idx}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                fontSize: '12.5px',
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
