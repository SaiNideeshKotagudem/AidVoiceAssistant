import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useDeviceStatus } from '@/hooks/use-device-status';
import { useAccessibility } from '@/hooks/use-accessibility';
import { 
  Battery, 
  BatteryLow, 
  Cpu, 
  HardDrive,
  Wifi,
  WifiOff,
  Zap,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';

export default function DeviceStatus() {
  const {
    deviceStatus,
    deviceCapabilities,
    performanceMetrics,
    enablePowerSavingMode,
    disablePowerSavingMode,
    switchToLightModel,
    switchToFullModel,
    checkBatteryLevel,
    checkMemoryUsage,
  } = useDeviceStatus();

  const { announceToScreenReader } = useAccessibility();

  const handlePowerSavingToggle = () => {
    if (deviceStatus.powerSavingMode) {
      disablePowerSavingMode();
      announceToScreenReader('Power saving mode disabled', 'polite');
    } else {
      enablePowerSavingMode();
      announceToScreenReader('Power saving mode enabled', 'polite');
    }
  };

  const handleModelSwitch = (model: 'light' | 'full') => {
    if (model === 'light') {
      switchToLightModel();
      announceToScreenReader('Switched to light AI model for better performance', 'polite');
    } else {
      switchToFullModel();
      announceToScreenReader('Switched to full AI model for best accuracy', 'polite');
    }
  };

  const getBatteryIcon = () => {
    if (deviceStatus.batteryLevel < 20) {
      return <BatteryLow className="h-5 w-5 text-red-500" />;
    }
    return <Battery className="h-5 w-5 text-green-500" />;
  };

  const getBatteryColor = () => {
    if (deviceStatus.batteryLevel < 20) return 'text-red-500';
    if (deviceStatus.batteryLevel < 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getMemoryUsagePercentage = () => {
    return Math.round((deviceStatus.memoryUsage / deviceStatus.memoryLimit) * 100);
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'optimal': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'degraded': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <section className="mb-8">
      <h3 className="text-xl font-bold mb-4">Device Status & Performance</h3>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>
            Monitor device performance and manage power settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Battery & Power */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                {getBatteryIcon()}
                Power Management
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Battery Level</span>
                  <span className={`text-sm font-bold ${getBatteryColor()}`}>
                    {deviceStatus.batteryLevel}%
                    {deviceStatus.isCharging && ' (Charging)'}
                  </span>
                </div>
                
                <Progress 
                  value={deviceStatus.batteryLevel} 
                  className="h-3"
                />
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="power-saving" className="text-sm font-medium">
                    Power Saving Mode
                  </Label>
                  <Switch
                    id="power-saving"
                    checked={deviceStatus.powerSavingMode}
                    onCheckedChange={handlePowerSavingToggle}
                  />
                </div>
                
                {deviceStatus.batteryLevel < 20 && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <p className="text-xs text-red-700 dark:text-red-300">
                      Low battery - consider enabling power saving mode
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Model Status */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                AI Model Status
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Model</span>
                  <Badge variant="outline">
                    {deviceStatus.currentModel}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Performance</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      deviceStatus.modelPerformance === 'optimal' ? 'bg-green-500' :
                      deviceStatus.modelPerformance === 'good' ? 'bg-blue-500' :
                      deviceStatus.modelPerformance === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className={`text-sm font-medium capitalize ${getPerformanceColor(deviceStatus.modelPerformance)}`}>
                      {deviceStatus.modelPerformance}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant={deviceStatus.currentModel === 'Gemma-3n-2B' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleModelSwitch('light')}
                    className="flex-1"
                  >
                    Light Mode
                  </Button>
                  <Button
                    variant={deviceStatus.currentModel === 'Gemma-3n-4B' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleModelSwitch('full')}
                    className="flex-1"
                  >
                    Full Mode
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Light mode uses less battery and memory
                </p>
              </div>
            </div>

            {/* Memory & Connectivity */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                System Resources
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Memory Used</span>
                  <span className="text-sm font-bold">
                    {deviceStatus.memoryUsage} MB
                  </span>
                </div>
                
                <Progress 
                  value={getMemoryUsagePercentage()} 
                  className="h-3"
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Available</span>
                  <span className="text-sm text-muted-foreground">
                    {deviceStatus.memoryLimit - deviceStatus.memoryUsage} MB
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Connection</span>
                  <div className="flex items-center gap-2">
                    {deviceStatus.isOnline ? (
                      <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-500" />
                    )}
                    <Badge variant={deviceStatus.isOnline ? 'default' : 'destructive'}>
                      {deviceStatus.isOnline ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                </div>
                
                {getMemoryUsagePercentage() > 80 && (
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      High memory usage - consider switching to light mode
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Device Capabilities */}
          <Separator className="my-6" />
          
          <div>
            <h4 className="font-semibold text-lg mb-3">Device Capabilities</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <CheckCircle className={`h-4 w-4 ${deviceCapabilities.hasCamera ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className="text-sm">Camera</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <CheckCircle className={`h-4 w-4 ${deviceCapabilities.hasMicrophone ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className="text-sm">Microphone</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <CheckCircle className={`h-4 w-4 ${deviceCapabilities.hasVibration ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className="text-sm">Vibration</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <CheckCircle className={`h-4 w-4 ${deviceCapabilities.hasGeolocation ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className="text-sm">GPS</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <CheckCircle className={`h-4 w-4 ${deviceCapabilities.supportsTouchscreen ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className="text-sm">Touch</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <CheckCircle className={`h-4 w-4 ${deviceCapabilities.supportsKeyboard ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className="text-sm">Keyboard</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <CheckCircle className={`h-4 w-4 ${deviceCapabilities.hasAccelerometer ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className="text-sm">Motion</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <CheckCircle className={`h-4 w-4 ${deviceCapabilities.hasSpeaker ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className="text-sm">Speaker</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
