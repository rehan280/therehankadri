import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '../globals.css';
import '../home.css';
import AppFrame from '@/components/AppFrame';
import { copyFont, displayFont, heroFont, monoFont, sansFont } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'The Rehan Kadri | Product & Growth Marketing Specialist',
  description: 'Portfolio of The Rehan Kadri, a Product and Growth Marketing Specialist focused on SEO, content systems, and predictable revenue growth.',
  manifest: '/favicon/site.webmanifest',
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
    title: 'The Rehan Kadri | Growth Marketing',
    description: 'Scaling platforms, optimizing funnels, driving inbound leads.',
    type: 'website',
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
        className={`${sansFont.variable} ${displayFont.variable} ${heroFont.variable} ${copyFont.variable} ${monoFont.variable} antialiased`}
        suppressHydrationWarning
      >
        <AppFrame>{children}</AppFrame>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
