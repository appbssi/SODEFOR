'use client';

import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/context/app-provider';
import { useToast } from '@/hooks/use-toast';
import type { Mission } from '@/types';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';

interface MissionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mission: Mission | null;
}

export function MissionFormDialog({ open, onOpenChange, mission }: MissionFormDialogProps) {
  const { personnel, addMission } = useApp();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [selectedPersonnel, setSelectedPersonnel] = useState<string[]>([]);
  
  useEffect(() => {
    if (mission) {
      setName(mission.name);
      setDescription(mission.description);
      setDate(mission.date);
      setSelectedPersonnel(mission.personnelIds);
    } else {
      // Reset form for new mission
      setName('');
      setDescription('');
      setDate('');
      setSelectedPersonnel([]);
    }
  }, [mission, open]);

  const handleSubmit = async () => {
    if (!name || !date || selectedPersonnel.length === 0) {
      toast({
        title: 'Champs requis manquants',
        description: 'Veuillez remplir le nom, la date et sélectionner au moins un agent.',
        variant: 'destructive',
      });
      return;
    }
    
    const missionData: Omit<Mission, 'id'> = {
      name,
      description,
      date,
      personnelIds: selectedPersonnel,
    };
    
    try {
      await addMission(missionData);
      toast({
        title: 'Mission enregistrée !',
        description: `La mission "${name}" a été créée avec succès.`,
      });
      onOpenChange(false);
    } catch (error) {
       toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer la mission.',
        variant: 'destructive',
      });
    }
  };
  
  const handlePersonnelSelection = (personnelId: string, checked: boolean) => {
    if (checked) {
        setSelectedPersonnel(prev => [...prev, personnelId]);
    } else {
        setSelectedPersonnel(prev => prev.filter(id => id !== personnelId));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{mission ? 'Modifier la mission' : 'Créer une nouvelle mission'}</DialogTitle>
          <DialogDescription>
            Remplissez les détails ci-dessous et assignez le personnel.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Nom de la mission</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Opération Sentinelle" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Décrivez l'objectif de la mission..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="date">Date de la mission</Label>
                    <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
            </div>
            <div className="grid gap-2">
                <Label>Assigner du personnel</Label>
                <ScrollArea className="h-48 rounded-md border p-4">
                    <div className="space-y-2">
                        {personnel.map(p => (
                            <div key={p.id} className="flex items-center space-x-2">
                                <Checkbox 
                                    id={`person-${p.id}`} 
                                    checked={selectedPersonnel.includes(p.id)}
                                    onCheckedChange={(checked) => handlePersonnelSelection(p.id, !!checked)}
                                />
                                <Label htmlFor={`person-${p.id}`} className="font-normal">{p.lastName} {p.firstName} - <span className="text-muted-foreground">{p.rank}</span></Label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>Enregistrer la mission</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
