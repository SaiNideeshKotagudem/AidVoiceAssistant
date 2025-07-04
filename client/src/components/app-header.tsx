import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDeviceStatus } from '@/hooks/use-device-status';
import { useAccessibility } from '@/hooks/use-accessibility';
import { getSupportedLanguages } from '@/data/languages';
import { 
  Shield, 
  Battery, 
  BatteryLow, 
  Wifi, 
  WifiOff, 
  Globe,
  Settings,
  Menu
} from 'lucide-react';

export default function AppHeader() {
  const [currentLanguage, setCurrentLanguage] = useState('EN');
  const { deviceStatus } = useDeviceStatus();
  const { accessibilitySettings, announceToScreenReader } = useAccessibility();

  useEffect(() => {
    // Update language display based on user preference
    const preferredLang = localStorage.getItem('preferred-language') || 'en';
    setCurrentLanguage(preferredLang.toUpperCase());
  }, []);

  const getBatteryIcon = () => {
    if (deviceStatus.batteryLevel < 20) {
      return <BatteryLow className="h-4 w-4 text-red-500" />;
    }
    return <Battery className="h-4 w-4 text-green-500" />;
  };

  const getBatteryColor = () => {
    if (deviceStatus.batteryLevel < 20) return 'destructive';
    if (deviceStatus.batteryLevel < 50) return 'secondary';
    return 'default';
  };

  const handleLanguageClick = () => {
    announceToScreenReader(`Current language: ${currentLanguage}`, 'polite');
  };

  const handleStatusClick = (status: string) => {
    announceToScreenReader(`${status} status clicked`, 'polite');
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8" />
            <h1 className="text-xl font-bold">AidVoice</h1>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-4">
            {/* Battery Status */}
            <button
              onClick={() => handleStatusClick('Battery')}
              className="flex items-center space-x-1 hover:bg-primary-foreground/10 px-2 py-1 rounded transition-colors"
              aria-label={`Battery level: ${deviceStatus.batteryLevel}%`}
            >
              {getBatteryIcon()}
              <Badge variant={getBatteryColor()} className="text-xs">
                {deviceStatus.batteryLevel}%
              </Badge>
            </button>

            {/* Connection Status */}
            <button
              onClick={() => handleStatusClick('Connection')}
              className="flex items-center space-x-1 hover:bg-primary-foreground/10 px-2 py-1 rounded transition-colors"
              aria-label={deviceStatus.isOnline ? 'Online' : 'Offline'}
            >
              {deviceStatus.isOnline ? (
                <Wifi className="h-4 w-4 text-green-400" />
              ) : (
                <WifiOff className="h-4 w-4 text-yellow-400" />
              )}
              <Badge variant={deviceStatus.isOnline ? 'default' : 'secondary'} className="text-xs">
                {deviceStatus.isOnline ? 'Online' : 'Offline'}
              </Badge>
            </button>

            {/* Language Indicator */}
            <button
              onClick={handleLanguageClick}
              className="flex items-center space-x-1 hover:bg-primary-foreground/10 px-2 py-1 rounded transition-colors"
              aria-label={`Current language: ${currentLanguage}`}
            >
              <Globe className="h-4 w-4" />
              <Badge variant="outline" className="text-xs border-primary-foreground text-primary-foreground">
                {currentLanguage}
              </Badge>
            </button>

            {/* Emergency Mode Indicator */}
            {deviceStatus.powerSavingMode && (
              <Badge variant="destructive" className="text-xs">
                Power Saving
              </Badge>
            )}

            {/* Accessibility Indicator */}
            {(accessibilitySettings.screenReader || accessibilitySettings.highContrast) && (
              <Badge variant="secondary" className="text-xs">
                A11y
              </Badge>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
