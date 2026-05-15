import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Equity Contracts',
  robots: { index: false, follow: false },
};

export default function EquityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
