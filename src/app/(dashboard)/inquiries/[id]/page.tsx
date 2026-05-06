import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { InquiryDetailClient } from '@/components/inquiries/inquiry-detail-client'

export default async function InquiryDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  const [inquiry, users, templates] = await Promise.all([
    prisma.inquiry.findUnique({
      where: { id: params.id },
      include: {
        store: { include: { mall: true } },
        customer: true,
        order: { include: { items: true, shipments: true } },
        messages: { orderBy: { sentAt: 'asc' } },
        internalNotes: {
          include: { createdBy: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
        assignedTo: { select: { id: true, name: true } },
      },
    }),
    prisma.user.findMany({ select: { id: true, name: true }, where: { isActive: true } }),
    prisma.replyTemplate.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: [{ isFavorite: 'desc' }, { updatedAt: 'desc' }],
    }),
  ])

  if (!inquiry) notFound()

  return (
    <InquiryDetailClient
      inquiry={inquiry}
      users={users}
      templates={templates}
      currentUser={session!.user}
    />
  )
}
