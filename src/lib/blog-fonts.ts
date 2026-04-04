import localFont from 'next/font/local';

export const therehankadriFont = localFont({
  src: [
    {
      path: '../fonts/fonts/therehankadri_regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/fonts/therehankadri_bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-therehankadri',
});

export const therehankadriDisplayFont = localFont({
  src: [
    {
      path: '../fonts/fonts/therehankadri_display.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-therehankadri-display',
});

export const therehankadriCondensedFont = localFont({
  src: [
    {
      path: '../fonts/fonts/therehankadri_condensedbold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-therehankadri-condensed',
});

export const blogPlexFont = localFont({
  src: [
    {
      path: '../fonts/fonts/ibm-plex-sans-v13-latin-ext_cyrillic-regular (1).woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/fonts/ibm-plex-sans-v13-latin-ext_cyrillic-italic.woff2',
      weight: '400',
      style: 'italic',
    },
  ],
  display: 'swap',
  variable: '--font-blog-plex',
});
