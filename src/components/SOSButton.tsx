import { useState, useCallback, useRef } from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from './ConfirmDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface SOSButtonProps {
  driverId: string;
  tripId?: string;
  vehicleId?: string;
  location?: {
    lat: number;
    lng: number;
  } | null;
}

const HOLD_DURATION = 1500; // 1.5 seconds to trigger

export function SOSButton({ driverId, tripId, vehicleId, location }: SOSButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const { toast } = useToast();
  
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const handleHoldStart = useCallback(() => {
    setIsHolding(true);
    setHoldProgress(0);
    
    const startTime = Date.now();
    
    // Update progress every 50ms
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);
    }, 50);
    
    // Trigger after hold duration
    holdTimerRef.current = setTimeout(() => {
      clearTimers();
      setIsHolding(false);
      setHoldProgress(0);
      setShowConfirm(true);
    }, HOLD_DURATION);
  }, [clearTimers]);

  const handleHoldEnd = useCallback(() => {
    clearTimers();
    setIsHolding(false);
    setHoldProgress(0);
  }, [clearTimers]);

  const handleSOS = useCallback(async () => {
    setIsSending(true);
    
    try {
      const { error } = await supabase.from('safety_log').insert({
        driver_id: driverId,
        trip_id: tripId || null,
        vehicle_id: vehicleId || null,
        latitude: location?.lat || null,
        longitude: location?.lng || null,
        status: 'active',
        triggered_by: 'driver',
      });

      if (error) throw error;

      setSosActive(true);
      setShowConfirm(false);
      
      toast({
        title: 'SOS Sent',
        description: 'Control center has been alerted. Stay calm.',
        duration: 5000,
      });

    } catch (err) {
      console.error('Failed to send SOS:', err);
      toast({
        title: 'SOS Failed',
        description: 'Could not send alert. Please call emergency services.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  }, [driverId, tripId, vehicleId, location, toast]);

  return (
    <>
      {/* SOS Active Banner */}
      {sosActive && (
        <div className="fixed top-16 left-0 right-0 z-50 bg-destructive text-destructive-foreground py-3 px-4 flex items-center justify-between safe-area-top animate-fade-in">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <span className="font-semibold">SOS Sent – Control center alerted</span>
          </div>
          <button
            onClick={() => setSosActive(false)}
            className="p-1 hover:bg-destructive-foreground/20 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SOS Button - requires hold to activate */}
      <div className="fixed bottom-6 left-6 z-40">
        <Button
          variant="outline"
          size="icon"
          className={`w-14 h-14 rounded-full border-2 border-destructive bg-background shadow-lg transition-all select-none touch-none ${
            isHolding ? 'scale-110 bg-destructive/20' : 'hover:bg-destructive/10'
          }`}
          onMouseDown={handleHoldStart}
          onMouseUp={handleHoldEnd}
          onMouseLeave={handleHoldEnd}
          onTouchStart={handleHoldStart}
          onTouchEnd={handleHoldEnd}
          onTouchCancel={handleHoldEnd}
          aria-label="Hold for SOS Emergency"
        >
          <AlertTriangle className={`w-6 h-6 text-destructive ${isHolding ? 'animate-pulse' : ''}`} />
        </Button>
        
        {/* Hold progress indicator */}
        {isHolding && (
          <div className="absolute -bottom-2 left-0 right-0 px-1">
            <Progress value={holdProgress} className="h-1.5 bg-destructive/20" />
          </div>
        )}
        
        {/* Hold hint */}
        {isHolding && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-destructive bg-background px-2 py-1 rounded shadow">
            Hold to activate SOS
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Emergency SOS"
        description="This will alert the control center immediately. Use only in a real emergency."
        confirmLabel={isSending ? 'Sending...' : 'Send SOS Alert'}
        onConfirm={handleSOS}
        variant="destructive"
        isLoading={isSending}
      />
    </>
  );
}