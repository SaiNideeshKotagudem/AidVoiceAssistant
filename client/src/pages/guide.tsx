import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import AppHeader from '@/components/app-header';
import BottomNavigation from '@/components/bottom-navigation';
import { useEmergencyProtocols } from '@/hooks/use-emergency-protocols';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { getAllEmergencyProtocols } from '@/data/emergency-protocols';
import { Shield, Search, BookOpen, AlertTriangle, Play, Pause, Volume2 } from 'lucide-react';

export default function Guide() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  
  const { 
    allProtocols, 
    activateProtocol, 
    getProtocolsByCategory,
    getProtocolsBySeverity,
    searchProtocols 
  } = useEmergencyProtocols();
  
  const { accessibilitySettings, announceToScreenReader } = useAccessibility();
  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  // Get server protocols
  const { data: serverProtocols } = useQuery({
    queryKey: ['/api/emergency-protocols'],
    staleTime: 5 * 60 * 1000,
  });

  const protocols = [...getAllEmergencyProtocols(), ...(serverProtocols || [])];

  const filteredProtocols = searchQuery 
    ? searchProtocols(searchQuery)
    : selectedCategory === 'all' 
      ? protocols
      : getProtocolsByCategory(selectedCategory);

  const categories = [
    { id: 'all', name: 'All Protocols', icon: BookOpen },
    { id: 'medical', name: 'Medical', icon: Shield },
    { id: 'natural', name: 'Natural Disasters', icon: AlertTriangle },
    { id: 'structural', name: 'Structural', icon: Shield },
  ];

  const severityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  const handleProtocolSelect = (protocol: any) => {
    setSelectedProtocol(protocol.id);
    announceToScreenReader(`Selected ${protocol.name} protocol`, 'polite');
  };

  const handleReadProtocol = (protocol: any) => {
    if (isSpeaking) {
      stop();
      setIsReading(false);
    } else {
      const text = `${protocol.name}. ${protocol.description}. Instructions: ${protocol.instructions.steps.join('. ')}.`;
      speak(text);
      setIsReading(true);
    }
  };

  const handleActivateProtocol = (protocol: any) => {
    activateProtocol(protocol.type);
    announceToScreenReader(`${protocol.name} protocol activated`, 'assertive');
  };

  useEffect(() => {
    announceToScreenReader('Emergency protocols guide loaded', 'polite');
  }, [announceToScreenReader]);

  const selectedProtocolData = protocols.find(p => p.id === selectedProtocol);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-6 pb-20">
        <div className="flex items-center gap-4 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Emergency Protocols</h1>
            <p className="text-lg text-muted-foreground">Comprehensive emergency response guidance</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Protocols List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search and Filter */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search emergency protocols..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  aria-label="Search emergency protocols"
                />
              </div>
              
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid w-full grid-cols-4">
                  {categories.map((category) => (
                    <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                      <category.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{category.name}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Protocol Cards */}
            <div className="space-y-4">
              {filteredProtocols.map((protocol) => (
                <Card 
                  key={protocol.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedProtocol === protocol.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleProtocolSelect(protocol)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{protocol.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {protocol.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={severityColors[protocol.severity as keyof typeof severityColors]}>
                          {protocol.severity}
                        </Badge>
                        <Badge variant="outline">
                          {protocol.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReadProtocol(protocol);
                        }}
                        className="flex items-center gap-2"
                      >
                        {isSpeaking && isReading ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                        {isSpeaking && isReading ? 'Pause' : 'Read Aloud'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActivateProtocol(protocol);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Activate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Protocol Details */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Protocol Details</CardTitle>
                <CardDescription>
                  {selectedProtocolData ? 'Emergency response instructions' : 'Select a protocol to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedProtocolData ? (
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Emergency Type</h3>
                        <p className="text-sm text-muted-foreground">{selectedProtocolData.name}</p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-semibold mb-2">Instructions</h3>
                        <ol className="space-y-2">
                          {selectedProtocolData.instructions.steps.map((step, index) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      
                      {selectedProtocolData.instructions.warnings && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold mb-2 text-destructive">Warnings</h3>
                            <ul className="space-y-1">
                              {selectedProtocolData.instructions.warnings.map((warning: string, index: number) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                                  <span>{warning}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                      
                      {selectedProtocolData.instructions.supplies && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold mb-2">Recommended Supplies</h3>
                            <ul className="space-y-1">
                              {selectedProtocolData.instructions.supplies.map((supply: string, index: number) => (
                                <li key={index} className="text-sm text-muted-foreground">
                                  • {supply}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                      
                      <Separator />
                      
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleActivateProtocol(selectedProtocolData)}
                        >
                          Activate Protocol
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleReadProtocol(selectedProtocolData)}
                        >
                          {isSpeaking && isReading ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select an emergency protocol to view detailed instructions
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
