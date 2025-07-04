import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getSupportedLanguages, getLanguageByCode } from '@/data/languages';
import { apiRequest } from '@/lib/queryClient';

interface TranslationResult {
  success: boolean;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence?: number;
}

export const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [translationHistory, setTranslationHistory] = useState<TranslationResult[]>([]);
  const { toast } = useToast();

  const supportedLanguages = getSupportedLanguages();

  const translate = useCallback(async (text: string, target?: string, source?: string): Promise<TranslationResult | null> => {
    if (!text.trim()) {
      toast({
        title: "No Text",
        description: "Please provide text to translate",
        variant: "destructive",
      });
      return null;
    }

    const targetLang = target || targetLanguage;
    const sourceLang = source || sourceLanguage;

    if (sourceLang === targetLang) {
      toast({
        title: "Same Language",
        description: "Source and target languages are the same",
        variant: "destructive",
      });
      return null;
    }

    setIsTranslating(true);

    try {
      const response = await apiRequest('POST', '/api/ai/translate', {
        text,
        targetLanguage: targetLang,
        sourceLanguage: sourceLang,
      });

      const result = await response.json() as TranslationResult;
      
      if (result.success) {
        const translationResult: TranslationResult = {
          ...result,
          targetLanguage: targetLang,
          sourceLanguage: sourceLang,
        };
        
        setTranslationHistory(prev => [...prev, translationResult]);
        
        return translationResult;
      } else {
        throw new Error('Translation failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Translation failed';
      
      toast({
        title: "Translation Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsTranslating(false);
    }
  }, [sourceLanguage, targetLanguage, toast]);

  const translateEmergencyPhrase = useCallback(async (phraseKey: string, targetLang: string): Promise<string | null> => {
    // Import emergency phrases dynamically to avoid circular dependencies
    const { getEmergencyPhrase } = await import('@/data/languages');
    
    const phrase = getEmergencyPhrase('en', phraseKey);
    if (!phrase) {
      return null;
    }

    const result = await translate(phrase, targetLang, 'en');
    return result?.translatedText || null;
  }, [translate]);

  const batchTranslate = useCallback(async (texts: string[], target?: string, source?: string): Promise<TranslationResult[]> => {
    setIsTranslating(true);
    const results: TranslationResult[] = [];

    try {
      for (const text of texts) {
        const result = await translate(text, target, source);
        if (result) {
          results.push(result);
        }
      }
    } catch (error) {
      toast({
        title: "Batch Translation Error",
        description: "Some translations may have failed",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }

    return results;
  }, [translate, toast]);

  const detectLanguage = useCallback(async (text: string): Promise<string | null> => {
    if (!text.trim()) {
      return null;
    }

    try {
      // Simple language detection based on character patterns
      // This is a basic implementation - in production, you'd use a proper language detection service
      const arabicPattern = /[\u0600-\u06FF]/;
      const hindiPattern = /[\u0900-\u097F]/;
      const chinesePattern = /[\u4E00-\u9FFF]/;
      const russianPattern = /[\u0400-\u04FF]/;

      if (arabicPattern.test(text)) {
        return 'ar';
      } else if (hindiPattern.test(text)) {
        return 'hi';
      } else if (chinesePattern.test(text)) {
        return 'zh';
      } else if (russianPattern.test(text)) {
        return 'ru';
      }

      // Default to English if no specific pattern detected
      return 'en';
    } catch (error) {
      console.error('Language detection error:', error);
      return null;
    }
  }, []);

  const clearHistory = useCallback(() => {
    setTranslationHistory([]);
  }, []);

  const getLanguageName = useCallback((code: string): string => {
    const language = getLanguageByCode(code);
    return language?.name || code.toUpperCase();
  }, []);

  const swapLanguages = useCallback(() => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
  }, [sourceLanguage, targetLanguage]);

  return {
    isTranslating,
    sourceLanguage,
    targetLanguage,
    translationHistory,
    supportedLanguages,
    translate,
    translateEmergencyPhrase,
    batchTranslate,
    detectLanguage,
    clearHistory,
    getLanguageName,
    swapLanguages,
    setSourceLanguage,
    setTargetLanguage,
  };
};
