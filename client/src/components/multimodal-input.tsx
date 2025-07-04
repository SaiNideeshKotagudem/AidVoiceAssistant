import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCamera } from '@/hooks/use-camera';
import { useAccessibility } from '@/hooks/use-accessibility';
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';
import { 
  Camera, 
  Upload, 
  Keyboard, 
  Globe, 
  Send,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';

interface MultimodalInputProps {
  onTextSubmit: (text: string) => void;
  onImageCapture: (imageData: string | Blob) => void;
  onTranslationRequest: (text: string, language: string) => void;
}

export default function MultimodalInput({ 
  onTextSubmit, 
  onImageCapture, 
  onTranslationRequest 
}: MultimodalInputProps) {
  const [textInput, setTextInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { 
    isActive: isCameraActive, 
    start: startCamera, 
    stop: stopCamera,
    capturePhoto,
    videoRef,
    error: cameraError,
    isSupported: isCameraSupported
  } = useCamera();

  const { announceToScreenReader, triggerVibration } = useAccessibility();
  const { supportedLanguages, isTranslating } = useTranslation();

  const handleTextSubmit = () => {
    if (!textInput.trim()) {
      toast({
        title: "No Text",
        description: "Please enter text to analyze",
        variant: "destructive",
      });
      return;
    }

    onTextSubmit(textInput);
    announceToScreenReader(`Text submitted: ${textInput}`, 'polite');
    setTextInput('');
  };

  const handleCameraCapture = async () => {
    if (!isCameraActive) {
      try {
        await startCamera();
        announceToScreenReader('Camera activated', 'polite');
      } catch (error) {
        toast({
          title: "Camera Error",
          description: "Could not access camera",
          variant: "destructive",
        });
      }
      return;
    }

    try {
      setIsAnalyzing(true);
      const photoBlob = await capturePhoto();
      
      if (photoBlob) {
        onImageCapture(photoBlob);
        announceToScreenReader('Photo captured and analyzing', 'polite');
        triggerVibration([200]);
        stopCamera();
      } else {
        toast({
          title: "Capture Failed",
          description: "Could not capture photo",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Capture Error",
        description: "Failed to capture photo",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    onImageCapture(file);
    announceToScreenReader('Image uploaded for analysis', 'polite');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  const handleTranslationRequest = () => {
    if (!textInput.trim()) {
      toast({
        title: "No Text",
        description: "Please enter text to translate",
        variant: "destructive",
      });
      return;
    }

    onTranslationRequest(textInput, selectedLanguage);
    announceToScreenReader(`Translation requested to ${selectedLanguage}`, 'polite');
  };

  return (
    <section className="mb-8">
      <h3 className="text-xl font-bold mb-4">Additional Input Methods</h3>
      <div className="grid md:grid-cols-3 gap-6">
        {/* Image Recognition */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Image Recognition
            </CardTitle>
            <CardDescription>
              Capture or upload emergency scene
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Camera Preview */}
              {isCameraActive && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-48 bg-black rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-2 border-white rounded-lg w-32 h-32 opacity-50" />
                  </div>
                </div>
              )}

              {/* Upload Drop Zone */}
              {!isCameraActive && (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <ImageIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Capture or upload emergency scene
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="image-upload"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {isCameraSupported && (
                  <Button
                    onClick={handleCameraCapture}
                    disabled={isAnalyzing}
                    className="flex-1 flex items-center gap-2"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    {isCameraActive ? 'Capture' : 'Camera'}
                  </Button>
                )}
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex-1 flex items-center gap-2"
                  disabled={isAnalyzing}
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </div>

              {cameraError && (
                <p className="text-sm text-destructive">{cameraError}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Text Input */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-primary" />
              Text Input
            </CardTitle>
            <CardDescription>
              Describe your emergency situation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Describe your emergency situation..."
              className="min-h-[100px] resize-none"
              aria-label="Emergency description text input"
            />
            
            <Button
              onClick={handleTextSubmit}
              disabled={!textInput.trim()}
              className="w-full flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Analyze Text
            </Button>
          </CardContent>
        </Card>

        {/* Translation */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Translation
            </CardTitle>
            <CardDescription>
              Translate emergency information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select target language" />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              onClick={handleTranslationRequest}
              disabled={!textInput.trim() || isTranslating}
              className="w-full flex items-center gap-2"
            >
              {isTranslating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
              {isTranslating ? 'Translating...' : 'Translate'}
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Enter text above and select target language
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
