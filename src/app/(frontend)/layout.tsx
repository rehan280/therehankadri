import type { Metadata } from 'next';
import '@rohanyeole/ray-editor/css';
import '../globals.css';
import '../home.css';
import AppFrame from '@/components/AppFrame';
import DeferredClientFeatures from '@/components/DeferredClientFeatures';
import HomeNavbar from '@/components/HomeNavbar';
import RouteWarmup from '@/components/RouteWarmup';
import { sansFont } from '@/lib/fonts';
import {
  GOOGLE_SITE_VERIFICATION,
  SITE_NAME,
  SITE_URL,
  buildAbsoluteImageUrl,
  createIndexRobots,
} from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Rehan Kadri | SEO & YouTube Growth Strategist',
  description: 'SEO, YouTube growth, and content systems designed to turn visibility into qualified pipeline for B2B brands. 1M+ organic visitors built.',
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  manifest: '/site.webmanifest',
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
  },
  robots: createIndexRobots(),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  openGraph: {
    title: `${SITE_NAME} | SEO & YouTube Growth Strategist`,
    description: 'SEO, YouTube growth, and content systems designed to turn search visibility into qualified pipeline. 1M+ organic visitors. 33K+ subscribers built.',
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    images: [
      {
        url: buildAbsoluteImageUrl(),
        alt: `${SITE_NAME} — SEO & YouTube Growth Strategist`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | SEO & YouTube Growth Strategist`,
    description: 'SEO, YouTube growth, and content systems designed to turn search visibility into qualified pipeline. 1M+ organic visitors. 33K+ subscribers built.',
    images: [buildAbsoluteImageUrl()],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-US" suppressHydrationWarning>
      <body
        className={`${sansFont.variable} antialiased`}
        suppressHydrationWarning
      >
        <AppFrame>
          <RouteWarmup />
          <HomeNavbar />
          {children}
        </AppFrame>
        <DeferredClientFeatures />
      </body>
    </html>
  );
}
