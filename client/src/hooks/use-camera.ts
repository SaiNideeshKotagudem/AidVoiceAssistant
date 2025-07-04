import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CameraConstraints {
  video?: boolean | MediaTrackConstraints;
  audio?: boolean | MediaTrackConstraints;
}

export const useCamera = (constraints: CameraConstraints = { video: true, audio: false }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsSupported(!!navigator.mediaDevices?.getUserMedia);
    
    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          setDevices(videoDevices);
          if (videoDevices.length > 0 && !selectedDeviceId) {
            setSelectedDeviceId(videoDevices[0].deviceId);
          }
        })
        .catch(err => {
          console.error('Error enumerating devices:', err);
        });
    }
  }, [selectedDeviceId]);

  const start = useCallback(async () => {
    if (!isSupported) {
      const errorMsg = 'Camera access is not supported in this browser';
      setError(errorMsg);
      toast({
        title: "Camera Not Supported",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    try {
      setError(null);
      
      const videoConstraints = typeof constraints.video === 'object' 
        ? { ...constraints.video, deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined }
        : { deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined };

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: constraints.video ? videoConstraints : false,
        audio: constraints.audio || false,
      });

      setStream(mediaStream);
      setIsActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

    } catch (err) {
      const error = err as Error;
      let errorMessage = 'Failed to access camera';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera access denied. Please allow camera access.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found. Please connect a camera.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera does not meet the required constraints.';
      }

      setError(errorMessage);
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [isSupported, constraints, selectedDeviceId, toast]);

  const stop = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsActive(false);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  const capturePhoto = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!videoRef.current || !isActive) {
        resolve(null);
        return;
      }

      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  }, [isActive]);

  const capturePhotoAsDataURL = useCallback((): string | null => {
    if (!videoRef.current || !isActive) {
      return null;
    }

    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }

    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.9);
  }, [isActive]);

  const switchCamera = useCallback((deviceId: string) => {
    setSelectedDeviceId(deviceId);
    if (isActive) {
      stop();
      // Restart with new device after a short delay
      setTimeout(() => start(), 100);
    }
  }, [isActive, stop, start]);

  const toggle = useCallback(() => {
    if (isActive) {
      stop();
    } else {
      start();
    }
  }, [isActive, start, stop]);

  return {
    stream,
    isActive,
    error,
    isSupported,
    devices,
    selectedDeviceId,
    videoRef,
    start,
    stop,
    capturePhoto,
    capturePhotoAsDataURL,
    switchCamera,
    toggle,
  };
};
