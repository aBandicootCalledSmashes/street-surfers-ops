import { MapPin, Navigation } from 'lucide-react';

interface TripMapProps {
  pickupAddress: string;
  dropoffAddress: string;
  status: 'assigned' | 'en_route_pickup' | 'arrived_pickup' | 'in_progress' | 'completed' | 'cancelled';
}

export function TripMap({ pickupAddress, dropoffAddress, status }: TripMapProps) {
  const isEnRoute = status === 'en_route_pickup' || status === 'in_progress';
  const showPickup = status !== 'in_progress' && status !== 'completed';
  
  return (
    <div className="relative w-full h-48 bg-card rounded-xl overflow-hidden border border-border">
      {/* Map placeholder with grid pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="mapGrid"
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 30 0 L 0 0 0 30"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-muted-foreground"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mapGrid)" />
      </svg>
      
      {/* Animated route line */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--success))" />
          </linearGradient>
        </defs>
        <path
          d="M 20 70 Q 35 50 50 50 T 80 30"
          fill="none"
          stroke="url(#routeGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={isEnRoute ? "5,5" : "none"}
          className={isEnRoute ? "animate-pulse" : ""}
        />
      </svg>

      {/* Pickup marker */}
      {showPickup && (
        <div className="absolute left-[20%] top-[65%] -translate-x-1/2 -translate-y-1/2">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="mt-1 px-2 py-0.5 bg-background/90 rounded text-xs font-medium truncate max-w-[80px]">
              Pickup
            </div>
          </div>
        </div>
      )}

      {/* Dropoff marker */}
      <div className="absolute left-[80%] top-[25%] -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center shadow-lg">
            <Navigation className="w-4 h-4 text-success-foreground" />
          </div>
          <div className="mt-1 px-2 py-0.5 bg-background/90 rounded text-xs font-medium truncate max-w-[80px]">
            Drop-off
          </div>
        </div>
      </div>

      {/* Current location indicator when en route */}
      {isEnRoute && (
        <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-4 h-4 bg-foreground rounded-full shadow-lg" />
            <div className="absolute inset-0 w-4 h-4 bg-foreground rounded-full animate-ping opacity-50" />
          </div>
        </div>
      )}

      {/* Status overlay */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
        <div className="px-2 py-1 bg-background/90 backdrop-blur-sm rounded text-xs text-muted-foreground truncate max-w-[45%]">
          {pickupAddress.split(',')[0]}
        </div>
        <div className="px-2 py-1 bg-background/90 backdrop-blur-sm rounded text-xs text-muted-foreground truncate max-w-[45%]">
          {dropoffAddress.split(',')[0]}
        </div>
      </div>
    </div>
  );
}
