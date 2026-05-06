import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { INQUIRY_STATUS_LABELS, INQUIRY_TYPE_LABELS } from '@/types'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { AlertCircle, Clock, CheckCircle2, MessageSquare } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  const [unread, pending, needsCheck, replied, recent] = await Promise.all([
    prisma.inquiry.count({ where: { status: 'unread' } }),
    prisma.inquiry.count({ where: { status: 'pending' } }),
    prisma.inquiry.count({ where: { status: 'needs_check' } }),
    prisma.inquiry.count({ where: { status: 'replied' } }),
    prisma.inquiry.findMany({
      take: 5,
      orderBy: { receivedAt: 'desc' },
      include: {
        customer: { select: { name: true } },
        store: { include: { mall: true } },
      },
    }),
  ])

  const total = unread + pending + needsCheck + replied

  const stats = [
    { label: '未返信', value: unread, color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle, iconColor: 'text-red-500' },
    { label: '保留', value: pending, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock, iconColor: 'text-yellow-500' },
    { label: '要確認', value: needsCheck, color: 'text-purple-600', bg: 'bg-purple-50', icon: AlertCircle, iconColor: 'text-purple-500' },
    { label: '返信済み', value: replied, color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2, iconColor: 'text-green-500' },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-500 text-sm mt-1">ようこそ、{session?.user?.name} さん</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, color, bg, icon: Icon, iconColor }) => (
          <div key={label} className={`${bg} rounded-xl p-4`}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{label}</p>
              <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
            <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent inquiries */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">最新の問い合わせ</h2>
          <Link href="/inquiries" className="text-sm text-blue-600 hover:underline">すべて見る</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recent.map(inq => (
            <Link
              key={inq.id}
              href={`/inquiries/${inq.id}`}
              className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                inq.status === 'unread' ? 'bg-red-500' :
                inq.status === 'pending' ? 'bg-yellow-500' :
                inq.status === 'needs_check' ? 'bg-purple-500' : 'bg-green-500'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                    {inq.store.mall.name}
                  </span>
                  <span className="text-sm font-medium text-gray-900 truncate">{inq.subject}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{inq.customer.name} · {INQUIRY_TYPE_LABELS[inq.inquiryType]}</p>
              </div>
              <p className="text-xs text-gray-400 shrink-0">{formatDate(inq.receivedAt)}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
