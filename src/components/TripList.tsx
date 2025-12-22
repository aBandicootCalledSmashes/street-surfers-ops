import { Trip } from '@/types/trip';
import { TripCard } from './TripCard';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface TripListProps {
  trips: Trip[];
  onSelectTrip: (trip: Trip) => void;
  activeTripId?: string;
}

export function TripList({ trips, onSelectTrip, activeTripId }: TripListProps) {
  const pendingTrips = trips.filter(t => 
    t.status !== 'completed' && t.status !== 'cancelled'
  );
  const completedTrips = trips.filter(t => t.status === 'completed');

  return (
    <div className="p-4 pb-8 space-y-6 animate-slide-up safe-area-bottom">
      <div className="flex items-center gap-3 touch-target">
        <Calendar className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Today's Trips</h2>
          <p className="text-base text-muted-foreground">{format(new Date(), 'EEEE, d MMMM')}</p>
        </div>
      </div>

      {pendingTrips.length === 0 && completedTrips.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-xl font-medium">No trips assigned</p>
          <p className="text-base text-muted-foreground mt-1">Check back later for new assignments</p>
        </div>
      ) : (
        <>
          {pendingTrips.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between touch-target">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Upcoming
                </p>
                <span className="text-base font-bold text-primary">{pendingTrips.length}</span>
              </div>
              <div className="space-y-4">
                {pendingTrips.map((trip, index) => (
                  <div key={trip.id} style={{ animationDelay: `${index * 50}ms` }}>
                    <TripCard 
                      trip={trip} 
                      onClick={onSelectTrip}
                      isActive={trip.id === activeTripId}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {completedTrips.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 touch-target">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Completed ({completedTrips.length})
                </p>
              </div>
              <div className="space-y-4 opacity-60">
                {completedTrips.map(trip => (
                  <TripCard 
                    key={trip.id} 
                    trip={trip} 
                    onClick={onSelectTrip}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
