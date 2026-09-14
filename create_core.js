const fs = require('fs');
const path = require('path');

function write(relPath, content) {
  const fullPath = path.join(__dirname, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Created:', relPath);
}

// 1. i18n/index.ts
write('src/i18n/index.ts', `
import { en } from './en';
import { hi } from './hi';

export type LanguageCode = 'en' | 'hi' | 'gu' | 'mr';

export const translations = {
  en,
  hi,
};

export function getTranslation(lang: LanguageCode) {
  if (lang === 'hi') return hi;
  return en;
}
`);

// 2. context/LanguageContext.tsx
write('src/context/LanguageContext.tsx', `
import React, { createContext, useContext, useState } from 'react';
import { LanguageCode, getTranslation } from '../i18n';
import { en } from '../i18n/en';

type TranslationType = typeof en;

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: TranslationType;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: en,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [t, setT] = useState<TranslationType>(en);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    setT(getTranslation(lang));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
`);

// 3. services/imageProcessingService.ts
write('src/services/imageProcessingService.ts', `
export interface ImageEnhanceProgressCallback {
  (stepName: string, progress: number): void;
}

export interface IImageProcessingService {
  enhanceImage(
    originalUri: string,
    onProgress?: ImageEnhanceProgressCallback
  ): Promise<{ enhancedUri: string; details: { backgroundRemoved: boolean; studioLighting: boolean } }>;
}

export class MockImageProcessingService implements IImageProcessingService {
  async enhanceImage(
    originalUri: string,
    onProgress?: ImageEnhanceProgressCallback
  ): Promise<{ enhancedUri: string; details: { backgroundRemoved: boolean; studioLighting: boolean } }> {
    const steps = [
      { name: 'Analyzing craft edges and textures...', p: 0.25 },
      { name: 'Removing background clutter & noise...', p: 0.55 },
      { name: 'Balancing studio warmth and soft shadows...', p: 0.85 },
      { name: 'Finalizing professional marketplace presentation...', p: 1.0 },
    ];

    for (const step of steps) {
      if (onProgress) onProgress(step.name, step.p);
      await new Promise(res => setTimeout(res, 350));
    }

    // High quality studio mockup image or enhanced filter
    let enhancedUri = originalUri;
    if (originalUri.includes('unsplash.com')) {
      enhancedUri = originalUri.replace('q=80', 'q=90&auto=format&fit=crop');
    }

    return {
      enhancedUri,
      details: {
        backgroundRemoved: true,
        studioLighting: true,
      },
    };
  }
}

export const imageProcessingService = new MockImageProcessingService();
`);

// 4. services/speechService.ts
write('src/services/speechService.ts', `
import { ExtractedProductInfo } from '../types/product';
import { CRAFT_SAMPLES } from '../constants/craftData';

export interface ISpeechService {
  transcribeAudio(sampleText?: string): Promise<string>;
  extractProductInfo(transcript: string): Promise<ExtractedProductInfo>;
}

export class MockSpeechService implements ISpeechService {
  async transcribeAudio(sampleText?: string): Promise<string> {
    await new Promise(res => setTimeout(res, 600));
    return sampleText || CRAFT_SAMPLES[0].audioTranscript;
  }

  async extractProductInfo(transcript: string): Promise<ExtractedProductInfo> {
    await new Promise(res => setTimeout(res, 500));
    const lower = transcript.toLowerCase();

    if (lower.includes('madhubani') || lower.includes('mithila') || lower.includes('painting') || lower.includes('paper')) {
      const sample = CRAFT_SAMPLES[1];
      return {
        title: sample.title,
        craftType: sample.craftType,
        category: sample.category,
        material: sample.material,
        origin: sample.origin,
        productionTime: sample.productionTime,
        description: sample.description,
      };
    } else if (lower.includes('pottery') || lower.includes('vase') || lower.includes('urn') || lower.includes('jaipur')) {
      const sample = CRAFT_SAMPLES[2];
      return {
        title: sample.title,
        craftType: sample.craftType,
        category: sample.category,
        material: sample.material,
        origin: sample.origin,
        productionTime: sample.productionTime,
        description: sample.description,
      };
    }

    const sample = CRAFT_SAMPLES[0];
    return {
      title: sample.title,
      craftType: sample.craftType,
      category: sample.category,
      material: sample.material,
      origin: sample.origin,
      productionTime: sample.productionTime,
      description: transcript.length > 20 ? transcript : sample.description,
    };
  }
}

export const speechService = new MockSpeechService();
`);

console.log('Core services & i18n created successfully!');
