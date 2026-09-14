import { PricingCalculationResult } from './pricing';

export type ProductStatus = 'draft' | 'published' | 'archived';

export interface ProductImage {
  id: string;
  productId: string;
  originalUrl: string;
  processedUrl: string | null;
  isPrimary: boolean;
  metadata?: {
    width?: number;
    height?: number;
    sizeBytes?: number;
    enhanced?: boolean;
  };
  createdAt: string;
}

export interface ProductInformation {
  titleEn: string;
  titleHi: string;
  craftType: string;
  category: string;
  material: string;
  primaryMaterial?: string;
  technique?: string;
  originState: string;
  originDistrict?: string;
  productionTimeDays: number;
  descriptionEn: string;
  descriptionHi: string;
  dimensions?: string;
  quantityAvailable: number;
  customizationAvailable: boolean;
  careInstructions?: string;
}

export interface Product {
  id: string;
  artisanId: string;
  status: ProductStatus;
  info: ProductInformation;
  images: ProductImage[];
  pricing?: PricingCalculationResult;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveProductDraft {
  id?: string;
  localImageUri: string | null;
  enhancedImageUri: string | null;
  isEnhanced: boolean;
  voiceTranscript: string | null;
  info: ProductInformation;
  pricing: PricingCalculationResult;
  status: ProductStatus;
  selectedTemplate?: string;
  currentStep: number;
  updatedAt: string;
}
