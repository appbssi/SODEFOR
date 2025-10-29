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
import { PlusCircle, Clock, MoreVertical, Car, RefreshCw, Trash2, Users } from 'lucide-react';
import { useApp } from '@/context/app-provider';
import type { Mission } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MissionFormDialog } from '@/components/mission-form-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function MissionsPage() {
  const { missions, getPersonnelById, loading, updateMission, deleteMission } = useApp();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [missionToDelete, setMissionToDelete] = useState<Mission | null>(null);

  const handleEditMission = (mission: Mission) => {
    setSelectedMission(mission);
    setIsFormOpen(true);
  };

  const handleNewMission = () => {
    setSelectedMission(null);
    setIsFormOpen(true);
  };
  
  const handleMarkAsDone = (mission: Mission) => {
    updateMission(mission.id, { status: 'completed' });
    toast({
        title: 'Mission Terminée',
        description: `La mission "${mission.name}" a été marquée comme terminée.`,
    });
  };

  const handleReactivateMission = (mission: Mission) => {
    updateMission(mission.id, { status: 'active' });
    toast({
        title: 'Mission Réactivée',
        description: `La mission "${mission.name}" est de nouveau active.`,
    });
  };

  const handleDeleteConfirm = () => {
    if (missionToDelete) {
      deleteMission(missionToDelete.id);
      toast({
        title: 'Mission Supprimée',
        description: `La mission "${missionToDelete.name}" a été supprimée.`,
        variant: 'destructive',
      });
      setMissionToDelete(null);
    }
  };

  const tpphtMissions = missions.filter(m => m.personnelIds && m.personnelIds.length > 0);
  const upcomingMissions = tpphtMissions.filter(m => m.status !== 'completed');
  const pastMissions = tpphtMissions.filter(m => m.status === 'completed');


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
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{mission.name}</CardTitle>
                                        <CardDescription>
                                            Le {format(new Date(mission.date), 'd MMMM yyyy', { locale: fr })}
                                        </CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                                <span className="sr-only">Ouvrir le menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEditMission(mission)}>
                                                Modifier
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleMarkAsDone(mission)}>
                                                Marquer comme terminée
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                onClick={() => setMissionToDelete(mission)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm mb-4">{mission.description}</p>
                                {mission.personnelIds && mission.personnelIds.length > 0 && (
                                   <TooltipProvider>
                                     <Tooltip>
                                       <TooltipTrigger asChild>
                                         <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                                           <Users className="h-4 w-4" />
                                           <span>{mission.personnelIds.length} agents assignés</span>
                                         </div>
                                       </TooltipTrigger>
                                       <TooltipContent>
                                         <div className="p-1">
                                           <h4 className="font-semibold mb-2">Personnel assigné</h4>
                                           <ul className="list-disc list-inside">
                                             {mission.personnelIds.map(id => {
                                               const p = getPersonnelById(id);
                                               return p ? <li key={id}>{p.lastName} {p.firstName}</li> : null;
                                             })}
                                           </ul>
                                         </div>
                                       </TooltipContent>
                                     </Tooltip>
                                   </TooltipProvider>
                                 )}
                            </CardContent>
                            <CardFooter className="pt-4 flex-wrap gap-x-4 gap-y-2">
                                {mission.totalHours > 0 && (
                                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>{mission.totalHours || 0} Heures totales</span>
                                    </div>
                                )}
                                {mission.kilometers && mission.kilometers > 0 && (
                                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                        <Car className="h-4 w-4" />
                                        <span>{mission.kilometers} km ({mission.vehicle})</span>
                                    </div>
                                )}
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
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{mission.name}</CardTitle>
                                        <CardDescription>
                                            Terminée le {format(new Date(mission.date), 'd MMMM yyyy', { locale: fr })}
                                        </CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                                <span className="sr-only">Ouvrir le menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleReactivateMission(mission)}>
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                Réactiver la mission
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                onClick={() => setMissionToDelete(mission)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                               {mission.personnelIds && mission.personnelIds.length > 0 && (
                                   <TooltipProvider>
                                     <Tooltip>
                                       <TooltipTrigger asChild>
                                         <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                                           <Users className="h-4 w-4" />
                                           <span>{mission.personnelIds.length} agents</span>
                                         </div>
                                       </TooltipTrigger>
                                       <TooltipContent>
                                         <div className="p-1">
                                           <h4 className="font-semibold mb-2">Personnel assigné</h4>
                                           <ul className="list-disc list-inside">
                                             {mission.personnelIds.map(id => {
                                               const p = getPersonnelById(id);
                                               return p ? <li key={id}>{p.lastName} {p.firstName}</li> : null;
                                             })}
                                           </ul>
                                         </div>
                                       </TooltipContent>
                                     </Tooltip>
                                   </TooltipProvider>
                               )}
                            </CardContent>
                            <CardFooter className="pt-4 flex-wrap gap-x-4 gap-y-2">
                                {mission.totalHours > 0 && (
                                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>{mission.totalHours || 0} Heures totales</span>
                                    </div>
                                )}
                                {mission.kilometers && mission.kilometers > 0 && (
                                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                                        <Car className="h-3 w-3" />
                                        <span>{mission.kilometers} km ({mission.vehicle})</span>
                                    </div>
                                )}
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
       
       <AlertDialog open={!!missionToDelete} onOpenChange={(open) => !open && setMissionToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette mission ?</AlertDialogTitle>
            <AlertDialogDescription>
                Cette action est irréversible. La mission "{missionToDelete?.name}" sera supprimée définitivement.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMissionToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
       </AlertDialog>
    </>
  );
}
