import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    inlineCss: true,
  },
  images: {
    qualities: [60, 75],
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/stats/youtube/users",
        destination: "/stats/youtube-users",
        permanent: true,
      },
      {
        source: "/stats/youtube/channel",
        destination: "/stats/youtube-channels",
        permanent: true,
      },
      {
        source: "/stats/youtube/subscribers-needed-to-make-money",
        destination: "/stats/youtube-subscribers-needed-to-make-money",
        permanent: true,
      },
      {
        source: "/stats/youtube-susbcribers-needed-to-make-money",
        destination: "/stats/youtube-subscribers-needed-to-make-money",
        permanent: true,
      },
      {
        source: "/stats/b2b/seo",
        destination: "/stats/b2b-seo",
        permanent: true,
      },
      {
        source: "/blog/youtube-users",
        destination: "/stats/youtube-users",
        permanent: true,
      },
      {
        source: "/blog/youtube-channel-statistics",
        destination: "/stats/youtube-channels",
        permanent: true,
      },
      {
        source: "/blog/youtube-channel-statistics-2026",
        destination: "/stats/youtube-channels",
        permanent: true,
      },
      {
        source: "/blog/b2b-seo-statistics",
        destination: "/stats/b2b-seo",
        permanent: true,
      },
      {
        source: "/blog/how-to-record-audio",
        destination: "/blog/how-to-edit-audio",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https:",
              "style-src 'self' 'unsafe-inline'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "connect-src 'self' https:",
              "object-src 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
