import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { useEmergencyProtocols } from '@/hooks/use-emergency-protocols';
import { useAccessibility } from '@/hooks/use-accessibility';
import { aiService } from '@/services/ai-service';
import { Mic, MicOff, Volume2, VolumeX, Zap, AlertTriangle } from 'lucide-react';

interface VoiceInterfaceProps {
  onVoiceCommand: (command: string) => void;
  onEmergencyDetected: (type: string) => void;
}

export default function VoiceInterface({ onVoiceCommand, onEmergencyDetected }: VoiceInterfaceProps) {
  const [recognitionStatus, setRecognitionStatus] = useState('Say "Help" to start');
  const [voiceActivity, setVoiceActivity] = useState([0.2, 0.8, 0.4, 0.9, 0.3, 0.6, 0.7]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { accessibilitySettings, announceToScreenReader, triggerVibration } = useAccessibility();
  const { detectEmergencyType } = useEmergencyProtocols();
  const { speak, isSpeaking } = useSpeechSynthesis();
  
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    start,
    stop,
    reset,
    toggle,
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
  });

  // Animate voice activity visualization
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isListening) {
      interval = setInterval(() => {
        setVoiceActivity(prev => 
          prev.map(() => Math.random() * 0.8 + 0.2)
        );
      }, 150);
    } else {
      setVoiceActivity([0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2]);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening]);

  // Update status based on recognition state
  useEffect(() => {
    if (isListening) {
      setRecognitionStatus('Listening...');
    } else if (transcript) {
      setRecognitionStatus('Processing...');
    } else if (error) {
      setRecognitionStatus('Error occurred. Try again.');
    } else {
      setRecognitionStatus('Say "Help" to start');
    }
  }, [isListening, transcript, error]);

  // Process completed transcript
  useEffect(() => {
    if (transcript && !isListening) {
      processVoiceCommand(transcript);
    }
  }, [transcript, isListening]);

  const processVoiceCommand = useCallback(async (command: string) => {
    if (!command.trim()) return;
    
    setIsProcessing(true);
    
    try {
      // Detect emergency type from voice command
      const emergencyType = detectEmergencyType(command);
      
      // Trigger haptic feedback for emergency detection
      if (emergencyType !== 'general') {
        triggerVibration([200, 100, 200]);
      }
      
      // Announce recognition result
      announceToScreenReader(
        `Voice command recognized: ${command}`,
        'polite'
      );
      
      // Handle emergency protocols
      if (emergencyType !== 'general') {
        onEmergencyDetected(emergencyType);
        
        // Provide audio feedback
        speak(`Emergency ${emergencyType} detected. Activating protocol.`);
        
        setRecognitionStatus(`Emergency ${emergencyType} detected`);
      } else {
        // Handle other voice commands
        onVoiceCommand(command);
        setRecognitionStatus('Command processed');
      }
      
    } catch (error) {
      console.error('Error processing voice command:', error);
      setRecognitionStatus('Error processing command');
      
      announceToScreenReader(
        'Error processing voice command. Please try again.',
        'assertive'
      );
    } finally {
      setIsProcessing(false);
      
      // Reset after delay
      setTimeout(() => {
        reset();
        setRecognitionStatus('Say "Help" to start');
      }, 3000);
    }
  }, [detectEmergencyType, onEmergencyDetected, onVoiceCommand, announceToScreenReader, triggerVibration, speak, reset]);

  const handleVoiceToggle = () => {
    if (isListening) {
      stop();
      announceToScreenReader('Voice recognition stopped', 'polite');
    } else {
      reset();
      start();
      announceToScreenReader('Voice recognition started. Speak your emergency.', 'polite');
    }
  };

  if (!isSupported) {
    return (
      <Card className="mb-8 border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-center text-destructive flex items-center justify-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Voice Recognition Not Supported
          </CardTitle>
          <CardDescription className="text-center">
            Voice recognition is not available in this browser. Please use text input instead.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <section className="mb-8 slide-up">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-3">Emergency Assistant</h2>
        <p className="text-lg text-muted-foreground">Speak your emergency or tap for help</p>
      </div>
      
      {/* Main Voice Interface Card */}
      <Card className="card-modern border-gradient overflow-hidden">
        <CardContent className="p-8">
          {/* Voice Activation Button */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Button
                onClick={handleVoiceToggle}
                disabled={isProcessing}
                className={`w-32 h-32 rounded-full text-4xl shadow-2xl transition-all duration-500 transform hover:scale-110 focus:outline-none focus:ring-4 ${
                  isListening 
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 emergency-pulse scale-110' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-2xl'
                } ${isProcessing ? 'animate-pulse' : ''}`}
                aria-label={isListening ? 'Stop voice recognition' : 'Start voice recognition'}
              >
                {isListening ? (
                  <MicOff className="h-12 w-12 drop-shadow-lg" />
                ) : (
                  <Mic className="h-12 w-12 drop-shadow-lg" />
                )}
              </Button>
              
              {/* Status Ring */}
              <div className={`absolute inset-0 rounded-full border-4 transition-all duration-300 ${
                isListening 
                  ? 'border-red-400/50 animate-ping' 
                  : 'border-blue-400/30'
              }`} />
              
              {/* Emergency Indicator */}
              {isListening && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                  <AlertTriangle className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Voice Waveform Visualization */}
          <div className="flex justify-center items-end space-x-2 h-20 mb-8">
            {voiceActivity.map((level, index) => (
              <div
                key={index}
                className={`bg-gradient-to-t from-primary to-purple-500 rounded-full transition-all duration-200 ${
                  isListening ? 'voice-wave' : ''
                }`}
                style={{
                  width: '6px',
                  height: `${level * 70}px`,
                  animationDelay: `${index * 0.1}s`,
                  minHeight: '8px'
                }}
              />
            ))}
          </div>

          {/* Voice Recognition Status */}
          <div className="text-center space-y-4">
            <div className="relative">
              <p className="text-lg font-medium text-foreground mb-2">
                {recognitionStatus}
              </p>
              
              {/* Show interim results */}
              {interimTranscript && (
                <div className="bg-muted/50 rounded-lg p-3 mb-3 border border-border/50">
                  <p className="text-sm text-muted-foreground italic">
                    "{interimTranscript}"
                  </p>
                </div>
              )}
              
              {/* Show final transcript */}
              {transcript && !isListening && (
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20 space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Recognized: "{transcript}"
                  </p>
                  {isProcessing && (
                    <Badge variant="secondary" className="animate-pulse">
                      <Zap className="h-3 w-3 mr-1" />
                      Processing...
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Error display */}
              {error && (
                <div className="bg-destructive/10 rounded-lg p-3 border border-destructive/20">
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Error: {error}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Voice Activity Indicators */}
          <div className="flex justify-center space-x-4 mt-6">
            {isListening && (
              <Badge variant="default" className="animate-pulse bg-red-500 hover:bg-red-600">
                <Mic className="h-3 w-3 mr-1" />
                Listening
              </Badge>
            )}
            
            {isSpeaking && (
              <Badge variant="secondary" className="bg-blue-500 text-white hover:bg-blue-600">
                <Volume2 className="h-3 w-3 mr-1" />
                Speaking
              </Badge>
            )}
            
            {isProcessing && (
              <Badge variant="secondary" className="animate-pulse bg-purple-500 text-white">
                <Zap className="h-3 w-3 mr-1" />
                Processing
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Voice Commands</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">Say "Help", "Emergency", or describe your situation</p>
        </div>
        <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">Always Available</h4>
          <p className="text-sm text-green-700 dark:text-green-300">Works offline with cached emergency protocols</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">Multi-Language</h4>
          <p className="text-sm text-purple-700 dark:text-purple-300">Supports multiple languages for emergencies</p>
        </div>
      </div>
    </section>
  );
}