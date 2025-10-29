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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lock, LockOpen, Rocket } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const statusOptions: { value: AttendanceStatus; label: string }[] = [
  { value: 'present', label: 'Présent' },
  { value: 'absent', label: 'Absent' },
  { value: 'permission', label: 'En Permission' },
];

const statusVariant: { [key in AttendanceStatus]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  present: 'default',
  mission: 'secondary',
  absent: 'destructive',
  permission: 'outline',
};

export default function AttendancePage() {
  const { personnel, attendance, updateAttendance, getPersonnelById, loading, todaysStatus, validateTodaysAttendance, reactivateTodaysAttendance, missions } = useApp();
  const { toast } = useToast();
  const today = new Date().toISOString().split('T')[0];
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [permissionStartDate, setPermissionStartDate] = useState('');
  const [permissionEndDate, setPermissionEndDate] = useState('');
  
  const isValidated = todaysStatus?.validated;

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
        description: `${person?.lastName} ${person?.firstName} est maintenant ${statusOptions.find(s=> s.value === newStatus)?.label}.`,
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
        description: `${selectedPersonnel.lastName} ${selectedPersonnel.firstName} est maintenant en permission.`,
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

  const handleValidation = () => {
    validateTodaysAttendance();
    toast({
      title: 'Pointage Validé!',
      description: 'Le pointage pour aujourd\'hui a été verrouillé.',
    });
  }

  const handleReactivation = () => {
    reactivateTodaysAttendance();
    toast({
      title: 'Modifications Réactivées!',
      description: 'Le pointage pour aujourd\'hui peut de nouveau être modifié.',
      variant: 'default',
    });
  }

  const getStatusForPersonnel = (personnelId: string): AttendanceRecord | undefined => {
    return attendance.find(a => a.personnelId === personnelId && a.date === today);
  };
  
  const getMissionForPersonnel = (personnelId: string) => {
      const attendanceRecord = getStatusForPersonnel(personnelId);
      if(attendanceRecord?.status === 'mission' && attendanceRecord.missionId) {
          const mission = missions.find(m => m.id === attendanceRecord.missionId);
          // Only return the mission if it's active
          if (mission && mission.status !== 'completed') {
            return mission;
          }
      }
      return null;
  }

  const allStatusOptions: { value: AttendanceStatus; label: string }[] = [
    { value: 'present', label: 'Présent' },
    { value: 'absent', label: 'Absent' },
    { value: 'mission', label: 'En Mission' },
    { value: 'permission', label: 'En Permission' },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                  <CardTitle>Pointage du Jour</CardTitle>
                  <CardDescription>
                      Enregistrer la présence, l'absence, ou le statut pour chaque membre du personnel pour le{' '}
                      {format(new Date(), 'd MMMM yyyy', { locale: fr })}.
                  </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {!isValidated && !loading && (
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="gap-2">
                          <Lock className="h-4 w-4" />
                          Valider le Pointage
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous absolument sûr?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Une fois validé, le pointage de ce jour ne pourra plus être modifié.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={handleValidation}>Valider</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                )}
                {isValidated && !loading && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <Button onClick={handleReactivation} variant="secondary" size="icon">
                              <LockOpen className="h-4 w-4" />
                              <span className="sr-only">Réactiver les modifications</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Réactiver les modifications</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                )}
              </div>
          </div>
        </CardHeader>
        <CardContent>
          {isValidated && (
            <Alert className="mb-6 bg-yellow-50 border-yellow-200 text-yellow-800">
                <Lock className="h-4 w-4 !text-yellow-600" />
                <AlertTitle className="font-bold">Pointage Verrouillé</AlertTitle>
                <AlertDescription>
                    Le pointage pour aujourd'hui a été validé et ne peut plus être modifié.
                </AlertDescription>
            </Alert>
          )}
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
                const mission = getMissionForPersonnel(person.id);

                // If the mission is completed, the status from the attendance record might still be 'mission'.
                // We should treat it as 'present' for UI purposes if the mission is done.
                let displayStatus: AttendanceStatus = currentStatusRecord?.status || 'present';
                if (currentStatusRecord?.status === 'mission' && !mission) {
                  displayStatus = 'present'; // Or another default status
                }

                return (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium">{person.lastName} {person.firstName}</TableCell>
                    <TableCell>{person.rank}</TableCell>
                    <TableCell>
                      {currentStatusRecord ? (
                        <div className="flex items-center gap-2">
                            <Badge variant={statusVariant[displayStatus]}>
                              {allStatusOptions.find(s => s.value === displayStatus)?.label}
                            </Badge>
                            {mission && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Rocket className="h-4 w-4 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="font-semibold">{mission.name}</p>
                                            <p className="text-xs">{mission.description}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                      ) : (
                        <Badge variant="outline">Non défini</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={displayStatus}
                        onValueChange={(value) => handleStatusChange(person.id, value as AttendanceStatus)}
                        disabled={isValidated || mission !== null}
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
              Pour {selectedPersonnel?.lastName} {selectedPersonnel?.firstName}.
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
