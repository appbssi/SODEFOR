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
import type { AttendanceStatus, Personnel, PersonnelDailyStatus } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
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

const HOURS_PER_STATUS: { [key in AttendanceStatus | 'N/A']: number } = {
  present: 8,
  mission: 8,
  absent: 0,
  permission: 0,
  'N/A': 0,
};

type ReportRow = Personnel & {
    dailyHours: number[];
    totalHours: number;
};

export default function HoursReportPage() {
  const { personnel, getPersonnelStatusForDateRange } = useApp();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [daysOfMonth, setDaysOfMonth] = useState<Date[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const reportTableRef = useRef<HTMLDivElement>(null);

  const monthOptions = useMemo(() => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 24; i++) { 
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        options.push({
            value: format(date, 'yyyy-MM'),
            label: format(date, 'MMMM yyyy', { locale: fr }),
        });
    }
    return options;
  }, []);
  
  const handleGenerateReport = () => {
    const year = parseInt(selectedMonth.split('-')[0]);
    const month = parseInt(selectedMonth.split('-')[1]) - 1;
    const date = new Date(year, month);

    const days = Array.from(
      { length: getDaysInMonth(date) },
      (_, i) => new Date(year, month, i + 1)
    );
    setDaysOfMonth(days);

    const startDate = format(days[0], 'yyyy-MM-dd');
    const endDate = format(days[days.length - 1], 'yyyy-MM-dd');

    const data: ReportRow[] = personnel.map(person => {
        const personAttendance = getPersonnelStatusForDateRange(person.id, startDate, endDate);
        
        let totalHours = 0;
        const dailyHours = personAttendance.map(dayStatus => {
            const hours = HOURS_PER_STATUS[dayStatus.status || 'N/A'];
            totalHours += hours;
            return hours;
        });

        return { ...person, dailyHours, totalHours };
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

    const style = document.createElement('style');
    style.id = 'print-styles-hours';
    style.innerHTML = `
      #report-table-hours table { font-size: 9px; }
      #report-table-hours th, #report-table-hours td { padding: 2px 4px; }
      #report-table-hours th { min-width: auto !important; }
    `;
    document.head.appendChild(style);

    try {
        const canvas = await html2canvas(reportTableRef.current, { 
            scale: 2,
            backgroundColor: '#ffffff'
        });
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
        pdf.text(`Bilan des Heures - ${monthLabel}`, pdfWidth / 2, 15, { align: 'center' });

        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pdfWidth - 20;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        let position = 25;
        
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight, undefined, 'FAST');
        
        pdf.save(`bilan_heures_${monthLabel.replace(/\s/g, '_')}.pdf`);
        
        toast({
            title: 'Exportation réussie',
            description: 'Le bilan des heures a été téléchargé en PDF.',
        });

    } catch (error) {
        console.error("Error exporting to PDF:", error);
        toast({
            title: 'Erreur d\'exportation',
            description: 'Une erreur est survenue lors de la création du PDF.',
            variant: 'destructive',
        });
    } finally {
        const styleElement = document.getElementById('print-styles-hours');
        if (styleElement) {
            document.head.removeChild(styleElement);
        }
        setIsExporting(false);
    }
  };

  const totalMonthlyHours = useMemo(() => {
    return reportData.reduce((acc, person) => acc + person.totalHours, 0);
  }, [reportData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bilan Mensuel des Heures</CardTitle>
        <CardDescription>
          Générez un rapport détaillé des heures travaillées par agent pour un mois donné.
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
          <Button onClick={handleGenerateReport} className="w-full sm:w-auto">Générer le Bilan</Button>
          <Button onClick={handleExportPDF} variant="outline" className="w-full sm:w-auto gap-2" disabled={isExporting || reportData.length === 0}>
            <Download className="h-4 w-4" />
            {isExporting ? 'Exportation...' : 'Exporter en PDF'}
          </Button>
        </div>

        {reportData.length > 0 ? (
          <div ref={reportTableRef} id="report-table-hours" className="overflow-x-auto relative border rounded-lg bg-card p-4">
             <h3 className="text-lg font-semibold text-center mb-4">
                Bilan des Heures - {monthOptions.find(m => m.value === selectedMonth)?.label}
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-card z-10 w-[200px] font-bold">Agent</TableHead>
                  {daysOfMonth.map(day => (
                    <TableHead key={day.toString()} className="text-center min-w-[50px]">{format(day, 'd')}</TableHead>
                  ))}
                   <TableHead className="text-right font-bold min-w-[100px] sticky right-0 bg-card z-10">Total Heures</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map(person => (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium sticky left-0 bg-card z-10 whitespace-nowrap">{person.lastName} {person.firstName}</TableCell>
                    {person.dailyHours.map((hours: number, index: number) => (
                      <TableCell key={index} className="text-center">
                        {hours > 0 ? hours : <span className="text-muted-foreground">-</span>}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-bold sticky right-0 bg-card z-10">{person.totalHours}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={daysOfMonth.length + 1} className="text-right font-bold text-lg sticky left-0 bg-card z-10">Total Général</TableCell>
                  <TableCell className="text-right font-bold text-lg sticky right-0 bg-card z-10">{totalMonthlyHours}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        ) : (
            <div className="text-center py-10 text-muted-foreground">
                <p>Aucun bilan généré. Veuillez sélectionner un mois et cliquer sur "Générer le bilan".</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
