import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import AppHeader from '@/components/app-header';
import BottomNavigation from '@/components/bottom-navigation';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useDeviceStatus } from '@/hooks/use-device-status';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { getSupportedLanguages } from '@/data/languages';
import { 
  Settings as SettingsIcon, 
  Accessibility, 
  Volume2, 
  Eye, 
  Ear,
  Smartphone,
  Battery,
  Cpu,
  Globe,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('accessibility');
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [speechVolume, setSpeechVolume] = useState(1);
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  
  const { toast } = useToast();
  const {
    accessibilitySettings,
    updateSetting,
    toggleSetting,
    resetSettings,
    announceToScreenReader,
  } = useAccessibility();
  
  const {
    deviceStatus,
    deviceCapabilities,
    enablePowerSavingMode,
    disablePowerSavingMode,
    switchToLightModel,
    switchToFullModel,
    checkBatteryLevel,
    checkMemoryUsage,
    getDeviceInfo,
  } = useDeviceStatus();
  
  const { voices, selectedVoice, setSelectedVoice } = useSpeechSynthesis();
  const supportedLanguages = getSupportedLanguages();

  useEffect(() => {
    announceToScreenReader('Settings page loaded', 'polite');
  }, [announceToScreenReader]);

  const handleAccessibilityChange = (setting: string, value: boolean) => {
    updateSetting(setting as any, value);
  };

  const handleSpeechTest = () => {
    const testText = "This is a test of the speech synthesis system. Emergency assistance is ready.";
    // Would use speech synthesis here
    announceToScreenReader(testText, 'polite');
  };

  const handleResetSettings = () => {
    resetSettings();
    setSpeechRate(1);
    setSpeechPitch(1);
    setSpeechVolume(1);
    setPreferredLanguage('en');
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults",
    });
  };

  const deviceInfo = getDeviceInfo();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-6 pb-20">
        <div className="flex items-center gap-4 mb-6">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-lg text-muted-foreground">Configure your emergency assistant</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="accessibility" className="flex items-center gap-2">
              <Accessibility className="h-4 w-4" />
              <span className="hidden sm:inline">Accessibility</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <span className="hidden sm:inline">Voice</span>
            </TabsTrigger>
            <TabsTrigger value="device" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">Device</span>
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accessibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Vision Assistance
                </CardTitle>
                <CardDescription>
                  Settings for users with visual impairments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="high-contrast">High Contrast Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Increase contrast for better visibility
                    </p>
                  </div>
                  <Switch
                    id="high-contrast"
                    checked={accessibilitySettings.highContrast}
                    onCheckedChange={(checked) => handleAccessibilityChange('highContrast', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="large-text">Large Text</Label>
                    <p className="text-sm text-muted-foreground">
                      Increase text size for better readability
                    </p>
                  </div>
                  <Switch
                    id="large-text"
                    checked={accessibilitySettings.largeText}
                    onCheckedChange={(checked) => handleAccessibilityChange('largeText', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="screen-reader">Screen Reader Support</Label>
                    <p className="text-sm text-muted-foreground">
                      Enhanced screen reader compatibility
                    </p>
                  </div>
                  <Switch
                    id="screen-reader"
                    checked={accessibilitySettings.screenReader}
                    onCheckedChange={(checked) => handleAccessibilityChange('screenReader', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="audio-descriptions">Audio Descriptions</Label>
                    <p className="text-sm text-muted-foreground">
                      Describe visual content with audio
                    </p>
                  </div>
                  <Switch
                    id="audio-descriptions"
                    checked={accessibilitySettings.audioDescriptions}
                    onCheckedChange={(checked) => handleAccessibilityChange('audioDescriptions', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ear className="h-5 w-5" />
                  Hearing Assistance
                </CardTitle>
                <CardDescription>
                  Settings for users with hearing impairments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="visual-alerts">Visual Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Show visual indicators for audio alerts
                    </p>
                  </div>
                  <Switch
                    id="visual-alerts"
                    checked={accessibilitySettings.visualAlerts}
                    onCheckedChange={(checked) => handleAccessibilityChange('visualAlerts', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="vibration-alerts">Vibration Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Use device vibration for notifications
                    </p>
                  </div>
                  <Switch
                    id="vibration-alerts"
                    checked={accessibilitySettings.vibrationAlerts}
                    onCheckedChange={(checked) => handleAccessibilityChange('vibrationAlerts', checked)}
                    disabled={!deviceCapabilities.hasVibration}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="reduced-motion">Reduced Motion</Label>
                    <p className="text-sm text-muted-foreground">
                      Minimize animations and transitions
                    </p>
                  </div>
                  <Switch
                    id="reduced-motion"
                    checked={accessibilitySettings.reducedMotion}
                    onCheckedChange={(checked) => handleAccessibilityChange('reducedMotion', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="voice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Speech Synthesis</CardTitle>
                <CardDescription>
                  Configure text-to-speech settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Voice Selection</Label>
                  <Select value={selectedVoice?.name || ''} onValueChange={(value) => {
                    const voice = voices.find(v => v.name === value);
                    if (voice) setSelectedVoice(voice);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Speech Rate: {speechRate}</Label>
                  <Slider
                    value={[speechRate]}
                    onValueChange={(value) => setSpeechRate(value[0])}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Adjust how fast the voice speaks
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Speech Pitch: {speechPitch}</Label>
                  <Slider
                    value={[speechPitch]}
                    onValueChange={(value) => setSpeechPitch(value[0])}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Adjust voice pitch (higher or lower)
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Speech Volume: {speechVolume}</Label>
                  <Slider
                    value={[speechVolume]}
                    onValueChange={(value) => setSpeechVolume(value[0])}
                    min={0.1}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Adjust voice volume level
                  </p>
                </div>
                
                <Separator />
                
                <Button onClick={handleSpeechTest} className="w-full">
                  <Volume2 className="h-4 w-4 mr-2" />
                  Test Voice Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="device" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Battery className="h-5 w-5" />
                  Power Management
                </CardTitle>
                <CardDescription>
                  Battery and performance settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Battery Level</Label>
                    <p className="text-sm text-muted-foreground">
                      {deviceStatus.batteryLevel}% {deviceStatus.isCharging ? '(Charging)' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-8 bg-muted rounded-full p-1">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${deviceStatus.batteryLevel}%` }}
                      />
                    </div>
                    <Badge variant={deviceStatus.batteryLevel < 20 ? 'destructive' : 'secondary'}>
                      {deviceStatus.batteryLevel}%
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Power Saving Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduce performance to save battery
                    </p>
                  </div>
                  <Switch
                    checked={deviceStatus.powerSavingMode}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        enablePowerSavingMode();
                      } else {
                        disablePowerSavingMode();
                      }
                    }}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Current AI Model</Label>
                    <p className="text-sm text-muted-foreground">
                      {deviceStatus.currentModel}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={deviceStatus.currentModel === 'Gemma-3n-2B' ? 'default' : 'outline'}
                      size="sm"
                      onClick={switchToLightModel}
                    >
                      Light
                    </Button>
                    <Button
                      variant={deviceStatus.currentModel === 'Gemma-3n-4B' ? 'default' : 'outline'}
                      size="sm"
                      onClick={switchToFullModel}
                    >
                      Full
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  System Information
                </CardTitle>
                <CardDescription>
                  Device capabilities and performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Memory Usage</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${(deviceStatus.memoryUsage / deviceStatus.memoryLimit) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {deviceStatus.memoryUsage}MB
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Connection Status</Label>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${deviceStatus.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm text-muted-foreground">
                        {deviceStatus.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Device Capabilities</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${deviceCapabilities.hasCamera ? 'text-green-500' : 'text-muted-foreground'}`} />
                      <span className="text-sm">Camera</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${deviceCapabilities.hasMicrophone ? 'text-green-500' : 'text-muted-foreground'}`} />
                      <span className="text-sm">Microphone</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${deviceCapabilities.hasVibration ? 'text-green-500' : 'text-muted-foreground'}`} />
                      <span className="text-sm">Vibration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${deviceCapabilities.hasGeolocation ? 'text-green-500' : 'text-muted-foreground'}`} />
                      <span className="text-sm">GPS</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Language and app preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Preferred Language</Label>
                  <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedLanguages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Default language for the app interface
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <Label>App Information</Label>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Version</p>
                      <p className="text-muted-foreground">1.0.0</p>
                    </div>
                    <div>
                      <p className="font-medium">Build</p>
                      <p className="text-muted-foreground">Production</p>
                    </div>
                    <div>
                      <p className="font-medium">Platform</p>
                      <p className="text-muted-foreground">{deviceInfo.platform}</p>
                    </div>
                    <div>
                      <p className="font-medium">Browser</p>
                      <p className="text-muted-foreground">
                        {deviceInfo.userAgent?.includes('Chrome') ? 'Chrome' : 
                         deviceInfo.userAgent?.includes('Firefox') ? 'Firefox' : 'Other'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Reset Settings
                </CardTitle>
                <CardDescription>
                  Reset all settings to default values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-yellow-500" />
                      <p className="text-sm font-medium">Warning</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      This will reset all your preferences, including accessibility settings, 
                      voice configuration, and language preferences.
                    </p>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    onClick={handleResetSettings}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset All Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
