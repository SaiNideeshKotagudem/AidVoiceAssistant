import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { EmergencyProtocol } from '@/types/emergency';
import { getEmergencyProtocol, getAllEmergencyProtocols } from '@/data/emergency-protocols';

export const useEmergencyProtocols = () => {
  const [currentProtocol, setCurrentProtocol] = useState<EmergencyProtocol | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const { toast } = useToast();

  // Query to fetch emergency protocols from server
  const { data: serverProtocols, isLoading } = useQuery({
    queryKey: ['/api/emergency-protocols'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Combine local and server protocols
  const allProtocols = [...getAllEmergencyProtocols(), ...(serverProtocols || [])];

  const activateProtocol = useCallback((type: string) => {
    const protocol = getEmergencyProtocol(type) || allProtocols.find(p => p.type === type);
    
    if (!protocol) {
      toast({
        title: "Protocol Not Found",
        description: `Emergency protocol for ${type} not found`,
        variant: "destructive",
      });
      return;
    }

    setCurrentProtocol(protocol);
    setCurrentStep(0);
    setCompletedSteps([]);
    
    toast({
      title: `${protocol.name} Activated`,
      description: "Emergency protocol is now active",
    });
  }, [allProtocols, toast]);

  const nextStep = useCallback(() => {
    if (!currentProtocol) return;
    
    const steps = currentProtocol.instructions.steps;
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentProtocol, currentStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const markStepCompleted = useCallback((step: number) => {
    setCompletedSteps(prev => {
      if (prev.includes(step)) {
        return prev.filter(s => s !== step);
      } else {
        return [...prev, step];
      }
    });
  }, []);

  const resetProtocol = useCallback(() => {
    setCurrentProtocol(null);
    setCurrentStep(0);
    setCompletedSteps([]);
  }, []);

  const getProtocolsByCategory = useCallback((category: string) => {
    return allProtocols.filter(protocol => protocol.category === category);
  }, [allProtocols]);

  const getProtocolsBySeverity = useCallback((severity: string) => {
    return allProtocols.filter(protocol => protocol.severity === severity);
  }, [allProtocols]);

  const searchProtocols = useCallback((query: string) => {
    const searchTerm = query.toLowerCase();
    return allProtocols.filter(protocol => 
      protocol.name.toLowerCase().includes(searchTerm) ||
      protocol.type.toLowerCase().includes(searchTerm) ||
      protocol.description?.toLowerCase().includes(searchTerm) ||
      protocol.category.toLowerCase().includes(searchTerm)
    );
  }, [allProtocols]);

  const getProtocolInstructions = useCallback((protocol: EmergencyProtocol, language: string = 'en') => {
    const instructions = protocol.instructions;
    
    // If we have localized instructions, use them
    if (instructions[language]) {
      return instructions[language];
    }
    
    // Otherwise, return the default instructions
    return instructions;
  }, []);

  const getCurrentStepText = useCallback(() => {
    if (!currentProtocol) return '';
    
    const steps = currentProtocol.instructions.steps;
    return steps[currentStep] || '';
  }, [currentProtocol, currentStep]);

  const isStepCompleted = useCallback((step: number) => {
    return completedSteps.includes(step);
  }, [completedSteps]);

  const getCompletionProgress = useCallback(() => {
    if (!currentProtocol) return 0;
    
    const totalSteps = currentProtocol.instructions.steps.length;
    const completed = completedSteps.length;
    
    return Math.round((completed / totalSteps) * 100);
  }, [currentProtocol, completedSteps]);

  const getEmergencyKeywords = useCallback(() => {
    return [
      'help', 'emergency', 'fire', 'medical', 'police', 'ambulance',
      'earthquake', 'flood', 'tornado', 'hurricane', 'accident',
      'hurt', 'injured', 'bleeding', 'unconscious', 'trapped',
      'smoke', 'burning', 'chest pain', 'difficulty breathing',
      'seizure', 'allergic reaction', 'overdose', 'stroke',
      'heart attack', 'drowning', 'electrocution', 'poisoning'
    ];
  }, []);

  const detectEmergencyType = useCallback((text: string) => {
    const lowerText = text.toLowerCase();
    
    // Fire-related keywords
    if (lowerText.includes('fire') || lowerText.includes('smoke') || lowerText.includes('burning')) {
      return 'fire';
    }
    
    // Medical-related keywords
    if (lowerText.includes('medical') || lowerText.includes('hurt') || lowerText.includes('injured') ||
        lowerText.includes('chest pain') || lowerText.includes('heart attack') || lowerText.includes('stroke')) {
      return 'medical';
    }
    
    // Natural disaster keywords
    if (lowerText.includes('earthquake') || lowerText.includes('shaking')) {
      return 'earthquake';
    }
    
    if (lowerText.includes('flood') || lowerText.includes('water')) {
      return 'flood';
    }
    
    if (lowerText.includes('tornado') || lowerText.includes('twister')) {
      return 'tornado';
    }
    
    // Default to medical if no specific type detected
    return 'medical';
  }, []);

  return {
    currentProtocol,
    currentStep,
    completedSteps,
    allProtocols,
    isLoading,
    activateProtocol,
    nextStep,
    previousStep,
    markStepCompleted,
    resetProtocol,
    getProtocolsByCategory,
    getProtocolsBySeverity,
    searchProtocols,
    getProtocolInstructions,
    getCurrentStepText,
    isStepCompleted,
    getCompletionProgress,
    getEmergencyKeywords,
    detectEmergencyType,
  };
};
