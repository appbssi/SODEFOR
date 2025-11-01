'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/app-provider';
import { Users, UserCheck, UserX, Plane, UserMinus, ShoppingCart, BarChart, Activity, Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Pie, PieChart, Cell } from 'recharts';


const chartData = [
  { name: 'Jan', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Feb', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Mar', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Apr', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'May', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Jun', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Jul', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Aug', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Sep', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Oct', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Nov', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Dec', total: Math.floor(Math.random() * 5000) + 1000 },
];

const pieChartData = [
    { name: 'Présents', value: 400 },
    { name: 'Absents', value: 30 },
    { name: 'Missions', value: 50 },
    { name: 'Permissions', value: 20 },
];
const COLORS = ['#10B981', '#F87171', '#60A5FA', '#FBBF24'];


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

                    <div className="col-span-12 mt-5">
                        <div className="grid gap-2 grid-cols-1 lg:grid-cols-2">
                           <Card>
                                <CardHeader>
                                    <CardTitle>Activité Mensuelle</CardTitle>
                                </CardHeader>
                                <CardContent className="pl-2">
                                    <ResponsiveContainer width="100%" height={350}>
                                        <RechartsBarChart data={chartData}>
                                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                            <Tooltip />
                                            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                        </RechartsBarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle>Répartition du Statut</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <PieChart>
                                            <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                                {pieChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="col-span-12 mt-5">
                        <Card>
                          <CardHeader>
                            <CardTitle>Personnel Récent</CardTitle>
                          </CardHeader>
                          <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Nom du Produit</TableHead>
                                    <TableHead>Matricule</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Action</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {useApp().personnel.slice(0, 3).map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell>
                                                <p>{p.lastName} {p.firstName}</p>
                                                <p className="text-xs text-gray-400">{p.rank}</p>
                                            </TableCell>
                                            <TableCell>{p.matricule}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-green-500">
                                                    <UserCheck className="w-5 h-5 mr-1" />
                                                    <p>Actif</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-5 w-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem>Modifier</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-500">Supprimer</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                              </Table>
                          </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    </main>
  );
}