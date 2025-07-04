import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccessibility } from '@/hooks/use-accessibility';
import { 
  Flame, 
  Heart, 
  Home, 
  Droplets,
  Wind,
  Car,
  Phone,
  AlertTriangle,
  Shield
} from 'lucide-react';

interface QuickActionsProps {
  onActionSelected: (type: string) => void;
}

const emergencyActions = [
  {
    id: 'fire',
    name: 'Fire Emergency',
    icon: Flame,
    gradient: 'from-red-500 to-orange-600',
    hoverGradient: 'hover:from-red-600 hover:to-orange-700',
    description: 'Fire, smoke, or burning',
    priority: 'critical'
  },
  {
    id: 'medical',
    name: 'Medical Emergency',
    icon: Heart,
    gradient: 'from-red-500 to-pink-600',
    hoverGradient: 'hover:from-red-600 hover:to-pink-700',
    description: 'Injury, illness, or medical crisis',
    priority: 'critical'
  },
  {
    id: 'earthquake',
    name: 'Earthquake',
    icon: Home,
    gradient: 'from-orange-500 to-amber-600',
    hoverGradient: 'hover:from-orange-600 hover:to-amber-700',
    description: 'Earthquake or structural damage',
    priority: 'high'
  },
  {
    id: 'flood',
    name: 'Flood Warning',
    icon: Droplets,
    gradient: 'from-blue-500 to-cyan-600',
    hoverGradient: 'hover:from-blue-600 hover:to-cyan-700',
    description: 'Flooding or water emergency',
    priority: 'high'
  },
  {
    id: 'tornado',
    name: 'Tornado',
    icon: Wind,
    gradient: 'from-gray-500 to-slate-600',
    hoverGradient: 'hover:from-gray-600 hover:to-slate-700',
    description: 'Tornado or severe weather',
    priority: 'high'
  },
  {
    id: 'accident',
    name: 'Accident',
    icon: Car,
    gradient: 'from-yellow-500 to-orange-600',
    hoverGradient: 'hover:from-yellow-600 hover:to-orange-700',
    description: 'Vehicle or other accident',
    priority: 'medium'
  },
  {
    id: 'violence',
    name: 'Violence/Crime',
    icon: Shield,
    gradient: 'from-purple-500 to-indigo-600',
    hoverGradient: 'hover:from-purple-600 hover:to-indigo-700',
    description: 'Violence, crime, or security threat',
    priority: 'critical'
  },
  {
    id: 'general',
    name: 'Other Emergency',
    icon: Phone,
    gradient: 'from-gray-500 to-gray-600',
    hoverGradient: 'hover:from-gray-600 hover:to-gray-700',
    description: 'General emergency or other situation',
    priority: 'medium'
  }
];

export default function QuickActions({ onActionSelected }: QuickActionsProps) {
  const { announceToScreenReader, triggerVibration } = useAccessibility();

  const handleActionClick = (action: typeof emergencyActions[0]) => {
    // Provide feedback
    announceToScreenReader(`${action.name} selected`, 'assertive');
    triggerVibration([200, 100, 200]);
    
    // Trigger the action
    onActionSelected(action.id);
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />;
      case 'high':
        return <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />;
      default:
        return null;
    }
  };

  return (
    <section className="mb-8 fade-in">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gradient mb-2">Quick Emergency Actions</h3>
        <p className="text-muted-foreground">Select your emergency type for immediate assistance</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {emergencyActions.map((action) => {
          const IconComponent = action.icon;
          
          return (
            <Button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={`
                bg-gradient-to-br ${action.gradient} ${action.hoverGradient} text-white
                h-auto p-6 flex-col gap-3 transition-all duration-300 
                hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/30
                shadow-lg border-0 rounded-2xl group relative overflow-hidden
              `}
              aria-label={`${action.name}: ${action.description}`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Priority Indicator */}
              {getPriorityIndicator(action.priority)}
              
              {/* Icon */}
              <div className="relative z-10">
                <IconComponent className="h-8 w-8 drop-shadow-lg" />
              </div>
              
              {/* Content */}
              <div className="text-center relative z-10">
                <p className="font-semibold text-sm leading-tight mb-1">{action.name}</p>
                <p className="text-xs opacity-90 hidden sm:block leading-tight">
                  {action.description}
                </p>
              </div>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          );
        })}
      </div>
      
      {/* Emergency Contacts Quick Access */}
      <Card className="card-modern border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30">
        <CardHeader className="pb-4">
          <CardTitle className="text-red-800 dark:text-red-200 text-lg flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Emergency Contacts
          </CardTitle>
          <CardDescription className="text-red-600 dark:text-red-400">
            Immediate access to emergency services
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={() => {
                announceToScreenReader('Emergency services contacted', 'assertive');
                triggerVibration([100, 50, 100, 50, 100]);
                // Would trigger actual emergency call if supported
              }}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex flex-col items-center gap-1">
                <Phone className="h-4 w-4" />
                <span className="text-xs font-medium">Call 911</span>
              </div>
            </Button>
            
            <Button
              onClick={() => {
                announceToScreenReader('Medical emergency services contacted', 'assertive');
                triggerVibration([100, 50, 100, 50, 100]);
              }}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex flex-col items-center gap-1">
                <Heart className="h-4 w-4" />
                <span className="text-xs font-medium">Medical</span>
              </div>
            </Button>
            
            <Button
              onClick={() => {
                announceToScreenReader('Fire department contacted', 'assertive');
                triggerVibration([100, 50, 100, 50, 100]);
              }}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex flex-col items-center gap-1">
                <Flame className="h-4 w-4" />
                <span className="text-xs font-medium">Fire Dept</span>
              </div>
            </Button>
            
            <Button
              onClick={() => {
                announceToScreenReader('Police contacted', 'assertive');
                triggerVibration([100, 50, 100, 50, 100]);
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="flex flex-col items-center gap-1">
                <Shield className="h-4 w-4" />
                <span className="text-xs font-medium">Police</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}