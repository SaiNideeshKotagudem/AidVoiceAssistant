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
  AlertTriangle 
} from 'lucide-react';

interface QuickActionsProps {
  onActionSelected: (type: string) => void;
}

const emergencyActions = [
  {
    id: 'fire',
    name: 'Fire Emergency',
    icon: Flame,
    color: 'bg-red-500 hover:bg-red-600',
    textColor: 'text-white',
    description: 'Fire, smoke, or burning'
  },
  {
    id: 'medical',
    name: 'Medical Emergency',
    icon: Heart,
    color: 'bg-red-500 hover:bg-red-600',
    textColor: 'text-white',
    description: 'Injury, illness, or medical crisis'
  },
  {
    id: 'earthquake',
    name: 'Earthquake',
    icon: Home,
    color: 'bg-orange-500 hover:bg-orange-600',
    textColor: 'text-white',
    description: 'Earthquake or structural damage'
  },
  {
    id: 'flood',
    name: 'Flood Warning',
    icon: Droplets,
    color: 'bg-blue-500 hover:bg-blue-600',
    textColor: 'text-white',
    description: 'Flooding or water emergency'
  },
  {
    id: 'tornado',
    name: 'Tornado',
    icon: Wind,
    color: 'bg-orange-500 hover:bg-orange-600',
    textColor: 'text-white',
    description: 'Tornado or severe weather'
  },
  {
    id: 'accident',
    name: 'Accident',
    icon: Car,
    color: 'bg-yellow-500 hover:bg-yellow-600',
    textColor: 'text-white',
    description: 'Vehicle or other accident'
  },
  {
    id: 'violence',
    name: 'Violence/Crime',
    icon: AlertTriangle,
    color: 'bg-red-600 hover:bg-red-700',
    textColor: 'text-white',
    description: 'Violence, crime, or security threat'
  },
  {
    id: 'general',
    name: 'Other Emergency',
    icon: Phone,
    color: 'bg-gray-500 hover:bg-gray-600',
    textColor: 'text-white',
    description: 'General emergency or other situation'
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

  return (
    <section className="mb-8">
      <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {emergencyActions.map((action) => {
          const IconComponent = action.icon;
          
          return (
            <Button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={`
                ${action.color} ${action.textColor} 
                h-auto p-4 flex-col gap-2 transition-all duration-200 
                hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300
                shadow-lg hover:shadow-xl
              `}
              aria-label={`${action.name}: ${action.description}`}
            >
              <IconComponent className="h-8 w-8" />
              <div className="text-center">
                <p className="font-medium text-sm leading-tight">{action.name}</p>
                <p className="text-xs opacity-90 mt-1 hidden sm:block">
                  {action.description}
                </p>
              </div>
            </Button>
          );
        })}
      </div>
      
      {/* Emergency Contacts Quick Access */}
      <Card className="mt-6 bg-red-50 border-red-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-red-800 text-sm">Emergency Contacts</CardTitle>
          <CardDescription className="text-red-600 text-xs">
            Immediate access to emergency services
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button
              onClick={() => {
                announceToScreenReader('Emergency services contacted', 'assertive');
                triggerVibration([100, 50, 100, 50, 100]);
                // Would trigger actual emergency call if supported
              }}
              className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 h-auto"
            >
              <Phone className="h-3 w-3 mr-1" />
              Call 911
            </Button>
            <Button
              onClick={() => {
                announceToScreenReader('Medical emergency services contacted', 'assertive');
                triggerVibration([100, 50, 100, 50, 100]);
              }}
              className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 h-auto"
            >
              <Heart className="h-3 w-3 mr-1" />
              Medical
            </Button>
            <Button
              onClick={() => {
                announceToScreenReader('Fire department contacted', 'assertive');
                triggerVibration([100, 50, 100, 50, 100]);
              }}
              className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 h-auto"
            >
              <Flame className="h-3 w-3 mr-1" />
              Fire Dept
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
