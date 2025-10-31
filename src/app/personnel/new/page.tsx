'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PersonnelForm } from '@/components/personnel-form';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function NewPersonnelPage() {
  const router = useRouter();
  return (
    <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
        </Button>
        <Card>
        <CardHeader>
            <CardTitle>Enregistrer un nouveau personnel</CardTitle>
            <CardDescription>
            Remplissez le formulaire ci-dessous pour ajouter un nouveau membre du personnel.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <PersonnelForm />
        </CardContent>
        </Card>
    </div>
  );
}
