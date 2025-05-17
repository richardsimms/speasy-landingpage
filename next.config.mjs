/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Fix: renamed serverComponentsExternalPackages to serverExternalPackages
    serverExternalPackages: [],
    // Removing optimizeCss since critters is missing
    optimizeCss: false
  }
}

export default nextConfig
