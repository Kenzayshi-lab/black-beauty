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
  // ioredis importe node:diagnostics_channel au top level — on le laisse en
  // require() runtime plutot que bundle (serverExternalPackages ne suffit pas
  // toujours seul).
  serverExternalPackages: ["ioredis"],
  webpack: (config, { isServer, nextRuntime }) => {
    if (isServer && nextRuntime === "nodejs") {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        { ioredis: "commonjs ioredis" }
      ];
    }
    return config;
  }
};

export default nextConfig;
