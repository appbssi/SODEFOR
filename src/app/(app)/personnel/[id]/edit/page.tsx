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
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useApp } from '@/context/app-provider';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditPersonnelPage() {
  const router = useRouter();
  const params = useParams();
  const { getPersonnelById, loading } = useApp();
  
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const personnel = getPersonnelById(id);

  return (
    <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
        </Button>
        <Card>
        <CardHeader>
            <CardTitle>Modifier un membre du personnel</CardTitle>
            <CardDescription>
                Mettez à jour les informations ci-dessous.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                 <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                 </div>
            ) : personnel ? (
                <PersonnelForm personnel={personnel} />
            ) : (
                <div className="flex items-center justify-center py-10">
                    <p>Membre du personnel introuvable.</p>
                </div>
            )}
        </CardContent>
        </Card>
    </div>
  );
}
