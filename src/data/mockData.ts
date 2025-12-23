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
    passengers: [
      {
        id: 'pax-001',
        name: 'Sarah Williams',
        phone: '+27 82 555 1234',
        count: 1,
        status: 'pending',
      },
      {
        id: 'pax-001b',
        name: 'Michael Williams',
        phone: '+27 82 555 1234',
        count: 1,
        status: 'pending',
      },
    ],
    pickup: {
      address: '45 Long Street, Cape Town CBD',
      landmark: 'Near the clock tower',
      coordinates: { lat: -33.9249, lng: 18.4241 },
    },
    dropoff: {
      address: '12 Beach Road, Muizenberg',
      landmark: 'Blue house on corner',
      coordinates: { lat: -34.1086, lng: 18.4688 },
    },
    scheduledTime: '2025-12-21T19:30:00',
    status: 'assigned',
    notes: 'Passenger has luggage',
    createdAt: '2025-12-21T15:00:00',
    updatedAt: '2025-12-21T15:00:00',
  },
  {
    id: 'trip-002',
    passengers: [
      {
        id: 'pax-002',
        name: 'David Chen',
        phone: '+27 83 555 5678',
        count: 1,
        status: 'pending',
      },
    ],
    pickup: {
      address: '88 Main Road, Observatory',
      landmark: 'Opposite the cafe',
      coordinates: { lat: -33.9383, lng: 18.4656 },
    },
    dropoff: {
      address: '23 Victoria Road, Camps Bay',
      coordinates: { lat: -33.9519, lng: 18.3781 },
    },
    scheduledTime: '2025-12-21T20:00:00',
    status: 'assigned',
    createdAt: '2025-12-21T15:30:00',
    updatedAt: '2025-12-21T15:30:00',
  },
  {
    id: 'trip-003',
    passengers: [
      {
        id: 'pax-003',
        name: 'Lisa Nkosi',
        phone: '+27 84 555 9012',
        count: 1,
        status: 'pending',
      },
      {
        id: 'pax-003b',
        name: 'Thabo Nkosi',
        phone: '+27 84 555 9012',
        count: 1,
        status: 'pending',
      },
      {
        id: 'pax-003c',
        name: 'Ayesha Nkosi',
        phone: '+27 84 555 9012',
        count: 1,
        status: 'pending',
      },
      {
        id: 'pax-003d',
        name: 'Nandi Nkosi',
        phone: '+27 84 555 9012',
        count: 1,
        status: 'pending',
      },
    ],
    pickup: {
      address: '156 Buitenkant Street, District Six',
      coordinates: { lat: -33.9311, lng: 18.4265 },
    },
    dropoff: {
      address: '78 Kloof Street, Gardens',
      landmark: 'Next to the pharmacy',
      coordinates: { lat: -33.9328, lng: 18.4041 },
    },
    scheduledTime: '2025-12-21T20:45:00',
    status: 'assigned',
    notes: 'Call on arrival',
    createdAt: '2025-12-21T16:00:00',
    updatedAt: '2025-12-21T16:00:00',
  },
  {
    id: 'trip-004',
    passengers: [
      {
        id: 'pax-004',
        name: 'James Peterson',
        phone: '+27 85 555 3456',
        count: 1,
        status: 'pending',
      },
      {
        id: 'pax-004b',
        name: 'Emily Peterson',
        phone: '+27 85 555 3456',
        count: 1,
        status: 'pending',
      },
    ],
    pickup: {
      address: '200 Voortrekker Road, Bellville',
      coordinates: { lat: -33.8968, lng: 18.6360 },
    },
    dropoff: {
      address: '45 Strand Street, Cape Town',
      coordinates: { lat: -33.9176, lng: 18.4218 },
    },
    scheduledTime: '2025-12-21T21:15:00',
    status: 'assigned',
    createdAt: '2025-12-21T16:30:00',
    updatedAt: '2025-12-21T16:30:00',
  },
];
