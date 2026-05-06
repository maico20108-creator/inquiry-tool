'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDate, formatCurrency, expandTemplateVariables } from '@/lib/utils'
import { INQUIRY_STATUS_LABELS, INQUIRY_STATUS_COLORS, INQUIRY_TYPE_LABELS, MALL_LABELS } from '@/types'
import { InquiryStatus, InquiryType } from '@prisma/client'
import {
  ChevronLeft, Package, Truck, User, MapPin, MessageSquare, StickyNote,
  Star, Copy, Check, Loader2, Sparkles, Send, AlertTriangle, ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

type Props = {
  inquiry: any
  users: { id: string; name: string }[]
  templates: any[]
  currentUser: any
}

export function InquiryDetailClient({ inquiry: initialInquiry, users, templates, currentUser }: Props) {
  const [inquiry, setInquiry] = useState(initialInquiry)
  const [tab, setTab] = useState<'messages' | 'reply' | 'notes'>('messages')
  const [replyBody, setReplyBody] = useState('')
  const [noteBody, setNoteBody] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<any>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const order = inquiry.order
  const shipment = order?.shipments?.[0]

  const templateVars: Record<string, string> = {
    customer_name: inquiry.customer.name,
    order_id: order?.externalOrderId || '',
    tracking_number: shipment?.trackingNumber || '',
    shipping_company: shipment?.shippingCompany || '',
    store_name: inquiry.store.name,
    return_fee: '往復送料実費',
  }

  const previewBody = expandTemplateVariables(replyBody, templateVars)

  const updateStatus = async (status: string) => {
    await fetch(`/api/inquiries/${inquiry.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setInquiry({ ...inquiry, status })
    toast({ title: 'ステータスを更新しました' })
  }

  const updateAssignee = async (userId: string) => {
    await fetch(`/api/inquiries/${inquiry.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedToId: userId === 'none' ? null : userId }),
    })
    const user = users.find(u => u.id === userId)
    setInquiry({ ...inquiry, assignedTo: user || null })
    toast({ title: '担当者を更新しました' })
  }

  const sendReply = async () => {
    if (!replyBody.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/inquiries/${inquiry.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: previewBody }),
      })
      const msg = await res.json()
      setInquiry({
        ...inquiry,
        messages: [...inquiry.messages, msg],
        status: 'replied',
      })
      setReplyBody('')
      setShowPreview(false)
      setTab('messages')
      toast({ title: '返信を記録しました' })
    } finally {
      setSaving(false)
    }
  }

  const saveNote = async () => {
    if (!noteBody.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/inquiries/${inquiry.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: noteBody }),
      })
      const note = await res.json()
      setInquiry({ ...inquiry, internalNotes: [...inquiry.internalNotes, note] })
      setNoteBody('')
      toast({ title: 'メモを保存しました' })
    } finally {
      setSaving(false)
    }
  }

  const copyReply = async () => {
    await navigator.clipboard.writeText(previewBody)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: '返信文をコピーしました' })
  }

  const fetchAiSuggestion = async () => {
    setAiLoading(true)
    try {
      const res = await fetch(`/api/inquiries/${inquiry.id}/ai-suggest`, { method: 'POST' })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAiSuggestion(data)
      if (data.draftReply) setReplyBody(data.draftReply)
    } catch (e: any) {
      toast({ title: 'AI提案に失敗しました', description: e.message, variant: 'destructive' })
    } finally {
      setAiLoading(false)
    }
  }

  const applyTemplate = (template: any) => {
    setReplyBody(template.body)
    setShowTemplates(false)
    setTab('reply')
  }

  return (
    <div className="flex h-full">
      {/* Left: Messages & Reply */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/inquiries" className="text-gray-400 hover:text-gray-600">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">{inquiry.subject}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', INQUIRY_STATUS_COLORS[inquiry.status as InquiryStatus])}>
                  {INQUIRY_STATUS_LABELS[inquiry.status as InquiryStatus]}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {INQUIRY_TYPE_LABELS[inquiry.inquiryType as InquiryType]}
                </span>
                <span className="text-xs text-gray-400">{inquiry.store.mall.name} / {inquiry.store.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white shrink-0">
          {[
            { id: 'messages', label: 'やり取り', count: inquiry.messages.length },
            { id: 'reply', label: '返信作成' },
            { id: 'notes', label: '社内メモ', count: inquiry.internalNotes.length },
          ].map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setTab(id as any)}
              className={cn(
                'px-5 py-3 text-sm font-medium border-b-2 transition-colors',
                tab === id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {label}
              {count !== undefined && count > 0 && (
                <span className="ml-1.5 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Messages */}
          {tab === 'messages' && (
            <div className="space-y-4">
              {inquiry.messages.map((msg: any) => (
                <div key={msg.id} className={cn('flex', msg.senderType === 'staff' ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    'max-w-2xl rounded-xl px-4 py-3',
                    msg.senderType === 'customer' ? 'bg-white border border-gray-200' : 'bg-blue-600 text-white'
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('text-xs font-medium', msg.senderType === 'staff' ? 'text-blue-200' : 'text-gray-500')}>
                        {msg.senderName}
                      </span>
                      <span className={cn('text-xs', msg.senderType === 'staff' ? 'text-blue-300' : 'text-gray-400')}>
                        {formatDate(msg.sentAt)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply */}
          {tab === 'reply' && (
            <div className="space-y-4 max-w-3xl">
              {/* AI Suggestion */}
              {aiSuggestion && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-900">AI提案</span>
                    {aiSuggestion.templateTitle && (
                      <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
                        推奨: {aiSuggestion.templateTitle}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-purple-800 mb-2">{aiSuggestion.reason}</p>
                  {aiSuggestion.notes && (
                    <div className="flex items-start gap-2 text-sm text-purple-700 mb-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{aiSuggestion.notes}</span>
                    </div>
                  )}
                  {aiSuggestion.recommendedChecks?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-purple-700 mb-1">確認事項:</p>
                      <ul className="text-xs text-purple-700 space-y-0.5">
                        {aiSuggestion.recommendedChecks.map((c: string, i: number) => (
                          <li key={i}>· {c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={fetchAiSuggestion} disabled={aiLoading}>
                  {aiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  AI提案を取得
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowTemplates(!showTemplates)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  テンプレート選択
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </div>

              {/* Template picker */}
              {showTemplates && (
                <div className="border border-gray-200 rounded-xl bg-white divide-y divide-gray-100 max-h-60 overflow-auto">
                  {templates.map(t => (
                    <button
                      key={t.id}
                      onClick={() => applyTemplate(t)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {t.isFavorite && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 shrink-0" />}
                        <span className="text-sm font-medium text-gray-900">{t.title}</span>
                        {t.category && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{t.category.name}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Editor */}
              <div>
                <Textarea
                  value={replyBody}
                  onChange={e => setReplyBody(e.target.value)}
                  rows={12}
                  placeholder="返信内容を入力してください。テンプレートを選択するか、AI提案を利用できます。"
                  className="font-mono text-sm"
                />
                <div className="mt-2 flex flex-wrap gap-1">
                  {['{{customer_name}}', '{{order_id}}', '{{tracking_number}}', '{{shipping_company}}', '{{store_name}}', '{{return_fee}}'].map(v => (
                    <button
                      key={v}
                      onClick={() => setReplyBody(prev => prev + v)}
                      className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 font-mono"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ChevronDown className={cn('h-4 w-4 transition-transform', showPreview && 'rotate-180')} />
                  {showPreview ? 'プレビューを閉じる' : '変数展開後のプレビューを表示'}
                </button>
                {showPreview && (
                  <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <p className="text-xs font-medium text-gray-500 mb-2">プレビュー（変数展開済み）</p>
                    <p className="text-sm whitespace-pre-wrap text-gray-800">{previewBody}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={copyReply} disabled={!replyBody.trim()} variant="outline">
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? 'コピー済み' : '返信文をコピー'}
                </Button>
                <Button onClick={sendReply} disabled={!replyBody.trim() || saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  返信を記録する
                </Button>
              </div>
            </div>
          )}

          {/* Notes */}
          {tab === 'notes' && (
            <div className="space-y-4 max-w-3xl">
              {inquiry.internalNotes.map((note: any) => (
                <div key={note.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <StickyNote className="h-4 w-4 text-yellow-600" />
                    <span className="text-xs font-medium text-yellow-800">{note.createdBy.name}</span>
                    <span className="text-xs text-yellow-600">{formatDate(note.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.body}</p>
                </div>
              ))}
              <div className="space-y-2">
                <Textarea
                  value={noteBody}
                  onChange={e => setNoteBody(e.target.value)}
                  rows={4}
                  placeholder="社内メモを入力（お客様には表示されません）"
                />
                <Button onClick={saveNote} disabled={!noteBody.trim() || saving} size="sm">
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <StickyNote className="h-4 w-4 mr-2" />}
                  メモを保存
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar: inquiry info */}
      <div className="w-72 bg-white border-l border-gray-200 overflow-auto shrink-0">
        <div className="p-4 space-y-5">
          {/* Status & Assignee */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">対応状況</h3>
            <div>
              <p className="text-xs text-gray-500 mb-1">ステータス</p>
              <Select value={inquiry.status} onValueChange={updateStatus}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(INQUIRY_STATUS_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">担当者</p>
              <Select value={inquiry.assignedTo?.id || 'none'} onValueChange={updateAssignee}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="未割り当て" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">未割り当て</SelectItem>
                  {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Customer */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <User className="h-3 w-3" /> お客様情報
            </h3>
            <div className="text-sm space-y-1">
              <p className="font-medium text-gray-900">{inquiry.customer.name}</p>
              {inquiry.customer.email && <p className="text-gray-500 text-xs">{inquiry.customer.email}</p>}
              {inquiry.customer.phone && <p className="text-gray-500 text-xs">{inquiry.customer.phone}</p>}
            </div>
          </div>

          {/* Order */}
          {order && (
            <>
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Package className="h-3 w-3" /> 注文情報
                </h3>
                <div className="text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">注文番号</span>
                    <span className="font-mono font-medium text-gray-900">{order.externalOrderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">注文金額</span>
                    <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">ステータス</span>
                    <span className="text-gray-700">{order.status}</span>
                  </div>
                </div>
                {order.items.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="text-xs bg-gray-50 px-2 py-1.5 rounded">
                        <span className="text-gray-800">{item.productName}</span>
                        <span className="text-gray-400 ml-1">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Shipping */}
              {order.shippingAddress && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> 配送先
                  </h3>
                  <div className="text-xs text-gray-700 space-y-0.5">
                    <p>〒{order.shippingAddress.zip}</p>
                    <p>{order.shippingAddress.prefecture}{order.shippingAddress.city}</p>
                    <p>{order.shippingAddress.address1}</p>
                    <p className="font-medium mt-1">{order.shippingAddress.name}</p>
                  </div>
                </div>
              )}

              {/* Shipment */}
              {shipment && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Truck className="h-3 w-3" /> 配送情報
                  </h3>
                  <div className="text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">配送会社</span>
                      <span className="font-medium">{shipment.shippingCompany}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">追跡番号</span>
                      <span className="font-mono">{shipment.trackingNumber || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">配送状況</span>
                      <span className="text-gray-700">{shipment.status}</span>
                    </div>
                    {shipment.shippedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">発送日</span>
                        <span>{formatDate(shipment.shippedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Meta */}
          <div className="space-y-1 text-xs text-gray-400 border-t border-gray-100 pt-4">
            <p>受信: {formatDate(inquiry.receivedAt)}</p>
            <p>更新: {formatDate(inquiry.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
