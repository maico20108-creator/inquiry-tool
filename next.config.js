/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  env: {
    DATABASE_URL: "postgresql://postgres.jnaqrsudfomugzogsanr:NH10DrYYMSR4qddc@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1",
    DIRECT_URL: "postgresql://postgres.jnaqrsudfomugzogsanr:NH10DrYYMSR4qddc@aws-1-ap-south-1.pooler.supabase.com:5432/postgres",
  },
}

module.exports = nextConfig
