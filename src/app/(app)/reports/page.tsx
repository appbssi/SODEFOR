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
import { getDaysInMonth, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';

const statusIcons: { [key in AttendanceStatus]: string } = {
  present: '✔️',
  absent: '❌',
  mission: '✈️',
  permission: '🗓️',
};

const statusTooltips: { [key in AttendanceStatus]: string } = {
  present: 'Présent',
  absent: 'Absent',
  mission: 'En Mission',
  permission: 'En Permission',
};

export default function ReportsPage() {
  const { personnel, attendance } = useApp();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [reportData, setReportData] = useState<any[]>([]);
  const [daysOfMonth, setDaysOfMonth] = useState<Date[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const reportTableRef = useRef<HTMLDivElement>(null);


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
        const record = attendance.find(
          a => a.personnelId === person.id && a.date === dayString
        );
        return record ? record.status : 'N/A';
      });
      return { ...person, attendance: personAttendance };
    });
    setReportData(data);
  };
  
  const handleExportPDF = async () => {
    if (!reportTableRef.current || reportData.length === 0) {
      toast({
        title: 'Aucun rapport à exporter',
        description: 'Veuillez d\'abord générer un rapport.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsExporting(true);

    try {
        const canvas = await html2canvas(reportTableRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        
        let finalImgWidth = pdfWidth;
        let finalImgHeight = pdfWidth / ratio;
        
        if (finalImgHeight > pdfHeight) {
            finalImgHeight = pdfHeight;
            finalImgWidth = pdfHeight * ratio;
        }

        const x = (pdfWidth - finalImgWidth) / 2;
        const y = (pdfHeight - finalImgHeight) / 2;

        pdf.addImage(imgData, 'PNG', x, y, finalImgWidth, finalImgHeight);
        
        const monthLabel = monthOptions.find(m => m.value === selectedMonth)?.label || 'Rapport';
        pdf.save(`rapport_${monthLabel.replace(' ', '_')}.pdf`);
        
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
    for (let i = 0; i < 12; i++) {
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
        <CardTitle>Générer un Bilan Détaillé</CardTitle>
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
          <div ref={reportTableRef} id="report-table" className="overflow-x-auto relative border rounded-lg bg-card">
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
                    <TableCell className="font-medium sticky left-0 bg-card z-10 whitespace-nowrap">{person.firstName} {person.lastName}</TableCell>
                    {person.attendance.map((status: AttendanceStatus | 'N/A', index: number) => (
                      <TableCell key={index} className="text-center">
                        {status !== 'N/A' ? (
                          <span title={statusTooltips[status]}>{statusIcons[status]}</span>
                        ) : <span className="text-muted-foreground">-</span>}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
