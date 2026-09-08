import { Provider } from '../../types/provider';
import { ServiceCategory, UrgencyLevel } from '../../types/task';
import { UserPreferences } from '../../types/user';

export interface MatchResult {
  score: number;
  reasons: string[]; // Human-readable transparent reasons
  rationaleKa: string;
  rationaleEn: string;
}

export function calculateDoxoMatch(
  provider: Provider,
  category: ServiceCategory,
  userDistrict: string,
  urgency: UrgencyLevel,
  userPrefs?: UserPreferences
): MatchResult {
  let score = 70; // baseline
  const reasons: string[] = [];

  // 1. Category relevance
  if (provider.categories.includes(category)) {
    score += 10;
    reasons.push('შესაბამისი სერვისის კატეგორია');
  }

  // 2. Rating bonus
  if (provider.rating >= 4.9) {
    score += 8;
    reasons.push(`მაღალი შეფასება (${provider.rating} ★)`);
  } else if (provider.rating >= 4.8) {
    score += 5;
    reasons.push(`სტაბილური შეფასება (${provider.rating} ★)`);
  }

  // 3. District / Location affinity
  const servesDistrict = provider.serviceAreas.some(area => 
    userDistrict.toLowerCase().includes(area.toLowerCase()) || 
    area.toLowerCase().includes(userDistrict.toLowerCase())
  );
  if (servesDistrict) {
    score += 7;
    reasons.push(`სასურველ უბანში მუშაობს (${userDistrict})`);
  }

  // 4. Availability & Urgency
  if (provider.availability === 'available') {
    score += 6;
    reasons.push('სასურველ დროს თავისუფალია');
  }

  // 5. Completion rate & reliability
  if (provider.completionRate >= 98) {
    score += 4;
    reasons.push(`მაღალი შესრულების მაჩვენებელი (${provider.completionRate}%)`);
  }

  // 6. Response speed
  if (provider.responseTimeMinutes <= 5) {
    score += 3;
    reasons.push(`სწრაფი პასუხი (~${provider.responseTimeMinutes} წთ)`);
  }

  // 7. Similar tasks count bonus
  if (provider.completedSimilarTasksCount >= 30) {
    score += 3;
    reasons.push(`${provider.completedSimilarTasksCount} მსგავსი სამუშაო შესრულებული`);
  }

  // 8. User preference / Favorite status
  if (userPrefs?.favoriteProviderIds?.includes(provider.id) || provider.isFavorite) {
    score += 5;
    reasons.push('შენი რჩეული პროვაიდერი');
  }

  // Cap score between 75 and 99 (never hardcoded 100 to maintain honesty)
  const finalScore = Math.min(99, Math.max(76, score));

  // Generate personalized rationale
  let rationaleKa = `გირჩევ იმიტომ, რომ აქვს ${provider.rating} რეიტინგი, შესრულებული აქვს ${provider.completedSimilarTasksCount} მსგავსი სამუშაო და მოვა ${provider.estimatedArrivalMinutes} წუთში.`;
  let rationaleEn = `Recommended because of a ${provider.rating} rating, ${provider.completedSimilarTasksCount} similar jobs, and ${provider.estimatedArrivalMinutes} min arrival.`;

  if (provider.completedSimilarTasksCount >= 35) {
    rationaleKa = `გირჩევ იმიტომ, რომ მსგავსი პრობლემები ${provider.completedSimilarTasksCount}-ჯერ აქვს წარმატებით შესრულებული და დღესვე შეუძლია მოსვლა.`;
    rationaleEn = `Recommended because they have successfully completed similar issues ${provider.completedSimilarTasksCount} times and can arrive today.`;
  }

  return {
    score: finalScore,
    reasons,
    rationaleKa,
    rationaleEn,
  };
}

