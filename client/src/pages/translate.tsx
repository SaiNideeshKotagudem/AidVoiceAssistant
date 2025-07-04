import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import AppHeader from '@/components/app-header';
import BottomNavigation from '@/components/bottom-navigation';
import { useTranslation } from '@/hooks/use-translation';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { getSupportedLanguages, getEmergencyPhrase, emergencyPhrases } from '@/data/languages';
import { 
  Globe, 
  ArrowRightLeft, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Copy, 
  Trash2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Translate() {
  const [location] = useLocation();
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const { toast } = useToast();

  const {
    isTranslating,
    sourceLanguage,
    targetLanguage,
    translationHistory,
    supportedLanguages,
    translate,
    translateEmergencyPhrase,
    swapLanguages,
    setSourceLanguage,
    setTargetLanguage,
    clearHistory,
    getLanguageName,
  } = useTranslation();

  const { accessibilitySettings, announceToScreenReader } = useAccessibility();
  const { speak, isSpeaking } = useSpeechSynthesis();
  const { 
    isListening: speechIsListening, 
    transcript, 
    start: startListening, 
    stop: stopListening,
    reset: resetSpeech
  } = useSpeechRecognition({
    language: `${sourceLanguage}-${sourceLanguage.toUpperCase()}`,
    continuous: false,
    interimResults: false,
  });

  // Parse URL params for initial text and language
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1]);
    const text = urlParams.get('text');
    const lang = urlParams.get('lang');
    
    if (text) {
      setInputText(decodeURIComponent(text));
    }
    if (lang) {
      setTargetLanguage(lang);
    }
  }, [location, setTargetLanguage]);

  // Update input text when speech recognition provides transcript
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  // Announce page load
  useEffect(() => {
    announceToScreenReader('Translation interface loaded', 'polite');
  }, [announceToScreenReader]);

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "No Text",
        description: "Please enter text to translate",
        variant: "destructive",
      });
      return;
    }

    const result = await translate(inputText, targetLanguage, sourceLanguage);
    
    if (result) {
      announceToScreenReader(
        `Translation complete: ${result.translatedText}`,
        'polite'
      );
    }
  };

  const handleVoiceInput = () => {
    if (speechIsListening) {
      stopListening();
      setIsListening(false);
    } else {
      resetSpeech();
      startListening();
      setIsListening(true);
    }
  };

  const handleSpeakTranslation = (text: string, language: string) => {
    speak(text);
  };

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Text Copied",
        description: "Translation copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy text to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleEmergencyPhrase = async (phraseKey: string) => {
    const translatedPhrase = await translateEmergencyPhrase(phraseKey, targetLanguage);
    if (translatedPhrase) {
      announceToScreenReader(
        `Emergency phrase: ${translatedPhrase}`,
        'assertive'
      );
    }
  };

  const emergencyPhraseKeys = Object.keys(emergencyPhrases.en);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-6 pb-20">
        <div className="flex items-center gap-4 mb-6">
          <Globe className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Real-Time Translation</h1>
            <p className="text-lg text-muted-foreground">Communicate in any emergency situation</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Translation Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Language Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Language Selection</CardTitle>
                <CardDescription>Choose source and target languages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">From</label>
                    <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source language" />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedLanguages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={swapLanguages}
                    className="mt-6"
                    aria-label="Swap languages"
                  >
                    <ArrowRightLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">To</label>
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target language" />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedLanguages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.flag} {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Translation Input */}
            <Card>
              <CardHeader>
                <CardTitle>Translation Input</CardTitle>
                <CardDescription>Enter text or use voice input</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Text to translate ({getLanguageName(sourceLanguage)})
                  </label>
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter text to translate..."
                    className="min-h-[100px]"
                    aria-label="Text to translate"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleVoiceInput}
                    className={`flex items-center gap-2 ${speechIsListening ? 'bg-red-50 border-red-200' : ''}`}
                    aria-label={speechIsListening ? 'Stop voice input' : 'Start voice input'}
                  >
                    {speechIsListening ? (
                      <MicOff className="h-4 w-4 text-red-500" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                    {speechIsListening ? 'Stop Listening' : 'Voice Input'}
                  </Button>
                  
                  <Button
                    onClick={handleTranslate}
                    disabled={!inputText.trim() || isTranslating}
                    className="flex items-center gap-2"
                  >
                    {isTranslating ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Globe className="h-4 w-4" />
                    )}
                    {isTranslating ? 'Translating...' : 'Translate'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Translation History */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Translation History</CardTitle>
                    <CardDescription>Recent translations</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearHistory}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {translationHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No translations yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {translationHistory.map((result, index) => (
                        <Card key={index} className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {getLanguageName(result.sourceLanguage)}
                              </Badge>
                              <ArrowRightLeft className="h-3 w-3" />
                              <Badge variant="outline">
                                {getLanguageName(result.targetLanguage)}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="font-medium">Original</p>
                                <p className="text-muted-foreground">{result.translatedText}</p>
                              </div>
                              <div>
                                <p className="font-medium">Translation</p>
                                <p className="text-muted-foreground">{result.translatedText}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSpeakTranslation(result.translatedText, result.targetLanguage)}
                                className="flex items-center gap-1"
                              >
                                <Volume2 className="h-3 w-3" />
                                Speak
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyText(result.translatedText)}
                                className="flex items-center gap-1"
                              >
                                <Copy className="h-3 w-3" />
                                Copy
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Phrases */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Emergency Phrases
                </CardTitle>
                <CardDescription>
                  Quick access to critical emergency phrases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {emergencyPhraseKeys.map((phraseKey) => (
                      <Button
                        key={phraseKey}
                        variant="outline"
                        className="w-full justify-start text-left h-auto p-3"
                        onClick={() => handleEmergencyPhrase(phraseKey)}
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-sm">
                            {getEmergencyPhrase('en', phraseKey)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getEmergencyPhrase(targetLanguage, phraseKey)}
                          </p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
