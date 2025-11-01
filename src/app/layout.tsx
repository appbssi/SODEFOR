import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/app-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { SidebarProvider } from '@/components/ui/sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Personnel Tracker',
  description: 'Gérez votre personnel et leur présence.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="">
        <head>
            <script src="https://cdn.jsdelivr.net/gh/alpinejs/alpine@v2.x.x/dist/alpine.min.js" defer></script>
        </head>
      <body className={inter.className}>
        <FirebaseClientProvider>
          <AppProvider>
            <SidebarProvider>
                <div className="flex h-screen bg-gray-50 text-gray-800">
                    <AppSidebar />
                    <div className="flex flex-col flex-1 w-full overflow-y-auto">
                        <AppHeader />
                        <main>{children}</main>
                    </div>
                </div>
                <Toaster />
            </SidebarProvider>
          </AppProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
