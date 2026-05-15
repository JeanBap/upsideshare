import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'UpsideShare terms of service. Rules and conditions for using the platform.',
  alternates: {
    canonical: 'https://upsideshare.com/terms',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
