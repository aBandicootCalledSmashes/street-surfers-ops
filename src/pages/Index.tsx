import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { TripList } from '@/components/TripList';
import { ActiveTrip } from '@/components/ActiveTrip';
import { OfflineBanner } from '@/components/OfflineBanner';
import { mockDriver, mockTrips } from '@/data/mockData';
import { Trip, TripStatus, PassengerStatus, StatusLogEntry } from '@/types/trip';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const Index = () => {
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [statusLog, setStatusLog] = useState<StatusLogEntry[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isOnline, isReconnecting } = useNetworkStatus();

  const handleSelectTrip = (trip: Trip) => {
    setSelectedTrip(trip);
  };

  const handleBack = () => {
    setSelectedTrip(null);
  };

  const handleUpdateStatus = useCallback((tripId: string, newStatus: TripStatus) => {
    setTrips(prevTrips => 
      prevTrips.map(trip => 
        trip.id === tripId 
          ? { ...trip, status: newStatus, updatedAt: new Date().toISOString() }
          : trip
      )
    );

    // Update the selected trip as well
    setSelectedTrip(prev => 
      prev?.id === tripId 
        ? { ...prev, status: newStatus, updatedAt: new Date().toISOString() }
        : prev
    );

    const statusMessages: Record<TripStatus, string> = {
      'assigned': 'Trip assigned',
      'en_route_pickup': 'Heading to pickup location',
      'arrived_pickup': 'Arrived at pickup',
      'in_progress': 'Trip in progress',
      'completed': 'Trip completed successfully',
      'cancelled': 'Trip cancelled',
    };

    toast({
      title: statusMessages[newStatus],
      duration: 2000,
    });
  }, [toast]);

  const handleUpdatePassengerStatus = useCallback((tripId: string, passengerId: string, status: PassengerStatus) => {
    const timestamp = new Date().toISOString();
    
    setTrips(prevTrips => 
      prevTrips.map(trip => {
        if (trip.id !== tripId) return trip;
        
        if (trip.passenger.id === passengerId) {
          // Log the status change
          const logEntry: StatusLogEntry = {
            passengerId,
            previousStatus: trip.passenger.status,
            newStatus: status,
            timestamp,
            tripId,
          };
          setStatusLog(prev => [...prev, logEntry]);
          
          return {
            ...trip,
            passenger: {
              ...trip.passenger,
              status,
              statusUpdatedAt: timestamp,
            },
            updatedAt: timestamp,
          };
        }
        return trip;
      })
    );

    // Update selected trip
    setSelectedTrip(prev => {
      if (prev?.id !== tripId) return prev;
      
      if (prev.passenger.id === passengerId) {
        return {
          ...prev,
          passenger: {
            ...prev.passenger,
            status,
            statusUpdatedAt: timestamp,
          },
          updatedAt: timestamp,
        };
      }
      return prev;
    });

    const statusMessages: Record<PassengerStatus, string> = {
      'pending': 'Status reset',
      'picked_up': 'Passenger picked up',
      'dropped_off': 'Passenger dropped off',
      'failed_pickup': 'Pickup marked as failed',
      'cancelled': 'Passenger cancelled',
    };

    toast({
      title: statusMessages[status],
      duration: 2000,
    });

    console.log('Status log:', [...statusLog, { passengerId, status, timestamp, tripId }]);
  }, [toast, statusLog]);

  // Get the currently active trip (in progress)
  const activeTripId = trips.find(t => 
    t.status === 'en_route_pickup' || 
    t.status === 'arrived_pickup' || 
    t.status === 'in_progress'
  )?.id;

  // Use mock driver data but could integrate with auth user email
  const driverInfo = {
    ...mockDriver,
    name: user?.email?.split('@')[0] || mockDriver.name,
  };

  return (
    <div className="min-h-screen bg-background">
      {!isOnline && <OfflineBanner isReconnecting={isReconnecting} />}
      
      <Header driver={driverInfo} />
      
      {selectedTrip ? (
        <ActiveTrip 
          trip={selectedTrip}
          onBack={handleBack}
          onUpdateStatus={handleUpdateStatus}
          onUpdatePassengerStatus={handleUpdatePassengerStatus}
        />
      ) : (
        <TripList 
          trips={trips}
          onSelectTrip={handleSelectTrip}
          activeTripId={activeTripId}
        />
      )}
    </div>
  );
};

export default Index;
