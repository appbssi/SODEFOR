export interface Personnel {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  rank: string;
  contact: string;
  address: string;
  email: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'mission' | 'permission';

export interface AttendanceRecord {
  id?: string; // Firestore document ID
  personnelId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  permissionDuration?: {
    start: string;
    end: string;
  };
  missionId?: string; // Reference to the mission
}

export interface DailyStatus {
  id: string; // YYYY-MM-DD
  validated: boolean;
  validatedAt: string; // ISO string date
}

export interface Mission {
    id: string;
    name: string;
    description: string;
    date: string; // YYYY-MM-DD
    personnelIds: string[];
}
