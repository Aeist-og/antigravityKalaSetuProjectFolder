export interface ArtisanProfile {
  id: string;
  artisanId: string; // Foreign key referencing profiles.id
  fullName?: string;
  craftType: string;
  state: string;
  district: string;
  experienceYears: string;
  productionCapacity: string;
  bio: string;
  verificationStatus: 'unverified' | 'pending' | 'verified';
  isAvailable?: boolean;
  vacationMode?: boolean;
  vacationMessage?: string;
  vacationReturnDate?: string;
  msmeNumber?: string;
  craftCluster?: string;
  gstin?: string;
  createdAt: string;
  updatedAt: string;
}

export type ArtisanProfileUpdate = Partial<
  Omit<ArtisanProfile, 'id' | 'artisanId' | 'createdAt' | 'updatedAt'>
>;
