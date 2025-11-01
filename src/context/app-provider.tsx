'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useMemo } from 'react';
import type { Personnel, AttendanceRecord, DailyStatus, Mission, AttendanceStatus, PersonnelDailyStatus } from '@/types';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, writeBatch, Timestamp } from 'firebase/firestore';
import {
  addDocumentNonBlocking,
  setDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import { getDaysBetweenDates } from '@/lib/utils';
import { isWithinInterval, parseISO, startOfDay, format } from 'date-fns';
import Link from 'next/link';

interface Summary {
    totalPersonnel: number;
    presentCount: number;
    absentCount: number;
    missionCount: number;
    permissionCount: number;
}
interface AppContextType {
  personnel: Personnel[];
  attendance: AttendanceRecord[];
  missions: Mission[];
  addPersonnel: (person: Omit<Personnel, 'id'>) => void;
  updatePersonnel: (id: string, person: Partial<Omit<Personnel, 'id'>>) => void;
  deletePersonnel: (id: string) => void;
  addMultiplePersonnel: (personnelList: Omit<Personnel, 'id'>[]) => Promise<void>;
  updateAttendance: (record: Partial<AttendanceRecord> & { personnelId: string; date: string }) => void;
  addMission: (mission: Omit<Mission, 'id' | 'status'>) => void;
  updateMission: (missionId: string, data: Partial<Mission>) => void;
  deleteMission: (missionId: string) => void;
  getPersonnelById: (id: string) => Personnel | undefined;
  getMissionById: (id: string) => Mission | undefined;
  todaysStatus: DailyStatus | null;
  validateTodaysAttendance: () => void;
  reactivateTodaysAttendance: () => void;
  getPersonnelStatusForToday: (personnelId: string) => PersonnelDailyStatus;
  getPersonnelStatusForDateRange: (personnelId: string, startDate: string, endDate: string) => PersonnelDailyStatus[];
  summary: Summary;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const firestore = useFirestore();
  const today = new Date().toISOString().split('T')[0];

  const personnelQuery = useMemoFirebase(() => firestore ? collection(firestore, 'personnel') : null, [firestore]);
  const { data: personnelData, isLoading: personnelLoading } = useCollection<Personnel>(personnelQuery);
  const personnel = useMemo(() => (personnelData || []).sort((a, b) => a.lastName.localeCompare(b.lastName)), [personnelData]);

  const attendanceQuery = useMemoFirebase(() => firestore ? collection(firestore, 'attendance') : null, [firestore]);
  const { data: attendanceData, isLoading: attendanceLoading } = useCollection<AttendanceRecord>(attendanceQuery);
  const attendance = useMemo(() => attendanceData || [], [attendanceData]);

  const missionsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'missions') : null, [firestore]);
  const { data: missionsData, isLoading: missionsLoading } = useCollection<Mission>(missionsQuery);
  const missions = useMemo(() => (missionsData || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [missionsData]);

  const todaysStatusRef = useMemoFirebase(() => firestore ? doc(firestore, 'dailyStatus', today) : null, [firestore, today]);
  const { data: todaysStatus, isLoading: statusLoading } = useDoc<DailyStatus>(todaysStatusRef);
  
  const loading = personnelLoading || attendanceLoading || statusLoading || missionsLoading;

  const getPersonnelStatusOnDate = (personnelId: string, date: string): PersonnelDailyStatus => {
    // 1. Check for a direct attendance record for that day
    const directRecord = attendance.find(a => a.personnelId === personnelId && a.date === date);
    if (directRecord) {
      return { date, status: directRecord.status, missionId: directRecord.missionId };
    }

    // 2. Check if the person is on a mission that is active on that day
    const missionRecord = missions.find(m => m.personnelIds.includes(personnelId) && m.date === date && m.status === 'active');
    if (missionRecord) {
        return { date, status: 'mission', missionId: missionRecord.id };
    }

    // 3. Check if the person is on a multi-day permission
    const todayDate = startOfDay(parseISO(date));
    const permissionRecord = attendance.find(a => 
      a.personnelId === personnelId &&
      a.status === 'permission' &&
      a.permissionDuration?.start &&
      a.permissionDuration?.end &&
      isWithinInterval(todayDate, { 
        start: startOfDay(parseISO(a.permissionDuration.start)), 
        end: startOfDay(parseISO(a.permissionDuration.end)) 
      })
    );
    if (permissionRecord) {
      return { date, status: 'permission' };
    }

    // 4. Default status
    return { date, status: 'present' };
  }

  const getPersonnelStatusForToday = (personnelId: string): PersonnelDailyStatus => {
    return getPersonnelStatusOnDate(personnelId, today);
  };
  
  const getPersonnelStatusForDateRange = (personnelId: string, startDate: string, endDate: string): PersonnelDailyStatus[] => {
    const dates = getDaysBetweenDates(startDate, endDate);
    return dates.map(date => {
        // Find a record with a specific status on that day
        const directRecord = attendance.find(a => a.personnelId === personnelId && a.date === date);
        if (directRecord) {
            return { date, status: directRecord.status, missionId: directRecord.missionId };
        }

        // Check for multi-day permission covering that day
        const dateObj = startOfDay(parseISO(date));
        const permissionRecord = attendance.find(a => 
            a.personnelId === personnelId && 
            a.status === 'permission' &&
            a.permissionDuration?.start &&
            a.permissionDuration?.end &&
            isWithinInterval(dateObj, {
                start: startOfDay(parseISO(a.permissionDuration.start)),
                end: startOfDay(parseISO(a.permissionDuration.end))
            })
        );
        if (permissionRecord) {
            return { date, status: 'permission' };
        }

        // Check for an active mission on that day
        const missionRecord = missions.find(m => m.personnelIds.includes(personnelId) && m.date === date && m.status === 'active');
        if (missionRecord) {
            return { date, status: 'mission', missionId: missionRecord.id };
        }
        
        // Default to N/A if no information found
        return { date, status: 'N/A' };
    });
  };

  const summary: Summary = useMemo(() => {
    if (loading) {
        return { totalPersonnel: 0, presentCount: 0, absentCount: 0, missionCount: 0, permissionCount: 0 };
    }
    const dailyStatuses = personnel.map(p => getPersonnelStatusForToday(p.id));
    
    return dailyStatuses.reduce((acc, statusInfo) => {
        acc.totalPersonnel++;
        if (statusInfo.status === 'present') acc.presentCount++;
        else if (statusInfo.status === 'absent') acc.absentCount++;
        else if (statusInfo.status === 'mission') acc.missionCount++;
        else if (statusInfo.status === 'permission') acc.permissionCount++;
        return acc;
    }, { totalPersonnel: 0, presentCount: 0, absentCount: 0, missionCount: 0, permissionCount: 0 });

  }, [personnel, attendance, missions, loading, today]);


  const addPersonnel = (person: Omit<Personnel, 'id'>) => {
    if (!firestore) return;
    const personnelCollection = collection(firestore, 'personnel');
    addDocumentNonBlocking(personnelCollection, person);
  };

  const updatePersonnel = (id: string, person: Partial<Omit<Personnel, 'id'>>) => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, 'personnel', id), person);
  };
  
  const deletePersonnel = async (id: string) => {
      if (!firestore) return;
      const batch = writeBatch(firestore);
      
      // Delete personnel document
      batch.delete(doc(firestore, 'personnel', id));
      
      // Find and delete related attendance records
      const relatedAttendance = attendance.filter(a => a.personnelId === id);
      relatedAttendance.forEach(att => {
        if(att.id) {
          batch.delete(doc(firestore, 'attendance', att.id));
        }
      });

      await batch.commit();
  };

  const addMultiplePersonnel = async (personnelList: Omit<Personnel, 'id'>[]) => {
     if (!firestore) return;
     const batch = writeBatch(firestore);
     personnelList.forEach(person => {
        const newDocRef = doc(collection(firestore, 'personnel'));
        batch.set(newDocRef, person);
     });
     await batch.commit();
  };

  const updateAttendance = (record: Partial<AttendanceRecord> & { personnelId: string; date: string }) => {
    if (!firestore) return;
    
    const { personnelId, date, status } = record;

    if(status === 'permission' && record.permissionDuration?.start && record.permissionDuration?.end) {
        const dates = getDaysBetweenDates(record.permissionDuration.start, record.permissionDuration.end);
        const batch = writeBatch(firestore);
        dates.forEach(d => {
            const attendanceId = `${personnelId}_${d}`;
            const attendanceDocRef = doc(firestore, 'attendance', attendanceId);
            const fullRecord = { ...record, date: d, id: attendanceId };
            batch.set(attendanceDocRef, fullRecord, { merge: true });
        });
        batch.commit();
    } else {
        const attendanceId = `${personnelId}_${date}`;
        const attendanceDocRef = doc(firestore, 'attendance', attendanceId);
        setDocumentNonBlocking(attendanceDocRef, record, { merge: true });
    }
  };
  
  const addMission = (missionData: Omit<Mission, 'id' | 'status'>) => {
    if (!firestore) return;
    const batch = writeBatch(firestore);
    const newMissionRef = doc(collection(firestore, 'missions'));
    
    batch.set(newMissionRef, { ...missionData, status: 'active' });

    if (missionData.personnelIds && missionData.personnelIds.length > 0) {
      missionData.personnelIds.forEach(personnelId => {
        const attendanceId = `${personnelId}_${missionData.date}`;
        const attendanceDocRef = doc(firestore, 'attendance', attendanceId);
        const attendanceRecord: Omit<AttendanceRecord, 'id'> = {
          personnelId,
          date: missionData.date,
          status: 'mission',
          missionId: newMissionRef.id,
        };
        batch.set(attendanceDocRef, attendanceRecord, { merge: true });
      });
    }
    batch.commit();
  };

  const updateMission = (missionId: string, data: Partial<Mission>) => {
    if (!firestore) return;
    const missionRef = doc(firestore, 'missions', missionId);
    
    const originalMission = missions.find(m => m.id === missionId);
    if (!originalMission) return;

    const batch = writeBatch(firestore);
    batch.update(missionRef, data);

    const newPersonnelIds = new Set(data.personnelIds || originalMission.personnelIds);
    const oldPersonnelIds = new Set(originalMission.personnelIds);
    const missionDate = data.date || originalMission.date;

    // Personnel added
    newPersonnelIds.forEach(id => {
        if (!oldPersonnelIds.has(id)) {
            const attendanceRef = doc(firestore, 'attendance', `${id}_${missionDate}`);
            batch.set(attendanceRef, { personnelId: id, date: missionDate, status: 'mission', missionId }, { merge: true });
        }
    });

    // Personnel removed
    oldPersonnelIds.forEach(id => {
        if (!newPersonnelIds.has(id)) {
            const attendanceRef = doc(firestore, 'attendance', `${id}_${missionDate}`);
            batch.set(attendanceRef, { personnelId: id, date: missionDate, status: 'present', missionId: null }, { merge: true });
        }
    });
    
    batch.commit();
  };

  const deleteMission = async (missionId: string) => {
    if (!firestore) return;
    const missionRef = doc(firestore, 'missions', missionId);
    
    const missionToDelete = missions.find(m => m.id === missionId);
    if (!missionToDelete) return;
    
    const batch = writeBatch(firestore);

    // Reset attendance for associated personnel
    if (missionToDelete.personnelIds) {
      missionToDelete.personnelIds.forEach(personnelId => {
        const attendanceId = `${personnelId}_${missionToDelete.date}`;
        const attendanceRef = doc(firestore, 'attendance', attendanceId);
        batch.set(attendanceRef, { status: 'present', missionId: null }, { merge: true });
      });
    }
    
    batch.delete(missionRef);
    await batch.commit();
  };

  const validateTodaysAttendance = () => {
    if (!firestore || !todaysStatusRef) return;
    
    const batch = writeBatch(firestore);

    personnel.forEach(p => {
        const statusInfo = getPersonnelStatusForToday(p.id);
        const attendanceId = `${p.id}_${today}`;
        const attendanceRef = doc(firestore, 'attendance', attendanceId);
        const recordToSave: Partial<AttendanceRecord> = {
            personnelId: p.id,
            date: today,
            status: statusInfo.status,
            missionId: statusInfo.missionId || null,
        };

        // Find and preserve permission duration if it exists for today
        const permissionRecord = attendance.find(a => a.personnelId === p.id && a.date === today && a.status === 'permission' && a.permissionDuration);
        if (permissionRecord) {
            recordToSave.permissionDuration = permissionRecord.permissionDuration;
        }

        batch.set(attendanceRef, recordToSave, { merge: true });
    });

    const validationData = {
        validated: true,
        validatedAt: Timestamp.now(),
    };
    batch.set(todaysStatusRef, validationData, { merge: true });

    batch.commit().catch(console.error);
  };

  const reactivateTodaysAttendance = () => {
    if (!todaysStatusRef) return;
    updateDocumentNonBlocking(todaysStatusRef, { validated: false });
  };

  const getPersonnelById = (id: string) => personnel.find(p => p.id === id);
  const getMissionById = (id: string) => missions.find(m => m.id === id);


  const value: AppContextType = {
    personnel,
    attendance,
    missions,
    addPersonnel,
    updatePersonnel,
    deletePersonnel,
    addMultiplePersonnel,
    updateAttendance,
    addMission,
    updateMission,
    deleteMission,
    getPersonnelById,
    getMissionById,
    todaysStatus: todaysStatus || null,
    validateTodaysAttendance,
    reactivateTodaysAttendance,
    getPersonnelStatusForToday,
    getPersonnelStatusForDateRange,
    summary,
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
