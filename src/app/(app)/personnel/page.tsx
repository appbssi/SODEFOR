'use client';

import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
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

export default function PersonnelPage() {
  const { personnel } = useApp();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Liste du Personnel</CardTitle>
            <CardDescription>
              Gérer le personnel et voir leurs informations.
            </CardDescription>
          </div>
          <Button asChild size="sm" className="gap-1">
            <Link href="/personnel/new">
              <PlusCircle className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Nouveau Personnel
              </span>
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Avatar</span>
              </TableHead>
              <TableHead>Matricule</TableHead>
              <TableHead>Nom Complet</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {personnel.map((person: Personnel) => (
              <TableRow key={person.id}>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-bold">
                    {person.firstName.charAt(0)}{person.lastName.charAt(0)}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{person.id}</TableCell>
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
  );
}
