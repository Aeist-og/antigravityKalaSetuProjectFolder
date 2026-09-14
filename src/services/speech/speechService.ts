let AudioModule: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AudioModule = require('expo-av')?.Audio || null;
} catch {
  // ExponentAV native module is deprecated and omitted in Expo Go SDK 57
}

export interface AudioRecordingLike {
  stopAndUnloadAsync: () => Promise<void>;
  getURI: () => string | null;
}

export interface SpeechTranscriptionResult {
  success: boolean;
  isAvailable: boolean;
  transcript: string;
  errorMessage?: string;
}

export interface ISpeechService {
  isConfigured(): boolean;
  requestPermissions(): Promise<boolean>;
  startRecording(): Promise<AudioRecordingLike | null>;
  stopRecording(recording: AudioRecordingLike): Promise<string | null>;
  transcribeAudio(audioUri: string): Promise<SpeechTranscriptionResult>;
}

export class RealSpeechService implements ISpeechService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.EXPO_PUBLIC_HUGGINGFACE_API_KEY;
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async requestPermissions(): Promise<boolean> {
    if (!AudioModule) return true;
    try {
      const { status } = await AudioModule.requestPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      console.warn('[SpeechService] Permission request failed:', err);
      return false;
    }
  }

  public async startRecording(): Promise<AudioRecordingLike | null> {
    if (!AudioModule) {
      console.log('[SpeechService] Audio module not available, using simulated recording');
      return {
        stopAndUnloadAsync: async () => {},
        getURI: () => 'simulated_audio_uri.m4a',
      };
    }
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission not granted');
      }

      await AudioModule.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await AudioModule.Recording.createAsync(
        AudioModule.RecordingOptionsPresets.HIGH_QUALITY
      );
      return recording;
    } catch (err) {
      console.warn('[SpeechService] Failed to start audio recording:', err);
      return null;
    }
  }

  public async stopRecording(recording: AudioRecordingLike): Promise<string | null> {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      return uri;
    } catch (err) {
      console.warn('[SpeechService] Failed to stop recording:', err);
      return null;
    }
  }

  public async transcribeAudio(audioUri: string): Promise<SpeechTranscriptionResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        isAvailable: false,
        transcript: '',
        errorMessage: 'Speech-to-text service is not configured. Please enter your product description in the text box.',
      };
    }

    try {
      // In production with API key: Call speech-to-text model endpoint (e.g., Whisper)
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'artisan_voice.m4a',
      } as unknown as Blob);

      const response = await fetch(
        'https://api-inference.huggingface.co/models/openai/whisper-large-v3',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Speech API returned HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        isAvailable: true,
        transcript: data.text || '',
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown transcription error';
      return {
        success: false,
        isAvailable: true,
        transcript: '',
        errorMessage: message,
      };
    }
  }
}

export const speechService = new RealSpeechService();
