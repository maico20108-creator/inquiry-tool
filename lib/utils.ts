import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return format(new Date(date), 'yyyy/MM/dd HH:mm', { locale: ja })
}

export function formatRelative(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ja })
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount)
}

export function expandTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return variables[key] !== undefined ? variables[key] : `{{${key}}}`
  })
}

export function extractTemplateVariables(template: string): string[] {
  const matches = template.match(/\{\{(\w+)\}\}/g) || []
  return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))]
}
