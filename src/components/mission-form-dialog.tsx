'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/app-provider';
import { useToast } from '@/hooks/use-toast';
import type { Mission, Personnel } from '@/types';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Clock } from 'lucide-react';
import { differenceInHours, parse } from 'date-fns';

interface MissionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mission: Mission | null;
}

const missionNames = [
  'CARTOGRAPHIE',
  'DELIMITATION',
  'INFRASTRUCTURES LIEES AUX REBOIS',
  'AMENAGEMENTS FORÊT NATURELLES',
  'REBOISEMENT',
  "TRAVAUX D'ENTRETIEN ET DE SYLVICULTURE",
  'ACTIVITES SOCIO-ECONOMIQUES',
  "PLANS D'AMENAGEMENT",
  'PRODUCTION/COMMERCIALISATION',
  'SURVEILLANCES',
  'DISPOSITIFS EXPERIMENTAUX',
  'ADMINISTRATION',
];

const missionDetails: Record<string, string[]> = {
  'CARTOGRAPHIE': [
    'Images satellitaires',
    'Cartes de base',
    "Cartes thématiques pour les plans d'amgt",
    'Carte thématique de gestion courante'
  ],
  'DELIMITATION': [
    'Cartographie des délimitations',
    'Plantation de limites',
    'Entretien de limites Plantées',
    'Autres'
  ],
  'INFRASTRUCTURES LIEES AUX REBOIS': [
    'Création de pistes parcellaires',
    'Réhabilitation inter-parcellaire',
    'Reprofilage / Entretien inter-parcellaire',
    'Matérialisation de pare-feu',
    'Construction de ponts',
    'Entretien Pare-feu',
    'Entretien manuel de pistes',
    'Entretien manuel des accotements',
    'Autres'
  ],
  'AMENAGEMENTS FORÊT NATURELLES': [
    "Inventaire d'exploitation",
    'Sylviculture'
  ],
  'REBOISEMENT': [
    'Production de plants',
    'Plants en sachets',
    'Plants en stumps',
    'Plantations',
    'Plantation industrielle manuelle',
    'Plantation reconversion',
    'Complantassions',
    'Opérateur du bois'
  ],
  "TRAVAUX D'ENTRETIEN ET DE SYLVICULTURE": [
    'Entretiens',
    'Entretien plantation ( de 0 à 3 ans )',
    'Entretien plantation ( > à 3 ans )',
    'Régénération',
    'Opérateur du bois',
    'Sylviculture des reboisements',
    'Inventaire',
    'Griffage',
    'Eclaircie'
  ],
  'ACTIVITES SOCIO-ECONOMIQUES': [
    'Levée de parcelle agricole',
    'Contractualisation',
    'Réunion de sensibilisation'
  ],
  "PLANS D'AMENAGEMENT": [
    'Rédaction',
    'Adoption',
    'Révision'
  ],
  'PRODUCTION/COMMERCIALISATION': [
    "Bois d'œuvre forêt et de plantation",
    'Bois de service et autres',
    'Autres activités commerciales'
  ],
  'SURVEILLANCES': [
    'PATROUILLES',
    'Etat des lieux',
    'Levé et report',
    'Patrouilles ordinaires',
    'Surveillance contre les défrichements',
    'Surveillance contre les feux',
    "Surveillance contre l'exploitation frauduleuse",
    'Autres surveillances',
    'Patrouilles grandes envergures',
    'Patrouilles moyennes envergures',
    'Patrouilles petites envergures',
    'Installation de comité de lutte',
    'Audiences dans les tribunaux (Règlement de litige)'
  ],
  'DISPOSITIFS EXPERIMENTAUX': [
    'Mise en place de parcelles conservatoires',
    "Mise en place d'arboretum",
    'Essais clonaux',
    'Entretien de layon de base',
    'Entretien de layon principaux',
    'Entretien de layon secondaires'
  ],
  'ADMINISTRATION': [
    'Administration',
    'Formation reçue',
    'Atelier, séminaire',
    'Prises de gardes',
    'Absences justifiées',
    'Absences non justifiées',
    'Congés annuels',
    'Autres absences (Repos maladie)'
  ]
};

export function MissionFormDialog({ open, onOpenChange, mission }: MissionFormDialogProps) {
  const { personnel, addMission, updateMission } = useApp();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [availableDescriptions, setAvailableDescriptions] = useState<string[]>([]);
  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<string[]>([]);

  useEffect(() => {
    if (mission) {
      setName(mission.name);
      setDescription(mission.description);
      setDate(mission.date);
      setStartTime(mission.startTime || '');
      setEndTime(mission.endTime || '');
      setSelectedPersonnelIds(mission.personnelIds || []);
      if(mission.name && missionDetails[mission.name]) {
        setAvailableDescriptions(missionDetails[mission.name]);
      }
    } else {
      // Reset form for new mission
      setName('');
      setDescription('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setSelectedPersonnelIds([]);
      setAvailableDescriptions([]);
    }
  }, [mission, open]);
  
  const totalHours = useMemo(() => {
    return selectedPersonnelIds.length * 8;
  }, [selectedPersonnelIds]);

  const handleNameChange = (newName: string) => {
    setName(newName);
    setDescription(''); // Reset description when name changes
    setAvailableDescriptions(missionDetails[newName] || []);
  };

  const handlePersonnelSelection = (personnelId: string, checked: boolean | string) => {
    setSelectedPersonnelIds(prev =>
      checked ? [...prev, personnelId] : prev.filter(id => id !== personnelId)
    );
  };

  const handleSubmit = async () => {
    if (!name || !description || !date ) {
      toast({
        title: 'Champs requis manquants',
        description: 'Veuillez remplir le nom, la description et la date.',
        variant: 'destructive',
      });
      return;
    }
    
    const missionData: Omit<Mission, 'id' | 'status'> = {
      name,
      description,
      date,
      startTime,
      endTime,
      personnelIds: selectedPersonnelIds,
      totalHours,
      vehicle: mission?.vehicle || '',
      kilometers: mission?.kilometers || 0,
    };
    
    if (mission) {
      updateMission(mission.id, missionData);
      toast({
        title: 'Mission modifiée !',
        description: `La mission "${name}" a été mise à jour.`,
      });
    } else {
      addMission(missionData);
      toast({
        title: 'Mission enregistrée !',
        description: `La mission "${name}" a été créée avec succès.`,
      });
    }

    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{mission ? 'Modifier le Poste Analytique' : 'Poste Analytique'}</DialogTitle>
          <DialogDescription>
            Remplissez les détails ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                  <Label htmlFor="name">Nom de la mission</Label>
                  <Select value={name} onValueChange={handleNameChange}>
                    <SelectTrigger id="name">
                      <SelectValue placeholder="Sélectionnez un nom de mission..." />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-72">
                        {missionNames.map(missionName => (
                          <SelectItem key={missionName} value={missionName}>
                            {missionName}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="date">Date de la mission</Label>
                  <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
            </div>
             <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Select value={description} onValueChange={setDescription} disabled={availableDescriptions.length === 0}>
                    <SelectTrigger id="description">
                        <SelectValue placeholder="Sélectionnez une description..." />
                    </SelectTrigger>
                    <SelectContent>
                        <ScrollArea className="h-72">
                            {availableDescriptions.map(desc => (
                                <SelectItem key={desc} value={desc}>
                                    {desc}
                                </SelectItem>
                            ))}
                        </ScrollArea>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="start-time">Heure de début</Label>
                    <Input id="start-time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="end-time">Heure de fin</Label>
                    <Input id="end-time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Assigner du personnel</Label>
              <ScrollArea className="h-48 rounded-md border p-4">
                <div className="space-y-2">
                  {personnel.map((p: Personnel) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`person-${p.id}`}
                        checked={selectedPersonnelIds.includes(p.id)}
                        onCheckedChange={(checked) => handlePersonnelSelection(p.id, checked)}
                      />
                      <Label htmlFor={`person-${p.id}`} className="font-normal">
                        {p.lastName} {p.firstName} - <span className="text-muted-foreground">{p.rank}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {selectedPersonnelIds.length > 0 && (
                <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">{selectedPersonnelIds.length} agents</Badge>
                    <div className="flex items-center gap-1 font-semibold">
                      <Clock className="h-4 w-4" />
                      {totalHours} Heures totales
                    </div>
                </div>
              )}
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
