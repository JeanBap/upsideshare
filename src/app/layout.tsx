import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const SITE_URL = 'https://upsideshare.com';
const SITE_NAME = 'UpsideShare';
const DEFAULT_DESCRIPTION =
  'Brand-creator revenue share platform with Stripe-verified tracking, template equity contracts, and a creator back office. Aligned by revenue.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'UpsideShare - Brand-Creator Revenue Share Platform',
    template: '%s | UpsideShare',
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'creator revenue share',
    'brand creator platform',
    'influencer equity',
    'Stripe verified tracking',
    'creator economy',
    'revenue share deals',
    'equity for creators',
    'brand partnership platform',
    'creator monetization',
    'affiliate marketing alternative',
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'UpsideShare - Brand-Creator Revenue Share Platform',
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'UpsideShare - Brands and creators aligned by revenue',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UpsideShare - Brand-Creator Revenue Share Platform',
    description: DEFAULT_DESCRIPTION,
    images: [`${SITE_URL}/og-image.png`],
  },
  other: {
    'msapplication-TileColor': '#534AB7',
  },
};

const ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
  description: DEFAULT_DESCRIPTION,
  foundingDate: '2026',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'hello@upsideshare.com',
    contactType: 'customer support',
  },
  sameAs: [],
};

const WEBSITE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/deals?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://tosyulolriavzgkpwzrn.supabase.co" />
        <link rel="dns-prefetch" href="https://tosyulolriavzgkpwzrn.supabase.co" />
        <meta name="theme-color" content="#534AB7" />
        <link rel="canonical" href={SITE_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([ORGANIZATION_JSONLD, WEBSITE_JSONLD]),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-gray-50">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
