'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/app-provider';
import { Users, UserX, Plane } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { summary, loading } = useApp();

  const stats = [
    {
      title: 'Total du Personnel',
      value: summary.totalPersonnel,
      icon: Users,
      color: 'text-foreground',
    },
    {
      title: 'Absents Aujourd\'hui',
      value: summary.absentCount,
      icon: UserX,
      color: 'text-red-500',
    },
    {
      title: 'En Mission Aujourd\'hui',
      value: summary.missionCount,
      icon: Plane,
      color: 'text-blue-500',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
