import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAccessibility } from '@/hooks/use-accessibility';
import { 
  Plus, 
  X, 
  Phone, 
  Camera, 
  Mic,
  AlertTriangle,
  Zap
} from 'lucide-react';

interface FloatingActionButtonProps {
  onQuickCall: () => void;
  onQuickVoice: () => void;
  onQuickCamera: () => void;
}

export default function FloatingActionButton({ 
  onQuickCall, 
  onQuickVoice, 
  onQuickCamera 
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { announceToScreenReader, triggerVibration } = useAccessibility();

  const toggleFAB = () => {
    setIsOpen(!isOpen);
    announceToScreenReader(
      isOpen ? 'Emergency menu closed' : 'Emergency menu opened',
      'polite'
    );
    triggerVibration([100]);
  };

  const handleQuickAction = (action: string, callback: () => void) => {
    announceToScreenReader(`Quick ${action} activated`, 'assertive');
    triggerVibration([200, 100, 200]);
    callback();
    setIsOpen(false);
  };

  const fabActions = [
    {
      id: 'call',
      label: 'Quick Call 911',
      icon: Phone,
      action: () => handleQuickAction('emergency call', onQuickCall),
      color: 'bg-red-500 hover:bg-red-600',
      ariaLabel: 'Call 911 emergency services'
    },
    {
      id: 'camera',
      label: 'Quick Camera',
      icon: Camera,
      action: () => handleQuickAction('camera', onQuickCamera),
      color: 'bg-blue-500 hover:bg-blue-600',
      ariaLabel: 'Take emergency photo'
    },
    {
      id: 'voice',
      label: 'Quick Voice',
      icon: Mic,
      action: () => handleQuickAction('voice assistance', onQuickVoice),
      color: 'bg-green-500 hover:bg-green-600',
      ariaLabel: 'Start voice emergency assistance'
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* FAB Menu Items */}
        <div className={`absolute bottom-full right-0 mb-3 space-y-3 transition-all duration-300 ${
          isOpen 
            ? 'opacity-100 pointer-events-auto translate-y-0' 
            : 'opacity-0 pointer-events-none translate-y-4'
        }`}>
          {fabActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <div
                key={action.id}
                className="flex items-center gap-3"
                style={{
                  animationDelay: isOpen ? `${index * 50}ms` : '0ms',
                }}
              >
                {/* Action Label */}
                <div className={`px-3 py-2 bg-black/80 text-white text-sm rounded-lg whitespace-nowrap transition-all duration-300 ${
                  isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                }`}>
                  {action.label}
                </div>
                
                {/* Action Button */}
                <Button
                  onClick={action.action}
                  className={`
                    w-12 h-12 rounded-full shadow-lg transition-all duration-300 
                    ${action.color} text-white border-2 border-white
                    hover:scale-110 focus:outline-none focus:ring-4 focus:ring-white/30
                    ${isOpen ? 'scale-100' : 'scale-0'}
                  `}
                  aria-label={action.ariaLabel}
                  style={{
                    transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
                  }}
                >
                  <IconComponent className="h-5 w-5" />
                </Button>
              </div>
            );
          })}
        </div>
        
        {/* Main FAB */}
        <Button
          onClick={toggleFAB}
          className={`
            w-16 h-16 rounded-full shadow-lg transition-all duration-300 
            ${isOpen 
              ? 'bg-gray-600 hover:bg-gray-700 rotate-45' 
              : 'bg-red-500 hover:bg-red-600'
            } 
            text-white border-2 border-white
            hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300
          `}
          aria-label={isOpen ? 'Close emergency menu' : 'Open emergency quick actions'}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X className="h-8 w-8" />
          ) : (
            <Plus className="h-8 w-8" />
          )}
        </Button>

        {/* Emergency Indicator */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1">
            <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
              <AlertTriangle className="h-2 w-2 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Overlay for closing menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
