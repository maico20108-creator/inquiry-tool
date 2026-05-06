import { Mall, Store, Customer, Order, OrderItem, Shipment, Inquiry, InquiryMessage, ReplyTemplate, TemplateCategory, InternalNote, User, MallCode, InquiryType, InquiryStatus, UserRole } from '@prisma/client'

export type { MallCode, InquiryType, InquiryStatus, UserRole }

export type InquiryWithRelations = Inquiry & {
  store: Store & { mall: Mall }
  customer: Customer
  order: (Order & {
    items: OrderItem[]
    shipments: Shipment[]
  }) | null
  messages: InquiryMessage[]
  internalNotes: (InternalNote & { createdBy: Pick<User, 'id' | 'name'> })[]
  assignedTo: Pick<User, 'id' | 'name'> | null
}

export type InquiryListItem = Inquiry & {
  store: Store & { mall: Mall }
  customer: Pick<Customer, 'id' | 'name'>
  order: Pick<Order, 'id' | 'externalOrderId'> | null
  assignedTo: Pick<User, 'id' | 'name'> | null
  _count: { messages: number }
}

export type TemplateWithCategory = ReplyTemplate & {
  category: TemplateCategory | null
  createdBy: Pick<User, 'id' | 'name'>
}

export const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  address_change: '住所変更',
  cancel: 'キャンセル希望',
  return: '返品希望',
  defect: '初期不良',
  not_arrived: '商品未着',
  delay: '配送遅延',
  receipt: '領収書発行',
  order_confirm: '注文内容確認',
  authenticity: '正規品確認',
  warranty: '保証対応',
  missing_parts: '付属品不足',
  payment: '支払い関連',
  double_charge: '二重請求',
  cod: '代引き希望',
  delivery_time: '配送日時指定',
  customer_return: 'お客様都合の返送',
  absence_return: '不在返送',
  unknown_address: '宛所不明返送',
  other: 'その他',
}

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  unread: '未返信',
  replied: '返信済み',
  pending: '保留',
  needs_check: '要確認',
}

export const INQUIRY_STATUS_COLORS: Record<InquiryStatus, string> = {
  unread: 'bg-red-100 text-red-800',
  replied: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  needs_check: 'bg-purple-100 text-purple-800',
}

export const MALL_COLORS: Record<MallCode, string> = {
  rakuten: 'bg-red-500',
  yahoo: 'bg-red-600',
  amazon: 'bg-orange-500',
  qoo10: 'bg-purple-500',
}

export const MALL_LABELS: Record<MallCode, string> = {
  rakuten: '楽天市場',
  yahoo: 'Yahoo!',
  amazon: 'Amazon',
  qoo10: 'Qoo10',
}

export type AISuggestion = {
  inquiryType: InquiryType
  inquiryTypeReason: string
  templateId?: string
  templateTitle?: string
  reason: string
  notes: string
  recommendedChecks: string[]
  draftReply?: string
}

export type TemplateVariable = {
  key: string
  label: string
  description: string
}

export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  { key: 'customer_name', label: 'お客様名', description: '{{customer_name}}' },
  { key: 'order_id', label: '注文番号', description: '{{order_id}}' },
  { key: 'tracking_number', label: '追跡番号', description: '{{tracking_number}}' },
  { key: 'shipping_company', label: '配送会社', description: '{{shipping_company}}' },
  { key: 'store_name', label: '店舗名', description: '{{store_name}}' },
  { key: 'return_fee', label: '返送料', description: '{{return_fee}}' },
]
