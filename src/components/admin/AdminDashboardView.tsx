import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { DoxoStorage } from '../../lib/storage/db';
import { Logger, HealthCheckResult } from '../../lib/observability/logger';
import { E2ETestSuite, TestResultItem } from '../../lib/testing/e2eTestSuite';
import { Provider } from '../../types/provider';
import { Booking, Dispute, AuditEvent, BookingStatus, ServiceCatalogItem } from '../../types/marketplace';
import { UserProfile, UserRole } from '../../types/user';
import { ServiceCategory, Task, TaskStatus } from '../../types/task';
import {
  IconSparkles,
  IconBarChart,
  IconShieldCheck,
  IconUsers,
  IconCheck,
  IconStar,
  IconClock,
  IconX,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconBriefcase,
  IconPackage,
  IconTasks,
  IconScale,
  IconRefreshCw,
} from '../common/Icons';

type AdminTab = 'users' | 'providers' | 'services' | 'tasks' | 'disputes' | 'telemetry';

const CATEGORY_NAMES_KA: Record<ServiceCategory, string> = {
  plumbing: 'სანტექნიკა',
  electrician: 'ელექტროობა',
  cleaning: 'დასუფთავება',
  ac_heating: 'გათბობა/კონდიცირება',
  courier: 'კურიერი',
  car_wash: 'ავტოსამრეცხაო',
};

export const AdminDashboardView: React.FC = () => {
  const { language } = useLanguage();
  const { user, loginAsSuperAdmin } = useAuth();
  const { totalTimeSavedHours } = useTasks();

  const SUPER_ADMIN_EMAIL = 'nukrichachava9@gmail.com';

  // Navigation tab
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  // Datasets from storage
  const [users, setUsers] = useState<UserProfile[]>(() => DoxoStorage.getAllUsers());
  const [providers, setProviders] = useState<Provider[]>(() => DoxoStorage.getProviders());
  const [services, setServices] = useState<ServiceCatalogItem[]>(() => DoxoStorage.getServices());
  const [tasksList, setTasksList] = useState<Task[]>(() => DoxoStorage.getTasks());
  const [disputes, setDisputes] = useState<Dispute[]>(() => DoxoStorage.getDisputes());
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() => DoxoStorage.getAuditEvents());
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null);
  const [testResults, setTestResults] = useState<TestResultItem[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Filters & Search
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | UserRole>('all');

  const [providerSearch, setProviderSearch] = useState('');
  const [providerCategoryFilter, setProviderCategoryFilter] = useState<string>('all');

  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('all');

  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all');

  // Modals state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: 'თბილისი',
    role: 'user' as UserRole,
  });

  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [providerFormData, setProviderFormData] = useState({
    nameKa: '',
    category: 'plumbing' as ServiceCategory,
    phone: '',
    minPrice: 35,
    maxPrice: 120,
    baseFee: 30,
    serviceAreas: 'ვაკე, საბურთალო, ვერა',
  });

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceCatalogItem | null>(null);
  const [serviceFormData, setServiceFormData] = useState({
    nameKa: '',
    name: '',
    category: 'plumbing' as ServiceCategory,
    basePrice: 50,
    durationHours: 1,
    descriptionKa: '',
  });

  // Health check on mount
  useEffect(() => {
    Logger.checkHealth().then(res => setHealthResult(res));
  }, []);

  // Reload helper
  const reloadData = () => {
    setUsers(DoxoStorage.getAllUsers());
    setProviders(DoxoStorage.getProviders());
    setServices(DoxoStorage.getServices());
    setTasksList(DoxoStorage.getTasks());
    setDisputes(DoxoStorage.getDisputes());
    setAuditEvents(DoxoStorage.getAuditEvents());
  };

  // Test Suite Runner
  const handleRunAllTests = async () => {
    setIsRunningTests(true);
    try {
      const results = await E2ETestSuite.runAllTests();
      setTestResults(results);
    } finally {
      setIsRunningTests(false);
    }
  };

  // ----------------------------------------------------
  // USER ACTIONS
  // ----------------------------------------------------
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      city: 'თბილისი',
      role: 'user',
    });
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (u: UserProfile) => {
    setEditingUser(u);
    setUserFormData({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      city: u.city || 'თბილისი',
      role: u.role || 'user',
    });
    setUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.firstName.trim() || !userFormData.email.trim()) return;

    if (editingUser) {
      DoxoStorage.updateUserById(editingUser.id, {
        firstName: userFormData.firstName.trim(),
        lastName: userFormData.lastName.trim(),
        email: userFormData.email.trim(),
        phone: userFormData.phone.trim(),
        city: userFormData.city,
        role: userFormData.role,
      });
    } else {
      const newUser: UserProfile = {
        id: `usr_${Date.now()}`,
        firstName: userFormData.firstName.trim(),
        lastName: userFormData.lastName.trim(),
        email: userFormData.email.trim(),
        phone: userFormData.phone.trim() || '+995 599 00 00 00',
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`,
        city: userFormData.city,
        role: userFormData.role,
        isBlocked: false,
        preferences: {
          preferredLanguage: 'ka',
          preferredTimeOfDay: 'flexible',
          allowPhoneCalls: true,
          priorityCriteria: 'highest_rated',
          savedAddresses: [{ id: 'addr_1', label: 'ბინა', district: 'ვაკე', addressLine: 'ჭავჭავაძის გამზ.' }],
          favoriteProviderIds: [],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      DoxoStorage.addUser(newUser);
    }
    setUserModalOpen(false);
    reloadData();
  };

  const handleToggleBlockUser = (u: UserProfile) => {
    if (u.email.toLowerCase() === SUPER_ADMIN_EMAIL) {
      alert('სუპერ ადმინისტრატორის დაბლოკვა შეუძლებელია!');
      return;
    }
    DoxoStorage.toggleBlockUser(u.id);
    reloadData();
  };

  const handleDeleteUser = (u: UserProfile) => {
    if (u.email.toLowerCase() === SUPER_ADMIN_EMAIL) {
      alert('სუპერ ადმინისტრატორის წაშლა შეუძლებელია!');
      return;
    }
    if (window.confirm(`ნამდვილად გსურთ მომხმარებლის წაშლა: ${u.firstName} ${u.lastName} (${u.email})?`)) {
      DoxoStorage.deleteUser(u.id);
      reloadData();
    }
  };

  // ----------------------------------------------------
  // PROVIDER ACTIONS
  // ----------------------------------------------------
  const handleOpenAddProvider = () => {
    setEditingProvider(null);
    setProviderFormData({
      nameKa: '',
      category: 'plumbing',
      phone: '+995 599 ',
      minPrice: 35,
      maxPrice: 120,
      baseFee: 30,
      serviceAreas: 'ვაკე, საბურთალო, ვერა',
    });
    setProviderModalOpen(true);
  };

  const handleOpenEditProvider = (p: Provider) => {
    setEditingProvider(p);
    setProviderFormData({
      nameKa: p.nameKa,
      category: p.categories[0] || 'plumbing',
      phone: p.phone,
      minPrice: p.pricing.min || 35,
      maxPrice: p.pricing.max || 120,
      baseFee: p.pricing.baseCalloutFee || 30,
      serviceAreas: p.serviceAreas.join(', '),
    });
    setProviderModalOpen(true);
  };

  const handleSaveProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerFormData.nameKa.trim()) return;

    const areas = providerFormData.serviceAreas.split(',').map(s => s.trim()).filter(Boolean);

    if (editingProvider) {
      DoxoStorage.updateProvider(editingProvider.id, {
        nameKa: providerFormData.nameKa.trim(),
        name: providerFormData.nameKa.trim(),
        categories: [providerFormData.category],
        phone: providerFormData.phone.trim(),
        serviceAreas: areas.length ? areas : ['თბილისი'],
        pricing: {
          ...editingProvider.pricing,
          min: Number(providerFormData.minPrice),
          max: Number(providerFormData.maxPrice),
          baseCalloutFee: Number(providerFormData.baseFee),
        },
      });
    } else {
      const newProv: Provider = {
        id: `prv_${Date.now()}`,
        name: providerFormData.nameKa.trim(),
        nameKa: providerFormData.nameKa.trim(),
        categories: [providerFormData.category],
        rating: 5.0,
        reviewCount: 1,
        completedJobs: 0,
        avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
        phone: providerFormData.phone.trim(),
        bio: 'Professional Specialist',
        bioKa: `გამოცდილი სპეციალისტი: ${CATEGORY_NAMES_KA[providerFormData.category]}`,
        verificationStatus: 'verified',
        verificationBadge: 'verified',
        verificationDate: new Date().toISOString().split('T')[0],
        documentsStatus: 'approved',
        serviceAreas: areas.length ? areas : ['თბილისი'],
        languages: ['ქართული'],
        completionRate: 100,
        cancellationRate: 0,
        responseTimeMinutes: 5,
        pricingModel: 'price_range',
        availability: 'available',
        estimatedArrivalMinutes: 20,
        specialties: [CATEGORY_NAMES_KA[providerFormData.category]],
        specialtiesKa: [CATEGORY_NAMES_KA[providerFormData.category]],
        completedSimilarTasksCount: 0,
        pricing: {
          min: Number(providerFormData.minPrice),
          max: Number(providerFormData.maxPrice),
          baseCalloutFee: Number(providerFormData.baseFee),
          unit: 'სამუშაოზე',
        },
      };
      DoxoStorage.addProvider(newProv);
    }
    setProviderModalOpen(false);
    reloadData();
  };

  const handleModerateProvider = (providerId: string, status: Provider['verificationStatus']) => {
    DoxoStorage.updateProviderVerification(providerId, status);
    reloadData();
  };

  const handleDeleteProvider = (p: Provider) => {
    if (window.confirm(`ნამდვილად გსურთ სპეციალისტის წაშლა: ${p.nameKa}?`)) {
      DoxoStorage.deleteProvider(p.id);
      reloadData();
    }
  };

  // ----------------------------------------------------
  // SERVICE CATALOG ACTIONS
  // ----------------------------------------------------
  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceFormData({
      nameKa: '',
      name: '',
      category: 'plumbing',
      basePrice: 50,
      durationHours: 1,
      descriptionKa: '',
    });
    setServiceModalOpen(true);
  };

  const handleOpenEditService = (s: ServiceCatalogItem) => {
    setEditingService(s);
    setServiceFormData({
      nameKa: s.nameKa,
      name: s.name,
      category: s.category,
      basePrice: s.basePrice || 50,
      durationHours: s.durationHours,
      descriptionKa: s.descriptionKa || '',
    });
    setServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormData.nameKa.trim()) return;

    if (editingService) {
      DoxoStorage.updateService(editingService.id, {
        nameKa: serviceFormData.nameKa.trim(),
        name: serviceFormData.name.trim() || serviceFormData.nameKa.trim(),
        category: serviceFormData.category,
        basePrice: Number(serviceFormData.basePrice),
        durationHours: Number(serviceFormData.durationHours),
        descriptionKa: serviceFormData.descriptionKa.trim(),
        description: serviceFormData.descriptionKa.trim(),
      });
    } else {
      const newService: ServiceCatalogItem = {
        id: `srv_cat_${Date.now()}`,
        nameKa: serviceFormData.nameKa.trim(),
        name: serviceFormData.name.trim() || serviceFormData.nameKa.trim(),
        category: serviceFormData.category,
        pricingModel: 'fixed',
        basePrice: Number(serviceFormData.basePrice),
        durationHours: Number(serviceFormData.durationHours),
        descriptionKa: serviceFormData.descriptionKa.trim(),
        description: serviceFormData.descriptionKa.trim(),
        requiredInfo: [],
        serviceAreas: ['თბილისი', 'ვაკე', 'საბურთალო', 'ვერა'],
        availabilityNoteKa: 'ხელმისაწვდომია ყოველდღე',
      };
      DoxoStorage.addService(newService);
    }
    setServiceModalOpen(false);
    reloadData();
  };

  const handleDeleteService = (s: ServiceCatalogItem) => {
    if (window.confirm(`ნამდვილად გსურთ სერვისის წაშლა: ${s.nameKa}?`)) {
      DoxoStorage.deleteService(s.id);
      reloadData();
    }
  };

  // ----------------------------------------------------
  // TASK & BOOKING ACTIONS
  // ----------------------------------------------------
  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    DoxoStorage.updateTaskStatus(taskId, newStatus);
    reloadData();
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm(`ნამდვილად გსურთ დავალების #${taskId} წაშლა?`)) {
      DoxoStorage.deleteTask(taskId);
      reloadData();
    }
  };

  // ----------------------------------------------------
  // DISPUTE ACTIONS
  // ----------------------------------------------------
  const handleResolveDispute = (disputeId: string, resolutionKa: string) => {
    DoxoStorage.updateDisputeStatus(disputeId, 'resolved', resolutionKa);
    reloadData();
  };

  // ----------------------------------------------------
  // FILTERED LISTS
  // ----------------------------------------------------
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      `${u.firstName} ${u.lastName} ${u.email} ${u.phone}`.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || (u.role || 'user') === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredProviders = providers.filter(p => {
    const matchesSearch = `${p.nameKa} ${p.name} ${p.phone}`.toLowerCase().includes(providerSearch.toLowerCase());
    const matchesCategory = providerCategoryFilter === 'all' || p.categories.includes(providerCategoryFilter as ServiceCategory);
    return matchesSearch && matchesCategory;
  });

  const filteredServices = services.filter(s => {
    const matchesSearch = `${s.nameKa} ${s.name}`.toLowerCase().includes(serviceSearch.toLowerCase());
    const matchesCategory = serviceCategoryFilter === 'all' || s.category === serviceCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredTasks = tasksList.filter(t => {
    if (taskStatusFilter === 'all') return true;
    return t.status === taskStatusFilter;
  });

  const pendingProviders = providers.filter(
    p => p.verificationStatus === 'pending' || p.documentsStatus === 'pending_review'
  );

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* Super Admin Top Control Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.95) 0%, rgba(88, 28, 135, 0.95) 100%)',
          border: '1.5px solid rgba(147, 51, 234, 0.4)',
          color: '#fff',
          padding: '20px 24px',
          marginBottom: '24px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '4px 10px',
                  borderRadius: '100px',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                👑 SUPER ADMIN CONSOLE
              </span>
              <span style={{ fontSize: '12px', opacity: 0.85 }}>DOXO Master Control</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0 4px', color: '#fff' }}>
              ავტორიზებული ადმინისტრატორი: <span style={{ color: '#FDE047' }}>{SUPER_ADMIN_EMAIL}</span>
            </h1>
            <p style={{ fontSize: '13px', margin: 0, opacity: 0.9 }}>
              სრული წვდომა და კონტროლი: მომხმარებლები, სპეციალისტები, სერვისების კატალოგი, ჯავშნები, დავები და ტელემეტრია.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL ? (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.25)',
                  border: '1px solid rgba(16, 185, 129, 0.5)',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#A7F3D0',
                }}
              >
                <IconCheck size={16} /> სისტემა აქტიურია (Super Admin)
              </div>
            ) : (
              <button
                onClick={loginAsSuperAdmin}
                className="btn"
                style={{
                  background: '#FDE047',
                  color: '#1E293B',
                  fontWeight: 800,
                  border: 'none',
                  fontSize: '13px',
                }}
              >
                ⚡ შედით როგორც {SUPER_ADMIN_EMAIL}
              </button>
            )}

            <button
              onClick={reloadData}
              className="btn btn-secondary btn-sm"
              style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#fff', border: 'none' }}
              title="მონაცემების განახლება"
            >
              <IconRefreshCw size={14} /> განახლება
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '24px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <button
          onClick={() => setActiveTab('users')}
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '13.5px', gap: '8px' }}
        >
          <IconUsers size={16} /> მომხმარებლები ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('providers')}
          className={`btn ${activeTab === 'providers' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '13.5px', gap: '8px' }}
        >
          <IconBriefcase size={16} /> სპეციალისტები ({providers.length})
          {pendingProviders.length > 0 && (
            <span
              style={{
                background: '#EF4444',
                color: '#fff',
                borderRadius: '10px',
                padding: '1px 6px',
                fontSize: '11px',
                fontWeight: 800,
              }}
            >
              {pendingProviders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`btn ${activeTab === 'services' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '13.5px', gap: '8px' }}
        >
          <IconPackage size={16} /> სერვისების კატალოგი ({services.length})
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`btn ${activeTab === 'tasks' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '13.5px', gap: '8px' }}
        >
          <IconTasks size={16} /> დავალებები & ჯავშნები ({tasksList.length})
        </button>
        <button
          onClick={() => setActiveTab('disputes')}
          className={`btn ${activeTab === 'disputes' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '13.5px', gap: '8px' }}
        >
          <IconScale size={16} /> დავები & ესქროუ ({disputes.length})
        </button>
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`btn ${activeTab === 'telemetry' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '13.5px', gap: '8px' }}
        >
          <IconBarChart size={16} /> ტელემეტრია & აუდიტი
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: USERS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="animate-fade-in">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '18px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '19px', fontWeight: 800, margin: 0 }}>მომხმარებლების მართვა (Users CRUD)</h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                ახალი მომხმარებლის შექმნა, მონაცემების რედაქტირება, დაბლოკვა/აქტივაცია და წაშლა.
              </p>
            </div>

            <button onClick={handleOpenAddUser} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
              <IconPlus size={15} /> ახალი მომხმარებლის დამატება
            </button>
          </div>

          {/* User Search & Role Filter */}
          <div className="card" style={{ padding: '14px', marginBottom: '18px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px', position: 'relative' }}>
              <IconSearch size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="ძიება სახელით, მეილით ან ტელეფონით..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>როლი:</span>
              {(['all', 'user', 'provider', 'admin'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setUserRoleFilter(role)}
                  className="btn btn-sm"
                  style={{
                    padding: '6px 10px',
                    fontSize: '12px',
                    background: userRoleFilter === role ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    color: userRoleFilter === role ? '#fff' : 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {role === 'all' ? 'ყველა' : role === 'admin' ? 'ადმინი' : role === 'provider' ? 'ოსტატი' : 'მომხმარებელი'}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 16px' }}>მომხმარებელი</th>
                  <th style={{ padding: '12px 16px' }}>ელ.ფოსტა / ტელეფონი</th>
                  <th style={{ padding: '12px 16px' }}>ქალაქი</th>
                  <th style={{ padding: '12px 16px' }}>როლი</th>
                  <th style={{ padding: '12px 16px' }}>სტატუსი</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>მოქმედება</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      მომხმარებლები ვერ მოიძებნა.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                            alt={u.firstName}
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              {u.firstName} {u.lastName}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600 }}>{u.email}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{u.phone}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{u.city || 'თბილისი'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          className="brand-badge"
                          style={{
                            background:
                              u.role === 'admin'
                                ? 'rgba(234, 179, 8, 0.15)'
                                : u.role === 'provider'
                                ? 'rgba(59, 130, 246, 0.15)'
                                : 'rgba(16, 185, 129, 0.15)',
                            color:
                              u.role === 'admin'
                                ? '#EAB308'
                                : u.role === 'provider'
                                ? '#3B82F6'
                                : 'var(--status-success-text)',
                            fontWeight: 700,
                          }}
                        >
                          {u.role === 'admin' ? '👑 ადმინი' : u.role === 'provider' ? '🛠️ ოსტატი' : '👤 მომხმარებელი'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {u.isBlocked ? (
                          <span style={{ color: 'var(--status-danger)', fontWeight: 700, fontSize: '12px' }}>
                            🚫 დაბლოკილი
                          </span>
                        ) : (
                          <span style={{ color: 'var(--status-success-text)', fontWeight: 700, fontSize: '12px' }}>
                            ✓ აქტიური
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenEditUser(u)}
                            className="btn btn-secondary btn-sm"
                            title="რედაქტირება"
                          >
                            <IconEdit size={13} />
                          </button>
                          <button
                            onClick={() => handleToggleBlockUser(u)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: u.isBlocked ? 'var(--status-success-text)' : '#F59E0B' }}
                            title={u.isBlocked ? 'განბლოკვა' : 'დაბლოკვა'}
                          >
                            {u.isBlocked ? 'განბლოკვა' : 'ბლოკი'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--status-danger)' }}
                            title="წაშლა"
                          >
                            <IconTrash size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PROVIDERS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'providers' && (
        <div className="animate-fade-in">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '18px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '19px', fontWeight: 800, margin: 0 }}>სპეციალისტების მართვა (Providers CRUD)</h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                ახალი სპეციალისტის რეგისტრაცია, ტარიფების რედაქტირება, დოკუმენტების ვერიფიკაცია და წაშლა.
              </p>
            </div>

            <button onClick={handleOpenAddProvider} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
              <IconPlus size={15} /> ახალი სპეციალისტის დამატება
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="card" style={{ padding: '14px', marginBottom: '18px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px', position: 'relative' }}>
              <IconSearch size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="ძიება სპეციალისტის სახელით ან ტელეფონით..."
                value={providerSearch}
                onChange={e => setProviderSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              />
            </div>

            <select
              value={providerCategoryFilter}
              onChange={e => setProviderCategoryFilter(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}
            >
              <option value="all">ყველა კატეგორია</option>
              {Object.entries(CATEGORY_NAMES_KA).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Providers List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredProviders.map(p => (
              <div
                key={p.id}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px',
                  borderLeft:
                    p.verificationStatus === 'verified'
                      ? '4px solid var(--status-success)'
                      : p.verificationStatus === 'suspended'
                      ? '4px solid var(--status-danger)'
                      : '4px solid #F59E0B',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img
                    src={p.avatarUrl}
                    alt={p.nameKa}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {p.nameKa}
                      </span>
                      <span className="brand-badge">
                        {p.categories.map(c => CATEGORY_NAMES_KA[c] || c).join(', ')}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <IconStar size={13} /> {p.rating} ({p.reviewCount})
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      📞 {p.phone} · 📍 {p.serviceAreas.join(', ')} · 💰 გამოძახება: {p.pricing.baseCalloutFee}₾ · დიაპაზონი: {p.pricing.min}-{p.pricing.max}₾
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {p.verificationStatus !== 'verified' && (
                    <button
                      onClick={() => handleModerateProvider(p.id, 'verified')}
                      className="btn btn-sm"
                      style={{ background: 'var(--status-success)', color: '#fff', fontSize: '12px' }}
                    >
                      <IconCheck size={13} /> ვერიფიკაცია
                    </button>
                  )}
                  {p.verificationStatus === 'verified' && (
                    <button
                      onClick={() => handleModerateProvider(p.id, 'suspended')}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--status-danger)', fontSize: '12px' }}
                    >
                      შეჩერება
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenEditProvider(p)}
                    className="btn btn-secondary btn-sm"
                    title="რედაქტირება"
                  >
                    <IconEdit size={13} /> რედაქტირება
                  </button>
                  <button
                    onClick={() => handleDeleteProvider(p)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--status-danger)' }}
                    title="წაშლა"
                  >
                    <IconTrash size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SERVICES CATALOG MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'services' && (
        <div className="animate-fade-in">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '18px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '19px', fontWeight: 800, margin: 0 }}>სერვისების კატალოგი (Services Catalog CRUD)</h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                DOXO-ს ოფიციალური სერვისების დამატება, ფასების და ხანგრძლივობის კორექტირება, წაშლა.
              </p>
            </div>

            <button onClick={handleOpenAddService} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
              <IconPlus size={15} /> ახალი სერვისის დამატება
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="card" style={{ padding: '14px', marginBottom: '18px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px', position: 'relative' }}>
              <IconSearch size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="ძიება სერვისის დასახელებით..."
                value={serviceSearch}
                onChange={e => setServiceSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              />
            </div>

            <select
              value={serviceCategoryFilter}
              onChange={e => setServiceCategoryFilter(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}
            >
              <option value="all">ყველა კატეგორია</option>
              {Object.entries(CATEGORY_NAMES_KA).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Services Table */}
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 16px' }}>სერვისი (ქართულად / ინგლისურად)</th>
                  <th style={{ padding: '12px 16px' }}>კატეგორია</th>
                  <th style={{ padding: '12px 16px' }}>საბაზისო ფასი</th>
                  <th style={{ padding: '12px 16px' }}>ხანგრძლივობა</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>მოქმედება</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.nameKa}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{s.name}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="brand-badge">{CATEGORY_NAMES_KA[s.category] || s.category}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--status-success-text)' }}>
                      {s.basePrice || s.priceRange?.min || 40} ₾
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {s.durationHours} საათი
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenEditService(s)}
                          className="btn btn-secondary btn-sm"
                          title="რედაქტირება"
                        >
                          <IconEdit size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteService(s)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--status-danger)' }}
                          title="წაშლა"
                        >
                          <IconTrash size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TASKS & BOOKINGS */}
      {/* ========================================================================= */}
      {activeTab === 'tasks' && (
        <div className="animate-fade-in">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '18px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '19px', fontWeight: 800, margin: 0 }}>დავალებებისა და ჯავშნების კონტროლი</h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                აქტიური დავალებების სტატუსის მყისიერი ცვლილება, მონიტორინგი და წაშლა.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {(['all', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setTaskStatusFilter(st)}
                  className="btn btn-sm"
                  style={{
                    padding: '6px 10px',
                    fontSize: '12px',
                    background: taskStatusFilter === st ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    color: taskStatusFilter === st ? '#fff' : 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {st === 'all'
                    ? 'ყველა'
                    : st === 'confirmed'
                    ? 'დადასტურებული'
                    : st === 'in_progress'
                    ? 'მიმდინარე'
                    : st === 'completed'
                    ? 'დასრულებული'
                    : 'გაუქმებული'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredTasks.map(t => (
              <div
                key={t.id}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {t.titleKa}
                    </span>
                    <span className="brand-badge">{CATEGORY_NAMES_KA[t.category] || t.category}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {t.id}</span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    📍 {t.location} · 💰 შეფასება: {t.estimatedPrice.min}-{t.estimatedPrice.max}₾ · შექმნილია: {new Date(t.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <select
                    value={t.status}
                    onChange={e => handleUpdateTaskStatus(t.id, e.target.value as TaskStatus)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontWeight: 700,
                    }}
                  >
                    <option value="draft">შავი ვარიანტი (draft)</option>
                    <option value="intent_captured">მოთხოვნა მიღებულია</option>
                    <option value="searching">ოსტატის ძიება</option>
                    <option value="awaiting_approval">დადასტურების მოლოდინში</option>
                    <option value="confirmed">დადასტურებული</option>
                    <option value="in_progress">შესრულების პროცესში</option>
                    <option value="completed">დასრულებული ✓</option>
                    <option value="cancelled">გაუქმებული ✕</option>
                  </select>

                  <button
                    onClick={() => handleDeleteTask(t.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--status-danger)' }}
                    title="დავალების წაშლა"
                  >
                    <IconTrash size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DISPUTES & ESCROW */}
      {/* ========================================================================= */}
      {activeTab === 'disputes' && (
        <div className="animate-fade-in">
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '19px', fontWeight: 800, margin: 0 }}>დავები & ფინანსური არბიტრაჟი (Escrow & Disputes)</h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              მომხმარებელთა პრეტენზიების მართვა, 100% თანხის დაბრუნება კლიენტთან ან ანაზღაურების გადარიცხვა სპეციალისტზე.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {disputes.map(disp => (
              <div
                key={disp.id}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '14px',
                  borderLeft:
                    disp.status === 'resolved'
                      ? '4px solid var(--status-success)'
                      : '4px solid var(--status-danger)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="brand-badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--status-danger)' }}>
                      {disp.reasonKa}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 700 }}>
                      მომხმარებელი: {disp.userName}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      • სპეციალისტი: {disp.providerName}
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '8px 0 4px' }}>
                    "{disp.description}"
                  </p>

                  {disp.resolutionNotesKa && (
                    <div style={{ fontSize: '12.5px', color: 'var(--status-success-text)', marginTop: '6px', fontWeight: 700 }}>
                      ✓ გადაწყვეტილება: {disp.resolutionNotesKa}
                    </div>
                  )}
                </div>

                {disp.status !== 'resolved' ? (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleResolveDispute(disp.id, 'თანხა 100% უკან დაბრუნდა მომხმარებლის ბარათზე.')}
                      className="btn btn-sm"
                      style={{ background: 'var(--status-success)', color: '#fff', fontSize: '12px' }}
                    >
                      💳 თანხის დაბრუნება კლიენტთან (Refund)
                    </button>
                    <button
                      onClick={() => handleResolveDispute(disp.id, 'სამუშაო შემოწმდა და ანაზღაურება გადაერიცხა ოსტატს.')}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '12px' }}
                    >
                      💸 გადახდა ოსტატზე
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--status-success-text)', fontWeight: 700 }}>
                    მოგვარებულია ✓
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: TELEMETRY & SYSTEM HEALTH */}
      {/* ========================================================================= */}
      {activeTab === 'telemetry' && (
        <div className="animate-fade-in">
          {/* North Star KPI */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(16, 185, 129, 0.12) 100%)',
              border: '1.5px solid rgba(99, 102, 241, 0.25)',
              padding: '20px 24px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div className="brand-badge">PLATFORM TELEMETRY</div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {totalTimeSavedHours * 12 + 148} საათი დაზოგილი თბილისელებისთვის
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                DOXO AI Life Operator ავტომატურად მართავს სერვისების ძიებას, ფასების შედარებას და ხარისხის კონტროლს.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div>
                <span className="metadata-text">კმაყოფილება</span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IconStar size={16} /> 4.96 / 5.0
                </div>
              </div>
              <div>
                <span className="metadata-text">შესრულება</span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--status-success-text)' }}>
                  98.4%
                </div>
              </div>
            </div>
          </div>

          {/* Subsystem Health Check */}
          {healthResult && (
            <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid var(--status-success)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconShieldCheck size={18} style={{ color: 'var(--status-success)' }} />
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>სისტემის ჯანმრთელობის სტატუსი (/health)</h3>
                  <span className="brand-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-success-text)' }}>
                    {healthResult.overallStatus.toUpperCase()}
                  </span>
                </div>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  v{healthResult.version} · {healthResult.environment}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
                {Object.entries(healthResult.subsystems).map(([key, sub]) => (
                  <div key={key} style={{ background: 'var(--bg-secondary)', padding: '10px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700 }}>
                      <span style={{ textTransform: 'capitalize' }}>{key}</span>
                      <span style={{ color: sub.status === 'healthy' ? 'var(--status-success-text)' : 'var(--status-danger)' }}>
                        {sub.latencyMs}ms
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {sub.detailsKa}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Automated E2E & Security Test Suite Runner */}
          <div className="card" style={{ marginBottom: '24px', background: 'var(--surface-sunken)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconSparkles size={16} style={{ color: 'var(--accent-primary)' }} />
                  <h3 style={{ fontSize: '15.5px', fontWeight: 700, margin: 0 }}>
                    ავტომატური E2E & უსაფრთხოების ტესტების პაკეტი
                  </h3>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                  ტესტავს 6 კრიტიკულ სცენარს: Core Flow, No Providers, Idempotency, 100% Refund, Rate Limiting & Tenant Isolation.
                </p>
              </div>

              <button
                onClick={handleRunAllTests}
                disabled={isRunningTests}
                className="btn btn-primary btn-sm"
              >
                {isRunningTests ? 'ტესტირება მიმდინარეობს...' : 'ტესტების გაშვება (Run All)'}
              </button>
            </div>

            {testResults.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                {testResults.map(tr => (
                  <div
                    key={tr.id}
                    style={{
                      background: 'var(--surface-base)',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderLeft: tr.passed ? '3.5px solid var(--status-success)' : '3.5px solid var(--status-danger)',
                      fontSize: '12.5px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{tr.nameKa}</span>
                        <span className="brand-badge">{tr.category}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '11.5px' }}>
                        {tr.messageKa}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: tr.passed ? 'var(--status-success-text)' : 'var(--status-danger)' }}>
                      {tr.passed ? '✓ PASSED' : '✗ FAILED'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Log Stream */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', fontWeight: 800, fontSize: '14px' }}>
              სისტემური აუდიტის ლოგი (Live Audit Stream)
            </div>
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '10px 14px' }}>დრო</th>
                    <th style={{ padding: '10px 14px' }}>მოვლენა</th>
                    <th style={{ padding: '10px 14px' }}>აქტორი</th>
                    <th style={{ padding: '10px 14px' }}>დეტალები</th>
                  </tr>
                </thead>
                <tbody>
                  {auditEvents.slice(0, 30).map(evt => (
                    <tr key={evt.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td style={{ padding: '8px 14px', fontWeight: 700, color: 'var(--accent-primary)' }}>
                        {evt.eventType}
                      </td>
                      <td style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}>
                        <span className="brand-badge">{evt.actorRole}</span> {evt.actorName}
                      </td>
                      <td style={{ padding: '8px 14px', color: 'var(--text-secondary)' }}>
                        {evt.detailsKa}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: USER CREATE / EDIT */}
      {/* ========================================================================= */}
      {userModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '500px',
              width: '100%',
              padding: '24px',
              background: 'var(--surface-base)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                {editingUser ? 'მომხმარებლის რედაქტირება' : 'ახალი მომხმარებლის დამატება'}
              </h3>
              <button
                onClick={() => setUserModalOpen(false)}
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: '50%', padding: '6px' }}
              >
                <IconX size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    სახელი
                  </label>
                  <input
                    type="text"
                    required
                    value={userFormData.firstName}
                    onChange={e => setUserFormData({ ...userFormData, firstName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    გვარი
                  </label>
                  <input
                    type="text"
                    value={userFormData.lastName}
                    onChange={e => setUserFormData({ ...userFormData, lastName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  ელ.ფოსტა
                </label>
                <input
                  type="email"
                  required
                  value={userFormData.email}
                  onChange={e => setUserFormData({ ...userFormData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  ტელეფონი
                </label>
                <input
                  type="text"
                  value={userFormData.phone}
                  onChange={e => setUserFormData({ ...userFormData, phone: e.target.value })}
                  placeholder="+995 599 00 00 00"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    ქალაქი
                  </label>
                  <input
                    type="text"
                    value={userFormData.city}
                    onChange={e => setUserFormData({ ...userFormData, city: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    როლი
                  </label>
                  <select
                    value={userFormData.role}
                    onChange={e => setUserFormData({ ...userFormData, role: e.target.value as UserRole })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                    }}
                  >
                    <option value="user">👤 მომხმარებელი</option>
                    <option value="provider">🛠️ ოსტატი (Provider)</option>
                    <option value="admin">👑 ადმინისტრატორი</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  გაუქმება
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingUser ? 'შენახვა' : 'დამატება'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PROVIDER CREATE / EDIT */}
      {/* ========================================================================= */}
      {providerModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '500px',
              width: '100%',
              padding: '24px',
              background: 'var(--surface-base)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                {editingProvider ? 'სპეციალისტის რედაქტირება' : 'ახალი სპეციალისტის დამატება'}
              </h3>
              <button
                onClick={() => setProviderModalOpen(false)}
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: '50%', padding: '6px' }}
              >
                <IconX size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProvider} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  სპეციალისტის სახელი და გვარი
                </label>
                <input
                  type="text"
                  required
                  value={providerFormData.nameKa}
                  onChange={e => setProviderFormData({ ...providerFormData, nameKa: e.target.value })}
                  placeholder="მაგ: დავით ბერიძე"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    კატეგორია
                  </label>
                  <select
                    value={providerFormData.category}
                    onChange={e => setProviderFormData({ ...providerFormData, category: e.target.value as ServiceCategory })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                    }}
                  >
                    {Object.entries(CATEGORY_NAMES_KA).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    ტელეფონი
                  </label>
                  <input
                    type="text"
                    required
                    value={providerFormData.phone}
                    onChange={e => setProviderFormData({ ...providerFormData, phone: e.target.value })}
                    placeholder="+995 599 00 00 00"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px' }}>
                    გამოძახება (₾)
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={providerFormData.baseFee}
                    onChange={e => setProviderFormData({ ...providerFormData, baseFee: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px' }}>
                    მინიმუმი (₾)
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={providerFormData.minPrice}
                    onChange={e => setProviderFormData({ ...providerFormData, minPrice: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, marginBottom: '4px' }}>
                    მაქსიმუმი (₾)
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={providerFormData.maxPrice}
                    onChange={e => setProviderFormData({ ...providerFormData, maxPrice: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  მომსახურების უბნები (მძიმით გამოყოფილი)
                </label>
                <input
                  type="text"
                  value={providerFormData.serviceAreas}
                  onChange={e => setProviderFormData({ ...providerFormData, serviceAreas: e.target.value })}
                  placeholder="ვაკე, საბურთალო, ვერა, მთაწმინდა"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setProviderModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  გაუქმება
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingProvider ? 'შენახვა' : 'დამატება'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SERVICE CREATE / EDIT */}
      {/* ========================================================================= */}
      {serviceModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '500px',
              width: '100%',
              padding: '24px',
              background: 'var(--surface-base)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                {editingService ? 'სერვისის რედაქტირება' : 'ახალი სერვისის დამატება'}
              </h3>
              <button
                onClick={() => setServiceModalOpen(false)}
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: '50%', padding: '6px' }}
              >
                <IconX size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveService} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  სერვისის დასახელება (ქართულად)
                </label>
                <input
                  type="text"
                  required
                  value={serviceFormData.nameKa}
                  onChange={e => setServiceFormData({ ...serviceFormData, nameKa: e.target.value })}
                  placeholder="მაგ: ონკანის გამოცვლა"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  დასახელება ინგლისურად
                </label>
                <input
                  type="text"
                  value={serviceFormData.name}
                  onChange={e => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                  placeholder="e.g. Faucet Replacement"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    კატეგორია
                  </label>
                  <select
                    value={serviceFormData.category}
                    onChange={e => setServiceFormData({ ...serviceFormData, category: e.target.value as ServiceCategory })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                    }}
                  >
                    {Object.entries(CATEGORY_NAMES_KA).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    საბაზისო ფასი (₾)
                  </label>
                  <input
                    type="number"
                    min="5"
                    required
                    value={serviceFormData.basePrice}
                    onChange={e => setServiceFormData({ ...serviceFormData, basePrice: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  სავარაუდო ხანგრძლივობა (საათებში)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={serviceFormData.durationHours}
                  onChange={e => setServiceFormData({ ...serviceFormData, durationHours: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  გაუქმება
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingService ? 'შენახვა' : 'დამატება'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
