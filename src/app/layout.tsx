import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { AppShell } from '../components/AppShell';

export const metadata: Metadata = {
  title: 'Civarımda - Yönetim Konsolu & Admin Paneli',
  description: 'Civarımda platformu için gelişmiş, gerçek zamanlı yönetim ve moderasyon paneli',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <ToastProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
