import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rehan Firoz Kadri | Product & Growth Marketing Specialist',
  description: 'Portfolio of Rehan Kadri, a Product and Growth Marketing Specialist with 8+ years of experience in digital marketing, content creation, and scaling platforms to 1M+ traffic.',
  openGraph: {
    title: 'Rehan Firoz Kadri | Growth Marketing',
    description: 'Scaling platforms, optimizing funnels, driving inbound leads.',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="bg-glow"></div>
        <div className="bg-glow-right"></div>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
