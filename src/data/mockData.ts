import { Trip, Driver } from '@/types/trip';

export const mockDriver: Driver = {
  id: 'driver-001',
  name: 'Marcus Johnson',
  vehicle: 'Toyota Quantum',
  plateNumber: 'CA 456-789',
  isOnline: true,
};

export const mockTrips: Trip[] = [
  {
    id: 'trip-001',
    passenger: {
      id: 'pax-001',
      name: 'Sarah Williams',
      phone: '+27 82 555 1234',
      count: 2,
      status: 'pending',
    },
    pickup: {
      address: '45 Long Street, Cape Town CBD',
      landmark: 'Near the clock tower',
    },
    dropoff: {
      address: '12 Beach Road, Muizenberg',
      landmark: 'Blue house on corner',
    },
    scheduledTime: '2025-12-21T19:30:00',
    status: 'assigned',
    notes: 'Passenger has luggage',
    createdAt: '2025-12-21T15:00:00',
    updatedAt: '2025-12-21T15:00:00',
  },
  {
    id: 'trip-002',
    passenger: {
      id: 'pax-002',
      name: 'David Chen',
      phone: '+27 83 555 5678',
      count: 1,
      status: 'pending',
    },
    pickup: {
      address: '88 Main Road, Observatory',
      landmark: 'Opposite the cafe',
    },
    dropoff: {
      address: '23 Victoria Road, Camps Bay',
    },
    scheduledTime: '2025-12-21T20:00:00',
    status: 'assigned',
    createdAt: '2025-12-21T15:30:00',
    updatedAt: '2025-12-21T15:30:00',
  },
  {
    id: 'trip-003',
    passenger: {
      id: 'pax-003',
      name: 'Lisa Nkosi',
      phone: '+27 84 555 9012',
      count: 4,
      status: 'pending',
    },
    pickup: {
      address: '156 Buitenkant Street, District Six',
    },
    dropoff: {
      address: '78 Kloof Street, Gardens',
      landmark: 'Next to the pharmacy',
    },
    scheduledTime: '2025-12-21T20:45:00',
    status: 'assigned',
    notes: 'Call on arrival',
    createdAt: '2025-12-21T16:00:00',
    updatedAt: '2025-12-21T16:00:00',
  },
  {
    id: 'trip-004',
    passenger: {
      id: 'pax-004',
      name: 'James Peterson',
      phone: '+27 85 555 3456',
      count: 2,
      status: 'pending',
    },
    pickup: {
      address: '200 Voortrekker Road, Bellville',
    },
    dropoff: {
      address: '45 Strand Street, Cape Town',
    },
    scheduledTime: '2025-12-21T21:15:00',
    status: 'assigned',
    createdAt: '2025-12-21T16:30:00',
    updatedAt: '2025-12-21T16:30:00',
  },
];
