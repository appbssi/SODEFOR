'use client';

import Link from 'next/link';
import { MoreHorizontal, PlusCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
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
import { useApp } from '@/context/app-provider';
import type { Personnel } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { PersonnelImportDialog } from '@/components/personnel-import-dialog';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function PersonnelPage() {
  const { personnel, loading, deletePersonnel } = useApp();
  const [isImporting, setIsImporting] = useState(false);
  const [personnelToDelete, setPersonnelToDelete] = useState<Personnel | null>(null);
  const { toast } = useToast();
  const router = useRouter();


  const handleDeleteConfirm = () => {
    if (personnelToDelete) {
        deletePersonnel(personnelToDelete.id);
        toast({
            title: 'Personnel Supprimé',
            description: `Le membre du personnel "${personnelToDelete.lastName} ${personnelToDelete.firstName}" a été supprimé.`,
            variant: 'destructive',
        });
        setPersonnelToDelete(null);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/personnel/${id}/edit`);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste du Personnel</CardTitle>
              <CardDescription>
                Gérer le personnel et voir leurs informations.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsImporting(true)} variant="outline" size="sm" className="gap-1">
                <Upload className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Importer
                </span>
              </Button>
              <Button asChild size="sm" className="gap-1">
                <Link href="/personnel/new">
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Nouveau Personnel
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom Complet</TableHead>
                <TableHead>Matricule</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : personnel.map((person: Personnel) => (
                <TableRow key={person.id}>
                  <TableCell>{person.lastName} {person.firstName}</TableCell>
                  <TableCell className="font-medium">{person.matricule}</TableCell>
                  <TableCell>{person.rank}</TableCell>
                  <TableCell className="hidden md:table-cell">{person.contact}</TableCell>
                  <TableCell className="hidden md:table-cell">{person.email}</TableCell>
                  <TableCell>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(person.id)}>Modifier</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPersonnelToDelete(person)}>Supprimer</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <PersonnelImportDialog open={isImporting} onOpenChange={setIsImporting} />

      <AlertDialog open={!!personnelToDelete} onOpenChange={(open) => !open && setPersonnelToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet agent ?</AlertDialogTitle>
            <AlertDialogDescription>
                Cette action est irréversible. Le membre du personnel "{personnelToDelete?.lastName} {personnelToDelete?.firstName}" sera supprimé définitivement.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPersonnelToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
       </AlertDialog>
    </>
  );
}
