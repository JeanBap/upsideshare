import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Revenue Share Deals - Browse Brand Partnerships',
  description:
    'Browse active revenue share deals from verified brands. Apply to earn commission on every sale you drive, with Stripe-verified tracking.',
  alternates: {
    canonical: 'https://upsideshare.com/deals',
  },
  openGraph: {
    title: 'Revenue Share Deals - Browse Brand Partnerships | UpsideShare',
    description:
      'Browse active revenue share deals from verified brands. Apply to earn commission on every sale you drive.',
    url: 'https://upsideshare.com/deals',
    type: 'website',
    images: [
      {
        url: 'https://upsideshare.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'UpsideShare - Browse revenue share deals',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Revenue Share Deals | UpsideShare',
    description: 'Browse active revenue share deals from verified brands.',
    images: ['https://upsideshare.com/og-image.png'],
  },
};

export default function DealsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
