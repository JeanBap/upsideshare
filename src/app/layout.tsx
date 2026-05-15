import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'UpsideShare | Aligned by revenue',
  description:
    'Stripe-verified revenue tracking, template equity contracts, and a creator back office.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://tosyulolriavzgkpwzrn.supabase.co" />
        <link rel="dns-prefetch" href="https://tosyulolriavzgkpwzrn.supabase.co" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-gray-50">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
