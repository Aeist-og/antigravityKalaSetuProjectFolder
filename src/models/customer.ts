export interface CustomerProfile {
  id: string;
  customerId: string; // Foreign key referencing profiles.id
  fullName?: string;
  deliveryAddress?: string;
  pincode?: string;
  state?: string;
  district?: string;
  createdAt: string;
  updatedAt: string;
}

export type CustomerProfileUpdate = Partial<
  Omit<CustomerProfile, 'id' | 'customerId' | 'createdAt' | 'updatedAt'>
>;
