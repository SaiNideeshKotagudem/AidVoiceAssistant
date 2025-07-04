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
  Menu,
  Zap
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Shield className="h-8 w-8 text-primary" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              AidVoice
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Emergency Assistant</p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center space-x-3">
          {/* Battery Status */}
          <button
            onClick={() => handleStatusClick('Battery')}
            className="group flex items-center space-x-2 hover:bg-accent/50 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
            aria-label={`Battery level: ${deviceStatus.batteryLevel}%`}
          >
            <div className="relative">
              {getBatteryIcon()}
              {deviceStatus.isCharging && (
                <Zap className="absolute -top-1 -right-1 h-2 w-2 text-yellow-500 animate-pulse" />
              )}
            </div>
            <Badge 
              variant={getBatteryColor()} 
              className="text-xs font-medium transition-all duration-200 group-hover:scale-105"
            >
              {deviceStatus.batteryLevel}%
            </Badge>
          </button>

          {/* Connection Status */}
          <button
            onClick={() => handleStatusClick('Connection')}
            className="group flex items-center space-x-2 hover:bg-accent/50 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
            aria-label={deviceStatus.isOnline ? 'Online' : 'Offline'}
          >
            <div className="relative">
              {deviceStatus.isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                deviceStatus.isOnline ? 'bg-green-500' : 'bg-red-500'
              } animate-pulse`} />
            </div>
            <Badge 
              variant={deviceStatus.isOnline ? 'default' : 'destructive'} 
              className="text-xs font-medium transition-all duration-200 group-hover:scale-105"
            >
              {deviceStatus.isOnline ? 'Online' : 'Offline'}
            </Badge>
          </button>

          {/* Language Indicator */}
          <button
            onClick={handleLanguageClick}
            className="group flex items-center space-x-2 hover:bg-accent/50 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
            aria-label={`Current language: ${currentLanguage}`}
          >
            <Globe className="h-4 w-4 text-primary" />
            <Badge 
              variant="outline" 
              className="text-xs font-medium border-primary/20 text-primary transition-all duration-200 group-hover:scale-105 group-hover:border-primary/40"
            >
              {currentLanguage}
            </Badge>
          </button>

          {/* Emergency Mode Indicator */}
          {deviceStatus.powerSavingMode && (
            <Badge variant="destructive" className="text-xs animate-pulse">
              <Zap className="h-3 w-3 mr-1" />
              Power Save
            </Badge>
          )}

          {/* Accessibility Indicator */}
          {(accessibilitySettings.screenReader || accessibilitySettings.highContrast) && (
            <Badge variant="secondary" className="text-xs">
              <span className="sr-only">Accessibility features enabled</span>
              A11y
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
}