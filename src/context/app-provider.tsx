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
  deleteDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { getDaysBetweenDates } from '@/lib/utils';

interface AppContextType {
  personnel: Personnel[];
  attendance: AttendanceRecord[];
  missions: Mission[];
  addPersonnel: (person: Omit<Personnel, 'id'>) => void;
  addMultiplePersonnel: (personnelList: Omit<Personnel, 'id'>[]) => Promise<void>;
  updateAttendance: (record: Partial<AttendanceRecord> & { personnelId: string; date: string }) => void;
  addMission: (mission: Omit<Mission, 'id' | 'status'>) => void;
  updateMission: (missionId: string, data: Partial<Mission>) => void;
  deleteMission: (missionId: string) => void;
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
  
  const addMission = (missionData: Omit<Mission, 'id' | 'status'>) => {
    if (!firestore) return;
    const missionsCollection = collection(firestore, 'missions');
    
    // Optimistically update UI
    const tempId = `mission_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newMission: Mission = { ...missionData, id: tempId, status: 'active' };
    setMissions(prevMissions => [newMission, ...(prevMissions || [])]);

    if (missionData.personnelIds && missionData.personnelIds.length > 0) {
      const newAttendanceRecords: AttendanceRecord[] = [];
      missionData.personnelIds.forEach(personnelId => {
        const attendanceId = `${personnelId}_${missionData.date}`;
        const newRecord: AttendanceRecord = {
          id: attendanceId,
          personnelId,
          date: missionData.date,
          status: 'mission',
          missionId: tempId, // Use temp ID for local consistency
        };
        newAttendanceRecords.push(newRecord);
      });
      setAttendance(prevAttendance => {
        const existingRecords = prevAttendance || [];
        const filtered = existingRecords.filter(att => 
            !(att.date === missionData.date && missionData.personnelIds.includes(att.personnelId))
        );
        return [...filtered, ...newAttendanceRecords];
      });
    }

    addDocumentNonBlocking(missionsCollection, { ...missionData, status: 'active' })
      .then(docRef => {
        if (!docRef) return;
        const newMissionId = docRef.id;

        // Update local state with real ID
        setMissions(prevMissions => prevMissions?.map(m => m.id === tempId ? { ...m, id: newMissionId } : m) || []);
        
        if (missionData.personnelIds && missionData.personnelIds.length > 0) {
          missionData.personnelIds.forEach(personnelId => {
            const attendanceId = `${personnelId}_${missionData.date}`;
            const attendanceDocRef = doc(firestore, 'attendance', attendanceId);
            const attendanceRecord: Omit<AttendanceRecord, 'id'> = {
              personnelId,
              date: missionData.date,
              status: 'mission',
              missionId: newMissionId, // Use real mission ID
            };
            setDocumentNonBlocking(attendanceDocRef, attendanceRecord, { merge: true });
          });
        }
      });
  };

  const updateMission = (missionId: string, data: Partial<Mission>) => {
    if (!firestore) return;
    const missionRef = doc(firestore, 'missions', missionId);
    updateDocumentNonBlocking(missionRef, data);
  };

  const deleteMission = (missionId: string) => {
    if (!firestore) return;
    const missionRef = doc(firestore, 'missions', missionId);
    
    const missionToDelete = missions.find(m => m.id === missionId);
    
    // Reset attendance for associated personnel
    if (missionToDelete && missionToDelete.personnelIds) {
      missionToDelete.personnelIds.forEach(personnelId => {
        const attendanceId = `${personnelId}_${missionToDelete.date}`;
        const attendanceRef = doc(firestore, 'attendance', attendanceId);
        // This assumes reverting to 'present'. You might want a more complex logic.
        updateDocumentNonBlocking(attendanceRef, { status: 'present', missionId: '' });
      });
    }

    deleteDocumentNonBlocking(missionRef);
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
    updateMission,
    deleteMission,
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
