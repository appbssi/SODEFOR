'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import type { Personnel, AttendanceRecord } from '@/types';
import { initialPersonnel, initialAttendance } from '@/lib/data';

interface AppContextType {
  personnel: Personnel[];
  attendance: AttendanceRecord[];
  addPersonnel: (person: Omit<Personnel, 'id' | 'matricule'>) => void;
  updateAttendance: (record: AttendanceRecord) => void;
  getAttendanceForDate: (date: string) => AttendanceRecord[];
  getPersonnelById: (id: string) => Personnel | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [personnel, setPersonnel] = useState<Personnel[]>(initialPersonnel);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);

  const addPersonnel = (person: Omit<Personnel, 'id' | 'matricule'>) => {
    const newId = (Math.max(...personnel.map(p => parseInt(p.id, 10)), 0) + 1).toString().padStart(3, '0');
    const newPerson: Personnel = { ...person, id: newId };
    setPersonnel(prev => [...prev, newPerson]);
    
    // Also add a default attendance record for today
    const today = new Date().toISOString().split('T')[0];
    updateAttendance({ personnelId: newId, date: today, status: 'present' });
  };

  const updateAttendance = (record: AttendanceRecord) => {
    setAttendance(prev => {
      const existingRecordIndex = prev.findIndex(
        r => r.personnelId === record.personnelId && r.date === record.date
      );
      if (existingRecordIndex !== -1) {
        const newAttendance = [...prev];
        newAttendance[existingRecordIndex] = record;
        return newAttendance;
      }
      return [...prev, record];
    });
  };

  const getAttendanceForDate = (date: string) => {
    return attendance.filter(r => r.date === date);
  };
  
  const getPersonnelById = (id: string) => {
    return personnel.find(p => p.id === id);
  };

  return (
    <AppContext.Provider value={{ personnel, attendance, addPersonnel, updateAttendance, getAttendanceForDate, getPersonnelById }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
