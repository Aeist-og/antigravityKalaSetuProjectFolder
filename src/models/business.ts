export interface BusinessProfile {
  id: string;
  businessId: string; // Foreign key referencing profiles.id
  businessName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  businessType?: string; // 'Retailer' | 'Wholesaler' | 'Corporate Gifter' | 'Interior Designer' | 'Exporter' | 'Other'
  industry?: string;
  state?: string;
  district?: string;
  address?: string;
  gstin?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export type BusinessProfileUpdate = Partial<
  Omit<BusinessProfile, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>
>;
