import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import AppHeader from '@/components/app-header';
import VoiceInterface from '@/components/voice-interface';
import QuickActions from '@/components/quick-actions';
import MultimodalInput from '@/components/multimodal-input';
import EmergencyGuidance from '@/components/emergency-guidance';
import AccessibilityControls from '@/components/accessibility-controls';
import DeviceStatus from '@/components/device-status';
import EmergencyContacts from '@/components/emergency-contacts';
import FloatingActionButton from '@/components/floating-action-button';
import BottomNavigation from '@/components/bottom-navigation';
import ChatInterface from '@/components/chat-interface';
import { useEmergencyProtocols } from '@/hooks/use-emergency-protocols';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useDeviceStatus } from '@/hooks/use-device-status';
import { emergencyService } from '@/services/emergency-service';
import { offlineService } from '@/services/offline-service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  const [, navigate] = useLocation();
  const { currentProtocol, activateProtocol } = useEmergencyProtocols();
  const { accessibilitySettings, announceToScreenReader } = useAccessibility();
  const { deviceStatus, checkBatteryLevel } = useDeviceStatus();

  useEffect(() => {
    // Initialize emergency service
    emergencyService.initialize();
    
    // Initialize offline service
    offlineService.initialize();
    
    // Check battery level on load
    checkBatteryLevel();
    
    // Announce page load for screen readers
    announceToScreenReader('AidVoice emergency assistant loaded. Main interface ready.', 'polite');
  }, [checkBatteryLevel, announceToScreenReader]);

  const handleEmergencyAction = async (type: string) => {
    // Activate emergency protocol
    activateProtocol(type);
    
    // Log emergency action
    await emergencyService.logEmergencyAction({
      type: 'protocol_activation',
      emergencyType: type,
      timestamp: new Date(),
      deviceStatus: deviceStatus,
    });
    
    // Announce to screen reader
    announceToScreenReader(`${type} emergency protocol activated`, 'assertive');
  };

  const handleVoiceCommand = async (command: string) => {
    // Process voice command through emergency service
    await emergencyService.processVoiceCommand(command);
  };

  const handleImageAnalysis = async (imageData: string | Blob) => {
    // Analyze image for emergency content
    const analysis = await emergencyService.analyzeEmergencyScene(imageData);
    
    if (analysis.emergencyType !== 'unknown') {
      handleEmergencyAction(analysis.emergencyType);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-6 pb-20">
        <Tabs defaultValue="emergency" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="emergency">Emergency Response</TabsTrigger>
            <TabsTrigger value="chat">Chat Assistant</TabsTrigger>
          </TabsList>
          
          <TabsContent value="emergency" className="space-y-6">
            <VoiceInterface 
              onVoiceCommand={handleVoiceCommand}
              onEmergencyDetected={handleEmergencyAction}
            />
            
            <QuickActions onActionSelected={handleEmergencyAction} />
            
            <MultimodalInput 
              onTextSubmit={handleVoiceCommand}
              onImageCapture={handleImageAnalysis}
              onTranslationRequest={(text, lang) => navigate(`/translate?text=${encodeURIComponent(text)}&lang=${lang}`)}
            />
            
            {currentProtocol && (
              <EmergencyGuidance 
                protocol={currentProtocol}
                onStepComplete={(step) => {
                  emergencyService.logEmergencyAction({
                    type: 'protocol',
                    emergencyType: currentProtocol.type,
                    stepNumber: step,
                    timestamp: new Date(),
                  });
                }}
              />
            )}
            
            <AccessibilityControls />
            
            <DeviceStatus />
            
            <EmergencyContacts onContactCall={(contact) => {
              emergencyService.logEmergencyAction({
                type: 'call',
                contactType: contact.type,
                phoneNumber: contact.phoneNumber,
                timestamp: new Date(),
              });
            }} />
          </TabsContent>
          
          <TabsContent value="chat" className="space-y-6">
            <ChatInterface 
              emergencyType={currentProtocol?.type}
              onEmergencyDetected={handleEmergencyAction}
              language="en"
            />
          </TabsContent>
        </Tabs>
      </main>
      
      <FloatingActionButton 
        onQuickCall={() => emergencyService.callEmergencyServices()}
        onQuickVoice={() => handleVoiceCommand('emergency help')}
        onQuickCamera={() => document.getElementById('camera-input')?.click()}
      />
      
      <BottomNavigation />
    </div>
  );
}
