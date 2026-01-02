import { useState, useCallback } from 'react';
import { AlertTriangle, Phone, X, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from './ConfirmDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SOSButtonProps {
  driverId: string;
  tripId?: string;
  vehicleId?: string;
  location?: {
    lat: number;
    lng: number;
  } | null;
}

export function SOSButton({ driverId, tripId, vehicleId, location }: SOSButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const { toast } = useToast();

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

      {/* SOS Button - positioned in header area but not easy to tap accidentally */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full border-2 border-destructive bg-background hover:bg-destructive/10 shadow-lg"
        onClick={() => setShowConfirm(true)}
        aria-label="SOS Emergency Button"
      >
        <AlertTriangle className="w-6 h-6 text-destructive" />
      </Button>

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
