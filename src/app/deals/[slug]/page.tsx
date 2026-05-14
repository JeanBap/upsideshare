import dynamic from 'next/dynamic';

const DealDetailClient = dynamic(
  () => import('./DealDetailClient'),
  { ssr: true }
);

export function generateStaticParams() {
  return [{ slug: 'placeholder' }];
}

export default function DealDetailPage() {
  return <DealDetailClient />;
}
