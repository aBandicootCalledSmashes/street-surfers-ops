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
    tripType: 'inbound',
    passengers: [
      {
        id: 'pax-001',
        name: 'Sarah Williams',
        phone: '+27 82 555 1234',
        count: 1,
        status: 'pending',
        homeAddress: '45 Long Street, Cape Town CBD',
      },
      {
        id: 'pax-001b',
        name: 'Michael Williams',
        phone: '+27 82 555 1234',
        count: 1,
        status: 'pending',
        homeAddress: '52 Loop Street, Cape Town',
      },
    ],
    pickup: {
      address: 'Various Home Addresses',
      landmark: 'Pick up from homes',
      coordinates: { lat: -33.9249, lng: 18.4241 },
    },
    dropoff: {
      address: 'Street Surfers HQ, 12 Beach Road, Muizenberg',
      landmark: 'Main Office Building',
      coordinates: { lat: -34.1086, lng: 18.4688 },
    },
    scheduledTime: '2025-12-21T07:30:00',
    status: 'assigned',
    notes: 'Morning shift pickup',
    createdAt: '2025-12-21T06:00:00',
    updatedAt: '2025-12-21T06:00:00',
  },
  {
    id: 'trip-002',
    tripType: 'outbound',
    passengers: [
      {
        id: 'pax-002',
        name: 'David Chen',
        phone: '+27 83 555 5678',
        count: 1,
        status: 'pending',
        homeAddress: '88 Main Road, Observatory',
      },
    ],
    pickup: {
      address: 'Street Surfers HQ, 12 Beach Road, Muizenberg',
      landmark: 'Main Office Building',
      coordinates: { lat: -34.1086, lng: 18.4688 },
    },
    dropoff: {
      address: 'Various Home Addresses',
      coordinates: { lat: -33.9383, lng: 18.4656 },
    },
    scheduledTime: '2025-12-21T17:30:00',
    status: 'assigned',
    createdAt: '2025-12-21T15:30:00',
    updatedAt: '2025-12-21T15:30:00',
  },
  {
    id: 'trip-003',
    tripType: 'inbound',
    passengers: [
      {
        id: 'pax-003',
        name: 'Lisa Nkosi',
        phone: '+27 84 555 9012',
        count: 1,
        status: 'pending',
        homeAddress: '156 Buitenkant Street, District Six',
      },
      {
        id: 'pax-003b',
        name: 'Thabo Nkosi',
        phone: '+27 84 555 9012',
        count: 1,
        status: 'pending',
        homeAddress: '78 Kloof Street, Gardens',
      },
      {
        id: 'pax-003c',
        name: 'Ayesha Nkosi',
        phone: '+27 84 555 9012',
        count: 1,
        status: 'pending',
        homeAddress: '23 Regent Road, Sea Point',
      },
      {
        id: 'pax-003d',
        name: 'Nandi Nkosi',
        phone: '+27 84 555 9012',
        count: 1,
        status: 'pending',
        homeAddress: '45 Main Drive, Green Point',
      },
    ],
    pickup: {
      address: 'Various Home Addresses',
      coordinates: { lat: -33.9311, lng: 18.4265 },
    },
    dropoff: {
      address: 'Street Surfers HQ, 12 Beach Road, Muizenberg',
      landmark: 'Main Office Building',
      coordinates: { lat: -34.1086, lng: 18.4688 },
    },
    scheduledTime: '2025-12-21T08:00:00',
    status: 'assigned',
    notes: 'Call on arrival',
    createdAt: '2025-12-21T06:30:00',
    updatedAt: '2025-12-21T06:30:00',
  },
  {
    id: 'trip-004',
    tripType: 'outbound',
    passengers: [
      {
        id: 'pax-004',
        name: 'James Peterson',
        phone: '+27 85 555 3456',
        count: 1,
        status: 'pending',
        homeAddress: '200 Voortrekker Road, Bellville',
      },
      {
        id: 'pax-004b',
        name: 'Emily Peterson',
        phone: '+27 85 555 3456',
        count: 1,
        status: 'pending',
        homeAddress: '45 Strand Street, Cape Town',
      },
    ],
    pickup: {
      address: 'Street Surfers HQ, 12 Beach Road, Muizenberg',
      landmark: 'Main Office Building',
      coordinates: { lat: -34.1086, lng: 18.4688 },
    },
    dropoff: {
      address: 'Various Home Addresses',
      coordinates: { lat: -33.8968, lng: 18.6360 },
    },
    scheduledTime: '2025-12-21T18:00:00',
    status: 'assigned',
    createdAt: '2025-12-21T16:30:00',
    updatedAt: '2025-12-21T16:30:00',
  },
];
