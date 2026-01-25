/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cross-origin 설정 (샌드박스 환경)
  experimental: {
    allowedDevOrigins: [
      'https://*.sandbox.novita.ai',
    ],
  },
  
  // 서버 외부 패키지 최적화
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // 이미지 최적화
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'i.vimeocdn.com',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },
  
  // Webpack 최적화
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
}

module.exports = nextConfig
