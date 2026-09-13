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
  // @node-rs/argon2 est un package natif — ne pas le bundler cote client,
  // le laisser passer par le runtime Node de la route handler.
  serverExternalPackages: ["@node-rs/argon2", "ioredis"]
};

export default nextConfig;
