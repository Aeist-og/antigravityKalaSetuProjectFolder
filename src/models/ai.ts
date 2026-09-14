export type AIProvider = 'google-gemini' | 'huggingface' | 'openai' | 'local';

export type AIOperation =
  | 'image_background_removal'
  | 'image_lighting_enhancement'
  | 'speech_to_text'
  | 'catalog_structuring'
  | 'bilingual_generation';

export type AIJobStatus = 'idle' | 'pending' | 'in_progress' | 'completed' | 'failed' | 'unavailable';

export interface AIGenerationRecord {
  id: string;
  artisanId: string;
  productId?: string;
  operation: AIOperation;
  provider: AIProvider;
  model: string;
  inputReference?: string;
  outputReference?: string;
  status: AIJobStatus;
  errorMessage?: string;
  createdAt: string;
}
