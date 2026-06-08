/** @type {import('next').NextConfig} */
const config = {
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http',  hostname: 'localhost' },
    ],
    dangerouslyAllowSVG: true,
    formats: ['image/avif', 'image/webp'],
  },
  // Minimal logging
  logging: {
    fetches: { fullUrl: false },
  },
}

export default config
