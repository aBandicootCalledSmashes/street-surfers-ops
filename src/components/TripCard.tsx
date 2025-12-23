import { MapPin, Clock, Users, ChevronRight } from 'lucide-react';
import { Trip } from '@/types/trip';
import { format } from 'date-fns';

interface TripCardProps {
  trip: Trip;
  onClick: (trip: Trip) => void;
  isActive?: boolean;
}

export function TripCard({ trip, onClick, isActive }: TripCardProps) {
  const scheduledTime = new Date(trip.scheduledTime);

  const getStatusBadge = () => {
    switch (trip.status) {
      case 'en_route_pickup':
        return <span className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-warning/20 text-warning">En Route</span>;
      case 'arrived_pickup':
        return <span className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-primary/20 text-primary">Arrived</span>;
      case 'in_progress':
        return <span className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-success/20 text-success animate-pulse-glow">In Progress</span>;
      case 'completed':
        return <span className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-muted text-muted-foreground">Completed</span>;
      default:
        return null;
    }
  };

  return (
    <button
      onClick={() => onClick(trip)}
      className={`w-full text-left p-5 rounded-xl border transition-all duration-200 animate-slide-up active:scale-[0.98] touch-target ${
        isActive 
          ? 'bg-primary/10 border-primary' 
          : 'bg-card border-border hover:border-muted-foreground active:bg-secondary/50'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <span className="text-xl font-bold">{format(scheduledTime, 'HH:mm')}</span>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <ChevronRight className="w-6 h-6 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="mt-1.5">
            <div className="w-3 h-3 rounded-full bg-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">Pickup</p>
            <p className="font-medium text-base truncate">{trip.pickup.address}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-1.5 ml-[2px]">
            <MapPin className="w-4 h-4 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">Drop-off</p>
            <p className="font-medium text-base truncate">{trip.dropoff.address}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-5 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-muted-foreground" />
          <span className="text-base">{trip.passengers.length} passenger{trip.passengers.length !== 1 ? 's' : ''}</span>
        </div>
        <span className="text-muted-foreground">•</span>
        <span className="text-base font-medium truncate">
          {trip.passengers[0]?.name}{trip.passengers.length > 1 ? ` +${trip.passengers.length - 1}` : ''}
        </span>
      </div>
    </button>
  );
}
