import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider, useTasks } from './context/TaskContext';
import { Header, ActivePortal } from './components/layout/Header';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { MobileNavDrawer } from './components/layout/MobileNavDrawer';
import { ContextPanel } from './components/layout/ContextPanel';
import { CommandPalette } from './components/common/CommandPalette';
import { DailyBriefCard } from './components/home/DailyBriefCard';
import { SmartBundlingBanner } from './components/ai/SmartBundlingBanner';
import { TimeSavedWidget } from './components/home/TimeSavedWidget';
import { AIHeroInput } from './components/ai/AIHeroInput';
import { AIProcessTimeline } from './components/ai/AIProcessTimeline';
import { SaturdayPlanCard } from './components/ai/SaturdayPlanCard';
import { ProviderMatchList } from './components/providers/ProviderMatchList';
import { AIConversationWorkspace } from './components/ai/AIConversationWorkspace';
import { TrustModal } from './components/ai/TrustModal';
import { EmptyHomeHero } from './components/home/EmptyHomeHero';
import { ActiveTasksList } from './components/tasks/ActiveTasksList';
import { TaskDetailView } from './components/tasks/TaskDetailView';
import { BookingModal } from './components/tasks/BookingModal';
import { ErrandModeModal } from './components/tasks/ErrandModeModal';
import { LifeInboxView } from './components/inbox/LifeInboxView';
import { MyHomeView } from './components/home/MyHomeView';
import { FamilyView } from './components/home/FamilyView';
import { ServicesCatalogView } from './components/services/ServicesCatalogView';
import { ProviderDashboardView } from './components/provider-portal/ProviderDashboardView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { UserDashboardView } from './components/user-portal/UserDashboardView';
import { LandingPage } from './components/onboarding/LandingPage';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { AIMemoryModal } from './components/profile/AIMemoryModal';
import { PrivacyCenterModal } from './components/profile/PrivacyCenterModal';
import { GuideModal } from './components/common/GuideModal';
import { AuthModal } from './components/auth/AuthModal';
import { DecisionCenterView } from './components/decisions/DecisionCenterView';
import { DecisionEngine } from './lib/decisions/decisionEngine';
import { IconScale } from './components/common/Icons';
import { AIService, AnalyzedIntent } from './lib/ai/aiService';
import { DoxoStorage } from './lib/storage/db';
import { PaymentService } from './lib/payments/paymentService';
import { RateLimiter } from './lib/security/rateLimiter';
import { Provider } from './types/provider';
import { Task, ServiceCategory } from './types/task';


// Styles
import './styles/tokens.css';
import './styles/base.css';
import './styles/orb.css';
import './styles/components.css';
import './styles/animations.css';

const MainApp: React.FC = () => {
  const { language, t } = useLanguage();
  const { user, isSuperAdmin } = useAuth();
  const { activeTasks, dashboardTasks, tasks, createTask, bookTask } = useTasks();

  // Navigation & View States
  const [activePortal, setActivePortal] = useState<ActivePortal>('customer');
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Ensure admin portal is inaccessible to non-super-admins
  useEffect(() => {
    if (activePortal === 'admin' && !isSuperAdmin) {
      setActivePortal('customer');
    }
  }, [activePortal, isSuperAdmin]);
  const [showLanding, setShowLanding] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAIMemory, setShowAIMemory] = useState(false);
  const [showPrivacyCenter, setShowPrivacyCenter] = useState(false);
  const [showErrandMode, setShowErrandMode] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showBundlingBanner, setShowBundlingBanner] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pendingDecisionsCount = DecisionEngine.getDecisions().filter(d => d.status === 'pending').length;

  // Global Return to Home handler (triggered by clicking logo or home buttons)
  const handleNavigateHome = () => {
    setActivePortal('customer');
    setActiveTab('home');
    setSelectedTask(null);
    setShowAIWorkspace(false);
    setShowLanding(false);
  };

  // Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('doxo_sidebar_collapsed') === 'true';
  });

  // AI Workflow States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeIntent, setActiveIntent] = useState<AnalyzedIntent | null>(null);
  const [matchedProviders, setMatchedProviders] = useState<Provider[]>([]);
  const [selectedProviderForBooking, setSelectedProviderForBooking] = useState<Provider | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [currentRawPrompt, setCurrentRawPrompt] = useState('');

  // Stage 4 AI Operator Workspace States
  const [showAIWorkspace, setShowAIWorkspace] = useState(false);
  const [aiWorkspacePrompt, setAiWorkspacePrompt] = useState('');
  const [showTrustModal, setShowTrustModal] = useState(false);

  // Global Keyboard Shortcut: Cmd/Ctrl + K for Universal Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Natural Language Submission
  const handleAIQuerySubmit = (rawPrompt: string) => {
    setCurrentRawPrompt(rawPrompt);
    setAiWorkspacePrompt(rawPrompt);
    setShowAIWorkspace(true);
    setSelectedTask(null);

    // Also parse inline intent for Home fallback
    setIsAnalyzing(true);
    const intent = AIService.analyzeIntent(rawPrompt, user?.preferences);
    setActiveIntent(intent);

    const providers = AIService.rankProvidersForTask(
      intent.category,
      intent.location,
      intent.urgency,
      user?.preferences
    );
    setMatchedProviders(providers);
  };

  const handleAIReasoningComplete = () => {
    setIsAnalyzing(false);
  };

  const handleSelectProvider = (provider: Provider) => {
    setSelectedProviderForBooking(provider);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = (details: {
    selectedAddress: string;
    addressLabel: string;
    scheduledTime: string;
    finalPrice: number;
  }) => {
    if (!activeIntent || !selectedProviderForBooking) return;

    // Rate Limiter Check (Section 33)
    const rateCheck = RateLimiter.check('booking_create', user?.id || 'usr_nukri');
    if (!rateCheck.allowed) {
      alert(`გთხოვთ მოიცადოთ ${rateCheck.retryAfterSeconds} წამი ახალი ჯავშნის გაფორმებამდე.`);
      return;
    }

    // Create and book the task
    const newTask = createTask(currentRawPrompt, activeIntent, selectedProviderForBooking.id);
    bookTask(newTask.id, selectedProviderForBooking.id);

    const bookingId = `bk_${Date.now()}`;
    const idempotencyKey = `idemp_${bookingId}`;

    // Create immutable price snapshot (Section 14) and safe monetary calculation (Section 13)
    const snapshot = PaymentService.createPriceSnapshot(
      details.finalPrice,
      selectedProviderForBooking.pricingModel || 'fixed'
    );

    // Create Idempotent Escrow Payment Intent (Section 10)
    PaymentService.createPaymentIntent(
      bookingId,
      user?.id || 'usr_nukri',
      snapshot.totalMinor,
      idempotencyKey
    );

    // Also create real Booking entity in marketplace registry
    DoxoStorage.saveBooking({
      bookingId,
      taskId: newTask.id,
      userId: user?.id || 'usr_nukri',
      providerId: selectedProviderForBooking.id,
      providerName: selectedProviderForBooking.name,
      providerNameKa: selectedProviderForBooking.nameKa,
      providerAvatarUrl: selectedProviderForBooking.avatarUrl,
      providerPhone: selectedProviderForBooking.phone,
      serviceId: `srv_${newTask.category}`,
      serviceTitleKa: newTask.titleKa,
      category: newTask.category,
      scheduledStart: details.scheduledTime,
      scheduledEnd: '20:00',
      location: details.selectedAddress,
      addressLabel: details.addressLabel,
      price: details.finalPrice,
      pricingModel: selectedProviderForBooking.pricingModel,
      paymentStatus: 'authorized',
      bookingStatus: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setShowBookingModal(false);
    setActiveIntent(null);
    setMatchedProviders([]);
    setSelectedTask(newTask);
  };


  const handleExecuteSaturdayPlan = () => {
    if (!activeIntent) return;
    const newTask = createTask(currentRawPrompt, activeIntent);
    setActiveIntent(null);
    setSelectedTask(newTask);
  };

  const handleCategorySelectFromCatalog = (cat: ServiceCategory) => {
    const prompt = language === 'ka'
      ? `${cat} სერვისის საუკეთესო სპეციალისტი მინდა დღეს`
      : `Need best verified specialist for ${cat} today`;
    handleAIQuerySubmit(prompt);
    setActiveTab('home');
  };

  const handleConfirmErrand = (title: string, stops: any[]) => {
    const prompt = `${title}: ${stops.map(s => s.itemDescription).join(', ')}`;
    const intent = AIService.analyzeIntent(prompt);
    const newTask = createTask(prompt, intent);
    setSelectedTask(newTask);
  };

  if (showLanding) {
    return (
      <div className="app-layout">
        <LandingPage onGetStarted={() => setShowLanding(false)} />
      </div>
    );
  }

  const layoutClassName = `app-layout app-layout-with-sidebar app-layout-with-context ${
    isSidebarCollapsed ? 'app-layout-sidebar-collapsed' : 'app-layout-sidebar-expanded'
  }`;

  return (
    <div className={layoutClassName}>
      {/* 1. Desktop Sidebar (Collapsible) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedTask(null);
        }}
        onNewTaskClick={() => {
          setActiveTab('home');
          setSelectedTask(null);
        }}
        onGoHome={handleNavigateHome}
        onOpenGuide={() => setShowGuideModal(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={(col) => setIsSidebarCollapsed(col)}
      />

      {/* 2. Main Content Area */}
      <div className="main-content">
        <Header
          activePortal={activePortal}
          setActivePortal={(portal) => {
            setActivePortal(portal);
            setSelectedTask(null);
          }}
          onOpenProfile={() => setShowProfile(true)}
          onOpenLanding={() => setShowLanding(true)}
          onOpenTrustModal={() => setShowTrustModal(true)}
          onOpenPrivacy={() => setShowPrivacyCenter(true)}
          onGoHome={handleNavigateHome}
          onOpenGuide={() => setShowGuideModal(true)}
          onOpenDecisions={() => {
            setActiveTab('decisions');
            setSelectedTask(null);
          }}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* 1. PROVIDER PORTAL VIEW */}
        {activePortal === 'provider' && <ProviderDashboardView />}

        {/* 2. ADMIN DASHBOARD VIEW */}
        {activePortal === 'admin' && isSuperAdmin && <AdminDashboardView />}

        {/* 3. USER DASHBOARD PORTAL (personal control center) */}
        {activePortal === 'user' && <UserDashboardView />}

        {/* 4. CUSTOMER PORTAL VIEW */}
        {activePortal === 'customer' && (
          <>
            {/* If a Task Detail is open */}
            {selectedTask ? (
              <TaskDetailView
                task={selectedTask}
                onBack={() => setSelectedTask(null)}
              />
            ) : (
              <>
                {/* Home Tab (The core operating system experience) */}
                {activeTab === 'home' && (
                  <div>
                    {/* 1. Greeting */}
                    <div style={{ marginBottom: '20px' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {language === 'ka' ? 'პირადი ოპერატორი' : 'PERSONAL LIFE OPERATOR'}
                      </span>
                      <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', lineHeight: 'clamp(30px, 4vw, 42px)', fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0 0' }}>
                        {language === 'ka'
                          ? `${t.greetingMorning}, ${user?.firstName || 'გიორგი'}`
                          : `${t.greetingMorning}, ${user?.firstName || 'George'}`}
                      </h1>
                    </div>

                    {/* Stage 7 Decision Center Quick Banner */}
                    {pendingDecisionsCount > 0 && (
                      <div
                        onClick={() => {
                          setActiveTab('decisions');
                          setSelectedTask(null);
                        }}
                        style={{
                          backgroundColor: 'rgba(139, 92, 246, 0.08)',
                          border: '1px solid rgba(139, 92, 246, 0.25)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '12px 16px',
                          marginBottom: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          gap: '12px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: 'var(--accent-primary)', display: 'flex' }}>
                            <IconScale size={18} />
                          </span>
                          <div>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {language === 'ka'
                                ? `დღეს ${pendingDecisionsCount} გადაწყვეტილება გაქვს მოსაგვარებელი.`
                                : `You have ${pendingDecisionsCount} decisions to resolve today.`}
                            </span>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                              {language === 'ka'
                                ? 'პროვაიდერის არჩევანი · დროითი კონფლიქტი · შეთავაზებების შედარება'
                                : 'Provider choice · Schedule conflict · Quote comparison'}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          style={{
                            padding: '6px 14px',
                            borderRadius: 'var(--radius-full)',
                            border: 'none',
                            backgroundColor: 'var(--accent-primary)',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {language === 'ka' ? 'ნახვა' : 'View'}
                        </button>
                      </div>
                    )}

                    {/* 2. AI Command Center & 3. Quick Action Chips */}
                    <AIHeroInput
                      onSubmit={handleAIQuerySubmit}
                      isAnalyzing={isAnalyzing}
                    />

                    {/* AI Reasoning Timeline State */}
                    {isAnalyzing && (
                      <AIProcessTimeline
                        onComplete={handleAIReasoningComplete}
                      />
                    )}

                    {/* Multi-Intent Saturday Plan Transformation Card */}
                    {!isAnalyzing && activeIntent?.isMultiIntent && (
                      <SaturdayPlanCard
                        intent={activeIntent}
                        onExecutePlan={handleExecuteSaturdayPlan}
                      />
                    )}

                    {/* Ranked Provider Matches Tray */}
                    {!isAnalyzing && matchedProviders.length > 0 && !activeIntent?.isMultiIntent && (
                      <ProviderMatchList
                        providers={matchedProviders}
                        onSelectProvider={handleSelectProvider}
                        onCancelSearch={() => {
                          setActiveIntent(null);
                          setMatchedProviders([]);
                        }}
                      />
                    )}

                    {/* 4. Active Tasks Feed or Empty Home Hero (Section 28 & 29) */}
                    {dashboardTasks.length === 0 ? (
                      <EmptyHomeHero onTriggerPrompt={handleAIQuerySubmit} />
                    ) : (
                      <>
                        <ActiveTasksList
                          tasks={dashboardTasks}
                          onTaskClick={(task) => setSelectedTask(task)}
                          onViewAllClick={() => setActiveTab('tasks')}
                          maxDisplay={3}
                        />

                        {/* 5. Smart Recommendations / Bundling */}
                        {showBundlingBanner && (
                          <SmartBundlingBanner
                            location="საბურთალო"
                            tasksCount={3}
                            onBundleConfirm={() => {
                              setShowBundlingBanner(false);
                              handleAIQuerySubmit('საბურთალოზე 3 საქმის ერთ ვიზიტად დაგეგმვა');
                            }}
                            onDismiss={() => setShowBundlingBanner(false)}
                          />
                        )}

                        {/* 6. DOXO Daily Brief (Intelligent morning summary) */}
                        <DailyBriefCard
                          tasks={tasks}
                          onTaskClick={(t) => setSelectedTask(t)}
                          onViewAllClick={() => setActiveTab('tasks')}
                        />

                        {/* 7. Time Saved 2.0 Productivity Insight */}
                        <TimeSavedWidget />
                      </>
                    )}
                  </div>
                )}

                {/* Decision Center Tab (Stage 7) */}
                {activeTab === 'decisions' && (
                  <DecisionCenterView />
                )}

                {/* Tasks Tab (All Tasks Management 2.0) */}
                {activeTab === 'tasks' && (
                  <div>
                    <ActiveTasksList
                      tasks={tasks}
                      onTaskClick={(task) => setSelectedTask(task)}
                      onViewAllClick={() => {}}
                      maxDisplay={100}
                    />
                  </div>
                )}

                {/* Life Inbox Tab */}
                {activeTab === 'inbox' && (
                  <LifeInboxView
                    onTaskCreated={() => {
                      setActiveTab('tasks');
                    }}
                  />
                )}

                {/* Services Marketplace Tab */}
                {activeTab === 'services' && (
                  <ServicesCatalogView
                    onCategorySelect={handleCategorySelectFromCatalog}
                    onServiceSelect={(srv) => {
                      const prompt = language === 'ka'
                        ? `${srv.nameKa} მინდა დღეს`
                        : `Need ${srv.name} today`;
                      handleAIQuerySubmit(prompt);
                      setActiveTab('home');
                    }}
                  />
                )}


                {/* My Home Tab */}
                {activeTab === 'myhome' && (
                  <MyHomeView
                    onScheduleService={() => {
                      setActiveTab('tasks');
                    }}
                  />
                )}

                {/* Family Tab */}
                {activeTab === 'family' && (
                  <FamilyView
                    onTaskCreated={() => {
                      setActiveTab('tasks');
                    }}
                  />
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <ProfileModal isOpen={true} onClose={() => setActiveTab('home')} />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* 3. Contextual Right Panel on Wide Desktops (≥1440px) */}
      <ContextPanel
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        onSelectTask={(task) => setSelectedTask(task)}
      />

      {/* 4. Mobile-first Bottom Navigation (<1024px) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedTask(null);
        }}
        onAiTrigger={() => {
          setAiWorkspacePrompt('');
          setShowAIWorkspace(true);
        }}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* 5. Universal Command Palette (Cmd + K) */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setSelectedTask(null);
        }}
        onTriggerAI={(prompt) => {
          handleAIQuerySubmit(prompt);
        }}
        onOpenMemory={() => setShowAIMemory(true)}
        onOpenErrand={() => setShowErrandMode(true)}
        onOpenGuide={() => setShowGuideModal(true)}
      />

      {/* 6. AI Memory Center Modal */}
      <AIMemoryModal
        isOpen={showAIMemory}
        onClose={() => setShowAIMemory(false)}
      />

      {/* 6b. Privacy & Data Center Modal */}
      <PrivacyCenterModal
        isOpen={showPrivacyCenter}
        onClose={() => setShowPrivacyCenter(false)}
      />

      {/* 7. Errand Mode Modal */}
      <ErrandModeModal
        isOpen={showErrandMode}
        onClose={() => setShowErrandMode(false)}
        onConfirmErrand={handleConfirmErrand}
      />

      {/* 8. Booking Confirmation Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onConfirm={handleConfirmBooking}
        provider={selectedProviderForBooking}
        intent={activeIntent}
      />

      {/* 9. Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* 10. User Profile Modal */}
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      {/* 11. Registration & Login Modal */}
      <AuthModal />

      {/* 12. Stage 4 AI Conversation Workspace */}
      {showAIWorkspace && (
        <AIConversationWorkspace
          initialPrompt={aiWorkspacePrompt}
          onClose={() => setShowAIWorkspace(false)}
          onTaskCreated={(task) => {
            setShowAIWorkspace(false);
            setSelectedTask(task);
          }}
        />
      )}

      {/* 13. Trust & Transparency Modal */}
      <TrustModal
        isOpen={showTrustModal}
        onClose={() => setShowTrustModal(false)}
      />

      {/* 14. Guide & Features Documentation Modal */}
      <GuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      {/* 15. Mobile Navigation Drawer (<1024px) */}
      <MobileNavDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedTask(null);
        }}
        activePortal={activePortal}
        setActivePortal={(portal) => {
          setActivePortal(portal);
          setSelectedTask(null);
        }}
        onOpenProfile={() => setShowProfile(true)}
        onOpenGuide={() => setShowGuideModal(true)}
        onOpenPrivacy={() => setShowPrivacyCenter(true)}
        onOpenTrustModal={() => setShowTrustModal(true)}
        onGoHome={handleNavigateHome}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TaskProvider>
            <MainApp />
          </TaskProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
