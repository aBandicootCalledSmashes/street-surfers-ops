import { useState, useEffect, useCallback, useRef } from 'react';
import { DriverLocation } from '@/types/trip';
import { useToast } from '@/hooks/use-toast';

interface UseDriverLocationOptions {
  driverId: string;
  enabled: boolean;
  updateInterval?: number; // ms, default 10000 (10s)
}

export function useDriverLocation({ driverId, enabled, updateInterval = 10000 }: UseDriverLocationOptions) {
  const [location, setLocation] = useState<DriverLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Request permission and start tracking
  const requestPermission = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by this device');
      toast({
        title: 'Location Not Supported',
        description: 'Your device does not support GPS location.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Check permission status
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(permission.state);
        
        permission.addEventListener('change', () => {
          setPermissionStatus(permission.state);
        });
      }

      // Request location to trigger permission prompt
      return new Promise<boolean>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => {
            setError(null);
            resolve(true);
          },
          (err) => {
            let errorMessage = 'Failed to get location';
            if (err.code === err.PERMISSION_DENIED) {
              errorMessage = 'Location permission denied. Please enable in settings.';
            } else if (err.code === err.POSITION_UNAVAILABLE) {
              errorMessage = 'Location unavailable. Please check GPS settings.';
            } else if (err.code === err.TIMEOUT) {
              errorMessage = 'Location request timed out.';
            }
            setError(errorMessage);
            toast({
              title: 'Location Error',
              description: errorMessage,
              variant: 'destructive',
            });
            resolve(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });
    } catch {
      setError('Failed to request location permission');
      return false;
    }
  }, [toast]);

  // Send location to backend (placeholder for now)
  const sendLocationToBackend = useCallback(async (loc: DriverLocation) => {
    // TODO: Replace with actual Supabase call when backend is ready
    console.log('[Location Stream]', {
      driverId: loc.driverId,
      lat: loc.lat.toFixed(6),
      lng: loc.lng.toFixed(6),
      accuracy: `${loc.accuracy.toFixed(0)}m`,
      timestamp: loc.timestamp,
    });
    
    // Future implementation:
    // await supabase.from('driver_locations').upsert({
    //   driver_id: loc.driverId,
    //   lat: loc.lat,
    //   lng: loc.lng,
    //   accuracy: loc.accuracy,
    //   updated_at: loc.timestamp,
    // });
  }, []);

  // Start location tracking
  const startTracking = useCallback(() => {
    if (!enabled || !driverId) return;
    if (watchIdRef.current !== null) return; // Already tracking

    const handlePosition = (position: GeolocationPosition) => {
      const newLocation: DriverLocation = {
        driverId,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString(),
      };
      
      setLocation(newLocation);
      setError(null);
      sendLocationToBackend(newLocation);
    };

    const handleError = (err: GeolocationPositionError) => {
      let errorMessage = 'Location error';
      if (err.code === err.PERMISSION_DENIED) {
        errorMessage = 'Location permission denied';
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        errorMessage = 'GPS unavailable';
      }
      setError(errorMessage);
    };

    // Use watchPosition for continuous updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      handleError,
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    // Also set up interval for periodic backend updates
    intervalRef.current = setInterval(() => {
      if (location) {
        sendLocationToBackend(location);
      }
    }, updateInterval);

    setIsTracking(true);
  }, [enabled, driverId, location, sendLocationToBackend, updateInterval]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Auto-start/stop based on enabled
  useEffect(() => {
    if (enabled && driverId) {
      requestPermission().then((granted) => {
        if (granted) {
          startTracking();
        }
      });
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [enabled, driverId, requestPermission, startTracking, stopTracking]);

  return {
    location,
    error,
    isTracking,
    permissionStatus,
    requestPermission,
    startTracking,
    stopTracking,
  };
}

// Request push notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}
