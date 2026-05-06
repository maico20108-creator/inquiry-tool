import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { InquiriesClient } from '@/components/inquiries/inquiries-client'

export default async function InquiriesPage() {
  const session = await getServerSession(authOptions)

  const [inquiries, users, malls] = await Promise.all([
    prisma.inquiry.findMany({
      orderBy: { receivedAt: 'desc' },
      take: 50,
      include: {
        store: { include: { mall: true } },
        customer: { select: { id: true, name: true } },
        order: { select: { id: true, externalOrderId: true } },
        assignedTo: { select: { id: true, name: true } },
        _count: { select: { messages: true } },
      },
    }),
    prisma.user.findMany({ select: { id: true, name: true }, where: { isActive: true } }),
    prisma.mall.findMany(),
  ])

  return <InquiriesClient inquiries={inquiries} users={users} malls={malls} currentUser={session!.user} />
}
