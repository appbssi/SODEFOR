'use client';

import Link from 'next/link';
import { PlusCircle, Upload } from 'lucide-react';
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
import { useApp } from '@/context/app-provider';
import type { Personnel } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { PersonnelImportDialog } from '@/components/personnel-import-dialog';

export default function PersonnelPage() {
  const { personnel, loading } = useApp();
  const [isImporting, setIsImporting] = useState(false);

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
                <TableHead>Matricule</TableHead>
                <TableHead>Nom Complet</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                  </TableRow>
                ))
              ) : personnel.map((person: Personnel) => (
                <TableRow key={person.id}>
                  <TableCell className="font-medium">{person.matricule}</TableCell>
                  <TableCell>{person.firstName} {person.lastName}</TableCell>
                  <TableCell>{person.rank}</TableCell>
                  <TableCell className="hidden md:table-cell">{person.contact}</TableCell>
                  <TableCell className="hidden md:table-cell">{person.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <PersonnelImportDialog open={isImporting} onOpenChange={setIsImporting} />
    </>
  );
}
