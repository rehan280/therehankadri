import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} antialiased`} suppressHydrationWarning>
        <div className="bg-glow"></div>
        <div className="bg-glow-right"></div>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
