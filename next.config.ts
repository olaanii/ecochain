import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'standalone',
  devIndicators: false,
  turbopack: {},
  experimental: {
    workerThreads: true,
    cpus: 1,
  },
  /**
   * OWASP-oriented baseline headers. A strict `Content-Security-Policy` with
   * nonces requires coordinated Next.js + Clerk + wallet script allowlists;
   * track as a follow-up before tightening `script-src`.
   */
  async headers() {
    const isProduction = process.env.NODE_ENV === "production";

    // Clerk CDN, wallet RPC endpoints and Sentry ingest are the main
    // external script/connect origins. Tighten `script-src` once nonce
    // injection is wired through middleware.
    const cspDirectives = [
      "default-src 'self'",
      // Allow inline styles from Clerk/wallet widgets; tighten post-audit.
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // 'unsafe-eval' required by wagmi/viem in dev; prod build tree-shakes it
      // but we keep it for now and track removal as a follow-up.
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://*.clerk.accounts.dev https://js.stripe.com`,
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob:",
      // RPC, Clerk auth, Sentry, IPFS gateway
      "connect-src 'self' https: wss: data:",
      "frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; ");

    const securityHeaders: { key: string; value: string }[] = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value:
          "camera=(self), microphone=(), geolocation=(self), payment=(), usb=(), interest-cohort=()",
      },
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "Content-Security-Policy", value: cspDirectives },
    ];

    if (isProduction) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  transpilePackages: ['@initia/interwovenkit-react'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3845",
        pathname: "/assets/**",
      },
      {
        protocol: "https",
        hostname: "www.figma.com",
        pathname: "/api/mcp/asset/**",
      },
    ],
    domains: ["localhost"],
  },
  webpack(config, { webpack }) {
    config.resolve = config.resolve ?? {};

    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };

    config.resolve.fallback = {
      ...(config.resolve.fallback ?? {}),
      fs: false,
      net: false,
      tls: false,
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      util: require.resolve("util/"),
    };

    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      })
    );

    return config;
  },
};

export default nextConfig;


