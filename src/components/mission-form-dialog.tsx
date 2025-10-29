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
import type { Mission } from '@/types';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Clock } from 'lucide-react';
import { Textarea } from './ui/textarea';

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
  const [selectedPersonnel, setSelectedPersonnel] = useState<string[]>([]);
  const [availableDescriptions, setAvailableDescriptions] = useState<string[]>([]);
  const [vehicle, setVehicle] = useState('');
  const [kilometers, setKilometers] = useState<number | ''>('');
  
  const totalHours = 0; // Personnel selection is removed

  useEffect(() => {
    if (mission) {
      setName(mission.name);
      setDescription(mission.description);
      setDate(mission.date);
      setSelectedPersonnel(mission.personnelIds || []);
      setVehicle(mission.vehicle || '');
      setKilometers(mission.kilometers || '');
      if(mission.name && missionDetails[mission.name]) {
        setAvailableDescriptions(missionDetails[mission.name]);
      }
    } else {
      // Reset form for new mission
      setName('');
      setDescription('');
      setDate('');
      setSelectedPersonnel([]);
      setVehicle('');
      setKilometers('');
      setAvailableDescriptions([]);
    }
  }, [mission, open]);

  const handleNameChange = (newName: string) => {
    setName(newName);
    setDescription(''); // Reset description when name changes
    setAvailableDescriptions(missionDetails[newName] || []);
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
    
    const missionData = {
      name,
      description,
      date,
      personnelIds: [],
      totalHours: 0,
      vehicle,
      kilometers: Number(kilometers) || 0,
    };
    
    if (mission) {
      // When updating, we need to preserve the personnelIds if we don't want to change them
      const updatedMissionData = { ...missionData, personnelIds: mission.personnelIds, totalHours: mission.totalHours };
      updateMission(mission.id, updatedMissionData);
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
                <Label htmlFor="description">Description</Label>
                 <Textarea id="description" placeholder="Description de la mission..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="date">Date de la mission</Label>
                    <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="vehicle">Véhicule</Label>
                    <Input id="vehicle" placeholder="Ex: Toyota Hilux" value={vehicle} onChange={e => setVehicle(e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="kilometers">Kilométrage</Label>
                    <Input id="kilometers" type="number" placeholder="Ex: 120" value={kilometers} onChange={e => setKilometers(e.target.value === '' ? '' : Number(e.target.value))} />
                </div>
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
