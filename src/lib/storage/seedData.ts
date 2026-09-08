import { Provider } from '../../types/provider';
import { HomeProfile } from '../../types/home';
import { LifeInboxItem } from '../../types/inbox';
import { Task } from '../../types/task';
import { UserProfile } from '../../types/user';
import {
  ServiceCatalogItem,
  Booking,
  Quote,
  AuditEvent,
  OperationalNotification,
  Dispute,
  ChatMessage,
} from '../../types/marketplace';

// Initial Super Administrator
export const initialUser: UserProfile = {
  id: 'usr_nukri',
  firstName: 'ნუკრი',
  lastName: 'ჩაჩავა',
  email: 'nukrichachava9@gmail.com',
  phone: '+995 599 12 34 56',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  city: 'თბილისი',
  role: 'admin',
  status: 'verified',
  permissions: {
    canUseAI: true,
    canBookTasks: true,
    canViewCatalog: true,
    canAccessDecisionCenter: true,
    canAccessWallet: true,
    canAccessProviderPortal: true,
  },
  verifiedAt: new Date().toISOString(),
  verifiedBy: 'System',
  isBlocked: false,
  preferences: {
    preferredLanguage: 'ka',
    preferredTimeOfDay: 'evening',
    allowPhoneCalls: false,
    priorityCriteria: 'highest_rated',
    savedAddresses: [],
    favoriteProviderIds: [],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Clean Users Database: Only super admin on start
export const seedUsers: UserProfile[] = [
  initialUser,
];

// Clean Providers Database: Empty slate
export const seedProviders: Provider[] = [];

// Foundational Clean Service Catalog
export const seedServices: ServiceCatalogItem[] = [
  {
    id: 'srv_plumbing_diagnostic',
    name: 'Plumbing Diagnostics & Repair',
    nameKa: 'სანტექნიკის დიაგნოსტიკა & შეკეთება',
    category: 'plumbing',
    description: 'Leak detection, pipe repairs, faucet and siphon replacements.',
    descriptionKa: 'გაჟონვის აღმოფხვრა, მილების შეკეთება, ონკანისა და სიფონის შეცვლა.',
    pricingModel: 'price_range',
    priceRange: { min: 35, max: 80 },
    durationHours: 1.5,
    requiredInfo: ['პრობლემის ტიპი', 'სავარაუდო ლოკაცია'],
    serviceAreas: ['თბილისი'],
    availabilityNoteKa: 'ხელმისაწვდომია ყოველდღე',
  },
  {
    id: 'srv_electric_diagnostic',
    name: 'Electrical Inspection & Installation',
    nameKa: 'ელექტროობის დიაგნოსტიკა & მონტაჟი',
    category: 'electrician',
    description: 'Short circuit troubleshooting, socket & switch installation, breaker replacement.',
    descriptionKa: 'მოკლე ჩართვის დიაგნოსტიკა, როზეტების, ჩამრთველებისა და ავტომატების მონტაჟი.',
    pricingModel: 'price_range',
    priceRange: { min: 30, max: 75 },
    durationHours: 1.5,
    requiredInfo: ['დაზიანების ტიპი', 'წერტილების რაოდენობა'],
    serviceAreas: ['თბილისი'],
    availabilityNoteKa: 'ხელმისაწვდომია ყოველდღე',
  },
  {
    id: 'srv_cleaning_general',
    name: 'Apartment Deep Cleaning',
    nameKa: 'ბინის გენერალური დალაგება',
    category: 'cleaning',
    description: 'Deep cleaning of living spaces, bathrooms, and kitchen degreasing.',
    descriptionKa: 'ოთახების, სველი წერტილებისა და სამზარეულოს გენერალური დასუფთავება.',
    pricingModel: 'price_range',
    priceRange: { min: 80, max: 150 },
    durationHours: 4.0,
    requiredInfo: ['ფართობი (კვ.მ)', 'ოთახების რაოდენობა'],
    serviceAreas: ['თბილისი'],
    availabilityNoteKa: 'ხელმისაწვდომია ყოველდღე',
  },
  {
    id: 'srv_ac_maintenance',
    name: 'Air Conditioner Inspection & Cleaning',
    nameKa: 'კონდიციონერის შემოწმება & წმენდა',
    category: 'ac_heating',
    description: 'Antibacterial wash, filter clean, freon pressure check.',
    descriptionKa: 'ანტიბაქტერიული წმენდა, ფილტრების გარეცხვა, ფრეონის წნევის შემოწმება.',
    pricingModel: 'price_range',
    priceRange: { min: 50, max: 90 },
    durationHours: 1.5,
    requiredInfo: ['კონდიციონერის ტიპი', 'მდებარეობა'],
    serviceAreas: ['თბილისი'],
    availabilityNoteKa: 'ხელმისაწვდომია ყოველდღე',
  },
  {
    id: 'srv_courier_express',
    name: 'Express Courier & Delivery',
    nameKa: 'ექსპრეს კურიერი / ამანათის მიტანა',
    category: 'courier',
    description: 'Fast delivery of documents, small packages, and personal errands.',
    descriptionKa: 'დოკუმენტების, მცირე ზომის ამანათებისა და პირადი დავალებების სწრაფი მიტანა.',
    pricingModel: 'fixed',
    basePrice: 20,
    durationHours: 1.0,
    requiredInfo: ['აღების მისამართი', 'ჩაბარების მისამართი'],
    serviceAreas: ['თბილისი'],
    availabilityNoteKa: 'ხელმისაწვდომია 24/7',
  },
  {
    id: 'srv_car_wash_mobile',
    name: 'Mobile On-Site Car Wash',
    nameKa: 'მობილური ავტოსამრეცხაო',
    category: 'car_wash',
    description: 'On-demand exterior eco wash and interior vacuuming at your location.',
    descriptionKa: 'მანქანის გარეცხვა და სალონის მოწესრიგება ადგილზე მოსვლით.',
    pricingModel: 'fixed',
    basePrice: 35,
    durationHours: 1.0,
    requiredInfo: ['მანქანის მოდელი', 'მისამართი'],
    serviceAreas: ['თბილისი'],
    availabilityNoteKa: 'ხელმისაწვდომია ყოველდღე',
  },
];

// Clean Bookings Database: Empty slate
export const seedBookings: Booking[] = [];

// Clean Quotes Database: Empty slate
export const seedQuotes: Quote[] = [];

// Clean Contextual Chat Messages: Empty slate
export const seedChatMessages: ChatMessage[] = [];

// Clean Disputes Database: Empty slate
export const seedDisputes: Dispute[] = [];

// Clean Audit Events: System initialized
export const seedAuditEvents: AuditEvent[] = [
  {
    id: 'aud_init_system',
    eventType: 'task.created',
    entityId: 'sys_doxo_clean',
    actorId: 'usr_nukri',
    actorRole: 'admin',
    actorName: 'ნუკრი ჩაჩავა',
    timestamp: new Date().toISOString(),
    detailsKa: 'DOXO სისტემა გაეშვა architect2.ge-ზე სუფთა ფურცლიდან.',
  },
];

// Clean Notifications: Empty slate
export const seedNotifications: OperationalNotification[] = [];

// Clean Active Tasks: Empty slate
export const seedActiveTasks: Task[] = [];

// Clean Home Profile: Empty slate
export const seedHomeProfile: HomeProfile = {
  id: 'home_clean',
  title: 'ჩემი სახლი',
  titleKa: 'ჩემი სახლი',
  address: 'თბილისი',
  district: 'თბილისი',
  roomsCount: 1,
  squareMeters: 50,
  appliances: [],
};

// Clean Inbox Items: Empty slate
export const seedInboxItems: LifeInboxItem[] = [];
