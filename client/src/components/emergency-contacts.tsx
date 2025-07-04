import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useDeviceStatus } from '@/hooks/use-device-status';
import { EmergencyContact } from '@/types/emergency';
import { 
  Phone, 
  Ambulance, 
  Flame, 
  Shield, 
  MapPin,
  Search,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmergencyContactsProps {
  onContactCall: (contact: EmergencyContact) => void;
}

export default function EmergencyContacts({ onContactCall }: EmergencyContactsProps) {
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const { announceToScreenReader, triggerVibration, showVisualAlert } = useAccessibility();
  const { deviceCapabilities } = useDeviceStatus();

  // Fetch emergency contacts
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['/api/emergency-contacts', selectedCountry],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'fire': return <Flame className="h-6 w-6" />;
      case 'medical': return <Ambulance className="h-6 w-6" />;
      case 'police': return <Shield className="h-6 w-6" />;
      default: return <Phone className="h-6 w-6" />;
    }
  };

  const getContactColor = (type: string) => {
    switch (type) {
      case 'fire': return 'bg-red-500 hover:bg-red-600';
      case 'medical': return 'bg-red-500 hover:bg-red-600';
      case 'police': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const filteredContacts = contacts.filter((contact: EmergencyContact) => {
    const matchesType = selectedType === 'all' || contact.type === selectedType;
    const matchesSearch = searchQuery === '' || 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phoneNumber.includes(searchQuery);
    return matchesType && matchesSearch;
  });

  const handleEmergencyCall = (contact: EmergencyContact) => {
    // Provide immediate feedback
    announceToScreenReader(`Calling ${contact.name}`, 'assertive');
    triggerVibration([200, 100, 200, 100, 200]);
    showVisualAlert(`Calling ${contact.name}`, 'warning');

    // Log the call attempt
    onContactCall(contact);

    // Attempt to make the call if supported
    if ('navigator' in window && 'userAgent' in navigator) {
      try {
        // Try to initiate call on mobile devices
        window.location.href = `tel:${contact.phoneNumber}`;
      } catch (error) {
        // Fallback for devices that don't support tel: links
        toast({
          title: "Call Information",
          description: `Call ${contact.name} at ${contact.phoneNumber}`,
          duration: 10000,
        });
      }
    } else {
      toast({
        title: "Emergency Contact",
        description: `Call ${contact.name} at ${contact.phoneNumber}`,
        duration: 10000,
      });
    }
  };

  const handleQuickDial = (service: string) => {
    const contact = filteredContacts.find((c: EmergencyContact) => c.type === service);
    if (contact) {
      handleEmergencyCall(contact);
    } else {
      // Fallback to general emergency number
      const generalContact = filteredContacts.find((c: EmergencyContact) => c.type === 'general');
      if (generalContact) {
        handleEmergencyCall(generalContact);
      }
    }
  };

  const countries = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'EU', name: 'European Union', flag: '🇪🇺' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  ];

  const contactTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'general', label: 'General Emergency' },
    { value: 'fire', label: 'Fire Department' },
    { value: 'medical', label: 'Medical Emergency' },
    { value: 'police', label: 'Police' },
  ];

  return (
    <section className="mb-8">
      <h3 className="text-xl font-bold mb-4">Emergency Contacts</h3>

      {/* Quick Emergency Contacts */}
      <Card className="mb-6 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Quick Emergency Access
          </CardTitle>
          <CardDescription className="text-red-600 dark:text-red-400">
            Immediate access to critical emergency services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={() => handleQuickDial('general')}
              className="bg-red-600 hover:bg-red-700 text-white p-4 h-auto flex-col gap-2 shadow-lg hover:shadow-xl transition-all"
              aria-label="Call general emergency services"
            >
              <Phone className="h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold text-sm">Emergency</p>
                <p className="text-xs opacity-90">911 / Local</p>
              </div>
            </Button>
            
            <Button
              onClick={() => handleQuickDial('medical')}
              className="bg-red-600 hover:bg-red-700 text-white p-4 h-auto flex-col gap-2 shadow-lg hover:shadow-xl transition-all"
              aria-label="Call medical emergency services"
            >
              <Ambulance className="h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold text-sm">Medical</p>
                <p className="text-xs opacity-90">Ambulance</p>
              </div>
            </Button>
            
            <Button
              onClick={() => handleQuickDial('fire')}
              className="bg-red-600 hover:bg-red-700 text-white p-4 h-auto flex-col gap-2 shadow-lg hover:shadow-xl transition-all"
              aria-label="Call fire department"
            >
              <Flame className="h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold text-sm">Fire Dept</p>
                <p className="text-xs opacity-90">Fire & Rescue</p>
              </div>
            </Button>
            
            <Button
              onClick={() => handleQuickDial('police')}
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 h-auto flex-col gap-2 shadow-lg hover:shadow-xl transition-all"
              aria-label="Call police"
            >
              <Shield className="h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold text-sm">Police</p>
                <p className="text-xs opacity-90">Law Enforcement</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact Directory</CardTitle>
          <CardDescription>
            Comprehensive emergency contacts for your location
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Country/Region</label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {contactTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts or phone numbers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Contact List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading emergency contacts...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-8">
                <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No emergency contacts found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              filteredContacts.map((contact: EmergencyContact) => (
                <Card key={contact.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full text-white ${getContactColor(contact.type)}`}>
                        {getContactIcon(contact.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-base">{contact.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {contact.phoneNumber}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {contact.type}
                          </Badge>
                          {contact.region && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {contact.region}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleEmergencyCall(contact)}
                      className={`${getContactColor(contact.type)} text-white flex items-center gap-2`}
                      aria-label={`Call ${contact.name}`}
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Location Notice */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-800 dark:text-blue-200">
                  Location-Based Contacts
                </h5>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  Emergency contact numbers may vary by location. Always verify local emergency numbers 
                  for your specific area. In most countries, there is a universal emergency number 
                  (911 in US, 112 in EU, etc.).
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
