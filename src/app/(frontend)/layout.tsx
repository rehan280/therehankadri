import type { Metadata } from 'next';
import '@rohanyeole/ray-editor/css';
import '../globals.css';
import '../home.css';
import AppFrame from '@/components/AppFrame';
import DeferredClientFeatures from '@/components/DeferredClientFeatures';
import HomeNavbar from '@/components/HomeNavbar';
import LenisScrollController from '@/components/LenisScrollController';
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
  title: 'The Rehan Kadri | Product & Growth Marketing Specialist',
  description: 'Portfolio of The Rehan Kadri, a Product and Growth Marketing Specialist focused on SEO, content systems, and predictable revenue growth.',
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
    title: `${SITE_NAME} | Growth Marketing`,
    description: 'Scaling platforms, optimizing funnels, driving inbound leads.',
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    images: [
      {
        url: buildAbsoluteImageUrl(),
        alt: `${SITE_NAME} growth marketing portfolio`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | Growth Marketing`,
    description: 'Scaling platforms, optimizing funnels, driving inbound leads.',
    images: [buildAbsoluteImageUrl()],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sansFont.variable} antialiased`}
        suppressHydrationWarning
      >
        <AppFrame>
          <LenisScrollController />
          <RouteWarmup />
          <HomeNavbar />
          {children}
        </AppFrame>
        <DeferredClientFeatures />
      </body>
    </html>
  );
}
