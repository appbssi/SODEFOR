import type { Personnel, AttendanceRecord, Mission } from '@/types';

// This file now serves as a source for initial data for a fresh DB, or as a reference.
// The live data will be managed by Firebase.

export const initialPersonnel: Personnel[] = [
  {
    id: '001',
    matricule: 'M001',
    firstName: 'Jean',
    lastName: 'Dupont',
    rank: 'Sergent',
    contact: '0123456789',
    address: '1 Rue de la Paix, Paris',
    email: 'jean.dupont@armee.fr',
  },
  {
    id: '002',
    matricule: 'M002',
    firstName: 'Marie',
    lastName: 'Curie',
    rank: 'Caporal',
    contact: '0987654321',
    address: '2 Avenue des Champs, Paris',
    email: 'marie.curie@armee.fr',
  },
  {
    id: '003',
    matricule: 'M003',
    firstName: 'Pierre',
    lastName: 'Martin',
    rank: 'Soldat',
    contact: '0612345678',
    address: '3 Boulevard Saint-Germain, Paris',
    email: 'pierre.martin@armee.fr',
  },
    {
    id: '004',
    matricule: 'M004',
    firstName: 'Sophie',
    lastName: 'Bernard',
    rank: 'Lieutenant',
    contact: '0687654321',
    address: '4 Rue de Rivoli, Paris',
    email: 'sophie.bernard@armee.fr',
  },
];

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowString = tomorrow.toISOString().split('T')[0];

export const initialAttendance: AttendanceRecord[] = [
  { personnelId: '001', date: today, status: 'present' },
  { personnelId: '002', date: today, status: 'mission', missionId: 'mission-active' },
  { personnelId: '003', date: today, status: 'absent' },
  { 
    personnelId: '004', 
    date: today, 
    status: 'permission', 
    permissionDuration: {
        start: today,
        end: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0]
    }
  },
];


export const initialMissions: Mission[] = [
    {
        id: 'mission-active',
        name: 'SURVEILLANCE',
        description: 'Patrouille ordinaire',
        date: today,
        personnelIds: ['002'],
        totalHours: 8,
        status: 'active',
        vehicle: 'Toyota Hilux',
        kilometers: 120,
    },
    {
        id: 'mission-completed',
        name: 'REBOISEMENT',
        description: 'Plantation industrielle manuelle',
        date: '2024-07-01',
        personnelIds: ['001', '003'],
        totalHours: 16,
        status: 'completed',
        vehicle: 'Land Cruiser',
        kilometers: 75,
    },
    {
        id: 'mission-upcoming',
        name: 'FORMATION',
        description: 'Atelier, séminaire',
        date: tomorrowString,
        personnelIds: ['004'],
        totalHours: 8,
        status: 'active'
    }
]
