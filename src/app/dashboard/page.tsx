'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/app-provider';
import { Users, UserCheck, UserX, Plane } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { summary, loading } = useApp();

  const stats = [
    {
      title: 'Total Personnel',
      value: summary.totalPersonnel,
      icon: Users,
      color: 'text-blue-400',
    },
    {
      title: 'Présents',
      value: summary.presentCount,
      icon: UserCheck,
      color: 'text-yellow-400',
    },
    {
      title: 'Absents',
      value: summary.absentCount,
      icon: UserX,
      color: 'text-pink-600',
    },
    {
      title: 'En Mission',
      value: summary.missionCount,
      icon: Plane,
      color: 'text-green-400',
    },
  ];

  return (
    <main>
        <div className="grid mb-4 pb-10 px-8 mx-4 rounded-3xl bg-gray-100 border-4 border-primary">
            <div className="grid grid-cols-12 gap-6">
                <div className="grid grid-cols-12 col-span-12 gap-6 xxl:col-span-9">
                    <div className="col-span-12 mt-8">
                        <div className="flex items-center h-10 intro-y">
                            <h2 className="mr-5 text-lg font-medium truncate">Tableau de Bord</h2>
                        </div>
                        <div className="grid grid-cols-12 gap-6 mt-5">
                            {stats.map((stat, index) => (
                                <div key={index} className="transform hover:scale-105 transition duration-300 shadow-xl rounded-lg col-span-12 sm:col-span-6 xl:col-span-3 intro-y bg-white">
                                    <div className="p-5">
                                        <div className="flex justify-between">
                                            <stat.icon className={`h-7 w-7 ${stat.color}`} />
                                            <div className="bg-primary-500 rounded-full h-6 px-2 flex justify-items-center text-white font-semibold text-sm bg-primary">
                                                <span className="flex items-center">{summary.totalPersonnel > 0 ? `${Math.round((stat.value / summary.totalPersonnel) * 100)}%` : '0%'}</span>
                                            </div>
                                        </div>
                                        <div className="ml-2 w-full flex-1">
                                            <div>
                                                <div className="mt-3 text-3xl font-bold leading-8">
                                                    {loading ? <Skeleton className="h-8 w-16" /> : stat.value}
                                                </div>
                                                <div className="mt-1 text-base text-gray-600">{stat.title}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
  );
}
