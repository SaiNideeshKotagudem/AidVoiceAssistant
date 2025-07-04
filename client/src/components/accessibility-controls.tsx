import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useDeviceStatus } from '@/hooks/use-device-status';
import { 
  Eye, 
  Ear, 
  Volume2, 
  VolumeX,
  Vibrate,
  Type,
  Contrast,
  MousePointer,
  Keyboard
} from 'lucide-react';

export default function AccessibilityControls() {
  const { 
    accessibilitySettings, 
    toggleSetting, 
    enableScreenReader, 
    disableScreenReader,
    announceToScreenReader,
    isScreenReaderActive
  } = useAccessibility();
  
  const { deviceCapabilities } = useDeviceStatus();

  const handleToggle = (setting: keyof typeof accessibilitySettings) => {
    toggleSetting(setting);
    
    // Provide immediate feedback
    const settingNames = {
      highContrast: 'High contrast mode',
      largeText: 'Large text',
      screenReader: 'Screen reader',
      visualAlerts: 'Visual alerts',
      vibrationAlerts: 'Vibration alerts',
      audioDescriptions: 'Audio descriptions',
      reducedMotion: 'Reduced motion',
      keyboardNavigation: 'Keyboard navigation',
    };
    
    const isEnabled = !accessibilitySettings[setting];
    announceToScreenReader(
      `${settingNames[setting]} ${isEnabled ? 'enabled' : 'disabled'}`,
      'polite'
    );
  };

  const handleScreenReaderToggle = () => {
    if (isScreenReaderActive) {
      disableScreenReader();
    } else {
      enableScreenReader();
    }
  };

  return (
    <section className="mb-8">
      <h3 className="text-xl font-bold mb-4">Accessibility Features</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Vision Assistance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Vision Assistance
            </CardTitle>
            <CardDescription>
              Settings for users with visual impairments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="high-contrast" className="text-sm font-medium">
                  High Contrast Mode
                </Label>
                <p className="text-xs text-muted-foreground">
                  Increase contrast for better visibility
                </p>
              </div>
              <Switch
                id="high-contrast"
                checked={accessibilitySettings.highContrast}
                onCheckedChange={() => handleToggle('highContrast')}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="large-text" className="text-sm font-medium">
                  Large Text
                </Label>
                <p className="text-xs text-muted-foreground">
                  Increase text size for better readability
                </p>
              </div>
              <Switch
                id="large-text"
                checked={accessibilitySettings.largeText}
                onCheckedChange={() => handleToggle('largeText')}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="audio-descriptions" className="text-sm font-medium">
                  Audio Descriptions
                </Label>
                <p className="text-xs text-muted-foreground">
                  Describe visual content with audio
                </p>
              </div>
              <Switch
                id="audio-descriptions"
                checked={accessibilitySettings.audioDescriptions}
                onCheckedChange={() => handleToggle('audioDescriptions')}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="reduced-motion" className="text-sm font-medium">
                  Reduced Motion
                </Label>
                <p className="text-xs text-muted-foreground">
                  Minimize animations and transitions
                </p>
              </div>
              <Switch
                id="reduced-motion"
                checked={accessibilitySettings.reducedMotion}
                onCheckedChange={() => handleToggle('reducedMotion')}
              />
            </div>
            
            <Separator />
            
            <Button
              onClick={handleScreenReaderToggle}
              variant={isScreenReaderActive ? "default" : "outline"}
              className="w-full flex items-center gap-2"
            >
              <Volume2 className="h-4 w-4" />
              {isScreenReaderActive ? 'Disable' : 'Enable'} Screen Reader
            </Button>
          </CardContent>
        </Card>

        {/* Hearing Assistance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ear className="h-5 w-5 text-primary" />
              Hearing Assistance
            </CardTitle>
            <CardDescription>
              Settings for users with hearing impairments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="visual-alerts" className="text-sm font-medium">
                  Visual Alerts
                </Label>
                <p className="text-xs text-muted-foreground">
                  Show visual indicators for audio alerts
                </p>
              </div>
              <Switch
                id="visual-alerts"
                checked={accessibilitySettings.visualAlerts}
                onCheckedChange={() => handleToggle('visualAlerts')}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="vibration-alerts" className="text-sm font-medium">
                  Vibration Alerts
                </Label>
                <p className="text-xs text-muted-foreground">
                  Use device vibration for notifications
                </p>
              </div>
              <Switch
                id="vibration-alerts"
                checked={accessibilitySettings.vibrationAlerts}
                onCheckedChange={() => handleToggle('vibrationAlerts')}
                disabled={!deviceCapabilities.hasVibration}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="keyboard-navigation" className="text-sm font-medium">
                  Enhanced Keyboard Navigation
                </Label>
                <p className="text-xs text-muted-foreground">
                  Improve keyboard accessibility
                </p>
              </div>
              <Switch
                id="keyboard-navigation"
                checked={accessibilitySettings.keyboardNavigation}
                onCheckedChange={() => handleToggle('keyboardNavigation')}
              />
            </div>
            
            <Separator />
            
            <Button
              onClick={() => {
                announceToScreenReader(
                  'Visual transcription would be enabled here for real-time speech-to-text display',
                  'polite'
                );
              }}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Type className="h-4 w-4" />
              Enable Live Transcription
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Accessibility Actions</CardTitle>
          <CardDescription>
            Rapidly enable or disable key accessibility features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant={accessibilitySettings.highContrast ? "default" : "outline"}
              size="sm"
              onClick={() => handleToggle('highContrast')}
              className="flex items-center gap-2"
            >
              <Contrast className="h-4 w-4" />
              <span className="sr-only">Toggle </span>Contrast
            </Button>
            
            <Button
              variant={accessibilitySettings.largeText ? "default" : "outline"}
              size="sm"
              onClick={() => handleToggle('largeText')}
              className="flex items-center gap-2"
            >
              <Type className="h-4 w-4" />
              <span className="sr-only">Toggle </span>Large Text
            </Button>
            
            <Button
              variant={accessibilitySettings.visualAlerts ? "default" : "outline"}
              size="sm"
              onClick={() => handleToggle('visualAlerts')}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">Toggle </span>Visual Alerts
            </Button>
            
            <Button
              variant={accessibilitySettings.vibrationAlerts ? "default" : "outline"}
              size="sm"
              onClick={() => handleToggle('vibrationAlerts')}
              disabled={!deviceCapabilities.hasVibration}
              className="flex items-center gap-2"
            >
              <Vibrate className="h-4 w-4" />
              <span className="sr-only">Toggle </span>Vibration
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
