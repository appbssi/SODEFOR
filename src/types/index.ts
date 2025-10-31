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

export type AttendanceStatus = 'present' | 'absent' | 'mission' | 'permission' | 'N/A';

export interface AttendanceRecord {
  id?: string; // Firestore document ID, format: ${personnelId}_${date}
  personnelId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  permissionDuration?: {
    start: string;
    end: string;
  } | null;
  missionId?: string | null; // Reference to the mission
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
    startTime?: string; // HH:mm
    endTime?: string; // HH:mm
    personnelIds: string[];
    totalHours: number;
    status?: 'active' | 'completed';
    vehicle?: string;
    kilometers?: number;
}

export interface PersonnelDailyStatus {
    date: string; // YYYY-MM-DD
    status: AttendanceStatus;
    missionId?: string | null;
}
