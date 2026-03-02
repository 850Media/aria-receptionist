/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverRuntimeConfig: {
    NODE_TLS_REJECT_UNAUTHORIZED: '0',
  },
}

// Disable SSL verification for outbound API calls in production
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

module.exports = nextConfig
