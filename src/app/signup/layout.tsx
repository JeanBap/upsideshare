import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - Join as Brand or Creator',
  description:
    'Create your UpsideShare account. Join as a brand to post revenue share deals, or as a creator to earn commission and equity.',
  alternates: {
    canonical: 'https://upsideshare.com/signup',
  },
  openGraph: {
    title: 'Sign Up for UpsideShare - Revenue Share Platform',
    description:
      'Join as a brand or creator. Post deals or earn commission with Stripe-verified tracking.',
    url: 'https://upsideshare.com/signup',
    type: 'website',
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
