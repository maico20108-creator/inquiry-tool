/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  env: {
    DATABASE_URL: "postgresql://postgres.jnaqrsudfomugzogsanr:NHl0DrYYMSR4qddc@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1",
  },
}

module.exports = nextConfig
