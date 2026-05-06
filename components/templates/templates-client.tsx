'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { MALL_LABELS } from '@/types'
import { Star, Plus, Pencil, Trash2, Search, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

type Props = {
  templates: any[]
  categories: any[]
  isAdmin: boolean
}

const ALL_MALLS = ['rakuten', 'yahoo', 'amazon', 'qoo10']
const MALL_NAMES: Record<string, string> = { rakuten: '楽天市場', yahoo: 'Yahoo!', amazon: 'Amazon', qoo10: 'Qoo10' }

const VARIABLES = ['{{customer_name}}', '{{order_id}}', '{{tracking_number}}', '{{shipping_company}}', '{{store_name}}', '{{return_fee}}']

export function TemplatesClient({ templates: initial, categories, isAdmin }: Props) {
  const [templates, setTemplates] = useState(initial)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [favoriteOnly, setFavoriteOnly] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [form, setForm] = useState({ title: '', categoryId: '', body: '', usageConditions: '', notes: '', applicableMalls: ALL_MALLS, isFavorite: false })
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const openCreate = () => {
    setEditingTemplate(null)
    setForm({ title: '', categoryId: '', body: '', usageConditions: '', notes: '', applicableMalls: ALL_MALLS, isFavorite: false })
    setIsDialogOpen(true)
  }

  const openEdit = (t: any) => {
    setEditingTemplate(t)
    setForm({
      title: t.title,
      categoryId: t.categoryId || '',
      body: t.body,
      usageConditions: t.usageConditions || '',
      notes: t.notes || '',
      applicableMalls: (t.applicableMalls as string[]) || ALL_MALLS,
      isFavorite: t.isFavorite,
    })
    setIsDialogOpen(true)
  }

  const saveTemplate = async () => {
    if (!form.title || !form.body) return
    setSaving(true)
    try {
      const url = editingTemplate ? `/api/templates/${editingTemplate.id}` : '/api/templates'
      const method = editingTemplate ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, templateBody: form.body }),
      })
      const saved = await res.json()
      if (editingTemplate) {
        setTemplates(templates.map(t => t.id === saved.id ? saved : t))
      } else {
        setTemplates([saved, ...templates])
      }
      setIsDialogOpen(false)
      toast({ title: editingTemplate ? 'テンプレートを更新しました' : 'テンプレートを作成しました' })
    } finally {
      setSaving(false)
    }
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm('このテンプレートを削除しますか？')) return
    await fetch(`/api/templates/${id}`, { method: 'DELETE' })
    setTemplates(templates.filter(t => t.id !== id))
    toast({ title: 'テンプレートを削除しました' })
  }

  const toggleFavorite = async (t: any) => {
    const res = await fetch(`/api/templates/${t.id}/favorite`, { method: 'PATCH' })
    const { isFavorite } = await res.json()
    setTemplates(templates.map(tmpl => tmpl.id === t.id ? { ...tmpl, isFavorite } : tmpl))
  }

  const toggleMall = (mall: string) => {
    setForm(f => ({
      ...f,
      applicableMalls: f.applicableMalls.includes(mall)
        ? f.applicableMalls.filter(m => m !== mall)
        : [...f.applicableMalls, mall],
    }))
  }

  const insertVar = (v: string) => setForm(f => ({ ...f, body: f.body + v }))

  const filtered = templates.filter(t => {
    if (catFilter !== 'all' && t.categoryId !== catFilter) return false
    if (favoriteOnly && !t.isFavorite) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">テンプレート管理</h1>
          {isAdmin && (
            <Button onClick={openCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              新規作成
            </Button>
          )}
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-40">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="タイトルで検索" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="カテゴリ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全カテゴリ</SelectItem>
              {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <button
            onClick={() => setFavoriteOnly(!favoriteOnly)}
            className={cn('flex items-center gap-1.5 px-3 h-9 rounded-md border text-sm transition-colors', favoriteOnly ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50')}
          >
            <Star className={cn('h-4 w-4', favoriteOnly ? 'fill-yellow-500 text-yellow-500' : '')} />
            お気に入り
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">テンプレートがありません</div>
          )}
          {filtered.map(t => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {t.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />}
                    <h3 className="font-semibold text-gray-900">{t.title}</h3>
                    {t.category && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{t.category.name}</span>
                    )}
                    {(t.applicableMalls as string[]).map((m: string) => (
                      <span key={m} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{MALL_NAMES[m]}</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{t.body}</p>
                  {t.usageConditions && (
                    <p className="text-xs text-gray-400 mt-1">使用条件: {t.usageConditions}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleFavorite(t)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-yellow-500">
                    <Star className={cn('h-4 w-4', t.isFavorite ? 'fill-yellow-500 text-yellow-500' : '')} />
                  </button>
                  {isAdmin && (
                    <>
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteTemplate(t.id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'テンプレートを編集' : 'テンプレートを作成'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>タイトル *</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="例: 商品未着のお詫び" />
              </div>
              <div className="space-y-1.5">
                <Label>カテゴリ</Label>
                <Select value={form.categoryId || 'none'} onValueChange={v => setForm(f => ({ ...f, categoryId: v === 'none' ? '' : v }))}>
                  <SelectTrigger><SelectValue placeholder="選択してください" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">なし</SelectItem>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>対象モール</Label>
              <div className="flex gap-3 flex-wrap">
                {ALL_MALLS.map(m => (
                  <label key={m} className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox checked={form.applicableMalls.includes(m)} onCheckedChange={() => toggleMall(m)} />
                    <span className="text-sm">{MALL_NAMES[m]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>本文 *</Label>
              <div className="flex gap-1 flex-wrap mb-1">
                {VARIABLES.map(v => (
                  <button key={v} onClick={() => insertVar(v)} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-mono hover:bg-blue-100">
                    {v}
                  </button>
                ))}
              </div>
              <Textarea
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                rows={10}
                className="font-mono text-sm"
                placeholder="返信本文を入力。{{customer_name}}などの変数が使えます。"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>使用条件</Label>
                <Input value={form.usageConditions} onChange={e => setForm(f => ({ ...f, usageConditions: e.target.value }))} placeholder="例: 発送前のキャンセルに使用" />
              </div>
              <div className="space-y-1.5">
                <Label>注意事項</Label>
                <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="例: 返品理由を確認すること" />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={form.isFavorite} onCheckedChange={v => setForm(f => ({ ...f, isFavorite: !!v }))} />
              <span className="text-sm">お気に入りに登録</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>キャンセル</Button>
            <Button onClick={saveTemplate} disabled={!form.title || !form.body || saving}>
              {saving ? '保存中...' : '保存する'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
