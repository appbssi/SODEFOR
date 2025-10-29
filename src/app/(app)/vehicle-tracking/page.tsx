'use client';

import { useState } from 'react';
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
import { useApp } from '@/context/app-provider';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Car, PlusCircle } from 'lucide-react';
import { MissionFormDialog } from '@/components/mission-form-dialog';

export default function VehicleTrackingPage() {
  const { missions, loading } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const missionsWithMileage = missions.filter(m => m.kilometers && m.kilometers > 0);

  const handleNewMission = () => {
    setIsFormOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-muted rounded-md">
                <Car className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Suivi du Kilométrage des Véhicules</CardTitle>
                <CardDescription>
                  Récapitulatif des kilomètres parcourus pour chaque mission.
                </CardDescription>
              </div>
            </div>
            <Button onClick={handleNewMission} className="gap-2 w-full sm:w-auto">
              <PlusCircle className="h-4 w-4" />
              Nouvelle Mission
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Date</TableHead>
                <TableHead>Mission</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Véhicule</TableHead>
                <TableHead className="text-right">Kilomètres</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : missionsWithMileage.length > 0 ? (
                  missionsWithMileage.map((mission) => (
                  <TableRow key={mission.id}>
                    <TableCell>{format(new Date(mission.date), 'd MMMM yyyy', { locale: fr })}</TableCell>
                    <TableCell className="font-medium">{mission.name}</TableCell>
                    <TableCell className="text-muted-foreground">{mission.description}</TableCell>
                    <TableCell>{mission.vehicle}</TableCell>
                    <TableCell className="text-right font-semibold">{mission.kilometers} km</TableCell>
                  </TableRow>
                ))
              ) : (
                  <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                          Aucune mission avec kilométrage enregistré pour le moment.
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <MissionFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        mission={null}
       />
    </>
  );
}
