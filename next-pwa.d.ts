declare module '@ducanh2912/next-pwa' {
  import { NextConfig } from 'next';
  
  interface PWAConfig {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    cacheOnFrontEndNav?: boolean;
    aggressiveFrontEndNavCaching?: boolean;
    reloadOnOnline?: boolean;
    swcMinify?: boolean;
    workboxOptions?: {
      disableDevLogs?: boolean;
      runtimeCaching?: Array<{
        urlPattern: RegExp | string;
        handler: string;
        options?: {
          cacheName?: string;
          expiration?: {
            maxEntries?: number;
            maxAgeSeconds?: number;
          };
        };
      }>;
    };
  }

  export default function withPWA(pwaConfig: PWAConfig): (nextConfig: NextConfig) => NextConfig;
}

declare module 'next-pwa' {
  import { NextConfig } from 'next';
  
  interface PWAConfig {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    buildExcludes?: RegExp[];
    runtimeCaching?: Array<{
      urlPattern: RegExp | ((options: { url: URL; request: Request }) => boolean);
      handler: string;
      options?: {
        cacheName?: string;
        expiration?: {
          maxEntries?: number;
          maxAgeSeconds?: number;
        };
        rangeRequests?: boolean;
      };
    }>;
  }

  export default function withPWA(pwaConfig: PWAConfig): (nextConfig: NextConfig) => NextConfig;
}
