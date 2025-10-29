'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { useApp } from '@/context/app-provider';
import { Users, UserCheck, UserX, Plane, Coffee, PersonStanding } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import { useMemo } from 'react';

const ICONS: { [key: string]: React.ElementType } = {
  present: UserCheck,
  absent: UserX,
  mission: Plane,
  permission: Coffee,
};

const STATUS_TRANSLATION: { [key: string]: string } = {
  present: 'Présent',
  absent: 'Absent',
  mission: 'En Mission',
  permission: 'En Permission',
};

const COLORS: { [key: string]: string } = {
  present: 'hsl(var(--chart-2))',
  absent: 'hsl(var(--chart-5))',
  mission: 'hsl(var(--chart-4))',
  permission: 'hsl(var(--chart-1))',
};

export default function DashboardPage() {
  const { personnel, getAttendanceForDate, getPersonnelById } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const todaysAttendance = getAttendanceForDate(today);

  const totalPersonnel = personnel.length;
  const presentCount = todaysAttendance.filter(a => a.status === 'present').length;
  const absentCount = todaysAttendance.filter(a => a.status === 'absent').length;
  const missionCount = todaysAttendance.filter(a => a.status === 'mission').length;
  const permissionCount = todaysAttendance.filter(a => a.status === 'permission').length;
  
  const stats = [
    { title: 'Total du Personnel', value: totalPersonnel, icon: Users, color: 'text-foreground' },
    { title: 'Présents au Service', value: presentCount, icon: UserCheck, color: 'text-green-600' },
    { title: 'Absents', value: absentCount, icon: UserX, color: 'text-red-600' },
    { title: 'En Mission', value: missionCount, icon: Plane, color: 'text-blue-600' },
    { title: 'En Permission', value: permissionCount, icon: Coffee, color: 'text-yellow-600' },
  ];

  const chartData = useMemo(() => [
    { name: 'Présents', value: presentCount, fill: COLORS.present },
    { name: 'Absents', value: absentCount, fill: COLORS.absent },
    { name: 'En Mission', value: missionCount, fill: COLORS.mission },
    { name: 'En Permission', value: permissionCount, fill: COLORS.permission },
  ].filter(d => d.value > 0), [presentCount, absentCount, missionCount, permissionCount]);

  const chartConfig = useMemo(() => {
    return chartData.reduce((acc, item) => {
      acc[item.name] = { label: item.name, color: item.fill };
      return acc;
    }, {} as any);
  }, [chartData]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {stats.map(stat => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Aperçu du jour</CardTitle>
            <CardDescription>Répartition du statut du personnel pour aujourd'hui.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                   {chartData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
            <CardDescription>Mises à jour du statut d'aujourd'hui.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysAttendance.length > 0 ? todaysAttendance.slice(0,5).map(record => {
                 const person = getPersonnelById(record.personnelId);
                 if (!person) return null;
                 const Icon = ICONS[record.status];
                 const color = chartConfig[STATUS_TRANSLATION[record.status]]?.color || '#ccc';
                 return (
                   <div key={record.personnelId} className="flex items-center gap-4">
                     <div className="p-2 rounded-full" style={{backgroundColor: `${color}20`}}>
                        <Icon className="h-5 w-5" style={{color: color}} />
                     </div>
                     <div className="flex-grow">
                       <p className="font-medium">{person.lastName} {person.firstName}</p>
                       <p className="text-sm text-muted-foreground">{STATUS_TRANSLATION[record.status]}</p>
                     </div>
                   </div>
                 )
              }) : <p className="text-sm text-muted-foreground">Aucune activité aujourd'hui.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
