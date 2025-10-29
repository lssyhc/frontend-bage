import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import 'leaflet/dist/leaflet.css';
import AppToaster from '@/components/AppToaster';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['200', '300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Bage',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
