import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'The Pros Event Plan - Plan Smarter, Celebrate Better',
  description: 'Elite party planning and management for unforgettable events.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'The Pros Event Plan',
  },
  icons: {
    icon: '/favicon.ico',
    apple: [
      {
        url: 'https://picsum.photos/seed/pro-plan-icon/180/180',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0c5da5', // Honolulu Blue
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
        {/* Fallback for Apple devices using a valid remote icon to prevent 404s */}
        <link rel="apple-touch-icon" href="https://picsum.photos/seed/pro-plan-icon/180/180" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
