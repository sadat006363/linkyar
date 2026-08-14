import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';  // ← این خط را اضافه کنید
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LinkYar - Smart Link Assistant',
  description: 'The fastest way to manage and share your social links',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        {children}
        <Toaster position="bottom-right" richColors /> {/* ← این خط را اضافه کنید */}
      </body>
    </html>
  );
}