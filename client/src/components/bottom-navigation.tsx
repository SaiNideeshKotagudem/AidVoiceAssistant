import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useEmergencyProtocols } from '@/hooks/use-emergency-protocols';
import { 
  Home, 
  BookOpen, 
  Globe, 
  Settings,
  AlertTriangle
} from 'lucide-react';

export default function BottomNavigation() {
  const [location, navigate] = useLocation();
  const { announceToScreenReader } = useAccessibility();
  const { currentProtocol } = useEmergencyProtocols();

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/',
      description: 'Main emergency interface'
    },
    {
      id: 'guide',
      label: 'Guide',
      icon: BookOpen,
      path: '/guide',
      description: 'Emergency protocols and instructions'
    },
    {
      id: 'translate',
      label: 'Translate',
      icon: Globe,
      path: '/translate',
      description: 'Real-time translation'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      description: 'App configuration and preferences'
    }
  ];

  const handleNavigation = (item: typeof navigationItems[0]) => {
    navigate(item.path);
    announceToScreenReader(`Navigated to ${item.label}: ${item.description}`, 'polite');
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location === '/';
    }
    return location.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-40 safe-area-inset-bottom">
      <div className="max-w-7xl mx-auto px-4">
        {/* Emergency Status Bar */}
        {currentProtocol && (
          <div className="px-4 py-2 bg-red-500 text-white text-center">
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {currentProtocol.name} Protocol Active
              </span>
            </div>
          </div>
        )}
        
        {/* Navigation Items */}
        <div className="flex justify-around py-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.path);
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => handleNavigation(item)}
                className={`
                  flex-col gap-1 h-auto py-2 px-3 transition-colors duration-200
                  ${active 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  }
                `}
                aria-label={`${item.label}: ${item.description}`}
                aria-current={active ? 'page' : undefined}
              >
                <div className="relative">
                  <IconComponent className="h-5 w-5" />
                  
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                  )}
                  
                  {/* Emergency indicator for home */}
                  {item.id === 'home' && currentProtocol && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 w-3 h-3 p-0 text-xs"
                    >
                      !
                    </Badge>
                  )}
                </div>
                
                <span className="text-xs font-medium leading-none">
                  {item.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
