import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './../styles/globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn(GeistSans.className, "font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}