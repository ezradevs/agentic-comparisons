import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/context/AppProviders';

export const metadata: Metadata = {
  title: 'Codex HMS | Hospital Management Suite',
  description: 'Modern, secure hospital management and charting platform built with Next.js.',
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
