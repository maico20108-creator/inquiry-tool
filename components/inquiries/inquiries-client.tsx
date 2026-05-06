'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { INQUIRY_STATUS_LABELS, INQUIRY_STATUS_COLORS, INQUIRY_TYPE_LABELS, MALL_LABELS } from '@/types'
import { InquiryStatus, InquiryType, MallCode } from '@prisma/client'
import { Search, Filter, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Props = {
  inquiries: any[]
  users: { id: string; name: string }[]
  malls: any[]
  currentUser: any
}

const MALL_BADGE_COLORS: Record<string, string> = {
  rakuten: 'bg-red-100 text-red-800',
  yahoo: 'bg-red-100 text-red-900',
  amazon: 'bg-orange-100 text-orange-800',
  qoo10: 'bg-purple-100 text-purple-800',
}

export function InquiriesClient({ inquiries, users, malls, currentUser }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [mallFilter, setMallFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    return inquiries.filter(inq => {
      if (statusFilter !== 'all' && inq.status !== statusFilter) return false
      if (mallFilter !== 'all' && inq.store.mall.code !== mallFilter) return false
      if (typeFilter !== 'all' && inq.inquiryType !== typeFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          inq.subject?.toLowerCase().includes(q) ||
          inq.customer?.name?.toLowerCase().includes(q) ||
          inq.order?.externalOrderId?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [inquiries, search, statusFilter, mallFilter, typeFilter])

  const unreadCount = inquiries.filter(i => i.status === 'unread').length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">問い合わせ一覧</h1>
            <p className="text-sm text-gray-500 mt-0.5">全{inquiries.length}件 · 未返信 <span className="text-red-600 font-medium">{unreadCount}件</span></p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="件名・お客様名・注文番号で検索"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全ステータス</SelectItem>
              {Object.entries(INQUIRY_STATUS_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={mallFilter} onValueChange={setMallFilter}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="モール" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全モール</SelectItem>
              {malls.map(m => (
                <SelectItem key={m.code} value={m.code}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="問い合わせ種別" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全種別</SelectItem>
              {Object.entries(INQUIRY_TYPE_LABELS).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
            <tr>
              {['モール/店舗', '受信日時', 'お客様', '注文番号', '種別', 'ステータス', '担当者', '最終更新'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-12 text-gray-400">該当する問い合わせがありません</td></tr>
            ) : filtered.map(inq => (
              <tr
                key={inq.id}
                className={cn(
                  'hover:bg-blue-50/50 cursor-pointer transition-colors',
                  inq.status === 'unread' && 'bg-blue-50/30'
                )}
              >
                <td className="px-4 py-3">
                  <span className={cn('text-xs font-medium px-2 py-1 rounded-full', MALL_BADGE_COLORS[inq.store.mall.code] || 'bg-gray-100 text-gray-700')}>
                    {inq.store.mall.name}
                  </span>
                  <p className="text-xs text-gray-500 mt-1 max-w-24 truncate">{inq.store.name}</p>
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(inq.receivedAt)}</td>
                <td className="px-4 py-3">
                  <p className={cn('font-medium truncate max-w-32', inq.status === 'unread' && 'text-blue-900')}>
                    {inq.customer?.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate max-w-32">{inq.subject}</p>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{inq.order?.externalOrderId || '—'}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full whitespace-nowrap">
                    {INQUIRY_TYPE_LABELS[inq.inquiryType as InquiryType]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap', INQUIRY_STATUS_COLORS[inq.status as InquiryStatus])}>
                    {INQUIRY_STATUS_LABELS[inq.status as InquiryStatus]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{inq.assignedTo?.name || '—'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(inq.updatedAt)}</td>
                <td className="px-4 py-3">
                  <Link href={`/inquiries/${inq.id}`} className="text-gray-400 hover:text-blue-600">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
