import { useMemo, useState, useCallback } from 'react';
import { MapPin, Navigation, CheckCircle2, ArrowLeft, Loader2, AlertCircle, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Trip, TripStatus, PassengerStatus } from '@/types/trip';
import { PassengerCard } from './PassengerCard';
import { TripMapLeaflet } from './TripMapLeaflet';
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
  const [expandedPassenger, setExpandedPassenger] = useState<string | null>(trip.passengers[0]?.id ?? null);
  const scheduledTime = new Date(trip.scheduledTime);

  const handleUpdateStatus = useCallback(async (newStatus: TripStatus) => {
    if (isUpdating) return;

    setIsUpdating(true);
    setUpdateError(null);

    try {
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
      await new Promise(resolve => setTimeout(resolve, 250));
      onUpdatePassengerStatus(trip.id, passengerId, status);
    } catch {
      setUpdateError('Failed to update passenger status. Please try again.');
      throw new Error('Failed to update passenger status');
    }
  }, [onUpdatePassengerStatus, trip.id]);

  const allPassengersFinal = useMemo(() => {
    if (!trip.passengers.length) return false;
    return trip.passengers.every(p => p.status === 'dropped_off' || p.status === 'failed_pickup' || p.status === 'cancelled');
  }, [trip.passengers]);

  const anyPickedUp = useMemo(() => trip.passengers.some(p => p.status === 'picked_up'), [trip.passengers]);

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
            I've Arrived at Pickup
          </Button>
        );
      case 'arrived_pickup':
        if (anyPickedUp) {
          return (
            <Button
              variant="success"
              size="xl"
              className="w-full min-h-[64px]"
              onClick={() => handleUpdateStatus('in_progress')}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Navigation className="w-6 h-6" />}
              Start Driving to Drop-off
            </Button>
          );
        }
        if (allPassengersFinal) {
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
        return (
          <div className="text-center py-4 text-muted-foreground">
            Mark at least one passenger as picked up, or mark remaining as no-show/cancel.
          </div>
        );
      case 'in_progress':
        if (allPassengersFinal) {
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
        return (
          <div className="text-center py-4 text-muted-foreground">
            Drop off, cancel, or no-show remaining passengers to complete.
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusStep = () => {
    const steps = [
      { key: 'assigned', label: 'Ready' },
      { key: 'en_route_pickup', label: 'En Route' },
      { key: 'arrived_pickup', label: 'At Pickup' },
      { key: 'in_progress', label: 'Driving' },
      { key: 'completed', label: 'Done' },
    ];
    const currentIndex = steps.findIndex(s => s.key === trip.status);

    return (
      <div className="flex items-center gap-1">
        {steps.map((step, index) => (
          <div key={step.key} className="flex-1">
            <div
              className={`h-1.5 rounded-full transition-colors ${
                index <= currentIndex
                  ? index === currentIndex && trip.status !== 'completed'
                    ? 'bg-primary animate-pulse'
                    : 'bg-primary'
                  : 'bg-muted'
              }`}
            />
          </div>
        ))}
      </div>
    );
  };

  const isActive = trip.status !== 'completed' && trip.status !== 'cancelled';

  const driverCoords = useMemo(() => {
    const p = trip.pickup.coordinates;
    const d = trip.dropoff.coordinates;
    if (p && d) return { lat: (p.lat + d.lat) / 2, lng: (p.lng + d.lng) / 2 };
    return undefined;
  }, [trip.pickup.coordinates, trip.dropoff.coordinates]);

  const passengerTotal = trip.passengers.length;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex-1 space-y-4 pb-32">
        <div className="px-4 pt-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors min-h-[44px] -ml-1 pl-1 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-base">Back</span>
          </button>
        </div>

        <div className="px-4">
          <TripMapLeaflet
            pickup={trip.pickup.coordinates}
            dropoff={trip.dropoff.coordinates}
            driver={driverCoords}
            status={trip.status}
          />
        </div>

        <div className="px-4">{getStatusStep()}</div>

        {updateError && (
          <div className="mx-4 flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-destructive text-sm font-medium">{updateError}</p>
          </div>
        )}

        <div className="px-4">
          <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Scheduled</p>
                <p className="text-xl font-bold">{format(scheduledTime, 'HH:mm')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="font-bold text-lg">{passengerTotal}</span>
            </div>
          </div>
        </div>

        <div className="px-4">
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">Pickup</p>
              </div>
              <p className="font-medium pl-4">{trip.pickup.address}</p>
              {trip.pickup.landmark && (
                <p className="text-sm text-muted-foreground pl-4">{trip.pickup.landmark}</p>
              )}
            </div>

            <div className="pl-1">
              <div className="w-0.5 h-4 bg-border ml-[3px]" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-2.5 h-2.5 text-success" />
                <p className="text-xs font-semibold text-success uppercase tracking-wide">Drop-off</p>
              </div>
              <p className="font-medium pl-4">{trip.dropoff.address}</p>
              {trip.dropoff.landmark && (
                <p className="text-sm text-muted-foreground pl-4">{trip.dropoff.landmark}</p>
              )}
            </div>
          </div>
        </div>

        {isActive && (
          <div className="px-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 pl-1">
              Passengers
            </p>
            <div className="space-y-3">
              {trip.passengers.map(p => (
                <PassengerCard
                  key={p.id}
                  passenger={p}
                  tripStatus={trip.status}
                  onUpdatePassengerStatus={handlePassengerStatusUpdate}
                  isExpanded={expandedPassenger === p.id}
                  onToggleExpand={() =>
                    setExpandedPassenger(expandedPassenger === p.id ? null : p.id)
                  }
                />
              ))}
            </div>
          </div>
        )}

        {trip.notes && (
          <div className="px-4">
            <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
              <p className="text-xs font-semibold text-warning uppercase tracking-wide mb-1">Driver Notes</p>
              <p className="text-foreground">{trip.notes}</p>
            </div>
          </div>
        )}
      </div>

      {isActive && (
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

