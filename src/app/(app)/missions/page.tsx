'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Clock } from 'lucide-react';
import { useApp } from '@/context/app-provider';
import type { Mission } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MissionFormDialog } from '@/components/mission-form-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function MissionsPage() {
  const { missions, getPersonnelById, loading } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  const handleEditMission = (mission: Mission) => {
    setSelectedMission(mission);
    setIsFormOpen(true);
  };

  const handleNewMission = () => {
    setSelectedMission(null);
    setIsFormOpen(true);
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const upcomingMissions = missions.filter(m => m.date >= today);
  const pastMissions = missions.filter(m => m.date < today);


  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestion des T.P.P.H.T</h1>
          <p className="text-muted-foreground">Créez et gérez les missions de votre personnel.</p>
        </div>
        <Button onClick={handleNewMission} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Nouvelle Mission
        </Button>
      </div>
      
      <div className="space-y-8">
        <div>
            <h2 className="text-xl font-semibold mb-4">Missions à venir et en cours</h2>
            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-56" />
                    <Skeleton className="h-56" />
                </div>
            ) : upcomingMissions.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {upcomingMissions.map(mission => (
                        <Card key={mission.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{mission.name}</CardTitle>
                                <CardDescription>
                                    Le {format(new Date(mission.date), 'd MMMM yyyy', { locale: fr })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm mb-4">{mission.description}</p>
                                <h4 className="font-semibold mb-2 text-sm">Personnel assigné:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {mission.personnelIds.map(id => {
                                        const p = getPersonnelById(id);
                                        return p ? <Badge key={id} variant="secondary">{p.lastName} {p.firstName}</Badge> : null;
                                    })}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>{mission.totalHours || 0} Heures totales</span>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground text-sm">Aucune mission à venir ou en cours.</p>
            )}
        </div>

        <div>
            <h2 className="text-xl font-semibold mb-4">Missions terminées</h2>
            {loading ? (
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-56" />
                </div>
            ) : pastMissions.length > 0 ? (
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pastMissions.map(mission => (
                        <Card key={mission.id} className="opacity-70 flex flex-col">
                            <CardHeader>
                                <CardTitle>{mission.name}</CardTitle>
                                <CardDescription>
                                    Terminée le {format(new Date(mission.date), 'd MMMM yyyy', { locale: fr })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                               <h4 className="font-semibold mb-2 text-sm">Personnel assigné:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {mission.personnelIds.map(id => {
                                        const p = getPersonnelById(id);
                                        return p ? <Badge key={id} variant="outline">{p.lastName} {p.firstName}</Badge> : null;
                                    })}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-4">
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>{mission.totalHours || 0} Heures totales</span>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground text-sm">Aucune mission terminée.</p>
            )}
        </div>
      </div>


      <MissionFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        mission={selectedMission}
       />
    </>
  );
}
