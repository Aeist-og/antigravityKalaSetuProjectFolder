export type OpportunityStatus = 'open' | 'closed' | 'fulfilled';
export type ResponseStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected';

export interface Opportunity {
  id: string;
  businessId: string;
  businessName: string;
  title: string;
  craftType: string;
  description: string;
  quantity: number;
  budget?: number;
  deadline?: string;
  location?: string;
  status: OpportunityStatus;
  createdAt: string;
  updatedAt: string;
  responsesCount?: number;
}

export interface CreateOpportunityInput {
  businessId: string;
  businessName: string;
  title: string;
  craftType: string;
  description: string;
  quantity: number;
  budget?: number;
  deadline?: string;
  location?: string;
}

export interface OpportunityResponse {
  id: string;
  opportunityId: string;
  artisanId: string;
  artisanName?: string;
  craftType?: string;
  status: ResponseStatus;
  message: string;
  quoteAmount?: number;
  quotedPrice?: number;
  linkedProductId?: string;
  attachedProductId?: string;
  linkedProductTitle?: string;
  attachedProductTitle?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOpportunityResponseInput {
  opportunityId: string;
  artisanId: string;
  message: string;
  quoteAmount?: number;
  quotedPrice?: number;
  linkedProductId?: string;
  attachedProductId?: string;
  linkedProductTitle?: string;
  attachedProductTitle?: string;
  artisanName?: string;
  craftType?: string;
}
