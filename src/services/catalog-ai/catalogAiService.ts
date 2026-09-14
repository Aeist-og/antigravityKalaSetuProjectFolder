import { ProductInformation } from '../../models/product';

export interface CatalogAiExtractionResult {
  success: boolean;
  isAvailable: boolean;
  info?: Partial<ProductInformation>;
  errorMessage?: string;
}

export interface ICatalogAiService {
  isConfigured(): boolean;
  extractCatalogInfo(artisanInput: string, languageContext?: string): Promise<CatalogAiExtractionResult>;
}

export class RealCatalogAiService implements ICatalogAiService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async extractCatalogInfo(
    artisanInput: string,
    _languageContext: string = 'hi'
  ): Promise<CatalogAiExtractionResult> {
    const text = artisanInput.trim();
    if (!text) {
      return {
        success: false,
        isAvailable: true,
        errorMessage: 'Input text cannot be empty.',
      };
    }

    if (!this.isConfigured()) {
      return {
        success: false,
        isAvailable: false,
        errorMessage: 'Catalog AI service is not configured. Please fill or edit the product details manually.',
      };
    }

    try {
      const prompt = `You are the AI Cataloguer for KalaSetu, a mobile application empowering Indian traditional artisans.
Analyze the following natural speech or text description from an artisan:
"""${text}"""

Extract structured product fields and generate professional bilingual marketplace listings.
RULES:
1. Do NOT fabricate facts. If a detail (like exact dimensions or days) is not mentioned or implied, leave it empty or 1.
2. English description must be marketplace-ready, warm, and authentic.
3. Hindi description must be natural Devanagari Hindi (NO Hinglish).

Return ONLY valid JSON matching this exact structure:
{
  "titleEn": "string",
  "titleHi": "string",
  "craftType": "string",
  "category": "string",
  "material": "string",
  "technique": "string",
  "originState": "string",
  "productionTimeDays": number,
  "descriptionEn": "string",
  "descriptionHi": "string"
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const data = await response.json();
      const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawJson) {
        throw new Error('No content returned from AI model');
      }

      const parsed = JSON.parse(rawJson) as Partial<ProductInformation>;
      return {
        success: true,
        isAvailable: true,
        info: {
          titleEn: parsed.titleEn || 'Handcrafted Artisan Product',
          titleHi: parsed.titleHi || 'हस्तनिर्मित शिल्प उत्पाद',
          craftType: parsed.craftType || 'Traditional Indian Craft',
          category: parsed.category || 'Handicrafts',
          material: parsed.material || 'Natural Materials',
          technique: parsed.technique || '',
          originState: parsed.originState || 'India',
          productionTimeDays: typeof parsed.productionTimeDays === 'number' ? parsed.productionTimeDays : 1,
          descriptionEn: parsed.descriptionEn || text,
          descriptionHi: parsed.descriptionHi || text,
        },
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown catalog extraction error';
      return {
        success: false,
        isAvailable: true,
        errorMessage: message,
      };
    }
  }
}

export const catalogAiService = new RealCatalogAiService();
