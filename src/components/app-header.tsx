'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Menu, Search, Settings, User, LogOut, MessageSquare } from 'lucide-react';
import { useSidebar } from './ui/sidebar';


export function AppHeader() {
  const { toggleSidebar } = useSidebar();
  const [isNotificationsMenuOpen, setIsNotificationsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
     <header className="z-40 py-4 bg-gray-800">
        <div className="flex items-center justify-between h-8 px-6 mx-auto">
            {/* Mobile hamburger */}
            <Button
                className="p-1 mr-5 -ml-1 rounded-md md:hidden focus:outline-none"
                variant="ghost"
                onClick={toggleSidebar}
                aria-label="Menu"
            >
                <Menu className="w-6 h-6 text-white" />
            </Button>

            {/* Search Input */}
            <div className="flex justify-center flex-1 lg:mr-32">
                <div className="relative w-full max-w-xl mr-6 focus-within:text-primary">
                    <div className="absolute inset-y-0 flex items-center pl-2">
                        <Search className="w-4 h-4" />
                    </div>
                    <Input
                        className="w-full pl-8 pr-2 text-sm text-gray-700 placeholder-gray-600 bg-gray-100 border-0 rounded-md focus:placeholder-gray-500 focus:bg-white focus:border-primary focus:outline-none focus:shadow-outline-purple form-input"
                        type="text"
                        placeholder="Rechercher..."
                        aria-label="Search"
                    />
                </div>
            </div>

            <ul className="flex items-center flex-shrink-0 space-x-6">
                {/* Notifications menu */}
                <li className="relative">
                    <DropdownMenu open={isNotificationsMenuOpen} onOpenChange={setIsNotificationsMenuOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="p-2 bg-white text-primary align-middle rounded-full hover:text-white hover:bg-primary focus:outline-none">
                                <Bell className="h-6 w-6" />
                                <span aria-hidden="true" className="absolute top-0 right-0 inline-block w-3 h-3 transform translate-x-1 -translate-y-1 bg-red-600 border-2 border-white rounded-full"></span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="absolute right-0 w-56 p-2 mt-2 space-y-2 text-gray-600 bg-green-400 border border-green-500 rounded-md shadow-md">
                            <DropdownMenuItem className="text-white inline-flex items-center justify-between w-full px-2 py-1 text-sm font-semibold transition-colors duration-150 rounded-md hover:bg-gray-100 hover:text-gray-800">
                                <span>Messages</span>
                                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-600 bg-red-100 rounded-full">13</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </li>

                {/* Profile menu */}
                <li className="relative">
                     <DropdownMenu open={isProfileMenuOpen} onOpenChange={setIsProfileMenuOpen}>
                        <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="p-2 bg-white text-primary align-middle rounded-full hover:text-white hover:bg-primary focus:outline-none">
                                <Settings className="h-6 w-6" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="absolute right-0 w-56 p-2 mt-2 space-y-2 text-gray-600 bg-green-400 border border-green-500 rounded-md shadow-md" align="end">
                            <DropdownMenuItem className="text-white inline-flex items-center w-full px-2 py-1 text-sm font-semibold transition-colors duration-150 rounded-md hover:bg-gray-100 hover:text-gray-800">
                                <User className="w-5 h-5 mr-2" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-white inline-flex items-center w-full px-2 py-1 text-sm font-semibold transition-colors duration-150 rounded-md hover:bg-gray-100 hover:text-gray-800">
                                <LogOut className="w-5 h-5 mr-2" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </li>
            </ul>
        </div>
    </header>
  );
}