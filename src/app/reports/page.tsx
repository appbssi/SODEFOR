'use client';

import { useState, useMemo, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/app-provider';
import type { AttendanceStatus } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getDaysInMonth, format, isWithinInterval, startOfDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';

const statusIcons: { [key in AttendanceStatus | 'N/A']: string } = {
  present: '✔️',
  absent: '❌',
  mission: '✈️',
  permission: '🗓️',
  'N/A': '-'
};

const statusTooltips: { [key in AttendanceStatus | 'N/A']: string } = {
  present: 'Présent',
  absent: 'Absent',
  mission: 'En Mission',
  permission: 'En Permission',
  'N/A': 'Non Renseigné'
};

export default function ReportsPage() {
  const { personnel, attendance, missions } = useApp();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [reportData, setReportData] = useState<any[]>([]);
  const [daysOfMonth, setDaysOfMonth] = useState<Date[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const reportContainerRef = useRef<HTMLDivElement>(null);


  const handleGenerateReport = () => {
    const year = parseInt(selectedMonth.split('-')[0]);
    const month = parseInt(selectedMonth.split('-')[1]) - 1;
    const date = new Date(year, month);

    const days = Array.from(
      { length: getDaysInMonth(date) },
      (_, i) => new Date(year, month, i + 1)
    );
    setDaysOfMonth(days);

    const data = personnel.map(person => {
      const personAttendance = days.map(day => {
        const dayString = format(day, 'yyyy-MM-dd');
        
        let record = attendance.find(
          a => a.personnelId === person.id && a.date === dayString
        );

        if (record) {
          return record.status;
        }

        const missionRecord = attendance.find(a => 
            a.personnelId === person.id && a.status === 'mission' && a.date === dayString && a.missionId
        );
        const activeMission = missionRecord ? missions.find(m => m.id === missionRecord.missionId && m.status === 'active') : undefined;
        if(activeMission) return 'mission';

        const onPermission = attendance.some(a => {
            if (a.personnelId === person.id && a.permissionDuration?.start && a.permissionDuration?.end) {
                try {
                    const start = startOfDay(parseISO(a.permissionDuration.start));
                    const end = startOfDay(parseISO(a.permissionDuration.end));
                    return isWithinInterval(startOfDay(day), { start, end });
                } catch { return false }
            }
            return false;
        });
        if(onPermission) return 'permission';
        
        return 'N/A';
      });

      const summary = {
        present: personAttendance.filter(s => s === 'present').length,
        absent: personAttendance.filter(s => s === 'absent').length,
        mission: personAttendance.filter(s => s === 'mission').length,
        permission: personAttendance.filter(s => s === 'permission').length,
      };

      return { ...person, attendance: personAttendance, summary };
    });
    setReportData(data);
  };
  
  const handleExportPDF = async () => {
    if (!reportContainerRef.current || reportData.length === 0) {
      toast({
        title: 'Aucun rapport à exporter',
        description: 'Veuillez d\'abord générer un rapport.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsExporting(true);

    try {
        const canvas = await html2canvas(reportContainerRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const monthLabel = monthOptions.find(m => m.value === selectedMonth)?.label || 'Rapport';

        pdf.setFontSize(16);
        pdf.text(`Rapport de Présence - ${monthLabel}`, pdfWidth / 2, 15, { align: 'center' });
        
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pdfWidth - 20; // margins
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        let position = 20;

        if (imgHeight > pdfHeight - 30) {
           position = 10;
           pdf.addImage(imgData, 'PNG', 10, position, imgWidth, pdfHeight - 20);
        } else {
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        }
        
        pdf.save(`rapport_presence_${monthLabel.replace(' ', '_')}.pdf`);
        
        toast({
            title: 'Exportation réussie',
            description: 'Le rapport a été téléchargé en PDF.',
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
  
  const monthOptions = useMemo(() => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 24; i++) { // Increased to 24 months
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        options.push({
            value: format(date, 'yyyy-MM'),
            label: format(date, 'MMMM yyyy', { locale: fr }),
        });
    }
    return options;
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rapport de Présence Détaillé</CardTitle>
        <CardDescription>
          Sélectionnez un mois pour générer un rapport de présence détaillé.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
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
          <Button onClick={handleGenerateReport} className="w-full sm:w-auto">Générer le rapport</Button>
          <Button onClick={handleExportPDF} variant="outline" className="w-full sm:w-auto gap-2" disabled={isExporting || reportData.length === 0}>
            <Download className="h-4 w-4" />
            {isExporting ? 'Exportation...' : 'Exporter en PDF'}
          </Button>
        </div>

        {reportData.length > 0 ? (
          <div ref={reportContainerRef} className="space-y-8">
            <div id="report-table-details" className="overflow-x-auto relative border rounded-lg bg-card p-4">
              <h3 className="text-lg font-semibold text-center mb-4">
                  Détails de Présence - {monthOptions.find(m => m.value === selectedMonth)?.label}
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-card z-10 w-[200px]">Nom</TableHead>
                    {daysOfMonth.map(day => (
                      <TableHead key={day.toString()} className="text-center min-w-[50px]">{format(day, 'd')}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map(person => (
                    <TableRow key={person.id}>
                      <TableCell className="font-medium sticky left-0 bg-card z-10 whitespace-nowrap">{person.lastName} {person.firstName}</TableCell>
                      {person.attendance.map((status: AttendanceStatus | 'N/A', index: number) => (
                        <TableCell key={index} className="text-center">
                           <span title={statusTooltips[status]}>{statusIcons[status]}</span>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div id="report-table-summary" className="border rounded-lg bg-card p-4">
                <h3 className="text-lg font-semibold text-center mb-4">
                    Récapitulatif Mensuel - {monthOptions.find(m => m.value === selectedMonth)?.label}
                </h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[250px]">Nom</TableHead>
                            <TableHead className="text-center">Présences</TableHead>
                            <TableHead className="text-center">Absences</TableHead>
                            <TableHead className="text-center">Missions</TableHead>
                            <TableHead className="text-center">Permissions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reportData.map(person => (
                            <TableRow key={person.id}>
                                <TableCell className="font-medium">{person.lastName} {person.firstName}</TableCell>
                                <TableCell className="text-center font-semibold">{person.summary.present}</TableCell>
                                <TableCell className="text-center font-semibold">{person.summary.absent}</TableCell>
                                <TableCell className="text-center font-semibold">{person.summary.mission}</TableCell>
                                <TableCell className="text-center font-semibold">{person.summary.permission}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
          </div>
        ) : (
            <div className="text-center py-10 text-muted-foreground">
                <p>Aucun rapport généré. Veuillez sélectionner un mois et cliquer sur "Générer le rapport".</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
