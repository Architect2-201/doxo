export interface ApplianceAsset {
  id: string;
  name: string;
  nameKa: string;
  category: 'ac' | 'boiler' | 'washing_machine' | 'refrigerator' | 'lighting' | 'plumbing_system';
  brandModel: string;
  room: string;
  roomKa: string;
  lastServicedDate: string; // ISO date string
  suggestedNextServiceDate: string;
  maintenanceCycleMonths: number;
  proactivePromptKa: string;
  proactivePromptEn: string;
  serviceNeeded: boolean;
}

export interface HomeProfile {
  id: string;
  title: string;
  titleKa: string;
  address: string;
  district: string;
  roomsCount: number;
  squareMeters: number;
  appliances: ApplianceAsset[];
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  relationshipKa: string;
  avatarUrl: string;
  phone?: string;
  assignedTasksCount: number;
}
