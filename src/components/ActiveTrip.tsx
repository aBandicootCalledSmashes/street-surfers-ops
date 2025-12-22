import { useState, useCallback } from 'react';
import { Phone, MapPin, Users, Navigation, CheckCircle2, ArrowLeft, MessageCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Trip, TripStatus, PassengerStatus } from '@/types/trip';
import { PassengerActions } from './PassengerActions';
import { LoadingSpinner } from './LoadingSpinner';
import { format } from 'date-fns';

interface ActiveTripProps {
  trip: Trip;
  onBack: () => void;
  onUpdateStatus: (tripId: string, status: TripStatus) => void;
  onUpdatePassengerStatus: (tripId: string, passengerId: string, status: PassengerStatus) => void;
}

export function ActiveTrip({ trip, onBack, onUpdateStatus, onUpdatePassengerStatus }: ActiveTripProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const scheduledTime = new Date(trip.scheduledTime);

  const handleUpdateStatus = useCallback(async (newStatus: TripStatus) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    setUpdateError(null);
    
    try {
      // Simulate network delay for realistic feedback
      await new Promise(resolve => setTimeout(resolve, 300));
      onUpdateStatus(trip.id, newStatus);
    } catch {
      setUpdateError('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, onUpdateStatus, trip.id]);

  const handlePassengerStatusUpdate = useCallback(async (passengerId: string, status: PassengerStatus) => {
    setUpdateError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      onUpdatePassengerStatus(trip.id, passengerId, status);
    } catch {
      setUpdateError('Failed to update passenger status. Please try again.');
      throw new Error('Failed to update passenger status');
    }
  }, [onUpdatePassengerStatus, trip.id]);

  const getActionButton = () => {
    switch (trip.status) {
      case 'assigned':
        return (
          <Button 
            variant="action" 
            size="xl" 
            className="w-full min-h-[64px]"
            onClick={() => handleUpdateStatus('en_route_pickup')}
            disabled={isUpdating}
          >
            {isUpdating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Navigation className="w-6 h-6" />}
            Start Trip to Pickup
          </Button>
        );
      case 'en_route_pickup':
        return (
          <Button 
            variant="action" 
            size="xl" 
            className="w-full min-h-[64px]"
            onClick={() => handleUpdateStatus('arrived_pickup')}
            disabled={isUpdating}
          >
            {isUpdating ? <Loader2 className="w-6 h-6 animate-spin" /> : <MapPin className="w-6 h-6" />}
            Arrived at Pickup
          </Button>
        );
      case 'arrived_pickup':
        // Only show "Start to Drop-off" when passenger is picked up
        if (trip.passenger.status === 'picked_up') {
          return (
            <Button 
              variant="success" 
              size="xl" 
              className="w-full min-h-[64px]"
              onClick={() => handleUpdateStatus('in_progress')}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Navigation className="w-6 h-6" />}
              Start to Drop-off
            </Button>
          );
        }
        // If passenger is failed/cancelled, allow completing the trip
        if (trip.passenger.status === 'failed_pickup' || trip.passenger.status === 'cancelled') {
          return (
            <Button 
              variant="outline" 
              size="xl" 
              className="w-full min-h-[64px]"
              onClick={() => handleUpdateStatus('completed')}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
              End Trip
            </Button>
          );
        }
        return null;
      case 'in_progress':
        // Only allow completing when passenger is dropped off
        if (trip.passenger.status === 'dropped_off' || trip.passenger.status === 'cancelled') {
          return (
            <Button 
              variant="success" 
              size="xl" 
              className="w-full min-h-[64px]"
              onClick={() => handleUpdateStatus('completed')}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
              Complete Trip
            </Button>
          );
        }
        return null;
      default:
        return null;
    }
  };

  const getStatusStep = () => {
    const steps = [
      { key: 'assigned', label: 'Assigned' },
      { key: 'en_route_pickup', label: 'En Route' },
      { key: 'arrived_pickup', label: 'Arrived' },
      { key: 'in_progress', label: 'In Progress' },
      { key: 'completed', label: 'Completed' },
    ];
    const currentIndex = steps.findIndex(s => s.key === trip.status);
    
    return (
      <div className="flex items-center gap-1 mb-6">
        {steps.map((step, index) => (
          <div key={step.key} className="flex-1">
            <div 
              className={`h-2 rounded-full transition-colors ${
                index <= currentIndex 
                  ? index === currentIndex && trip.status !== 'completed'
                    ? 'bg-primary animate-pulse-glow'
                    : 'bg-primary'
                  : 'bg-muted'
              }`}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex-1 p-4 space-y-5 animate-slide-up pb-32">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors min-h-[44px] -ml-1 pl-1 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-base">Back to trips</span>
        </button>

        {getStatusStep()}

        {/* Error Banner */}
        {updateError && (
          <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-destructive text-sm font-medium">{updateError}</p>
          </div>
        )}

        {/* Time & Passenger Info */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Scheduled Time</p>
              <p className="text-2xl font-bold">{format(scheduledTime, 'HH:mm')}</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-lg">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="font-bold text-lg">{trip.passenger.count}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <p className="text-sm text-muted-foreground">Passenger</p>
              <p className="text-lg font-semibold">{trip.passenger.name}</p>
            </div>
            <div className="flex gap-2">
              <a 
                href={`tel:${trip.passenger.phone}`}
                className="p-3.5 bg-primary rounded-lg hover:bg-primary/90 transition-colors active:scale-95 min-w-[48px] min-h-[48px] flex items-center justify-center"
              >
                <Phone className="w-5 h-5" />
              </a>
              <a 
                href={`sms:${trip.passenger.phone}`}
                className="p-3.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors active:scale-95 min-w-[48px] min-h-[48px] flex items-center justify-center"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Passenger Actions - Show when at pickup or in progress */}
        {(trip.status === 'arrived_pickup' || trip.status === 'in_progress' || trip.status === 'en_route_pickup') && (
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Passenger Status
            </p>
            <PassengerActions
              passenger={trip.passenger}
              tripStatus={trip.status}
              onUpdatePassengerStatus={handlePassengerStatusUpdate}
              isLoading={isUpdating}
            />
          </div>
        )}

        {/* Locations */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <p className="text-sm font-semibold text-primary uppercase tracking-wide">Pickup</p>
            </div>
            <p className="text-lg font-medium pl-5">{trip.pickup.address}</p>
            {trip.pickup.landmark && (
              <p className="text-sm text-muted-foreground pl-5 mt-1">{trip.pickup.landmark}</p>
            )}
          </div>

          <div className="relative pl-1.5">
            <div className="absolute left-[5px] top-0 bottom-0 w-0.5 bg-border" />
            <div className="h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-3 h-3 text-foreground" />
              <p className="text-sm font-semibold uppercase tracking-wide">Drop-off</p>
            </div>
            <p className="text-lg font-medium pl-5">{trip.dropoff.address}</p>
            {trip.dropoff.landmark && (
              <p className="text-sm text-muted-foreground pl-5 mt-1">{trip.dropoff.landmark}</p>
            )}
          </div>
        </div>

        {/* Notes */}
        {trip.notes && (
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
            <p className="text-sm font-semibold text-warning mb-1">Driver Notes</p>
            <p className="text-foreground">{trip.notes}</p>
          </div>
        )}
      </div>

      {/* Fixed Action Button */}
      {trip.status !== 'completed' && trip.status !== 'cancelled' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8 safe-area-bottom">
          {getActionButton()}
        </div>
      )}

      {trip.status === 'completed' && (
        <div className="p-4 pb-8">
          <div className="bg-success/10 border border-success/30 rounded-xl p-5 text-center">
            <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-2" />
            <p className="text-lg font-bold text-success">Trip Completed</p>
          </div>
        </div>
      )}
    </div>
  );
}
