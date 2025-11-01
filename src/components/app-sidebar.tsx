'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  BarChart3,
  CalendarCheck2,
  Users,
  FileText,
  Rocket,
  Car,
  Clock,
  Home,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useSidebar } from './ui/sidebar';

const menuItems = [
  { href: '/dashboard', label: 'Tableau de Bord', icon: Home },
  { href: '/personnel', label: 'Personnel', icon: Users },
  { href: '/attendance', label: 'Pointage', icon: CalendarCheck2 },
  { href: '/missions', label: 'T.P.P.H.T', icon: Rocket, tooltip: 'Temps du Personnel Permanent en Heure de Travail' },
  { href: '/vehicle-tracking', label: 'Suivi Véhicules', icon: Car },
  { href: '/reports', label: 'Rapport de Présence', icon: FileText },
  { href: '/hours-report', label: 'Bilan des Heures', icon: Clock },
];

function AppSidebarContent() {
    const pathname = usePathname();
    const [openSubmenu, setOpenSubmenu] = useState(false);

    return (
        <div className="text-white">
            <div className="flex p-2  bg-gray-800">
                <div className="flex py-3 px-2 items-center">
                    <p className="text-2xl text-green-500 font-semibold">SODEFOR</p>
                </div>
            </div>
            <div className="flex justify-center mt-4">
                <div>
                    <Image
                        className="hidden h-24 w-24 rounded-full sm:block object-cover mr-2 border-4 border-primary"
                        src="https://picsum.photos/seed/1/200/200"
                        alt="User avatar"
                        width={96}
                        height={96}
                        data-ai-hint="user avatar"
                    />
                    <p className="font-bold text-base  text-gray-400 pt-2 text-center w-24">Utilisateur</p>
                </div>
            </div>
            <div>
                <ul className="mt-6 leading-10">
                    {menuItems.map(item => (
                        <li key={item.href} className="relative px-2 py-1 ">
                            <Link href={item.href} className={cn(
                                    "inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 cursor-pointer",
                                    pathname.startsWith(item.href) ? "text-primary" : "text-white hover:text-primary"
                                )}>
                                    <item.icon className="h-6 w-6" />
                                    <span className="ml-4">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                    
                    <li className="relative px-2 py-1">
                        <div
                            className="inline-flex items-center justify-between w-full text-base font-semibold transition-colors duration-150 text-gray-500 hover:text-yellow-400 cursor-pointer"
                            onClick={() => setOpenSubmenu(!openSubmenu)}
                        >
                            <span className="inline-flex items-center text-sm font-semibold text-white hover:text-green-400">
                                <BarChart3 className="h-6 w-6" />
                                <span className="ml-4">ITEM</span>
                            </span>
                            {openSubmenu ? <ChevronDown className="ml-1 text-white w-4 h-4" /> : <ChevronRight className="ml-1 text-white w-4 h-4" />}
                        </div>

                        {openSubmenu && (
                            <div>
                                <ul className="p-2 mt-2 space-y-2 overflow-hidden text-sm font-medium rounded-md shadow-inner bg-green-400" aria-label="submenu">
                                    <li className="px-2 py-1 text-white transition-colors duration-150">
                                        <div className="px-1 hover:text-gray-800 hover:bg-gray-100 rounded-md">
                                            <div className="flex items-center">
                                                <Home className="h-5 w-5" />
                                                <a href="#" className="w-full ml-2 text-sm font-semibold text-white hover:text-gray-800">Item
                                                    1</a>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </li>
                </ul>
            </div>
        </div>
    )
}

export function AppSidebar() {
    const { openMobile, setOpenMobile } = useSidebar();
  return (
    <>
        <div x-show="isSideMenuOpen" className="fixed inset-0 z-10 flex items-end bg-black bg-opacity-50 sm:items-center sm:justify-center"></div>
        <aside
            className="fixed inset-y-0 z-20 flex-shrink-0 w-64 mt-16 overflow-y-auto bg-gray-900 md:hidden"
            style={{ display: openMobile ? 'block' : 'none' }}
            onClick={() => setOpenMobile(false)}
        >
            <AppSidebarContent />
        </aside>
        <aside className="z-20 flex-shrink-0 hidden w-60 pl-2 overflow-y-auto bg-gray-800 md:block">
            <AppSidebarContent />
        </aside>
    </>
  );
}
