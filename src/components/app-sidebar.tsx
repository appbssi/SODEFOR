'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  CalendarCheck2,
  Shield,
  Users,
  FileText,
  Rocket,
} from 'lucide-react';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/dashboard', label: 'Tableau de Bord', icon: BarChart3 },
  { href: '/personnel', label: 'Personnel', icon: Users },
  { href: '/attendance', label: 'Pointage', icon: CalendarCheck2 },
  { href: '/missions', label: 'T.P.P.H.T', icon: Rocket },
  { href: '/reports', label: 'Rapports', icon: FileText },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Shield className="size-8 flex-shrink-0 text-primary" />
            <h1 className="font-semibold text-xl text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              Personnel Tracker
            </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map(item => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                className={cn('justify-start')}
                tooltip={{ children: item.label, className: 'bg-primary text-primary-foreground' }}
              >
                <Link href={item.href}>
                  <item.icon className="size-4" />
                  <span>{item.href === '/missions' ? 'Temps du Personnel Permanent en Heure de Travail' : item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
