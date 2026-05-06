import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { TemplatesClient } from '@/components/templates/templates-client'

export default async function TemplatesPage() {
  const session = await getServerSession(authOptions)

  const [templates, categories] = await Promise.all([
    prisma.replyTemplate.findMany({
      where: { isActive: true },
      include: { category: true, createdBy: { select: { id: true, name: true } } },
      orderBy: [{ isFavorite: 'desc' }, { updatedAt: 'desc' }],
    }),
    prisma.templateCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])

  return (
    <TemplatesClient
      templates={templates}
      categories={categories}
      isAdmin={session?.user?.role === 'admin'}
    />
  )
}
