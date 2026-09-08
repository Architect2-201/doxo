export type InboxItemType = 'screenshot' | 'bill' | 'voice_note' | 'document' | 'photo' | 'note';

export type InboxActionType = 'create_reminder' | 'schedule_service' | 'pay_bill' | 'dismiss';

export interface InboxAIInterpretation {
  summary: string;
  summaryKa: string;
  suggestedAction: InboxActionType;
  deadline?: string;
  amount?: number;
  currency?: '₾';
  categoryHint?: string;
  actionPayload?: any;
}

export interface LifeInboxItem {
  id: string;
  title: string;
  titleKa: string;
  itemType: InboxItemType;
  rawContent: string;
  mediaUrl?: string;
  aiInterpretation: InboxAIInterpretation;
  status: 'pending' | 'action_taken' | 'converted_to_task' | 'archived';
  createdAt: string;
}
