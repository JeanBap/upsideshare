import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Back Office',
  robots: { index: false, follow: false },
};

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
