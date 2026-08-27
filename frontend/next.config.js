/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },

  /**
   * API rewrites for separated deployment mode.
   *
   * When API_URL is set (e.g. https://your-api.railway.app), Next.js proxies
   * all /auth/* and /api/* requests to the standalone Express API server.
   * This keeps the browser on a single origin (same-domain cookies, no CORS).
   *
   * Combined mode (default, no API_URL):  server.ts handles everything
   * Separated mode (set API_URL):         api-server.ts runs independently
   */
  async rewrites() {
    const apiUrl = process.env.API_URL
    if (!apiUrl) return []   // combined mode — Express in server.ts handles these routes

    return [
      { source: '/auth/:path*',                destination: `${apiUrl}/auth/:path*` },
      { source: '/api/assistant',              destination: `${apiUrl}/api/assistant` },
      { source: '/api/draft',                  destination: `${apiUrl}/api/draft` },
      { source: '/api/applications/submit',    destination: `${apiUrl}/api/applications/submit` },
      { source: '/api/officer/claim',          destination: `${apiUrl}/api/officer/claim` },
      { source: '/api/officer/review',         destination: `${apiUrl}/api/officer/review` },
      { source: '/api/feedback',               destination: `${apiUrl}/api/feedback` },
      { source: '/api/feedback/:id/status',    destination: `${apiUrl}/api/feedback/:id/status` },
    ]
  },
}

module.exports = nextConfig
