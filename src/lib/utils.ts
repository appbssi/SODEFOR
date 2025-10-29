import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { eachDayOfInterval, format, parseISO } from 'date-fns';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDaysBetweenDates(startDate: string, endDate: string): string[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  if(isNaN(start.getTime()) || isNaN(end.getTime())) return [];
  const days = eachDayOfInterval({ start, end });
  return days.map(day => format(day, 'yyyy-MM-dd'));
}
