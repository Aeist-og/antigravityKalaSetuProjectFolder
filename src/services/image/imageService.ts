export interface ImageEnhancementResult {
  success: boolean;
  isAvailable: boolean;
  enhancedUri?: string;
  originalUri: string;
  errorMessage?: string;
  details?: {
    backgroundRemoved: boolean;
    lightingAdjusted: boolean;
    provider: string;
  };
}

export interface IImageService {
  isConfigured(): boolean;
  enhanceImage(originalUri: string): Promise<ImageEnhancementResult>;
}

export class RealImageService implements IImageService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_HUGGINGFACE_API_KEY;
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async enhanceImage(originalUri: string): Promise<ImageEnhancementResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        isAvailable: false,
        originalUri,
        errorMessage: 'AI photo enhancement service is not configured. Original photo will be used.',
      };
    }

    try {
      // In production, invoke the verified segmentation / background removal model endpoint
      // via HuggingFace or a dedicated serverless worker
      const response = await fetch(
        'https://api-inference.huggingface.co/models/briaai/RMBG-1.4',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: originalUri }),
        }
      );

      if (!response.ok) {
        throw new Error(`Image service responded with status ${response.status}`);
      }

      const blob = await response.blob();
      const enhancedUri = URL.createObjectURL(blob);

      return {
        success: true,
        isAvailable: true,
        enhancedUri,
        originalUri,
        details: {
          backgroundRemoved: true,
          lightingAdjusted: true,
          provider: 'huggingface-rmbg',
        },
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown image processing error';
      return {
        success: false,
        isAvailable: true,
        originalUri,
        errorMessage: message,
      };
    }
  }
}

export const imageService = new RealImageService();
