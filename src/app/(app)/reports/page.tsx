'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/app-provider';
import type { AttendanceStatus } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getDaysInMonth, format, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusIcons: { [key in AttendanceStatus]: string } = {
  present: '✔️',
  absent: '❌',
  mission: '✈️',
  permission: '🗓️',
};

const statusTooltips: { [key in AttendanceStatus]: string } = {
  present: 'Présent',
  absent: 'Absent',
  mission: 'En Mission',
  permission: 'En Permission',
};

export default function ReportsPage() {
  const { personnel, attendance } = useApp();
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [reportData, setReportData] = useState<any[]>([]);
  const [daysOfMonth, setDaysOfMonth] = useState<Date[]>([]);

  const handleGenerateReport = () => {
    const year = parseInt(selectedMonth.split('-')[0]);
    const month = parseInt(selectedMonth.split('-')[1]) - 1;
    const date = new Date(year, month);

    const days = Array.from(
      { length: getDaysInMonth(date) },
      (_, i) => new Date(year, month, i + 1)
    );
    setDaysOfMonth(days);

    const data = personnel.map(person => {
      const personAttendance = days.map(day => {
        const dayString = format(day, 'yyyy-MM-dd');
        const record = attendance.find(
          a => a.personnelId === person.id && a.date === dayString
        );
        return record ? record.status : 'N/A';
      });
      return { ...person, attendance: personAttendance };
    });
    setReportData(data);
  };
  
  const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      value: format(d, 'yyyy-MM'),
      label: format(d, 'MMMM yyyy', { locale: fr }),
    };
  }), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Générer un Bilan Détaillé</CardTitle>
        <CardDescription>
          Sélectionnez un mois pour générer un rapport de présence détaillé.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Sélectionnez un mois" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateReport} className="w-full sm:w-auto">Générer le rapport</Button>
        </div>

        {reportData.length > 0 ? (
          <div className="overflow-x-auto relative border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-card z-10 w-[200px]">Nom</TableHead>
                  {daysOfMonth.map(day => (
                    <TableHead key={day.toString()} className="text-center min-w-[50px]">{format(day, 'd')}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map(person => (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium sticky left-0 bg-card z-10 whitespace-nowrap">{person.firstName} {person.lastName}</TableCell>
                    {person.attendance.map((status: AttendanceStatus | 'N/A', index: number) => (
                      <TableCell key={index} className="text-center">
                        {status !== 'N/A' ? (
                          <span title={statusTooltips[status]}>{statusIcons[status]}</span>
                        ) : <span className="text-muted-foreground">-</span>}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
            <div className="text-center py-10 text-muted-foreground">
                <p>Aucun rapport généré. Veuillez sélectionner un mois et cliquer sur "Générer le rapport".</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
