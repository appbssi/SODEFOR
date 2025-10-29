'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useApp } from '@/context/app-provider';
import { useToast } from '@/hooks/use-toast';
import type { Personnel } from '@/types';
import { useEffect } from 'react';

const formSchema = z.object({
  matricule: z.string().min(2, { message: 'Le matricule est requis.' }),
  lastName: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères.' }),
  firstName: z.string().min(2, { message: 'Le prénom doit contenir au moins 2 caractères.' }),
  rank: z.string().min(2, { message: 'Le grade est requis.' }),
  contact: z.string().min(10, { message: 'Le contact doit être valide.' }),
  address: z.string().min(5, { message: "L'adresse est requise." }),
  email: z.string().email({ message: "L'adresse e-mail n'est pas valide." }),
});

interface PersonnelFormProps {
    personnel?: Personnel;
}

export function PersonnelForm({ personnel }: PersonnelFormProps) {
  const router = useRouter();
  const { addPersonnel, updatePersonnel } = useApp();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: personnel || {
      matricule: '',
      lastName: '',
      firstName: '',
      rank: '',
      contact: '',
      address: '',
      email: '',
    },
  });
  
  useEffect(() => {
    if (personnel) {
        form.reset(personnel);
    }
  }, [personnel, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (personnel) {
        updatePersonnel(personnel.id, values);
        toast({
          title: 'Succès!',
          description: 'Le membre du personnel a été mis à jour.',
        });
    } else {
        addPersonnel(values);
        toast({
          title: 'Succès!',
          description: 'Le membre du personnel a été ajouté.',
        });
    }
    router.push('/personnel');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Dupont" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input placeholder="Jean" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="matricule"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matricule</FormLabel>
                <FormControl>
                  <Input placeholder="M12345" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rank"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grade</FormLabel>
                <FormControl>
                  <Input placeholder="Sergent" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact</FormLabel>
                <FormControl>
                  <Input placeholder="0123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse</FormLabel>
                <FormControl>
                  <Input placeholder="1 Rue de la Paix, Paris" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input placeholder="jean.dupont@armee.fr" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
          <Button type="submit">Enregistrer</Button>
        </div>
      </form>
    </Form>
  );
}

    