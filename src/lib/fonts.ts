import localFont from 'next/font/local';

export const sansFont = localFont({
  src: [
    {
      path: '../fonts/Manrope-Variable.ttf',
      weight: '400 800',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-sans',
});

export const displayFont = localFont({
  src: [
    {
      path: '../fonts/Manrope-Variable.ttf',
      weight: '400 800',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-display',
});

export const heroFont = localFont({
  src: [
    {
      path: '../fonts/Outfit-Variable.ttf',
      weight: '400 900',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-hero',
});

export const copyFont = localFont({
  src: [
    {
      path: '../fonts/IBMPlexSans-Variable.ttf',
      weight: '400 700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-copy',
});

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

export const blogFont = localFont({
  src: [
    {
      path: '../fonts/PlusJakartaSans-Variable.ttf',
      weight: '400 800',
      style: 'normal',
    },
  ],
  display: 'swap',
});
