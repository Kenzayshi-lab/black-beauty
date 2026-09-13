/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Log les requetes API en dev pour debug
  logging: {
    fetches: { fullUrl: false }
  },
  // Empeche toute image externe (pas d'images distantes dans l'admin)
  images: {
    remotePatterns: []
  }
};

export default nextConfig;
