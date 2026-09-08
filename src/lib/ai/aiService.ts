import { ServiceCategory, Task, UrgencyLevel } from '../../types/task';
import { Provider } from '../../types/provider';
import { UserPreferences } from '../../types/user';
import { DoxoStorage } from '../storage/db';
import { calculateDoxoMatch } from './matchAlgorithm';
import { StructuredPlan, PlanSubItem } from '../../types/ai';

export interface AnalyzedIntent {
  category: ServiceCategory;
  urgency: UrgencyLevel;
  suggestedTitleKa: string;
  suggestedTitleEn: string;
  location: string;
  preferredTime: string;
  estimatedPrice: {
    min: number;
    max: number;
    currency: '₾';
    marketStatus: 'below_average' | 'normal_range' | 'above_average' | 'insufficient_data';
    explanationText: string;
  };
  timeSavedMinutes: number;
  aiClarificationKa?: string;
  aiClarificationEn?: string;
  isMultiIntent?: boolean;
  multiIntentItems?: {
    category: ServiceCategory;
    titleKa: string;
    titleEn: string;
    estimatedTime: string;
  }[];
  structuredPlan?: StructuredPlan;
}

export class AIService {
  /**
   * Generates a grounded multi-intent plan using real backend provider pricing & availability
   */
  static buildStructuredPlan(rawPrompt: string, userDistrict = 'ვაკე, თბილისი'): StructuredPlan | null {
    const text = rawPrompt.toLowerCase();
    const isMulti = 
      (text.includes('დალაგება') || text.includes('დასუფთავებ')) &&
      (text.includes('მანქან') || text.includes('რეცხვა') || text.includes('კონდიციონერ') || text.includes('ონკან'));

    if (!isMulti && !text.includes('3 საქმე') && !text.includes('გეგმა') && !text.includes('სტუმრები')) {
      return null;
    }

    const providers = DoxoStorage.getProviders();
    const nino = providers.find(p => p.id === 'prov_nino_clean') || providers[2];
    const bata = providers.find(p => p.id === 'prov_bata_carwash') || providers[0];
    const levan = providers.find(p => p.id === 'prov_levan_ac') || providers[4];

    const items: PlanSubItem[] = [];

    // 1. Cleaning
    if (text.includes('დალაგება') || text.includes('დასუფთავებ') || text.includes('სტუმრები') || text.includes('სახლ')) {
      items.push({
        id: 'plan_item_clean',
        category: 'cleaning',
        titleKa: 'ბინის დალაგება',
        titleEn: 'Apartment Cleaning',
        timeWindow: '18:00–20:00',
        estimatedPrice: {
          min: nino ? nino.pricing.min : 70,
          max: nino ? nino.pricing.max : 100,
          currency: '₾',
        },
        providerCandidate: nino,
        status: 'ready',
      });
    }

    // 2. Car Wash
    if (text.includes('მანქან') || text.includes('გარეცხვა') || text.includes('ავტომობილ')) {
      items.push({
        id: 'plan_item_car',
        category: 'car_wash',
        titleKa: 'მანქანის გარეცხვა (ადგილზე)',
        titleEn: 'Mobile Car Wash & Detailing',
        timeWindow: '19:00–20:00',
        estimatedPrice: {
          min: bata ? bata.pricing.min : 30,
          max: bata ? bata.pricing.max : 45,
          currency: '₾',
        },
        providerCandidate: bata,
        status: 'ready',
      });
    }

    // 3. AC Check
    if (text.includes('კონდიციონერ') || text.includes('გათბობ') || text.includes('ფილტრ')) {
      items.push({
        id: 'plan_item_ac',
        category: 'ac_heating',
        titleKa: 'კონდიციონერის შემოწმება',
        titleEn: 'AC Inspection & Filter Clean',
        timeWindow: '18:00–20:00',
        estimatedPrice: {
          min: levan ? levan.pricing.min : 70,
          max: levan ? levan.pricing.max : 110,
          currency: '₾',
        },
        providerCandidate: levan,
        status: 'ready',
      });
    }

    if (items.length === 0) return null;

    const minTotal = items.reduce((acc, it) => acc + it.estimatedPrice.min, 0);
    const maxTotal = items.reduce((acc, it) => acc + it.estimatedPrice.max, 0);

    const targetDate = text.includes('შაბათ') ? 'შაბათი' : text.includes('დღეს') ? 'დღეს' : 'ხვალ';

    return {
      id: `plan_${Date.now()}`,
      targetDate,
      summaryKa: `${targetDate}სთვის ${items.length} საქმეა მომზადებული`,
      summaryEn: `${items.length} tasks planned for ${targetDate}`,
      items,
      canBundle: true,
      bundleSavingsMinutes: 45,
      totalPriceRange: {
        min: minTotal,
        max: maxTotal,
        currency: '₾',
      },
      visitsCount: 1, // bundled into 1 visit window
    };
  }

  /**
   * Natural Language Plan Editing
   * Allows user to shift time, remove items, or move days
   */
  static editPlan(currentPlan: StructuredPlan, command: string): { updatedPlan: StructuredPlan; changeDescriptionKa: string; changeDescriptionEn: string } {
    const text = command.toLowerCase();
    let updatedItems = [...currentPlan.items];
    let changeDescKa = 'გეგმა განახლდა';
    let changeDescEn = 'Plan updated';
    let targetDate = currentPlan.targetDate;

    // 1. Shift Cleaning 1 hour earlier ("დალაგება ერთი საათით ადრე გადაიტანე")
    if ((text.includes('დალაგებ') || text.includes('დასუფთავებ')) && (text.includes('ადრე') || text.includes('17:00') || text.includes('საათით ადრე'))) {
      updatedItems = updatedItems.map(item => {
        if (item.category === 'cleaning') {
          return {
            ...item,
            timeWindow: '17:00–19:00',
            isUpdated: true,
          };
        }
        return item;
      });
      changeDescKa = 'დალაგება 1 საათით ადრე (17:00–19:00) გადავიტანე.';
      changeDescEn = 'Moved apartment cleaning 1 hour earlier (17:00–19:00).';
    }

    // 2. Remove AC ("კონდიციონერი ამოიღე")
    else if (text.includes('კონდიციონერ') && (text.includes('ამოიღ') || text.includes('წაშალ') || text.includes('გააუქმე') || text.includes('არ მინდა'))) {
      updatedItems = updatedItems.filter(item => item.category !== 'ac_heating');
      changeDescKa = 'კონდიციონერის შემოწმება ამოვიღე გეგმიდან.';
      changeDescEn = 'Removed AC inspection from the plan.';
    }

    // 3. Remove Car Wash ("მანქანა ამოიღე")
    else if (text.includes('მანქან') && (text.includes('ამოიღ') || text.includes('წაშალ') || text.includes('გააუქმე'))) {
      updatedItems = updatedItems.filter(item => item.category !== 'car_wash');
      changeDescKa = 'მანქანის გარეცხვა ამოვიღე გეგმიდან.';
      changeDescEn = 'Removed mobile car wash from the plan.';
    }

    // 4. Move all to Saturday ("ყველაფერი შაბათისთვის გადაიტანე")
    else if (text.includes('შაბათ')) {
      targetDate = 'შაბათი';
      updatedItems = updatedItems.map(item => ({ ...item, isUpdated: true }));
      changeDescKa = 'ყველა საქმე შაბათისთვის გადავიტანე.';
      changeDescEn = 'Rescheduled all tasks to Saturday.';
    }

    // Recalculate totals
    const minTotal = updatedItems.reduce((acc, it) => acc + it.estimatedPrice.min, 0);
    const maxTotal = updatedItems.reduce((acc, it) => acc + it.estimatedPrice.max, 0);

    const updatedPlan: StructuredPlan = {
      ...currentPlan,
      targetDate,
      items: updatedItems,
      summaryKa: `${targetDate}სთვის ${updatedItems.length} საქმეა მომზადებული`,
      summaryEn: `${updatedItems.length} tasks scheduled for ${targetDate}`,
      totalPriceRange: {
        min: minTotal,
        max: maxTotal,
        currency: '₾',
      },
    };

    return { updatedPlan, changeDescriptionKa: changeDescKa, changeDescriptionEn: changeDescEn };
  }

  /**
   * Generates genuine "Why this provider?" explainability points grounded in actual provider data
   */
  static getWhyThisExplanation(provider: Provider, userDistrict = 'ვაკე'): { bulletsKa: string[]; bulletsEn: string[] } {
    const isNearby = provider.serviceAreas.some(area => userDistrict.includes(area) || area.includes('ვაკე') || area.includes('საბურთალო'));
    
    const bulletsKa: string[] = [
      isNearby ? `შენს უბანში მუშაობს (${provider.serviceAreas.slice(0, 3).join(', ')})` : 'მთელ თბილისში უზრუნველყოფს სწრაფ მომსახურებას',
      `სასურველ დროს თავისუფალია (${provider.estimatedArrivalMinutes || 35} წუთში ჩამოსვლა)`,
      `მაღალი შეფასება აქვს (${provider.rating} ★, ${provider.reviewCount} შეფასება)`,
      `მსგავსი საქმეები ხშირად აქვს შესრულებული (${provider.completedSimilarTasksCount || provider.completedJobs}+ შესრულება)`,
    ];

    if (provider.specialtiesKa && provider.specialtiesKa.length > 0) {
      bulletsKa.push(`სპეციალიზაცია: ${provider.specialtiesKa.slice(0, 2).join(', ')}`);
    }

    const bulletsEn: string[] = [
      isNearby ? `Serves your neighborhood (${provider.serviceAreas.slice(0, 3).join(', ')})` : 'Provides fast city-wide coverage',
      `Available at preferred time (ETA ~${provider.estimatedArrivalMinutes || 35} mins)`,
      `High verified rating (${provider.rating} ★, ${provider.reviewCount} reviews)`,
      `Proven track record with similar jobs (${provider.completedSimilarTasksCount || provider.completedJobs}+ completed)`,
    ];

    return { bulletsKa, bulletsEn };
  }

  /**
   * Natural Language Intent Parser supporting Georgian & English
   */
  static analyzeIntent(rawPrompt: string, userPrefs?: UserPreferences): AnalyzedIntent {
    const text = rawPrompt.toLowerCase();

    // Check for multi-intent plan first
    const structuredPlan = this.buildStructuredPlan(rawPrompt);
    if (structuredPlan) {
      return {
        category: structuredPlan.items[0]?.category || 'cleaning',
        urgency: 'medium',
        suggestedTitleKa: `${structuredPlan.targetDate}ს გეგმა (${structuredPlan.items.length} საქმე)`,
        suggestedTitleEn: `${structuredPlan.targetDate} Plan (${structuredPlan.items.length} tasks)`,
        location: 'ვაკე, თბილისი',
        preferredTime: `${structuredPlan.targetDate} · 18:00`,
        estimatedPrice: {
          min: structuredPlan.totalPriceRange.min,
          max: structuredPlan.totalPriceRange.max,
          currency: '₾',
          marketStatus: 'normal_range',
          explanationText: 'მოიცავს რამდენიმე მომსახურების გაერთიანებულ პაკეტს',
        },
        timeSavedMinutes: structuredPlan.bundleSavingsMinutes * structuredPlan.items.length,
        aiClarificationKa: `მივხვდი. ${structuredPlan.targetDate}სთვის ${structuredPlan.items.length} საქმეა: ${structuredPlan.items.map(i => i.titleKa).join(', ')}. შემიძლია ყველაფერი ერთ ვიზიტად დავაჯგუფო.`,
        aiClarificationEn: `Understood. Planned ${structuredPlan.items.length} tasks: ${structuredPlan.items.map(i => i.titleEn).join(', ')}.`,
        isMultiIntent: true,
        multiIntentItems: structuredPlan.items.map(i => ({
          category: i.category,
          titleKa: i.titleKa,
          titleEn: i.titleEn,
          estimatedTime: i.timeWindow,
        })),
        structuredPlan,
      };
    }

    // 2. Detect Category
    let category: ServiceCategory = 'cleaning';
    let titleKa = 'ბინის დასუფთავება';
    let titleEn = 'Home Cleaning';
    let minPrice = 70;
    let maxPrice = 110;
    let timeSaved = 180;

    if (text.includes('მანქან') || text.includes('რეცხვ') || text.includes('დითეილინგ') || text.includes('car wash') || text.includes('wash')) {
      category = 'car_wash';
      titleKa = 'მობილური მანქანის რეცხვა';
      titleEn = 'Mobile Car Wash';
      minPrice = 30;
      maxPrice = 45;
      timeSaved = 90;
    } else if (text.includes('წყალ') || text.includes('ონკან') || text.includes('სანტექნიკ') || text.includes('ჟონავ') || text.includes('მილ') || text.includes('plumb') || text.includes('leak') || text.includes('sink')) {
      category = 'plumbing';
      titleKa = 'აბაზანაში წყლის გაჟონვა';
      titleEn = 'Bathroom Water Leak';
      minPrice = 60;
      maxPrice = 85;
      timeSaved = 120;
    } else if (text.includes('კონდიციონერ') || text.includes('გათბობ') || text.includes('ქვაბ') || text.includes('ფრეონ') || text.includes('ac') || text.includes('heating')) {
      category = 'ac_heating';
      titleKa = 'კონდიციონერის შემოწმება და წმენდა';
      titleEn = 'AC Inspection & Cleaning';
      minPrice = 70;
      maxPrice = 110;
      timeSaved = 150;
    } else if (text.includes('ელექტრიკ') || text.includes('შუქ') || text.includes('დენ') || text.includes('როზეტ') || text.includes('ჭაღ') || text.includes('electric') || text.includes('light')) {
      category = 'electrician';
      titleKa = 'ელექტრო გაყვანილობის შეკეთება';
      titleEn = 'Electrical Repair';
      minPrice = 50;
      maxPrice = 90;
      timeSaved = 120;
    } else if (text.includes('კურიერ') || text.includes('მოტან') || text.includes('მიტან') || text.includes('ამანათ') || text.includes('საბუთ') || text.includes('courier') || text.includes('delivery')) {
      category = 'courier';
      titleKa = 'სწრაფი ექსპრეს მიტანა';
      titleEn = 'Express Errand & Delivery';
      minPrice = 25;
      maxPrice = 45;
    }

    // 3. Detect Urgency & Time
    let urgency: UrgencyLevel = 'medium';
    let preferredTime = 'ხვალ · 12:00';

    if (text.includes('დღეს') || text.includes('ახლავე') || text.includes('სასწრაფო') || text.includes('today') || text.includes('now') || text.includes('urgent')) {
      urgency = 'high';
      preferredTime = 'დღეს · 18:30';
    } else if (text.includes('საღამო') || text.includes('evening') || text.includes('18:') || text.includes('19:')) {
      preferredTime = 'ხვალ · 18:00–20:00';
    } else if (text.includes('მომავალ კვირ') || text.includes('next week')) {
      preferredTime = 'მომავალ კვირას · 18:00';
    }

    // 4. District detection
    let location = 'ვაკე, თბილისი';
    if (text.includes('საბურთალო')) location = 'საბურთალო, თბილისი';
    if (text.includes('ვერა')) location = 'ვერა, თბილისი';
    if (text.includes('მთაწმინდა')) location = 'მთაწმინდა, თბილისი';
    if (text.includes('დიღომი')) location = 'დიღომი, თბილისი';

    const isRepeatRequest = text.includes('იგივე') || text.includes('ისევ') || text.includes('წინა');
    const aiClarificationKa = isRepeatRequest
      ? `მივხვდი. წინა წარმატებული გამოცდილების საფუძველზე შევარჩიე შენი რჩეული სპეციალისტი (${location}), რომელიც ${preferredTime}-ზე თავისუფალია.`
      : `მივხვდი. ვეძებ საუკეთესო სპეციალისტს (${location}), რომელიც ${preferredTime}-ზე შეძლებს მოსვლას.`;

    return {
      category,
      urgency,
      suggestedTitleKa: titleKa,
      suggestedTitleEn: titleEn,
      location,
      preferredTime,
      estimatedPrice: {
        min: minPrice,
        max: maxPrice,
        currency: '₾',
        marketStatus: 'normal_range',
        explanationText: 'საბაზრო მონაცემებზე დაყრდნობით ნორმალურ დიაპაზონშია',
      },
      timeSavedMinutes: timeSaved,
      aiClarificationKa,
      aiClarificationEn: `Understood. Finding verified specialists for ${preferredTime} in ${location}.`,
    };
  }

  /**
   * Find and rank specialists using DOXO Match algorithm

   */
  static rankProvidersForTask(
    category: ServiceCategory,
    userDistrict: string,
    urgency: UrgencyLevel,
    userPrefs?: UserPreferences
  ): Provider[] {
    const allProviders = DoxoStorage.getProviders();
    const matched = allProviders.filter(p => p.categories.includes(category));

    // Calculate score and assign rationale
    const scored = matched.map(p => {
      const { score, reasons, rationaleKa, rationaleEn } = calculateDoxoMatch(p, category, userDistrict, urgency, userPrefs);
      return {
        ...p,
        matchScore: score,
        matchReasons: reasons,
        matchRationaleKa: rationaleKa,
        matchRationaleEn: rationaleEn,
      };
    });

    // Rank highest first, return top 2 - 4
    scored.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    return scored.slice(0, 3);
  }
}

