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
      gradient: 'from-red-500 to-red-600',
      hoverGradient: 'hover:from-red-600 hover:to-red-700',
      ariaLabel: 'Call 911 emergency services'
    },
    {
      id: 'camera',
      label: 'Quick Camera',
      icon: Camera,
      action: () => handleQuickAction('camera', onQuickCamera),
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700',
      ariaLabel: 'Take emergency photo'
    },
    {
      id: 'voice',
      label: 'Quick Voice',
      icon: Mic,
      action: () => handleQuickAction('voice assistance', onQuickVoice),
      gradient: 'from-green-500 to-green-600',
      hoverGradient: 'hover:from-green-600 hover:to-green-700',
      ariaLabel: 'Start voice emergency assistance'
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* FAB Menu Items */}
        <div className={`absolute bottom-full right-0 mb-4 space-y-3 transition-all duration-500 ease-out ${
          isOpen 
            ? 'opacity-100 pointer-events-auto translate-y-0 scale-100' 
            : 'opacity-0 pointer-events-none translate-y-8 scale-95'
        }`}>
          {fabActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <div
                key={action.id}
                className="flex items-center gap-4"
                style={{
                  animationDelay: isOpen ? `${index * 100}ms` : '0ms',
                  transform: isOpen ? 'translateX(0)' : 'translateX(20px)',
                  transition: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1) ${index * 50}ms`
                }}
              >
                {/* Action Label */}
                <div className={`px-4 py-2 bg-black/90 text-white text-sm rounded-xl whitespace-nowrap shadow-lg backdrop-blur-sm transition-all duration-300 ${
                  isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                }`}>
                  {action.label}
                </div>
                
                {/* Action Button */}
                <Button
                  onClick={action.action}
                  className={`
                    w-14 h-14 rounded-full shadow-2xl transition-all duration-500 
                    bg-gradient-to-r ${action.gradient} ${action.hoverGradient} text-white border-2 border-white/20
                    hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/30
                    ${isOpen ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}
                  `}
                  aria-label={action.ariaLabel}
                  style={{
                    transitionDelay: isOpen ? `${index * 100}ms` : '0ms',
                  }}
                >
                  <IconComponent className="h-6 w-6 drop-shadow-lg" />
                </Button>
              </div>
            );
          })}
        </div>
        
        {/* Main FAB */}
        <Button
          onClick={toggleFAB}
          className={`
            w-16 h-16 rounded-full shadow-2xl transition-all duration-500 
            ${isOpen 
              ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rotate-45 scale-110' 
              : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 emergency-pulse'
            } 
            text-white border-2 border-white/20
            hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300/50
          `}
          aria-label={isOpen ? 'Close emergency menu' : 'Open emergency quick actions'}
          aria-expanded={isOpen}
        >
          <div className="relative">
            {isOpen ? (
              <X className="h-8 w-8 drop-shadow-lg" />
            ) : (
              <Plus className="h-8 w-8 drop-shadow-lg" />
            )}
          </div>
        </Button>

        {/* Emergency Indicator */}
        {!isOpen && (
          <div className="absolute -top-2 -right-2">
            <div className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
              <AlertTriangle className="h-3 w-3 text-white drop-shadow" />
            </div>
          </div>
        )}

        {/* Ripple Effect */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
        )}
      </div>

      {/* Overlay for closing menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[-1] bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}