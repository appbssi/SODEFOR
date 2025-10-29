'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
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
import { useApp } from '@/context/app-provider';
import { useToast } from '@/hooks/use-toast';
import type { Personnel } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface PersonnelImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const expectedHeaders = ['matricule', 'firstName', 'lastName', 'rank', 'contact', 'address', 'email'];

export function PersonnelImportDialog({ open, onOpenChange }: PersonnelImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { addMultiplePersonnel } = useApp();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: 'Aucun fichier sélectionné',
        description: 'Veuillez sélectionner un fichier Excel à importer.',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<any>(worksheet);

        if (json.length === 0) {
            throw new Error("Le fichier Excel est vide.");
        }
        
        const headers = Object.keys(json[0]);
        const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));

        if (missingHeaders.length > 0) {
            throw new Error(`En-têtes manquants dans le fichier Excel: ${missingHeaders.join(', ')}`);
        }

        const personnelList: Omit<Personnel, 'id'>[] = json.map(row => ({
          matricule: String(row.matricule || ''),
          firstName: String(row.firstName || ''),
          lastName: String(row.lastName || ''),
          rank: String(row.rank || ''),
          contact: String(row.contact || ''),
          address: String(row.address || ''),
          email: String(row.email || ''),
        }));

        await addMultiplePersonnel(personnelList);
        
        toast({
          title: 'Importation réussie',
          description: `${personnelList.length} membres du personnel ont été ajoutés.`,
        });
        onOpenChange(false);
        setFile(null);
      } catch (error: any) {
        toast({
          title: "Erreur d'importation",
          description: error.message || "Une erreur s'est produite lors de la lecture du fichier.",
          variant: 'destructive',
        });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Importer le personnel depuis Excel</DialogTitle>
          <DialogDescription>
            Sélectionnez un fichier .xlsx ou .csv. Assurez-vous que le fichier contient les en-têtes: {expectedHeaders.join(', ')}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertDescription>
                <p className="font-semibold">Format attendu :</p>
                <code className="block whitespace-pre-wrap text-xs rounded-sm bg-muted p-2 mt-2">
                    {`lastName  | firstName | matricule | rank    | contact    | address      | email\nDupont    | Jean      | M123      | Sergent | 0123456789 | 1 Rue de...  | jean@...`}
                </code>
            </AlertDescription>
          </Alert>
          <Input id="excel-file" type="file" onChange={handleFileChange} accept=".xlsx, .xls, .csv" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
            Annuler
          </Button>
          <Button onClick={handleImport} disabled={isImporting || !file}>
            {isImporting ? 'Importation...' : 'Importer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    