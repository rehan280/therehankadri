import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '../globals.css';
import '../home.css';
import AppFrame from '@/components/AppFrame';
import HomeNavbar from '@/components/HomeNavbar';
import CmsMagicLinkRedirectGuard from '@/components/cms/CmsMagicLinkRedirectGuard';
import { copyFont, heroFont, sansFont } from '@/lib/fonts';
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
  manifest: '/favicon/site.webmanifest',
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
  },
  robots: createIndexRobots(),
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: 'any' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    shortcut: ['/favicon/favicon.ico'],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/favicon/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/favicon/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' },
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
        className={`${sansFont.variable} ${heroFont.variable} ${copyFont.variable} antialiased`}
        suppressHydrationWarning
      >
        <CmsMagicLinkRedirectGuard />
        <AppFrame>
          <HomeNavbar />
          {children}
        </AppFrame>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

