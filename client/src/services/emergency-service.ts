import { EmergencyAction, EmergencySession, SceneAnalysis, EmotionDetection, TranslationResult } from '@/types/emergency';
import { aiService } from './ai-service';
import { translationService } from './translation-service';
import { offlineService } from './offline-service';
import { apiRequest } from '@/lib/queryClient';

export class EmergencyService {
  private static instance: EmergencyService;
  private currentSession: EmergencySession | null = null;
  private actionHistory: EmergencyAction[] = [];
  private isInitialized = false;

  private constructor() {}

  static getInstance(): EmergencyService {
    if (!EmergencyService.instance) {
      EmergencyService.instance = new EmergencyService();
    }
    return EmergencyService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Initializing Emergency Service...');
      
      // Initialize AI service
      await aiService.initialize();
      
      // Initialize translation service
      await translationService.initialize();
      
      // Initialize offline service
      await offlineService.initialize();
      
      // Start a new session
      await this.startSession();
      
      this.isInitialized = true;
      console.log('Emergency Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Emergency Service:', error);
      throw error;
    }
  }

  async startSession(): Promise<EmergencySession> {
    try {
      const sessionData = {
        startTime: new Date(),
        deviceInfo: navigator.userAgent,
        location: await this.getCurrentLocation(),
      };

      // Create session on server if online
      if (navigator.onLine) {
        try {
          const response = await apiRequest('POST', '/api/user-sessions', {
            sessionData,
          });
          this.currentSession = await response.json();
        } catch (error) {
          console.warn('Failed to create server session, continuing offline');
        }
      }

      // Create local session if server failed or offline
      if (!this.currentSession) {
        this.currentSession = {
          id: Date.now(),
          sessionData,
          startTime: new Date(),
          actions: [],
        };
      }

      return this.currentSession;
    } catch (error) {
      console.error('Failed to start emergency session:', error);
      throw error;
    }
  }

  async endSession(): Promise<void> {
    if (!this.currentSession) return;

    try {
      const endTime = new Date();
      
      // Update session on server if online
      if (navigator.onLine && this.currentSession.id) {
        try {
          await apiRequest('PUT', `/api/user-sessions/${this.currentSession.id}`, {
            endTime,
            actions: this.actionHistory,
          });
        } catch (error) {
          console.warn('Failed to update server session');
        }
      }

      // Store session locally for offline access
      await offlineService.storeSession({
        ...this.currentSession,
        endTime,
        actions: this.actionHistory,
      });

      this.currentSession = null;
      this.actionHistory = [];
    } catch (error) {
      console.error('Failed to end emergency session:', error);
    }
  }

  async logEmergencyAction(action: Partial<EmergencyAction>): Promise<void> {
    const fullAction: EmergencyAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      success: true,
      ...action,
      type: action.type || 'unknown',
      data: action.data || {},
    };

    this.actionHistory.push(fullAction);

    // Update current session
    if (this.currentSession) {
      this.currentSession.actions = this.actionHistory;
    }

    // Store action offline
    await offlineService.storeAction(fullAction);

    console.log('Emergency action logged:', fullAction);
  }

  async processVoiceCommand(transcript: string): Promise<{
    intent: string;
    entities: Record<string, string>;
    confidence: number;
    emergencyType?: string;
  }> {
    try {
      await this.logEmergencyAction({
        type: 'voice',
        data: { transcript },
      });

      // Process command with AI service
      const aiResult = await aiService.processVoiceCommand(transcript);
      
      // Detect emergency type
      const emergencyType = await aiService.detectEmergencyFromText(transcript);
      
      return {
        ...aiResult,
        emergencyType,
      };
    } catch (error) {
      console.error('Failed to process voice command:', error);
      
      await this.logEmergencyAction({
        type: 'voice',
        data: { transcript },
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  async analyzeEmergencyScene(imageData: string | Blob): Promise<SceneAnalysis> {
    try {
      await this.logEmergencyAction({
        type: 'image',
        data: { imageSize: imageData instanceof Blob ? imageData.size : imageData.length },
      });

      const analysis = await aiService.analyzeScene(imageData);
      
      await this.logEmergencyAction({
        type: 'image',
        data: {
          analysis: analysis.analysis,
          emergencyType: analysis.emergencyType,
          confidence: analysis.confidence,
        },
      });

      return analysis;
    } catch (error) {
      console.error('Failed to analyze emergency scene:', error);
      
      await this.logEmergencyAction({
        type: 'image',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  async translateEmergencyText(text: string, targetLanguage: string): Promise<TranslationResult> {
    try {
      await this.logEmergencyAction({
        type: 'text',
        data: { text, targetLanguage },
      });

      const result = await translationService.translateText(text, targetLanguage);
      
      await this.logEmergencyAction({
        type: 'text',
        data: {
          originalText: text,
          translatedText: result.translatedText,
          targetLanguage,
          success: result.success,
        },
      });

      return result;
    } catch (error) {
      console.error('Failed to translate emergency text:', error);
      
      await this.logEmergencyAction({
        type: 'text',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  async detectEmotionalState(audioData: ArrayBuffer): Promise<EmotionDetection> {
    try {
      await this.logEmergencyAction({
        type: 'voice',
        data: { audioDataSize: audioData.byteLength },
      });

      const emotionResult = await aiService.detectEmotion(audioData);
      
      await this.logEmergencyAction({
        type: 'voice',
        data: {
          emotion: emotionResult.emotion,
          stressLevel: emotionResult.stressLevel,
          confidence: emotionResult.confidence,
        },
      });

      return emotionResult;
    } catch (error) {
      console.error('Failed to detect emotional state:', error);
      
      await this.logEmergencyAction({
        type: 'voice',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  async callEmergencyServices(serviceType: string = 'general'): Promise<void> {
    try {
      await this.logEmergencyAction({
        type: 'call',
        data: { serviceType },
      });

      // Attempt to make emergency call
      if ('navigator' in window) {
        // Try to get emergency number based on location/country
        const emergencyNumber = this.getEmergencyNumber();
        
        try {
          window.location.href = `tel:${emergencyNumber}`;
        } catch (error) {
          console.warn('Tel link not supported:', error);
        }
      }

      await this.logEmergencyAction({
        type: 'call',
        data: { serviceType, attempted: true },
      });
    } catch (error) {
      console.error('Failed to call emergency services:', error);
      
      await this.logEmergencyAction({
        type: 'call',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async shareLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const position = await this.getCurrentLocation();
      
      if (position) {
        await this.logEmergencyAction({
          type: 'location',
          data: {
            latitude: position.latitude,
            longitude: position.longitude,
            accuracy: position.accuracy,
          },
        });
      }

      return position;
    } catch (error) {
      console.error('Failed to share location:', error);
      
      await this.logEmergencyAction({
        type: 'location',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return null;
    }
  }

  async getEmergencyInstructions(emergencyType: string): Promise<string[]> {
    try {
      const instructions = await aiService.generateEmergencyInstructions(emergencyType);
      
      await this.logEmergencyAction({
        type: 'protocol',
        data: { emergencyType, instructionCount: instructions.length },
      });

      return instructions;
    } catch (error) {
      console.error('Failed to get emergency instructions:', error);
      
      await this.logEmergencyAction({
        type: 'protocol',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return [];
    }
  }

  private async getCurrentLocation(): Promise<{ latitude: number; longitude: number; accuracy: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  private getEmergencyNumber(): string {
    // Default emergency numbers by region
    // In a real app, this would be based on actual location detection
    const region = navigator.language.split('-')[1] || 'US';
    
    const emergencyNumbers: Record<string, string> = {
      US: '911',
      CA: '911',
      GB: '999',
      AU: '000',
      NZ: '111',
      IN: '112',
      JP: '119',
      CN: '120',
      KR: '119',
      // EU countries
      DE: '112',
      FR: '112',
      IT: '112',
      ES: '112',
      NL: '112',
      // Default
      DEFAULT: '112',
    };

    return emergencyNumbers[region] || emergencyNumbers.DEFAULT;
  }

  getCurrentSession(): EmergencySession | null {
    return this.currentSession;
  }

  getActionHistory(): EmergencyAction[] {
    return [...this.actionHistory];
  }

  isSessionActive(): boolean {
    return this.currentSession !== null;
  }
}

export const emergencyService = EmergencyService.getInstance();
