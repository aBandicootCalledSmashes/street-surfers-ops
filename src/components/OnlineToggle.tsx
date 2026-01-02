import { useState, useEffect } from 'react';
import { Wifi, WifiOff, MapPin, MapPinOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface OnlineToggleProps {
  isOnline: boolean;
  onToggle: (isOnline: boolean) => Promise<{ error: unknown } | void>;
  isTracking?: boolean;
  locationError?: string | null;
}

export function OnlineToggle({ isOnline, onToggle, isTracking, locationError }: OnlineToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [localOnline, setLocalOnline] = useState(isOnline);

  useEffect(() => {
    setLocalOnline(isOnline);
  }, [isOnline]);

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);
    setLocalOnline(checked);
    
    try {
      await onToggle(checked);
    } catch {
      // Revert on error
      setLocalOnline(!checked);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
        <div className="flex items-center gap-3">
          {localOnline ? (
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
              <Wifi className="w-5 h-5 text-success" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <WifiOff className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <Label htmlFor="online-toggle" className="text-base font-semibold cursor-pointer">
              {localOnline ? 'Online' : 'Offline'}
            </Label>
            <p className="text-sm text-muted-foreground">
              {localOnline ? 'Visible to dispatch & tracking active' : 'Hidden from dispatch'}
            </p>
          </div>
        </div>
        
        <Switch
          id="online-toggle"
          checked={localOnline}
          onCheckedChange={handleToggle}
          disabled={isUpdating}
          className="data-[state=checked]:bg-success"
        />
      </div>

      {/* GPS Status indicator when online */}
      {localOnline && (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
          locationError 
            ? 'bg-warning/10 text-warning' 
            : isTracking 
              ? 'bg-success/10 text-success' 
              : 'bg-muted text-muted-foreground'
        }`}>
          {locationError ? (
            <>
              <MapPinOff className="w-4 h-4" />
              <span>Location disabled – enable GPS for tracking</span>
            </>
          ) : isTracking ? (
            <>
              <MapPin className="w-4 h-4 animate-pulse" />
              <span>GPS streaming active</span>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              <span>Starting GPS...</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
