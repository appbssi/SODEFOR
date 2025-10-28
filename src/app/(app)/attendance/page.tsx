'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { useApp } from '@/context/app-provider';
import type { AttendanceStatus, Personnel, AttendanceRecord } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';


const statusOptions: { value: AttendanceStatus; label: string }[] = [
  { value: 'present', label: 'Présent' },
  { value: 'absent', label: 'Absent' },
  { value: 'mission', label: 'En Mission' },
  { value: 'permission', label: 'En Permission' },
];

const statusVariant: { [key in AttendanceStatus]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  present: 'default',
  mission: 'secondary',
  absent: 'destructive',
  permission: 'outline',
};

export default function AttendancePage() {
  const { personnel, attendance, updateAttendance, getPersonnelById, loading } = useApp();
  const { toast } = useToast();
  const today = new Date().toISOString().split('T')[0];
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [permissionStartDate, setPermissionStartDate] = useState('');
  const [permissionEndDate, setPermissionEndDate] = useState('');

  const handleStatusChange = (personnelId: string, newStatus: AttendanceStatus) => {
    if (newStatus === 'permission') {
      const person = getPersonnelById(personnelId);
      setSelectedPersonnel(person || null);
      setPermissionModalOpen(true);
    } else {
      updateAttendance({
        personnelId,
        date: today,
        status: newStatus,
      });
      const person = getPersonnelById(personnelId);
      toast({
        title: 'Statut mis à jour',
        description: `${person?.firstName} ${person?.lastName} est maintenant ${statusOptions.find(s=> s.value === newStatus)?.label}.`,
      });
    }
  };

  const handlePermissionSubmit = () => {
    if (selectedPersonnel && permissionStartDate && permissionEndDate) {
      updateAttendance({
        personnelId: selectedPersonnel.id,
        date: today,
        status: 'permission',
        permissionDuration: {
          start: permissionStartDate,
          end: permissionEndDate,
        },
      });
      toast({
        title: 'Statut mis à jour',
        description: `${selectedPersonnel.firstName} ${selectedPersonnel.lastName} est maintenant en permission.`,
      });
      setPermissionModalOpen(false);
      setSelectedPersonnel(null);
      setPermissionStartDate('');
      setPermissionEndDate('');
    } else {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir les dates de début et de fin.',
        variant: 'destructive',
      });
    }
  };

  const getStatusForPersonnel = (personnelId: string): AttendanceRecord | undefined => {
    return attendance.find(a => a.personnelId === personnelId && a.date === today);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pointage du Jour</CardTitle>
          <CardDescription>
            Enregistrer la présence, l'absence, ou le statut pour chaque membre du personnel pour le{' '}
            {format(new Date(), 'd MMMM yyyy', { locale: fr })}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom Complet</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Statut Actuel</TableHead>
                <TableHead className="w-[200px] text-right">Changer Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({length: 5}).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-10 w-[180px] float-right" /></TableCell>
                  </TableRow>
                ))
              ) : personnel.map((person) => {
                const currentStatusRecord = getStatusForPersonnel(person.id);
                return (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium">{person.firstName} {person.lastName}</TableCell>
                    <TableCell>{person.rank}</TableCell>
                    <TableCell>
                      {currentStatusRecord ? (
                        <Badge variant={statusVariant[currentStatusRecord.status]}>
                          {statusOptions.find(s => s.value === currentStatusRecord.status)?.label}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Non défini</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={currentStatusRecord?.status || ''}
                        onValueChange={(value) => handleStatusChange(person.id, value as AttendanceStatus)}
                      >
                        <SelectTrigger className="w-full md:w-[180px] float-right">
                          <SelectValue placeholder="Changer statut..." />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={permissionModalOpen} onOpenChange={setPermissionModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Définir la durée de la permission</DialogTitle>
            <DialogDescription>
              Pour {selectedPersonnel?.firstName} {selectedPersonnel?.lastName}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start-date" className="text-right">
                Début
              </Label>
              <Input
                id="start-date"
                type="date"
                value={permissionStartDate}
                onChange={(e) => setPermissionStartDate(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end-date" className="text-right">
                Fin
              </Label>
              <Input
                id="end-date"
                type="date"
                value={permissionEndDate}
                onChange={(e) => setPermissionEndDate(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionModalOpen(false)}>Annuler</Button>
            <Button onClick={handlePermissionSubmit}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
