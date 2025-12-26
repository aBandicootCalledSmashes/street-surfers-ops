export type TripStatus = 
  | 'assigned' 
  | 'en_route_pickup' 
  | 'arrived_pickup' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export type TripType = 'inbound' | 'outbound';

export type PassengerStatus = 
  | 'pending'
  | 'picked_up'
  | 'dropped_off'
  | 'failed_pickup'
  | 'cancelled';

export interface Passenger {
  id: string;
  name: string;
  phone: string;
  count: number;
  status: PassengerStatus;
  statusUpdatedAt?: string;
  // For inbound trips: passenger's home address (pickup)
  // For outbound trips: passenger's home address (dropoff)
  homeAddress: string;
  homeCoordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Location {
  address: string;
  landmark?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Trip {
  id: string;
  tripType: TripType;
  passengers: Passenger[];
  pickup: Location;
  dropoff: Location;
  scheduledTime: string;
  status: TripStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  name: string;
  vehicle: string;
  plateNumber: string;
  isOnline: boolean;
}

export interface StatusLogEntry {
  passengerId: string;
  previousStatus: PassengerStatus;
  newStatus: PassengerStatus;
  timestamp: string;
  tripId: string;
}

export interface DriverLocation {
  driverId: string;
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: string;
}
