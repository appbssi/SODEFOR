'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { useApp } from '@/context/app-provider';
import { Users, UserX, Plane } from 'lucide-react';
import { useMemo } from 'react';
import { isWithinInterval, parseISO, startOfDay } from 'date-fns';

export default function DashboardPage() {
  const { personnel, attendance, missions } = useApp();

  const today = new Date().toISOString().split('T')[0];
  const todaysAttendance = attendance.filter(a => a.date === today);

  const totalPersonnel = personnel.length;

  const personnelInActiveMissions = useMemo(() => {
    const personnelIds = new Set<string>();
    missions
      .filter(m => m.status === 'active')
      .forEach(m => {
        m.personnelIds.forEach(id => personnelIds.add(id));
      });
    return personnelIds;
  }, [missions]);

  const personnelOnPermission = useMemo(() => {
    const todayDate = startOfDay(new Date());
    const personnelIds = new Set<string>();
    const allPermissionRecords = attendance.filter(a => 
        (a.status === 'permission' && a.date === today) || 
        (a.permissionDuration?.start && a.permissionDuration?.end)
    );
    
    allPermissionRecords.forEach(record => {
      if (record.permissionDuration && record.permissionDuration.start && record.permissionDuration.end) {
        try {
          const start = startOfDay(parseISO(record.permissionDuration.start));
          const end = startOfDay(parseISO(record.permissionDuration.end));
          if (isWithinInterval(todayDate, { start, end })) {
            personnelIds.add(record.personnelId);
          }
        } catch (e) {
          console.error("Invalid permission date format:", record);
        }
      } else if (record.status === 'permission' && record.date === today) {
        personnelIds.add(record.personnelId);
      }
    });
    return personnelIds;
  }, [attendance, today]);

  const absentPersonnel = useMemo(() => {
    const personnelIds = new Set<string>();
    todaysAttendance
        .filter(a => a.status === 'absent')
        .forEach(a => personnelIds.add(a.personnelId));
    return personnelIds;
  }, [todaysAttendance]);
  
  const unavailablePersonnel = useMemo(() => {
    const unavailable = new Set<string>();
    personnelInActiveMissions.forEach(id => unavailable.add(id));
    personnelOnPermission.forEach(id => unavailable.add(id));
    absentPersonnel.forEach(id => unavailable.add(id));
    return unavailable;
  }, [personnelInActiveMissions, personnelOnPermission, absentPersonnel]);

  const missionCount = personnelInActiveMissions.size;
  const absentCount = absentPersonnel.size;

  const stats = [
    { title: 'Total du Personnel', value: totalPersonnel, icon: Users, color: 'text-foreground' },
    { title: 'Absents', value: absentCount, icon: UserX, color: 'text-red-600' },
    { title: 'En Mission', value: missionCount, icon: Plane, color: 'text-blue-600' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map(stat => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.max(0, stat.value)}</div>
              </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
