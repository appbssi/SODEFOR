export interface Personnel {
  id: string; // Matricule
  firstName: string;
  lastName: string;
  rank: string;
  contact: string;
  address: string;
  email: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'mission' | 'permission';

export interface AttendanceRecord {
  personnelId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  permissionDuration?: {
    start: string;
    end: string;
  };
}
