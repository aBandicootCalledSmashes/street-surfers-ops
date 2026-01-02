import { useState, useCallback, useEffect } from 'react';
import { Header } from '@/components/Header';
import { TripList } from '@/components/TripList';
import { ActiveTrip } from '@/components/ActiveTrip';
import { OfflineBanner } from '@/components/OfflineBanner';
import { DriverSidebar } from '@/components/DriverSidebar';
import { SOSButton } from '@/components/SOSButton';
import { mockDriver, mockTrips } from '@/data/mockData';
import { Trip, TripStatus, PassengerStatus, StatusLogEntry } from '@/types/trip';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useDriverLocation, requestNotificationPermission } from '@/hooks/useDriverLocation';
import { useProfile } from '@/hooks/useProfile';

const Index = () => {
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [statusLog, setStatusLog] = useState<StatusLogEntry[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isOnline, isReconnecting } = useNetworkStatus();
  const { profile } = useProfile();

  // Use profile data if available, otherwise fall back to mock
  const driverInfo = {
    id: profile?.id || mockDriver.id,
    name: profile?.name || user?.email?.split('@')[0] || mockDriver.name,
    vehicle: profile?.vehicle_make && profile?.vehicle_model 
      ? `${profile.vehicle_make} ${profile.vehicle_model}` 
      : mockDriver.vehicle,
    plateNumber: profile?.plate_number || mockDriver.plateNumber,
    isOnline: profile?.is_online ?? mockDriver.isOnline,
  };

  // Live location tracking - only when online AND has active trip
  const hasActiveTrip = trips.some(t => 
    t.status === 'en_route_pickup' || 
    t.status === 'arrived_pickup' || 
    t.status === 'in_progress'
  );
  
  const { location, error: locationError, isTracking } = useDriverLocation({
    driverId: profile?.id || driverInfo.id,
    enabled: driverInfo.isOnline && hasActiveTrip && !!user,
    updateInterval: 8000, // Update every 8 seconds
  });

  // Request notification permission on mount
  useEffect(() => {
    if (user) {
      requestNotificationPermission().then((granted) => {
        if (granted) {
          console.log('[Notifications] Permission granted');
        }
      });
    }
  }, [user]);

  // Log location tracking status
  useEffect(() => {
    if (isTracking) {
      console.log('[Location] Tracking active');
    }
    if (locationError) {
      console.warn('[Location] Error:', locationError);
    }
    if (location) {
      console.log('[Location] Updated:', location.lat.toFixed(6), location.lng.toFixed(6));
    }
  }, [isTracking, locationError, location]);

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

        const passengerIndex = trip.passengers.findIndex(p => p.id === passengerId);
        if (passengerIndex === -1) return trip;

        const previousStatus = trip.passengers[passengerIndex].status;

        // Log the status change
        const logEntry: StatusLogEntry = {
          passengerId,
          previousStatus,
          newStatus: status,
          timestamp,
          tripId,
        };
        setStatusLog(prev => [...prev, logEntry]);

        const nextPassengers = trip.passengers.map(p =>
          p.id === passengerId
            ? { ...p, status, statusUpdatedAt: timestamp }
            : p
        );

        return {
          ...trip,
          passengers: nextPassengers,
          updatedAt: timestamp,
        };
      })
    );

    // Update selected trip
    setSelectedTrip(prev => {
      if (prev?.id !== tripId) return prev;

      const passengerIndex = prev.passengers.findIndex(p => p.id === passengerId);
      if (passengerIndex === -1) return prev;

      return {
        ...prev,
        passengers: prev.passengers.map(p =>
          p.id === passengerId
            ? { ...p, status, statusUpdatedAt: timestamp }
            : p
        ),
        updatedAt: timestamp,
      };
    });

    const statusMessages: Record<PassengerStatus, string> = {
      pending: 'Status reset',
      picked_up: 'Passenger picked up',
      dropped_off: 'Passenger dropped off',
      failed_pickup: 'Pickup marked as failed',
      cancelled: 'Passenger cancelled',
    };

    toast({
      title: statusMessages[status],
      duration: 2000,
    });

    console.log('Passenger status change', { passengerId, status, timestamp, tripId });
  }, [toast]);

  // Get the currently active trip (in progress)
  const activeTripId = trips.find(t => 
    t.status === 'en_route_pickup' || 
    t.status === 'arrived_pickup' || 
    t.status === 'in_progress'
  )?.id;

  return (
    <div className="min-h-screen bg-background">
      {!isOnline && <OfflineBanner isReconnecting={isReconnecting} />}
      
      <Header driver={driverInfo} onMenuClick={() => setIsSidebarOpen(true)} />
      
      <DriverSidebar 
        driver={driverInfo} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* SOS Button - always visible */}
      <SOSButton
        driverId={profile?.id || driverInfo.id}
        tripId={selectedTrip?.id || activeTripId}
        vehicleId={profile?.plate_number || driverInfo.plateNumber}
        location={location}
      />
      
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
