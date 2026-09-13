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
  // Packages Node natifs — laisses en require() runtime, jamais bundles
  // (serverExternalPackages ne suffit pas toujours pour ioredis qui importe
  // node:diagnostics_channel au top level).
  serverExternalPackages: ["@node-rs/argon2", "ioredis"],
  webpack: (config, { isServer, nextRuntime }) => {
    if (isServer && nextRuntime === "nodejs") {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        { ioredis: "commonjs ioredis", "@node-rs/argon2": "commonjs @node-rs/argon2" }
      ];
    }
    return config;
  }
};

export default nextConfig;
