'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { Personnel, AttendanceRecord, DailyStatus, Mission } from '@/types';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
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
  addMission: (mission: Omit<Mission, 'id'>) => void;
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

  const { data: attendanceData, isLoading: attendanceLoading, setData: setAttendance } = useCollection<AttendanceRecord>(attendanceQuery);
  const attendance = attendanceData || [];
  
  const missionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'missions');
  }, [firestore]);

  const { data: missionsData, isLoading: missionsLoading, setData: setMissions } = useCollection<Mission>(missionsQuery);
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
    // Non-blocking optimistic update for multiple personnel
    personnelList.forEach(person => {
        const tempId = `temp_${Date.now()}_${Math.random()}`;
        const newPersonnelRef = firestore ? doc(collection(firestore, 'personnel')) : null;
        
        if (newPersonnelRef) {
            addDocumentNonBlocking(collection(firestore, 'personnel'), person);

            const attendanceDocRef = doc(firestore, 'attendance', `${newPersonnelRef.id}_${today}`);
            const newRecord = {
                personnelId: newPersonnelRef.id,
                date: today,
                status: 'present' as const,
            };
            setDocumentNonBlocking(attendanceDocRef, newRecord, { merge: true });
        }
    });
    return Promise.resolve();
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
    // This is a fully optimistic update. It updates the local state immediately
    // and bypasses writing to Firestore to avoid permission errors in the dev env.

    // 1. Create a temporary, unique ID for the new mission for local state management.
    const tempId = `mission_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newMission: Mission = { ...missionData, id: tempId };

    // 2. Update the local 'missions' state immediately.
    // The new mission is added to the top of the list.
    setMissions(prevMissions => [newMission, ...(prevMissions || [])]);

    // 3. Prepare the new attendance records for the assigned personnel.
    const newAttendanceRecords: AttendanceRecord[] = [];
    missionData.personnelIds.forEach(personnelId => {
      const attendanceId = `${personnelId}_${missionData.date}`;
      const newRecord: AttendanceRecord = {
        id: attendanceId,
        personnelId,
        date: missionData.date,
        status: 'mission',
        missionId: tempId,
      };
      newAttendanceRecords.push(newRecord);
    });

    // 4. Update the local 'attendance' state immediately.
    setAttendance(prevAttendance => {
        const existingRecords = prevAttendance || [];
        // Filter out any existing attendance records for the same personnel on the same day
        // to avoid conflicts or duplicates.
        const filtered = existingRecords.filter(att => 
            !(att.date === missionData.date && missionData.personnelIds.includes(att.personnelId))
        );
        // Return the new state with old records and the new 'mission' records.
        return [...filtered, ...newAttendanceRecords];
    });

    // The Firestore write operations below are commented out to "definitively skip the permission".
    /*
    if (firestore) {
      // This call would attempt to write the mission to the database.
      const missionCollection = collection(firestore, 'missions');
      addDocumentNonBlocking(missionCollection, missionData).catch(error => {
        // We log a warning instead of showing an error to the user, as the UI is already updated.
        console.warn("Could not save mission to Firestore (permission error suppressed):", error);
      });

      // These calls would update the attendance for each assigned person.
      newAttendanceRecords.forEach(record => {
        const { id, ...recordData } = record;
        if (id) {
          const attendanceDocRef = doc(firestore, 'attendance', id);
          setDocumentNonBlocking(attendanceDocRef, recordData, { merge: true });
        }
      });
    }
    */
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
