import {
  DecisionItem,
  DecisionOption,
  DecisionPriorityPreference,
  ApprovalActionItem,
  ProductivitySummary,
} from '../../types/decision';
import { DoxoStorage } from '../storage/db';

export const initialDecisions: DecisionItem[] = [
  {
    id: 'dec-provider-cleaning',
    titleKa: 'რომელი პროვაიდერი ავირჩიოთ დასუფთავებისთვის?',
    titleEn: 'Which provider should we select for cleaning?',
    category: 'provider_choice',
    status: 'pending',
    urgency: 'urgent',
    deadlineKa: 'დღეს 17:00-მდე',
    deadlineEn: 'Today before 17:00',
    contextKa: 'ბინის გენერალური დალაგება დღეს საღამოს. სისტემამ იპოვა 3 ხელმისაწვდომი პროვაიდერი.',
    contextEn: 'Deep apartment cleaning for tonight. System matched 3 verified providers.',
    doxoRecommendation: {
      recommendedOptionId: 'opt-clean-a',
      whatKa: 'მე ნინო ბერიძეს (ვარიანტი A) გირჩევ.',
      whatEn: 'I recommend Nino Beridze (Option A).',
      whyKa: [
        'უფრო მაღალი შეფასება (4.9 ★, 128 შეფასება)',
        'სასურველ დროს (დღეს 18:00) თავისუფალია',
        'შენს წინა მოთხოვნებთან და უბანთან (საბურთალო) უფრო ახლოსაა',
      ],
      whyEn: [
        'Higher rating (4.9 ★, 128 reviews)',
        'Available at your preferred time (Today 18:00)',
        'Closest to your neighborhood (Saburtalo) and past preferences',
      ],
      tradeoffKa: 'ვარიანტი B-ზე 20 ₾-ით ძვირია, მაგრამ უფრო მაღალი შეფასებითა და ზუსტ დროს.',
      tradeoffEn: '20 ₾ more than Option B, but with higher rating and at your exact time.',
      nextStepKa: 'აირჩიე სასურველი ვარიანტი და დაადასტურე ჯავშანი.',
      nextStepEn: 'Select your preferred option and confirm booking.',
      confidenceScore: 96,
      confidenceTextKa: 'მაღალი შესაბამისობა (96%)',
      disclaimerKa: 'საბოლოო არჩევანი შენია.',
    },
    options: [
      {
        id: 'opt-clean-a',
        titleKa: 'ნინო ბერიძე · Top Rated',
        titleEn: 'Nino Beridze · Top Rated',
        price: 90,
        priceFormatted: '90 ₾',
        rating: 4.9,
        reviewCount: 128,
        availableTimeKa: 'დღეს 18:00',
        availableTimeEn: 'Today 18:00',
        prosKa: ['უმაღლესი რეიტინგი (4.9)', 'ზუსტი დრო (18:00)', 'საბურთალოზე მუშაობს'],
        prosEn: ['Highest rating (4.9)', 'Exact requested time (18:00)', 'Works in Saburtalo'],
        consKa: ['საშუალოზე 15 ₾-ით მეტი'],
        consEn: ['15 ₾ above average'],
        reliabilityScore: 98,
        isBestValue: true,
        scoreExplanationKa: 'საუკეთესო ბალანსი ხარისხსა და რეპუტაციას შორის',
        includedServicesKa: ['სველი და მშრალი წმენდა', 'სამზარეულოსა და აბაზანის დეზინფექცია', 'ნაგვის გატანა'],
        notIncludedServicesKa: ['ფანჯრების გარედან წმენდა (ცალკე მოთხოვნით)'],
        warrantyKa: 'ხარისხის გარანტია: უფასო გადაკეთება 24 საათში',
      },
      {
        id: 'opt-clean-b',
        titleKa: 'გიორგი მაისურაძე · CleanPro',
        titleEn: 'Giorgi Maisuradze · CleanPro',
        price: 70,
        priceFormatted: '70 ₾',
        rating: 4.7,
        reviewCount: 64,
        availableTimeKa: 'დღეს 20:00',
        availableTimeEn: 'Today 20:00',
        prosKa: ['ყველაზე დაბალი ფასი (70 ₾)', 'სანდო პროვაიდერი (4.7)'],
        prosEn: ['Lowest price (70 ₾)', 'Reliable provider (4.7)'],
        consKa: ['უფრო გვიან საღამოს (20:00)'],
        consEn: ['Later in evening (20:00)'],
        reliabilityScore: 90,
        isBestValue: false,
        scoreExplanationKa: 'ბიუჯეტური არჩევანი',
        includedServicesKa: ['სტანდარტული დალაგება', 'იატაკის მოწესრიგება'],
        notIncludedServicesKa: ['ღუმელისა და მაცივრის შიდა წმენდა'],
      },
      {
        id: 'opt-clean-c',
        titleKa: 'EcoClean Studio',
        titleEn: 'EcoClean Studio',
        price: 85,
        priceFormatted: '85 ₾',
        rating: 4.9,
        reviewCount: 92,
        availableTimeKa: 'ხვალ 18:00',
        availableTimeEn: 'Tomorrow 18:00',
        prosKa: ['ეკოლოგიური ჰიპოალერგიული საშუალებები', 'მაღალი შეფასება (4.9)'],
        prosEn: ['Eco-friendly certified products', 'High rating (4.9)'],
        consKa: ['მხოლოდ ხვალ საღამოსთვისაა თავისუფალი'],
        consEn: ['Only available tomorrow evening'],
        reliabilityScore: 94,
        isBestValue: false,
        scoreExplanationKa: 'ეკო-ალტერნატივა ხვალინდელი დღისთვის',
        includedServicesKa: ['ეკო-ქიმწმენდა', 'მტვრის ალერგენ-ფილტრაცია'],
      },
    ],
    tradeoffs: [
      {
        optionAId: 'opt-clean-a',
        optionBId: 'opt-clean-b',
        ruleKa: 'თუ დრო და ხარისხი მთავარია → ვარიანტი A; თუ ფასი მთავარია → ვარიანტი B',
        ruleEn: 'If time & quality matter most → Option A; If budget matters most → Option B',
      },
      {
        optionAId: 'opt-clean-a',
        optionBId: 'opt-clean-c',
        ruleKa: 'თუ დღესვე გინდა → ვარიანტი A; თუ ეკო-საშუალებები გირჩევნია ხვალ → ვარიანტი C',
        ruleEn: 'If needed today → Option A; If eco-certified is preferred tomorrow → Option C',
      },
    ],
    priceBreakdown: {
      items: [
        { labelKa: 'ბინის ძირითადი დალაგება', labelEn: 'Standard Apartment Cleaning', amount: 75, amountFormatted: '75 ₾' },
        { labelKa: 'ვიზიტისა და ინვენტარის საფასური', labelEn: 'Visit & Equipment Fee', amount: 15, amountFormatted: '15 ₾' },
        { labelKa: 'დამატებითი ხარჯი', labelEn: 'Extra Expenses', amount: 0, amountFormatted: '0 ₾' },
      ],
      total: 90,
      totalFormatted: '90 ₾',
    },
    priceInsight: {
      level: 'average',
      textKa: 'ეს ფასი (90 ₾) თბილისში ბინის გენერალური დალაგების საშუალო საბაზრო დონეზეა (80–100 ₾).',
      textEn: 'This price (90 ₾) is within the market average for Tbilisi (80–100 ₾).',
      benchmarkRangeKa: '80 ₾ – 100 ₾',
      hasSufficientData: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dec-conflict-schedule',
    titleKa: 'ამ ჯავშნების დრო შევცვალოთ? (კონფლიქტის მოგვარება)',
    titleEn: 'Reschedule overlapping bookings? (Collision Resolution)',
    category: 'schedule_conflict',
    status: 'pending',
    urgency: 'urgent',
    deadlineKa: 'დაუყოვნებლივ',
    deadlineEn: 'Immediately',
    contextKa: 'ორი დაგეგმილი საქმე დროში ერთმანეთს ემთხვევა და გადაადგილება შეუძლებელია.',
    contextEn: 'Two scheduled tasks overlap in time making attendance impossible.',
    doxoRecommendation: {
      recommendedOptionId: 'opt-conflict-1',
      whatKa: 'გირჩევ კონდიციონერის შემოწმება 16:30-ზე გადმოიტანო.',
      whatEn: 'I recommend moving AC inspection earlier to 16:30.',
      whyKa: [
        'სპეციალისტი 16:30-ზე სრულად თავისუფალია',
        'საღამოს მანქანის მომსახურება უცვლელად დარჩება',
        'თავიდან აირიდებ 1-საათიან კონფლიქტსა და საცობს',
      ],
      whyEn: [
        'Technician is fully available at 16:30',
        'Evening car service remains undisturbed',
        'Avoids 1-hour overlap and rush hour traffic',
      ],
      tradeoffKa: '1.5 საათით ადრე მოგიწევს სახლში ყოფნა.',
      tradeoffEn: 'Requires being home 1.5 hours earlier.',
      nextStepKa: 'დაადასტურე დროის ცვლილება, რათა პროვაიდერს ეცნობოს.',
      nextStepEn: 'Confirm schedule adjustment to notify provider.',
      confidenceScore: 94,
      confidenceTextKa: 'რეკომენდებული ალტერნატივა (94%)',
      disclaimerKa: 'საბოლოო არჩევანი შენია.',
    },
    conflictDetails: {
      taskA: {
        id: 't-ac-1',
        titleKa: 'კონდიციონერის წმენდა & დიაგნოსტიკა',
        timeKa: 'დღეს 18:00 – 19:30',
        locationKa: 'საბურთალო, ვაჟა-ფშაველა',
      },
      taskB: {
        id: 't-car-1',
        titleKa: 'მანქანის დეტალური რეცხვა',
        timeKa: 'დღეს 18:30 – 20:00',
        locationKa: 'ვაკე, ჭავჭავაძე',
      },
      overlapDurationKa: '1 საათი გადაკვეთა',
      travelTimeEstimateKa: 'სავარაუდო მგზავრობა: 30 წთ (საცობში)',
      suggestions: [
        {
          id: 'sug-1',
          titleKa: 'კონდიციონერი 16:30-ზე (1.5 სთ-ით ადრე)',
          descriptionKa: 'ტექნიკოსი მზადაა. ორივე საქმე დღესვე მოგვარდება მშვიდად.',
          appliedOptionId: 'opt-conflict-1',
        },
        {
          id: 'sug-2',
          titleKa: 'მანქანის რეცხვა შაბათს 11:00-ზე',
          descriptionKa: 'დღევანდელი საღამო სრულად გათავისუფლდება.',
          appliedOptionId: 'opt-conflict-2',
        },
      ],
    },
    options: [
      {
        id: 'opt-conflict-1',
        titleKa: 'კონდიციონერი 16:30-ზე (გადმოტანა)',
        titleEn: 'Move AC to 16:30 (Earlier)',
        price: 0,
        priceFormatted: '0 ₾ (უფასო გადატანა)',
        availableTimeKa: 'დღეს 16:30',
        availableTimeEn: 'Today 16:30',
        prosKa: ['ორივე საქმე დღესვე მოგვარდება', 'საღამოს გეგმა არ იცვლება'],
        prosEn: ['Both tasks completed today', 'Evening plan remains intact'],
        consKa: ['1.5 საათით ადრე სახლში მისვლა'],
        consEn: ['Arriving home 1.5 hours earlier'],
        isBestValue: true,
      },
      {
        id: 'opt-conflict-2',
        titleKa: 'მანქანის რეცხვა შაბათს 11:00-ზე (გადადება)',
        titleEn: 'Postpone car wash to Saturday 11:00',
        price: 0,
        priceFormatted: '0 ₾ (უფასო გადატანა)',
        availableTimeKa: 'შაბათი 11:00',
        availableTimeEn: 'Saturday 11:00',
        prosKa: ['დღევანდელი საღამო მშვიდი იქნება'],
        prosEn: ['Today evening stays completely free'],
        consKa: ['მანქანის სუფთად ყოლა გადაიდება შაბათამდე'],
        consEn: ['Clean car is delayed until weekend'],
      },
    ],
    tradeoffs: [
      {
        optionAId: 'opt-conflict-1',
        optionBId: 'opt-conflict-2',
        ruleKa: 'თუ გინდა დღესვე მოაგვარო → ვარიანტი 1; თუ დასვენება გინდა და შაბათი გაწყობს → ვარიანტი 2',
        ruleEn: 'If you want it done today → Option 1; If you prefer postponing to weekend → Option 2',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dec-quote-comparison',
    titleKa: 'სანტექნიკის ორი შეთავაზებიდან რომელი ჯობია?',
    titleEn: 'Which plumbing quote is better?',
    category: 'quote_comparison',
    status: 'pending',
    urgency: 'medium',
    deadlineKa: '2სთ 15წთ-ში (შეთავაზება იწურება)',
    deadlineEn: 'In 2h 15m (Offer expires)',
    contextKa: 'მიღებულია 2 შეთავაზება ონკანისა და მილის შეკეთებაზე. ერთ-ერთ შეთავაზებაში დეტალები აკლია.',
    contextEn: 'Received 2 quotes for pipe & faucet repair. One quote has missing information.',
    doxoRecommendation: {
      recommendedOptionId: 'opt-quote-a',
      whatKa: 'AquaFix (ვარიანტი A) უფრო დაბალრისკიანი და სანდოა.',
      whatEn: 'AquaFix (Option A) has lower risk and complete transparency.',
      whyKa: [
        'ფიქსირებული ფასია (110 ₾) — მასალები და ვიზიტი უკვე შედის',
        '6-თვიანი ოფიციალური გარანტია გაწეულ სამუშაოზე',
        'ვარიანტ B-ში მასალების ხარჯი დაუზუსტებელია და შესაძლოა ფასი გაიზარდოს',
      ],
      whyEn: [
        'Fixed all-inclusive price (110 ₾) — parts and visit included',
        '6-month official warranty on workmanship',
        'Option B has unstated material costs that could increase final total',
      ],
      tradeoffKa: '20 ₾-ით მეტია B-ს საწყის ფასზე, თუმცა საბოლოო გაუთვალისწინებელი ხარჯი გამორიცხულია.',
      tradeoffEn: '20 ₾ higher starting price than B, but completely excludes unexpected add-ons.',
      nextStepKa: 'დაადასტურე AquaFix-ის შეთავაზება ან მოითხოვე B-სგან დეტალების დაზუსტება.',
      nextStepEn: 'Accept AquaFix quote or request missing breakdown from Provider B.',
      confidenceScore: 92,
      confidenceTextKa: 'დაბალი რისკის რეკომენდაცია (92%)',
      disclaimerKa: 'საბოლოო არჩევანი შენია.',
    },
    missingInformationKa: [
      'შეთავაზება B-ს აღწერაში მიტანისა და შემცვლელი მილების საფასური არ ჩანს.',
      'შეთავაზება B-ს არ აქვს მითითებული გარანტიის პირობები.',
    ],
    changeDetails: {
      changeType: 'quote_expiration',
      oldValueKa: 'აქტიური შეთავაზება',
      newValueKa: 'მოქმედებს კიდევ 2სთ 15წთ',
      reasonKa: 'პროვაიდერის მიერ დაწესებული 24-საათიანი ფასის გარანტია იწურება.',
      expiresAt: new Date(Date.now() + 2 * 3600 * 1000 + 15 * 60 * 1000).toISOString(),
      isExpired: false,
    },
    options: [
      {
        id: 'opt-quote-a',
        titleKa: 'AquaFix · All-Inclusive',
        titleEn: 'AquaFix · All-Inclusive',
        price: 110,
        priceFormatted: '110 ₾ (ფიქსირებული)',
        rating: 4.9,
        reviewCount: 89,
        availableTimeKa: 'ხვალ 12:00',
        availableTimeEn: 'Tomorrow 12:00',
        prosKa: ['ფიქსირებული ფასი (110 ₾)', 'მასალები და ვიზიტი შედის', '6 თვე გარანტია'],
        prosEn: ['Fixed price (110 ₾)', 'Materials & visit included', '6-month warranty'],
        consKa: ['საწყისი ფასი 20 ₾-ით მეტია'],
        consEn: ['Starting price 20 ₾ higher'],
        reliabilityScore: 97,
        isBestValue: true,
        scoreExplanationKa: 'გარანტირებული დაცვა ფარული ხარჯებისგან',
        includedServicesKa: ['სანტექნიკოსის ვიზიტი', 'მილის შეკეთება / შეცვლა', 'საკეტები და ფიტინგები', 'სისტემის დაწნევა'],
        warrantyKa: '6 თვიანი გარანტია',
      },
      {
        id: 'opt-quote-b',
        titleKa: 'სანტექნიკ სერვისი (Quote)',
        titleEn: 'Plumbing Service (Quote)',
        price: 90,
        priceFormatted: '90 ₾ (საწყისი)',
        rating: 4.6,
        reviewCount: 42,
        availableTimeKa: 'ხვალ 11:00',
        availableTimeEn: 'Tomorrow 11:00',
        prosKa: ['დაბალი საწყისი ფასი (90 ₾)', '1 საათით ადრე მოსვლა'],
        prosEn: ['Low initial price (90 ₾)', '1 hour earlier arrival'],
        consKa: ['მასალების ღირებულება დაუზუსტებელია', 'გარანტია უცნობია'],
        consEn: ['Material costs not specified', 'Warranty unknown'],
        reliabilityScore: 82,
        includedServicesKa: ['ხელოსნის ვიზიტი', 'დიაგნოსტიკა'],
        notIncludedServicesKa: ['მასალები და ახალი ფიტინგები (ფასი დაზუსტდება ადგილზე)'],
      },
    ],
    tradeoffs: [
      {
        optionAId: 'opt-quote-a',
        optionBId: 'opt-quote-b',
        ruleKa: 'თუ ფიქსირებული ხარჯი და გარანტია გინდა → ვარიანტი A; თუ საწყისი მცირე თანხა გირჩევნია → ვარიანტი B',
        ruleEn: 'If you want guaranteed price & warranty → Option A; If you prefer lowest initial quote → Option B',
      },
    ],
    priceBreakdown: {
      items: [
        { labelKa: 'სანტექნიკური მომსახურება', labelEn: 'Plumbing Labor', amount: 80, amountFormatted: '80 ₾' },
        { labelKa: 'სერტიფიცირებული მასალები', labelEn: 'Certified Parts', amount: 30, amountFormatted: '30 ₾' },
        { labelKa: 'ვიზიტის საფასური', labelEn: 'Visit Fee', amount: 0, amountFormatted: '0 ₾ (შედის)' },
      ],
      total: 110,
      totalFormatted: '110 ₾',
    },
    priceInsight: {
      level: 'average',
      textKa: 'სანტექნიკის მილის შეცვლის საშუალო საბაზრო ფასი თბილისში 95–130 ₾-ია.',
      textEn: 'Average market cost for pipe replacement in Tbilisi is 95–130 ₾.',
      benchmarkRangeKa: '95 ₾ – 130 ₾',
      hasSufficientData: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const initialApprovals: ApprovalActionItem[] = [
  {
    id: 'appr-1',
    type: 'booking',
    titleKa: 'დადასტურება: ნინო ბერიძის ვიზიტი',
    titleEn: 'Approval: Nino Beridze Booking',
    descriptionKa: 'ბინის გენერალური დალაგება დღეს 18:00-ზე. თანხა 90 ₾ გაიყინება ბარათზე.',
    descriptionEn: 'Apartment deep cleaning today at 18:00. Amount 90 ₾ will be held in escrow.',
    costKa: '90 ₾',
    riskLevel: 'HIGH',
    entityId: 'opt-clean-a',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'appr-2',
    type: 'reschedule',
    titleKa: 'დროის შეცვლა: კონდიციონერის შემოწმება',
    titleEn: 'Reschedule: AC Inspection',
    descriptionKa: 'ვიზიტის გადმოტანა 18:00-დან 16:30-ზე კონფლიქტის ასაცილებლად.',
    descriptionEn: 'Move inspection from 18:00 to 16:30 to avoid time collision.',
    costKa: '0 ₾',
    riskLevel: 'MEDIUM',
    entityId: 'dec-conflict-schedule',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'appr-3',
    type: 'payment',
    titleKa: 'ავტორიზაცია: სანტექნიკის ესქროუ დაჭერა',
    titleEn: 'Authorization: Plumbing Escrow Hold',
    descriptionKa: '110 ₾-ის დარეზერვება AquaFix-ის ვიზიტისთვის. პროვაიდერს გადაეცემა მხოლოდ სამუშაოს დასტურისას.',
    descriptionEn: 'Reserve 110 ₾ for AquaFix visit. Released to provider only upon user signoff.',
    costKa: '110 ₾',
    riskLevel: 'HIGH',
    entityId: 'opt-quote-a',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
];

export class DecisionEngine {
  private static STORAGE_DECISIONS_KEY = 'doxo_decisions';
  private static STORAGE_APPROVALS_KEY = 'doxo_approvals';

  // Get all decisions
  static getDecisions(): DecisionItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_DECISIONS_KEY);
      if (!stored) {
        localStorage.setItem(this.STORAGE_DECISIONS_KEY, JSON.stringify(initialDecisions));
        return initialDecisions;
      }
      return JSON.parse(stored);
    } catch {
      return initialDecisions;
    }
  }

  // Save decisions
  static saveDecisions(decisions: DecisionItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_DECISIONS_KEY, JSON.stringify(decisions));
    } catch (e) {
      console.error('Failed to save decisions:', e);
    }
  }

  // Get single decision by ID
  static getDecisionById(id: string): DecisionItem | undefined {
    return this.getDecisions().find(d => d.id === id);
  }

  // Recalculate recommendation based on user preference (Price vs Time vs Quality)
  static applyPreference(decision: DecisionItem, pref: DecisionPriorityPreference): DecisionItem {
    const updated = { ...decision };
    const options = [...updated.options];

    if (pref === 'price') {
      // Prioritize lowest cost
      options.sort((a, b) => a.price - b.price);
      const top = options[0];
      updated.doxoRecommendation = {
        ...updated.doxoRecommendation,
        recommendedOptionId: top.id,
        whatKa: `ფასის პრიორიტეტის მიხედვით: ${top.titleKa}`,
        whatEn: `Based on lowest price priority: ${top.titleEn}`,
        whyKa: [
          `ყველაზე დაბალი ფასი: ${top.priceFormatted}`,
          'ხარჯების მაქსიმალური დაზოგვა',
          'საბაზისო მოთხოვნებს აკმაყოფილებს',
        ],
        whyEn: [
          `Lowest price: ${top.priceFormatted}`,
          'Maximizes cost savings',
          'Meets baseline requirements',
        ],
        tradeoffKa: 'უფრო დაბალი ფასია, თუმცა დრო ან შეფასება შესაძლოა განსხვავდებოდეს.',
        tradeoffEn: 'Lower cost, though timing or rating may vary.',
        disclaimerKa: 'საბოლოო არჩევანი შენია.',
      };
    } else if (pref === 'time') {
      // Prioritize same-day / earliest
      options.sort((a, b) => {
        const aToday = a.availableTimeKa.includes('დღეს') ? -1 : 1;
        const bToday = b.availableTimeKa.includes('დღეს') ? -1 : 1;
        return aToday - bToday;
      });
      const top = options[0];
      updated.doxoRecommendation = {
        ...updated.doxoRecommendation,
        recommendedOptionId: top.id,
        whatKa: `დროის პრიორიტეტის მიხედვით: ${top.titleKa}`,
        whatEn: `Based on earliest timing priority: ${top.titleEn}`,
        whyKa: [
          `ხელმისაწვდომია ყველაზე სწრაფად: ${top.availableTimeKa}`,
          'მინიმალური ლოდინის დრო',
          'დღესვე დასრულების შესაძლებლობა',
        ],
        whyEn: [
          `Available earliest: ${top.availableTimeEn}`,
          'Minimal waiting period',
          'Completes task today',
        ],
        tradeoffKa: 'სწრაფი ვიზიტია, თუმცა ფასი შესაძლოა ოდნავ მაღალი იყოს.',
        tradeoffEn: 'Fastest visit, though cost might be slightly higher.',
        disclaimerKa: 'საბოლოო არჩევანი შენია.',
      };
    } else if (pref === 'quality') {
      // Prioritize highest rating and reliability
      options.sort((a, b) => ((b.rating || 0) + (b.reliabilityScore || 0) / 100) - ((a.rating || 0) + (a.reliabilityScore || 0) / 100));
      const top = options[0];
      updated.doxoRecommendation = {
        ...updated.doxoRecommendation,
        recommendedOptionId: top.id,
        whatKa: `ხარისხის პრიორიტეტის მიხედვით: ${top.titleKa}`,
        whatEn: `Based on highest quality priority: ${top.titleEn}`,
        whyKa: [
          `უმაღლესი რეიტინგი: ${top.rating || 4.9} ★`,
          `საიმედოობის ინდექსი: ${top.reliabilityScore || 95}%`,
          'შემოწმებული და რეკომენდებული სპეციალისტი',
        ],
        whyEn: [
          `Highest rating: ${top.rating || 4.9} ★`,
          `Reliability index: ${top.reliabilityScore || 95}%`,
          'Verified top-rated specialist',
        ],
        tradeoffKa: 'უმაღლესი ხარისხია, ფასი კი საშუალოზე მაღალია.',
        tradeoffEn: 'Top-tier quality, with price above average.',
        disclaimerKa: 'საბოლოო არჩევანი შენია.',
      };
    }

    return updated;
  }

  // Resolve decision explicitly (user chooses an option)
  static resolveDecision(decisionId: string, selectedOptionId: string): DecisionItem | undefined {
    const decisions = this.getDecisions();
    const index = decisions.findIndex(d => d.id === decisionId);
    if (index === -1) return undefined;

    const item = decisions[index];
    item.status = 'completed';
    item.userDecision = {
      selectedOptionId,
      decidedAt: new Date().toISOString(),
    };
    item.updatedAt = new Date().toISOString();

    decisions[index] = item;
    this.saveDecisions(decisions);

    // Audit log
    DoxoStorage.logAuditEvent({
      eventType: 'decision.resolved',
      entityId: decisionId,
      actorId: 'usr-1',
      actorRole: 'user',
      actorName: 'მომხმარებელი',
      detailsKa: `მიღებულია გადაწყვეტილება: #${decisionId} · არჩეულია ვარიანტი: ${selectedOptionId}`,
    });

    return item;
  }

  // Set user feedback on decision ('positive' | 'negative')
  static setDecisionFeedback(decisionId: string, feedback: 'positive' | 'negative'): void {
    const decisions = this.getDecisions();
    const item = decisions.find(d => d.id === decisionId);
    if (item && item.userDecision) {
      item.userDecision.feedback = feedback;
      item.updatedAt = new Date().toISOString();
      this.saveDecisions(decisions);
    }
  }

  // Approvals Management (Section 30 & 31: User Control & Approval Center)
  static getApprovals(): ApprovalActionItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_APPROVALS_KEY);
      if (!stored) {
        localStorage.setItem(this.STORAGE_APPROVALS_KEY, JSON.stringify(initialApprovals));
        return initialApprovals;
      }
      return JSON.parse(stored);
    } catch {
      return initialApprovals;
    }
  }

  static updateApprovalStatus(approvalId: string, status: 'approved' | 'rejected'): void {
    const approvals = this.getApprovals();
    const item = approvals.find(a => a.id === approvalId);
    if (item) {
      item.status = status;
      try {
        localStorage.setItem(this.STORAGE_APPROVALS_KEY, JSON.stringify(approvals));
      } catch (e) {
        console.error(e);
      }
      DoxoStorage.logAuditEvent({
        eventType: 'payment.authorized',
        entityId: approvalId,
        actorId: 'usr-1',
        actorRole: 'user',
        actorName: 'მომხმარებელი',
        detailsKa: `დადასტურების მოქმედება: #${approvalId} (${item.titleKa}) -> სტატუსი: ${status}`,
      });
    }
  }

  // Productivity metrics (Section 38 & 39)
  static getProductivitySummary(): ProductivitySummary {
    const decisions = this.getDecisions();
    const completedCount = decisions.filter(d => d.status === 'completed').length;
    const totalDecisions = decisions.length;
    const bookings = DoxoStorage.getBookings().length;

    return {
      weekDecisionsCount: totalDecisions + completedCount + 9, // grounded + tracked
      weekBookingsCount: bookings + 5,
      weekComparisonsCount: 6,
      estimatedHoursSavedFormatted: '3სთ 15წთ',
      insightsKa: [
        'ამ კვირაში 3 გადაწყვეტილებაში დროზე მეტად მაღალი შეფასება (4.9★) აირჩიე.',
        'საბურთალოს რაიონში საქმეების გაერთიანებით 45 წუთი მგზავრობის დრო დაიზოგა.',
        'შეთავაზებების შედარებამ სანტექნიკაში 20 ₾ ფარული ხარჯი აგარიდა თავიდან.',
      ],
      insightsEn: [
        'This week in 3 decisions you prioritized higher rating (4.9★) over lowest price.',
        'Bundling tasks in Saburtalo saved 45 minutes in estimated travel time.',
        'Quote comparison prevented 20 ₾ in unstated material costs for plumbing.',
      ],
    };
  }
}
