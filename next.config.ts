import type { NextConfig } from 'next';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiBaseUrl && process.env.NODE_ENV === 'production') {
  throw new Error('NEXT_PUBLIC_API_URL is required for production builds.');
}

const localApiBaseUrl = apiBaseUrl ?? 'http://localhost:8000/api';
const mediaBaseUrls = [
  process.env.NEXT_PUBLIC_MEDIA_URL,
  new URL('/media', localApiBaseUrl).toString(),
].filter((value): value is string => Boolean(value));

const remoteImagePattern = (value: string) => {
  const url = new URL(value);

  if (
    process.env.NODE_ENV === 'production' &&
    ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
  ) {
    throw new Error('Production media URLs must use a publicly reachable host.');
  }

  const pathname =
    url.pathname && url.pathname !== '/'
      ? `${url.pathname.replace(/\/$/, '')}/**`
      : '/**';

  return {
    protocol: url.protocol.replace(':', '') as 'http' | 'https',
    hostname: url.hostname,
    port: url.port,
    pathname,
  };
};

const nextConfig: NextConfig = {
  images: {
    remotePatterns: Array.from(new Set(mediaBaseUrls)).map(remoteImagePattern),
  },
};

export default nextConfig;
