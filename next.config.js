/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['bcryptjs'],
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  }
}

module.exports = nextConfig
