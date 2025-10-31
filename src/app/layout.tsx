import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/app-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

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
    <html lang="fr">
      <body className={inter.className}>
        <FirebaseClientProvider>
          <AppProvider>
            <SidebarProvider>
              <Sidebar>
                <AppSidebar />
              </Sidebar>
              <SidebarInset>
                <AppHeader />
                <main className="p-4 lg:p-6">{children}</main>
              </SidebarInset>
            </SidebarProvider>
            <Toaster />
          </AppProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
