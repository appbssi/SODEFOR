'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { Personnel, AttendanceRecord, DailyStatus, Mission } from '@/types';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import {
  addDocumentNonBlocking,
  setDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { getDaysBetweenDates } from '@/lib/utils';

interface AppContextType {
  personnel: Personnel[];
  attendance: AttendanceRecord[];
  missions: Mission[];
  addPersonnel: (person: Omit<Personnel, 'id'>) => void;
  addMultiplePersonnel: (personnelList: Omit<Personnel, 'id'>[]) => Promise<void>;
  updateAttendance: (record: Partial<AttendanceRecord> & { personnelId: string; date: string }) => void;
  addMission: (mission: Omit<Mission, 'id'>) => Promise<void>;
  getAttendanceForDate: (date: string) => AttendanceRecord[];
  getPersonnelById: (id: string) => Personnel | undefined;
  todaysStatus: DailyStatus | null;
  validateTodaysAttendance: () => void;
  reactivateTodaysAttendance: () => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();

  const personnelQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'personnel');
  }, [firestore]);

  const { data: personnelData, isLoading: personnelLoading } = useCollection<Personnel>(personnelQuery);
  const personnel = personnelData || [];

  const today = new Date().toISOString().split('T')[0];
  const attendanceQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'attendance');
  }, [firestore]);

  const { data: attendanceData, isLoading: attendanceLoading } = useCollection<AttendanceRecord>(attendanceQuery);
  const attendance = attendanceData || [];
  
  const missionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'missions');
  }, [firestore]);

  const { data: missionsData, isLoading: missionsLoading } = useCollection<Mission>(missionsQuery);
  const missions = (missionsData || []).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const todaysStatusRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'dailyStatus', today);
  }, [firestore, today]);

  const { data: todaysStatus, isLoading: statusLoading } = useDoc<DailyStatus>(todaysStatusRef);

  const addPersonnel = (person: Omit<Personnel, 'id'>) => {
    if (!firestore) return;
    const personnelCollection = collection(firestore, 'personnel');
    addDocumentNonBlocking(personnelCollection, person)
      .then((docRef) => {
        if(!docRef) return;
        const newPersonnelId = docRef.id;
        const attendanceDocRef = doc(firestore, 'attendance', `${newPersonnelId}_${today}`);
        const newRecord = {
          personnelId: newPersonnelId,
          date: today,
          status: 'present' as const,
        };
        setDocumentNonBlocking(attendanceDocRef, newRecord, { merge: true });
      });
  };

  const addMultiplePersonnel = async (personnelList: Omit<Personnel, 'id'>[]) => {
    if (!firestore) return;
    const batch = writeBatch(firestore);
    const personnelCollection = collection(firestore, 'personnel');
    
    personnelList.forEach(person => {
        const newPersonnelRef = doc(personnelCollection);
        batch.set(newPersonnelRef, person);
        
        const attendanceDocRef = doc(firestore, 'attendance', `${newPersonnelRef.id}_${today}`);
        const newRecord = {
          personnelId: newPersonnelRef.id,
          date: today,
          status: 'present' as const,
        };
        batch.set(attendanceDocRef, newRecord, { merge: true });
    });

    await batch.commit();
  };

  const updateAttendance = (record: Partial<AttendanceRecord> & { personnelId: string; date: string }) => {
    if (!firestore) return;
    const attendanceId = `${record.personnelId}_${record.date}`;
    const attendanceDocRef = doc(firestore, 'attendance', attendanceId);

    const fullRecord: Partial<AttendanceRecord> = {
      personnelId: record.personnelId,
      date: record.date,
      status: record.status || 'present',
      ...record,
    };

    setDocumentNonBlocking(attendanceDocRef, fullRecord, { merge: true });
  };
  
  const addMission = (missionData: Omit<Mission, 'id'>) => {
    if (!firestore) {
      console.error("Firestore not available");
      return Promise.reject(new Error("Firestore not available"));
    }

    const missionCollection = collection(firestore, 'missions');
    const newMissionRef = doc(missionCollection); // Create a reference locally to get an ID.

    // 1. Add mission document (non-blocking)
    addDocumentNonBlocking(missionCollection, missionData);

    // 2. Update attendance for each person (non-blocking)
    missionData.personnelIds.forEach(personnelId => {
      const attendanceId = `${personnelId}_${missionData.date}`;
      const attendanceDocRef = doc(firestore, 'attendance', attendanceId);
      const attendanceRecord = {
        personnelId,
        date: missionData.date,
        status: 'mission' as const,
        missionId: newMissionRef.id, // Use the locally generated ID.
      };
      setDocumentNonBlocking(attendanceDocRef, attendanceRecord, { merge: true });
    });

    // The operation is now "fire-and-forget", so we resolve immediately.
    return Promise.resolve();
  };

  const validateTodaysAttendance = () => {
    if (!todaysStatusRef) return;
    const validationData = {
      validated: true,
      validatedAt: new Date().toISOString(),
    };
    setDocumentNonBlocking(todaysStatusRef, validationData, { merge: true });
  };

  const reactivateTodaysAttendance = () => {
    if (!todaysStatusRef) return;
    const reactivationData = {
      validated: false,
    };
    updateDocumentNonBlocking(todaysStatusRef, reactivationData);
  };

  const getAttendanceForDate = (date: string) => {
    return attendance.filter(r => r.date === date);
  };
  
  const getPersonnelById = (id: string) => {
    return personnel.find(p => p.id === id);
  };

  const loading = personnelLoading || attendanceLoading || statusLoading || missionsLoading;

  const value: AppContextType = {
    personnel,
    attendance,
    missions,
    addPersonnel,
    addMultiplePersonnel,
    updateAttendance,
    addMission,
    getAttendanceForDate,
    getPersonnelById,
    todaysStatus: todaysStatus || null,
    validateTodaysAttendance,
    reactivateTodaysAttendance,
    loading,
  };

  return (
    <AppContext.Provider value={value}>
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
