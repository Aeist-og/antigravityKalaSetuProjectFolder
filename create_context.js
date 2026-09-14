const fs = require('fs');
const path = require('path');

const content = `
import React, { createContext, useContext, useState } from 'react';
import { ProductDraft, ExtractedProductInfo, MissingInfoDetails, PricingBreakdown, CatalogueTemplateId } from '../types/product';
import { CRAFT_SAMPLES } from '../constants/craftData';

interface ProductDraftContextType {
  currentStep: number;
  draft: ProductDraft;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setOriginalImage: (uri: string) => void;
  setEnhancedImage: (uri: string) => void;
  setAudioAndExtracted: (transcript: string, info: ExtractedProductInfo) => void;
  updateExtractedInfo: (info: Partial<ExtractedProductInfo>) => void;
  updateMissingInfo: (info: Partial<MissingInfoDetails>) => void;
  updatePricing: (pricing: Partial<PricingBreakdown>) => void;
  setTemplate: (templateId: CatalogueTemplateId) => void;
  loadPreset: (presetId: string) => void;
  resetDraft: () => void;
  publishDraft: () => void;
}

const initialPricing: PricingBreakdown = {
  materialCost: 550,
  artisanDays: 4,
  dailyLaborRate: 350,
  packagingCost: 80,
  profitMarginPercent: 20,
  calculatedCost: 2030,
  suggestedPrice: 2436,
  minPriceRange: 2200,
  maxPriceRange: 2750,
  finalPrice: 2450,
};

function calculatePricing(p: Partial<PricingBreakdown>, existing: PricingBreakdown): PricingBreakdown {
  const materialCost = p.materialCost ?? existing.materialCost;
  const artisanDays = p.artisanDays ?? existing.artisanDays;
  const dailyLaborRate = p.dailyLaborRate ?? existing.dailyLaborRate;
  const packagingCost = p.packagingCost ?? existing.packagingCost;
  const profitMarginPercent = p.profitMarginPercent ?? existing.profitMarginPercent;

  const calculatedCost = materialCost + (artisanDays * dailyLaborRate) + packagingCost;
  const rawSuggested = calculatedCost * (1 + profitMarginPercent / 100);
  const suggestedPrice = Math.round(rawSuggested / 10) * 10;
  const minPriceRange = Math.round((suggestedPrice * 0.9) / 10) * 10;
  const maxPriceRange = Math.round((suggestedPrice * 1.15) / 10) * 10;
  const finalPrice = p.finalPrice ?? suggestedPrice;

  return {
    materialCost,
    artisanDays,
    dailyLaborRate,
    packagingCost,
    profitMarginPercent,
    calculatedCost,
    suggestedPrice,
    minPriceRange,
    maxPriceRange,
    finalPrice,
  };
}

const initialDraft: ProductDraft = {
  id: 'draft-1',
  originalImageUri: CRAFT_SAMPLES[0].originalImageUri,
  enhancedImageUri: CRAFT_SAMPLES[0].enhancedImageUri,
  isEnhanced: true,
  voiceTranscript: CRAFT_SAMPLES[0].audioTranscript,
  extractedInfo: {
    title: CRAFT_SAMPLES[0].title,
    craftType: CRAFT_SAMPLES[0].craftType,
    category: CRAFT_SAMPLES[0].category,
    material: CRAFT_SAMPLES[0].material,
    origin: CRAFT_SAMPLES[0].origin,
    productionTime: CRAFT_SAMPLES[0].productionTime,
    description: CRAFT_SAMPLES[0].description,
  },
  missingInfo: {
    dimensions: CRAFT_SAMPLES[0].dimensions,
    quantityAvailable: CRAFT_SAMPLES[0].quantityAvailable,
    customizationAvailable: CRAFT_SAMPLES[0].customizationAvailable,
    careInstructions: CRAFT_SAMPLES[0].careInstructions,
  },
  pricing: initialPricing,
  selectedTemplate: 'heritage',
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const ProductDraftContext = createContext<ProductDraftContextType | undefined>(undefined);

export const ProductDraftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [draft, setDraft] = useState<ProductDraft>(initialDraft);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 8));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const setOriginalImage = (uri: string) => {
    setDraft(prev => ({
      ...prev,
      originalImageUri: uri,
      enhancedImageUri: uri,
      isEnhanced: false,
    }));
  };

  const setEnhancedImage = (uri: string) => {
    setDraft(prev => ({
      ...prev,
      enhancedImageUri: uri,
      isEnhanced: true,
    }));
  };

  const setAudioAndExtracted = (transcript: string, info: ExtractedProductInfo) => {
    setDraft(prev => ({
      ...prev,
      voiceTranscript: transcript,
      extractedInfo: info,
    }));
  };

  const updateExtractedInfo = (info: Partial<ExtractedProductInfo>) => {
    setDraft(prev => ({
      ...prev,
      extractedInfo: { ...prev.extractedInfo, ...info },
    }));
  };

  const updateMissingInfo = (info: Partial<MissingInfoDetails>) => {
    setDraft(prev => ({
      ...prev,
      missingInfo: { ...prev.missingInfo, ...info },
    }));
  };

  const updatePricing = (p: Partial<PricingBreakdown>) => {
    setDraft(prev => ({
      ...prev,
      pricing: calculatePricing(p, prev.pricing),
    }));
  };

  const setTemplate = (templateId: CatalogueTemplateId) => {
    setDraft(prev => ({
      ...prev,
      selectedTemplate: templateId,
    }));
  };

  const loadPreset = (presetId: string) => {
    const sample = CRAFT_SAMPLES.find(s => s.id === presetId) || CRAFT_SAMPLES[0];
    const newPricing = calculatePricing(sample.pricing, initialPricing);
    setDraft({
      id: 'draft-' + Date.now(),
      originalImageUri: sample.originalImageUri,
      enhancedImageUri: sample.enhancedImageUri,
      isEnhanced: true,
      voiceTranscript: sample.audioTranscript,
      extractedInfo: {
        title: sample.title,
        craftType: sample.craftType,
        category: sample.category,
        material: sample.material,
        origin: sample.origin,
        productionTime: sample.productionTime,
        description: sample.description,
      },
      missingInfo: {
        dimensions: sample.dimensions,
        quantityAvailable: sample.quantityAvailable,
        customizationAvailable: sample.customizationAvailable,
        careInstructions: sample.careInstructions,
      },
      pricing: newPricing,
      selectedTemplate: 'heritage',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const resetDraft = () => {
    setDraft(initialDraft);
    setCurrentStep(1);
  };

  const publishDraft = () => {
    setDraft(prev => ({ ...prev, status: 'published' }));
  };

  return (
    <ProductDraftContext.Provider
      value={{
        currentStep,
        draft,
        setCurrentStep,
        nextStep,
        prevStep,
        setOriginalImage,
        setEnhancedImage,
        setAudioAndExtracted,
        updateExtractedInfo,
        updateMissingInfo,
        updatePricing,
        setTemplate,
        loadPreset,
        resetDraft,
        publishDraft,
      }}
    >
      {children}
    </ProductDraftContext.Provider>
  );
};

export const useProductDraft = () => {
  const context = useContext(ProductDraftContext);
  if (!context) throw new Error('useProductDraft must be used within ProductDraftProvider');
  return context;
};
`;

fs.writeFileSync(path.join(__dirname, 'src/context/ProductDraftContext.tsx'), content.trim() + '\n', 'utf8');
console.log('Created: src/context/ProductDraftContext.tsx');
