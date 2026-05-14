import dynamic from 'next/dynamic';

const CreatorLandingClient = dynamic(
  () => import('./CreatorLandingClient'),
  { ssr: true }
);

export function generateStaticParams() {
  return [{ creator: 'placeholder' }];
}

export default function CreatorLandingPage() {
  return <CreatorLandingClient />;
}
