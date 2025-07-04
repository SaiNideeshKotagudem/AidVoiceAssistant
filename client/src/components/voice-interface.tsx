import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { useEmergencyProtocols } from '@/hooks/use-emergency-protocols';
import { useAccessibility } from '@/hooks/use-accessibility';
import { aiService } from '@/services/ai-service';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface VoiceInterfaceProps {
  onVoiceCommand: (command: string) => void;
  onEmergencyDetected: (type: string) => void;
}

export default function VoiceInterface({ onVoiceCommand, onEmergencyDetected }: VoiceInterfaceProps) {
  const [recognitionStatus, setRecognitionStatus] = useState('Say "Help" to start');
  const [voiceActivity, setVoiceActivity] = useState([0.2, 0.8, 0.4, 0.9, 0.3]);
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
      }, 200);
    } else {
      setVoiceActivity([0.2, 0.2, 0.2, 0.2, 0.2]);
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
      
      // Process with AI service
      const aiResult = await aiService.processVoiceCommand(command);
      
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
      if (aiResult.intent === 'emergency_help' || emergencyType !== 'general') {
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
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-center text-destructive">
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
    <section className="mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Emergency Assistant</h2>
        <p className="text-lg text-muted-foreground">Speak your emergency or tap for help</p>
      </div>
      
      {/* Voice Activation Button */}
      <div className="flex justify-center mb-6">
        <Button
          onClick={handleVoiceToggle}
          disabled={isProcessing}
          className={`w-32 h-32 rounded-full text-4xl shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300 ${
            isListening 
              ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
              : 'bg-red-500 hover:bg-red-600'
          }`}
          aria-label={isListening ? 'Stop voice recognition' : 'Start voice recognition'}
        >
          {isListening ? (
            <MicOff className="h-12 w-12" />
          ) : (
            <Mic className="h-12 w-12" />
          )}
        </Button>
      </div>

      {/* Voice Waveform Visualization */}
      <div className="flex justify-center items-end space-x-1 h-16 mb-6">
        {voiceActivity.map((level, index) => (
          <div
            key={index}
            className={`w-2 bg-primary rounded-full transition-all duration-200 ${
              isListening ? 'voice-wave' : ''
            }`}
            style={{
              height: `${level * 60}px`,
              animationDelay: `${index * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Voice Recognition Status */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-foreground">
          {recognitionStatus}
        </p>
        
        {/* Show interim results */}
        {interimTranscript && (
          <p className="text-sm text-muted-foreground italic">
            "{interimTranscript}"
          </p>
        )}
        
        {/* Show final transcript */}
        {transcript && !isListening && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Recognized: "{transcript}"
            </p>
            {isProcessing && (
              <Badge variant="secondary" className="animate-pulse">
                Processing...
              </Badge>
            )}
          </div>
        )}
        
        {/* Error display */}
        {error && (
          <p className="text-sm text-destructive">
            Error: {error}
          </p>
        )}
      </div>

      {/* Voice Activity Indicators */}
      <div className="flex justify-center space-x-4 mt-4">
        {isListening && (
          <Badge variant="default" className="animate-pulse">
            <Mic className="h-3 w-3 mr-1" />
            Listening
          </Badge>
        )}
        
        {isSpeaking && (
          <Badge variant="secondary">
            <Volume2 className="h-3 w-3 mr-1" />
            Speaking
          </Badge>
        )}
        
        {isProcessing && (
          <Badge variant="secondary" className="animate-pulse">
            Processing
          </Badge>
        )}
      </div>
    </section>
  );
}
