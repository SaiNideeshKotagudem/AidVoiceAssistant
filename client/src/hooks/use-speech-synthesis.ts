import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseSpeechSynthesisOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: string;
}

export const useSpeechSynthesis = (options: UseSpeechSynthesisOptions = {}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  const {
    language = 'en-US',
    rate = 1,
    pitch = 1,
    volume = 1,
    voice
  } = options;

  useEffect(() => {
    if (!window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Select default voice based on language or voice name
      if (voice) {
        const namedVoice = availableVoices.find(v => v.name === voice);
        if (namedVoice) {
          setSelectedVoice(namedVoice);
          return;
        }
      }

      const langVoice = availableVoices.find(v => v.lang === language);
      if (langVoice) {
        setSelectedVoice(langVoice);
      } else if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0]);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language, voice]);

  const speak = useCallback((text: string) => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Speech synthesis is not supported in this browser",
        variant: "destructive",
      });
      return;
    }

    if (!text.trim()) {
      toast({
        title: "No Text",
        description: "Please provide text to speak",
        variant: "destructive",
      });
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      setIsSpeaking(false);
      setIsPaused(false);
      
      let errorMessage = 'Speech synthesis error';
      switch (event.error) {
        case 'network':
          errorMessage = 'Network error. Speech synthesis may not work offline.';
          break;
        case 'synthesis-failed':
          errorMessage = 'Speech synthesis failed. Please try again.';
          break;
        case 'synthesis-unavailable':
          errorMessage = 'Speech synthesis is not available.';
          break;
        default:
          errorMessage = `Speech synthesis error: ${event.error}`;
      }
      
      toast({
        title: "Speech Synthesis Error",
        description: errorMessage,
        variant: "destructive",
      });
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, language, rate, pitch, volume, selectedVoice, toast]);

  const pause = useCallback(() => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
    }
  }, [isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
    }
  }, [isSpeaking, isPaused]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const toggle = useCallback(() => {
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    }
  }, [isSpeaking, isPaused, pause, resume]);

  return {
    isSupported,
    isSpeaking,
    isPaused,
    voices,
    selectedVoice,
    speak,
    pause,
    resume,
    stop,
    toggle,
    setSelectedVoice,
  };
};
