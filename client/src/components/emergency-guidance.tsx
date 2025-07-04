import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useEmergencyProtocols } from '@/hooks/use-emergency-protocols';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { EmergencyProtocol } from '@/types/emergency';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  CheckCircle, 
  Circle,
  AlertTriangle,
  Clock,
  Volume2,
  VolumeX
} from 'lucide-react';

interface EmergencyGuidanceProps {
  protocol: EmergencyProtocol;
  onStepComplete: (step: number) => void;
}

export default function EmergencyGuidance({ protocol, onStepComplete }: EmergencyGuidanceProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const { announceToScreenReader, triggerVibration } = useAccessibility();
  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  const steps = protocol.instructions.steps;
  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    // Auto-read current step when it changes
    if (currentStep && isPlaying) {
      const stepText = `Step ${currentStepIndex + 1}: ${currentStep}`;
      speak(stepText);
    }
  }, [currentStepIndex, currentStep, isPlaying, speak]);

  useEffect(() => {
    // Start step timer for time-sensitive instructions
    if (protocol.type === 'fire' || protocol.type === 'medical') {
      setTimeRemaining(30); // 30 second timer for urgent steps
      
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            return null;
          }
          
          // Alert at 10 seconds
          if (prev === 10) {
            triggerVibration([200, 100, 200]);
            announceToScreenReader('10 seconds remaining for this step', 'assertive');
          }
          
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentStepIndex, protocol.type, triggerVibration, announceToScreenReader]);

  const handlePlayPause = () => {
    if (isSpeaking) {
      stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const stepText = `Step ${currentStepIndex + 1}: ${currentStep}`;
      speak(stepText);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      announceToScreenReader(`Moved to step ${currentStepIndex + 2}`, 'polite');
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      announceToScreenReader(`Moved to step ${currentStepIndex}`, 'polite');
    }
  };

  const handleStepComplete = (stepIndex: number) => {
    const isCompleted = completedSteps.includes(stepIndex);
    
    if (isCompleted) {
      setCompletedSteps(prev => prev.filter(s => s !== stepIndex));
    } else {
      setCompletedSteps(prev => [...prev, stepIndex]);
      onStepComplete(stepIndex);
      triggerVibration([100]);
    }
    
    announceToScreenReader(
      `Step ${stepIndex + 1} marked as ${isCompleted ? 'incomplete' : 'complete'}`,
      'polite'
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700';
      case 'high': return 'text-orange-700';
      case 'medium': return 'text-yellow-700';
      case 'low': return 'text-green-700';
      default: return 'text-gray-700';
    }
  };

  return (
    <section className="mb-8">
      <h3 className="text-xl font-bold mb-4">Emergency Guidance</h3>
      
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${getSeverityColor(protocol.severity)} animate-pulse`} />
              <div>
                <CardTitle className="text-lg">{protocol.name}</CardTitle>
                <CardDescription>{protocol.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getSeverityTextColor(protocol.severity)}>
                {protocol.severity.toUpperCase()}
              </Badge>
              <Badge variant="secondary">
                {protocol.category}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{completedSteps.length} of {steps.length} steps completed</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Step */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg">
                Step {currentStepIndex + 1} of {steps.length}
              </h4>
              {timeRemaining !== null && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-700">
                    {timeRemaining}s
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-base leading-relaxed">{currentStep}</p>
            </div>
          </div>

          {/* Step Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousStep}
                disabled={currentStepIndex === 0}
              >
                <SkipBack className="h-4 w-4" />
                Previous
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextStep}
                disabled={currentStepIndex === steps.length - 1}
              >
                Next
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStepComplete(currentStepIndex)}
                className="flex items-center gap-2"
              >
                {completedSteps.includes(currentStepIndex) ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
                {completedSteps.includes(currentStepIndex) ? 'Completed' : 'Mark Complete'}
              </Button>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <h5 className="font-medium">Audio Instructions</h5>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePlayPause}
                  className="flex items-center gap-2"
                >
                  {isSpeaking ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isSpeaking ? 'Pause' : 'Play'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    stop();
                    setIsPlaying(false);
                  }}
                  disabled={!isSpeaking}
                >
                  <VolumeX className="h-4 w-4" />
                  Stop
                </Button>
              </div>
            </div>
          </div>

          {/* All Steps Overview */}
          <div className="space-y-3">
            <h5 className="font-medium">All Steps</h5>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    index === currentStepIndex 
                      ? 'bg-primary/5 border-primary' 
                      : 'bg-muted/30 border-muted-foreground/20'
                  }`}
                >
                  <button
                    onClick={() => handleStepComplete(index)}
                    className="flex-shrink-0 mt-1"
                  >
                    {completedSteps.includes(index) ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">Step {index + 1}</span>
                      {index === currentStepIndex && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings */}
          {protocol.instructions.warnings && (
            <>
              <Separator />
              <div className="space-y-2">
                <h5 className="font-medium flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Important Warnings
                </h5>
                <ul className="space-y-1">
                  {protocol.instructions.warnings.map((warning: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <AlertTriangle className="h-3 w-3 text-destructive flex-shrink-0 mt-0.5" />
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
