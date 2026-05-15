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
  },
};

export default function DealsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
