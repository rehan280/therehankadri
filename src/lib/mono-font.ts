import localFont from 'next/font/local';

export const monoFont = localFont({
  src: [
    {
      path: '../fonts/IBMPlexMono-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/IBMPlexMono-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/IBMPlexMono-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-mono',
});
