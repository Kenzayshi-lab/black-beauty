/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  logging: {
    fetches: { fullUrl: false }
  },
  images: {
    remotePatterns: []
  },
  // Packages Node natifs — laisses en require() runtime, jamais bundles.
  // Sous Next 16 (Turbopack par defaut), serverExternalPackages seul
  // suffit : Turbopack respecte cette liste pour eviter d'analyser
  // ioredis (qui importe node:diagnostics_channel au top level) et
  // @node-rs/argon2 (binaire natif). Plus besoin du bloc webpack{}
  // qu'on avait sous Next 15.
  serverExternalPackages: ["@node-rs/argon2", "ioredis"]
};

export default nextConfig;
