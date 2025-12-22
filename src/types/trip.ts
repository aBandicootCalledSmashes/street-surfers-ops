export type TripStatus = 
  | 'assigned' 
  | 'en_route_pickup' 
  | 'arrived_pickup' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

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
  passenger: Passenger;
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
