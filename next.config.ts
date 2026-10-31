import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

import { buildContentSecurityPolicy } from "./src/lib/security/csp";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    // Content-Security-Policy: `unsafe-eval` fica restrito ao desenvolvimento.
    // Em produção, connect-src libera apenas a própria origem e o S3_ENDPOINT.
    // `unsafe-inline` permanece até existir uma estratégia de nonce viável para
    // as páginas estáticas geradas pelo Next.js.
    key: "Content-Security-Policy",
    value: buildContentSecurityPolicy({
      isProduction: process.env.NODE_ENV === "production",
      s3Endpoint: process.env.S3_ENDPOINT,
    }),
  },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  images: {
    dangerouslyAllowSVG: false,
    remotePatterns: [],
    qualities: [75, 95],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
