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
