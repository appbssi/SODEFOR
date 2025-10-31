'use client';

import { useState, useMemo, useRef } from 'react';
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useApp } from '@/context/app-provider';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Car, Download, PlusCircle } from 'lucide-react';
import { VehicleMissionFormDialog } from '@/components/vehicle-mission-form-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';


export default function VehicleTrackingPage() {
  const { missions, loading } = useApp();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [isExporting, setIsExporting] = useState(false);
  const reportTableRef = useRef<HTMLDivElement>(null);


  const monthOptions = useMemo(() => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 24; i++) { // 24 months history
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        options.push({
            value: format(date, 'yyyy-MM'),
            label: format(date, 'MMMM yyyy', { locale: fr }),
        });
    }
    return options;
  }, []);

  const missionsWithMileage = useMemo(() => {
    return missions
      .filter(m => m.kilometers && m.kilometers > 0)
      .filter(m => format(new Date(m.date), 'yyyy-MM') === selectedMonth)
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [missions, selectedMonth]);

  const totalMonthlyKilometers = useMemo(() => {
    return missionsWithMileage.reduce((total, mission) => total + (mission.kilometers || 0), 0);
  }, [missionsWithMileage]);

  const handleNewMission = () => {
    setIsFormOpen(true);
  };
  
  const handleExportPDF = async () => {
    if (!reportTableRef.current || missionsWithMileage.length === 0) {
      toast({
        title: 'Aucun rapport à exporter',
        description: 'Aucune donnée de kilométrage pour le mois sélectionné.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsExporting(true);

    try {
        const canvas = await html2canvas(reportTableRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const monthLabel = monthOptions.find(m => m.value === selectedMonth)?.label || 'Rapport';
        
        pdf.setFontSize(16);
        pdf.text(`Bilan Kilomètrique - ${monthLabel}`, pdfWidth / 2, 15, { align: 'center' });

        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pdfWidth - 20;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        let position = 25;
        
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        
        pdf.save(`rapport_kilometrage_${monthLabel.replace(' ', '_')}.pdf`);
        
        toast({
            title: 'Exportation réussie',
            description: 'Le rapport de kilométrage a été téléchargé en PDF.',
        });

    } catch (error) {
        console.error("Error exporting to PDF:", error);
        toast({
            title: 'Erreur d\'exportation',
            description: 'Une erreur est survenue lors de la création du PDF.',
            variant: 'destructive',
        });
    } finally {
        setIsExporting(false);
    }
  };


  return (
    <>
       <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-muted rounded-md">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Suivi du Kilométrage des Véhicules</h1>
              <p className="text-muted-foreground">
                Bilan mensuel détaillé des kilomètres parcourus pour chaque mission.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
             <Button onClick={handleNewMission} className="gap-2 w-full sm:w-auto">
                <PlusCircle className="h-4 w-4" />
                Nouvelle Mission
              </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder="Sélectionnez un mois" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleExportPDF} variant="outline" className="w-full sm:w-auto gap-2" disabled={isExporting || loading || missionsWithMileage.length === 0}>
                <Download className="h-4 w-4" />
                {isExporting ? 'Exportation...' : 'Exporter en PDF'}
            </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Kilométrage Mensuel</CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {loading ? <Skeleton className="h-8 w-24" /> : `${totalMonthlyKilometers} km`}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        pour {monthOptions.find(m => m.value === selectedMonth)?.label}
                    </p>
                </CardContent>
            </Card>
        </div>


        <div ref={reportTableRef}>
        <Card>
          <CardHeader>
            <CardTitle>Détails des Missions - {monthOptions.find(m => m.value === selectedMonth)?.label}</CardTitle>
            <CardDescription>Liste des missions avec kilométrage pour le mois sélectionné.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Date</TableHead>
                  <TableHead>Mission</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Véhicule</TableHead>
                  <TableHead className="text-right">Kilomètres</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : missionsWithMileage.length > 0 ? (
                    missionsWithMileage.map((mission) => (
                    <TableRow key={mission.id}>
                      <TableCell>{format(new Date(mission.date), 'd MMMM yyyy', { locale: fr })}</TableCell>
                      <TableCell className="font-medium">{mission.name}</TableCell>
                      <TableCell className="text-muted-foreground">{mission.description}</TableCell>
                      <TableCell>{mission.vehicle}</TableCell>
                      <TableCell className="text-right font-semibold">{mission.kilometers} km</TableCell>
                    </TableRow>
                  ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            Aucune mission avec kilométrage enregistré pour le mois sélectionné.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
              {missionsWithMileage.length > 0 && (
                <TableFooter>
                    <TableRow>
                    <TableCell colSpan={4} className="font-bold text-right">Total</TableCell>
                    <TableCell className="text-right font-bold text-lg">{totalMonthlyKilometers} km</TableCell>
                    </TableRow>
                </TableFooter>
              )}
            </Table>
          </CardContent>
        </Card>
        </div>
      </div>

      <VehicleMissionFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        mission={null}
       />
    </>
  );
}
