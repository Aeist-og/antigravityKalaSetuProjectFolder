import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActiveProductDraft, ProductInformation, ProductStatus } from '../models/product';
import { PricingCalculationInput, PricingCalculationResult } from '../models/pricing';
import { PricingEngine } from '../services/pricing/pricingEngine';
import { DatabaseService } from '../services/database/databaseService';
import { ActivityService } from '../services/activity/activityService';
import { useAuth } from './AuthContext';

const DRAFT_STORAGE_KEY = '@kalasetu_active_draft';

const emptyInfo: ProductInformation = {
  titleEn: '',
  titleHi: '',
  craftType: '',
  category: '',
  material: '',
  technique: '',
  originState: '',
  originDistrict: '',
  productionTimeDays: 1,
  descriptionEn: '',
  descriptionHi: '',
  dimensions: '',
  quantityAvailable: 1,
  customizationAvailable: false,
  careInstructions: '',
};

const initialPricing: PricingCalculationResult = PricingEngine.calculate({
  materialCost: 0,
  labourCostPerDay: 400,
  labourDays: 1,
  packagingCost: 50,
  marginPercent: 20,
});

const createCleanDraft = (): ActiveProductDraft => ({
  localImageUri: null,
  enhancedImageUri: null,
  isEnhanced: false,
  voiceTranscript: null,
  info: { ...emptyInfo },
  pricing: { ...initialPricing },
  currentStep: 1,
  status: 'draft',
  updatedAt: new Date().toISOString(),
});

interface ProductDraftContextType {
  currentStep: number;
  draft: ActiveProductDraft;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setOriginalImage: (uri: string) => void;
  setEnhancedImage: (uri: string) => void;
  setVoiceTranscript: (transcript: string) => void;
  updateProductInfo: (info: Partial<ProductInformation>) => void;
  updatePricing: (pricing: Partial<PricingCalculationInput>) => void;
  resetDraft: () => Promise<void>;
  saveDraftToDatabase: () => Promise<{ success: boolean; error?: string }>;
  publishProduct: () => Promise<{ success: boolean; error?: string }>;
}

const ProductDraftContext = createContext<ProductDraftContextType | undefined>(undefined);

export const ProductDraftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [draft, setDraft] = useState<ActiveProductDraft>(createCleanDraft());
  const [currentStep, setCurrentStepState] = useState<number>(1);

  // Restore saved active draft on app mount
  useEffect(() => {
    AsyncStorage.getItem(DRAFT_STORAGE_KEY)
      .then(stored => {
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setDraft({
              ...createCleanDraft(),
              ...parsed,
              info: { ...emptyInfo, ...(parsed?.info || {}) },
              pricing: { ...initialPricing, ...(parsed?.pricing || {}) },
            });
            if (parsed.currentStep) setCurrentStepState(parsed.currentStep);
          } catch (err) {
            console.warn('[ProductDraftContext] Failed to parse cached draft:', err);
          }
        }
      })
      .catch(e => console.warn('[ProductDraftContext] Error loading cached draft:', e));
  }, []);

  const updateAndPersist = (updater: (prev: ActiveProductDraft) => ActiveProductDraft) => {
    setDraft(prev => {
      const updated = updater(prev);
      AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updated)).catch(err =>
        console.warn('[ProductDraftContext] Failed to persist draft state:', err)
      );
      return updated;
    });
  };

  const setCurrentStep = (step: number) => {
    setCurrentStepState(step);
    updateAndPersist(prev => ({ ...prev, currentStep: step }));
  };

  const nextStep = () => {
    const next = Math.min(7, currentStep + 1);
    setCurrentStep(next);
  };

  const prevStep = () => {
    const prev = Math.max(1, currentStep - 1);
    setCurrentStep(prev);
  };

  const setOriginalImage = (uri: string) => {
    updateAndPersist(prev => ({
      ...prev,
      localImageUri: uri,
      enhancedImageUri: null,
      isEnhanced: false,
    }));
  };

  const setEnhancedImage = (uri: string) => {
    updateAndPersist(prev => ({
      ...prev,
      enhancedImageUri: uri,
      isEnhanced: true,
    }));
  };

  const setVoiceTranscript = (transcript: string) => {
    updateAndPersist(prev => ({
      ...prev,
      voiceTranscript: transcript,
    }));
  };

  const updateProductInfo = (infoUpdate: Partial<ProductInformation>) => {
    updateAndPersist(prev => ({
      ...prev,
      info: { ...prev.info, ...infoUpdate },
    }));
  };

  const updatePricing = (input: Partial<PricingCalculationInput>) => {
    updateAndPersist(prev => {
      const current = prev.pricing;
      const calculated = PricingEngine.calculate({
        materialCost: input.materialCost ?? current.materialCost,
        labourCostPerDay: input.labourCostPerDay ?? current.labourCostPerDay,
        labourDays: input.labourDays ?? current.labourDays,
        packagingCost: input.packagingCost ?? current.packagingCost,
        additionalCost: input.additionalCost ?? current.additionalCost,
        marginPercent: input.marginPercent ?? current.marginPercent,
        finalPriceOverride: input.finalPriceOverride ?? current.finalListingPrice,
      });
      return {
        ...prev,
        pricing: calculated,
      };
    });
  };

  const resetDraft = async () => {
    const clean = createCleanDraft();
    setDraft(clean);
    setCurrentStepState(1);
    await AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  const saveDraftToDatabase = async (): Promise<{ success: boolean; error?: string }> => {
    const artisanId = user?.id || 'artisan-local';

    const res = await DatabaseService.saveProduct({
      artisanId,
      status: 'draft',
      info: draft.info,
      pricing: draft.pricing,
      imageUrls: draft.localImageUri ? {
        originalUrl: draft.localImageUri,
        processedUrl: draft.isEnhanced ? draft.enhancedImageUri || undefined : undefined,
      } : undefined,
      productId: draft.id,
    });

    if (res.data) {
      updateAndPersist(prev => ({ ...prev, id: res.data?.id }));

      await ActivityService.log(
        artisanId,
        'DRAFT_SAVED',
        `Draft Saved: ${draft.info.titleEn || 'Handcrafted Craft'}`,
        `प्रारूप सहेजा गया: ${draft.info.titleHi || 'हस्तशिल्प'}`,
        `Step ${currentStep}/7 saved safely`,
        `चरण ${currentStep}/7 सुरक्षित सहेजा गया`,
        'info'
      );

      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to save draft' };
  };

  const publishProduct = async (): Promise<{ success: boolean; error?: string }> => {
    const artisanId = user?.id || 'artisan-local';

    const res = await DatabaseService.saveProduct({
      artisanId,
      status: 'published',
      info: draft.info,
      pricing: draft.pricing,
      imageUrls: draft.localImageUri ? {
        originalUrl: draft.localImageUri,
        processedUrl: draft.isEnhanced ? draft.enhancedImageUri || undefined : undefined,
      } : undefined,
      productId: draft.id,
    });

    if (res.data) {
      await ActivityService.log(
        artisanId,
        'PRODUCT_PUBLISHED',
        `Product Published: ${draft.info.titleEn || 'New Craft'}`,
        `उत्पाद प्रकाशित: ${draft.info.titleHi || 'नया शिल्प'}`,
        `Listed at ₹${draft.pricing.finalListingPrice}`,
        `सूचीबद्ध मूल्य: ₹${draft.pricing.finalListingPrice}`,
        'success'
      );

      await resetDraft();
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to publish product' };
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
        setVoiceTranscript,
        updateProductInfo,
        updatePricing,
        resetDraft,
        saveDraftToDatabase,
        publishProduct,
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
