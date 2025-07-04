import { TranslationResult } from '@/types/emergency';
import { getSupportedLanguages, getEmergencyPhrase } from '@/data/languages';
import { apiRequest } from '@/lib/queryClient';

export class TranslationService {
  private static instance: TranslationService;
  private isInitialized = false;
  private translationCache = new Map<string, TranslationResult>();

  private constructor() {}

  static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // In a real implementation, this would load translation models
      console.log('Initializing translation service...');
      
      // Simulate model loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.isInitialized = true;
      console.log('Translation service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize translation service:', error);
      throw error;
    }
  }

  async translateText(text: string, targetLanguage: string, sourceLanguage: string = 'en'): Promise<TranslationResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Check cache first
    const cacheKey = `${sourceLanguage}-${targetLanguage}-${text}`;
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)!;
    }

    try {
      // Use server-side translation
      const response = await apiRequest('POST', '/api/ai/translate', {
        text,
        targetLanguage,
        sourceLanguage,
      });

      const result = await response.json() as TranslationResult;
      
      // Cache the result
      this.translationCache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Translation failed:', error);
      
      // Fallback to offline translation for emergency phrases
      const fallbackResult = await this.fallbackTranslation(text, targetLanguage, sourceLanguage);
      if (fallbackResult) {
        return fallbackResult;
      }
      
      return {
        success: false,
        translatedText: text,
        sourceLanguage,
        targetLanguage,
        confidence: 0,
      };
    }
  }

  private async fallbackTranslation(text: string, targetLanguage: string, sourceLanguage: string): Promise<TranslationResult | null> {
    // Simple fallback for emergency phrases
    const lowerText = text.toLowerCase();
    
    // Check if it's an emergency phrase
    const emergencyKeys = ['help', 'emergency', 'fire', 'medical', 'police', 'ambulance', 'earthquake', 'flood', 'tornado'];
    
    for (const key of emergencyKeys) {
      if (lowerText.includes(key)) {
        const translatedPhrase = getEmergencyPhrase(targetLanguage, key);
        if (translatedPhrase !== key) {
          return {
            success: true,
            translatedText: translatedPhrase,
            sourceLanguage,
            targetLanguage,
            confidence: 0.8,
          };
        }
      }
    }

    return null;
  }

  async translateEmergencyPhrase(phraseKey: string, targetLanguage: string): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const phrase = getEmergencyPhrase('en', phraseKey);
    if (phrase === phraseKey) {
      // No translation available
      return phrase;
    }

    const translatedPhrase = getEmergencyPhrase(targetLanguage, phraseKey);
    if (translatedPhrase !== phraseKey) {
      return translatedPhrase;
    }

    // Fallback to full translation
    const result = await this.translateText(phrase, targetLanguage);
    return result.translatedText;
  }

  async batchTranslate(texts: string[], targetLanguage: string, sourceLanguage: string = 'en'): Promise<TranslationResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const results: TranslationResult[] = [];
    
    for (const text of texts) {
      const result = await this.translateText(text, targetLanguage, sourceLanguage);
      results.push(result);
    }

    return results;
  }

  async detectLanguage(text: string): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Simple language detection based on character patterns
    const arabicPattern = /[\u0600-\u06FF]/;
    const hindiPattern = /[\u0900-\u097F]/;
    const chinesePattern = /[\u4E00-\u9FFF]/;
    const russianPattern = /[\u0400-\u04FF]/;
    const frenchPattern = /[àâäçéèêëïîôöùûüÿ]/i;
    const spanishPattern = /[ñáéíóúü]/i;

    if (arabicPattern.test(text)) {
      return 'ar';
    } else if (hindiPattern.test(text)) {
      return 'hi';
    } else if (chinesePattern.test(text)) {
      return 'zh';
    } else if (russianPattern.test(text)) {
      return 'ru';
    } else if (frenchPattern.test(text)) {
      return 'fr';
    } else if (spanishPattern.test(text)) {
      return 'es';
    }

    // Default to English
    return 'en';
  }

  getSupportedLanguages() {
    return getSupportedLanguages();
  }

  clearCache(): void {
    this.translationCache.clear();
  }

  getCacheSize(): number {
    return this.translationCache.size;
  }
}

export const translationService = TranslationService.getInstance();
