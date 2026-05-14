import DealDetailClient from './DealDetailClient';

export function generateStaticParams() {
  return [{ slug: 'placeholder' }];
}

export default function DealDetailPage() {
  return <DealDetailClient />;
}
