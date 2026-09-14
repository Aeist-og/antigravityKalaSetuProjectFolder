export interface ProductPricing {
  id: string;
  productId: string;
  materialCost: number;
  labourCostPerDay: number;
  labourDays: number;
  totalLabourCost: number;
  packagingCost: number;
  additionalCost: number;
  marginPercent: number;
  totalCalculatedCost: number;
  suggestedRetailPrice: number;
  suggestedBulkPrice: number;
  finalListingPrice: number;
  currency: string;
  calculationMetadata: {
    calculatedAt: string;
    ruleVersion: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PricingCalculationInput {
  materialCost: number;
  labourCostPerDay: number;
  labourDays: number;
  packagingCost?: number;
  additionalCost?: number;
  marginPercent?: number;
  finalPriceOverride?: number;
}

export interface PricingCalculationResult {
  materialCost: number;
  labourCostPerDay: number;
  labourDays: number;
  totalLabourCost: number;
  packagingCost: number;
  additionalCost: number;
  marginPercent: number;
  totalCalculatedCost: number;
  suggestedRetailPrice: number;
  suggestedBulkPrice: number;
  finalListingPrice: number;
  currency: string;
}
