import CreatorLandingClient from './CreatorLandingClient';

export function generateStaticParams() {
  return [{ creator: 'placeholder' }];
}

export default function CreatorLandingPage() {
  return <CreatorLandingClient />;
}
