export type ActivityType =
  | 'PRODUCT_CREATED'
  | 'DRAFT_SAVED'
  | 'PRODUCT_PUBLISHED'
  | 'PRODUCT_ARCHIVED'
  | 'IMAGE_ENHANCED'
  | 'VOICE_TRANSCRIBED'
  | 'PROFILE_UPDATED'
  | 'STORY_POSTED'
  | 'BUSINESS_RFQ_SENT'
  | 'PROPOSAL_ACCEPTED'
  | 'PROPOSAL_REVIEWED'
  | 'ORDER_RECEIVED'
  | 'ORDER_PLACED'
  | 'EXHIBITION_QR_GENERATED';

export interface ActivityEvent {
  id: string;
  userId: string;
  type: ActivityType;
  titleEn: string;
  titleHi: string;
  detailsEn: string;
  detailsHi: string;
  timestamp: string;
  status: 'success' | 'info' | 'warning';
}

export interface CreateActivityInput {
  userId: string;
  type: ActivityType;
  titleEn: string;
  titleHi: string;
  detailsEn: string;
  detailsHi: string;
  status?: 'success' | 'info' | 'warning';
}
